
import React, { useState, useEffect } from 'react';
import { UserProfile, InterviewQuestion, InterviewFeedback } from '../types';
import { generateInterviewQuestions, analyzeInterview } from '../services/gemini';
import { dbService } from '../services/db';

interface InterviewProps {
  profile: UserProfile;
  onBack: () => void;
  updateProfile: (p: UserProfile) => void;
}

const Interview: React.FC<InterviewProps> = ({ profile, onBack, updateProfile }) => {
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
      
      updateProfile(updatedProfile);
    } catch (e) {
      alert("حدث خطأ في تحليل المقابلة.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // محاكاة تسجيل الصوت وتحويله لنص
      setTimeout(() => {
        const mockAnswer = `إجابة نموذجية لسؤال عن ${questions[currentIndex].type} في تخصص ${jobTitle}`;
        setAnswers(prev => [...prev, mockAnswer]);
        setIsRecording(false);
        handleNext();
      }, 3000);
    }
  };

  if (feedback) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
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
        <div className="bg-blue-600 text-white p-6 rounded-[32px] shadow-xl">
          <h3 className="font-bold mb-2">التقييم الفني</h3>
          <p className="text-blue-50 text-sm leading-relaxed">{feedback.technicalRating}</p>
        </div>
        <div className="bg-slate-100 p-6 rounded-[32px]">
          <h3 className="font-bold text-slate-700 mb-2">نصيحة المساعد الذكي</h3>
          <p className="text-slate-500 text-xs leading-relaxed">{feedback.generalAdvice}</p>
        </div>
        <button onClick={onBack} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-xl active:scale-95 transition-all">العودة للرئيسية</button>
      </div>
    );
  }

  if (isStarted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in zoom-in-95">
        <div className="space-y-2">
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">مدير التوظيف الذكي</span>
          <p className="text-[10px] text-slate-400 font-bold">سؤال {currentIndex + 1} من {questions.length}</p>
        </div>
        <h3 className="text-2xl font-black text-slate-800 leading-snug max-w-xs">{questions[currentIndex]?.question}</h3>
        
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150"></div>
          )}
          <button 
            onClick={toggleRecording} 
            disabled={isRecording} 
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative z-10 shadow-2xl ${isRecording ? 'bg-red-500' : 'bg-blue-600 active:scale-90'}`}
          >
            {isRecording ? (
              <div className="flex space-x-1 space-x-reverse">
                <div className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.6s_infinite_0s]"></div>
                <div className="w-1.5 h-10 bg-white rounded-full animate-[bounce_0.6s_infinite_0.2s]"></div>
                <div className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.6s_infinite_0.4s]"></div>
              </div>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            )}
          </button>
        </div>
        <p className={`text-xs font-bold transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
          {isRecording ? 'جاري الاستماع لإجابتك...' : 'اضغط على الميكروفون للإجابة'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 space-x-reverse mb-4">
        <button onClick={onBack} className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm active:scale-90 transition-all"><svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg></button>
        <h2 className="text-2xl font-black text-slate-800">تجهيز المقابلة</h2>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-8 rounded-[40px] shadow-xl shadow-indigo-100 relative overflow-hidden group">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
        <h3 className="text-xl font-black mb-3 relative z-10">تدريب ذكي ومخصص</h3>
        <p className="text-indigo-100 text-xs font-bold leading-relaxed relative z-10">سنقوم باختبارك في مهاراتك الفنية والسلوكية بناءً على تخصصك المسجل في الملف.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المسمى المستهدف</label>
          <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full p-5 rounded-[24px] border-2 border-slate-100 outline-none focus:border-blue-500 transition-all font-bold text-slate-700" placeholder="المسمى الوظيفي" />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">صعوبة الأسئلة</label>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 flex-row-reverse">
            {['سهل', 'متوسط', 'خبير'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`flex-grow py-3 rounded-xl text-xs font-black transition-all ${difficulty === d ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>{d}</button>
            ))}
          </div>
        </div>

        <button onClick={startInterview} disabled={isLoading} className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-50">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري صياغة الأسئلة...</span>
            </div>
          ) : 'بدء المقابلة الآن'}
        </button>
      </div>
    </div>
  );
};

export default Interview;
