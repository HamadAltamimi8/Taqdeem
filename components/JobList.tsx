
import React, { useState, useEffect } from 'react';
import { UserProfile, JobPost } from '../types';
import { dbService } from '../services/db';
import { RewardedAdModal } from './AdComponents';

interface JobListProps {
  profile: UserProfile;
  onBack: () => void;
  updateProfile: (p: UserProfile) => void;
}

const JobList: React.FC<JobListProps> = ({ profile, onBack, updateProfile }) => {
  const [internalJobs, setInternalJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [pendingJob, setPendingJob] = useState<JobPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getInternalJobs();
      setInternalJobs(data);
    } catch (e) { 
      console.error("Error fetching jobs:", e); 
    }
    setIsLoading(false);
  };

  const handleJobClick = (job: JobPost) => {
    setPendingJob(job);
    setShowAd(true);
  };

  const revealJobDetails = () => {
    setSelectedJob(pendingJob);
    setPendingJob(null);
    setShowAd(false);
  };

  const handleApplyInternal = async (job: JobPost) => {
    try {
      const session = localStorage.getItem('taqdeem_session');
      if (!session) {
        alert("يرجى تسجيل الدخول للتقديم");
        return;
      }
      const user = JSON.parse(session);
      
      await dbService.applyToJob(job.id, user.id, profile);
      alert("✅ تم إرسال ملفك الشخصي بنجاح للمعلن!");
      setSelectedJob(null);
    } catch (e) {
      alert("حدث خطأ أثناء التقديم.");
    }
  };

  const handleShare = async (job: JobPost) => {
    const shareText = `فرصة وظيفية مميزة عبر تطبيق تقديم:\n\n📌 المسمى: ${job.title}\n🏢 الشركة: ${job.companyName}\n📍 المدينة: ${job.city}\n\nسجل في تطبيق تقديم لمشاهدة التفاصيل والتقديم.\n${window.location.origin}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `وظيفة ${job.title} في ${job.companyName}`,
          text: shareText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("تم نسخ تفاصيل الوظيفة، يمكنك الآن لصقها في الواتساب أو أي تطبيق آخر ✅");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const filteredJobs = internalJobs
    .filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 pb-32 text-right font-['Cairo']" dir="rtl">
      <header className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">استكشف الفرص 🔍</h2>
        <p className="text-xs text-slate-400 font-bold mt-1">اضغط على الوظيفة لمشاهدة التفاصيل والتقديم</p>
      </header>

      <div className="space-y-4 mb-8">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="ابحث عن مسمى وظيفي أو شركة..." 
            className="w-full p-5 pr-12 rounded-[28px] border-2 border-slate-100 bg-white shadow-sm outline-none focus:border-blue-500 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3" strokeLinecap="round"/></svg>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex gap-2">
            <button onClick={() => setSortBy('newest')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${sortBy === 'newest' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>الأحدث</button>
            <button onClick={() => setSortBy('oldest')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${sortBy === 'oldest' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>الأقدم</button>
          </div>
          <button onClick={fetchData} className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-2 rounded-xl active:scale-95 transition-all">تحديث 🔄</button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-300 font-bold animate-pulse">جاري جلب أحدث الشواغر...</div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white p-16 rounded-[40px] border border-dashed border-slate-200 text-center">
              <p className="text-[11px] text-slate-400 font-bold">لم يتم العثور على وظائف تطابق بحثك.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} onClick={() => handleJobClick(job)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:shadow-xl group relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h4>
                    <p className="text-[11px] text-blue-600 font-black mt-1">{job.companyName}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-2xl text-[9px] font-black border border-blue-100">
                    {job.jobType}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">{job.description}</p>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                  <span className="flex items-center gap-1 font-black">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
                    {job.city}
                  </span>
                  <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg">{formatDate(job.createdAt)}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-20 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800">تفاصيل الفرصة</h3>
              <button onClick={() => setSelectedJob(null)} className="bg-slate-50 p-2 rounded-full text-slate-300 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
              </button>
            </div>

            <div className="space-y-8">
              <div className="text-center border-b border-slate-50 pb-6">
                <h4 className="text-2xl font-black text-slate-800 leading-tight">{selectedJob.title}</h4>
                <p className="text-blue-600 font-black text-lg mt-2">{selectedJob.companyName}</p>
                <div className="flex justify-center gap-2 mt-2">
                   <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg">{selectedJob.city}</span>
                   <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg">{selectedJob.jobType}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المتطلبات والوصف</p>
                <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed font-bold whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {selectedJob.externalLink ? (
                  <button onClick={() => window.open(selectedJob.externalLink, '_blank')} className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    <span>التقديم الخارجي</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ) : (
                  <button onClick={() => handleApplyInternal(selectedJob)} className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">تقديم سريع بالملف 🚀</button>
                )}
                
                {/* زر مشاركة الوظيفة الجديد */}
                <button 
                  onClick={() => handleShare(selectedJob)}
                  className="w-full bg-white text-slate-700 py-4 rounded-[28px] font-black border-2 border-slate-100 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm">مشاركة هذه الوظيفة</span>
                </button>

                <button onClick={() => setSelectedJob(null)} className="w-full py-4 text-slate-400 text-[10px] font-black tracking-widest uppercase">إغلاق التفاصيل</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAd && (
        <RewardedAdModal 
          featureName="عرض تفاصيل الوظيفة"
          onClose={() => setShowAd(false)}
          onReward={revealJobDetails}
        />
      )}
    </div>
  );
};

export default JobList;
