
import React, { useState } from 'react';
import { UserProfile, Certification, ExperienceEntry, EducationEntry } from '../types';
import { 
  INITIAL_PROFILE, 
  DEGREES, 
  NATIONALITIES, 
  START_DATES
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
    if (currentStep === 1) {
      if (!formData.personalInfo.fullName || !formData.personalInfo.phone) {
        alert("يرجى إكمال الاسم ورقم الجوال");
        return;
      }
      if (formData.personalInfo.phone.length !== 9 || !formData.personalInfo.phone.startsWith('5')) {
        alert("يرجى إدخال رقم جوال صحيح (9 أرقام تبدأ بـ 5)");
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
      }
    }
  };

  return (
    <div className="p-6 pb-36 text-right" dir="rtl">
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
                <label className="text-xs font-bold text-slate-500">رقم الجوال (9 أرقام تبدأ بـ 5)</label>
                <div className="flex items-center bg-white rounded-2xl border-2 border-slate-100 overflow-hidden focus-within:border-blue-500 transition-colors" dir="ltr">
                  <div className="bg-slate-50 px-4 py-4 border-r-2 border-slate-100 font-bold text-slate-400 text-sm">+966</div>
                  <input 
                    type="tel" 
                    placeholder="5XXXXXXXX" 
                    value={formData.personalInfo.phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 9) setFormData({ ...formData, personalInfo: { ...formData.personalInfo, phone: val } });
                    }} 
                    className="flex-grow p-4 outline-none text-left font-bold tracking-widest" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">المدينة الحالية</label>
                <input type="text" placeholder="مثلاً: الرياض" value={formData.personalInfo.city} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, city: e.target.value } })} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
              </div>
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">المستوى التعليمي</h3>
            {formData.education.map((edu, index) => (
              <div key={edu.id} className="p-5 bg-white rounded-3xl border-2 border-slate-100 space-y-4 shadow-sm">
                <select value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none">
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" placeholder="التخصص الدراسي" value={edu.major} onChange={e => updateEducation(edu.id, 'major', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500">إرفاق الوثيقة (PDF أو صورة)</label>
                   <input type="file" accept="image/*,application/pdf" className="hidden" id={`file-${edu.id}`} onChange={(e) => handleFileUpload(edu.id, e)} />
                   <label htmlFor={`file-${edu.id}`} className={`w-full p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${edu.documentAttached ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    {edu.documentAttached ? (
                      <span className="text-xs font-black truncate max-w-full px-4">{edu.documentName || 'تم الرفع ✓'}</span>
                    ) : (
                      <span className="text-xs font-bold">اضغط لاختيار ملف</span>
                    )}
                   </label>
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black text-sm">+ إضافة مؤهل آخر</button>
          </section>
        )}

        {currentStep === 3 && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-700 border-r-4 border-blue-600 pr-3">الخبرات العملية</h3>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100">
               <span className="text-slate-700 font-bold">هل لديك خبرة عمل؟</span>
               <button onClick={() => setFormData({...formData, experience: {...formData.experience, hasExperience: !formData.experience.hasExperience, list: !formData.experience.hasExperience ? [{id: '1', lastTitle: '', company: '', periodFrom: '', periodTo: '', isCurrent: false, tasks: ''}] : []}})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.experience.hasExperience ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.experience.hasExperience ? 'right-7' : 'right-1'}`}></div>
              </button>
            </div>
            {formData.experience.hasExperience && (
              <div className="space-y-6">
                {formData.experience.list.map((exp) => (
                  <div key={exp.id} className="p-5 bg-white rounded-3xl border-2 border-slate-50 shadow-sm space-y-4">
                    <input type="text" placeholder="المسمى الوظيفي" value={exp.lastTitle} onChange={e => updateExperience(exp.id, 'lastTitle', e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 outline-none" />
                    <div className="flex items-center space-x-2 space-x-reverse justify-start">
                      <label className="text-xs font-bold text-slate-600">أعمل هنا حالياً</label>
                      <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">البداية</label>
                        <input type="date" value={exp.periodFrom} onChange={e => updateExperience(exp.id, 'periodFrom', e.target.value)} className="w-full p-3 rounded-2xl border-2 border-slate-100 outline-none text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">النهاية</label>
                        <input type="date" value={exp.periodTo} disabled={exp.isCurrent} onChange={e => updateExperience(exp.id, 'periodTo', e.target.value)} className={`w-full p-3 rounded-2xl border-2 border-slate-100 outline-none text-xs ${exp.isCurrent ? 'opacity-30' : ''}`} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addExperience} className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black text-sm">+ إضافة خبرة أخرى</button>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-50/95 backdrop-blur-md border-t flex space-x-4 space-x-reverse max-w-md mx-auto z-50">
        <button onClick={handleNext} className="flex-grow bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all text-sm">
          {currentStep === totalSteps ? 'تجهيز ملفي الآن 🚀' : 'الخطوة التالية'}
        </button>
        {currentStep > 1 && (
          <button onClick={handleBack} className="px-6 py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 text-sm">السابق</button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
