
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, COACH_KITA_AVATAR } from '../constants';
import { ModuleStatus } from '../types';
import { Award, BookOpen, Target, ChevronRight, Sparkles, CheckCircle2, History, Users, Coins, Lock, Play, ShoppingCart, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  // Enrich ALL modules with status and tokens
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
  const catalogModules = enrichedCatalog.filter(m => !m.isPurchased && !m.isPending);
  
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
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/results" className="bg-emerald-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all hover:-translate-y-1">
                <ShoppingCart className="w-4 h-4" /> Acheter des modules
              </Link>
              <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
                <div className="px-8 py-4 bg-brand-900 rounded-[1.5rem] text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Maîtrise</p>
                  <span className="text-3xl font-black leading-none">{progress}%</span>
                </div>
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
                    En attente de validation Wave
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {pendingModules.map(mod => (
                    <ModuleDashboardCard key={mod.id} mod={mod} isPending />
                  ))}
                </div>
                <div className="mt-8 bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 bg-amber-500 text-white rounded-full flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-amber-800 font-medium">
                    Une fois votre paiement reçu par Coach Kita, ces modules seront activés instantanément dans votre espace "Ma Progression".
                  </p>
                </div>
              </section>
            )}

            {/* Section: Catalogue (Non achetés) */}
            <section>
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-3">
                  <Lock className="w-6 h-6 text-slate-400" />
                  Catalogue de l'Excellence
                </h2>
                <Link to="/results" className="text-brand-600 font-black text-[10px] uppercase tracking-widest hover:underline">Voir tout le catalogue</Link>
              </div>

              <div className="grid md:grid-cols-2 gap-8 opacity-60">
                {catalogModules.slice(0, 4).map(mod => (
                  <ModuleDashboardCard key={mod.id} mod={mod} isLocked />
                ))}
              </div>
            </section>
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
                    <div key={badge.id} className={`h-16 w-16 rounded-[1.4rem] flex items-center justify-center text-2xl border-2 transition-all duration-700 ${hasBadge ? 'bg-brand-50 border-brand-100' : 'bg-slate-50 border-slate-100 grayscale opacity-20'}`}>
                      {badge.icon}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none"><Sparkles className="w-24 h-24" /></div>
              <h3 className="font-black text-brand-900 mb-6 uppercase text-[10px] tracking-[0.4em] opacity-60">Sagesse du Mentor</h3>
              <p className="text-xl text-brand-900 italic leading-relaxed font-serif font-medium mb-10 relative z-10">
                "Celui qui déplace la montagne commence par enlever les petites pierres."
              </p>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-xl"><img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" /></div>
                <div><span className="text-[10px] font-black text-brand-900 uppercase tracking-widest block">Coach Kita</span><span className="text-[9px] text-brand-500 font-bold uppercase tracking-widest">Mentor Elite</span></div>
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
    mod.status === ModuleStatus.COMPLETED ? 'border-emerald-100' : 'border-slate-100'
  }`}>
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
          isPending ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
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
           <Coins className={`w-3.5 h-3.5 ${mod.status === ModuleStatus.COMPLETED ? 'text-slate-300' : 'text-brand-500'}`} />
           <span className={`text-[9px] font-black uppercase tracking-widest ${mod.status === ModuleStatus.COMPLETED ? 'text-slate-300' : 'text-slate-400'}`}>
              {mod.status === ModuleStatus.COMPLETED ? 'Certifié' : `${mod.tokens} jetons restants`}
           </span>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500' : isLocked ? 'bg-slate-300' : mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-500' : 'bg-brand-500'}`}></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {isPending ? 'En attente' : isLocked ? 'Verrouillé' : mod.status === ModuleStatus.COMPLETED ? 'Master' : 'En cours'}
           </span>
        </div>
        {!isPending && (
          <Link to={isLocked ? '/results' : `/module/${mod.id}`} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${
            isLocked ? 'bg-slate-100 text-slate-500' : 'bg-slate-900 text-white hover:bg-brand-600'
          }`}>
            {isLocked ? 'Débloquer' : 'Entrer'}
          </Link>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;
