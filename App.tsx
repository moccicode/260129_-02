
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
      // Simulate/Perform content extraction or use pasted text
      const articleText = userConfig.pastedText || "기사 본문을 가져올 수 없습니다. 내용을 직접 붙여넣어 주세요.";
      const articleTitle = userConfig.url.split('/').pop() || "제목 없는 기사";

      const data = await geminiService.fetchFastPass(
        articleTitle,
        articleText,
        userConfig.ageBand,
        userConfig.tone
      );

      setFastData(data);
      setView('RESULT');
    } catch (err: any) {
      setError("빠른 생성을 생성하는 중 오류가 발생했습니다. (기사 본문 부족 또는 API 오류)");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setView('INPUT');
    setFastData(null);
    setConfig(null);
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
