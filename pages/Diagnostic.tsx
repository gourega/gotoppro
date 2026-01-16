
import React, { useState } from 'react';
/* Fixed react-router-dom named export */
import { useNavigate } from 'react-router-dom';
import { DIAGNOSTIC_QUESTIONS } from '../constants';
import { ChevronLeft, Info } from 'lucide-react';

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

  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const progress = Math.round((currentIdx / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <button 
            onClick={() => navigate('/')} 
            className="mb-4 inline-flex items-center gap-2 text-slate-400 hover:text-brand-900 transition-colors font-black text-[10px] uppercase tracking-widest group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quitter
          </button>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Audit de Performance</h1>
          
          {/* Instructions text restored and highlighted */}
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-md mx-auto flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-brand-500 shrink-0" />
            Répondez aux questions pour obtenir votre plan d'action personnalisé.
          </p>
        </div>

        {/* Unified Progress Indicator - Placed right above the question */}
        <div className="w-full max-w-lg mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 px-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Progression</p>
              <p className="text-lg font-black text-slate-900">{progress}%</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Questionnaire</p>
              <p className="text-sm font-bold text-slate-900">
                Question <span className="text-brand-600 font-black">{currentIdx + 1}</span> 
                <span className="text-slate-300 mx-1">/</span> 
                <span className="text-slate-400 font-medium">{totalQuestions}</span>
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
            <div 
              className="h-full bg-brand-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
              style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-14 border border-white text-center relative overflow-hidden animate-in zoom-in-95 duration-500 delay-200 w-full">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[10rem] pointer-events-none italic font-serif leading-none select-none">?</div>
          
          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm border border-brand-100">
              {DIAGNOSTIC_QUESTIONS[currentIdx].category}
            </span>
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-12 leading-tight min-h-[100px] flex items-center justify-center max-w-xl mx-auto">
              {DIAGNOSTIC_QUESTIONS[currentIdx].text}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-sm mx-auto">
              <button 
                onClick={() => handleAnswer(true)}
                className="group relative overflow-hidden py-6 rounded-[1.5rem] bg-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                <span className="relative z-10">Oui, c'est fait</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button 
                onClick={() => handleAnswer(false)}
                className="group relative overflow-hidden py-6 rounded-[1.5rem] bg-rose-500 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                <span className="relative z-10">Non, pas encore</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-2 opacity-40">
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em]">
                 Soyez le plus sincère possible pour un résultat optimal
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
