
import React, { useState } from 'react';
import { UserProfile, Certification, ExperienceEntry, EducationEntry } from '../types';
import { 
  INITIAL_PROFILE, 
  DEGREES, 
  ENGLISH_LEVELS, 
  NATIONALITIES, 
  START_DATES, 
  COMMON_SKILLS, 
  COMMON_JOB_TITLES
} from '../constants';

interface OnboardingProps {
  onComplete: (data: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>(INITIAL_PROFILE);
  const [newCert, setNewCert] = useState<Certification>({ name: '', issuer: '', date: '', image: '' });
  const [certFileAttached, setCertFileAttached] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customSkill, setCustomSkill] = useState('');

  const totalSteps = 7;

  const handleNext = () => {
    // التحقق من إرفاق الوثائق في خطوة التعليم
    if (currentStep === 2) {
      const allDocsAttached = formData.education.every(edu => edu.documentAttached);
      if (!allDocsAttached) {
        alert("يرجى إرفاق وثيقة التخرج لكل مؤهل تعليمي مضاف.");
        return;
      }
    }

    if (currentStep < totalSteps) setCurrentStep(c => c + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  // وظائف التعليم الجديد
  const addEducation = () => {
    const newEdu: EducationEntry = {
      id: Date.now().toString(),
      degree: 'بكالوريوس',
      major: '',
      university: '',
      gradYear: '',
      documentAttached: false
    };
    setFormData({ ...formData, education: [...formData.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: any) => {
    setFormData({
      ...formData,
      education: formData.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const removeEducation = (id: string) => {
    if (formData.education.length > 1) {
      setFormData({
        ...formData,
        education: formData.education.filter(edu => edu.id !== id)
      });
    }
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
    setFormData({
      ...formData,
      experience: {
        ...formData.experience,
        list: [...formData.experience.list, newExp]
      }
    });
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    setFormData({
      ...formData,
      experience: {
        ...formData.experience,
        list: formData.experience.list.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
      }
    });
  };

  const removeExperience = (id: string) => {
    setFormData({
      ...formData,
      experience: {
        ...formData.experience,
        list: formData.experience.list.filter(exp => exp.id !== id)
      }
    });
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !formData.skills.technical.includes(skill)) {
      setFormData({
        ...formData,
        skills: {
          ...formData.skills,
          technical: [...formData.skills.technical, skill]
        }
      });
      setCustomSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        technical: formData.skills.technical.filter(s => s !== skill)
      }
    });
  };

  const handleAddCustomJob = () => {
    const title = customJobTitle.trim();
    if (title && !formData.jobInterests.titles.includes(title)) {
      if (formData.jobInterests.titles.length < 3) {
        setFormData({
          ...formData,
          jobInterests: {
            ...formData.jobInterests,
            titles: [...formData.jobInterests.titles, title]
          }
        });
        setCustomJobTitle('');
      } else {
        alert("يمكنك اختيار حتى 3 وظائف فقط");
      }
    }
  };

  return (
    <div className="p-6 pb-36">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800">إكمال الملف الشخصي</h2>
          <p className="text-xs text-slate-500 font-bold">خطوات بسيطة نحو وظيفتك القادمة</p>
        </div>
        <div className="text-left">
          <span className="text-blue-600 font-black text-lg">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full mb-8">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-sm shadow-blue-200"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>

      <div className="space-y-6">
        {currentStep === 1 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="الاسم الكامل" value={formData.personalInfo.fullName} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, fullName: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none" />
              <div className="flex gap-2">
                <select value={formData.personalInfo.gender} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, gender: e.target.value as any } })} className="w-1/3 p-4 rounded-2xl border-2 border-slate-100 outline-none font-bold">
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
                <input type="date" value={formData.personalInfo.birthDate} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, birthDate: e.target.value } })} className="w-2/3 p-4 rounded-2xl border-2 border-slate-100 outline-none text-xs" />
              </div>
              <select value={formData.personalInfo.nationality} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, nationality: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none">
                {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <input type="text" placeholder="المدينة الحالية" value={formData.personalInfo.city} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, city: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
              <input type="tel" placeholder="رقم الجوال" value={formData.personalInfo.phone} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, phone: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none text-left" dir="ltr" />
              <input type="email" placeholder="البريد الإلكتروني" value={formData.personalInfo.email} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, email: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none text-left" dir="ltr" />
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">المستوى التعليمي</h3>
            
            {formData.education.map((edu, index) => (
              <div key={edu.id} className="p-5 bg-white rounded-3xl border-2 border-slate-100 space-y-4 relative animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">المؤهل {index + 1}</span>
                  {formData.education.length > 1 && (
                    <button onClick={() => removeEducation(edu.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
                
                <select value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none">
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" placeholder="التخصص الدراسي" value={edu.major} onChange={e => updateEducation(edu.id, 'major', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                <input type="text" placeholder="اسم الجامعة أو المعهد" value={edu.university} onChange={e => updateEducation(edu.id, 'university', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 mr-1 flex items-center">
                     إرفاق وثيقة التخرج <span className="text-red-500 mr-1">* إجباري</span>
                   </label>
                   <button 
                    onClick={() => updateEducation(edu.id, 'documentAttached', true)} 
                    className={`w-full p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${edu.documentAttached ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                   >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    <span className="text-xs font-bold">{edu.documentAttached ? 'تم إرفاق الوثيقة ✓' : 'اضغط لرفع الوثيقة (PDF/Image)'}</span>
                   </button>
                </div>
              </div>
            ))}

            <button 
              onClick={addEducation}
              className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 space-x-reverse hover:bg-blue-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              <span>إضافة مؤهل تعليمي آخر</span>
            </button>
          </section>
        )}

        {currentStep === 3 && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">الخبرات العملية</h3>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100">
              <span className="text-slate-700 font-bold">هل لديك خبرة عمل سابقة؟</span>
              <button 
                onClick={() => {
                  const hasExp = !formData.experience.hasExperience;
                  setFormData({...formData, experience: {...formData.experience, hasExperience: hasExp, list: hasExp ? [{id: '1', lastTitle: '', company: '', periodFrom: '', periodTo: '', tasks: ''}] : []}});
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.experience.hasExperience ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.experience.hasExperience ? 'left-1' : 'left-7'}`}></div>
              </button>
            </div>
            
            {formData.experience.hasExperience && (
              <div className="space-y-6">
                {formData.experience.list.map((exp, index) => (
                  <div key={exp.id} className="p-5 bg-white rounded-3xl border-2 border-slate-50 shadow-sm space-y-4 relative animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">الخبرة {index + 1}</span>
                      {formData.experience.list.length > 1 && (
                        <button onClick={() => removeExperience(exp.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                    <input type="text" placeholder="المسمى الوظيفي" value={exp.lastTitle} onChange={e => updateExperience(exp.id, 'lastTitle', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                    <input type="text" placeholder="اسم الشركة" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={exp.periodFrom} onChange={e => updateExperience(exp.id, 'periodFrom', e.target.value)} className="w-full p-3 rounded-2xl border-2 border-slate-100 outline-none text-xs" />
                      <input type="date" value={exp.periodTo} onChange={e => updateExperience(exp.id, 'periodTo', e.target.value)} className="w-full p-3 rounded-2xl border-2 border-slate-100 outline-none text-xs" />
                    </div>
                    <textarea placeholder="المهام الرئيسية..." value={exp.tasks} onChange={e => updateExperience(exp.id, 'tasks', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none h-24 text-sm" />
                  </div>
                ))}
                
                <button 
                  onClick={addExperience}
                  className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 space-x-reverse hover:bg-blue-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  <span>إضافة خبرة أخرى</span>
                </button>
              </div>
            )}
          </section>
        )}

        {currentStep === 4 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">المهارات واللغة</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" placeholder="اكتب مهارة واضغط إضافة..." value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()} className="flex-grow p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                <button onClick={addCustomSkill} className="bg-blue-600 text-white w-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-50 rounded-2xl border border-slate-100">
                {formData.skills.technical.map(skill => (
                  <div key={skill} className="flex items-center bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold animate-in zoom-in-50">
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(skill)} className="mr-2 text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-500">مستوى اللغة الإنجليزية</label>
              <div className="grid grid-cols-2 gap-2">
                {ENGLISH_LEVELS.map(l => (
                  <button key={l} onClick={() => setFormData({ ...formData, skills: { ...formData.skills, englishLevel: l } })} className={`py-3 rounded-xl text-sm font-bold border-2 ${formData.skills.englishLevel === l ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500'}`}>{l}</button>
                ))}
              </div>
            </div>
          </section>
        )}

        {currentStep === 6 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">الاهتمامات والجاهزية</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" placeholder="اكتب مسمى وظيفي..." value={customJobTitle} onChange={(e) => setCustomJobTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddCustomJob()} className="flex-grow p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                <button onClick={handleAddCustomJob} className="bg-blue-600 text-white w-14 rounded-2xl flex items-center justify-center shadow-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 rounded-2xl border border-slate-100">
                {formData.jobInterests.titles.map(title => (
                  <div key={title} className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold animate-in zoom-in-50">
                    <span>{title}</span>
                    <button onClick={() => setFormData({...formData, jobInterests: {...formData.jobInterests, titles: formData.jobInterests.titles.filter(t => t !== title)}})} className="mr-2 hover:text-red-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_JOB_TITLES.slice(0, 10).map(title => (
                  <button key={title} disabled={formData.jobInterests.titles.includes(title)} onClick={() => { if (formData.jobInterests.titles.length < 3) setFormData({...formData, jobInterests: {...formData.jobInterests, titles: [...formData.jobInterests.titles, title]}}); }} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 ${formData.jobInterests.titles.includes(title) ? 'bg-slate-100 text-slate-300' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}>{title}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {START_DATES.map(date => (
                <button key={date} onClick={() => setFormData({ ...formData, readiness: { ...formData.readiness, startDate: date } })} className={`py-3 rounded-xl text-xs font-bold border-2 ${formData.readiness.startDate === date ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}>{date}</button>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100">
              <span className="text-slate-700 font-bold">تصريح العمل</span>
              <button onClick={() => setFormData({...formData, readiness: {...formData.readiness, workPermit: !formData.readiness.workPermit}})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.readiness.workPermit ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.readiness.workPermit ? 'left-1' : 'left-7'}`}></div></button>
            </div>
          </section>
        )}

        {currentStep === 5 && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">الشهادات الاحترافية</h3>
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
              <input type="text" placeholder="اسم الشهادة" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} className="w-full p-3 rounded-xl border border-blue-200 outline-none font-bold" />
              <input type="text" placeholder="جهة الإصدار" value={newCert.issuer} onChange={e => setNewCert({...newCert, issuer: e.target.value})} className="w-full p-3 rounded-xl border border-blue-200 outline-none" />
              <button onClick={() => setCertFileAttached(true)} className={`p-4 border-2 border-dashed rounded-xl w-full flex flex-col items-center justify-center transition-all ${certFileAttached ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-blue-200 text-blue-400'}`}>
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span className="text-xs font-bold">{certFileAttached ? 'تم إرفاق الملف ✓' : 'اضغط للرفع'}</span>
              </button>
              <button onClick={() => { if (newCert.name && certFileAttached) { setFormData({...formData, certifications: {hasCerts: true, list: [...formData.certifications.list, newCert]}}); setNewCert({name: '', issuer: '', date: ''}); setCertFileAttached(false); } }} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">إضافة شهادة +</button>
            </div>
          </section>
        )}

        {currentStep === 7 && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">روابط وملفات إضافية</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse bg-white p-4 rounded-2xl border-2 border-slate-100">
                <div className="text-blue-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></div>
                <input type="url" placeholder="رابط LinkedIn" className="flex-grow outline-none text-xs" value={formData.links.linkedin} onChange={e => setFormData({...formData, links: {...formData.links, linkedin: e.target.value}})} />
              </div>
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-3">
                 <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-slate-300 shadow-sm"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg></div>
                 <div className="font-bold text-slate-700">رفع صورة شخصية احترافية</div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-50/95 backdrop-blur-md border-t border-slate-200 flex space-x-4 space-x-reverse max-w-md mx-auto z-50">
        <button onClick={handleNext} className="flex-grow bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95">
          {currentStep === totalSteps ? 'تجهيز ملفي الآن 🚀' : 'الخطوة التالية'}
        </button>
        {currentStep > 1 && (
          <button onClick={handleBack} className="px-6 py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors">السابق</button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
