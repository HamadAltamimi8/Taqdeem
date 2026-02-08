
import React, { useState, useEffect } from 'react';
import { UserProfile, AppStep, JobPost } from '../types';
import { dbService } from '../services/db';
import InstallGuide from './InstallGuide';

interface DashboardProps {
  profile: UserProfile;
  completion: number;
  missingItems: string[];
  onNavigate: (step: AppStep) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, completion, missingItems, onNavigate, onLogout }) => {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    // التحقق من حالة PWA
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

    // جلب أحدث الوظائف
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    setLoadingJobs(true);
    try {
      const allJobs = await dbService.getInternalJobs();
      // عرض آخر 3 وظائف فقط في الرئيسية
      setRecentJobs(allJobs.slice(0, 3));
    } catch (e) {
      console.error("Error fetching jobs for dashboard:", e);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
      {/* رأس الصفحة المبسط - يحتوي فقط على زر الخروج واسم التطبيق */}
      <header className="flex items-center justify-between py-2 border-b border-slate-100">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">تقديم</h1>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 p-2.5 bg-white border border-red-50 text-red-500 rounded-2xl shadow-sm active:scale-90 transition-all text-xs font-black"
          title="تسجيل الخروج"
        >
          <span>تسجيل خروج</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* الخدمات الرئيسية - تبدأ مباشرة بعد الرأس */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الأدوات الذكية</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate(AppStep.INTERVIEW)} className="bg-slate-900 text-white p-6 rounded-[28px] flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
            <div className="bg-white/10 p-3 rounded-xl mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div>
            <span className="block font-black text-xs">مقابلة AI</span>
          </button>
          
          <button onClick={() => onNavigate(AppStep.CV_BUILDER)} className="bg-blue-600 text-white p-6 rounded-[28px] flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
            <div className="bg-white/10 p-3 rounded-xl mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <span className="block font-black text-xs">تحسين السيرة</span>
          </button>
        </div>
      </section>

      {/* قسم الوظائف الحديثة */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">أحدث الفرص ⚡</h2>
           <button onClick={() => onNavigate(AppStep.JOBS)} className="text-[10px] font-black text-blue-600 flex items-center gap-1">عرض الكل <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        </div>

        <div className="space-y-3">
          {loadingJobs ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="bg-white h-24 rounded-[28px] border border-slate-100 animate-pulse"></div>)}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="bg-white p-12 rounded-[36px] border border-dashed border-slate-200 text-center">
               <p className="text-[10px] text-slate-400 font-bold">لا توجد وظائف معروضة حالياً.</p>
            </div>
          ) : (
            recentJobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => onNavigate(AppStep.JOBS)}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2"/></svg>
                </div>
                <div className="flex-grow overflow-hidden">
                  <h4 className="font-black text-slate-800 text-xs truncate">{job.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-blue-600 font-black">{job.companyName}</span>
                    <span className="text-[9px] text-slate-300">•</span>
                    <span className="text-[9px] text-slate-400 font-bold">{job.city}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="bg-slate-50 p-2 rounded-xl text-slate-300 group-hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {showInstallGuide && <InstallGuide onClose={() => setShowInstallGuide(false)} />}
    </div>
  );
};

export default Dashboard;
