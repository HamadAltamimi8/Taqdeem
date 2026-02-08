
import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, JobPost } from '../types';
import { dbService } from '../services/db';
import * as XLSX from 'xlsx';

interface RecruiterDashboardProps {
  recruiter: UserAccount;
  onLogout: () => void;
}

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ recruiter, onLogout }) => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showExcelGuide, setShowExcelGuide] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getInitialForm = () => ({
    recruiterId: recruiter.id,
    companyName: recruiter.recruiterProfile?.companyName || 'شركة تقديم التقنية',
    title: '',
    qualification: 'بكالوريوس',
    englishLevel: 'متوسط',
    vacancies: 1,
    city: 'الرياض',
    majors: [] as string[],
    jobType: 'دوام كامل' as any,
    description: '',
    externalLink: ''
  });

  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    fetchJobs();
  }, [recruiter.id]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await dbService.getRecruiterJobs(recruiter.id);
      setJobs(data);
    } catch (e) { 
      console.error("Fetch Jobs UI Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPublishing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const jobPosts: Partial<JobPost>[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row[0] || !row[1]) continue;

          jobPosts.push({
            recruiterId: recruiter.id,
            companyName: String(row[0] || ''),
            title: String(row[1] || ''),
            city: String(row[2] || 'غير محدد'),
            jobType: (row[3] as any) || 'دوام كامل',
            description: String(row[4] || ''),
            externalLink: String(row[5] || ''),
            qualification: 'بكالوريوس',
            englishLevel: 'متوسط',
            vacancies: 1,
            majors: []
          });
        }

        if (jobPosts.length > 0) {
          await dbService.createJobsBulk(jobPosts);
          alert(`✅ تم بنجاح رفع ونشر ${jobPosts.length} وظيفة دفعة واحدة!`);
          fetchJobs();
        } else {
          alert("⚠️ الملف يبدو فارغاً أو بتنسيق غير صحيح.");
        }
      } catch (err) {
        console.error("Excel processing error:", err);
        alert("حدث خطأ أثناء معالجة ملف الأكسل.");
      } finally {
        setIsPublishing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.companyName) {
      alert("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }
    setIsPublishing(true);
    try {
      await dbService.createJob({ ...formData, recruiterId: recruiter.id });
      setShowForm(false);
      setFormData(getInitialForm());
      setIsPublishing(false);
      await fetchJobs();
      setTimeout(() => alert("✅ تم نشر الإعلان بنجاح!"), 100);
    } catch (e: any) {
      setIsPublishing(false);
      alert(`عذراً، حدث خطأ أثناء النشر`);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-right font-['Cairo']" dir="rtl">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">لوحة المعلن 🏢</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1">إدارة شواغر منظمتك</p>
        </div>
        <button onClick={onLogout} className="bg-white p-2.5 rounded-2xl border border-red-100 text-red-500 shadow-sm active:scale-95 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => { setFormData(getInitialForm()); setShowForm(true); }} 
          className="bg-blue-600 p-8 rounded-[36px] text-white shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="flex items-center gap-4">
             <div className="bg-white/20 p-3 rounded-2xl"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" /></svg></div>
             <div className="text-right">
                <span className="block font-black text-lg">إعلان فردي</span>
                <span className="text-[10px] opacity-70">إضافة وظيفة واحدة</span>
             </div>
          </div>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="bg-slate-900 p-8 rounded-[36px] text-white shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] group relative overflow-hidden"
          disabled={isPublishing}
        >
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full"></div>
          <div className="flex items-center gap-4">
             <div className="bg-emerald-500/20 p-3 rounded-2xl">
               <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5" /></svg>
             </div>
             <div className="text-right">
                <span className="block font-black text-lg">رفع Excel 📊</span>
                <span className="text-[10px] opacity-70">نشر جماعي سريع</span>
             </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
        </button>
      </div>

      {/* قسم شرح ملف الأكسل */}
      <div className="mb-8">
        <button 
          onClick={() => setShowExcelGuide(!showExcelGuide)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[11px] font-black px-2"
        >
          <svg className={`w-4 h-4 transition-transform ${showExcelGuide ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {showExcelGuide ? 'إخفاء تعليمات الملف' : 'كيف أقوم بتعبئة ملف الأكسل؟'}
        </button>

        {showExcelGuide && (
          <div className="mt-4 bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-xs font-black text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              دليل ترتيب الأعمدة (A إلى F)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { col: 'A', label: 'اسم الجهة' },
                { col: 'B', label: 'المسمى الوظيفي' },
                { col: 'C', label: 'المدينة' },
                { col: 'D', label: 'طبيعة العمل' },
                { col: 'E', label: 'الوصف والشروط' },
                { col: 'F', label: 'رابط التقديم' },
              ].map((item) => (
                <div key={item.col} className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <span className="bg-white w-7 h-7 rounded-lg flex items-center justify-center font-black text-blue-600 shadow-sm text-xs">{item.col}</span>
                  <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
               <p className="text-[9px] text-blue-700 font-bold leading-relaxed">
                 💡 ملاحظة: في عمود "طبيعة العمل" يرجى كتابة أحد الخيارات التالية (دوام كامل، دوام جزئي، عن بعد) لضمان الفرز الصحيح.
               </p>
            </div>
          </div>
        )}
      </div>

      {isPublishing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-blue-600">جاري معالجة البيانات ونشر الوظائف...</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-black text-slate-700">إحصائيات إعلاناتك</h3>
        <div className="flex items-center gap-2">
          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black">{jobs.length} وظيفة</span>
          <button onClick={fetchJobs} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">تحديث 🔄</button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && jobs.length === 0 ? (
          <div className="text-center py-10 text-slate-300 font-bold animate-pulse">جاري التحميل...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] border border-dashed border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">لا توجد إعلانات منشورة بعد.</p>
          </div>
        ) : jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-slate-800 text-lg leading-tight">{job.title}</h4>
                <p className="text-[11px] text-blue-600 font-black mt-1">{job.companyName}</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-2xl text-[9px] font-black border border-emerald-100">نشط</div>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 mb-4">{job.description}</p>
            <button className="w-full bg-slate-50 text-slate-600 py-3 rounded-2xl text-[11px] font-black">إدارة المتقدمين (قريباً)</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 shadow-2xl relative">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">نشر إعلان جديد</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-300 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button>
             </div>
             <form onSubmit={handlePublish} className="space-y-5">
                <input type="text" required placeholder="اسم المنشأة" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                <input type="text" required placeholder="المسمى الوظيفي" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                   <input type="text" required placeholder="المدينة" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                   <select className="w-full p-4 border-2 border-slate-100 rounded-2xl text-xs font-bold" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value as any})}>
                      <option value="دوام كامل">دوام كامل</option>
                      <option value="دوام جزئي">دوام جزئي</option>
                      <option value="عن بعد">عن بعد</option>
                   </select>
                </div>
                <textarea required className="w-full p-4 border-2 border-slate-100 rounded-2xl text-xs font-bold h-24 outline-none resize-none focus:border-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="الوصف والشروط..." />
                <button type="submit" disabled={isPublishing} className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-base shadow-xl">نشر الآن</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
