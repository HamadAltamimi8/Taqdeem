
import React, { useState, useEffect } from 'react';

export const BannerAd: React.FC = () => (
  <div className="w-full bg-slate-100 border-y border-slate-200 py-2 px-4 mb-4 flex items-center justify-between overflow-hidden">
    <div className="flex items-center space-x-2 space-x-reverse">
      <span className="bg-slate-300 text-[8px] font-black px-1.5 py-0.5 rounded text-white">إعلان</span>
      <p className="text-[10px] text-slate-400 font-bold truncate">احصل على دورات تدريبية معتمدة بخصم 50%</p>
    </div>
    <button className="text-[10px] font-black text-blue-600 underline">مشاهدة</button>
  </div>
);

interface RewardedAdModalProps {
  onReward: () => void;
  onClose: () => void;
  featureName: string;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ onReward, onClose, featureName }) => {
  const [timer, setTimer] = useState(5);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setIsFinished(true);
    }
  }, [timer]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.68a1 1 0 10-1.414-1.414l.707-.707a1 1 0 101.414 1.414l-.707.707zm8.232 0a1 1 0 101.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707zM9 11a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM11 13a1 1 0 10-2 0v.01a1 1 0 102 0V13zM10 16a1 1 0 100-2 1 1 0 000 2z"/></svg>
          </div>
          <h3 className="text-xl font-black mb-1">افتح الميزة مجاناً! ⚡</h3>
          <p className="text-xs opacity-90 font-bold">شاهد إعلان قصير لاستخدام {featureName}</p>
        </div>
        
        <div className="p-8 space-y-6 text-center">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * (5 - timer) / 5)} className="text-amber-500 transition-all duration-1000" />
            </svg>
            <span className="text-3xl font-black text-slate-800">{timer > 0 ? timer : '✓'}</span>
          </div>

          {!isFinished ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold">جاري تحميل الإعلان...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={onReward} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                الحصول على الرصيد والبدء
              </button>
              <button onClick={onClose} className="text-slate-400 text-[10px] font-bold">إغلاق وتجاهل</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
