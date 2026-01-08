
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DAILY_CHALLENGES, COACH_KITA_AVATAR, TRAINING_CATALOG } from '../constants';
import { 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Circle,
  Wallet,
  Cloud,
  Plus,
  History,
  AlertCircle,
  BookOpen,
  Trophy,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);

  useEffect(() => {
    if (user) {
      const today = new Date().toLocaleDateString('fr-FR');
      const savedTasksRaw = localStorage.getItem(`daily_tasks_${user.uid}`);
      const savedDate = localStorage.getItem(`daily_date_${user.uid}`);

      if (savedDate === today && savedTasksRaw) {
        setDailyTasks(JSON.parse(savedTasksRaw));
      } else {
        const shuffled = [...DAILY_CHALLENGES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(t => ({ task: t, completed: false }));
        setDailyTasks(selected);
        localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(selected));
        localStorage.setItem(`daily_date_${user.uid}`, today);
      }
    }
  }, [user]);

  const purchasedModules = useMemo(() => {
    if (!user) return [];
    return TRAINING_CATALOG.filter(m => user.purchasedModuleIds.includes(m.id));
  }, [user]);

  const availableModules = useMemo(() => {
    if (!user) return [];
    return TRAINING_CATALOG.filter(m => !user.purchasedModuleIds.includes(m.id)).slice(0, 3);
  }, [user]);

  if (!user) return null;

  const progress = Math.round(((user.purchasedModuleIds?.filter(id => (user.progress?.[id] || 0) >= 80).length || 0) / (user.purchasedModuleIds?.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* BANDEAU KITA */}
      <div className="bg-emerald-600 text-white px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border-b border-emerald-400">
         <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
            <h3 className="text-sm font-bold">L'outil de gestion KITA est actif. Prêt à piloter votre salon ?</h3>
         </div>
         <button onClick={() => navigate('/caisse')} className="bg-amber-400 text-brand-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3">
           <Wallet className="w-4 h-4" /> OUVRIR MA CAISSE
         </button>
      </div>

      {/* HERO SECTION */}
      <div className="bg-brand-900 pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="space-y-6">
            <p className="text-brand-400 font-black text-[10px] uppercase tracking-[0.5em]">Gérant Go'Top Pro</p>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              Bonjour, <span className="text-brand-500 italic">{user.firstName}</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl italic opacity-80">
              « L'excellence est un art que l'on n'atteint que par l'exercice constant. »
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/10 flex items-center gap-4 shadow-2xl">
            <div className="bg-white p-6 rounded-[2rem] text-center min-w-[120px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Maîtrise</p>
              <p className="text-3xl font-black text-brand-900">{progress}%</p>
            </div>
            <button onClick={() => navigate('/results')} className="bg-amber-400 text-brand-900 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-amber-300 transition-all shadow-xl">
              BOUTIQUE <ArrowRight className="ml-2 inline-block w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 pb-32 space-y-12">
        
        {/* SECTION MES FORMATIONS (RESTAURÉE) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <BookOpen className="text-brand-500 w-6 h-6" /> Mon Parcours d'Élite
            </h2>
            <Link to="/results" className="text-brand-600 font-black text-[9px] uppercase tracking-widest hover:underline">Accéder au catalogue complet</Link>
          </div>

          {purchasedModules.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedModules.map(mod => {
                const score = user.progress?.[mod.id] || 0;
                return (
                  <Link key={mod.id} to={`/module/${mod.id}`} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between min-h-[220px]">
                    <div>
                      <span className="text-[8px] font-black text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-widest">{mod.topic}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-4 leading-tight group-hover:text-brand-600 transition-colors">{mod.title}</h3>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${score >= 80 ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score: {score}%</span>
                      </div>
                      <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
               <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Votre empire attend son premier pilier.</h3>
               <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Lancez votre diagnostic ou choisissez un module dans la boutique pour commencer votre ascension.</p>
               <button onClick={() => navigate('/results')} className="bg-brand-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl">Explorer la boutique</button>
            </div>
          )}
        </section>

        {/* BLOC CAISSE KITA */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-t-[8px] border-emerald-500 relative overflow-hidden group">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">MA GESTION QUOTIDIENNE (KITA)</h2>
                 <p className="text-slate-500 font-medium max-w-md">L'outil indispensable pour enregistrer vos ventes et sécuriser votre trésorerie en temps réel.</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button onClick={() => navigate('/caisse')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3">
                       <Plus className="w-4 h-4" /> Nouvelle vente
                    </button>
                    <button onClick={() => navigate('/caisse')} className="bg-slate-50 text-slate-400 border border-slate-100 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 flex items-center gap-3">
                       <History className="w-4 h-4" /> Consulter le journal
                    </button>
                 </div>
              </div>
              <div className="h-40 w-40 bg-emerald-50 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-transform duration-500">
                 <Wallet className="w-16 h-16 text-emerald-500" />
              </div>
           </div>
        </section>

        {/* DISCIPLINE DU JOUR */}
        <section className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
                <Zap className="w-5 h-5 text-amber-500 fill-current" /> Objectifs Prioritaires
              </h2>
           </div>
           <div className="grid md:grid-cols-3 gap-6">
              {dailyTasks.map((task, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    const updated = [...dailyTasks];
                    updated[idx].completed = !updated[idx].completed;
                    setDailyTasks(updated);
                    localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(updated));
                  }}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 text-left ${task.completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-50 hover:border-brand-500'}`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <p className={`text-sm font-bold leading-tight ${task.completed ? 'line-through text-slate-400 italic' : 'text-slate-700'}`}>{task.task}</p>
                </button>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
