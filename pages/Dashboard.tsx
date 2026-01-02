
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, COACH_KITA_AVATAR } from '../constants';
import { ModuleStatus } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  // Enrich modules with user progress
  const enrichedModules = TRAINING_CATALOG.map(m => {
    const isPurchased = user.purchasedModuleIds.includes(m.id);
    const score = user.progress?.[m.id];
    let status = ModuleStatus.LOCKED;
    if (isPurchased) status = score !== undefined ? ModuleStatus.COMPLETED : ModuleStatus.NOT_STARTED;
    return { ...m, status, score };
  });

  const completedCount = enrichedModules.filter(m => m.status === ModuleStatus.COMPLETED).length;
  const progress = Math.round((completedCount / (enrichedModules.filter(m => m.status !== ModuleStatus.LOCKED).length || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Bonjour, {user.firstName || 'Gérant'}</h1>
          <p className="text-slate-500 font-medium">Votre stratégie de croissance pour aujourd'hui.</p>
        </div>
        <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-8">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Expertise</p>
            <p className="text-2xl font-black text-brand-600">{progress}%</p>
          </div>
          <div className="h-10 w-px bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Succès</p>
            <p className="text-2xl font-black text-brand-500">{user.badges.length} Badges</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-slate-900 font-serif">Mes Formations</h2>
              <Link to="/quiz" className="text-brand-600 font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Ajouter des modules</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {enrichedModules.map(mod => (
                <div key={mod.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className={`h-2.5 ${mod.status === ModuleStatus.LOCKED ? 'bg-slate-100' : 'bg-brand-500'}`}></div>
                  <div className="p-8">
                    <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">{mod.topic}</span>
                    <h3 className="text-xl font-bold text-slate-800 mt-2 leading-tight group-hover:text-brand-600 transition-colors">{mod.title}</h3>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">{mod.mini_course}</p>
                    <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-50">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                        mod.status === ModuleStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 
                        mod.status === ModuleStatus.LOCKED ? 'bg-slate-50 text-slate-300' : 'bg-brand-50 text-brand-500'
                      }`}>
                        {mod.status === ModuleStatus.COMPLETED ? `Validé (${mod.score}%)` : 
                         mod.status === ModuleStatus.LOCKED ? 'Verrouillé' : 'À faire'}
                      </span>
                      {mod.status !== ModuleStatus.LOCKED ? (
                        <Link to={`/module/${mod.id}`} className="text-brand-600 font-black text-xs uppercase tracking-widest hover:text-brand-800 transition">
                          Découvrir →
                        </Link>
                      ) : (
                        <span className="text-slate-300 text-lg">🔒</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
             <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl pointer-events-none">✨</div>
             <h2 className="text-2xl font-bold mb-8 font-serif tracking-tight">Engagements Stratégiques</h2>
             {user.actionPlan.length === 0 ? (
               <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-[2rem]">
                 <p className="text-slate-500 font-medium">Aucun engagement pris.</p>
                 <p className="text-xs text-slate-600 mt-3 uppercase tracking-widest">Validez vos modules pour définir vos actions prioritaires.</p>
               </div>
             ) : (
               <div className="space-y-5">
                 {user.actionPlan.map((action, idx) => (
                   <div key={idx} className="bg-white/5 p-6 rounded-2xl flex items-center gap-6 border border-white/5 hover:bg-white/10 transition-colors">
                     <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${action.isCompleted ? 'bg-brand-500 border-brand-500' : 'border-slate-600'}`}>
                       {action.isCompleted && <span className="text-white font-bold text-xs">✓</span>}
                     </div>
                     <div className="flex-grow">
                        <p className={`text-lg font-medium leading-snug ${action.isCompleted ? 'line-through text-slate-600 italic' : 'text-slate-100'}`}>{action.action}</p>
                        <p className="text-[10px] font-black text-brand-500 mt-2 uppercase tracking-widest">{action.moduleTitle} • {action.date}</p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
             <h3 className="font-bold text-slate-900 mb-6 font-serif uppercase text-xs tracking-widest">Collection de Badges</h3>
             <div className="grid grid-cols-3 gap-4">
                {BADGES.map(badge => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div 
                      key={badge.id} 
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-500 shadow-sm ${
                        hasBadge ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-100 grayscale opacity-20'
                      }`}
                      title={`${badge.name}: ${badge.description}`}
                    >
                      {badge.icon}
                    </div>
                  );
                })}
             </div>
           </div>

           <div className="bg-brand-50 rounded-[2.5rem] p-10 border border-brand-100 shadow-inner relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:rotate-12 transition-transform">💡</div>
             <h3 className="font-black text-brand-900 mb-4 uppercase text-[11px] tracking-widest">Conseil du Mentor</h3>
             <p className="text-lg text-brand-800 italic leading-relaxed font-serif font-medium">"L'excellence n'est pas un acte, mais une habitude. Soyez rigoureux sur les détails, ils créent la confiance."</p>
             <div className="mt-8 flex items-center gap-4 pt-6 border-t border-brand-200/50">
               <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="h-14 w-14 rounded-2xl object-cover shadow-lg border-2 border-white" />
               <div className="flex flex-col">
                 <span className="text-xs font-black text-brand-900 uppercase tracking-widest">Coach Kita</span>
                 <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">Expert Go'Top Pro</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
