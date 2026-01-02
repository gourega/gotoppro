
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIAGNOSTIC_QUESTIONS } from '../constants';

const Diagnostic: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<{questionId: number, answer: boolean}[]>([]);
  const navigate = useNavigate();

  const handleAnswer = (ans: boolean) => {
    const newResults = [...results, { questionId: DIAGNOSTIC_QUESTIONS[currentIdx].id, answer: ans }];
    setResults(newResults);
    if (currentIdx < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      localStorage.setItem('temp_quiz_results', JSON.stringify(newResults));
      navigate('/results');
    }
  };

  const progress = Math.round(((currentIdx + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
           <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
             <span>Progression</span>
             <span>{progress}%</span>
           </div>
           <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
             <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
           </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 text-center">
          <span className="inline-block px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase mb-6">
            {DIAGNOSTIC_QUESTIONS[currentIdx].category}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-12 min-h-[100px] flex items-center justify-center">
            {DIAGNOSTIC_QUESTIONS[currentIdx].text}
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => handleAnswer(true)}
              className="py-6 rounded-2xl bg-emerald-500 text-white font-bold text-xl shadow-lg hover:bg-emerald-600 transition transform hover:scale-105"
            >
              Oui
            </button>
            <button 
              onClick={() => handleAnswer(false)}
              className="py-6 rounded-2xl bg-rose-500 text-white font-bold text-xl shadow-lg hover:bg-rose-600 transition transform hover:scale-105"
            >
              Non
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
