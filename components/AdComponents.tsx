
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { SponsoredAd } from '../types';

interface RewardedAdModalProps {
  onReward: () => void;
  onClose: () => void;
  featureName: string;
}

// معرفات AdMob الخاصة بك
const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-1670199048909611~8603840056',
  INTERSTITIAL_UNIT_ID: 'ca-app-pub-1670199048909611/8304457152'
};

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ onReward, onClose, featureName }) => {
  const [timer, setTimer] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    // جلب إعلان من قاعدة البيانات أو استخدام إعلان افتراضي احترافي
    const savedAds = dbService.getAds().filter(a => a.isActive);
    const selectedAd = savedAds.length > 0 
      ? savedAds[Math.floor(Math.random() * savedAds.length)] 
      : {
          id: 'admob_placeholder',
          title: 'تحميل تطبيق "تقديم" للمحترفين',
          imageUrl: 'https://images.unsplash.com/photo-1551288560-12948195159b?w=800&q=80',
          targetUrl: 'https://google.com',
          pricePerView: 0.15
        };
    
    setAd(selectedAd);
    if (selectedAd.id) dbService.trackAdView(selectedAd.id);

    // عد تنازلي لإظهار زر الإغلاق (5 ثوانٍ لضمان الربح)
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = () => {
    if (ad && ad.id) dbService.trackAdClick(ad.id);
    window.open(ad.targetUrl || 'https://google.com', '_blank');
  };

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black font-['Cairo'] animate-in fade-in duration-500" dir="rtl">
      {/* خلفية غامضة بأسلوب الألعاب */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(37,99,235,0.2),transparent_70%)] animate-pulse"></div>
        <img src={ad.imageUrl} className="w-full h-full object-cover opacity-20 blur-xl scale-110" alt="" />
      </div>

      <div className="relative w-full max-w-lg h-full md:h-[95vh] bg-slate-900 md:rounded-[48px] overflow-hidden flex flex-col shadow-[0_0_120px_rgba(0,0,0,1)] border border-white/5">
        
        {/* شريط الإغلاق العلوي */}
        <div className="absolute top-8 right-8 left-8 z-50 flex justify-between items-center">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
             <span className="text-white text-[9px] font-black uppercase tracking-widest opacity-80">Interstitial Ad Unit</span>
          </div>

          {!canClose ? (
            <div className="bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shadow-2xl ring-4 ring-white/10 transition-transform animate-in zoom-in">
              {timer}
            </div>
          ) : (
            <button 
              onClick={onReward}
              className="bg-white hover:bg-slate-200 text-slate-900 p-3.5 rounded-full shadow-2xl transition-all active:scale-90 border-4 border-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>

        {/* جسم الإعلان الرئيسي */}
        <div className="flex-grow relative flex items-center justify-center p-6" onClick={handleAction}>
          <div className="w-full h-full rounded-[40px] overflow-hidden shadow-2xl border border-white/10 relative group cursor-pointer">
            <img src={ad.imageUrl} className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-125" alt="Ad Content" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20"></div>
            
            {/* تفاصيل العرض */}
            <div className="absolute bottom-10 right-8 left-8 text-right space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl p-1 shadow-2xl shrink-0">
                  <img src={ad.imageUrl} className="w-full h-full object-cover rounded-xl" alt="Icon" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-white font-black text-2xl drop-shadow-2xl">{ad.title}</h4>
                  <p className="text-white/60 text-[10px] font-bold mt-1">تطبيق موثوق • Google AdMob Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* زر التفاعل السفلي */}
        <div className="p-8 pb-10 bg-slate-950 border-t border-white/5">
          <button 
            onClick={handleAction}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[32px] font-black text-xl shadow-[0_20px_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all group"
          >
            <span>استكشاف العرض الآن</span>
            <svg className="w-6 h-6 group-hover:translate-x-[-8px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="mt-6 flex justify-center opacity-20">
            <p className="text-[8px] text-white font-black uppercase tracking-[0.4em]">Ad Unit: {ADMOB_CONFIG.INTERSTITIAL_UNIT_ID}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
