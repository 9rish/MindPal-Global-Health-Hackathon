// src/utils/gemini.ts
import { GoogleGenerativeAI, GenerateContentRequest } from "@google/generative-ai";

// ✅ For Vite, env vars must start with VITE_
// Add VITE_GEMINI_API_KEY=your_api_key to .env
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ VITE_GEMINI_API_KEY is not set in .env. Gemini tips will not work properly.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const GEMINI_MODEL = "gemini-1.5-flash";

export async function getJournalTip(
  journalText: string,
  sentiment: "positive" | "neutral" | "negative"
): Promise<string | null> {
  if (!journalText || journalText.length < 20) {
    return null;
  }

  const prompt = `
You are a compassionate journal coach. 
The user has written the following journal entry and their sentiment is "${sentiment}". 
Provide one short, empathetic, and actionable tip to help them process or reflect.
Journal text:
"${journalText}"
Tip:
`;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const request: GenerateContentRequest = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const result = await model.generateContent(request);

    const tip =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    return tip.length > 0 ? tip : null;
  } catch (error) {
    console.error("❌ Error in getJournalTip:", error);
    return null;
  }
}
