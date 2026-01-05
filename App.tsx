
import React, { useState, useEffect } from 'react';
import { AppStep, UserProfile, UserAccount } from './types';
import { INITIAL_PROFILE } from './constants';
import { dbService } from './services/db';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Interview from './components/Interview';
import CVBuilder from './components/CVBuilder';
import JobList from './components/JobList';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [authForm, setAuthForm] = useState({ email: '', password: '', isLogin: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem('taqdeem_session');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        setProfile(user.profile);
        setStep(user.role === 'admin' ? AppStep.ADMIN_PANEL : AppStep.DASHBOARD);
      } catch (e) {
        localStorage.removeItem('taqdeem_session');
      }
    }
  }, []);

  const handleAuth = async () => {
    if (!authForm.email || !authForm.password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let user;
      if (authForm.isLogin) {
        user = await dbService.login(authForm.email, authForm.password);
      } else {
        user = await dbService.signUp(authForm.email, authForm.password);
      }
      
      setCurrentUser(user);
      setProfile(user.profile);
      localStorage.setItem('taqdeem_session', JSON.stringify(user));
      
      if (user.role === 'admin') setStep(AppStep.ADMIN_PANEL);
      else if (!user.profile.personalInfo.fullName) setStep(AppStep.ONBOARDING);
      else setStep(AppStep.DASHBOARD);
    } catch (e: any) {
      console.error("Auth error:", e);
      setError(e.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const syncProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (currentUser) {
      await dbService.updateProfile(currentUser.id, newProfile);
      const updatedUser = { ...currentUser, profile: newProfile };
      setCurrentUser(updatedUser);
      localStorage.setItem('taqdeem_session', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('taqdeem_session');
    localStorage.removeItem('taqdeem_token');
    setCurrentUser(null);
    setProfile(INITIAL_PROFILE);
    setStep(AppStep.WELCOME);
  };

  const renderContent = () => {
    switch (step) {
      case AppStep.WELCOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-600 to-indigo-800 text-white text-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl animate-bounce">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tighter">تقديم</h1>
            <p className="text-lg text-blue-100 mb-12 max-w-md font-bold">مساعدك الذكي للحصول على الوظيفة المثالية.</p>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] w-full max-w-xs space-y-4 border border-white/20">
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="w-full p-4 bg-white/10 rounded-2xl border border-white/20 outline-none text-white placeholder-white/50 text-sm"
                value={authForm.email}
                onChange={e => setAuthForm({...authForm, email: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="كلمة المرور" 
                className="w-full p-4 bg-white/10 rounded-2xl border border-white/20 outline-none text-white placeholder-white/50 text-sm"
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl">
                  <p className="text-red-200 text-[10px] font-bold leading-relaxed">{error}</p>
                </div>
              )}

              <button 
                onClick={handleAuth} 
                disabled={loading}
                className="w-full bg-white text-blue-700 font-black py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري التحقق...</span>
                  </div>
                ) : (authForm.isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد')}
              </button>
            </div>
            
            <button 
              onClick={() => { setAuthForm({...authForm, isLogin: !authForm.isLogin}); setError(''); }} 
              className="mt-8 text-blue-100 font-bold text-sm underline underline-offset-4"
            >
              {authForm.isLogin ? 'ليس لديك حساب؟ سجل الآن مجاناً' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        );
      case AppStep.ONBOARDING:
        return <Onboarding onComplete={(data) => { syncProfile(data); setStep(AppStep.DASHBOARD); }} />;
      case AppStep.DASHBOARD:
        return <Dashboard profile={profile} completion={80} missingItems={[]} onNavigate={setStep} />;
      case AppStep.ADMIN_PANEL:
        return <AdminDashboard onBack={handleLogout} />;
      case AppStep.INTERVIEW:
        return <Interview profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} updateProfile={syncProfile} />;
      case AppStep.CV_BUILDER:
        return <CVBuilder profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} updateProfile={syncProfile} />;
      case AppStep.JOBS:
        return <JobList profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} updateProfile={syncProfile} />;
      case AppStep.PROFILE:
        return <ProfileView profile={profile} setProfile={syncProfile} onBack={() => setStep(AppStep.DASHBOARD)} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <main className="flex-grow pb-24 overflow-y-auto scrollbar-hide">
        {renderContent()}
      </main>
      {step >= AppStep.DASHBOARD && step !== AppStep.ADMIN_PANEL && (
        <Navigation activeStep={step} onNavigate={setStep} />
      )}
    </div>
  );
};

export default App;
