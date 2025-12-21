
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { searchRealJobs, tailorJobApplication } from '../services/gemini';

interface Job {
  title: string;
  company: string;
  location: string;
  platform: string;
  url: string;
}

interface JobListProps {
  profile: UserProfile;
  onBack: () => void;
}

const JobList: React.FC<JobListProps> = ({ profile, onBack }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('الكل');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [automationStep, setAutomationStep] = useState(0); 
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [tailoredData, setTailoredData] = useState<{coverLetter: string, keyPoints: string[]} | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const interests = profile.jobInterests.titles.length > 0 
          ? profile.jobInterests.titles 
          : ['محاسب', 'مدير مشاريع']; 
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
      setAutomationStep(3);
    } catch (e) {
      setAutomationStep(3);
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform.toLowerCase().includes('linkedin')) return 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z';
    if (platform.toLowerCase().includes('bayt')) return 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'; // Simple stack icon for Bayt
    return 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
  };

  const filteredJobs = activeFilter === 'الكل' 
    ? jobs 
    : jobs.filter(j => j.platform.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div className="p-4 space-y-6 relative min-h-screen pb-32 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">استكشف الفرص</h2>
          <div className="flex items-center mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ml-2"></span>
            <p className="text-[10px] text-slate-500 font-bold">تم جلب {jobs.length} وظيفة حديثة جداً</p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="bg-white p-2.5 rounded-2xl text-slate-400 shadow-sm border border-slate-100 active:rotate-180 transition-transform">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2 scrollbar-hide">
        {['الكل', 'LinkedIn', 'Bayt', 'Indeed', 'Glassdoor'].map(filter => (
          <button 
            key={filter} 
            onClick={() => setActiveFilter(filter)} 
            className={`whitespace-nowrap px-6 py-3 rounded-2xl border text-[11px] font-black transition-all ${activeFilter === filter ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-400'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-6 py-12 text-center">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600 text-xs">رادار..</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-700">جاري فحص 50+ موقع توظيف...</h3>
              <p className="text-[10px] text-slate-400 font-bold px-10">نبحث الآن في Bayt.com و LinkedIn عن أحدث الوظائف المنشورة اليوم</p>
            </div>
            <div className="grid grid-cols-1 gap-4 opacity-20 px-4">
               {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-300 rounded-[32px] animate-pulse"></div>)}
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-8 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <p className="text-slate-500 font-black text-lg">لم نجد نتائج مطابقة لهذه المنصة حالياً</p>
            <p className="text-slate-400 text-xs mt-2 font-bold">حاول اختيار "الكل" لعرض النتائج من المنصات الأخرى</p>
          </div>
        ) : (
          filteredJobs.map((job, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all animate-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${idx * 50}ms`}}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex space-x-2 space-x-reverse">
                  <span className="text-[9px] bg-emerald-50 px-3 py-1.5 rounded-xl text-emerald-600 font-black border border-emerald-100">خلال أسبوع ✨</span>
                  <span className="text-[9px] bg-slate-50 px-3 py-1.5 rounded-xl text-slate-500 font-black border border-slate-100">{job.platform}</span>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${job.platform.toLowerCase().includes('linkedin') ? 'text-blue-600 bg-blue-50' : job.platform.toLowerCase().includes('bayt') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 bg-slate-50'}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d={getPlatformIcon(job.platform)} /></svg>
                </div>
              </div>
              <div className="space-y-1 mb-6">
                <h3 className="text-base font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <div className="flex items-center text-slate-400 text-[11px] font-bold">
                  <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span>{job.company}</span>
                  <span className="mx-2 opacity-30">•</span>
                  <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{job.location}</span>
                </div>
              </div>
              <button 
                onClick={() => handleApply(job)} 
                className="w-full bg-slate-900 text-white py-4 rounded-[22px] font-black text-xs flex items-center justify-center space-x-2 space-x-reverse shadow-xl active:scale-95 transition-all group-hover:bg-blue-600"
              >
                <span>تقديم الطلب الآن</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          ))
        )}
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-6">
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 shadow-2xl relative animate-in zoom-in-95">
             {automationStep < 3 ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center animate-bounce">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d={getPlatformIcon(applyingJob?.platform || '')} /></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">جاري تخصيص الطلب...</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">نقوم بكتابة خطاب تغطية مخصص لشركة {applyingJob?.company} بناءً على خبرتك في {profile.education.major}.</p>
                </div>
             ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-wide">جاهز للتقديم ✨</div>
                    <button onClick={() => setShowStatusModal(false)} className="text-slate-300 hover:text-slate-500 p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 max-h-40 overflow-y-auto">
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed whitespace-pre-line">{tailoredData?.coverLetter}</p>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center font-bold">اضغط بالأسفل لفتح صفحة الوظيفة في {applyingJob?.platform}</p>
                  <button 
                    onClick={() => {
                      if (applyingJob?.url) {
                        window.open(applyingJob.url, '_blank');
                        setShowStatusModal(false);
                      }
                    }} 
                    className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all"
                  >
                    انتقل لصفحة التقديم الآن
                  </button>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
