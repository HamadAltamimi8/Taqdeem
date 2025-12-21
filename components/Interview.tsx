
import React, { useState, useEffect } from 'react';
import { UserProfile, InterviewQuestion, InterviewFeedback } from '../types';
import { generateInterviewQuestions, analyzeInterview } from '../services/gemini';

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
      alert("حدث خطأ في توليد الأسئلة. حاول مرة أخرى.");
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
    } catch (e) {
      alert("حدث خطأ في تحليل المقابلة.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech-to-text
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
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">مستوى الطلاقة</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm text-center">
            <div className="text-xl font-black text-indigo-600 mb-1">{feedback.confidence}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">مستوى الثقة</div>
          </div>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold mb-2 flex items-center">
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            التقييم الفني
          </h3>
          <p className="text-blue-50">{feedback.technicalRating}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3">نصائح للتحسين</h3>
          <p className="text-slate-600 leading-relaxed">{feedback.generalAdvice}</p>
        </div>
        <button 
          onClick={onBack}
          className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  if (isStarted) {
    const currentQ = questions[currentIndex];
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
        <div className="space-y-4">
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-black uppercase">
            سؤال {currentIndex + 1} من {questions.length}
          </span>
          <h3 className="text-2xl font-bold text-slate-800 leading-tight">
            {currentQ?.question}
          </h3>
        </div>

        <div className="relative flex items-center justify-center">
          <div className={`absolute w-32 h-32 bg-blue-500/20 rounded-full ${isRecording ? 'animate-ping' : ''}`}></div>
          <button 
            onClick={toggleRecording}
            disabled={isRecording}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500 scale-110 shadow-red-200 shadow-2xl' : 'bg-blue-600 hover:scale-105 shadow-blue-200 shadow-xl'
            }`}
          >
            {isRecording ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            )}
          </button>
        </div>

        <p className="text-slate-400 font-semibold">
          {isRecording ? 'جاري التسجيل... تحدث الآن' : 'اضغط على المايكروفون للإجابة صوتاً'}
        </p>

        <div className="w-full pt-12">
          <button 
            onClick={handleNext}
            className="text-slate-400 font-bold hover:text-slate-600 underline"
          >
            تخطي السؤال
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center space-x-4 space-x-reverse mb-4">
        <button onClick={onBack} className="p-2 bg-white rounded-lg border border-slate-200">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">تجهيز المقابلة الافتراضية</h2>
      </div>

      <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm mb-2">تدرب على المقابلات الحقيقية</p>
          <h3 className="text-xl font-bold mb-4">مساعدك الشخصي للتوظيف</h3>
          <ul className="text-sm space-y-2 text-indigo-50">
            <li className="flex items-center">✅ أسئلة مخصصة حسب الوظيفة</li>
            <li className="flex items-center">✅ تحليل فوري للغة الجسد والصوت</li>
            <li className="flex items-center">✅ تقرير أداء وتوصيات تحسين</li>
          </ul>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 -ml-16 -mt-16 rounded-full"></div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">المسمى الوظيفي المستهدف</label>
          <input 
            type="text" 
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-colors"
            placeholder="مثال: مصمم واجهات"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">مستوى صعوبة المقابلة</label>
          <div className="grid grid-cols-3 gap-2">
            {['سهل', 'متوسط', 'متقدم'].map(d => (
              <button 
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-3 rounded-xl font-bold transition-all border-2 ${
                  difficulty === d 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-slate-600 border-slate-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={startInterview}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'جاري تجهيز الأسئلة...' : 'بدء المقابلة الآن'}
        </button>
      </div>
    </div>
  );
};

export default Interview;
