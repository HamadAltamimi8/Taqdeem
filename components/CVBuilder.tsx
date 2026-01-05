
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { enhanceCVContent } from '../services/gemini';
import { dbService } from '../services/db';
import { RewardedAdModal, BannerAd } from './AdComponents';

interface CVBuilderProps {
  profile: UserProfile;
  onBack: () => void;
  updateProfile: (p: UserProfile) => void;
}

const CVBuilder: React.FC<CVBuilderProps> = ({ profile, onBack, updateProfile }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const [showAd, setShowAd] = useState(false);

  const credits = profile.activity?.credits ?? 0;

  const startEnhancement = () => {
    if (credits <= 0) {
      setShowAd(true);
    } else {
      processAI();
    }
  };

  const processAI = async (isBonus = false) => {
    setIsEnhancing(true);
    setShowAd(false);
    try {
      const res = await enhanceCVContent(profile);
      setEnhancedText(res);
      
      // خصم رصيد إذا لم تكن عملية مكافأة
      if (!isBonus) {
        const newProfile = {
          ...profile,
          activity: { ...profile.activity, credits: Math.max(0, credits - 1) }
        };
        updateProfile(newProfile);
      }
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
        <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
           <span className="text-amber-600 text-[10px] font-black ml-1">⚡ رصيد: {credits}</span>
        </div>
      </div>

      <BannerAd />

      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h3 className="font-bold text-slate-800">سيرتك الذاتية جاهزة تقريباً</h3>
        <p className="text-sm text-slate-500">تم تجميع بياناتك تلقائياً من الملف الشخصي.</p>
        <button 
          onClick={startEnhancement}
          disabled={isEnhancing}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isEnhancing ? 'جاري التحسين...' : 'تحسين بالذكاء الاصطناعي (1 ⚡)'}
        </button>
      </div>

      {enhancedText && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-in fade-in duration-500">
          <h4 className="font-bold text-slate-800">معاينة المحتوى المحسن</h4>
          <div className="text-sm text-slate-600 prose prose-slate bg-slate-50 p-4 rounded-xl max-h-60 overflow-y-auto">
            {enhancedText.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          <div className="flex space-x-2 space-x-reverse pt-4">
            <button className="flex-grow bg-blue-600 text-white py-3 rounded-xl font-bold">تحميل PDF</button>
          </div>
        </div>
      )}

      {showAd && (
        <RewardedAdModal 
          featureName="تحسين السيرة الذاتية"
          onClose={() => setShowAd(false)}
          onReward={() => processAI(true)}
        />
      )}
    </div>
  );
};

export default CVBuilder;
