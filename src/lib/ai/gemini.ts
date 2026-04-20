import { GoogleGenAI } from "@google/genai";

let cached: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

export const GEMINI_MODELS = {
  flash: "gemini-2.5-flash",
  pro: "gemini-2.5-pro",
} as const;
