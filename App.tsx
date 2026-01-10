
import React, { useState, useEffect, useMemo } from 'react';
import { AppStep, UserProfile, UserAccount } from './types.ts';
import { INITIAL_PROFILE } from './constants.ts';
import { dbService } from './services/db.ts';
import Onboarding from './components/Onboarding.tsx';
import Dashboard from './components/Dashboard.tsx';
import Navigation from './components/Navigation.tsx';
import Interview from './components/Interview.tsx';
import CVBuilder from './components/CVBuilder.tsx';
import JobList from './components/JobList.tsx';
import ProfileView from './components/ProfileView.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

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

  const profileStatus = useMemo(() => {
    let score = 0;
    const missing = [];
    if (profile.personalInfo?.fullName) score += 10; else missing.push("الاسم الكامل");
    if (profile.personalInfo?.phone) score += 10; else missing.push("رقم الجوال");
    if (profile.education?.length > 0) score += 25; else missing.push("المؤهل التعليمي");
    if (profile.jobInterests?.titles?.length > 0) score += 15; else missing.push("المسميات المستهدفة");
    return { percentage: Math.min(score + 40, 100), missing };
  }, [profile]);

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
      setError(e.message || "حدث خطأ في المصادقة");
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
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tighter">تقديم</h1>
            <p className="text-lg text-blue-100 mb-12 max-w-md font-bold">مساعدك الذكي للحصول على الوظيفة المثالية.</p>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] w-full max-w-xs space-y-4 border border-white/20">
              <input type="email" placeholder="البريد الإلكتروني" className="w-full p-4 bg-white/10 rounded-2xl border border-white/20 outline-none text-white placeholder-white/50 text-sm text-right" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
              <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-white/10 rounded-2xl border border-white/20 outline-none text-white placeholder-white/50 text-sm text-right" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              {error && <p className="text-red-200 text-[10px] font-bold">{error}</p>}
              <button onClick={handleAuth} disabled={loading} className="w-full bg-white text-blue-700 font-black py-4 rounded-2xl shadow-xl active:scale-95 disabled:opacity-50">
                {loading ? 'جاري التحقق...' : (authForm.isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد')}
              </button>
            </div>
            <button onClick={() => setAuthForm({...authForm, isLogin: !authForm.isLogin})} className="mt-8 text-blue-100 font-bold text-sm underline underline-offset-4">
              {authForm.isLogin ? 'ليس لديك حساب؟ سجل الآن مجاناً' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        );
      case AppStep.ONBOARDING: return <Onboarding onComplete={(data) => { syncProfile(data); setStep(AppStep.DASHBOARD); }} />;
      case AppStep.DASHBOARD: return <Dashboard profile={profile} completion={profileStatus.percentage} missingItems={profileStatus.missing} onNavigate={setStep} />;
      case AppStep.ADMIN_PANEL: return <AdminDashboard onBack={handleLogout} />;
      case AppStep.INTERVIEW: return <Interview profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} updateProfile={syncProfile} />;
      case AppStep.CV_BUILDER: return <CVBuilder profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} updateProfile={syncProfile} />;
      case AppStep.JOBS: return <JobList profile={profile} onBack={() => setStep(AppStep.DASHBOARD)} updateProfile={syncProfile} />;
      case AppStep.PROFILE: return <ProfileView profile={profile} setProfile={syncProfile} onBack={() => setStep(AppStep.DASHBOARD)} onLogout={handleLogout} />;
      default: return null;
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
