
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { enhanceCVContent } from '../services/gemini';

interface CVBuilderProps {
  profile: UserProfile;
  onBack: () => void;
}

const CVBuilder: React.FC<CVBuilderProps> = ({ profile, onBack }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const res = await enhanceCVContent(profile);
      setEnhancedText(res);
    } catch (e) {
      alert("حدث خطأ أثناء تحسين المحتوى.");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-800">السيرة الذاتية الذكية</h2>
        <button onClick={onBack} className="text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h3 className="font-bold text-slate-800">سيرتك الذاتية جاهزة تقريباً</h3>
        <p className="text-sm text-slate-500">تم تجميع بياناتك تلقائياً من الملف الشخصي. يمكنك تحسينها الآن باستخدام الذكاء الاصطناعي.</p>
        <button 
          onClick={handleEnhance}
          disabled={isEnhancing}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isEnhancing ? 'جاري التحسين...' : 'تحسين المحتوى بالذكاء الاصطناعي ✨'}
        </button>
      </div>

      {enhancedText && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800">معاينة المحتوى المحسن</h4>
          <div className="text-sm text-slate-600 prose prose-slate">
            {enhancedText.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          <div className="flex space-x-2 space-x-reverse pt-4">
            <button className="flex-grow bg-blue-600 text-white py-3 rounded-xl font-bold">تحميل PDF</button>
            <button className="flex-grow bg-white text-blue-600 border border-blue-600 py-3 rounded-xl font-bold">تحميل Word</button>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4">بيانات السيرة الحالية</h4>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-slate-500">المؤهل:</span>
            {/* Fix: Access education as an array */}
            <span className="text-sm font-bold text-slate-700">{profile.education[0]?.degree} - {profile.education[0]?.major}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-sm text-slate-500">الخبرة:</span>
            <span className="text-sm font-bold text-slate-700">{profile.experience.list[0]?.lastTitle || 'لا يوجد'}</span>
          </div>
          <div>
            <span className="text-sm text-slate-500 block mb-1">المهارات:</span>
            <div className="flex flex-wrap gap-2">
              {profile.skills.technical.map(s => (
                <span key={s} className="bg-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-700">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
