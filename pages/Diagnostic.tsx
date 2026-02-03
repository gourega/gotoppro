import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useNavigate, useLocation } from 'react-router-dom';
import { DIAGNOSTIC_QUESTIONS, RAYMOND_LOGO, RAYMOND_ADDRESS, RAYMOND_PHONE } from '../constants';
import { ChevronLeft, Info, AlertCircle, MapPin, Phone, Star, User, Sparkles, Scissors, UserCheck, Heart, ArrowRight } from 'lucide-react';

const Diagnostic: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [domain, setDomain] = useState('');
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<{questionId: number, answer: boolean}[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Capture du parrainage dès l'entrée sur le quiz
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('gotop_temp_ref', ref);
    }
  }, [location]);

  const handleStart = () => {
    if (!firstName || !gender || !domain) return;
    localStorage.setItem('temp_user_context', JSON.stringify({ firstName, gender, domain }));
    setShowIntro(false);
  };

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

  const domains = [
    { id: 'coiffure', label: 'Coiffure', icon: <Scissors className="w-4 h-4" /> },
    { id: 'esthetique', label: 'Esthétique / Soins', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'onglerie', label: 'Onglerie', icon: <Heart className="w-4 h-4" /> },
    { id: 'mixte', label: 'Mixte / Global', icon: <Star className="w-4 h-4" /> }
  ];

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#0c4a6e] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white text-[20rem] font-serif italic leading-none select-none">K</div>
        
        <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 relative z-10 animate-in zoom-in-95 duration-500">
           <div className="text-center mb-10">
              <div className="h-20 w-20 bg-brand-50 text-brand-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-brand-100">
                <UserCheck className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Faisons connaissance</h2>
              <p className="text-slate-500 font-medium text-sm italic">"Avant de scanner ton salon, dis-moi qui tu es pour que je puisse te conseiller au mieux."</p>
           </div>

           <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4 flex items-center gap-2">
                  <User className="w-3 h-3" /> Comment dois-je t'appeler ?
                </label>
                <input 
                  type="text" 
                  placeholder="Ton prénom" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-lg focus:ring-2 focus:ring-brand-500/20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Tu es plutôt...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setGender('M')}
                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${gender === 'M' ? 'bg-brand-900 text-white border-brand-900 shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border-transparent hover:border-brand-100'}`}
                  >
                    Un Passionné
                  </button>
                  <button 
                    onClick={() => setGender('F')}
                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${gender === 'F' ? 'bg-brand-900 text-white border-brand-900 shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border-transparent hover:border-brand-100'}`}
                  >
                    Une Passionnée
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Ton domaine principal</label>
                <div className="grid grid-cols-2 gap-3">
                   {domains.map(d => (
                     <button 
                       key={d.id}
                       onClick={() => setDomain(d.label)}
                       className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left ${domain === d.label ? 'bg-brand-50 border-brand-500 shadow-sm' : 'bg-slate-50 border-transparent hover:border-brand-100'}`}
                     >
                        <div className={`p-2 rounded-lg ${domain === d.label ? 'bg-brand-500 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>{d.icon}</div>
                        <span className={`text-[10px] font-black uppercase tracking-tight ${domain === d.label ? 'text-brand-900' : 'text-slate-500'}`}>{d.label}</span>
                     </button>
                   ))}
                </div>
              </div>

              <button 
                onClick={handleStart}
                disabled={!firstName || !gender || !domain}
                className="w-full bg-brand-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs shadow-xl hover:bg-black transition-all disabled:opacity-20 flex items-center justify-center gap-4 group"
              >
                Commencer mon audit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    );
  }

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
          
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-md mx-auto flex items-center justify-center gap-2 mb-4">
            <Info className="w-4 h-4 text-brand-500 shrink-0" />
            Répondez avec sincérité, {firstName}.
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 bg-white rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-1000 delay-300">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg overflow-hidden border border-brand-100 shadow-inner shrink-0">
                   <img src={RAYMOND_LOGO} alt="Raymond" className="w-full h-full object-cover" />
                </div>
                <div className="text-left border-r border-slate-100 pr-4 mr-1">
                   <p className="text-[8px] font-black text-brand-600 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                     <Star className="w-2 h-2 fill-current" /> Standard Excellence
                   </p>
                   <p className="text-[10px] font-bold text-slate-900 leading-none">Salon Chez Raymond</p>
                </div>
             </div>
             <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1.5">
                   <MapPin className="w-3 h-3 text-brand-500" />
                   <span className="text-[9px] font-bold uppercase tracking-tighter">{RAYMOND_ADDRESS}</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <Phone className="w-3 h-3 text-brand-500" />
                   <span className="text-[9px] font-bold uppercase tracking-tighter">{RAYMOND_PHONE}</span>
                </div>
             </div>
          </div>
        </div>

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

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-14 border border-white text-center relative overflow-hidden animate-in zoom-in-95 duration-500 delay-200 w-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[10rem] pointer-events-none italic font-serif leading-none select-none">?</div>
          
          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-1000">
               <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
               <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em]">
                 Soyez le plus sincère possible pour un résultat optimal
               </p>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;