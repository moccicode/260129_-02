
export const APP_SPEC = {
  name: "Article Interactive Builder",
  version: "1.0.0",
  sections: [
    { id: "summary", title: "요약 및 핵심", strategy: "fast" },
    { id: "quiz", title: "퀴즈 챌린지", strategy: "ondemand" },
    { id: "game", title: "미니 게임", strategy: "ondemand" },
    { id: "fact_vs_inference", title: "사실 vs 추론", strategy: "ondemand" },
    { id: "deep_report", title: "심층 분석", strategy: "ondemand" },
    { id: "qa", title: "심층 Q&A", strategy: "ondemand" },
    { id: "media", title: "AI 이미지 & 유튜브 영상", strategy: "ondemand" },
    { id: "rolling_paper", title: "기사 리뷰 노트", strategy: "local" }
  ],
  modes: ["CLICK", "SCROLL"],
  error_handling: {
    timeout: 15000,
    retry_limit: 2,
    fallback: "Unknown"
  }
};
