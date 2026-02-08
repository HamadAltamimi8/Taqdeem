
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { enhanceCVContent } from '../services/gemini';
import { RewardedAdModal } from './AdComponents';

interface CVBuilderProps {
  profile: UserProfile;
  onBack: () => void;
  updateProfile: (p: UserProfile) => void;
}

const CVBuilder: React.FC<CVBuilderProps> = ({ profile, onBack, updateProfile }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const [showAd, setShowAd] = useState(false);

  const startEnhancement = () => {
    // الإعلان أصبح إجبارياً الآن للجميع
    setShowAd(true);
  };

  const processAI = async () => {
    setIsEnhancing(true);
    setShowAd(false);
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
    <div className="p-6 space-y-6 text-right font-['Cairo']" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-slate-800">السيرة الذاتية الذكية</h2>
      </div>

      <div className="bg-white p-8 rounded-[40px] border-2 border-dashed border-slate-100 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5" /></svg>
        </div>
        <div>
          <h3 className="font-black text-slate-800 text-lg">سيرتك الذاتية جاهزة تقريباً</h3>
          <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">سنقوم بإعادة صياغة خبراتك ومهاراتك لتكون أكثر احترافية وجاذبية لمدراء التوظيف.</p>
        </div>
        
        <button 
          onClick={startEnhancement}
          disabled={isEnhancing}
          className="w-full bg-blue-600 text-white px-6 py-5 rounded-[28px] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isEnhancing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري التحسين الذكي...</span>
            </>
          ) : (
            <>
              <span>تحسين بالذكاء الاصطناعي ✨</span>
            </>
          )}
        </button>
      </div>

      {enhancedText && (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-md space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h4 className="font-black text-slate-800">المحتوى المُحسن والمقترح</h4>
          </div>
          <div className="text-sm text-slate-600 leading-relaxed font-bold bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 max-h-80 overflow-y-auto whitespace-pre-wrap">
            {enhancedText}
          </div>
          <div className="flex gap-3 pt-2">
            <button className="flex-grow bg-slate-900 text-white py-4 rounded-2xl font-black text-xs active:scale-95 transition-all">نسخ المحتوى 📋</button>
            <button className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-black text-xs active:scale-95 transition-all">تحميل PDF 📄</button>
          </div>
        </div>
      )}

      {showAd && (
        <RewardedAdModal 
          featureName="خدمة تحسين السيرة"
          onClose={() => setShowAd(false)}
          onReward={processAI}
        />
      )}
    </div>
  );
};

export default CVBuilder;
