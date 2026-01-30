
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

interface QAEntry {
  id: number;
  q: string;
  a: string;
  timestamp: string;
  isFavorite: boolean;
}

interface QAComponentProps {
  articleText: string;
}

const QAComponent: React.FC<QAComponentProps> = ({ articleText }) => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<QAEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites/history from local storage if needed, or just keep in session
  // For this app, we'll manage it in state, but user can see it during the session.

  const handleAsk = async () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);
    const q = question;
    setQuestion('');
    
    try {
      const answer = await geminiService.askQuestion(articleText, q);
      const now = new Date();
      const formattedDate = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newEntry: QAEntry = {
        id: Date.now(),
        q,
        a: answer || '답변을 생성할 수 없습니다.',
        timestamp: formattedDate,
        isFavorite: false
      };
      
      setHistory(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error(err);
      const now = new Date();
      const formattedDate = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      setHistory(prev => [{ 
        id: Date.now(), 
        q, 
        a: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 
        timestamp: formattedDate, 
        isFavorite: false 
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (id: number) => {
    setHistory(prev => prev.map(entry => 
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    ));
  };

  // Sort: Favorites first, then by timestamp descending
  const sortedHistory = [...history].sort((a, b) => {
    if (a.isFavorite === b.isFavorite) return b.id - a.id;
    return a.isFavorite ? -1 : 1;
  });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/50 p-6 rounded-[2rem] border-2 border-blue-100 shadow-inner">
        <h4 className="font-black text-[#0F172A] mb-4 flex items-center gap-2">
          <span className="text-2xl">🤔</span> 기사에 대해 무엇이든 물어보세요!
        </h4>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="질문을 입력해 주세요 (예: 이 사건의 원인은 무엇인가요?)"
            className="flex-1 p-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
          />
          <button 
            onClick={handleAsk}
            disabled={isLoading}
            className="px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : '질문하기'}
          </button>
        </div>
        <p className="text-[10px] text-blue-400 mt-3 font-bold flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
          기사 내용을 바탕으로 분석된 신뢰할 수 있는 답변을 제공합니다.
        </p>
      </div>

      <div className="space-y-6">
        {sortedHistory.map((item) => (
          <div key={item.id} className={`animate-fadeIn space-y-3 p-1 rounded-3xl transition-all ${item.isFavorite ? 'bg-orange-50/50 border-2 border-orange-100 shadow-md ring-2 ring-orange-50' : ''}`}>
            {item.isFavorite && (
              <div className="flex items-center gap-1 px-4 pt-2 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                Pinned Favorite
              </div>
            )}
            
            <div className="flex justify-end px-4">
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm relative group">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <p className="text-xs font-black text-gray-400 tabular-nums">{item.timestamp}</p>
                  <button 
                    onClick={() => toggleFavorite(item.id)}
                    className={`transition-colors p-1 rounded-lg ${item.isFavorite ? 'text-orange-500 bg-orange-100' : 'text-gray-300 hover:text-orange-400 hover:bg-gray-200'}`}
                    title={item.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    <svg className="w-4 h-4" fill={item.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-800">Q. {item.q}</p>
              </div>
            </div>

            <div className="flex justify-start px-4 pb-4">
              <div className="bg-white border border-blue-100 p-5 rounded-2xl rounded-tl-none max-w-[95%] shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-sm uppercase tracking-tighter">AI VERIFIED</span>
                  <p className="text-blue-600 font-black text-[10px] uppercase tracking-tighter">Reliable Analysis</p>
                </div>
                <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base">
                   {item.a.split('\n').map((line, idx) => (
                     <React.Fragment key={idx}>
                       {line}<br />
                     </React.Fragment>
                   ))}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {history.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <div className="text-4xl mb-4 opacity-20">💬</div>
            <p className="text-gray-400 font-bold italic">기사 내용에 대해 궁금한 점을 질문해 보세요.</p>
            <p className="text-gray-300 text-xs mt-1">예: "이 정책이 서민들에게 미치는 실질적인 영향은 무엇인가요?"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QAComponent;
