
import { UserAccount, UserProfile } from '../types';

// تم تحديث الرابط والمفتاح بناءً على بيانات المشروع الصحيحة
const API_URL = 'https://bfqsjkftyfvuubkuewuj.supabase.co'; 
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcXNqa2Z0eWZ2dXVia3Vld3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzIyOTUsImV4cCI6MjA4Mjk0ODI5NX0.s9m_To5gYeJODOjpYs_WYBZyWMNRp43dDNDASVgYgCk'; 

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'apikey': API_KEY,
    'Content-Type': 'application/json',
  };
  // في Supabase نستخدم الـ token للمستخدم المسجل أو المفتاح العام للطلبات المجهولة
  headers['Authorization'] = `Bearer ${token || API_KEY}`;
  return headers;
};

export const dbService = {
  signUp: async (email: string, password: string): Promise<UserAccount> => {
    try {
      // 1. إنشاء الحساب في نظام Auth الخاص بـ Supabase
      const authResponse = await fetch(`${API_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });

      const authData = await authResponse.json();
      
      if (!authResponse.ok) {
        throw new Error(authData.msg || authData.error_description || "خطأ في بيانات التسجيل. تأكد من تفعيل خيار Email Signup في إعدادات Supabase.");
      }

      const userId = authData.user.id;
      const token = authData.access_token;
      if (token) localStorage.setItem('taqdeem_token', token);

      // البيانات الأولية للملف الشخصي
      // Fix: Added missing 'credits' property to satisfy UserActivity interface requirements
      const initialProfile: UserProfile = { 
        personalInfo: { fullName: '', gender: 'ذكر', birthDate: '', nationality: 'سعودي', city: '', email, phone: '' },
        education: [], 
        experience: { hasExperience: false, years: '0', list: [] },
        skills: { technical: [], tools: [], englishLevel: 'متوسط', softSkills: [] },
        certifications: { hasCerts: false, list: [] },
        jobInterests: { titles: [], jobType: 'دوام كامل', workStyle: 'حضوري' },
        readiness: { available: true, startDate: 'فوراً', workPermit: true },
        links: { linkedin: '', github: '', portfolio: '' },
        activity: { appliedJobs: [], interviews: [], credits: 3 }
      };

      // 2. إدراج سجل في جدول profiles لربط البيانات بالهوية
      const profileResponse = await fetch(`${API_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          ...getHeaders(token),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: userId,
          email: email,
          role: email === 'admin@taqdeem.com' ? 'admin' : 'user',
          profile_data: initialProfile
        })
      });

      if (!profileResponse.ok) {
        const errData = await profileResponse.json();
        console.error("Database Insert Error:", errData);
        throw new Error("فشل إنشاء سجل البيانات في قاعدة البيانات. يرجى تشغيل كود SQL في لوحة تحكم Supabase.");
      }

      const profileData = await profileResponse.json();
      return {
        id: userId,
        email: email,
        role: profileData[0].role,
        createdAt: profileData[0].created_at,
        profile: profileData[0].profile_data
      };
    } catch (e: any) {
      console.error("SignUp Details:", e);
      if (e.message === 'Failed to fetch') {
        throw new Error("⚠️ تعذر الوصول للسيرفر. يرجى التأكد من تشغيل المشروع أو اتصال الإنترنت.");
      }
      throw e;
    }
  },

  login: async (email: string, password: string): Promise<UserAccount> => {
    try {
      // 1. التحقق من الهوية (Authentication)
      const authResponse = await fetch(`${API_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });

      const authData = await authResponse.json();
      if (!authResponse.ok) throw new Error(authData.error_description || "البريد أو كلمة المرور غير صحيحة");

      const token = authData.access_token;
      localStorage.setItem('taqdeem_token', token);
      const userId = authData.user.id;

      // 2. جلب بيانات الملف الشخصي من جدول profiles
      const profileResponse = await fetch(`${API_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: getHeaders(token)
      });

      if (!profileResponse.ok) throw new Error("فشل جلب بيانات الملف الشخصي من الجدول");

      const profileData = await profileResponse.json();
      if (!profileData || profileData.length === 0) throw new Error("المستخدم مسجل ولكن لا توجد بيانات في جدول profiles");
      
      return {
        id: profileData[0].id,
        email: profileData[0].email,
        role: profileData[0].role,
        createdAt: profileData[0].created_at,
        profile: profileData[0].profile_data
      };
    } catch (e: any) {
      console.error("Login Details:", e);
      if (e.message === 'Failed to fetch') {
        throw new Error("⚠️ تعذر الاتصال بسيرفر قاعدة البيانات. تأكد من إعدادات الـ API.");
      }
      throw e;
    }
  },

  updateProfile: async (userId: string, profile: UserProfile): Promise<void> => {
    try {
      const token = localStorage.getItem('taqdeem_token');
      const response = await fetch(`${API_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: getHeaders(token || undefined),
        body: JSON.stringify({ profile_data: profile })
      });
      if (!response.ok) {
        const err = await response.json();
        console.error("Profile sync failed:", err);
      }
    } catch (e) {
      console.error("Update failed:", e);
    }
  },

  getAllUsers: async (): Promise<UserAccount[]> => {
    try {
      const token = localStorage.getItem('taqdeem_token');
      const response = await fetch(`${API_URL}/rest/v1/profiles?select=*`, {
        headers: getHeaders(token || undefined)
      });
      if (!response.ok) {
        console.error("Admin fetch users failed");
        return [];
      }
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        email: item.email,
        role: item.role,
        createdAt: item.created_at,
        profile: item.profile_data
      }));
    } catch (e) {
      console.error("Admin Access Error:", e);
      return [];
    }
  }
};
