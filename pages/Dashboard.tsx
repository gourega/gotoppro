
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReferrals, updateUserProfile } from '../services/supabase';
import { DAILY_CHALLENGES, TRAINING_CATALOG, LEGACY_ID_MAP } from '../constants';
import { UserActionCommitment } from '../types';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ArrowRight,
  Wallet,
  BookOpen,
  Users,
  Package,
  Crown,
  Star,
  CheckCircle2,
  Play,
  Quote,
  CheckCircle,
  Circle,
  Calendar,
  Zap,
  Target,
  Trophy,
  Lock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  
  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);
  const isPerformance = useMemo(() => user?.hasPerformancePack || false, [user]);
  const isStockExpert = useMemo(() => user?.hasStockPack || false, [user]);

  // Initialisation de la Routine Quotidienne (3 défis par jour)
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

  const toggleTask = (index: number) => {
    const newTasks = [...dailyTasks];
    newTasks[index].completed = !newTasks[index].completed;
    setDailyTasks(newTasks);
    localStorage.setItem(`daily_tasks_${user!.uid}`, JSON.stringify(newTasks));
  };

  const completeCommitment = async (commitment: UserActionCommitment) => {
    if (!user) return;
    const newActionPlan = (user.actionPlan || []).map(a => 
      a.date === commitment.date && a.moduleId === commitment.moduleId 
      ? { ...a, isCompleted: true } 
      : a
    );
    await updateUserProfile(user.uid, { actionPlan: newActionPlan });
    refreshProfile();
  };

  // Sélection d'un mantra basé sur les modules possédés
  const mantra = useMemo(() => {
    const owned = TRAINING_CATALOG.filter(m => user?.purchasedModuleIds.includes(m.id));
    if (owned.length > 0) {
      const randomMod = owned[Math.floor(Math.random() * owned.length)];
      return randomMod.strategic_mantra;
    }
    return "L'excellence n'est pas une destination, c'est une discipline quotidienne.";
  }, [user?.purchasedModuleIds]);

  const stats = useMemo(() => {
    if (!user?.progress) return { completed: 0, percent: 0 };
    let completedCount = 0;
    TRAINING_CATALOG.forEach(module => {
      const legacyId = Object.keys(LEGACY_ID_MAP).find(key => LEGACY_ID_MAP[key] === module.id);
      const score = Math.max(
        Number(user.progress?.[module.id] || 0),
        legacyId ? Number(user.progress?.[legacyId] || 0) : 0
      );
      if (score >= 80) completedCount++;
    });
    return { completed: completedCount, percent: Math.round((completedCount / TRAINING_CATALOG.length) * 100) };
  }, [user]);

  if (!user) return null;

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.percent / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <KitaTopNav />

      {/* Hero Section avec Mantra */}
      <div className="bg-brand-900 pt-16 pb-40 px-6 relative overflow-hidden w-full border-b border-brand-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="mb-12 animate-in fade-in slide-in-from-top duration-1000">
            <div className="inline-flex flex-col items-center md:items-start">
               <div className="flex items-center gap-2 text-brand-400 font-black text-[8px] uppercase tracking-[0.4em] mb-3">
                  <Quote className="w-3 h-3 fill-current" /> Mantra Stratégique
               </div>
               <p className="text-xl md:text-3xl font-serif italic text-brand-200 border-l-2 border-brand-500 pl-6 py-2 leading-relaxed opacity-90 max-w-3xl">
                 "{mantra}"
               </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <p className="text-brand-400 font-black text-[10px] uppercase tracking-[0.5em]">{user.isAdmin ? 'Console Administrative' : 'Tableau de Bord'}</p>
                {isElite && !user.isAdmin && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[8px] font-black uppercase tracking-widest">
                    <Crown className="w-3 h-3" /> Membre Elite
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
                Bonjour, <span className="text-brand-500 italic">{user.firstName}</span>
              </h1>
            </div>
            
            {!user.isAdmin && (
              <div className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-2xl mb-4 group hover:bg-white/10 transition-all duration-500">
                <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                   <svg className="w-full h-full -rotate-90 overflow-visible">
                      <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                      <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-brand-500 transition-all duration-1000 ease-out" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white leading-none">{stats.percent}%</span>
                   </div>
                </div>
                <div className="pr-4">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Formation Globale</p>
                  <button onClick={() => navigate('/mes-formations')} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl">
                    MES COURS <ArrowRight className="ml-2 inline-block w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pb-32 space-y-12 relative z-20 w-full">
        
        {/* NOUVELLE SECTION : ROUTINE & ENGAGEMENTS */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Routine d'Excellence */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Routine d'Excellence</h3>
               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{dailyTasks.filter(t => t.completed).length}/3</span>
            </div>
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 space-y-4">
              {dailyTasks.map((t, i) => (
                <button 
                  key={i} 
                  onClick={() => toggleTask(i)}
                  className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left group ${t.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                >
                  {t.completed ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5 group-hover:text-brand-500" />}
                  <span className={`text-sm font-bold leading-relaxed ${t.completed ? 'text-emerald-700 line-through opacity-60' : 'text-slate-700'}`}>{t.task}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Plan de Transformation */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 flex items-center gap-2"><Target className="w-4 h-4 text-brand-600" /> Mon Plan de Transformation</h3>
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 min-h-[220px] flex flex-col">
              {user.actionPlan && user.actionPlan.filter(a => !a.isCompleted).length > 0 ? (
                <div className="space-y-4">
                   {user.actionPlan.filter(a => !a.isCompleted).map((a, i) => (
                     <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-brand-50/50 rounded-2xl border border-brand-100 group">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <Calendar className="w-3 h-3 text-brand-400" />
                             <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest">{new Date(a.date).toLocaleDateString('fr-FR')} — {a.moduleTitle}</span>
                           </div>
                           <p className="font-bold text-slate-900 leading-snug">"{a.action}"</p>
                        </div>
                        <button 
                          onClick={() => completeCommitment(a)}
                          className="px-5 py-2.5 bg-brand-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Marquer Fait
                        </button>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center py-10 opacity-40">
                   <Trophy className="w-12 h-12 text-slate-300 mb-4" />
                   <p className="text-sm font-medium italic text-center px-10 leading-relaxed">Aucun engagement en cours. Validez une certification pour définir votre prochaine action d'expert.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sections standard conservées mais décalées */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-t-[8px] border-amber-400 relative overflow-hidden group w-full">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <Wallet className="w-10 h-10 text-amber-500" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0">GESTION DES FINANCES</h2>
                 </div>
                 <p className="text-slate-500 font-medium max-w-md m-0 leading-relaxed">Suivez vos recettes, vos d&eacute;penses et recouvrez vos ardoises pour garantir la sant&eacute; financi&egrave;re de votre empire.</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button onClick={() => navigate('/caisse')} className="bg-brand-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-brand-950 transition-all">
                       Ouvrir la Caisse KITA <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                 </div>
              </div>
              <div className="h-40 w-40 bg-amber-50 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-transform duration-500">
                 <Star className="w-16 h-16 text-amber-500" />
              </div>
           </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-10">
           <div className="lg:col-span-6 bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                 <Package className="w-32 h-32 text-sky-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className="text-sky-400 font-black text-[11px] uppercase tracking-[0.3em] mb-4">LOGISTIQUE</h2>
                 <h3 className="text-2xl font-serif font-bold text-white mb-6">Gestion du Stock</h3>
                 <p className="text-slate-400 text-sm leading-relaxed mb-10 flex-grow">Contr&ocirc;lez vos produits et colorations. &Eacute;vitez les vols et les ruptures qui font perdre des clients.</p>
                 {isStockExpert ? (
                    <button onClick={() => navigate('/magasin')} className="w-full bg-sky-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-sky-400 transition-all flex items-center justify-center gap-3">
                       Acc&eacute;der au Magasin <ArrowRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button onClick={() => navigate('/results?pack=stock')} className="w-full bg-white/10 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                       <Lock className="w-4 h-4 text-sky-500" /> D&eacute;bloquer le Stock
                    </button>
                 )}
              </div>
           </div>

           <div className="lg:col-span-6 bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform group-hover:scale-110">
                 <Users className="w-32 h-32 text-emerald-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">HUMAINS</h2>
                 <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Ressources Humaines</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">Pilotez votre &eacute;quipe (commissions) et fid&eacute;lisez vos meilleures clientes VIP.</p>
                 {isPerformance ? (
                    <button onClick={() => navigate('/pilotage')} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                       Piloter le Staff <ArrowRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button onClick={() => navigate('/results?pack=performance')} className="w-full bg-slate-50 text-slate-400 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                       <Lock className="w-4 h-4 text-emerald-500" /> D&eacute;bloquer les RH
                    </button>
                 )}
              </div>
           </div>
        </div>

        <section className="bg-indigo-900 rounded-[4rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:scale-110">
              <BookOpen className="w-48 h-48 text-white" />
           </div>
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight m-0">FORMATION & EXCELLENCE</h2>
                 <p className="text-indigo-200 font-medium max-w-md m-0 leading-relaxed">Progressez dans vos modules, validez vos certifications et devenez un g&eacute;rant d&eacute;lite reconnu.</p>
                 <button onClick={() => navigate('/mes-formations')} className="bg-white text-indigo-900 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-all flex items-center gap-3 mx-auto md:mx-0">
                    Reprendre mes cours <Play className="w-4 h-4" />
                 </button>
              </div>
              <div className="h-44 w-44 bg-indigo-800 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500 border border-white/10">
                 <CheckCircle2 className="w-20 h-20 text-indigo-400" />
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
