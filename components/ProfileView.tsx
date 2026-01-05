
import React, { useState } from 'react';
import { UserProfile, ExperienceEntry, Certification } from '../types';
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

  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: Date.now().toString(),
      lastTitle: '',
      company: '',
      periodFrom: '',
      periodTo: '',
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

  const addCertification = () => {
    const newCert: Certification = {
      name: '',
      issuer: '',
      date: new Date().toISOString().split('T')[0]
    };
    setTempData({
      ...tempData,
      certifications: {
        ...tempData.certifications,
        list: [newCert, ...tempData.certifications.list]
      }
    });
  };

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
    <div className="p-6 space-y-6 animate-in fade-in duration-500 text-right pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-row-reverse">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button onClick={onBack} className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">الملف الشخصي</h2>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center py-6">
        <div className="relative group">
          <div className="w-28 h-28 bg-blue-50 rounded-[40px] border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black text-blue-600 overflow-hidden">
            {profile.personalInfo.fullName ? profile.personalInfo.fullName.charAt(0) : 'U'}
          </div>
        </div>
        <h3 className="mt-6 text-2xl font-black text-slate-800">{profile.personalInfo.fullName || 'باحث عن عمل'}</h3>
        <p className="text-slate-400 font-bold text-sm mt-1">{profile.personalInfo.email || 'البريد الإلكتروني غير مضاف'}</p>
        
        <button 
          onClick={exportData}
          className="mt-4 text-[8px] text-slate-300 font-bold tracking-widest hover:text-slate-500 uppercase"
        >
          تصدير البيانات (JSON)
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. المعلومات الشخصية */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4 flex-row-reverse">
            <h4 className="font-black text-slate-800 flex items-center flex-row-reverse">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-2"></span>
              المعلومات الشخصية
            </h4>
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
                  <span className="text-slate-400 text-xs font-bold uppercase">الجنسية</span>
                  <span className="text-slate-700 text-sm font-black">{profile.personalInfo.nationality}</span>
                </div>
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-slate-400 text-xs font-bold uppercase">المدينة</span>
                  <span className="text-slate-700 text-sm font-black">{profile.personalInfo.city || '—'}</span>
                </div>
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-slate-400 text-xs font-bold uppercase">رقم الجوال</span>
                  <span className="text-slate-700 text-sm font-black" dir="ltr">{profile.personalInfo.phone || '—'}</span>
                </div>
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-slate-400 text-xs font-bold uppercase">تاريخ الميلاد</span>
                  <span className="text-slate-700 text-sm font-black">{profile.personalInfo.birthDate || '—'}</span>
                </div>
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-slate-400 text-xs font-bold uppercase">الجنس</span>
                  <span className="text-slate-700 text-sm font-black">{profile.personalInfo.gender || '—'}</span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <input type="text" value={tempData.personalInfo.fullName} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, fullName: e.target.value}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-right" placeholder="الاسم الكامل" />
                <select value={tempData.personalInfo.nationality} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, nationality: e.target.value}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-right">
                  {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <input type="text" value={tempData.personalInfo.city} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, city: e.target.value}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-right" placeholder="المدينة" />
                <input type="tel" value={tempData.personalInfo.phone} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, phone: e.target.value}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-left" placeholder="رقم الجوال" dir="ltr" />
                <input type="date" value={tempData.personalInfo.birthDate} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, birthDate: e.target.value}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-right" />
                <select value={tempData.personalInfo.gender} onChange={e => setTempData({...tempData, personalInfo: {...tempData.personalInfo, gender: e.target.value as any}})} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-right">
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 2. المؤهلات التعليمية (قسم منفصل) */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4 flex-row-reverse">
            <h4 className="font-black text-slate-800 flex items-center flex-row-reverse">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-2"></span>
              المؤهلات التعليمية
            </h4>
            {!isEditing('education') ? (
              <button onClick={() => setEditingSection('education')} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">تعديل</button>
            ) : (
              <div className="flex space-x-2 space-x-reverse">
                <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl ml-2">حفظ</button>
                <button onClick={handleCancel} className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">إلغاء</button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {isEditing('education') ? (
              tempData.education.map((edu, idx) => (
                <div key={edu.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative">
                  <select value={edu.degree} onChange={e => setTempData({...tempData, education: tempData.education.map((item, i) => i === idx ? {...item, degree: e.target.value} : item)})} className="w-full p-3 rounded-lg border border-slate-200 text-xs font-bold text-right">
                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" value={edu.major} onChange={e => setTempData({...tempData, education: tempData.education.map((item, i) => i === idx ? {...item, major: e.target.value} : item)})} className="w-full p-3 rounded-lg border border-slate-200 text-xs font-bold text-right" placeholder="التخصص الدراسي" />
                  <input type="text" value={edu.university} onChange={e => setTempData({...tempData, education: tempData.education.map((item, i) => i === idx ? {...item, university: e.target.value} : item)})} className="w-full p-3 rounded-lg border border-slate-200 text-xs font-bold text-right" placeholder="اسم الجامعة أو المعهد" />
                </div>
              ))
            ) : (
              profile.education.length > 0 ? (
                profile.education.map(edu => (
                  <div key={edu.id} className="flex justify-between items-start flex-row-reverse border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">{edu.degree} في {edu.major}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">{edu.university}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-300 font-bold text-center py-4">لم يتم إضافة مؤهلات تعليمية</p>
              )
            )}
          </div>
        </div>

        {/* 3. الخبرات العملية (قسم منفصل) */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4 flex-row-reverse">
            <h4 className="font-black text-slate-800 flex items-center flex-row-reverse">
              <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-2"></span>
              الخبرات العملية
            </h4>
            {!isEditing('experience') ? (
              <button onClick={() => setEditingSection('experience')} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">تعديل</button>
            ) : (
              <div className="flex space-x-2 space-x-reverse">
                <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl ml-2">حفظ</button>
                <button onClick={handleCancel} className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">إلغاء</button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-row-reverse mb-2">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">تاريخك المهني</p>
              {isEditing('experience') && (
                <button onClick={addExperience} className="text-[10px] font-black text-blue-600 flex items-center">
                   <span>إضافة خبرة جديدة</span>
                   <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                </button>
              )}
            </div>

            {isEditing('experience') ? (
              tempData.experience.list.map((exp, idx) => (
                <div key={exp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative">
                  <input type="text" value={exp.lastTitle} onChange={e => setTempData({...tempData, experience: {...tempData.experience, list: tempData.experience.list.map((item, i) => i === idx ? {...item, lastTitle: e.target.value} : item)}})} className="w-full p-3 rounded-lg border border-slate-200 text-xs font-bold text-right" placeholder="المسمى الوظيفي" />
                  <input type="text" value={exp.company} onChange={e => setTempData({...tempData, experience: {...tempData.experience, list: tempData.experience.list.map((item, i) => i === idx ? {...item, company: e.target.value} : item)}})} className="w-full p-3 rounded-lg border border-slate-200 text-xs font-bold text-right" placeholder="اسم الشركة" />
                </div>
              ))
            ) : (
              profile.experience.list.length > 0 ? (
                profile.experience.list.map(exp => (
                  <div key={exp.id} className="flex justify-between items-start flex-row-reverse border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">{exp.lastTitle}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">{exp.company}</p>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                   <p className="text-[11px] text-slate-400 font-bold">لا توجد خبرات مسجلة حالياً</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* 4. الشهادات الاحترافية */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4 flex-row-reverse">
            <h4 className="font-black text-slate-800 flex items-center flex-row-reverse">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full mr-2"></span>
              الشهادات الاحترافية
            </h4>
            {!isEditing('certs') ? (
              <button onClick={() => setEditingSection('certs')} className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">تعديل</button>
            ) : (
              <div className="flex space-x-2 space-x-reverse">
                <button onClick={handleSave} className="text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-xl ml-2">حفظ</button>
                <button onClick={handleCancel} className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">إلغاء</button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-row-reverse mb-2">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">إنجازاتك</p>
              {isEditing('certs') && (
                <button onClick={addCertification} className="text-[10px] font-black text-blue-600 flex items-center">
                   <span>إضافة شهادة جديدة</span>
                   <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                </button>
              )}
            </div>

            {isEditing('certs') ? (
              tempData.certifications.list.map((cert, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <input type="text" value={cert.name} onChange={e => setTempData({...tempData, certifications: {...tempData.certifications, list: tempData.certifications.list.map((item, i) => i === idx ? {...item, name: e.target.value} : item)}})} className="w-full p-3 rounded-lg border border-slate-200 text-xs font-bold text-right" placeholder="اسم الشهادة" />
                  <input type="text" value={cert.issuer} onChange={e => setTempData({...tempData, certifications: {...tempData.certifications, list: tempData.certifications.list.map((item, i) => i === idx ? {...item, issuer: e.target.value} : item)}})} className="w-full p-3 rounded-lg border border-slate-200 text-xs font-bold text-right" placeholder="جهة الإصدار" />
                </div>
              ))
            ) : (
              profile.certifications.list.length > 0 ? (
                profile.certifications.list.map((cert, idx) => (
                  <div key={idx} className="flex justify-between items-start flex-row-reverse border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">{cert.name}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">{cert.issuer}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-300 font-bold text-center py-4">لم تقم بإضافة شهادات احترافية</p>
              )
            )}
          </div>
        </div>

        <button 
          className="w-full bg-red-50 text-red-600 py-5 rounded-[24px] font-black mt-10 border border-red-100 active:scale-95 transition-all text-sm shadow-sm"
          onClick={onLogout}
        >
          تسجيل الخروج من الحساب
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
