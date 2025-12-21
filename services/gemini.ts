
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, InterviewQuestion, InterviewFeedback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function searchRealJobs(interests: string[]): Promise<{title: string, company: string, location: string, platform: string, url: string}[]> {
  // صياغة أمر بحث مكثف ومحدد زمنياً
  const query = `أريد قائمة ضخمة تصل إلى 50 "وظيفة شاغرة" (Job Vacancies) حقيقية في السعودية لمسميات: ${interests.join('، ')}.
  المصادر الإلزامية: Bayt.com, LinkedIn, Indeed, Glassdoor.
  الشرط الزمني: يجب أن تكون الوظائف قد نُشرت خلال (اليوم) أو (آخر 7 أيام) كحد أقصى.
  تحذير أمني: يمنع منعاً باتاً ذكر أي أخبار، مقالات، تقارير، أو جمل افتتاحية مثل "إليك القائمة". ابدأ مباشرة بسرد الوظائف.
  تنسيق المخرجات لكل سطر: [المسمى الوظيفي] | [اسم الشركة] | [المدينة] | [اسم المنصة]`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      systemInstruction: `أنت محرك بحث وظائف مبرمج لجلب "بيانات خام" فقط. 
      قواعدك: 
      1. لا تكتب مقدمات أو خاتمات.
      2. لا تظهر أي خبر أو مقال (إذا وجدته، استبعده فوراً).
      3. ركز على Bayt.com و LinkedIn. 
      4. تأكد أن الوظيفة حديثة (خلال أسبوع).
      5. يجب أن يحتوي كل سطر على رابط تقديم حقيقي في بيانات الـ Grounding.`,
      tools: [{ googleSearch: {} }],
    },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const text = response.text || "";
  
  const results = [];
  const lines = text.split('\n').filter(l => l.trim().length > 15 && l.includes('|'));
  
  // نستخدم الروابط من الـ groundingMetadata لربطها بالأسطر
  for (let i = 0; i < lines.length; i++) {
    const chunk = chunks[i % chunks.length];
    const url = chunk?.web?.uri || "https://www.bayt.com/ar/saudi-arabia/jobs/";
    
    const parts = lines[i].split('|').map(p => p.trim().replace(/[*-]/g, ''));
    
    // فلترة إضافية للكلمات التي تشير للأخبار أو الجمل التقديمية
    const title = parts[0] || "وظيفة شاغرة";
    const forbiddenKeywords = ['إليك', 'أخبار', 'سوق', 'تحقق', 'اليوم', 'تقرير', 'توقعات'];
    const isNews = forbiddenKeywords.some(word => title.includes(word));

    if (parts.length >= 2 && !isNews) {
      results.push({
        title: title,
        company: parts[1] || "شركة كبرى",
        location: parts[2] || "المملكة العربية السعودية",
        platform: parts[3] || (url.includes('bayt') ? 'Bayt.com' : url.includes('linkedin') ? 'LinkedIn' : 'بوابة التوظيف'),
        url: url
      });
    }
  }

  return results;
}

export async function generateInterviewQuestions(jobTitle: string, difficulty: string): Promise<InterviewQuestion[]> {
  const prompt = `Generate 5 interview questions for the position of "${jobTitle}" at a "${difficulty}" difficulty level in Arabic.
  Return an array of objects with the following keys: id (number), type (one of: opening, technical, behavioral, closing), and question (string).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            type: { type: Type.STRING },
            question: { type: Type.STRING }
          },
          required: ["id", "type", "question"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeInterview(answers: string[], jobTitle: string): Promise<InterviewFeedback> {
  const prompt = `Analyze these interview answers for the role of ${jobTitle}. 
  Answers: ${answers.join(" | ")}.
  Provide feedback in Arabic including:
  1. Fluency percentage (0-100)
  2. Confidence level (string)
  3. Technical rating (string)
  4. General advice for improvement (string).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fluency: { type: Type.NUMBER },
          confidence: { type: Type.STRING },
          technicalRating: { type: Type.STRING },
          generalAdvice: { type: Type.STRING }
        },
        required: ["fluency", "confidence", "technicalRating", "generalAdvice"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function enhanceCVContent(profile: UserProfile): Promise<string> {
  const prompt = `Based on this user profile, generate a professional summary and enhance the experience/tasks to be more professional for a CV in Arabic.
  Profile: ${JSON.stringify(profile)}.
  Provide the result in a clean Markdown format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text;
}

export async function tailorJobApplication(profile: UserProfile, jobTitle: string, company: string): Promise<{ coverLetter: string, keyPoints: string[] }> {
  // Fix: education is an array of objects
  const prompt = `You are a job application expert. A user named ${profile.personalInfo.fullName} with a major in ${profile.education[0]?.major || 'N/A'} and ${profile.experience.years} years of experience is applying for the position of "${jobTitle}" at "${company}".
  
  Generate:
  1. A compelling, short professional cover letter in Arabic (خطاب تغطية).
  2. A list of 3 key skills/keywords from the user's background that match this specific company.
  
  Return in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coverLetter: { type: Type.STRING },
          keyPoints: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        // Fix: corrected required key list
        required: ["coverLetter", "keyPoints"]
      }
    }
  });

  return JSON.parse(response.text);
}
