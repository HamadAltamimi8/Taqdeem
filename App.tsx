
import React, { useState, useEffect } from 'react';
import { AppStep, UserProfile, UserAccount, RecruiterProfile } from './types.ts';
import { INITIAL_PROFILE } from './constants.ts';
import { dbService } from './services/db.ts';
import Onboarding from './Onboarding.tsx';
import Dashboard from './components/Dashboard.tsx';
import Navigation from './components/Navigation.tsx';
import Interview from './components/Interview.tsx';
import CVBuilder from './components/CVBuilder.tsx';
import JobList from './components/JobList.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import RecruiterDashboard from './components/RecruiterDashboard.tsx';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ email: '', password: '' });

  useEffect(() => {
    const saved = localStorage.getItem('taqdeem_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.id) handleRouting(user);
      } catch (e) {
        localStorage.removeItem('taqdeem_session');
      }
    }
  }, []);

  const handleRouting = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setStep(AppStep.ADMIN_PANEL);
    } else if (user.role === 'recruiter') {
      setStep(AppStep.RECRUITER_DASHBOARD);
    } else {
      setProfile(user.profile || INITIAL_PROFILE);
      setStep(AppStep.DASHBOARD);
    }
  };

  const publicEntry = (role: 'user' | 'recruiter') => {
    const mockUser: UserAccount = {
      id: role === 'user' ? 'public_user_guest' : 'public_recruiter_guest',
      email: `${role}@taqdeem.com`,
      role: role,
      createdAt: new Date().toISOString(),
      profile: INITIAL_PROFILE,
      recruiterProfile: role === 'recruiter' ? {
        companyName: '',
        responsibleName: '',
        phone: '',
        jobTitle: '',
        email: ''
      } : undefined
    };
    localStorage.setItem('taqdeem_session', JSON.stringify(mockUser));
    handleRouting(mockUser);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCreds.email === 'admin@taqdeem.com' && adminCreds.password === 'admin@894355') {
      const adminUser: UserAccount = {
        id: 'admin_fixed_id',
        email: 'admin@taqdeem.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        profile: INITIAL_PROFILE
      };
      localStorage.setItem('taqdeem_session', JSON.stringify(adminUser));
      handleRouting(adminUser);
      setShowAdminLogin(false);
    } else {
      alert("بيانات الدخول غير صحيحة");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('taqdeem_session');
    setCurrentUser(null);
    setStep(AppStep.WELCOME);
  };

  const renderContent = () => {
    switch (step) {
      case AppStep.WELCOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50 text-center font-['Cairo']" dir="rtl">
            <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-blue-200">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-black mb-3 text-slate-800 tracking-tight">تقديم</h1>
            <p className="text-slate-400 text-sm font-bold mb-12">مستشارك المهني الذكي في المملكة 🇸🇦</p>
            
            <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
              <button 
                onClick={() => publicEntry('user')} 
                className="group relative bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-2xl transition-all text-center overflow-hidden active:scale-95"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                  <h3 className="font-black text-2xl text-slate-800 mb-2">باحث عن عمل</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">مقابلات • سيرة ذاتية • وظائف</p>
                </div>
              </button>

              <button 
                onClick={() => publicEntry('recruiter')} 
                className="group relative bg-slate-900 p-8 rounded-[40px] shadow-xl hover:bg-slate-800 transition-all text-center overflow-hidden active:scale-95"
              >
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                  <h3 className="font-black text-2xl text-white mb-2">الإعلان عن وظيفة</h3>
                  <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">نشر فرص • استقطاب كفاءات</p>
                </div>
              </button>

              <button 
                onClick={() => setShowAdminLogin(true)} 
                className="mt-8 text-slate-300 font-black text-xs hover:text-blue-500 transition-colors py-4 border-t border-slate-100"
              >
                بوابة الإدارة والنظام ⚙️
              </button>
            </div>

            {showAdminLogin && (
              <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-sm rounded-[44px] p-10 shadow-2xl animate-in zoom-in-95">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">دخول الإدارة</h3>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <input 
                      type="email" 
                      placeholder="البريد الإلكتروني" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm"
                      value={adminCreds.email}
                      onChange={e => setAdminCreds({...adminCreds, email: e.target.value})}
                      required
                    />
                    <input 
                      type="password" 
                      placeholder="كلمة المرور" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-sm"
                      value={adminCreds.password}
                      onChange={e => setAdminCreds({...adminCreds, password: e.target.value})}
                      required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">دخول</button>
                    <button type="button" onClick={() => setShowAdminLogin(false)} className="w-full text-slate-400 py-2 text-xs font-bold">إلغاء</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case AppStep.RECRUITER_DASHBOARD:
        return <RecruiterDashboard recruiter={currentUser!} onLogout={handleLogout} />;
      case AppStep.ADMIN_PANEL:
        return <AdminDashboard onBack={handleLogout} />;
      case AppStep.DASHBOARD:
        return <Dashboard profile={profile} completion={75} missingItems={[]} onNavigate={setStep} onLogout={handleLogout} />;
      case AppStep.INTERVIEW:
        return <Interview profile={profile} updateProfile={setProfile} onBack={() => setStep(AppStep.DASHBOARD)} />;
      case AppStep.CV_BUILDER:
        return <CVBuilder profile={profile} updateProfile={setProfile} onBack={() => setStep(AppStep.DASHBOARD)} />;
      case AppStep.JOBS:
        return <JobList profile={profile} updateProfile={setProfile} onBack={() => setStep(AppStep.DASHBOARD)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden font-['Cairo']">
      <main className="flex-grow pb-24 overflow-y-auto">
        {renderContent()}
      </main>
      {step >= AppStep.DASHBOARD && step < AppStep.ADMIN_PANEL && currentUser?.role !== 'recruiter' && (
        <Navigation activeStep={step} onNavigate={setStep} />
      )}
    </div>
  );
};

export default App;
