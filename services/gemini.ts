
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, InterviewQuestion, InterviewFeedback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function searchRealJobs(interests: string[]): Promise<{title: string, company: string, location: string, platform: string, url: string, daysAgo: number}[]> {
  const query = `ابحث عن وظائف حقيقية ومباشرة في السعودية للمسميات: ${interests.join(' و ')}.
  يجب أن تستخدم أداة البحث للعثور على روابط حقيقية.
  
  لكل وظيفة تجدها، قدم الإجابة بالتنسيق التالي حصراً:
  [المسمى] | [الشركة] | [المدينة] | [الرابط المباشر من نتائج البحث] | [عدد الأيام]
  
  ملاحظة هامة جداً: استخرج الرابط (URL) من metadata نتائج البحث (grounding chunks). لا تضع أرقاماً تسلسلية قبل المسمى الوظيفي.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      systemInstruction: "أنت محرك بحث وظيفي. مهمتك الأساسية هي استخراج روابط التقديم المباشرة. إذا وجدت رابطاً في نتائج البحث الميداني يؤدي لصفحة التقديم في LinkedIn أو بوابة توظيف الشركة، فاستخدمه فوراً.",
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const results: any[] = [];
  
  const lines = text.split('\n').filter(l => l.trim().includes('|'));
  
  lines.forEach((line, index) => {
    // تنظيف السطر من الأرقام التسلسلية والرموز في البداية (مثل 1. أو -)
    const cleanedLine = line.replace(/^\d+[\.\-\s]*/, '').trim();
    const parts = cleanedLine.split('|').map(p => p.trim().replace(/[*-]/g, ''));
    
    if (parts.length >= 2) {
      let jobTitle = parts[0];
      const company = parts[1];
      const location = parts[2] || "المملكة العربية السعودية";
      const daysAgo = parseInt(parts[4]) || 0;
      
      let finalUrl = "";

      // 1. البحث عن الرابط في Chunks أولاً لأنه الأكثر دقة
      const matchedChunk = chunks.find(chunk => {
        if (!chunk.web) return false;
        const searchPool = (chunk.web.title + " " + chunk.web.uri).toLowerCase();
        return searchPool.includes(company.toLowerCase()) || searchPool.includes(jobTitle.toLowerCase());
      });

      if (matchedChunk?.web?.uri) {
        finalUrl = matchedChunk.web.uri;
      } else {
        // 2. محاولة استخراج الرابط من النص إذا كان يبدو حقيقياً
        const providedUrl = parts[3];
        if (providedUrl && providedUrl.startsWith('http') && providedUrl.length > 20) {
          finalUrl = providedUrl;
        }
      }

      // 3. تنظيف مسمى الوظيفة من أي أرقام متبقية للرابط الاحتياطي
      const cleanTitleForSearch = jobTitle.replace(/^\d+[\.\-\s]*/, '').trim();

      if (!finalUrl || finalUrl.length < 15 || finalUrl.includes('google.com/search')) {
        const searchQuery = encodeURIComponent(`${cleanTitleForSearch} ${company} apply`);
        finalUrl = `https://www.google.com/search?q=${searchQuery}`;
      }

      let platform = "بوابة التوظيف";
      if (finalUrl.includes('linkedin')) platform = 'LinkedIn';
      else if (finalUrl.includes('bayt')) platform = 'Bayt.com';
      else if (finalUrl.includes('elm.sa')) platform = 'شركة علم';

      results.push({
        title: cleanTitleForSearch,
        company: company,
        location: location,
        platform: platform,
        url: finalUrl,
        daysAgo: daysAgo
      });
    }
  });

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
        required: ["coverLetter", "keyPoints"]
      }
    }
  });

  return JSON.parse(response.text);
}
