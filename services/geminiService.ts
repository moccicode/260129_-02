
import { GoogleGenAI, Type } from "@google/genai";
import { PROMPTS } from "../PromptPack";

const API_KEY = process.env.API_KEY || "";

export const geminiService = {
  async fetchFastPass(title: string, text: string, age: string, tone: string) {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: PROMPTS.FAST_PASS(title, text, age, tone),
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async fetchOnDemand(section: string, text: string) {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    let prompt = "";
    switch (section) {
      case 'quiz': prompt = PROMPTS.QUIZ(text); break;
      case 'deep_report': prompt = PROMPTS.DEEP_REPORT(text); break;
      case 'fact_vs_inference': prompt = PROMPTS.FACTS_VS_INFERENCE(text); break;
      case 'game': prompt = PROMPTS.GAMES(text); break;
      case 'media': prompt = PROMPTS.IMAGE(text); break;
      default: return null;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async askQuestion(articleText: string, question: string) {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: PROMPTS.QA_ANSWER(articleText, question),
    });
    return response.text;
  },

  async generateSectionImage(prompt: string) {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `Create an artistic image for: ${prompt}`,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  }
};
