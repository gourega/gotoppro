
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { ModuleStatus, UserActionCommitment } from '../types';
import { saveUserProfile } from '../services/supabase';
import Confetti from 'react-canvas-confetti';

const ModuleView: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [fire, setFire] = useState(false);
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
      setFire(true);
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      {fire && <Confetti fire={fire} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }} />}
      
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-brand-600 flex items-center gap-2 font-bold text-sm">
          ← Retour au tableau de bord
        </button>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('lesson')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'lesson' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500'}`}>Cours</button>
          <button onClick={() => setActiveTab('quiz')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'quiz' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500'}`}>Certification</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 min-h-[500px]">
        {activeTab === 'lesson' ? (
          <div className="p-8 md:p-12">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">{module.topic}</span>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-2">{module.title}</h1>
              </div>
              <div className="bg-brand-50 px-4 py-2 rounded-xl border border-brand-100">
                <p className="text-[10px] font-black text-brand-600 uppercase">Durée estimée</p>
                <p className="font-bold text-slate-900">10-15 min</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none prose-lg" dangerouslySetInnerHTML={{ __html: module.lesson_content }} />
            
            <div className="mt-16 bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">💡</div>
               <div className="h-20 w-20 rounded-2xl bg-white shadow-lg overflow-hidden flex-shrink-0 rotate-3 p-1">
                 <img src={COACH_AVATAR_URL} alt="Coach Kita" className="w-full h-full object-cover rounded-xl" />
               </div>
               <div>
                 <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-3">Le Conseil Privé de Coach Kita</h4>
                 <p className="text-slate-700 italic leading-relaxed text-lg">"{module.coach_tip}"</p>
               </div>
            </div>

            <div className="mt-16 flex justify-center">
              <button 
                onClick={() => setActiveTab('quiz')} 
                className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-brand-700 transition shadow-xl shadow-brand-200 transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs"
              >
                Passer la certification →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[500px]">
            {quizState === 'intro' && (
              <div className="text-center max-w-md">
                <div className="h-24 w-24 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <span className="text-5xl">🎯</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">Validation des acquis</h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">Obtenez 80% de bonnes réponses pour valider ce module et débloquer votre badge de compétence.</p>
                <button onClick={handleStartQuiz} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition shadow-xl shadow-slate-200 uppercase tracking-widest text-xs">Démarrer maintenant</button>
              </div>
            )}
            {quizState === 'active' && (
              <div className="w-full max-w-2xl">
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Question {currentIdx + 1} sur {module.quiz_questions.length}</p>
                    <span className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                      <span className="block h-full bg-brand-500 transition-all duration-300" style={{ width: `${((currentIdx + 1) / module.quiz_questions.length) * 100}%` }}></span>
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{module.quiz_questions[currentIdx].question}</h3>
                </div>
                <div className="grid gap-4">
                  {module.quiz_questions[currentIdx].options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleAnswer(i)} 
                      className="w-full text-left p-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 hover:border-brand-500 hover:bg-white hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 font-bold text-slate-700"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {quizState === 'results' && (
              <div className="text-center w-full max-w-2xl">
                <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">🏆</div>
                <h2 className="text-4xl font-bold text-slate-900 font-serif">Félicitations !</h2>
                <div className="mt-4 flex items-center justify-center gap-4">
                   <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600">Score final : {user.progress?.[module.id]}%</div>
                </div>
                
                <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-10 text-white text-left shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">📝</div>
                  <h4 className="text-brand-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Engagement Actionnel</h4>
                  <p className="text-2xl font-serif mb-8 leading-relaxed italic text-slate-200">"{module.strategic_mantra}"</p>
                  
                  <div className="mb-8">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Quel est votre premier engagement concret ?</label>
                    <textarea 
                      value={commitment} 
                      onChange={e => setCommitment(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder-slate-600 outline-none ring-2 ring-transparent focus:ring-brand-500 focus:bg-white/10 transition text-lg" 
                      placeholder="Ex: Je vais briefer mon équipe sur l'accueil demain matin..." 
                      rows={3} 
                    />
                  </div>
                  
                  <button 
                    onClick={handleCommit} 
                    disabled={isSaving || !commitment.trim()} 
                    className="w-full bg-brand-600 py-5 rounded-2xl font-black hover:bg-brand-700 transition disabled:opacity-20 shadow-xl shadow-brand-900/50 uppercase tracking-widest text-xs"
                  >
                    {isSaving ? 'Synchronisation...' : 'Enregistrer mon engagement'}
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
