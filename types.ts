
export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  image?: string;
}

export interface ExperienceEntry {
  id: string;
  lastTitle: string;
  company: string;
  periodFrom: string;
  periodTo: string;
  tasks: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  major: string;
  university: string;
  gradYear: string;
  documentAttached: boolean;
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
    avatar?: string;
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
  readiness: {
    available: boolean;
    startDate: string;
    workPermit: boolean;
  };
  links: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
}

export enum AppStep {
  WELCOME,
  ONBOARDING,
  DASHBOARD,
  INTERVIEW,
  CV_BUILDER,
  JOBS,
  PROFILE
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
