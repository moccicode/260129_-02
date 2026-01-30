
import { GoogleGenAI, Type } from "@google/genai";
import { PROMPTS } from "../PromptPack";

export const geminiService = {
  async fetchFastPass(title: string, text: string, age: string, tone: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 텍스트가 부족할 경우를 대비해 검색 도구 활성화 여부 결정
    const isMinimalText = text.length < 50;
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          article: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING },
              publisher: { type: Type.STRING }
            },
            required: ["title", "url"]
          },
          core_summary: {
            type: Type.OBJECT,
            properties: {
              one_liner: { type: Type.STRING },
              detailed_summary: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["one_liner", "detailed_summary", "bullets"]
          },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          category: { type: Type.STRING },
          immersion_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          youtube_query: { type: Type.STRING }
        },
        required: ["article", "core_summary", "hashtags", "category", "youtube_query"]
      }
    };

    if (isMinimalText) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: PROMPTS.FAST_PASS(title, text, age, tone),
      config
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("JSON Parsing Error in fetchFastPass", e, response.text);
      throw new Error("응답 데이터 형식이 올바르지 않습니다.");
    }
  },

  async fetchOnDemand(section: string, text: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let prompt = "";
    let schema: any = null;

    switch (section) {
      case 'quiz': 
        prompt = PROMPTS.QUIZ(text);
        schema = {
          type: Type.OBJECT,
          properties: {
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  choices: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer_index: { type: Type.NUMBER },
                  explain: { type: Type.STRING }
                },
                required: ["q", "choices", "answer_index", "explain"]
              }
            }
          },
          required: ["quizzes"]
        };
        break;
      case 'deep_report': 
        prompt = PROMPTS.DEEP_REPORT(text);
        const reportContentSchema = {
          type: Type.OBJECT,
          properties: {
            why_it_matters: { type: Type.STRING },
            context: { type: Type.STRING },
            stakeholders: { type: Type.ARRAY, items: { type: Type.STRING } },
            impact: { type: Type.STRING },
            open_questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["why_it_matters", "context", "stakeholders", "impact", "open_questions"]
        };
        schema = {
          type: Type.OBJECT,
          properties: {
            deep_report: {
              type: Type.OBJECT,
              properties: {
                ko: reportContentSchema,
                en: reportContentSchema
              },
              required: ["ko", "en"]
            }
          },
          required: ["deep_report"]
        };
        break;
      case 'fact_vs_inference': 
        prompt = PROMPTS.FACTS_VS_INFERENCE(text);
        schema = {
          type: Type.OBJECT,
          properties: {
            facts_vs_inference: {
              type: Type.OBJECT,
              properties: {
                facts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      claim: { type: Type.STRING },
                      source_quote: { type: Type.STRING }
                    }
                  }
                },
                inferences: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      claim: { type: Type.STRING },
                      reasoning: { type: Type.STRING },
                      confidence: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        };
        break;
      case 'game': 
        prompt = PROMPTS.GAMES(text);
        schema = {
          type: Type.OBJECT,
          properties: {
            games: {
              type: Type.OBJECT,
              properties: {
                fact_or_infer: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      statement: { type: Type.STRING },
                      is_fact: { type: Type.BOOLEAN },
                      reasoning: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        };
        break;
      case 'media': 
        prompt = PROMPTS.IMAGE(text);
        schema = {
          type: Type.OBJECT,
          properties: {
            image_prompt: { type: Type.STRING }
          },
          required: ["image_prompt"]
        };
        break;
      default: return null;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    
    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error(`JSON Parsing Error in fetchOnDemand [${section}]`, e, response.text);
      return {};
    }
  },

  async askQuestion(articleText: string, question: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: PROMPTS.QA_ANSWER(articleText, question),
    });
    return response.text;
  },

  async generateSectionImage(prompt: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
