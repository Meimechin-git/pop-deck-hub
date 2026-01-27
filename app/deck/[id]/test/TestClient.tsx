// app/deck/[id]/test/TestClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Card = {
  id: string;
  term: string;
  definition: string;
  sectionName: string;
};

export default function TestClient({ initialCards, deckId }: { initialCards: Card[], deckId: string }) {
  const [status, setStatus] = useState<'setup' | 'testing' | 'finished'>('setup');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [questionCount, setQuestionCount] = useState(initialCards.length);

  // --- 設定画面での処理 ---
  const startTest = () => {
    const shuffled = [...initialCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);
    setCards(selected);
    setStatus('testing');
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 200);
    } else {
      setStatus('finished');
    }
  };

  // ------------------------------------
  // 1. 設定画面 (Setup) - Zincテーマ
  // ------------------------------------
  if (status === 'setup') {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-zinc-200 mb-8">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Cards</p>
          <p className="text-5xl font-bold mb-8 text-zinc-900">{initialCards.length} <span className="text-sm font-normal text-zinc-400">cards</span></p>

          <label className="block text-left text-sm font-bold text-zinc-700 mb-4">How many questions?</label>
          <div className="flex gap-4 items-center">
            <input 
              type="range" 
              min="1" 
              max={initialCards.length} 
              value={questionCount} 
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="font-mono font-bold text-xl w-12 text-right">{questionCount}</span>
          </div>
        </div>

        <button 
          onClick={startTest}
          className="bg-zinc-900 text-white w-full py-4 rounded-xl text-lg font-bold shadow-xl shadow-zinc-200 hover:bg-zinc-800 hover:scale-105 transition transform"
        >
          Start Test
        </button>
        
        <Link href={`/deck/${deckId}`} className="block mt-6 text-sm font-bold text-zinc-400 hover:text-zinc-600">
          Cancel
        </Link>
      </div>
    );
  }

  // ------------------------------------
  // 2. 結果画面 (Finished) - Zincテーマ
  // ------------------------------------
  if (status === 'finished') {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="inline-block p-4 rounded-full bg-green-100 text-green-600 mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-zinc-900">Great Job!</h2>
        <p className="text-zinc-500 mb-10">You completed {cards.length} questions.</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition shadow-lg"
          >
            Play Again
          </button>
          <Link href={`/deck/${deckId}`} className="bg-white border border-zinc-200 text-zinc-700 px-8 py-3 rounded-xl font-bold hover:bg-zinc-50 transition">
            Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // 3. テスト中画面 (Testing) - Zinc & Indigoテーマ
  // ------------------------------------
  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
        <span>Question {currentIndex + 1} / {cards.length}</span>
        <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-500">{currentCard.sectionName}</span>
      </div>

      {/* Card Area (3D Flip) */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer h-80 w-full relative group [perspective:1000px] mb-10"
      >
        <div className={`
          w-full h-full absolute transition-all duration-500 
          [transform-style:preserve-3d] 
          ${isFlipped ? "[transform:rotateY(180deg)]" : ""}
        `}>
          
          {/* --- Surface (Question) --- */}
          <div className="absolute w-full h-full bg-white border border-zinc-200 rounded-3xl shadow-xl shadow-zinc-200/50 flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden]">
             <span className="text-xs font-bold text-zinc-400 mb-6 uppercase tracking-widest">Question</span>
             <h3 className="text-4xl font-bold text-zinc-800 break-words w-full">{currentCard.term}</h3>
             <p className="mt-8 text-zinc-300 text-xs animate-pulse">Tap to flip</p>
          </div>

          {/* --- Back (Answer) --- */}
          <div className="absolute w-full h-full bg-indigo-50 border border-indigo-100 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
             <span className="text-xs font-bold text-indigo-400 mb-6 uppercase tracking-widest">Answer</span>
             <h3 className="text-3xl font-bold text-indigo-900 break-words w-full">{currentCard.definition}</h3>
          </div>
          
        </div>
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="bg-zinc-900 text-white px-12 py-4 rounded-full text-lg font-bold shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition"
        >
          {currentIndex === cards.length - 1 ? "Finish Test" : "Next Question →"}
        </button>
      </div>
    </div>
  );
}