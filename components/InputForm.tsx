
import React, { useState } from 'react';
import { AppConfig, AgeBand, Tone, Platform, Preference, AppMode } from '../types';

interface InputFormProps {
  onSubmit: (config: AppConfig) => void;
  isLoading: boolean;
  error: string | null;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, error }) => {
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('20s');
  const [tone, setTone] = useState<Tone>('newsroom');
  const [platform, setPlatform] = useState<Platform>('pc_web');
  const [mode, setMode] = useState<AppMode>('CLICK');
  const [preferences, setPreferences] = useState<Preference[]>(['summary', 'quiz_test']);

  const togglePref = (pref: Preference) => {
    setPreferences(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]);
  };

  const handleStart = () => {
    if (!url && !pastedText) {
      alert("기사 링크 또는 내용을 입력해주세요.");
      return;
    }
    onSubmit({ url, pastedText, ageBand, tone, platform, preferences, mode });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">
          Article Interactive <span className="text-blue-600">Builder</span>
        </h1>
        <p className="text-[#64748B]">기사 한 줄로 시작하는 나만의 인터랙티브 콘텐츠</p>
      </header>

      <div className="space-y-6 glass-card p-8 rounded-2xl shadow-xl">
        {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm mb-4">{error}</div>}

        <div>
          <label className="block text-sm font-bold text-[#0F172A] mb-2">기사 링크 (필수)</label>
          <input 
            type="url" 
            placeholder="https://example.com/news/123"
            className="w-full p-4 rounded-lg border-2 border-gray-100 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0F172A] mb-2">본문 내용 (선택/권장)</label>
          <textarea 
            placeholder="기사 내용을 붙여넣으면 더 정확하게 생성됩니다."
            rows={5}
            className="w-full p-4 rounded-lg border-2 border-gray-100 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none font-medium"
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">타겟 독자</label>
            <select 
              className="w-full p-3 rounded-lg border-2 border-gray-200 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold appearance-none cursor-pointer" 
              value={ageBand} 
              onChange={e => setAgeBand(e.target.value as AgeBand)}
            >
              {['10s','20s','30s','40s','50s','60s','70s'].map(age => <option key={age} value={age} className="bg-white text-black">{age}대</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">톤앤매너</label>
            <select 
              className="w-full p-3 rounded-lg border-2 border-gray-200 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold appearance-none cursor-pointer" 
              value={tone} 
              onChange={e => setTone(e.target.value as Tone)}
            >
              <option value="newsroom" className="bg-white text-black">정확/간결</option>
              <option value="friendly" className="bg-white text-black">친근함</option>
              <option value="humor" className="bg-white text-black">유머러스</option>
              <option value="teen" className="bg-white text-black">틴감성</option>
              <option value="factcheck" className="bg-white text-black">팩트중심</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0F172A] mb-2">진행 방식</label>
          <div className="flex gap-4">
            {['CLICK', 'SCROLL'].map(m => (
              <button 
                key={m}
                onClick={() => setMode(m as AppMode)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all font-bold bg-white text-black ${
                  mode === m 
                    ? 'border-blue-600 ring-4 ring-blue-50 shadow-md scale-[1.02]' 
                    : 'border-gray-100 hover:border-gray-300 opacity-80'
                }`}
              >
                {m === 'CLICK' ? '클릭형 (스텝)' : '스크롤형 (롱폼)'}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-5 rounded-xl bg-[#111827] text-white font-bold text-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl mt-4"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              빠르게 만들기...
            </span>
          ) : '콘텐츠 생성하기'}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
