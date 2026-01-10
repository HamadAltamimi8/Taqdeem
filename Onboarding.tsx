
import React, { useState, useRef } from 'react';
import { UserProfile, Certification, ExperienceEntry, EducationEntry } from './types';
import { 
  INITIAL_PROFILE, 
  DEGREES, 
  ENGLISH_LEVELS, 
  NATIONALITIES, 
  START_DATES
} from './constants';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.personalInfo.fullName || !formData.personalInfo.phone) {
        alert("يرجى إكمال الاسم ورقم الجوال");
        return;
      }
      if (formData.personalInfo.phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح يبدأ بـ 5");
        return;
      }
    }

    if (currentStep === 2) {
      const hasUnattached = formData.education.some(edu => !edu.documentAttached);
      if (hasUnattached) {
        alert("⚠️ يرجى إرفاق صورة من وثيقة التخرج لإكمال التسجيل.");
        return;
      }
    }

    if (currentStep < totalSteps) setCurrentStep(c => c + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleFileUpload = (eduId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          education: formData.education.map(edu => 
            edu.id === eduId ? { 
              ...edu, 
              documentAttached: true, 
              documentUrl: reader.result as string,
              documentName: file.name 
            } : edu
          )
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
    setFormData({
      ...formData,
      experience: {
        ...formData.experience,
        list: [...formData.experience.list, newExp]
      }
    });
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: any) => {
    setFormData({
      ...formData,
      experience: {
        ...formData.experience,
        list: formData.experience.list.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">الاسم الكامل</label>
                <input type="text" placeholder="الاسم كما في الهوية" value={formData.personalInfo.fullName} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, fullName: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">الجنس</label>
                  <select value={formData.personalInfo.gender} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, gender: e.target.value as any } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none font-bold">
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">تاريخ الميلاد</label>
                  <input type="date" value={formData.personalInfo.birthDate} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, birthDate: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">الجنسية</label>
                <select value={formData.personalInfo.nationality} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, nationality: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none">
                  {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">المدينة الحالية</label>
                <input type="text" placeholder="مثلاً: الرياض" value={formData.personalInfo.city} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, city: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">رقم الجوال (يبدأ بـ 5)</label>
                <div className="flex items-center bg-white rounded-2xl border-2 border-slate-100 overflow-hidden focus-within:border-blue-500 transition-colors">
                  <div className="bg-slate-50 px-4 py-4 border-l-2 border-slate-100 font-bold text-slate-400 text-sm" dir="ltr">+966</div>
                  <input 
                    type="tel" 
                    placeholder="5XXXXXXXX" 
                    value={formData.personalInfo.phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 9) setFormData({ ...formData, personalInfo: { ...formData.personalInfo, phone: val } });
                    }} 
                    className="flex-grow p-4 outline-none text-left font-bold tracking-widest" 
                    dir="ltr" 
                  />
                </div>
              </div>
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
                </div>
                
                <select value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none">
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" placeholder="التخصص الدراسي" value={edu.major} onChange={e => updateEducation(edu.id, 'major', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                <input type="text" placeholder="اسم الجامعة أو المعهد" value={edu.university} onChange={e => updateEducation(edu.id, 'university', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 mr-1 flex items-center">
                     إرفاق وثيقة التخرج <span className="text-red-500 mr-1">* إلزامي للمتابعة</span>
                   </label>
                   <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    className="hidden" 
                    id={`file-${edu.id}`}
                    onChange={(e) => handleFileUpload(edu.id, e)}
                   />
                   <label 
                    htmlFor={`file-${edu.id}`}
                    className={`w-full p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${edu.documentAttached ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                   >
                    {edu.documentAttached ? (
                      <>
                        <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        <span className="text-xs font-black truncate max-w-full px-4">{edu.documentName || 'تم الرفع بنجاح'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        <span className="text-xs font-bold">اضغط لاختيار صورة أو ملف PDF</span>
                      </>
                    )}
                   </label>
                </div>
              </div>
            ))}

            <button onClick={addEducation} className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 space-x-reverse hover:bg-blue-50 transition-all">
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
                  setFormData({...formData, experience: {...formData.experience, hasExperience: hasExp, list: hasExp ? [{id: '1', lastTitle: '', company: '', periodFrom: '', periodTo: '', isCurrent: false, tasks: ''}] : []}});
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
                    <input type="text" placeholder="المسمى الوظيفي" value={exp.lastTitle} onChange={e => updateExperience(exp.id, 'lastTitle', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                    <input type="text" placeholder="اسم الشركة" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                    
                    <div className="flex items-center space-x-2 space-x-reverse mb-2 mr-1">
                      <input 
                        type="checkbox" 
                        id={`current-${exp.id}`}
                        checked={exp.isCurrent}
                        onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`current-${exp.id}`} className="text-xs font-bold text-slate-600">أعمل هنا حالياً (حتى الآن)</label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 mr-1">تاريخ البداية</label>
                        <input type="date" value={exp.periodFrom} onChange={e => updateExperience(exp.id, 'periodFrom', e.target.value)} className="w-full p-3 rounded-2xl border-2 border-slate-100 outline-none text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 mr-1">تاريخ الانتهاء</label>
                        <input 
                          type="date" 
                          value={exp.periodTo} 
                          disabled={exp.isCurrent}
                          onChange={e => updateExperience(exp.id, 'periodTo', e.target.value)} 
                          className={`w-full p-3 rounded-2xl border-2 border-slate-100 outline-none text-xs ${exp.isCurrent ? 'bg-slate-50 text-slate-300 opacity-50' : ''}`} 
                        />
                      </div>
                    </div>
                    <textarea placeholder="المهام الرئيسية..." value={exp.tasks} onChange={e => updateExperience(exp.id, 'tasks', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none h-24 text-sm" />
                  </div>
                ))}
                <button onClick={addExperience} className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 space-x-reverse hover:bg-blue-50 transition-all">
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
                <button onClick={addCustomSkill} className="bg-blue-600 text-white w-14 rounded-2xl flex items-center justify-center shadow-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-50 rounded-2xl border border-slate-100">
                {formData.skills.technical.map(skill => (
                  <div key={skill} className="flex items-center bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold animate-in zoom-in-50">
                    <span>{skill}</span>
                    <button onClick={() => setFormData({...formData, skills: {...formData.skills, technical: formData.skills.technical.filter(s => s !== skill)}})} className="mr-2 text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
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

        {currentStep === 5 && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">الشهادات الاحترافية</h3>
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
              <input type="text" placeholder="اسم الشهادة" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} className="w-full p-3 rounded-xl border border-blue-200 outline-none font-bold" />
              <input type="text" placeholder="جهة الإصدار" value={newCert.issuer} onChange={e => setNewCert({...newCert, issuer: e.target.value})} className="w-full p-3 rounded-xl border border-blue-200 outline-none" />
              <button onClick={() => setCertFileAttached(true)} className={`p-4 border-2 border-dashed rounded-xl w-full flex flex-col items-center justify-center transition-all ${certFileAttached ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-blue-200 text-blue-400'}`}>
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span className="text-xs font-bold">{certFileAttached ? 'تم إرفاق الشهادة ✓' : 'اضغط لرفع صورة الشهادة'}</span>
              </button>
              <button onClick={() => { if (newCert.name && certFileAttached) { setFormData({...formData, certifications: {hasCerts: true, list: [...formData.certifications.list, newCert]}}); setNewCert({name: '', issuer: '', date: ''}); setCertFileAttached(false); } else { alert("يرجى إكمال الاسم وإرفاق الملف"); } }} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100">إضافة الشهادة لقائمة ملفي +</button>
            </div>
          </section>
        )}

        {currentStep === 6 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">الاهتمامات والجاهزية</h3>
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 mr-1">المسميات الوظيفية المستهدفة (3 كحد أقصى)</label>
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
            </div>
            <div className="grid grid-cols-3 gap-2">
              {START_DATES.map(date => (
                <button key={date} onClick={() => setFormData({ ...formData, readiness: { ...formData.readiness, startDate: date } })} className={`py-3 rounded-xl text-xs font-bold border-2 ${formData.readiness.startDate === date ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-500'}`}>{date}</button>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100">
              <span className="text-slate-700 font-bold">تصريح العمل (ساري)</span>
              <button onClick={() => setFormData({...formData, readiness: {...formData.readiness, workPermit: !formData.readiness.workPermit}})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.readiness.workPermit ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.readiness.workPermit ? 'left-1' : 'left-7'}`}></div></button>
            </div>
          </section>
        )}

        {currentStep === 7 && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">الخطوة النهائية 🚀</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse bg-white p-4 rounded-2xl border-2 border-slate-100">
                <div className="text-blue-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></div>
                <input type="url" placeholder="رابط LinkedIn (اختياري)" className="flex-grow outline-none text-xs" value={formData.links.linkedin} onChange={e => setFormData({...formData, links: {...formData.links, linkedin: e.target.value}})} />
              </div>
              
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-3 relative group overflow-hidden">
                 <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-slate-300 shadow-sm"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                 <div className="font-bold text-slate-700">رفع صورة شخصية (اختياري)</div>
                 <p className="text-[10px] text-slate-400 font-bold">تساعد في جعل سيرتك الذاتية أكثر احترافية</p>
                 <button className="absolute inset-0 w-full h-full bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></button>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-50/95 backdrop-blur-md border-t border-slate-200 flex space-x-4 space-x-reverse max-w-md mx-auto z-50">
        <button onClick={handleNext} className="flex-grow bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 text-sm tracking-wide">
          {currentStep === totalSteps ? 'تجهيز ملفي الآن 🚀' : 'الخطوة التالية'}
        </button>
        {currentStep > 1 && (
          <button onClick={handleBack} className="px-6 py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm">السابق</button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
