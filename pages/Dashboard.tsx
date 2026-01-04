
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, COACH_KITA_AVATAR, DAILY_CHALLENGES } from '../constants';
import { ModuleStatus, UserActionCommitment } from '../types';
import { saveUserProfile } from '../services/supabase';
import { 
  Award, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  Lock, 
  Play, 
  ShoppingCart, 
  Clock, 
  Calendar, 
  Zap, 
  ChevronRight,
  ListTodo,
  Trophy,
  ArrowRight,
  Circle,
  BookOpen
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (user) {
      // Gestion des défis quotidiens avec reset 24h
      const today = new Date().toLocaleDateString('fr-FR');
      const savedTasksRaw = localStorage.getItem(`daily_tasks_${user.uid}`);
      const savedDate = localStorage.getItem(`daily_date_${user.uid}`);

      if (savedDate === today && savedTasksRaw) {
        setDailyTasks(JSON.parse(savedTasksRaw));
      } else {
        // Sélection aléatoire de 3 défis
        const shuffled = [...DAILY_CHALLENGES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(t => ({ task: t, completed: false }));
        setDailyTasks(selected);
        localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(selected));
        localStorage.setItem(`daily_date_${user.uid}`, today);
      }
      setLoadingTasks(false);
    }
  }, [user]);

  if (!user) return null;

  const handleToggleDailyTask = (index: number) => {
    const updated = [...dailyTasks];
    updated[index].completed = !updated[index].completed;
    setDailyTasks(updated);
    localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(updated));
  };

  const handleToggleCommitment = async (commitmentIndex: number) => {
    if (!user.actionPlan) return;
    const updatedPlan = [...user.actionPlan];
    updatedPlan[commitmentIndex].isCompleted = !updatedPlan[commitmentIndex].isCompleted;
    
    try {
      await saveUserProfile({ ...user, actionPlan: updatedPlan });
      await refreshProfile();
    } catch (err) {
      console.error("Erreur mise à jour engagement:", err);
    }
  };

  const enrichedCatalog = TRAINING_CATALOG.map(m => {
    const isPurchased = user.purchasedModuleIds.includes(m.id);
    const isPending = user.pendingModuleIds.includes(m.id);
    const score = user.progress?.[m.id];
    const attempts = user.attempts?.[m.id] || 0;
    const tokens = Math.max(0, 3 - attempts);
    
    let status = ModuleStatus.LOCKED;
    if (isPurchased) {
      status = score !== undefined && score >= 80 ? ModuleStatus.COMPLETED : ModuleStatus.NOT_STARTED;
    }
    return { ...m, status, score, tokens, isPurchased, isPending };
  });

  const myModules = enrichedCatalog.filter(m => m.isPurchased);
  const pendingModules = enrichedCatalog.filter(m => m.isPending);
  const completedModules = myModules.filter(m => m.status === ModuleStatus.COMPLETED);
  const progress = Math.round((completedModules.length / (myModules.length || 1)) * 100);
  const dailyCompletedCount = dailyTasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Premium */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-50/30 blur-[100px] rounded-full -mr-24 -mt-24 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand-600 font-black text-[10px] uppercase tracking-[0.3em]">
                <Sparkles className="w-3 h-3" />
                Tableau de bord de l'excellence
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 tracking-tight">
                Bonjour, {user.firstName || 'gérant'}
              </h1>
              <p className="text-slate-500 font-medium text-lg">Incarnez le leader que votre salon mérite aujourd'hui.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/results" className="bg-emerald-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all hover:-translate-y-1">
                <ShoppingCart className="w-4 h-4" /> Boutique
              </Link>
              <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
                <div className="px-8 py-4 bg-brand-900 rounded-[1.5rem] text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Maitrise</p>
                  <span className="text-3xl font-black leading-none">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-12">
            
            {/* Section 1: Défis du Jour */}
            <section className="bg-brand-950 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700"><Trophy className="w-40 h-40" /></div>
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-10">
                   <h2 className="text-2xl font-bold font-serif italic flex items-center gap-3">
                     <Zap className="w-6 h-6 text-brand-gold fill-current" />
                     Défis du jour
                   </h2>
                   <div className="flex items-center gap-3">
                     <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold transition-all duration-500" style={{ width: `${(dailyCompletedCount/3)*100}%` }}></div>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/10">
                       {dailyCompletedCount} / 3 accomplis
                     </span>
                   </div>
                 </div>
                 
                 <div className="space-y-6">
                    {dailyTasks.map((task, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleToggleDailyTask(idx)}
                        className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center gap-6 group/btn ${
                          task.completed 
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-inner' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${
                          task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 group-hover/btn:border-white/40'
                        }`}>
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className={`text-lg font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>
                          {task.task}
                        </span>
                      </button>
                    ))}
                 </div>

                 {dailyCompletedCount === 3 && (
                   <div className="mt-8 p-6 bg-emerald-500 text-white rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-500 shadow-2xl shadow-emerald-900/40">
                     <Sparkles className="w-6 h-6" />
                     <p className="font-bold text-sm">Félicitations Expert ! Votre routine d'excellence est maintenue.</p>
                   </div>
                 )}
               </div>
            </section>

            {/* Section 2: Mes Engagements (Plan d'Action) */}
            <section>
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-3">
                  <ListTodo className="w-6 h-6 text-brand-600" />
                  Mon plan d'action stratégique
                </h2>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                {user.actionPlan && user.actionPlan.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {user.actionPlan.map((item, idx) => (
                      <div key={idx} className={`p-8 flex items-start gap-6 transition-colors hover:bg-slate-50/50 group ${item.isCompleted ? 'opacity-50' : ''}`}>
                        <button 
                          onClick={() => handleToggleCommitment(idx)}
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${
                            item.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'border-slate-200 text-slate-200 hover:border-brand-500'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{item.moduleTitle}</span>
                            <span className="text-[10px] text-slate-300 font-bold">• {item.date}</span>
                          </div>
                          <p className={`text-xl font-serif font-medium leading-relaxed ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {item.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center space-y-6">
                    <div className="h-20 w-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto">
                       <Circle className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 font-medium italic">Terminez un module pour sceller votre premier engagement.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Ma Progression (Modules possédés) */}
            <section>
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-brand-500" />
                  Mes Masterclasses acquises
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {myModules.length > 0 ? (
                  myModules.map(mod => (
                    <ModuleDashboardCard key={mod.id} mod={mod} />
                  ))
                ) : (
                  <div className="md:col-span-2 bg-white rounded-[3rem] p-12 text-center border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic mb-6">« Le savoir est le seul capital qui ne craint pas l'inflation. »</p>
                    <Link to="/results" className="inline-flex bg-brand-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-700 transition shadow-xl shadow-brand-200">
                       Débloquer mes premiers modules
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Section: En attente de validation */}
            {pendingModules.length > 0 && (
              <section className="animate-in slide-in-from-left duration-500">
                <div className="flex justify-between items-center mb-8 px-2">
                  <h2 className="text-2xl font-bold text-amber-600 font-serif flex items-center gap-3">
                    <Clock className="w-6 h-6" />
                    En attente de validation
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {pendingModules.map(mod => (
                    <ModuleDashboardCard key={mod.id} mod={mod} isPending />
                  ))}
                </div>
              </section>
            )}

            {/* Bouton catalogue discret */}
            <div className="pt-10 flex justify-center">
              <Link to="/results" className="flex items-center gap-3 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-brand-600 transition-all group">
                Accéder au catalogue complet <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-brand-500" />
                  <h3 className="font-serif font-bold text-slate-900 text-lg">Certificats</h3>
                </div>
                <span className="text-[10px] font-black text-brand-500">{completedModules.length}</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {BADGES.map(badge => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div key={badge.id} title={badge.description} className={`h-16 w-16 rounded-[1.4rem] flex items-center justify-center text-2xl border-2 transition-all duration-700 ${hasBadge ? 'bg-brand-50 border-brand-100 scale-100' : 'bg-slate-50 border-slate-100 grayscale opacity-20 scale-95'}`}>
                      {badge.icon}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none"><Sparkles className="w-24 h-24" /></div>
              <h3 className="font-black text-brand-900 mb-6 uppercase text-[10px] tracking-[0.4em] opacity-60">Sagesse du mentor</h3>
              <p className="text-xl text-brand-900 italic leading-relaxed font-serif font-medium mb-10 relative z-10">
                « Celui qui déplace la montagne commence par enlever les petites pierres. »
              </p>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-xl border-2 border-brand-100"><img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" /></div>
                <div><span className="text-[10px] font-black text-brand-900 uppercase tracking-widest block">Coach Kita</span><span className="text-[9px] text-brand-500 font-bold uppercase tracking-widest">Mentor élite</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleDashboardCard: React.FC<{ mod: any, isLocked?: boolean, isPending?: boolean }> = ({ mod, isLocked, isPending }) => (
  <div className={`bg-white rounded-[2.5rem] shadow-sm border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group ${
    isPending ? 'border-amber-200 bg-amber-50/20' : 
    isLocked ? 'opacity-50' : 
    mod.status === ModuleStatus.COMPLETED ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-100'
  }`}>
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
          isPending ? 'bg-amber-100 text-amber-600' : 
          mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>{mod.topic}</span>
        {isPending ? (
          <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
        ) : isLocked ? (
          <Lock className="w-5 h-5 text-slate-300" />
        ) : mod.status === ModuleStatus.COMPLETED ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        ) : (
          <div className="h-8 w-12 rounded-xl flex items-center justify-center text-xs border font-black bg-slate-50 text-slate-400">
            {mod.score || 0}%
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-900 leading-tight font-serif mb-4 group-hover:text-brand-600 transition-colors">{mod.title}</h3>
      
      {!isLocked && !isPending && (
        <div className="flex items-center gap-2 mb-8">
           <Coins className={`w-3.5 h-3.5 ${mod.status === ModuleStatus.COMPLETED ? 'text-emerald-300' : 'text-brand-500'}`} />
           <span className={`text-[9px] font-black uppercase tracking-widest ${mod.status === ModuleStatus.COMPLETED ? 'text-emerald-400' : 'text-slate-400'}`}>
              {mod.status === ModuleStatus.COMPLETED ? 'Certification Validée' : `${mod.tokens} jetons restants`}
           </span>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500' : isLocked ? 'bg-slate-300' : mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-500' : 'bg-brand-500'}`}></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {isPending ? 'En attente' : isLocked ? 'Verrouillé' : mod.status === ModuleStatus.COMPLETED ? 'Expert' : 'En cours'}
           </span>
        </div>
        {!isPending && (
          <Link to={isLocked ? '/results' : `/module/${mod.id}`} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${
            isLocked ? 'bg-slate-100 text-slate-500' : 
            mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-900 text-white hover:bg-brand-600'
          }`}>
            {isLocked ? 'Débloquer' : mod.status === ModuleStatus.COMPLETED ? 'Réviser' : 'Continuer'}
          </Link>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;
