
import { UserAccount, UserProfile, JobPost, SponsoredAd } from '../types';

const API_URL = 'https://bfqsjkftyfvuubkuewuj.supabase.co'; 
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcXNqa2Z0eWZ2dXVia3Vld3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzIyOTUsImV4cCI6MjA4Mjk0ODI5NX0.s9m_To5gYeJODOjpYs_WYBZyWMNRp43dDNDASVgYgCk'; 

const LOCAL_ADS_KEY = 'taqdeem_local_ads';

const getHeaders = () => ({
  'apikey': API_KEY,
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'Prefer': 'return=representation',
});

export const dbService = {
  // إدارة الوظائف - جلب من السيرفر فقط لضمان الحداثة
  getInternalJobs: async (): Promise<JobPost[]> => {
    try {
      const res = await fetch(`${API_URL}/rest/v1/jobs?select=*&order=created_at.desc`, { 
        headers: getHeaders() 
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Fetch Jobs Error:", e);
    }
    return [];
  },

  // إنشاء وظيفة واحدة في قاعدة البيانات السحابية
  createJob: async (job: Partial<JobPost>) => {
    const payload = {
      ...job,
      created_at: new Date().toISOString()
    };
    
    try {
      const res = await fetch(`${API_URL}/rest/v1/jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create job in DB");
      return await res.json();
    } catch (e) {
      console.error("DB Create Job Error:", e);
      throw e;
    }
  },

  // إنشاء وظائف بشكل جماعي (Excel) في قاعدة البيانات السحابية
  createJobsBulk: async (jobs: Partial<JobPost>[]) => {
    const timestamp = new Date().toISOString();
    const payload = jobs.map(j => ({
      ...j,
      created_at: timestamp
    }));
    
    try {
      const res = await fetch(`${API_URL}/rest/v1/jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to bulk create jobs in DB");
      return await res.json();
    } catch (e) {
      console.error("DB Bulk Create Error:", e);
      throw e;
    }
  },

  // إدارة الإعلانات
  getAds: (): SponsoredAd[] => {
    const saved = localStorage.getItem(LOCAL_ADS_KEY);
    return saved ? JSON.parse(saved) : [
      {
        id: 'default_1',
        title: 'احصل على دورات تدريبية معتمدة',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80',
        targetUrl: 'https://google.com',
        views: 124,
        clicks: 12,
        pricePerView: 0.10,
        isActive: true
      }
    ];
  },

  saveAd: (ad: SponsoredAd) => {
    const ads = dbService.getAds();
    localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify([ad, ...ads.filter(a => a.id !== ad.id)]));
  },

  trackAdView: (adId: string) => {
    const ads = dbService.getAds();
    const updated = ads.map(a => a.id === adId ? { ...a, views: a.views + 1 } : a);
    localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(updated));
  },

  trackAdClick: (adId: string) => {
    const ads = dbService.getAds();
    const updated = ads.map(a => a.id === adId ? { ...a, clicks: a.clicks + 1 } : a);
    localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(updated));
  },

  getAllUsers: async (): Promise<UserAccount[]> => {
    try {
      const res = await fetch(`${API_URL}/rest/v1/profiles?role=eq.user&select=*`, { headers: getHeaders() });
      const data = await res.json();
      return Array.isArray(data) ? data.map((p: any) => ({
        id: p.id, email: p.email, role: p.role, createdAt: p.created_at,
        profile: p.profile_data || {}, recruiterProfile: p.recruiter_data
      })) : [];
    } catch(e) { return []; }
  },

  getRecruiterJobs: async (rid: string) => {
    try {
      const res = await fetch(`${API_URL}/rest/v1/jobs?recruiterId=eq.${rid}&select=*&order=created_at.desc`, { 
        headers: getHeaders() 
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  applyToJob: async (jobId: string, userId: string, profile: any) => {
    await fetch(`${API_URL}/rest/v1/applications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ jobId, userId, user_profile: profile, applied_at: new Date().toISOString() })
    });
  }
};
