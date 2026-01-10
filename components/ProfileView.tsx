
import React, { useState } from 'react';
import { UserProfile, ExperienceEntry, Certification } from '../types';
import { DEGREES, NATIONALITIES } from '../constants';

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

  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: Date.now().toString(),
      lastTitle: '',
      company: '',
      periodFrom: '',
      periodTo: '',
      isCurrent: false,
      tasks: ''
    };
    setTempData({
      ...tempData,
      experience: {
        ...tempData.experience,
        list: [newExp, ...tempData.experience.list]
      }
    });
  };

  const isEditing = (section: string) => editingSection === section;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 text-right pb-32">
      <div className="flex items-center justify-between mb-6 flex-row-reverse">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button onClick={onBack} className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm"><svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
          <h2 className="text-2xl font-black text-slate-800">الملف الشخصي</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* معلومات شخصية */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 flex-row-reverse">
            <h4 className="font-black text-slate-800">المعلومات الشخصية</h4>
            {!isEditing('personal') ? (
              <button onClick={() => setEditingSection('personal')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">تعديل</button>
            ) : (
              <div className="flex space-x-2 space-x-reverse">
                <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl ml-2">حفظ</button>
                <button onClick={handleCancel} className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">إلغاء</button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {!isEditing('personal') ? (
              <>
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-slate-400 text-xs font-bold">الاسم الكامل</span>
                  <span className="text-slate-700 text-sm font-black">{profile.personalInfo.fullName}</span>
                </div>
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-slate-400 text-xs font-bold">رقم الجوال</span>
                  <span className="text-slate-700 text-sm font-black" dir="ltr">+966 {profile.personalInfo.phone}</span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <input type="text" value={tempData.personalInfo.fullName} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, fullName: e.target.value}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-right" placeholder="الاسم الكامل" />
                <input type="tel" value={tempData.personalInfo.phone} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, phone: e.target.value}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-left" placeholder="5XXXXXXXX" dir="ltr" />
              </div>
            )}
          </div>
        </div>

        {/* المسميات الوظيفية المستهدفة */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 flex-row-reverse">
            <h4 className="font-black text-slate-800">المسميات الوظيفية المستهدفة</h4>
            {!isEditing('interests') ? (
              <button onClick={() => setEditingSection('interests')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">تعديل</button>
            ) : (
              <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl">حفظ</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {!isEditing('interests') ? (
              profile.jobInterests.titles.map(t => <span key={t} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold">{t}</span>)
            ) : (
              <div className="w-full space-y-3">
                <input 
                  type="text" 
                  placeholder="أضف مسمى وظيفي واضغط Enter" 
                  className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-right"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !tempData.jobInterests.titles.includes(val)) {
                        setTempData({...tempData, jobInterests: {...tempData.jobInterests, titles: [...tempData.jobInterests.titles, val]}});
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 justify-end">
                  {tempData.jobInterests.titles.map(t => (
                    <span key={t} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center">
                      <button onClick={() => setTempData({...tempData, jobInterests: {...tempData.jobInterests, titles: tempData.jobInterests.titles.filter(i => i !== t)}})} className="ml-2">×</button>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الخبرات العملية */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 flex-row-reverse">
            <h4 className="font-black text-slate-800">الخبرات العملية</h4>
            {!isEditing('experience') ? (
              <button onClick={() => setEditingSection('experience')} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">تعديل</button>
            ) : (
              <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl">حفظ</button>
            )}
          </div>
          <div className="space-y-4">
            {isEditing('experience') ? (
              <>
                <button onClick={addExperience} className="w-full py-2 border border-dashed border-blue-300 rounded-xl text-blue-600 text-xs font-bold">+ إضافة خبرة</button>
                {tempData.experience.list.map((exp, idx) => (
                  <div key={exp.id} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                    <input type="text" value={exp.lastTitle} onChange={e => setTempData({...tempData, experience: {...tempData.experience, list: tempData.experience.list.map((item, i) => i === idx ? {...item, lastTitle: e.target.value} : item)}})} className="w-full p-2 rounded-lg border text-xs" placeholder="المسمى" />
                    <div className="flex items-center space-x-2 space-x-reverse text-right">
                      <input type="checkbox" checked={exp.isCurrent} onChange={e => setTempData({...tempData, experience: {...tempData.experience, list: tempData.experience.list.map((item, i) => i === idx ? {...item, isCurrent: e.target.checked} : item)}})} />
                      <label className="text-[10px] font-bold text-slate-500">أعمل هنا حالياً</label>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              profile.experience.list.map(exp => (
                <div key={exp.id} className="border-b border-slate-50 pb-2 last:border-0">
                  <p className="text-sm font-black text-slate-800">{exp.lastTitle}</p>
                  <p className="text-[10px] text-slate-400">{exp.company} • {exp.isCurrent ? 'إلى الآن' : exp.periodTo}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <button 
          className="w-full bg-red-50 text-red-600 py-5 rounded-[24px] font-black mt-10 border border-red-100"
          onClick={onLogout}
        >
          تسجيل الخروج من الحساب
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
