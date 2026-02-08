
export interface UserAccount {
  id: string;
  email: string;
  role: 'user' | 'recruiter' | 'admin';
  createdAt: string;
  profile: UserProfile;
  recruiterProfile?: RecruiterProfile;
  accessToken?: string;
}

export interface SponsoredAd {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  views: number;
  clicks: number;
  pricePerView: number;
  isActive: boolean;
}

export interface RecruiterProfile {
  companyName: string;
  responsibleName: string;
  phone: string;
  jobTitle: string;
  email: string;
}

export interface JobPost {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  qualification: string;
  englishLevel: string;
  vacancies: number;
  city: string;
  majors: string[];
  jobType: 'دوام كامل' | 'دوام جزئي' | 'عن بعد';
  description: string;
  externalLink?: string;
  createdAt: string;
  applicantsCount?: number;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  appliedAt: string;
  userProfile: UserProfile;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  image?: string;
}

export interface UserProfile {
  personalInfo: {
    fullName: string;
    gender: 'ذكر' | 'أنثى';
    birthDate: string;
    nationality: string;
    city: string;
    email: string;
    phone: string;
  };
  education: EducationEntry[];
  experience: {
    hasExperience: boolean;
    years: string;
    list: ExperienceEntry[];
  };
  skills: {
    technical: string[];
    tools: string[];
    englishLevel: string;
    softSkills: string[];
  };
  certifications: {
    hasCerts: boolean;
    list: Certification[];
  };
  jobInterests: {
    titles: string[];
    jobType: string;
    workStyle: string;
  };
  activity: {
    appliedJobs: any[];
    interviews: any[];
    credits: number;
  };
  links: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
  readiness: {
    available: boolean;
    startDate: string;
    workPermit: boolean;
  };
}

export interface EducationEntry {
  id: string;
  degree: string;
  major: string;
  university: string;
  gradYear: string;
  documentAttached: boolean;
  documentUrl?: string;
  documentName?: string;
}

export interface ExperienceEntry {
  id: string;
  lastTitle: string;
  company: string;
  periodFrom: string;
  periodTo: string;
  isCurrent: boolean;
  tasks: string;
}

export enum AppStep {
  WELCOME,
  AUTH,
  ONBOARDING,
  DASHBOARD,
  INTERVIEW,
  CV_BUILDER,
  JOBS,
  ADMIN_PANEL,
  RECRUITER_DASHBOARD
}

export interface InterviewQuestion {
  id: number;
  type: 'opening' | 'technical' | 'behavioral' | 'closing';
  question: string;
}

export interface InterviewFeedback {
  fluency: number;
  confidence: string;
  technicalRating: string;
  generalAdvice: string;
}
