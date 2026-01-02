
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { ModuleStatus, UserActionCommitment } from '../types';
import { saveUserProfile } from '../services/supabase';
import ReactCanvasConfetti from 'react-canvas-confetti';
// Added Zap and Loader2 to the imports
import { ChevronLeft, Sparkles, Book, Award, ArrowRight, CheckCircle2, Zap, Loader2 } from 'lucide-react';

const ModuleView: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [shouldFire, setShouldFire] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const COACH_AVATAR_URL = "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=400&q=80";

  const module = useMemo(() => TRAINING_CATALOG.find(m => m.id === moduleId), [moduleId]);

  useEffect(() => {
    if (!user?.purchasedModuleIds.includes(moduleId || '')) {
      navigate('/dashboard');
    }
    window.scrollTo(0,0);
  }, [moduleId, user, navigate]);

  if (!module || !user) return null;

  const handleStartQuiz = () => setQuizState('active');

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentIdx < module.quiz_questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    let score = 0;
    finalAnswers.forEach((ans, i) => {
      if (ans === module.quiz_questions[i].correctAnswer) score++;
    });
    const percentage = Math.round((score / module.quiz_questions.length) * 100);

    const updatedUser = { ...user };
    if (!updatedUser.progress) updatedUser.progress = {};
    updatedUser.progress[module.id] = percentage;
    
    if (percentage >= 80) {
      setShouldFire(true);
      if (!updatedUser.badges.includes('first_module')) updatedUser.badges.push('first_module');
    }

    await saveUserProfile(updatedUser);
    await refreshProfile();
    setQuizState('results');
  };

  const handleCommit = async () => {
    if (!commitment.trim()) return;
    setIsSaving(true);
    const newCommitment: UserActionCommitment = {
      moduleId: module.id,
      moduleTitle: module.title,
      action: commitment,
      date: new Date().toLocaleDateString('fr-FR'),
      isCompleted: false
    };
    const updatedUser = { ...user };
    updatedUser.actionPlan = [...user.actionPlan, newCommitment];
    await saveUserProfile(updatedUser);
    await refreshProfile();
    setIsSaving(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {shouldFire && (
        <ReactCanvasConfetti
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}
          onInit={({ confetti }) => {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#0ea5e9', '#0c4a6e', '#fbbf24']
            });
            setShouldFire(false);
          }}
        />
      )}
      
      {/* Navigation Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-brand-900 transition-colors font-black text-[10px] uppercase tracking-widest group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('lesson')} 
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'lesson' ? 'bg-white text-brand-900 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Book className="w-3 h-3" />
              La Leçon
            </button>
            <button 
              onClick={() => setActiveTab('quiz')} 
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'quiz' ? 'bg-white text-brand-900 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Award className="w-3 h-3" />
              Certification
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-6 py-20 pb-32">
        {activeTab === 'lesson' ? (
          <article className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="text-center mb-20">
              <span className="text-[10px] font-black text-brand-500 bg-brand-50 px-5 py-2 rounded-full uppercase tracking-[0.3em] inline-block mb-8">{module.topic}</span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-tight mb-8">{module.title}</h1>
              <p className="text-xl md:text-2xl text-slate-500 font-serif italic max-w-xl mx-auto">
                "{module.mini_course}"
              </p>
            </div>

            <div className="prose prose-slate prose-xl max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-strong:text-brand-900 prose-li:text-slate-600">
               <div dangerouslySetInnerHTML={{ __html: module.lesson_content }} />
            </div>
            
            <div className="my-24 bg-brand-50 rounded-[4rem] p-12 md:p-16 border border-brand-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Sparkles className="w-32 h-32" />
               </div>
               
               <div className="flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
                 <div className="h-32 w-32 rounded-[2.5rem] bg-white shadow-2xl overflow-hidden p-1.5 rotate-3 group-hover:rotate-0 transition-transform flex-shrink-0">
                   <img src={COACH_AVATAR_URL} alt="Coach Kita" className="w-full h-full object-cover rounded-[2rem]" />
                 </div>
                 <div>
                   <h4 className="font-black text-brand-900 uppercase tracking-[0.4em] text-[10px] mb-6 flex items-center gap-2">
                     <div className="w-6 h-px bg-brand-900"></div>
                     Conseil de Coach Kita
                   </h4>
                   <p className="text-brand-950 font-serif italic leading-relaxed text-2xl">
                     "{module.coach_tip}"
                   </p>
                 </div>
               </div>
            </div>

            <div className="flex justify-center pt-10">
              <button 
                onClick={() => setActiveTab('quiz')} 
                className="bg-brand-900 text-white px-12 py-7 rounded-[2rem] font-black hover:bg-brand-800 transition shadow-[0_20px_60px_rgba(12,74,110,0.2)] flex items-center gap-4 group uppercase tracking-[0.2em] text-[11px]"
              >
                Passer la certification
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </article>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500 min-h-[600px] flex flex-col justify-center">
            {quizState === 'intro' && (
              <div className="text-center max-w-lg mx-auto">
                <div className="h-32 w-32 bg-slate-900 text-white rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Award className="w-12 h-12 relative z-10" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6 font-serif tracking-tight">Certification Professionnelle</h2>
                <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">
                  Validez vos acquis avec ce test de haute précision. Un score de <b className="text-slate-900">80%</b> est requis pour obtenir votre badge d'excellence.
                </p>
                <button onClick={handleStartQuiz} className="w-full bg-brand-600 text-white py-6 rounded-[2rem] font-black hover:bg-brand-700 transition shadow-xl shadow-brand-100 uppercase tracking-widest text-[11px]">Démarrer la session</button>
              </div>
            )}

            {quizState === 'active' && (
              <div className="w-full animate-in slide-in-from-right-10 duration-500">
                <div className="mb-16">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">Étape {currentIdx + 1} de {module.quiz_questions.length}</span>
                    <div className="flex gap-1.5">
                      {module.quiz_questions.map((_, i) => (
                        <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= currentIdx ? 'bg-brand-500' : 'bg-slate-100'}`}></div>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight tracking-tight">{module.quiz_questions[currentIdx].question}</h3>
                </div>
                
                <div className="grid gap-6">
                  {module.quiz_questions[currentIdx].options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleAnswer(i)} 
                      className="w-full text-left p-8 rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 hover:border-brand-500 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 font-bold text-slate-800 text-lg group flex items-center justify-between"
                    >
                      {opt}
                      <div className="h-6 w-6 rounded-full border-2 border-slate-200 group-hover:border-brand-500 group-hover:bg-brand-500 transition-all"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizState === 'results' && (
              <div className="text-center w-full animate-in zoom-in-95 duration-700">
                <div className="h-32 w-32 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
                <h2 className="text-5xl font-bold text-slate-900 font-serif mb-4 tracking-tight">Mission Accomplie !</h2>
                <div className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-black uppercase tracking-widest mb-16">
                  Score de certification : {user.progress?.[module.id]}%
                </div>
                
                <div className="bg-[#0c4a6e] rounded-[4rem] p-12 md:p-16 text-white text-left shadow-[0_40px_100px_rgba(12,74,110,0.2)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[10rem] pointer-events-none italic font-serif">Action</div>
                  <h4 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.5em] mb-8 flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-current" />
                    Engagement Immédiat
                  </h4>
                  <p className="text-2xl font-serif mb-12 leading-relaxed italic text-slate-200">"{module.strategic_mantra}"</p>
                  
                  <div className="mb-10">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Décidez de votre première action concrète :</label>
                    <textarea 
                      value={commitment} 
                      onChange={e => setCommitment(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-white placeholder-slate-600 outline-none ring-2 ring-transparent focus:ring-brand-500/30 focus:bg-white/10 transition text-xl font-medium" 
                      placeholder="Ex: Demain à 9h, je brief l'équipe sur..." 
                      rows={3} 
                    />
                  </div>
                  
                  <button 
                    onClick={handleCommit} 
                    disabled={isSaving || !commitment.trim()} 
                    className="w-full bg-brand-500 py-7 rounded-[2rem] font-black hover:bg-brand-400 transition-all disabled:opacity-20 shadow-2xl shadow-brand-500/20 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : "Sceller mon engagement"}
                    {!isSaving && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
