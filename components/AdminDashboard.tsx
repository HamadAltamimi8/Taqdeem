
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { UserAccount } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'jobs'>('users');
  
  // نموذج الوظيفة اليدوية
  const [jobForm, setJobForm] = useState({
    company: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    link: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await dbService.getAllUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);
  
  const calculateCompletion = (profile: any) => {
    let score = 0;
    if (profile.personalInfo?.fullName) score += 20;
    if (profile.education?.length > 0 && profile.education[0].major) score += 30;
    if (profile.experience?.list?.length > 0) score += 30;
    if (profile.skills?.technical?.length > 0) score += 20;
    return score;
  };

  // دالة تصدير ملف CSV
  const downloadCSV = () => {
    if (users.length === 0) return;

    const headers = [
      "الاسم الكامل", "الجنسية", "المدينة", "رقم الجوال", "تاريخ الميلاد", "الجنس",
      "المؤهل التعليمي", "التخصص", "الجامعة", "درجة المؤهل", 
      "الخبرات العملية", "عدد سنوات الخبرة", "المسميات المهتم بها", "الشهادات الاحترافية"
    ];

    const rows = users.map(user => {
      const p = user.profile;
      // Fixed: Improved safely accessing education entry to prevent TypeScript errors
      const edu = p.education && p.education.length > 0 ? p.education[0] : null;
      const experiences = p.experience.list.map(ex => ex.lastTitle).join(" - ");
      const certs = p.certifications.list.map(c => c.name).join(" - ");
      const interests = p.jobInterests.titles.join(" - ");

      return [
        p.personalInfo.fullName || "غير محدد",
        p.personalInfo.nationality || "غير محدد",
        p.personalInfo.city || "غير محدد",
        `'${p.personalInfo.phone || ""}`, // إضافة علامة ' لمنع Excel من تغيير تنسيق الرقم
        p.personalInfo.birthDate || "",
        p.personalInfo.gender || "",
        // Fixed: Used optional chaining to safely access education fields and avoid TS errors on edu object
        edu?.degree || "",
        edu?.major || "",
        edu?.university || "",
        edu?.degree || "",
        experiences || "لا يوجد",
        p.experience.years || "0",
        interests || "غير محدد",
        certs || "لا يوجد"
      ];
    });

    // تحويل المصفوفة إلى نص CSV مع دعم اللغة العربية (UTF-8 BOM)
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Taqdeem_Users_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تم حفظ الوظيفة يدوياً في النظام بنجاح (Simulation)");
    setJobForm({ company: '', date: new Date().toISOString().split('T')[0], content: '', link: '' });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in duration-500 pb-32">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <h2 className="text-2xl font-black text-slate-800">لوحة تحكم المطور 🛠️</h2>
        <button onClick={onBack} className="bg-white px-6 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold shadow-sm active:scale-95 transition-all">خروج</button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl mb-8 border border-slate-100 flex-row-reverse shadow-sm">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-grow py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          إدارة المستخدمين
        </button>
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`flex-grow py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          إضافة وظائف يدوية
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold">
           <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           جاري جلب البيانات...
        </div>
      ) : activeTab === 'users' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-lg shadow-blue-100 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform"></div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider relative z-10">إجمالي المستخدمين</p>
              <p className="text-3xl font-black mt-1 relative z-10">{users.length}</p>
            </div>
            <button 
              onClick={downloadCSV}
              className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-lg shadow-emerald-100 text-right active:scale-95 transition-all group"
            >
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider">تصدير البيانات</p>
              <div className="flex items-center mt-1">
                <p className="text-xl font-black">تحميل CSV</p>
                <svg className="w-6 h-6 mr-2 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-slate-700">قائمة المستخدمين</h3>
              <span className="bg-slate-50 text-slate-400 text-[10px] px-2 py-1 rounded-lg font-bold">حالة حية</span>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-right" dir="rtl">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                  <tr>
                    <th className="px-6 py-4">المستخدم</th>
                    <th className="px-6 py-4">التخصص</th>
                    <th className="px-6 py-4">الإكمال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">
                            {user.profile.personalInfo.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{user.profile.personalInfo.fullName || 'بدون اسم'}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-600">
                        {user.profile.education[0]?.major || 'لم يحدد'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-[10px] font-black text-blue-600">{calculateCompletion(user.profile)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm animate-in slide-in-from-left-4 duration-300">
          <div className="mb-8 text-right">
            <h3 className="text-xl font-black text-slate-800">إضافة وظيفة جديدة</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">ستظهر هذه الوظيفة في قائمة "استكشف الفرص" للمستخدمين</p>
          </div>

          <form onSubmit={handleJobSubmit} className="space-y-5 text-right">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 mr-1">اسم الجهة (الشركة)</label>
              <input 
                type="text" 
                required
                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                placeholder="مثال: شركة علم"
                value={jobForm.company}
                onChange={e => setJobForm({...jobForm, company: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 mr-1">تاريخ الإعلان</label>
              <input 
                type="date" 
                required
                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                value={jobForm.date}
                onChange={e => setJobForm({...jobForm, date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 mr-1">محتوى الإعلان (الوصف)</label>
              <textarea 
                required
                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm font-bold min-h-[120px]"
                placeholder="اكتب تفاصيل الوظيفة هنا..."
                value={jobForm.content}
                onChange={e => setJobForm({...jobForm, content: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 mr-1">رابط التقديم</label>
              <input 
                type="url" 
                required
                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm font-bold text-left"
                placeholder="https://example.com/apply"
                dir="ltr"
                value={jobForm.link}
                onChange={e => setJobForm({...jobForm, link: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all mt-4"
            >
              نشر الوظيفة في المنصة 🚀
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
