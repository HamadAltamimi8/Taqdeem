
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { searchRealJobs, tailorJobApplication } from '../services/gemini';
import { dbService } from '../services/db';

interface Job {
  title: string;
  company: string;
  location: string;
  platform: string;
  url: string;
  daysAgo: number;
}

interface JobListProps {
  profile: UserProfile;
  onBack: () => void;
}

const JobList: React.FC<JobListProps> = ({ profile, onBack }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('الكل');
  const [activeRecency, setActiveRecency] = useState('الكل'); 
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [automationStep, setAutomationStep] = useState(0); 
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [tailoredData, setTailoredData] = useState<{coverLetter: string, keyPoints: string[]} | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const interests = profile.jobInterests.titles.length > 0 ? profile.jobInterests.titles : ['محاسب', 'مدير مشاريع']; 
        const realJobs = await searchRealJobs(interests);
        setJobs(realJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [profile.jobInterests.titles]);

  const handleApply = async (job: Job) => {
    setApplyingJob(job);
    setShowStatusModal(true);
    setAutomationStep(1);
    try {
      const result = await tailorJobApplication(profile, job.title, job.company);
      setAutomationStep(2);
      setTailoredData(result);
      
      const updatedProfile = {
        ...profile,
        activity: {
          ...profile.activity,
          appliedJobs: [
            ...(profile.activity?.appliedJobs || []),
            { title: job.title, company: job.company, date: new Date().toISOString() }
          ]
        }
      };
      
      const savedUser = JSON.parse(localStorage.getItem('taqdeem_session') || '{}');
      if (savedUser.id) {
        await dbService.updateProfile(savedUser.id, updatedProfile);
        localStorage.setItem('taqdeem_session', JSON.stringify({ ...savedUser, profile: updatedProfile }));
      }
      
      setAutomationStep(3);
    } catch (e) {
      setAutomationStep(3);
    }
  };

  const openJobLink = (customUrl?: string) => {
    const urlToOpen = customUrl || applyingJob?.url;
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
      setShowStatusModal(false);
    }
  };

  const openAlternativeSearch = () => {
    if (!applyingJob) return;
    const query = encodeURIComponent(`${applyingJob.title} ${applyingJob.company} jobs`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('linkedin')) return 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z';
    return 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
  };

  const formatDateLabel = (days: number) => {
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 14) return 'منذ أسبوع';
    return `منذ ${Math.floor(days / 7)} أسبوع`;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesPlatform = activePlatform === 'الكل' || job.platform.toLowerCase().includes(activePlatform.toLowerCase());
    const matchesRecency = activeRecency === 'الكل' || job.daysAgo <= parseInt(activeRecency);
    return matchesPlatform && matchesRecency;
  });

  return (
    <div className="p-4 space-y-6 relative min-h-screen pb-32 bg-slate-50/50 text-right">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">استكشف الفرص</h2>
          <div className="flex items-center mt-1 justify-end">
            <p className="text-[10px] text-slate-500 font-bold">تم جلب {filteredJobs.length} وظيفة محدثة</p>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="bg-white p-2.5 rounded-2xl text-slate-400 shadow-sm border border-slate-100 active:rotate-180 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
      </div>
      
      <div className="space-y-3">
        <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-1 scrollbar-hide flex-row-reverse">
          {['الكل', 'LinkedIn', 'Bayt', 'Naukrigulf'].map(filter => (
            <button key={filter} onClick={() => setActivePlatform(filter)} className={`whitespace-nowrap px-4 py-2 rounded-xl border text-[10px] font-black transition-all ml-2 ${activePlatform === filter ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>{filter}</button>
          ))}
        </div>
        <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2 scrollbar-hide flex-row-reverse items-center">
          <span className="text-[9px] font-black text-slate-400 ml-2">الحداثة:</span>
          {[
            { label: 'الكل', val: 'الكل' },
            { label: 'اليوم', val: '0' },
            { label: 'هذا الأسبوع', val: '7' },
            { label: 'هذا الشهر', val: '30' }
          ].map(r => (
            <button key={r.val} onClick={() => setActiveRecency(r.val)} className={`whitespace-nowrap px-4 py-2 rounded-xl border text-[10px] font-black transition-all ml-2 ${activeRecency === r.val ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>{r.label}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-6 py-12 text-center">
            <div className="relative w-24 h-24 mx-auto"><div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div><div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            <h3 className="text-lg font-black text-slate-700">جاري فحص أحدث الوظائف...</h3>
            <p className="text-xs text-slate-400 font-bold">نقوم بالتحقق من الروابط المباشرة لضمان دقة التوجيه</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </div>
             <p className="text-sm font-black text-slate-400">لا توجد نتائج تطابق هذه الفلاتر</p>
          </div>
        ) : filteredJobs.map((job, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative hover:border-blue-200 transition-all group text-right">
            <div className="flex justify-between items-start mb-3 flex-row-reverse">
              <div className="flex flex-col space-y-1 items-end">
                <span className="text-[9px] bg-emerald-50 px-3 py-1.5 rounded-xl text-emerald-600 font-black w-fit">رابط مباشر عبر {job.platform}</span>
                <span className={`text-[9px] px-3 py-1 rounded-xl font-black w-fit ${job.daysAgo <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {formatDateLabel(job.daysAgo)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d={getPlatformIcon(job.platform)} /></svg>
              </div>
            </div>
            <div className="space-y-1 mb-6">
              <h3 className="text-base font-black text-slate-800 leading-tight">{job.title}</h3>
              <p className="text-[11px] text-slate-400 font-bold">{job.company} • {job.location}</p>
            </div>
            <button onClick={() => handleApply(job)} className="w-full bg-slate-900 text-white py-4 rounded-[22px] font-black text-xs shadow-xl active:scale-95 transition-all">تحليل الوظيفة والتقديم</button>
          </div>
        ))}
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-6">
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 shadow-2xl relative animate-in zoom-in-95 text-right">
             {automationStep < 3 ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center animate-bounce">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d={getPlatformIcon(applyingJob?.platform || '')} /></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">جاري تجهيز طلب التقديم المباشر...</h3>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full animate-[progress_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                  </div>
                </div>
             ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-row-reverse">
                    <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-2xl text-[10px] font-black">جاهز للتقديم ✨</div>
                    <button onClick={() => setShowStatusModal(false)} className="text-slate-300 hover:text-slate-500 p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-800">تم تجهيز خطاب تغطية مخصص لشركة {applyingJob?.company}</p>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">في حال تعذر فتح الرابط المباشر، جرب خيار البحث البديل أدناه.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 max-h-40 overflow-y-auto">
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed whitespace-pre-line">{tailoredData?.coverLetter}</p>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={() => openJobLink()} 
                      className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      <span>الذهاب لصفحة الوظيفة</span>
                    </button>
                    <button 
                      onClick={openAlternativeSearch} 
                      className="w-full bg-slate-100 text-slate-600 py-4 rounded-[24px] font-black text-[11px] active:scale-95 transition-all flex items-center justify-center border border-slate-200"
                    >
                      <span>رابط الرابط معطل؟ ابحث يدوياً عن الوظيفة</span>
                    </button>
                  </div>
                </div>
             )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default JobList;
