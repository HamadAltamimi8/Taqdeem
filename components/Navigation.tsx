
import React from 'react';
import { AppStep } from '../types';

interface NavigationProps {
  activeStep: AppStep;
  onNavigate: (step: AppStep) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeStep, onNavigate }) => {
  const tabs = [
    { step: AppStep.DASHBOARD, label: 'الرئيسية', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { step: AppStep.INTERVIEW, label: 'المقابلة', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { step: AppStep.CV_BUILDER, label: 'السيرة', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { step: AppStep.JOBS, label: 'وظائف', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { step: AppStep.PROFILE, label: 'الملف', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-2 py-4 z-50 max-w-md mx-auto">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.step}
            onClick={() => onNavigate(tab.step)}
            className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${
              activeStep === tab.step ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <svg className={`w-6 h-6 ${activeStep === tab.step ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
            </svg>
            <span className="text-[11px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
