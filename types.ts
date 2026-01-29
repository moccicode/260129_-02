
export type AgeBand = '10s' | '20s' | '30s' | '40s' | '50s' | '60s' | '70s';
export type Tone = 'newsroom' | 'friendly' | 'humor' | 'docu' | 'business' | 'teen' | 'factcheck';
export type Platform = 'pc_web' | 'mobile_web' | 'naver_card' | 'youtube_script';
export type Preference = 'quiz_test' | 'game' | 'summary' | 'video_link' | 'tts_audio' | 'deep_report';
export type AppMode = 'CLICK' | 'SCROLL';

export interface AppConfig {
  url: string;
  pastedText: string;
  ageBand: AgeBand;
  tone: Tone;
  platform: Platform;
  preferences: Preference[];
  mode: AppMode;
}

export interface ArticleBase {
  title: string;
  url: string;
  publisher?: string;
  published_at?: string;
}

export interface FastPassData {
  article: ArticleBase;
  core_summary: {
    one_liner: string;
    detailed_summary: string;
    bullets: string[];
  };
  hashtags: string[];
  category: string;
  immersion_points: string[];
  youtube_query: string;
}

export interface Quiz {
  q: string;
  choices: string[];
  answer_index: number;
  explain: string;
}

export interface DeepReportContent {
  why_it_matters: string;
  context: string;
  stakeholders: string[];
  impact: string;
  open_questions: string[];
}

export interface DeepReport {
  ko: DeepReportContent;
  en: DeepReportContent;
}

export interface Fact {
  claim: string;
  source_quote: string;
}

export interface Inference {
  claim: string;
  reasoning: string;
  confidence: 'low' | 'mid' | 'high';
}

export interface FactsVsInference {
  facts: Fact[];
  inferences: Inference[];
}

export interface GameData {
  timeline?: { items: string[]; answer_order: number[] };
  match?: { pairs: { left: string; right: string }[] };
  fact_or_infer?: { statement: string; is_fact: boolean; reasoning: string }[];
}

export interface OnDemandData {
  quizzes?: Quiz[];
  deep_report?: DeepReport;
  facts_vs_inference?: FactsVsInference;
  games?: GameData;
  image_prompt?: string;
  image_data_url?: string;
}
