
import React, { useState } from 'react';
import { UserProfile, AppStep } from '../types';

interface DashboardProps {
  profile: UserProfile;
  completion: number;
  missingItems: string[];
  onNavigate: (step: AppStep) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, completion, missingItems, onNavigate }) => {
  const userName = profile.personalInfo.fullName.split(' ')[0] || 'باحث عن عمل';
  const [showMissingModal, setShowMissingModal] = useState(false);

  const stats = [
    { label: 'مقابلات مجراة', value: '3', color: 'bg-green-500' },
    { label: 'تقديمات نشطة', value: '12', color: 'bg-blue-500' },
    { label: 'شهادات مضافة', value: '2', color: 'bg-amber-500' },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">أهلاً، {userName}! 👋</h1>
          <p className="text-slate-400 font-bold text-xs mt-0.5">مستعد لفرصتك القادمة؟</p>
        </div>
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[22px] shadow-lg shadow-blue-100 flex items-center justify-center text-white font-black text-xl border-4 border-white">
          {userName.charAt(0)}
        </div>
      </header>

      {/* Completion Card - Interactive */}
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
               اضغط لمعرفة ما يتبقى عليك
             </p>
             {missingItems.length > 0 && (
               <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-lg text-[9px] font-black border border-red-100">
                 {missingItems.length} مهام متبقية
               </span>
             )}
          </div>
        </div>
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-4 rounded-[24px] text-center border border-slate-50 shadow-sm">
            <div className={`text-xl font-black mb-1 text-slate-800`}>{s.value}</div>
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Services - Stacked Layout */}
      <section className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">خدمات تقديم المميزة</h2>
        <div className="space-y-3">
          {/* Virtual Interview */}
          <button 
            onClick={() => onNavigate(AppStep.INTERVIEW)}
            className="w-full bg-indigo-600 text-white p-6 rounded-[32px] flex items-center space-x-5 space-x-reverse shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <div className="bg-white/20 p-3.5 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="text-right">
              <span className="block font-black text-lg">مقابلة افتراضية</span>
              <span className="text-xs opacity-70 font-bold">تدريب ذكي يحاكي المقابلات الحقيقية</span>
            </div>
          </button>

          {/* CV Builder */}
          <button 
            onClick={() => onNavigate(AppStep.CV_BUILDER)}
            className="w-full bg-blue-500 text-white p-6 rounded-[32px] flex items-center space-x-5 space-x-reverse shadow-xl shadow-blue-100 hover:bg-blue-600 transition-all active:scale-[0.98]"
          >
            <div className="bg-white/20 p-3.5 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-right">
              <span className="block font-black text-lg">توليد سيرة ذاتية</span>
              <span className="text-xs opacity-70 font-bold">قوالب احترافية تدعم الفرز الآلي (ATS)</span>
            </div>
          </button>

          {/* Settings / Profile */}
          <button 
            onClick={() => onNavigate(AppStep.PROFILE)}
            className="w-full bg-slate-800 text-white p-6 rounded-[32px] flex items-center space-x-5 space-x-reverse shadow-xl shadow-slate-200 hover:bg-slate-900 transition-all active:scale-[0.98]"
          >
            <div className="bg-white/20 p-3.5 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37-1.724 1.724 0 00-1.065-2.572-1.756-.426-1.756-2.924 0-3.35 1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-right">
              <span className="block font-black text-lg">إعدادات الملف</span>
              <span className="text-xs opacity-70 font-bold">تحديث البيانات والروابط والاهتمامات</span>
            </div>
          </button>
        </div>
      </section>

      {/* Suggested Jobs */}
      <section className="pb-10">
        <div className="flex justify-between items-center mb-5 px-2">
          <h2 className="text-lg font-black text-slate-800">وظائف مقترحة</h2>
          <button onClick={() => onNavigate(AppStep.JOBS)} className="text-blue-600 text-[10px] font-black bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">عرض الكل</button>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-5 rounded-[28px] border border-slate-50 flex items-center space-x-4 space-x-reverse shadow-sm hover:border-blue-100 transition-all">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex-grow">
                <h4 className="font-black text-slate-800 text-sm leading-tight">{i === 1 ? 'محلل بيانات مالي' : 'مدير مشاريع تقنية'}</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{i === 1 ? 'شركة أرامكو السعودية' : 'مشروع نيوم'}</p>
              </div>
              <button onClick={() => onNavigate(AppStep.JOBS)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-100">
                تقديم
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Missing Items Modal */}
      {showMissingModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-10">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-slate-800">خطواتك المتبقية 🏁</h3>
               <button onClick={() => setShowMissingModal(false)} className="text-slate-300 hover:text-slate-500">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
            </div>
            
            <div className="space-y-3 mb-8">
              {missingItems.length > 0 ? (
                missingItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 space-x-reverse bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-5 h-5 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    </div>
                    <span className="text-xs font-black text-slate-600">{item}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <p className="font-black text-emerald-600">ملفك مكتمل بنسبة 100%!</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">أنت الآن في صدارة الباحثين عن عمل</p>
                </div>
              )}
            </div>

            {missingItems.length > 0 && (
              <button 
                onClick={() => { setShowMissingModal(false); onNavigate(AppStep.PROFILE); }} 
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                إكمال البيانات الآن
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
