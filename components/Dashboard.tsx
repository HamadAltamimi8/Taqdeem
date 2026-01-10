
import React, { useState, useEffect } from 'react';
import { UserProfile, AppStep } from '../types';
import { BannerAd } from './AdComponents';
import InstallGuide from './InstallGuide';

interface DashboardProps {
  profile: UserProfile;
  completion: number;
  missingItems: string[];
  onNavigate: (step: AppStep) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, completion, missingItems, onNavigate }) => {
  const userName = profile.personalInfo.fullName.split(' ')[0] || 'باحث عن عمل';
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const credits = profile.activity?.credits ?? 0;

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (!isPWA && isIOS) {
      const lastShown = localStorage.getItem('install_guide_shown');
      const now = new Date().getTime();
      if (!lastShown || now - parseInt(lastShown) > 86400000) {
        setShowInstallGuide(true);
        localStorage.setItem('install_guide_shown', now.toString());
      }
    }
  }, []);

  const handleManualUpdate = () => {
    setIsCheckingUpdate(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.update();
          setTimeout(() => {
            setIsCheckingUpdate(false);
            alert("تم التحقق! إذا وجد تحديث جديد سيظهر لك تنبيه التحديث آلياً.");
          }, 1500);
        } else {
          window.location.reload();
        }
      });
    }
  };

  const stats = [
    { label: 'مقابلات مجراة', value: profile.activity?.interviews?.length || 0, color: 'bg-green-500' },
    { label: 'رصيد العمليات', value: credits, color: 'bg-amber-500', isSpecial: true },
    { label: 'تقديمات نشطة', value: profile.activity?.appliedJobs?.length || 0, color: 'bg-blue-500' },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">أهلاً، {userName}! 👋</h1>
          <p className="text-slate-400 font-bold text-xs mt-0.5">مستعد لفرصتك القادمة؟</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[22px] shadow-lg shadow-blue-100 flex items-center justify-center text-white font-black text-xl border-4 border-white">
            {userName.charAt(0)}
          </div>
        </div>
      </header>

      {!window.matchMedia('(display-mode: standalone)').matches && (
        <button 
          onClick={() => setShowInstallGuide(true)}
          className="w-full bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between flex-row-reverse"
        >
          <div className="flex items-center flex-row-reverse">
            <div className="bg-blue-600 p-2 rounded-xl text-white ml-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-blue-800">ثبت التطبيق على جوالك</p>
              <p className="text-[10px] text-blue-600 font-bold">تجربة أسرع وأفضل من المتصفح</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}

      <button 
        onClick={() => setShowMissingModal(true)}
        className="w-full text-right bg-white p-7 rounded-[36px] shadow-sm border border-slate-100 relative overflow-hidden active:scale-[0.98] transition-all group"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 -mr-20 -mt-20 rounded-full opacity-40 group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-slate-700">نسبة اكتمال الملف</h3>
            <span className="text-blue-600 font-black text-3xl">{completion}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3.5 rounded-full mb-5 border border-slate-50">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm shadow-blue-200"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
             <p className="text-[10px] text-slate-400 font-bold flex items-center">
               <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               تحقق من النواقص في ملفك
             </p>
             {missingItems.length > 0 && (
               <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-lg text-[9px] font-black border border-red-100">
                 {missingItems.length} نواقص
               </span>
             )}
          </div>
        </div>
      </button>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`bg-white p-4 rounded-[24px] text-center border shadow-sm transition-all ${s.isSpecial ? 'border-amber-200 bg-amber-50/30' : 'border-slate-50'}`}>
            <div className={`text-xl font-black mb-1 ${s.isSpecial ? 'text-amber-600' : 'text-slate-800'}`}>
              {s.isSpecial && <span className="ml-1 text-sm">⚡</span>}
              {s.value}
            </div>
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <BannerAd />

      <section className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">خدمات تقديم المميزة</h2>
        <div className="space-y-3">
          <button onClick={() => onNavigate(AppStep.INTERVIEW)} className="w-full bg-indigo-600 text-white p-6 rounded-[32px] flex items-center space-x-5 space-x-reverse shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
            <div className="bg-white/20 p-3.5 rounded-2xl"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div>
            <div className="text-right"><span className="block font-black text-lg">مقابلة افتراضية</span><span className="text-xs opacity-70 font-bold">تدريب ذكي يحاكي المقابلات الحقيقية</span></div>
          </button>
          <button onClick={() => onNavigate(AppStep.CV_BUILDER)} className="w-full bg-blue-500 text-white p-6 rounded-[32px] flex items-center space-x-5 space-x-reverse shadow-xl shadow-blue-100 hover:bg-blue-600 transition-all active:scale-[0.98]">
            <div className="bg-white/20 p-3.5 rounded-2xl"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <div className="text-right"><span className="block font-black text-lg">توليد سيرة ذاتية</span><span className="text-xs opacity-70 font-bold">قوالب احترافية تدعم الفرز الآلي (ATS)</span></div>
          </button>
        </div>
      </section>

      <div className="pt-4 text-center flex flex-col items-center space-y-3">
        <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">
          نسخة v1.3.3-production
        </span>
        <button 
          onClick={handleManualUpdate}
          className="text-[9px] font-black text-blue-500 hover:text-blue-700 flex items-center space-x-1 space-x-reverse opacity-60"
        >
          <svg className={`w-3 h-3 ${isCheckingUpdate ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>{isCheckingUpdate ? 'جاري الفحص...' : 'التحقق من وجود تحديثات'}</span>
        </button>
      </div>

      {showInstallGuide && <InstallGuide onClose={() => setShowInstallGuide(false)} />}

      {showMissingModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-10">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-slate-800">خطواتك المتبقية 🏁</h3>
               <button onClick={() => setShowMissingModal(false)} className="text-slate-300 hover:text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="space-y-3 mb-8">
              {missingItems.length > 0 ? (
                missingItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 space-x-reverse bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-5 h-5 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center"><div className="w-2 h-2 bg-slate-200 rounded-full"></div></div>
                    <span className="text-xs font-black text-slate-600">{item}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></div>
                  <p className="font-black text-emerald-600">ملفك مكتمل بنسبة 100%!</p>
                </div>
              )}
            </div>
            {missingItems.length > 0 && <button onClick={() => { setShowMissingModal(false); onNavigate(AppStep.PROFILE); }} className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all">إكمال البيانات الآن</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
