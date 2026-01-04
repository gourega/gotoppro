
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, COACH_KITA_AVATAR } from '../constants';
import { ModuleStatus, TrainingModule } from '../types';
import { Award, BookOpen, Target, ChevronRight, Sparkles, CheckCircle2, History, Users, Coins, Lock, Play } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  // Enrich ALL modules with status and tokens
  const enrichedCatalog = TRAINING_CATALOG.map(m => {
    const isPurchased = user.purchasedModuleIds.includes(m.id);
    const score = user.progress?.[m.id];
    const attempts = user.attempts?.[m.id] || 0;
    const tokens = Math.max(0, 3 - attempts);
    
    let status = ModuleStatus.LOCKED;
    if (isPurchased) {
      status = score !== undefined && score >= 80 ? ModuleStatus.COMPLETED : ModuleStatus.NOT_STARTED;
    }
    return { ...m, status, score, tokens, isPurchased };
  });

  const myModules = enrichedCatalog.filter(m => m.isPurchased);
  const catalogModules = enrichedCatalog.filter(m => !m.isPurchased);
  
  const completedModules = myModules.filter(m => m.status === ModuleStatus.COMPLETED);
  const progress = Math.round((completedModules.length / (myModules.length || 1)) * 100);

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
                Votre Espace Excellence
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 tracking-tight">
                Bonjour, {user.firstName || 'Gérant'}
              </h1>
              <p className="text-slate-500 font-medium text-lg">Prêt à élever les standards de votre salon aujourd'hui ?</p>
            </div>
            
            <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
              <div className="px-8 py-4 bg-brand-900 rounded-[1.5rem] text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Maîtrise</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black leading-none">{progress}%</span>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-brand-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="pr-8 pl-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certificats</p>
                <p className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                  {completedModules.length} <Award className="w-5 h-5 text-brand-500" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-16">
            {/* Section: Mes Modules (Propriété) */}
            <section>
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-3">
                  <Play className="w-6 h-6 text-brand-500 fill-current" />
                  Ma Progression
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {myModules.length > 0 ? (
                  myModules.map(mod => (
                    <ModuleDashboardCard key={mod.id} mod={mod} />
                  ))
                ) : (
                  <div className="md:col-span-2 bg-white rounded-[3rem] p-12 text-center border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic mb-6">"Le savoir est le seul capital qui ne craint pas l'inflation."</p>
                    <Link to="/quiz" className="inline-flex bg-brand-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-700 transition shadow-xl shadow-brand-200">
                       Débloquer mon premier module
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Section: Catalogue (Non achetés) */}
            <section>
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-3">
                  <Lock className="w-6 h-6 text-slate-400" />
                  Catalogue de l'Excellence
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {catalogModules.map(mod => (
                  <ModuleDashboardCard key={mod.id} mod={mod} isLocked />
                ))}
              </div>
            </section>

            {/* Strategic Actions */}
            <section className="bg-brand-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[12rem] pointer-events-none italic font-serif group-hover:scale-110 transition-transform duration-1000">Go'Top</div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <Target className="w-6 h-6 text-brand-400" />
                  </div>
                  <h2 className="text-2xl font-bold font-serif tracking-tight">Plan d'Action Stratégique</h2>
                </div>

                {user.actionPlan.length === 0 ? (
                  <div className="py-12 px-8 border-2 border-dashed border-white/10 rounded-[2.5rem] text-center bg-white/5">
                    <p className="text-slate-400 font-medium text-lg italic">"C'est l'action qui transforme le savoir en profit."</p>
                    <p className="text-[10px] text-brand-400 mt-4 font-black uppercase tracking-widest">Réussissez un quiz pour définir votre prochaine étape.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.actionPlan.map((action, idx) => (
                      <div key={idx} className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 flex items-center gap-8 hover:bg-white/10 transition-all group/action">
                        <div className={`h-12 w-12 rounded-[1.2rem] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${action.isCompleted ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-slate-700 bg-slate-900'}`}>
                          {action.isCompleted && <span className="text-white font-black text-lg">✓</span>}
                        </div>
                        <div className="flex-grow">
                           <p className={`text-xl font-medium leading-snug ${action.isCompleted ? 'line-through text-slate-500 italic' : 'text-slate-100'}`}>{action.action}</p>
                           <div className="flex items-center gap-3 mt-3">
                             <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">{action.moduleTitle}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{action.date}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-brand-500" />
                  <h3 className="font-serif font-bold text-slate-900 text-lg">Ma Collection</h3>
                </div>
                <span className="text-[10px] font-black text-brand-500">{user.badges.length} / {BADGES.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {BADGES.map(badge => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div key={badge.id} className="relative group flex flex-col items-center">
                      <div className={`h-20 w-20 rounded-[1.8rem] flex items-center justify-center text-3xl border-2 transition-all duration-700 shadow-sm ${hasBadge ? 'bg-brand-50 border-brand-100 scale-100' : 'bg-slate-50 border-slate-100 grayscale opacity-20'}`}>
                        {badge.icon}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none"><Sparkles className="w-24 h-24" /></div>
              <h3 className="font-black text-brand-900 mb-6 uppercase text-[10px] tracking-[0.4em] opacity-60">Sagesse du Mentor</h3>
              <p className="text-xl text-brand-900 italic leading-relaxed font-serif font-medium mb-10 relative z-10">
                "Votre certificat n'est que le début. La vraie certification se voit dans le regard de vos clients."
              </p>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-xl border-2 border-white"><img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" /></div>
                <div><span className="text-[10px] font-black text-brand-900 uppercase tracking-widest block">Coach Kita</span><span className="text-[9px] text-brand-500 font-bold uppercase tracking-widest">Expert Mentor</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponent for better organization
const ModuleDashboardCard: React.FC<{ mod: any, isLocked?: boolean }> = ({ mod, isLocked }) => (
  <div className={`bg-white rounded-[2.5rem] shadow-sm border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group ${isLocked ? 'opacity-70 bg-slate-50/50' : mod.status === ModuleStatus.COMPLETED ? 'border-brand-100' : 'border-slate-100'}`}>
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[9px] font-black text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-widest">{mod.topic}</span>
        {isLocked ? (
          <Lock className="w-5 h-5 text-slate-300" />
        ) : mod.status === ModuleStatus.COMPLETED ? (
          <div className="h-8 w-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-emerald-100 animate-in zoom-in-50">✓</div>
        ) : (
          <div className={`h-8 w-12 rounded-xl flex items-center justify-center text-xs border font-black ${mod.tokens === 0 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {mod.score || 0}%
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-900 leading-tight font-serif mb-4 group-hover:text-brand-600 transition-colors">{mod.title}</h3>
      
      {!isLocked && (
        <div className="flex items-center gap-2 mb-8">
           <Coins className={`w-3.5 h-3.5 ${mod.status === ModuleStatus.COMPLETED ? 'text-slate-300' : mod.tokens === 0 ? 'text-rose-400' : 'text-brand-500'}`} />
           <span className={`text-[9px] font-black uppercase tracking-widest ${mod.status === ModuleStatus.COMPLETED ? 'text-slate-300' : mod.tokens === 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {mod.status === ModuleStatus.COMPLETED ? 'Certifié' : `${mod.tokens} jetons restants`}
           </span>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-slate-300' : mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-500' : mod.tokens === 0 ? 'bg-rose-500' : 'bg-brand-500 animate-pulse'}`}></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {isLocked ? 'Verrouillé' : mod.status === ModuleStatus.COMPLETED ? 'Master' : mod.tokens === 0 ? 'Epuisé' : 'En cours'}
           </span>
        </div>
        {isLocked ? (
          <Link to="/results" className="px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] bg-slate-200 text-slate-500 hover:bg-brand-500 hover:text-white transition-all">
            Débloquer
          </Link>
        ) : (
          <Link to={`/module/${mod.id}`} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${mod.status === ModuleStatus.COMPLETED ? 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600' : mod.tokens === 0 ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-900 text-white hover:bg-brand-600'}`}>
            {mod.status === ModuleStatus.COMPLETED ? 'Revoir' : mod.tokens === 0 ? 'Racheter' : 'Entrer'}
          </Link>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;
