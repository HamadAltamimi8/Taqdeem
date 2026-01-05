
import React, { useState, useEffect } from 'react';
import { UserProfile, InterviewQuestion, InterviewFeedback } from '../types';
import { generateInterviewQuestions, analyzeInterview } from '../services/gemini';
import { dbService } from '../services/db';

interface InterviewProps {
  profile: UserProfile;
  onBack: () => void;
}

const Interview: React.FC<InterviewProps> = ({ profile, onBack }) => {
  const [jobTitle, setJobTitle] = useState(profile.jobInterests.titles[0] || 'مطور برمجيات');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const qs = await generateInterviewQuestions(jobTitle, difficulty);
      setQuestions(qs);
      setIsStarted(true);
    } catch (e) {
      alert("حدث خطأ في توليد الأسئلة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeInterview(answers, jobTitle);
      setFeedback(result);
      
      // حفظ المقابلة في سجل النشاطات الحقيقي في Supabase
      const updatedProfile = {
        ...profile,
        activity: {
          ...profile.activity,
          interviews: [
            ...(profile.activity?.interviews || []),
            { jobTitle: jobTitle, fluency: result.fluency, date: new Date().toISOString() }
          ]
        }
      };
      
      const savedUser = JSON.parse(localStorage.getItem('taqdeem_session') || '{}');
      await dbService.updateProfile(savedUser.id, updatedProfile);
      
      // تحديث الحالة المحلية للمتصفح
      localStorage.setItem('taqdeem_session', JSON.stringify({ ...savedUser, profile: updatedProfile }));

    } catch (e) {
      alert("حدث خطأ في تحليل المقابلة.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        const mockAnswer = `إجابة نموذجية لسؤال عن ${questions[currentIndex].type}`;
        setAnswers(prev => [...prev, mockAnswer]);
        setIsRecording(false);
        handleNext();
      }, 3000);
    }
  };

  if (feedback) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-black text-slate-800 mb-4">تقرير أداء المقابلة</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm text-center">
            <div className="text-3xl font-black text-blue-600 mb-1">{feedback.fluency}%</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">الطلاقة</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm text-center">
            <div className="text-xl font-black text-indigo-600 mb-1">{feedback.confidence}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">الثقة</div>
          </div>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold mb-2">التقييم الفني</h3>
          <p className="text-blue-50">{feedback.technicalRating}</p>
        </div>
        <button onClick={onBack} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold">العودة للرئيسية</button>
      </div>
    );
  }

  if (isStarted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
        <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-black uppercase">سؤال {currentIndex + 1} من {questions.length}</span>
        <h3 className="text-2xl font-bold text-slate-800 leading-tight">{questions[currentIndex]?.question}</h3>
        <button onClick={toggleRecording} disabled={isRecording} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center space-x-4 space-x-reverse mb-4">
        <button onClick={onBack} className="p-2 bg-white rounded-lg border border-slate-200"><svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
        <h2 className="text-2xl font-bold text-slate-800">تجهيز المقابلة</h2>
      </div>
      <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4">مساعدك الشخصي للتوظيف</h3>
        <p className="text-indigo-50 text-sm">سيقوم النظام بتمثيل دور مدير التوظيف وطرح أسئلة ذكية بناءً على تخصصك.</p>
      </div>
      <div className="space-y-6">
        <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none" placeholder="المسمى الوظيفي" />
        <button onClick={startInterview} disabled={isLoading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg">
          {isLoading ? 'جاري التجهيز...' : 'بدء المقابلة الآن'}
        </button>
      </div>
    </div>
  );
};

export default Interview;
