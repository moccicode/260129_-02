
import { Type } from "@google/genai";

export const PROMPTS = {
  FAST_PASS: (title: string, text: string, age: string, tone: string) => `
    당신은 기사 분석 전문가입니다. 다음 기사를 분석하여 JSON 형식으로 반환하세요.
    반드시 기사의 내용만을 근거로 삼으세요. 부족하면 "알 수 없음"으로 표시하세요.
    
    기사 제목: ${title}
    기사 본문: ${text}
    타겟 독자: ${age}
    톤앤매너: ${tone}

    반환 스키마:
    {
      "article": { "title": string, "url": string, "publisher": string },
      "core_summary": { 
        "one_liner": "기사 내용을 가장 함축적으로 보여주는 한 줄 문장",
        "detailed_summary": "기사 본문의 핵심 흐름을 설명하듯 친절하게 2~3문장으로 요약한 내용",
        "bullets": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"] 
      },
      "hashtags": string[],
      "category": string,
      "immersion_points": string[],
      "youtube_query": "기사 주제와 관련된 유튜브 검색어 (한국어)"
    }
  `,
  QUIZ: (text: string) => `
    기사 내용을 바탕으로 4지선다 객관식 퀴즈 5개를 만드세요. JSON으로 반환하세요.
    { "quizzes": [{ "q": string, "choices": [string, string, string, string], "answer_index": number, "explain": string }] }
    기사 내용: ${text}
  `,
  DEEP_REPORT: (text: string) => `
    기사 내용을 심층 분석하여 한국어(ko)와 영어(en) 두 가지 버전으로 JSON으로 반환하세요.
    반환 스키마:
    { 
      "deep_report": { 
        "ko": { "why_it_matters": string, "context": string, "stakeholders": [string], "impact": string, "open_questions": [string] },
        "en": { "why_it_matters": string, "context": string, "stakeholders": [string], "impact": string, "open_questions": [string] }
      }
    }
    기사 내용: ${text}
  `,
  FACTS_VS_INFERENCE: (text: string) => `
    기사에서 사실(인용구 포함)과 추론(이유/확신도)을 분리하여 JSON으로 반환하세요.
    { "facts_vs_inference": { "facts": [{ "claim": string, "source_quote": string }], "inferences": [{ "claim": string, "reasoning": string, "confidence": "low"|"mid"|"high" }] } }
    기사 내용: ${text}
  `,
  GAMES: (text: string) => `
    기사 내용을 바탕으로 미니 게임용 데이터를 만드세요 (타임라인 또는 팩트체크). JSON으로 반환하세요.
    { "games": { "fact_or_infer": [{ "statement": string, "is_fact": boolean, "reasoning": string }] } }
    기사 내용: ${text}
  `,
  IMAGE: (text: string) => `
    이 기사를 상징하는 시각적 이미지를 생성하기 위한 구체적인 영어 프롬프트를 작성하여 JSON으로 반환하세요.
    { "image_prompt": string }
    기사 내용: ${text}
  `
};
