
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DAILY_CHALLENGES, COACH_KITA_AVATAR } from '../constants';
import { 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Circle,
  Wallet,
  Cloud,
  Plus,
  History,
  AlertCircle
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

  if (!user) return null;

  const progress = Math.round(((user.purchasedModuleIds?.filter(id => (user.progress?.[id] || 0) >= 80).length || 0) / (user.purchasedModuleIds?.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* BANDEAU DE BIENVENUE & ACCÈS RAPIDE KITA */}
      <div className="bg-emerald-600 text-white px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border-b border-emerald-400">
         <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Nouveauté Stratégique</p>
              <h3 className="text-lg font-bold">L'outil de gestion KITA est prêt pour vous, {user.firstName || 'Alain'}.</h3>
            </div>
         </div>
         <button 
           onClick={() => navigate('/caisse')}
           className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
         >
           <Wallet className="w-5 h-5" />
           OUVRIR MA CAISSE KITA
         </button>
      </div>

      {/* HERO SECTION DYNAMIQUE */}
      <div className="bg-brand-900 pt-20 pb-40 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="space-y-6">
            <p className="text-brand-400 font-black text-[10px] uppercase tracking-[0.5em]">Tableau de bord gérant</p>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              Propulsez votre <br/> <span className="text-brand-500 italic">empire</span>, {user.firstName || 'Alain'}
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl italic">
              « Le succès ne vient pas de ce que vous faites occasionnellement, mais de ce que vous faites avec discipline tous les jours. »
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-2xl">
            <div className="bg-white p-8 rounded-[2.5rem] text-center min-w-[140px] shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Maîtrise</p>
              <p className="text-4xl font-black text-brand-900">{progress}%</p>
            </div>
            <button onClick={() => navigate('/results')} className="bg-brand-500 text-white px-10 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/20">
              BOUTIQUE <ArrowRight className="ml-2 inline-block w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 pb-32 space-y-12">
        
        {/* BLOC CAISSE KITA CENTRAL */}
        <section className="bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl border-t-[12px] border-emerald-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none italic font-serif text-[15rem] transition-transform duration-1000 group-hover:scale-110">Kita</div>
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-8 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">GESTION DE CAISSE</h2>
                    <span className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-emerald-200 flex items-center gap-2">
                      <Cloud className="w-4 h-4" /> {user.isKitaPremium ? 'PROTECTION CLOUD' : 'MODE LOCAL'}
                    </span>
                 </div>
                 <p className="text-slate-500 text-lg font-medium max-w-md leading-relaxed">Arrêtez de deviner vos bénéfices. Pilotez votre salon avec précision chirurgicale.</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-5">
                    <button onClick={() => navigate('/caisse')} className="bg-emerald-600 text-white px-10 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-500 transition-all flex items-center gap-3">
                       <Plus className="w-5 h-5" /> Enregistrer une vente
                    </button>
                    <button onClick={() => navigate('/caisse')} className="bg-slate-50 text-slate-400 border border-slate-100 px-10 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-3">
                       <History className="w-5 h-5" /> Historique complet
                    </button>
                 </div>
              </div>
              <div className="h-48 w-48 bg-emerald-50 rounded-[3.5rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-transform duration-500">
                 <Wallet className="w-20 h-20 text-emerald-500" />
              </div>
           </div>
        </section>

        {/* DISCIPLINE DU JOUR */}
        <section className="bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100">
           <div className="flex justify-between items-center mb-12">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-[0.2em]">
                <Zap className="w-6 h-6 text-amber-500 fill-current" /> Discipline du jour
              </h2>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-6 py-2.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                {dailyTasks.filter(t => t.completed).length} / 3 Objectifs validés
              </span>
           </div>
           <div className="grid md:grid-cols-3 gap-8">
              {dailyTasks.map((task, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    const updated = [...dailyTasks];
                    updated[idx].completed = !updated[idx].completed;
                    setDailyTasks(updated);
                    localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(updated));
                  }}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col gap-6 text-left relative overflow-hidden ${task.completed ? 'bg-emerald-50/50 border-emerald-200 opacity-60' : 'bg-white border-slate-50 hover:border-brand-500 hover:shadow-xl'}`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                    {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                  <p className={`text-lg font-bold leading-relaxed ${task.completed ? 'line-through text-slate-400 italic' : 'text-slate-700'}`}>{task.task}</p>
                </button>
              ))}
           </div>
        </section>

        {/* MENTOR KITA */}
        <section className="bg-brand-900 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden group">
           <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden border-4 border-brand-500 shrink-0 shadow-2xl">
                 <img src={COACH_KITA_AVATAR} alt="Coach" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-6 text-center md:text-left">
                 <p className="text-3xl font-serif italic text-slate-200 leading-relaxed">« On ne gère bien que ce que l'on mesure précisément chaque jour. Soyez le comptable de votre talent. »</p>
                 <div className="flex items-center justify-center md:justify-start gap-4">
                   <div className="h-px w-10 bg-brand-500"></div>
                   <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-500">Mentor Kita</p>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
