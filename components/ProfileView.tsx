
import React, { useState } from 'react';
import { UserProfile, ExperienceEntry, EducationEntry } from '../types';
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

  const SectionHeader = ({ title, sectionId }: { title: string, sectionId: string }) => (
    <div className="flex justify-between items-center mb-4 border-b pb-2">
      <h4 className="font-black text-slate-800">{title}</h4>
      {editingSection === sectionId ? (
        <button onClick={handleSave} className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">حفظ التغييرات</button>
      ) : (
        <button onClick={() => { setTempData(profile); setEditingSection(sectionId); }} className="text-xs font-black text-blue-600">تعديل</button>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 text-right pb-32" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800">الملف الشخصي</h2>
        <button onClick={onBack} className="p-2 bg-white rounded-xl border shadow-sm">
          <svg className="w-5 h-5 text-slate-600 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* المعلومات الأساسية */}
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <SectionHeader title="المعلومات الشخصية" sectionId="personal" />
        {editingSection === 'personal' ? (
          <div className="space-y-3">
            <input type="text" value={tempData.personalInfo.fullName} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, fullName: e.target.value}})} className="w-full p-3 rounded-xl border text-sm" placeholder="الاسم الكامل" />
            <input type="text" value={tempData.personalInfo.phone} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, phone: e.target.value}})} className="w-full p-3 rounded-xl border text-sm" placeholder="رقم الجوال" />
            <input type="text" value={tempData.personalInfo.city} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, city: e.target.value}})} className="w-full p-3 rounded-xl border text-sm" placeholder="المدينة" />
            <select value={tempData.personalInfo.nationality} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, nationality: e.target.value}})} className="w-full p-3 rounded-xl border text-sm">
              {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><span className="text-slate-400 block">الاسم:</span> <span className="font-bold">{profile.personalInfo.fullName}</span></div>
            <div><span className="text-slate-400 block">الجوال:</span> <span className="font-bold" dir="ltr">{profile.personalInfo.phone}</span></div>
            <div><span className="text-slate-400 block">المدينة:</span> <span className="font-bold">{profile.personalInfo.city}</span></div>
            <div><span className="text-slate-400 block">الجنسية:</span> <span className="font-bold">{profile.personalInfo.nationality}</span></div>
          </div>
        )}
      </div>

      {/* التعليم */}
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <SectionHeader title="المؤهلات التعليمية" sectionId="education" />
        {editingSection === 'education' ? (
          <div className="space-y-4">
            {tempData.education.map((edu, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-2">
                <select value={edu.degree} onChange={e => {
                  const newList = [...tempData.education];
                  newList[idx].degree = e.target.value;
                  setTempData({...tempData, education: newList});
                }} className="w-full p-2 rounded-lg border text-xs">
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" value={edu.major} onChange={e => {
                  const newList = [...tempData.education];
                  newList[idx].major = e.target.value;
                  setTempData({...tempData, education: newList});
                }} className="w-full p-2 rounded-lg border text-xs" placeholder="التخصص" />
                <input type="text" value={edu.university} onChange={e => {
                  const newList = [...tempData.education];
                  newList[idx].university = e.target.value;
                  setTempData({...tempData, education: newList});
                }} className="w-full p-2 rounded-lg border text-xs" placeholder="الجامعة" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm font-black">{edu.degree} - {edu.major}</p>
                  <p className="text-[10px] text-slate-500">{edu.university}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* المسميات الوظيفية */}
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <SectionHeader title="المسميات الوظيفية المستهدفة" sectionId="titles" />
        {editingSection === 'titles' ? (
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
            {profile.jobInterests.titles.map(t => <span key={t} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{t}</span>)}
          </div>
        )}
      </div>

      {/* الخبرات العملية */}
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <SectionHeader title="الخبرات العملية" sectionId="experience" />
        {profile.experience.list.map(exp => (
          <div key={exp.id} className="border-b last:border-0 pb-2">
            <p className="text-sm font-black text-slate-800">{exp.lastTitle}</p>
            <p className="text-[10px] text-slate-400">{exp.company} • {exp.isCurrent ? 'حتى الآن' : exp.periodTo}</p>
          </div>
        ))}
        {!profile.experience.hasExperience && <p className="text-xs text-slate-400 italic">لا توجد خبرات مسجلة</p>}
      </div>

      {/* الشهادات الاحترافية */}
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <SectionHeader title="الشهادات الاحترافية" sectionId="certs" />
        <div className="space-y-2">
          {profile.certifications.list.map((cert, idx) => (
            <div key={idx} className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <p className="text-xs font-black text-emerald-800">{cert.name}</p>
              <p className="text-[10px] text-emerald-600">{cert.issuer}</p>
            </div>
          ))}
          {profile.certifications.list.length === 0 && <p className="text-xs text-slate-400 italic">لم يتم إرفاق شهادات</p>}
        </div>
      </div>

      <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-5 rounded-[24px] font-black border border-red-100">تسجيل الخروج</button>
    </div>
  );
};

export default ProfileView;
