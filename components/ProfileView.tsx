
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DEGREES, NATIONALITIES, START_DATES } from '../constants';

interface ProfileViewProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, setProfile, onBack, onLogout }) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<UserProfile>(profile);

  const handleSave = () => {
    setProfile(tempData);
    setEditingSection(null);
  };

  const handleCancel = () => {
    setTempData(profile);
    setEditingSection(null);
  };

  // وظيفة تصدير البيانات للمطور
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `user_profile_${profile.personalInfo.fullName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const isEditing = (section: string) => editingSection === section;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <button onClick={onBack} className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">الملف الشخصي</h2>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative group">
          <div className="w-28 h-28 bg-blue-50 rounded-[40px] border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black text-blue-600 overflow-hidden">
            {profile.personalInfo.fullName ? profile.personalInfo.fullName.charAt(0) : 'U'}
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl border-4 border-white shadow-xl hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        <h3 className="mt-6 text-2xl font-black text-slate-800">{profile.personalInfo.fullName || 'باحث عن عمل'}</h3>
        <p className="text-slate-400 font-bold text-sm">{profile.personalInfo.email || 'البريد الإلكتروني غير مضاف'}</p>
        
        {/* زر سري للمطور لتصدير البيانات كملف JSON */}
        <button 
          onClick={exportData}
          className="mt-2 text-[8px] text-slate-300 font-bold tracking-widest hover:text-slate-500 uppercase"
        >
          Export Data for Dev (JSON)
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative transition-all">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
            <h4 className="font-black text-slate-800 flex items-center">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full ml-2"></span>
              المعلومات الشخصية
            </h4>
            {!isEditing('personal') ? (
              <button 
                onClick={() => setEditingSection('personal')}
                className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
              >
                تعديل البيانات
              </button>
            ) : (
              <div className="flex space-x-2 space-x-reverse">
                <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl">حفظ</button>
                <button onClick={handleCancel} className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">إلغاء</button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {!isEditing('personal') ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">الجنسية</span>
                  <span className="text-blue-600 text-xs font-black bg-blue-50 px-2 py-1 rounded-lg">{profile.personalInfo.nationality}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">رقم الجوال</span>
                  <span className="text-slate-700 text-sm font-black" dir="ltr">{profile.personalInfo.phone || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">المدينة</span>
                  <span className="text-slate-700 text-sm font-black">{profile.personalInfo.city || '—'}</span>
                </div>
              </>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <input 
                  type="text" 
                  value={tempData.personalInfo.fullName}
                  onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, fullName: e.target.value}})}
                  className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none focus:border-blue-500"
                  placeholder="الاسم الكامل"
                />
                <select 
                  value={tempData.personalInfo.nationality}
                  onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, nationality: e.target.value}})}
                  className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none"
                >
                  {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <input 
                  type="tel" 
                  value={tempData.personalInfo.phone}
                  onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, phone: e.target.value}})}
                  className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none text-left"
                  placeholder="رقم الجوال"
                />
                <input 
                  type="text" 
                  value={tempData.personalInfo.city}
                  onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, city: e.target.value}})}
                  className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none"
                  placeholder="المدينة"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
            <h4 className="font-black text-slate-800 flex items-center">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full ml-2"></span>
              التعليم والخبرة
            </h4>
            {!isEditing('education') ? (
              <button 
                onClick={() => setEditingSection('education')}
                className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100"
              >
                تعديل
              </button>
            ) : (
              <div className="flex space-x-2 space-x-reverse">
                <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl">حفظ</button>
                <button onClick={handleCancel} className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">إلغاء</button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {!isEditing('education') ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold">أعلى مؤهل</span>
                  <span className="text-slate-700 text-sm font-black">{profile.education[0]?.degree}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold">التخصص</span>
                  <span className="text-slate-700 text-sm font-black">{profile.education[0]?.major || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold">سنوات الخبرة</span>
                  <span className="text-slate-700 text-sm font-black">{profile.experience.hasExperience ? `${profile.experience.years} سنوات` : 'لا يوجد'}</span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <select 
                  value={tempData.education[0]?.degree}
                  onChange={e => setTempData({...tempData, education: tempData.education.map((edu, idx) => idx === 0 ? {...edu, degree: e.target.value} : edu)})}
                  className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none"
                >
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input 
                  type="text" 
                  value={tempData.education[0]?.major}
                  onChange={e => setTempData({...tempData, education: tempData.education.map((edu, idx) => idx === 0 ? {...edu, major: e.target.value} : edu)})}
                  className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none"
                  placeholder="التخصص"
                />
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-600">لديك خبرة سابقة؟</span>
                  <button 
                    onClick={() => setTempData({...tempData, experience: {...tempData.experience, hasExperience: !tempData.experience.hasExperience}})}
                    className={`w-10 h-5 rounded-full relative transition-colors ${tempData.experience.hasExperience ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${tempData.experience.hasExperience ? 'left-0.5' : 'left-5.5'}`}></div>
                  </button>
                </div>
                {tempData.experience.hasExperience && (
                  <input 
                    type="number" 
                    value={tempData.experience.years}
                    onChange={e => setTempData({...tempData, experience: {...tempData.experience, years: e.target.value}})}
                    className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none"
                    placeholder="عدد سنوات الخبرة"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <button 
          className="w-full bg-red-50 text-red-600 py-5 rounded-[24px] font-black mt-8 border border-red-100 active:scale-95 transition-all text-sm tracking-wide shadow-sm"
          onClick={onLogout}
        >
          تسجيل الخروج من الحساب
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
