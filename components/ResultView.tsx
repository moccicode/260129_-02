
import React, { useState, useEffect } from 'react';
import { AppConfig, FastPassData, OnDemandData, DeepReportContent } from '../types';
import { APP_SPEC } from '../AppSpec';
import { geminiService } from '../services/geminiService';
import SectionLoader from './SectionLoader';
import QuizComponent from './QuizComponent';
import GameComponent from './GameComponent';
import RollingPaper from './RollingPaper';
import QAComponent from './QAComponent';

interface ResultViewProps {
  config: AppConfig;
  fastData: FastPassData;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ config, fastData, onReset }) => {
  const [activeSection, setActiveSection] = useState('summary');
  const [onDemandData, setOnDemandData] = useState<Record<string, OnDemandData | null>>({});
  const [loadingSections, setLoadingSections] = useState<Record<string, boolean>>({});
  const [reportLang, setReportLang] = useState<'ko' | 'en'>('ko');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const loadSectionData = async (sectionId: string) => {
    if (onDemandData[sectionId] || loadingSections[sectionId]) return;
    
    setLoadingSections(prev => ({ ...prev, [sectionId]: true }));
    try {
      const data = await geminiService.fetchOnDemand(sectionId, config.pastedText || fastData.core_summary.detailed_summary);
      
      if (sectionId === 'media' && data?.image_prompt) {
         const imageUrl = await geminiService.generateSectionImage(data.image_prompt);
         data.image_data_url = imageUrl;
      }

      setOnDemandData(prev => ({ ...prev, [sectionId]: data }));
    } catch (err) {
      console.error(`Error loading section ${sectionId}`, err);
    } finally {
      setLoadingSections(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    
    utter.lang = 'ko-KR';
    utter.rate = 1.0; 
    utter.pitch = 1.05; 
    utter.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.includes('ko') && (v.name.includes('Natural') || v.name.includes('Google'))) 
                    || voices.find(v => v.lang.includes('ko'));
    if (koVoice) utter.voice = koVoice;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  const renderSection = (id: string) => {
    const data = onDemandData[id];
    const isLoading = loadingSections[id];

    switch (id) {
      case 'summary':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01703V14H12.017C14.2262 14 16.017 12.2091 16.017 10V7C16.017 5.89543 15.1216 5 14.017 5H5.01703C3.91246 5 3.01703 5.89543 3.01703 7V17C3.01703 19.2091 4.80789 21 7.01703 21H14.017Z"/></svg>
              </div>
              <h3 className="text-xl font-black text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🔖</span> 한 줄 요약
              </h3>
              <p className="text-xl text-blue-800 font-bold leading-relaxed italic">
                <span className="bg-yellow-200/60 px-1 rounded">"{fastData.core_summary.one_liner}"</span>
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative group">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span> 상세 요약 설명
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                {fastData.core_summary.detailed_summary}
              </p>
              <button 
                onClick={() => speak(fastData.core_summary.detailed_summary)} 
                disabled={isSpeaking}
                className={`mt-6 flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-full shadow-lg transition-all active:scale-95 ${isSpeaking ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSpeaking ? (
                   <span className="flex items-center gap-2">
                     <span className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
                     </span>
                     말하는 중...
                   </span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1h4zM4 8a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V9a1 1 0 011-1h1zm12 0a1 1 0 011 1v2a1 1 0 01-1 1h-1a1 1 0 01-1-1V9a1 1 0 011-1h1z"></path></svg>
                    자연스러운 음성으로 듣기
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xl text-[#0F172A] border-l-4 border-blue-500 pl-3">핵심 포인트</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fastData.core_summary.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-blue-50 transition-colors">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">{i+1}</span>
                    <span className="text-[#334155] font-semibold">
                      <span className="group-hover:bg-blue-100/50 transition-colors px-1 rounded">{b}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              {fastData.hashtags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors cursor-default">#{tag}</span>
              ))}
            </div>
          </div>
        );
      case 'quiz':
        return data?.quizzes ? <QuizComponent quizzes={data.quizzes} /> : <SectionLoader isLoading={isLoading} onLoad={() => loadSectionData(id)} />;
      case 'qa':
        return <QAComponent articleText={config.pastedText || fastData.core_summary.detailed_summary} />;
      case 'game':
        return data?.games ? <GameComponent game={data.games} /> : <SectionLoader isLoading={isLoading} onLoad={() => loadSectionData(id)} />;
      case 'fact_vs_inference':
        return data?.facts_vs_inference ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <h4 className="font-black text-emerald-800 mb-4 flex items-center gap-2">✅ FACT (사실)</h4>
                <div className="space-y-4">
                  {data.facts_vs_inference.facts.map((f, i) => (
                    <div key={i} className="text-sm bg-white p-3 rounded-lg shadow-sm border border-emerald-50">
                      <p className="font-bold text-emerald-900 mb-2">
                        <span className="bg-emerald-100 px-1 rounded">{f.claim}</span>
                      </p>
                      <p className="text-emerald-700 italic border-l-3 border-emerald-200 pl-3 text-xs leading-relaxed">"{f.source_quote}"</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                <h4 className="font-black text-amber-800 mb-4 flex items-center gap-2">🔍 INFERENCE (추론)</h4>
                <div className="space-y-4">
                  {data.facts_vs_inference.inferences.map((inf, i) => (
                    <div key={i} className="text-sm bg-white p-3 rounded-lg shadow-sm border border-amber-50">
                      <p className="font-bold text-amber-900 mb-1">
                        <span className="bg-amber-100 px-1 rounded">{inf.claim}</span>
                      </p>
                      <p className="text-amber-700 leading-relaxed mb-2">{inf.reasoning}</p>
                      <div className="flex justify-end">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${inf.confidence === 'high' ? 'bg-green-100 text-green-700' : inf.confidence === 'mid' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          신뢰도: {inf.confidence === 'high' ? '높음' : inf.confidence === 'mid' ? '보통' : '낮음'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : <SectionLoader isLoading={isLoading} onLoad={() => loadSectionData(id)} />;
      case 'deep_report':
        if (!data?.deep_report) return <SectionLoader isLoading={isLoading} onLoad={() => loadSectionData(id)} />;
        
        const content: DeepReportContent = data.deep_report[reportLang];

        return (
          <div className="space-y-8 text-[#334155]">
            <div className="flex justify-end mb-4">
              <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                <button 
                  onClick={() => setReportLang('ko')}
                  className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${reportLang === 'ko' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  KOREAN
                </button>
                <button 
                  onClick={() => setReportLang('en')}
                  className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${reportLang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ENGLISH
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="font-black text-xl text-[#0F172A] mb-4">{reportLang === 'ko' ? '왜 중요한가?' : 'Why It Matters?'}</h4>
              <p className="text-lg leading-relaxed">
                <span className="group-hover:bg-blue-100/30 transition-colors px-1 rounded">{content.why_it_matters}</span>
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-black text-lg text-[#0F172A] flex items-center gap-2">🌐 {reportLang === 'ko' ? '맥락 (Context)' : 'Context'}</h4>
                <p className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm leading-relaxed border-t-4 border-t-blue-400">{content.context}</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-lg text-[#0F172A] flex items-center gap-2">🎯 {reportLang === 'ko' ? '예상 영향' : 'Expected Impact'}</h4>
                <p className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm leading-relaxed border-t-4 border-t-emerald-400">{content.impact}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-black text-lg text-[#0F172A] mb-3">👥 {reportLang === 'ko' ? '주요 이해관계자' : 'Key Stakeholders'}</h4>
                <div className="flex flex-wrap gap-2">
                  {content.stakeholders.map((s, i) => <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm border border-blue-100 shadow-sm hover:scale-105 transition-transform"># {s}</span>)}
                </div>
              </div>
              <div>
                <h4 className="font-black text-lg text-[#0F172A] mb-3">❓ {reportLang === 'ko' ? '더 던져볼 질문들' : 'Open Questions'}</h4>
                <ul className="space-y-2">
                  {content.open_questions.map((q, i) => <li key={i} className="text-sm flex gap-2"><span className="text-blue-500 font-bold">Q.</span> <span className="hover:bg-blue-50 transition-colors px-1 rounded">{q}</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-8">
             <div className="space-y-4">
               <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                 <span className="text-2xl">🎨</span> AI 생성 이미지
               </h4>
               <div className="aspect-video bg-gray-100 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative group">
                 {data?.image_data_url ? (
                   <>
                     <img src={data.image_data_url} alt="AI Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs italic font-medium">기사 내용을 바탕으로 생성된 상징적 이미지입니다.</p>
                     </div>
                   </>
                 ) : (
                   <div className="text-center p-6 flex flex-col items-center">
                     <SectionLoader isLoading={isLoading} onLoad={() => loadSectionData(id)} />
                   </div>
                 )}
               </div>
             </div>

            <div className="bg-[#0F172A] text-white p-8 rounded-3xl shadow-2xl">
               <h4 className="font-black text-xl mb-6 text-blue-400 flex items-center gap-3">
                 <span className="text-2xl">📺</span> 관련 유튜브 영상 탐색
               </h4>
               <p className="text-sm text-gray-400 mb-8 border-b border-gray-800 pb-4">기사 핵심 키워드: <span className="text-white font-bold">{fastData.youtube_query}</span></p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group relative">
                    <div className="aspect-video bg-gray-800 rounded-2xl flex items-center justify-center text-xs text-gray-500 overflow-hidden shadow-lg border border-gray-700">
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(fastData.youtube_query)}`}
                        title="YouTube Search Result"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="mt-2 text-xs text-gray-400 text-center font-bold">영상 검색 결과 리스트 #1</p>
                  </div>
                  <div className="group flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-6 border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors">
                     <p className="text-gray-400 text-center text-sm mb-4">직접 유튜브에서 기사와 관련된 최신 정보를 확인해보세요!</p>
                     <a 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(fastData.youtube_query)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95"
                     >
                       YouTube에서 더보기
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                     </a>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'rolling_paper':
        return <RollingPaper articleId={fastData.article.url} />;
      default:
        return null;
    }
  };

  const Sidebar = () => (
    <aside className="w-full lg:w-72 lg:fixed lg:top-20 lg:bottom-0 lg:left-0 lg:border-r border-gray-100 bg-white/50 backdrop-blur-md z-40 lg:overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Content Navigation</p>
        {APP_SPEC.sections.map(sec => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                if (config.mode === 'SCROLL') {
                   document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-white scale-125' : 'bg-gray-200 group-hover:bg-blue-400'}`}></span>
              {sec.title}
              {isActive && (
                <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-10 p-6 pt-0 opacity-50">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
           <p className="text-[10px] font-black text-gray-400 mb-1">Target Audience</p>
           <p className="text-xs font-bold text-gray-700">{config.ageBand}대 독자</p>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onReset} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="hidden sm:block">
            <h2 className="text-lg font-black text-[#0F172A] line-clamp-1">{fastData.article.title}</h2>
            <p className="text-xs text-[#64748B] font-bold">{fastData.category} | {APP_SPEC.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-black text-gray-500 uppercase">{config.mode} MODE</span>
          </div>
          <a href={config.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-[#111827] text-white text-sm font-black rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-md">
            기사 원문 보기
          </a>
        </div>
      </header>

      <div className="lg:pl-72 flex flex-col min-h-[calc(100vh-80px)]">
        <Sidebar />

        <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10">
          {config.mode === 'CLICK' ? (
            <div className="animate-fadeIn">
              <section className="glass-card rounded-[2.5rem] p-10 shadow-2xl border-white relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                <div className="flex items-center justify-between mb-10 border-b-2 border-gray-50 pb-6">
                  <h3 className="text-3xl font-black text-[#0F172A]">
                    {APP_SPEC.sections.find(s => s.id === activeSection)?.title}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-widest text-gray-300 font-black">Interactive Section</span>
                    <span className="text-[10px] font-bold text-blue-500">Step {APP_SPEC.sections.findIndex(s => s.id === activeSection) + 1} of {APP_SPEC.sections.length}</span>
                  </div>
                </div>
                <div className="animate-slideUp">
                  {renderSection(activeSection)}
                </div>
              </section>
              
              <div className="mt-10 flex justify-between items-center px-4">
                <button 
                  onClick={() => {
                    const idx = APP_SPEC.sections.findIndex(s => s.id === activeSection);
                    if (idx > 0) setActiveSection(APP_SPEC.sections[idx-1].id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={activeSection === APP_SPEC.sections[0].id}
                  className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-black hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  이전 단계
                </button>
                <button 
                  onClick={() => {
                    const idx = APP_SPEC.sections.findIndex(s => s.id === activeSection);
                    if (idx < APP_SPEC.sections.length - 1) setActiveSection(APP_SPEC.sections[idx+1].id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={activeSection === APP_SPEC.sections[APP_SPEC.sections.length-1].id}
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  다음 단계
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-16 pb-20">
              {APP_SPEC.sections.map(sec => (
                <section key={sec.id} id={sec.id} className="glass-card rounded-[2.5rem] p-10 shadow-2xl border-white relative overflow-hidden group hover:shadow-blue-100 transition-all duration-500">
                   <div className="absolute top-0 left-0 w-2 h-0 group-hover:h-full bg-blue-600 transition-all duration-500"></div>
                   <h3 className="text-3xl font-black text-[#0F172A] mb-10 border-b-2 border-gray-50 pb-6">{sec.title}</h3>
                   <div className="animate-fadeIn">
                     {renderSection(sec.id)}
                   </div>
                </section>
              ))}
            </div>
          )}
        </main>
        
        <footer className="mt-auto py-10 px-6 border-t border-gray-100 text-center">
           <p className="text-xs font-bold text-gray-400">© 2025 {APP_SPEC.name}. Powered by Gemini AI Engine.</p>
        </footer>
      </div>
    </div>
  );
};

export default ResultView;
