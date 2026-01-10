
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, InterviewQuestion, InterviewFeedback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// وظيفة مساعدة لتنظيف نصوص JSON من أي Markdown محتمل
function cleanJSONResponse(text: string): string {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

export async function searchRealJobs(interests: string[]): Promise<{title: string, company: string, location: string, platform: string, url: string, daysAgo: number}[]> {
  const query = `ابحث عن وظائف حقيقية ومباشرة في السعودية للمسميات: ${interests.join(' و ')}.
  لكل وظيفة تجدها، قدم الإجابة بالتنسيق التالي حصراً:
  [المسمى] | [الشركة] | [المدينة] | [الرابط] | [عدد الأيام]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction: "أنت محرك بحث وظيفي متخصص في سوق العمل السعودي.",
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const results: any[] = [];
    const lines = text.split('\n').filter(l => l.includes('|'));
    
    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        results.push({
          title: parts[0].replace(/[\[\]]/g, ''),
          company: parts[1],
          location: parts[2] || "السعودية",
          platform: "بوابة التوظيف",
          url: parts[3] || "#",
          daysAgo: parseInt(parts[4]) || 0
        });
      }
    });
    return results;
  } catch (e) {
    console.error("Job Search Error:", e);
    return [];
  }
}

export async function generateInterviewQuestions(jobTitle: string, difficulty: string): Promise<InterviewQuestion[]> {
  const prompt = `أنت مدير توظيف محترف. قم بتوليد 5 أسئلة مقابلة لوظيفة "${jobTitle}" بصعوبة "${difficulty}" باللغة العربية.
  يجب أن يكون الرد بتنسيق JSON حصراً كصفوف داخل مصفوفة تحتوي على: id, type, question.`;

  try {
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
    return JSON.parse(cleanJSONResponse(response.text));
  } catch (e) {
    console.error("AI Question Gen Error:", e);
    throw new Error("فشل توليد الأسئلة، يرجى المحاولة لاحقاً.");
  }
}

export async function analyzeInterview(answers: string[], jobTitle: string): Promise<InterviewFeedback> {
  const prompt = `حلل إجابات مقابلة لوظيفة ${jobTitle}. الإجابات: ${answers.join(" | ")}.
  قدم التقييم بالعربية كـ JSON يتضمن: fluency (0-100), confidence, technicalRating, generalAdvice.`;

  try {
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
    return JSON.parse(cleanJSONResponse(response.text));
  } catch (e) {
    console.error("Interview Analysis Error:", e);
    throw new Error("فشل تحليل المقابلة.");
  }
}

export async function enhanceCVContent(profile: UserProfile): Promise<string> {
  const prompt = `بناءً على هذا الملف، قم بصياغة ملخص احترافي وتحسين مهام الخبرات لتكون متوافقة مع أنظمة ATS باللغة العربية.
  الملف: ${JSON.stringify(profile)}.
  الناتج يجب أن يكون نص Markdown مرتب.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text;
  } catch (e) {
    console.error("CV Enhance Error:", e);
    throw new Error("حدث خطأ في تحسين السيرة الذاتية.");
  }
}

// Fixed: Added missing tailorJobApplication function which was imported in JobList.tsx but not defined here.
export async function tailorJobApplication(profile: UserProfile, jobTitle: string, company: string): Promise<{coverLetter: string, keyPoints: string[]}> {
  const prompt = `بناءً على ملف المرشح التالي: ${JSON.stringify(profile)}
  قم بصياغة خطاب تغطية (Cover Letter) احترافي وباللغة العربية لوظيفة "${jobTitle}" في شركة "${company}".
  أيضاً، اذكر 3 نقاط قوة تجعل هذا المرشح مناسباً لهذه الوظيفة.
  يجب أن تكون الإجابة بتنسيق JSON حصراً كما يلي:
  {
    "coverLetter": "نص الخطاب هنا",
    "keyPoints": ["النقطة 1", "النقطة 2", "النقطة 3"]
  }`;

  try {
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
    return JSON.parse(cleanJSONResponse(response.text));
  } catch (e) {
    console.error("Tailor Job Application Error:", e);
    return {
      coverLetter: "عذراً، حدث خطأ أثناء تجهيز الخطاب المخصص. يمكنك التقديم مباشرة عبر الرابط.",
      keyPoints: []
    };
  }
}
