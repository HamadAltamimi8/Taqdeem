
import React, { useState } from 'react';
import { UserProfile, RecruiterProfile } from '../types';
import { INITIAL_PROFILE } from '../constants';

interface OnboardingProps {
  role: 'user' | 'recruiter' | 'admin';
  onComplete: (data: UserProfile | RecruiterProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ role, onComplete }) => {
  const [recData, setRecData] = useState<RecruiterProfile>({
    companyName: '',
    responsibleName: '',
    phone: '',
    jobTitle: '',
    email: ''
  });

  const [userData, setUserData] = useState<UserProfile>(INITIAL_PROFILE);

  const handleFinishRecruiter = () => {
    if (!recData.companyName || !recData.responsibleName || !recData.phone) {
      alert("يرجى تعبئة كافة الحقول الأساسية");
      return;
    }
    onComplete(recData);
  };

  const handleFinishUser = () => {
    if (!userData.personalInfo.fullName || !userData.personalInfo.phone) {
      alert("يرجى تعبئة الاسم ورقم الجوال");
      return;
    }
    onComplete(userData);
  };

  if (role === 'recruiter') {
    return (
      <div className="p-6 text-right animate-in fade-in duration-500" dir="rtl">
        <header className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">بيانات المعلن 🏢</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">أكمل ملفك لتبدأ بنشر الفرص الوظيفية</p>
        </header>

        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 mr-1">اسم الشركة</label>
            <input type="text" placeholder="مثال: شركة تقديم المحدودة" className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold" value={recData.companyName} onChange={e => setRecData({...recData, companyName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 mr-1">اسم المسؤول عن الشواغر</label>
            <input type="text" placeholder="الاسم الكامل للمسؤول" className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold" value={recData.responsibleName} onChange={e => setRecData({...recData, responsibleName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 mr-1">رقم جوال المسؤول</label>
            <input type="tel" placeholder="05XXXXXXXX" className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold text-left" dir="ltr" value={recData.phone} onChange={e => setRecData({...recData, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 mr-1">المسمى الوظيفي للمسؤول</label>
            <input type="text" placeholder="مثال: مدير الموارد البشرية" className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold" value={recData.jobTitle} onChange={e => setRecData({...recData, jobTitle: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 mr-1">إيميل المسؤول (للتواصل)</label>
            <input type="email" placeholder="hr@company.com" className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold text-left" dir="ltr" value={recData.email} onChange={e => setRecData({...recData, email: e.target.value})} />
          </div>
        </div>

        <button onClick={handleFinishRecruiter} className="w-full bg-blue-600 text-white font-black py-5 rounded-[28px] mt-10 shadow-xl shadow-blue-100 active:scale-95 transition-all">إتمام التسجيل وبدء الإعلان 🚀</button>
      </div>
    );
  }

  return (
    <div className="p-6 text-right animate-in fade-in duration-500" dir="rtl">
       <header className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">بيانات الباحث 👤</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">أهلاً بك، أخبرنا القليل عنك لنساعدك</p>
       </header>
       <div className="space-y-5">
          <input type="text" placeholder="الاسم الكامل" className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold" value={userData.personalInfo.fullName} onChange={e => setUserData({...userData, personalInfo: {...userData.personalInfo, fullName: e.target.value}})} />
          <input type="tel" placeholder="رقم الجوال" className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 font-bold text-left" dir="ltr" value={userData.personalInfo.phone} onChange={e => setUserData({...userData, personalInfo: {...userData.personalInfo, phone: e.target.value}})} />
          <select className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none font-bold bg-white" value={userData.personalInfo.city} onChange={e => setUserData({...userData, personalInfo: {...userData.personalInfo, city: e.target.value}})}>
             <option value="">اختر المدينة</option>
             <option value="الرياض">الرياض</option>
             <option value="جدة">جدة</option>
             <option value="الدمام">الدمام</option>
          </select>
       </div>
       <button onClick={handleFinishUser} className="w-full bg-blue-600 text-white font-black py-5 rounded-[28px] mt-10 shadow-xl shadow-blue-100 active:scale-95 transition-all">بدء رحلة البحث 🔍</button>
    </div>
  );
};

export default Onboarding;
