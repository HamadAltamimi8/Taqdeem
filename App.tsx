
import React, { useState, useEffect } from 'react';
import { AppStep, UserProfile } from './types';
import { INITIAL_PROFILE } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Interview from './components/Interview';
import CVBuilder from './components/CVBuilder';
import JobList from './components/JobList';
import ProfileView from './components/ProfileView';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [completionScore, setCompletionScore] = useState(0);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPwaHint, setShowPwaHint] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // تحديد نظام التشغيل وحالة التثبيت
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // إظهار التنبيه فقط إذا كان جوال ولم يتم التثبيت بعد
    if (isMobile && !isStandalone) {
      setTimeout(() => setShowPwaHint(true), 2000);
    }

    const savedProfile = localStorage.getItem('taqdeem_user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      if (parsed.personalInfo.fullName) {
        setIsLoggedIn(true);
        setStep(AppStep.DASHBOARD);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('taqdeem_user_profile', JSON.stringify(profile));
    }
  }, [profile, isLoggedIn]);

  useEffect(() => {
    let score = 0;
    const missing: string[] = [];
    if (profile.personalInfo.fullName) score += 10; else missing.push("الاسم الكامل");
    if (profile.personalInfo.email) score += 10; else missing.push("البريد الإلكتروني");
    if (profile.personalInfo.phone) score += 10; else missing.push("رقم الجوال");
    const hasValidEdu = profile.education.some(edu => edu.major && edu.documentAttached);
    if (hasValidEdu) score += 20; else missing.push("إضافة مؤهل تعليمي وإرفاق وثيقة التخرج");
    if (profile.skills.technical.length >= 3) score += 20;
    else if (profile.skills.technical.length > 0) score += 10;
    if (profile.skills.technical.length < 3) missing.push("إضافة 3 مهارات تقنية على الأقل");
    if (profile.experience.hasExperience && profile.experience.list.length > 0) score += 20;
    else if (!profile.experience.hasExperience) score += 20; 
    else missing.push("إضافة تفاصيل الخبرة العملية");
    if (profile.links.linkedin) score += 10; else missing.push("إضافة رابط LinkedIn");
    setCompletionScore(score);
    setMissingItems(missing);
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem('taqdeem_user_profile');
    setProfile(INITIAL_PROFILE);
    setIsLoggedIn(false);
    setStep(AppStep.WELCOME);
  };

  const renderContent = () => {
    switch (step) {
      case AppStep.WELCOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-600 to-indigo-800 text-white text-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl animate-bounce">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tighter">تقديم</h1>
            <p className="text-lg text-blue-100 mb-12 max-w-md font-bold">
              مساعدك الذكي للحصول على الوظيفة المثالية في المملكة.
            </p>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] w-full max-w-xs space-y-4 border border-white/20">
              <input type="email" placeholder="البريد الإلكتروني" className="w-full p-4 bg-white/10 rounded-2xl border border-white/20 outline-none text-white placeholder-white/50 text-sm" />
              <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-white/10 rounded-2xl border border-white/20 outline-none text-white placeholder-white/50 text-sm" />
              <button onClick={() => { setIsLoggedIn(true); setStep(AppStep.DASHBOARD); }} className="w-full bg-white text-blue-700 font-black py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-95">تسجيل الدخول</button>
            </div>
            <button onClick={() => setStep(AppStep.ONBOARDING)} className="mt-8 text-blue-100 font-bold text-sm underline underline-offset-4">ليس لديك حساب؟ سجل الآن مجاناً</button>
          </div>
        );
      case AppStep.ONBOARDING:
        return <Onboarding onComplete={(data) => { setProfile(data); setIsLoggedIn(true); setStep(AppStep.DASHBOARD); }} />;
      case AppStep.DASHBOARD:
        return <Dashboard profile={profile} completion={completionScore} missingItems={missingItems} onNavigate={setStep} />;
      case AppStep.INTERVIEW:
        return <Interview profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} />;
      case AppStep.CV_BUILDER:
        return <CVBuilder profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} />;
      case AppStep.JOBS:
        return <JobList profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} />;
      case AppStep.PROFILE:
        return <ProfileView profile={profile} setProfile={setProfile} onBack={() => setStep(AppStep.DASHBOARD)} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      <main className="flex-grow pb-24 overflow-y-auto scrollbar-hide">
        {renderContent()}
      </main>
      
      {/* تلميح التثبيت الذكي */}
      {showPwaHint && (
        <div className={`fixed z-[200] left-4 right-4 animate-in fade-in duration-700 ${isIOS ? 'bottom-20 slide-in-from-bottom-10' : 'top-4 slide-in-from-top-10'}`}>
          <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[32px] shadow-2xl border border-slate-100 relative">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isIOS ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                  )}
                </svg>
              </div>
              <div className="flex-grow">
                <p className="text-sm font-black text-slate-800">تثبيت تطبيق "تقديم"</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5 leading-tight">
                  {isIOS 
                    ? 'اضغط على زر "مشاركة" ثم اختر "إضافة إلى الشاشة الرئيسية" لتجربة أفضل' 
                    : 'اضغط على قائمة المتصفح ثم "تثبيت التطبيق" للوصول السريع'}
                </p>
              </div>
              <button onClick={() => setShowPwaHint(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            {/* سهم تلميح لمستخدمي آيفون يشير لزر المشاركة في Safari */}
            {isIOS && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-blue-600 animate-bounce">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.0001 3.67157L13.0001 3.67157L13.0001 16.3269L16.293 13.0339L17.7072 14.4481L12.0001 20.1552L6.293 14.4481L7.70721 13.0339L11.0001 16.3269L11.0001 3.67157Z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {step >= AppStep.DASHBOARD && (
        <Navigation activeStep={step} onNavigate={setStep} />
      )}
    </div>
  );
};

export default App;
