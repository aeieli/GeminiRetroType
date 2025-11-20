import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Initialize lazily
const getAI = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generateInspiration = async (topic?: string): Promise<string> => {
  const genAI = getAI();
  if (!genAI) {
    console.warn("Gemini API Key not found. Returning fallback text.");
    return "The quick brown fox jumps over the lazy dog.\n(Add API_KEY to .env for AI inspiration)";
  }

  try {
    const prompt = topic 
      ? `Write a very short, cryptic, vintage-style typewriter poem or aphorism about: ${topic}. Max 20 words. Format as raw text.`
      : `Write a very short, nostalgic, vintage-style typewriter aphorism. Max 15 words. Format as raw text.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Inspiration fails me...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The machine is jammed.\n(API Error)";
  }
};