
import React, { useState } from 'react';
import { GameData } from '../types';

interface GameComponentProps {
  game: GameData;
}

const GameComponent: React.FC<GameComponentProps> = ({ game }) => {
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const factGame = game.fact_or_infer || [];
  if (factGame.length === 0) return <div>게임을 불러올 수 없습니다.</div>;

  const item = factGame[current];

  const handleGuess = (guess: boolean) => {
    if (feedback) return;
    const correct = guess === item.is_fact;
    setIsCorrect(correct);
    setFeedback(correct ? "정답입니다! 🎉" : "틀렸습니다. 🧐");
  };

  const next = () => {
    setFeedback(null);
    setIsCorrect(null);
    setCurrent(prev => (prev + 1) % factGame.length);
  };

  return (
    <div className="text-center space-y-8 py-6">
      <h4 className="text-lg font-bold text-gray-500">미니 게임: 사실인가 추론인가?</h4>
      <div className="min-h-[120px] flex items-center justify-center px-4">
        <p className="text-2xl font-black text-[#0F172A] leading-tight">"{item.statement}"</p>
      </div>
      
      {!feedback ? (
        <div className="flex gap-4 max-w-xs mx-auto">
          <button onClick={() => handleGuess(true)} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">FACT (사실)</button>
          <button onClick={() => handleGuess(false)} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">INFER (추론)</button>
        </div>
      ) : (
        <div className={`p-6 rounded-2xl animate-bounceIn ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="text-xl font-black mb-2">{feedback}</p>
          <p className="text-sm text-gray-700 mb-4">{item.reasoning}</p>
          <button onClick={next} className="px-8 py-2 bg-gray-900 text-white rounded-full font-bold">다음 문제</button>
        </div>
      )}
    </div>
  );
};

export default GameComponent;
