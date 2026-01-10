
import React from 'react';

interface InstallGuideProps {
  onClose: () => void;
}

const InstallGuide: React.FC<InstallGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-10 text-right">
        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-800">ثبت "تقديم" على الأيفون</h3>
          <p className="text-xs text-slate-400 font-bold mt-2">استمتع بتجربة تطبيق كاملة بدون متجر التطبيقات</p>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">1</div>
            <p className="text-sm font-bold text-slate-700">اضغط على أيقونة المشاركة <span className="inline-block bg-slate-100 p-1 rounded-md mx-1"><svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span> في Safari.</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">2</div>
            <p className="text-sm font-bold text-slate-700">اختر "Add to Home Screen" أو "إضافة للشاشة الرئيسية".</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">3</div>
            <p className="text-sm font-bold text-slate-700">افتح التطبيق من شاشتك الرئيسية واستمتع بالسرعة.</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm shadow-xl active:scale-95 transition-all"
        >
          فهمت، سأقوم بالتثبيت 👍
        </button>
      </div>
    </div>
  );
};

export default InstallGuide;
