
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
  BookOpen,
  LayoutDashboard
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

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
  const suggestedModules = enrichedCatalog.filter(m => !m.isPurchased && !m.isPending).slice(0, 2);
  const completedModules = myModules.filter(m => m.status === ModuleStatus.COMPLETED);
  const progress = Math.round((completedModules.length / (myModules.length || 1)) * 100);
  const dailyCompletedCount = dailyTasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      {/* Hero Section Prestige */}
      <div className="bg-brand-900 pt-20 pb-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-500/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-400 font-black text-[10px] uppercase tracking-[0.4em]">
                <LayoutDashboard className="w-4 h-4" />
                Tableau de bord stratégique
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight">
                Propulsez votre <span className="text-brand-500">empire</span>, {user.firstName || 'Gérant'}
              </h1>
              <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
                Le succès ne vient pas de ce que vous faites occasionnellement, mais de ce que vous faites avec discipline tous les jours.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="px-10 py-5 bg-white rounded-[1.8rem] text-brand-900 shadow-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Maitrise</p>
                 <span className="text-4xl font-black leading-none">{progress}%</span>
              </div>
              <Link to="/results" className="bg-brand-500 text-white px-8 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/20 group">
                Boutique <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-32">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. Daily Discipline Bar */}
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Trophy className="w-48 h-48" />
               </div>
               <div className="relative z-10">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase text-[14px]">
                     <Zap className="w-6 h-6 text-brand-gold fill-current" />
                     Discipline du jour
                   </h2>
                   <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-full border border-slate-100">
                     <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${(dailyCompletedCount/3)*100}%` }}></div>
                     </div>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       {dailyCompletedCount} / 3 Validés
                     </span>
                   </div>
                 </div>
                 
                 <div className="grid md:grid-cols-3 gap-6">
                    {dailyTasks.map((task, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleToggleDailyTask(idx)}
                        className={`text-left p-6 rounded-3xl border-2 transition-all group/btn flex flex-col gap-4 h-full ${
                          task.completed 
                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 shadow-inner' 
                            : 'bg-white border-slate-50 hover:border-brand-500 hover:shadow-xl hover:shadow-slate-200/50'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                          task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-300 group-hover/btn:border-brand-500 group-hover/btn:text-brand-500'
                        }`}>
                          {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </div>
                        <span className={`text-sm font-bold leading-relaxed ${task.completed ? 'line-through opacity-50' : 'text-slate-800'}`}>
                          {task.task}
                        </span>
                      </button>
                    ))}
                 </div>
               </div>
            </section>

            {/* 2. My Masterclasses (The Owned Empire) */}
            <section>
              <div className="flex justify-between items-center mb-8 px-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-brand-600" />
                  Mes Masterclasses d'Excellence
                </h2>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  {myModules.length} Modules acquis
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {myModules.length > 0 ? (
                  myModules.map(mod => (
                    <ModuleDashboardCard key={mod.id} mod={mod} />
                  ))
                ) : (
                  <div className="md:col-span-2 bg-slate-50 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic mb-8">« Votre premier investissement doit être en vous-même. »</p>
                    <Link to="/results" className="bg-brand-600 text-white px-10 py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-700 transition shadow-2xl shadow-brand-200 inline-flex items-center gap-3">
                       Accéder au catalogue expert <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Action Plan (Strategic Commitments) */}
            <section className="bg-slate-900 rounded-[4rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none italic font-serif text-8xl">Action</div>
              <div className="flex justify-between items-center mb-12 relative z-10">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-4 uppercase text-[14px]">
                  <ListTodo className="w-6 h-6 text-brand-500" />
                  Plan d'Action Terrain
                </h2>
                {user.actionPlan && user.actionPlan.length > 0 && (
                  <span className="bg-white/10 text-brand-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                    {user.actionPlan.filter(a => !a.isCompleted).length} Actions en attente
                  </span>
                )}
              </div>

              <div className="space-y-4 relative z-10">
                {user.actionPlan && user.actionPlan.length > 0 ? (
                  user.actionPlan.map((item, idx) => (
                    <div key={idx} className={`p-8 rounded-[2rem] border transition-all flex items-start gap-8 group ${
                      item.isCompleted ? 'bg-white/5 border-white/5 opacity-40' : 'bg-white/10 border-white/10 hover:bg-white/[0.15] hover:border-brand-500/50'
                    }`}>
                      <button 
                        onClick={() => handleToggleCommitment(idx)}
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                          item.isCompleted ? 'bg-brand-500 border-brand-500 text-white' : 'bg-transparent border-white/20 text-white/20 hover:border-brand-500 hover:text-brand-500'
                        }`}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <div className="flex-grow pt-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">{item.moduleTitle}</span>
                          <span className="h-1 w-1 bg-white/20 rounded-full"></span>
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.date}</span>
                        </div>
                        <p className={`text-xl font-medium leading-relaxed font-serif ${item.isCompleted ? 'line-through' : 'text-white'}`}>
                          {item.action}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-[3rem]">
                    <p className="text-white/30 font-medium italic mb-6">Validez vos modules pour générer vos premiers engagements stratégiques.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Prestige & Coach */}
          <div className="lg:col-span-4 space-y-10">
            {/* Certifications Card */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-brand-500" />
                  <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Mes Certifications</h3>
                </div>
                <div className="bg-brand-50 text-brand-600 px-3 py-1 rounded-lg font-black text-xs">
                  {completedModules.length}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {BADGES.map(badge => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div key={badge.id} title={badge.description} className={`h-24 rounded-[2rem] flex flex-col items-center justify-center gap-2 border-2 transition-all duration-700 ${hasBadge ? 'bg-brand-50 border-brand-100 shadow-lg shadow-brand-500/5' : 'bg-slate-50 border-slate-50 grayscale opacity-20 scale-95'}`}>
                      <span className="text-3xl">{badge.icon}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coach Kita Card */}
            <div className="bg-brand-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-white pointer-events-none"><Sparkles className="w-24 h-24" /></div>
              <h3 className="font-black text-brand-400 mb-8 uppercase text-[10px] tracking-[0.4em]">Sagesse du Mentor</h3>
              <p className="text-2xl text-white italic leading-relaxed font-serif font-medium mb-12 relative z-10">
                « Celui qui déplace la montagne commence par enlever les petites pierres. »
              </p>
              <div className="flex items-center gap-5 pt-10 border-t border-white/10">
                <div className="h-20 w-20 rounded-[2rem] overflow-hidden shadow-2xl border-2 border-brand-400 rotate-2 group-hover:rotate-0 transition-transform duration-500">
                  <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-white uppercase tracking-widest block mb-1">Coach Kita</span>
                  <span className="text-[9px] text-brand-400 font-black uppercase tracking-widest opacity-80">Mentor d'Élite</span>
                </div>
              </div>
            </div>

            {/* Next Steps / Suggested Modules */}
            {suggestedModules.length > 0 && (
              <div className="space-y-6">
                 <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.4em] px-4">Prochaines Étapes</h3>
                 {suggestedModules.map(mod => (
                   <Link key={mod.id} to="/results" className="block bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                      <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest mb-3">{mod.topic}</p>
                      <h4 className="font-bold text-slate-900 mb-6 font-serif group-hover:text-brand-600 transition-colors">{mod.title}</h4>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masterclass Expert</span>
                         <PlusIcon className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:rotate-90 transition-all" />
                      </div>
                   </Link>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
  </svg>
);

const ModuleDashboardCard: React.FC<{ mod: any }> = ({ mod }) => (
  <div className={`bg-white rounded-[3rem] shadow-sm border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative ${
    mod.status === ModuleStatus.COMPLETED ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-100'
  }`}>
    <div className="p-10">
      <div className="flex justify-between items-start mb-8">
        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
          mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>{mod.topic}</span>
        
        {mod.status === ModuleStatus.COMPLETED ? (
          <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-100">
             <CheckCircle2 className="w-5 h-5" />
          </div>
        ) : (
          <div className="bg-brand-50 text-brand-600 px-3 py-1.5 rounded-xl text-[10px] font-black">
            {mod.score || 0}%
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-black text-slate-900 leading-tight font-serif mb-6 group-hover:text-brand-600 transition-colors">{mod.title}</h3>
      
      <div className="flex items-center gap-2 mb-10">
         <Coins className={`w-4 h-4 ${mod.status === ModuleStatus.COMPLETED ? 'text-emerald-300' : 'text-brand-500'}`} />
         <span className={`text-[10px] font-black uppercase tracking-widest ${mod.status === ModuleStatus.COMPLETED ? 'text-emerald-500' : 'text-slate-400'}`}>
            {mod.status === ModuleStatus.COMPLETED ? 'Certification Validée' : `${mod.tokens} jetons d'audit restants`}
         </span>
      </div>
      
      <div className="flex items-center justify-between pt-8 border-t border-slate-50">
        <div className="flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full ${mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-brand-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'}`}></div>
           <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
             {mod.status === ModuleStatus.COMPLETED ? 'Expert' : 'En Apprentissage'}
           </span>
        </div>
        
        <Link to={`/module/${mod.id}`} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${
          mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-brand-600 shadow-slate-200'
        }`}>
          {mod.status === ModuleStatus.COMPLETED ? 'Réviser' : 'Reprendre'}
        </Link>
      </div>
    </div>
  </div>
);

export default Dashboard;
