
import React, { useState, useEffect } from 'react';

interface Paper {
  id: number;
  content: string;
  author: string;
  color: string;
  timestamp: string;
  isFavorite: boolean;
}

const COLORS = ['bg-yellow-100', 'bg-blue-100', 'bg-pink-100', 'bg-green-100', 'bg-purple-100'];

const RollingPaper: React.FC<{ articleId: string }> = ({ articleId }) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [newContent, setNewContent] = useState('');
  const [author, setAuthor] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`rolling_${articleId}`);
    if (saved) setPapers(JSON.parse(saved));
  }, [articleId]);

  const saveToLocal = (data: Paper[]) => {
    setPapers(data);
    localStorage.setItem(`rolling_${articleId}`, JSON.stringify(data));
  };

  const addPaper = () => {
    if (!newContent.trim()) return;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newPaper: Paper = {
      id: Date.now(),
      content: newContent,
      author: author.trim() || '익명',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      timestamp: formattedDate,
      isFavorite: false
    };
    saveToLocal([newPaper, ...papers]);
    setNewContent('');
    setAuthor('');
  };

  const deletePaper = (id: number) => {
    if (confirm("이 메모를 삭제하시겠습니까?")) {
      saveToLocal(papers.filter(p => p.id !== id));
    }
  };

  const toggleFavorite = (id: number) => {
    saveToLocal(papers.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const startEdit = (paper: Paper) => {
    setEditId(paper.id);
    setEditContent(paper.content);
  };

  const saveEdit = () => {
    if (!editContent.trim()) return;
    saveToLocal(papers.map(p => p.id === editId ? { ...p, content: editContent } : p));
    setEditId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-10">
      <div className="bg-white border-2 border-dashed border-gray-200 p-8 rounded-[2rem] shadow-sm">
        <h4 className="font-black text-xl text-[#0F172A] mb-6 flex items-center gap-2">
          <span className="text-2xl">✍️</span> 당신의 한마디를 남겨주세요
        </h4>
        <textarea 
          placeholder="이 기사를 보고 무엇을 느끼셨나요? 자유롭게 의견을 공유해주세요."
          className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all mb-4 resize-none h-32 font-medium"
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="닉네임 (익명 가능)"
            className="flex-1 p-3 px-5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-sm"
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
          <button 
            onClick={addPaper} 
            className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            기록하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map(p => (
          <div 
            key={p.id} 
            className={`${p.color} p-6 rounded-3xl shadow-md relative group hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between min-h-[180px] border border-black/5`}
          >
            {editId === p.id ? (
              <div className="space-y-3">
                <textarea 
                  className="w-full p-3 rounded-xl bg-white/80 border-none focus:ring-2 focus:ring-blue-400 text-sm h-24 resize-none"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditId(null)} className="px-3 py-1 bg-gray-200 rounded-lg text-xs font-bold">취소</button>
                  <button onClick={saveEdit} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold">저장</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">{p.timestamp}</span>
                    <button 
                      onClick={() => toggleFavorite(p.id)}
                      className={`transition-colors ${p.isFavorite ? 'text-orange-500' : 'text-black/20 hover:text-orange-300'}`}
                    >
                      <svg className="w-6 h-6" fill={p.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                    </button>
                  </div>
                  <p className="text-[#0F172A] font-medium leading-relaxed whitespace-pre-wrap">"{p.content}"</p>
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-black/5 pt-4">
                  <p className="text-xs font-black text-black/60">by <span className="text-black">{p.author}</span></p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(p)}
                      className="p-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors text-blue-600"
                      title="수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button 
                      onClick={() => deletePaper(p.id)}
                      className="p-1.5 bg-white/50 hover:bg-white rounded-lg transition-colors text-red-600"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {papers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4 opacity-20">📭</div>
          <p className="text-gray-400 font-bold italic">아직 등록된 의견이 없습니다. 첫 번째 영감을 공유해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default RollingPaper;
