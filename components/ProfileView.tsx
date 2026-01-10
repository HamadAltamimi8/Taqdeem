
import React, { useState } from 'react';
import { UserProfile, ExperienceEntry } from '../types';

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

  const isEditing = (section: string) => editingSection === section;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 text-right pb-32" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800">الملف الشخصي</h2>
        <button onClick={onBack} className="p-2 bg-white rounded-xl border shadow-sm">
          <svg className="w-5 h-5 text-slate-600 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* المسميات الوظيفية */}
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-black text-slate-800">المسميات الوظيفية المستهدفة</h4>
          {!isEditing('titles') ? (
            <button onClick={() => setEditingSection('titles')} className="text-xs font-black text-blue-600">تعديل</button>
          ) : (
            <button onClick={handleSave} className="text-xs font-black text-emerald-600">حفظ</button>
          )}
        </div>
        
        {isEditing('titles') ? (
          <div className="space-y-3">
             <input type="text" placeholder="أضف مسمى واضغط Enter" className="w-full p-3 rounded-xl border text-sm" 
               onKeyPress={e => {
                 if (e.key === 'Enter') {
                   const val = (e.target as HTMLInputElement).value.trim();
                   if (val && !tempData.jobInterests.titles.includes(val)) {
                     setTempData({...tempData, jobInterests: {...tempData.jobInterests, titles: [...tempData.jobInterests.titles, val]}});
                     (e.target as HTMLInputElement).value = '';
                   }
                 }
               }}
             />
             <div className="flex flex-wrap gap-2">
               {tempData.jobInterests.titles.map(t => (
                 <span key={t} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                   <button onClick={() => setTempData({...tempData, jobInterests: {...tempData.jobInterests, titles: tempData.jobInterests.titles.filter(i => i !== t)}})} className="ml-1">×</button>
                   {t}
                 </span>
               ))}
             </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.jobInterests.titles.length > 0 ? (
              profile.jobInterests.titles.map(t => <span key={t} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{t}</span>)
            ) : (
              <span className="text-xs text-red-500 font-bold italic">يرجى إضافة المسميات الوظيفية</span>
            )}
          </div>
        )}
      </div>

      {/* الخبرات العملية */}
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-black text-slate-800">الخبرات العملية</h4>
          <button onClick={() => setEditingSection('experience')} className="text-xs font-black text-blue-600">إدارة</button>
        </div>
        {profile.experience.list.map(exp => (
          <div key={exp.id} className="border-b last:border-0 pb-2">
            <p className="text-sm font-black text-slate-800">{exp.lastTitle}</p>
            <p className="text-[10px] text-slate-400">{exp.company} • {exp.isCurrent ? 'حتى الآن' : exp.periodTo}</p>
          </div>
        ))}
      </div>

      <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-5 rounded-[24px] font-black border border-red-100">تسجيل الخروج</button>
    </div>
  );
};

export default ProfileView;
