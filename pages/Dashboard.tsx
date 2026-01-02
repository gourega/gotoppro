import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, COACH_KITA_AVATAR } from '../constants';
import { ModuleStatus } from '../types';
import { Award, BookOpen, Target, ChevronRight, Sparkles } from 'lucide-react';

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

  const purchasedModules = enrichedModules.filter(m => m.status !== ModuleStatus.LOCKED);
  const completedCount = purchasedModules.filter(m => m.status === ModuleStatus.COMPLETED).length;
  const progress = Math.round((completedCount / (purchasedModules.length || 1)) * 100);

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
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Niveau d'expertise</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black leading-none">{progress}%</span>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-brand-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="pr-8 pl-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Collection</p>
                <p className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  {user.badges.length} <span className="text-brand-500 font-serif text-lg">Badges</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Feed: Modules */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-brand-500" />
                  Parcours de Formation
                </h2>
                <Link to="/quiz" className="bg-brand-50 text-brand-600 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-100 transition-all flex items-center gap-2">
                  Nouveau diagnostic
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {purchasedModules.length > 0 ? (
                  purchasedModules.map(mod => (
                    <div key={mod.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[9px] font-black text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-widest">{mod.topic}</span>
                          {mod.status === ModuleStatus.COMPLETED && (
                            <div className="h-8 w-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-xs font-black ring-4 ring-emerald-50/50">✓</div>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight font-serif mb-4 group-hover:text-brand-600 transition-colors">{mod.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium mb-8 italic">"{mod.mini_course}"</p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               {mod.status === ModuleStatus.COMPLETED ? `Score: ${mod.score}%` : 'En cours'}
                             </span>
                          </div>
                          <Link to={`/module/${mod.id}`} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-brand-600 transition-all">
                            Accéder
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                    <div className="h-20 w-20 bg-brand-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-2xl">📚</div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Prêt pour votre première leçon ?</h3>
                    <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Lancez un diagnostic pour identifier les modules prioritaires pour votre salon.</p>
                    <Link to="/quiz" className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-100 hover:scale-105 transition-all">Lancer le diagnostic</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Strategic Actions */}
            <section className="bg-[#0c4a6e] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[12rem] pointer-events-none italic font-serif group-hover:scale-110 transition-transform duration-1000">Go'Top</div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <Target className="w-6 h-6 text-brand-400" />
                  </div>
                  <h2 className="text-2xl font-bold font-serif tracking-tight">Objectifs Prioritaires</h2>
                </div>

                {user.actionPlan.length === 0 ? (
                  <div className="py-12 px-8 border-2 border-dashed border-white/10 rounded-[2.5rem] text-center bg-white/5">
                    <p className="text-slate-400 font-medium text-lg italic">"C'est l'action qui crée le changement."</p>
                    <p className="text-[10px] text-brand-400 mt-4 font-black uppercase tracking-widest">Validez un module pour définir votre prochain défi.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.actionPlan.map((action, idx) => (
                      <div key={idx} className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 flex items-center gap-8 hover:bg-white/10 transition-all group/action">
                        <div className={`h-12 w-12 rounded-[1.2rem] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${action.isCompleted ? 'bg-brand-500 border-brand-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'border-slate-700 bg-slate-900'}`}>
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

          {/* Sidebar: Progress & Inspiration */}
          <div className="space-y-10">
            {/* Badges Collection */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-5 h-5 text-brand-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">Certifications</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {BADGES.map(badge => {
                  const hasBadge = user.badges.includes(badge.id);
                  return (
                    <div 
                      key={badge.id} 
                      className={`h-20 w-20 rounded-[1.8rem] flex items-center justify-center text-3xl border-2 transition-all duration-700 shadow-sm relative group ${
                        hasBadge ? 'bg-brand-50 border-brand-100 scale-100' : 'bg-slate-50 border-slate-100 grayscale opacity-20'
                      }`}
                    >
                      {badge.icon}
                      {hasBadge && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      )}
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-black uppercase tracking-widest">
                        {badge.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coach Quote */}
            <div className="bg-brand-50 rounded-[3rem] p-10 border border-brand-100 shadow-inner relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 h-24 w-24 bg-brand-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h3 className="font-black text-brand-900 mb-6 uppercase text-[10px] tracking-[0.4em] opacity-60">Sagesse du Mentor</h3>
              <p className="text-xl text-brand-900 italic leading-relaxed font-serif font-medium mb-10 relative z-10">
                "L'excellence n'est pas un acte, mais une habitude. Soyez rigoureux sur les détails, ils créent la confiance."
              </p>
              <div className="flex items-center gap-4 pt-8 border-t border-brand-200/50">
                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-xl border-2 border-white relative group-hover:rotate-2 transition-transform">
                  <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-brand-900 uppercase tracking-widest block">Coach Kita</span>
                  <span className="text-[9px] text-brand-500 font-bold uppercase tracking-widest">Fondateur Go'Top Pro</span>
                </div>
              </div>
            </div>

            {/* Support Quick Link */}
            <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-center">
               <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Besoin d'aide ?</p>
               <a href="https://wa.me/2250103438456" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-slate-900 font-serif font-bold hover:text-brand-600 transition-colors">
                 Parler avec un expert
                 <ChevronRight className="w-4 h-4" />
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;