
import React, { useState, useCallback } from 'react';
import { AppConfig, FastPassData, OnDemandData } from './types';
import InputForm from './components/InputForm';
import ResultView from './components/ResultView';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'INPUT' | 'RESULT'>('INPUT');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [fastData, setFastData] = useState<FastPassData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (userConfig: AppConfig) => {
    setIsLoading(true);
    setError(null);
    setConfig(userConfig);

    try {
      // 본문이 없으면 URL이라도 사용하여 검색 기반 생성 시도
      const articleText = userConfig.pastedText || `이 기사의 내용을 분석해줘. 기사 링크: ${userConfig.url}`;
      const articleTitle = userConfig.url.split('/').filter(Boolean).pop()?.split('?')[0] || "분석 대상 기사";

      const data = await geminiService.fetchFastPass(
        articleTitle,
        articleText,
        userConfig.ageBand,
        userConfig.tone
      );

      if (!data || !data.core_summary) {
        throw new Error("기사 분석 결과를 생성하지 못했습니다. 본문 내용을 직접 붙여넣어 보세요.");
      }

      setFastData(data);
      setView('RESULT');
    } catch (err: any) {
      console.error("API Error Detailed:", err);
      setError(err.message || "콘텐츠 생성 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setView('INPUT');
    setFastData(null);
    setConfig(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {view === 'INPUT' ? (
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      ) : (
        config && fastData && (
          <ResultView 
            config={config} 
            fastData={fastData} 
            onReset={reset} 
          />
        )
      )}
    </div>
  );
};

export default App;
