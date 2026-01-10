
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, InterviewQuestion, InterviewFeedback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function cleanJSONResponse(text: string): string {
  if (!text) return "";
  // البحث عن محتوى بين علامات الكود ```json أو ```
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }
  // إذا لم توجد علامات الكود، نحاول تنظيف النص من أي زوائد
  return text.trim();
}

export async function searchRealJobs(interests: string[]): Promise<{title: string, company: string, location: string, platform: string, url: string, daysAgo: number}[]> {
  const query = `ابحث الآن عن أحدث 5 وظائف حقيقية في السعودية للمسميات: ${interests.join(', ')}. 
  يجب أن يكون الرد بتنسيق نصي بسيط كالتالي:
  المسمى | الشركة | المدينة | الرابط | منذ كم يوم`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction: "أنت محرك بحث وظيفي خبير. ابحث عن روابط حقيقية ومباشرة.",
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
          title: parts[0].replace(/[\[\]\-\*]/g, ''),
          company: parts[1],
          location: parts[2] || "المملكة العربية السعودية",
          platform: "بوابة توظيف",
          url: parts[3]?.startsWith('http') ? parts[3] : "https://www.google.com/search?q=" + encodeURIComponent(parts[0] + " " + parts[1]),
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
  const prompt = `أنت مدير توظيف خبير. ولد 5 أسئلة مقابلة لوظيفة "${jobTitle}" بمستوى "${difficulty}" باللغة العربية. الرد يجب أن يكون JSON فقط.`;

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
    const cleaned = cleanJSONResponse(response.text);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Gen Questions Error:", e);
    throw new Error("فشل في توليد الأسئلة");
  }
}

export async function analyzeInterview(answers: string[], jobTitle: string): Promise<InterviewFeedback> {
  const prompt = `حلل هذه الإجابات لمقابلة ${jobTitle}: ${answers.join(" | ")}. قدم تقييماً بالعربية كـ JSON.`;

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
    throw new Error("فشل تحليل المقابلة");
  }
}

export async function enhanceCVContent(profile: UserProfile): Promise<string> {
  const prompt = `بناءً على هذا الملف الشخصي: ${JSON.stringify(profile)}، صغ ملخصاً مهنياً وحسن الخبرات لتكون ATS-Friendly باللغة العربية.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text;
  } catch (e) {
    throw new Error("حدث خطأ أثناء تحسين السيرة");
  }
}

export async function tailorJobApplication(profile: UserProfile, jobTitle: string, company: string): Promise<{coverLetter: string, keyPoints: string[]}> {
  const prompt = `اكتب خطاب تغطية (Cover Letter) مخصص لشركة ${company} لوظيفة ${jobTitle} بناءً على هذا الملف: ${JSON.stringify(profile)}. الرد JSON.`;

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
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["coverLetter", "keyPoints"]
        }
      }
    });
    return JSON.parse(cleanJSONResponse(response.text));
  } catch (e) {
    return { coverLetter: "خطأ في التوليد", keyPoints: [] };
  }
}
