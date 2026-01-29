
import React, { useState } from 'react';
import { Quiz } from '../types';

interface QuizComponentProps {
  quizzes: Quiz[];
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizzes }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const quiz = quizzes[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (idx === quiz.answer_index) setScore(prev => prev + 1);
  };

  const next = () => {
    setSelectedIdx(null);
    setIsAnswered(false);
    setCurrentIdx(prev => prev + 1);
  };

  if (currentIdx >= quizzes.length) {
    return (
      <div className="text-center py-10">
        <h4 className="text-3xl font-black text-blue-600 mb-2">종료!</h4>
        <p className="text-lg text-gray-600 mb-6">당신의 점수: <span className="font-bold text-gray-900">{score} / {quizzes.length}</span></p>
        <button onClick={() => { setCurrentIdx(0); setScore(0); }} className="px-6 py-2 bg-gray-900 text-white rounded-lg">다시 풀기</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
        <span>Question {currentIdx + 1} / {quizzes.length}</span>
        <span className="text-blue-500">SCORE: {score}</span>
      </div>
      <h4 className="text-xl font-bold text-[#0F172A] leading-snug">{quiz.q}</h4>
      <div className="grid grid-cols-1 gap-3">
        {quiz.choices.map((choice, i) => {
          const isCorrect = i === quiz.answer_index;
          const isSelected = i === selectedIdx;
          let variant = "bg-white border-gray-200 hover:border-blue-400";
          
          if (isAnswered) {
            if (isCorrect) variant = "bg-green-100 border-green-500 text-green-900";
            else if (isSelected) variant = "bg-red-100 border-red-500 text-red-900";
            else variant = "bg-gray-50 border-gray-100 opacity-50";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`p-4 text-left rounded-xl border-2 transition-all font-medium ${variant}`}
            >
              <span className="inline-block w-6 font-bold">{String.fromCharCode(65 + i)}.</span>
              {choice}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <div className="p-4 bg-gray-100 rounded-xl mt-4 animate-fadeIn">
          <p className="text-sm font-bold text-gray-900 mb-1">💡 해설</p>
          <p className="text-sm text-gray-600">{quiz.explain}</p>
          <button onClick={next} className="mt-4 w-full py-3 bg-[#111827] text-white rounded-lg font-bold">
            {currentIdx === quizzes.length - 1 ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
