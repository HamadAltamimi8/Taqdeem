
import { UserProfile } from './types';

export const INITIAL_PROFILE: UserProfile = {
  personalInfo: {
    fullName: '',
    gender: 'ذكر',
    birthDate: '',
    nationality: 'سعودي',
    city: '',
    email: '',
    phone: '',
  },
  education: [
    {
      id: '1',
      degree: 'بكالوريوس',
      major: '',
      university: '',
      gradYear: '',
      documentAttached: false
    }
  ],
  experience: {
    hasExperience: false,
    years: '0',
    list: [],
  },
  skills: {
    technical: [],
    tools: [],
    englishLevel: 'متوسط',
    softSkills: [],
  },
  certifications: {
    hasCerts: false,
    list: [],
  },
  jobInterests: {
    titles: [],
    jobType: 'دوام كامل',
    workStyle: 'حضوري',
  },
  readiness: {
    available: true,
    startDate: 'فوراً',
    workPermit: true,
  },
  links: {
    linkedin: '',
    github: '',
    portfolio: '',
  },
};

export const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export const ENGLISH_LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'محترف'];
export const JOB_TYPES = ['دوام كامل', 'دوام جزئي', 'تدريب', 'عمل حر'];
export const WORK_STYLES = ['عن بُعد', 'في مقر الشركة', 'هجين'];
export const DEGREES = ['ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'];
export const NATIONALITIES = ['سعودي', 'مصري', 'أردني', 'سوري', 'إماراتي', 'كويتي', 'آخر'];
export const START_DATES = ['فوراً', 'خلال أسبوع', 'خلال شهر'];

export const COMMON_SKILLS = ['Excel', 'Python', 'ERP Systems', 'البيع', 'التحليل المالي', 'تصميم UI/UX', 'إدارة المشاريع', 'SQL'];
export const SOFT_SKILLS = ['العمل الجماعي', 'مهارات التواصل', 'القيادة', 'إدارة الوقت', 'حل المشكلات'];
export const COMMON_JOB_TITLES = ['محاسب', 'محلل بيانات', 'أخصائي موارد بشرية', 'مدير مشاريع', 'مطور برمجيات', 'مندوب مبيعات', 'مصمم جرافيك', 'محامي', 'أخصائي قانوني'];
