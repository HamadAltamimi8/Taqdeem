
import React, { useEffect, useState, useRef } from 'react';
import { dbService } from '../services/db';
import { UserAccount, SponsoredAd } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'ads'>('users');
  
  const [adForm, setAdForm] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    pricePerView: 0.20
  });

  useEffect(() => {
    const fetchData = async () => {
      const u = await dbService.getAllUsers();
      setUsers(u);
      setAds(dbService.getAds());
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalViews = ads.reduce((acc, ad) => acc + ad.views, 0);
  const totalClicks = ads.reduce((acc, ad) => acc + ad.clicks, 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;
  const totalEarnings = ads.reduce((acc, ad) => acc + (ad.views * ad.pricePerView), 0).toFixed(2);

  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAd: SponsoredAd = {
      id: Math.random().toString(36).substr(2, 9),
      ...adForm,
      views: 0,
      clicks: 0,
      isActive: true
    };
    dbService.saveAd(newAd);
    setAds([newAd, ...ads]);
    setAdForm({ title: '', imageUrl: '', targetUrl: '', pricePerView: 0.20 });
    alert("تم تفعيل الإعلان في الشبكة بنجاح!");
  };

  const toggleAdStatus = (id: string) => {
    const updated = ads.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    setAds(updated);
    const target = updated.find(a => a.id === id);
    if (target) dbService.saveAd(target);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-right pb-32 font-['Cairo']" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة الأرباح والإعلانات 💸</h2>
          <p className="text-[10px] text-slate-400 font-bold">AdMob Integration: ACTIVE ✅</p>
        </div>
        <button onClick={onBack} className="bg-white p-3 rounded-2xl border text-sm font-bold shadow-sm active:scale-95 transition-all">خروج</button>
      </div>

      <div className="flex bg-white p-1.5 rounded-[24px] mb-8 border shadow-sm">
        <button onClick={() => setActiveTab('users')} className={`flex-grow py-4 rounded-2xl font-black text-xs transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>قاعدة المستخدمين</button>
        <button onClick={() => setActiveTab('ads')} className={`flex-grow py-4 rounded-2xl font-black text-xs transition-all ${activeTab === 'ads' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>شبكة الإعلانات</button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-6">
          <div className="bg-blue-600 p-10 rounded-[44px] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
             <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Active Seekers</p>
             <p className="text-5xl font-black mt-2">{users.length}</p>
             <p className="text-[10px] mt-4 font-bold bg-white/20 inline-block px-3 py-1 rounded-full">مستخدم نشط حالياً</p>
          </div>
          
          <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-50 bg-slate-50/50">
               <h3 className="font-black text-slate-700 text-sm">أحدث المسجلين</h3>
             </div>
             <table className="w-full text-right">
                <tbody className="divide-y divide-slate-50">
                   {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                         <td className="px-6 py-5 font-black text-slate-800 text-sm">{u.profile.personalInfo.fullName || u.email}</td>
                         <td className="px-6 py-5 text-left font-bold text-slate-400 text-[10px]">{u.profile.personalInfo.city || 'غير محدد'}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* كروت الأرباح الاحترافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl">
               <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Est. Earnings</p>
               <p className="text-3xl font-black mt-2">${totalEarnings}</p>
               <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white w-2/3"></div>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Impressions</p>
               <p className="text-3xl font-black mt-2 text-slate-800">{totalViews}</p>
               <p className="text-[10px] text-emerald-500 font-black mt-2">↑ 12% من الأمس</p>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. CTR</p>
               <p className="text-3xl font-black mt-2 text-blue-600">{ctr}%</p>
               <p className="text-[10px] text-slate-300 font-black mt-2">نسبة النقر للظهور</p>
            </div>
          </div>

          {/* معلومات معرفات AdMob للمطور */}
          <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-dashed border-slate-200">
            <h4 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">AdMob System Status</h4>
            <div className="space-y-2 font-mono text-[9px] text-slate-600">
               <p>APP_ID: ca-app-pub-1670199048909611~8603840056</p>
               <p>UNIT_ID: ca-app-pub-1670199048909611/8304457152</p>
               <p className="text-emerald-600 font-bold">READY TO RECEIVE TRAFFIC</p>
            </div>
          </div>

          {/* إضافة إعلان شبكة جديد */}
          <div className="bg-slate-900 p-10 rounded-[44px] text-white shadow-2xl space-y-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
               <h3 className="font-black text-xl">إطلاق حملة إعلانية 🚀</h3>
             </div>
             <form onSubmit={handleAddAd} className="space-y-5">
                <input type="text" placeholder="اسم التطبيق / اللعبة" required className="w-full p-5 rounded-[24px] bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 font-bold text-sm" value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} />
                <input type="url" placeholder="رابط صورة الإعلان (طولي أو عرضي)" required className="w-full p-5 rounded-[24px] bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 text-xs font-mono" dir="ltr" value={adForm.imageUrl} onChange={e => setAdForm({...adForm, imageUrl: e.target.value})} />
                <input type="url" placeholder="رابط المتجر أو الموقع" required className="w-full p-5 rounded-[24px] bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 text-xs font-mono" dir="ltr" value={adForm.targetUrl} onChange={e => setAdForm({...adForm, targetUrl: e.target.value})} />
                <div className="flex items-center justify-between px-2">
                   <span className="text-xs font-black text-white/50">سعر المشاهدة المستهدف ($)</span>
                   <input type="number" step="0.01" className="w-24 p-3 rounded-2xl bg-white/10 text-white text-center font-black" value={adForm.pricePerView} onChange={e => setAdForm({...adForm, pricePerView: parseFloat(e.target.value)})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-all text-base">بدء عرض الإعلان الآن</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
