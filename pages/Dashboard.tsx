
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReferrals } from '../services/supabase';
import { DAILY_CHALLENGES, TRAINING_CATALOG, BADGES, KITA_LOGO } from '../constants';
import { UserProfile } from '../types';
import { 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Circle,
  Wallet,
  Plus,
  History,
  AlertCircle,
  BookOpen,
  Trophy,
  Award,
  Users,
  Share2,
  Copy,
  Check,
  Target,
  Flame,
  Medal,
  Calendar,
  Sparkles,
  UserPlus,
  Handshake,
  Loader2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [filleuls, setFilleuls] = useState<UserProfile[]>([]);
  const [copying, setCopying] = useState(false);
  const [loadingFilleuls, setLoadingFilleuls] = useState(false);

  useEffect(() => {
    if (user) {
      // Chargement des tâches quotidiennes
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

      // Chargement du réseau (filleuls)
      loadNetwork();
    }
  }, [user]);

  const loadNetwork = async () => {
    if (!user) return;
    setLoadingFilleuls(true);
    try {
      const data = await getReferrals(user.uid);
      setFilleuls(data);
    } catch (err) {
      console.warn("Erreur chargement réseau");
    } finally {
      setLoadingFilleuls(false);
    }
  };

  const purchasedModules = useMemo(() => {
    if (!user) return [];
    return TRAINING_CATALOG.filter(m => user.purchasedModuleIds.includes(m.id));
  }, [user]);

  const earnedBadges = useMemo(() => {
    if (!user) return [];
    return BADGES.filter(b => (user.badges || []).includes(b.id));
  }, [user]);

  const completedTasksCount = dailyTasks.filter(t => t.completed).length;

  const copyRefLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/#/login?ref=${user.phoneNumber}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!user) return;
    const link = `${window.location.origin}/#/login?ref=${user.phoneNumber}`;
    const text = `Bonjour ! Je transforme mon salon avec Go'Top Pro. Rejoins l'élite des gérants ici : ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!user) return null;

  const progress = Math.round(((user.purchasedModuleIds?.filter(id => (user.progress?.[id] || 0) >= 80).length || 0) / (user.purchasedModuleIds?.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* BANDEAU KITA - Intégration du Sceau */}
      <div className="bg-emerald-600 text-white px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border-b border-emerald-400">
         <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-xl shadow-inner">
               <img src={KITA_LOGO} alt="KITA Seal" className="w-8 h-8 object-contain" />
            </div>
            <h3 className="text-sm font-bold">Votre cockpit de gestion KITA est prêt pour l'excellence.</h3>
         </div>
         <button onClick={() => navigate('/caisse')} className="bg-amber-400 text-brand-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3">
           <Wallet className="w-4 h-4" /> OUVRIR MA CAISSE
         </button>
      </div>

      {/* HERO SECTION */}
      <div className="bg-brand-900 pt-16 pb-40 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="space-y-6">
            <p className="text-brand-400 font-black text-[10px] uppercase tracking-[0.5em]">Tableau de Bord Elite</p>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              Bonjour, <span className="text-brand-500 italic">{user.firstName}</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl italic opacity-80">
              « Votre succès n'est pas une chance, c'est une discipline. »
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/10 flex items-center gap-4 shadow-2xl mb-4">
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

      {/* CONTENU PRINCIPAL - Espacement Ajusté */}
      <div className="max-w-6xl mx-auto px-6 mt-20 pb-32 space-y-16 relative z-20">
        
        {/* RITUEL DU MATIN & RÉCOMPENSES (COLONNES) */}
        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
           
           {/* GAUCHE : DISCIPLINE DU JOUR */}
           <div className="lg:col-span-7 bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 flex flex-col justify-between hover:shadow-brand-900/5 transition-all duration-500">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
                    <Flame className="w-5 h-5 text-amber-500 fill-current" /> Discipline du Jour
                 </h2>
                 <span className="text-[10px] font-black text-brand-500 bg-brand-50 px-4 py-1.5 rounded-full uppercase">
                    {completedTasksCount}/3 Terminé
                 </span>
              </div>
              <div className="space-y-4 mb-8">
                 {dailyTasks.map((task, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => {
                       const updated = [...dailyTasks];
                       updated[idx].completed = !updated[idx].completed;
                       setDailyTasks(updated);
                       localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(updated));
                     }}
                     className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-6 text-left ${task.completed ? 'bg-emerald-50/30 border-emerald-100 shadow-inner' : 'bg-white border-slate-50 hover:border-brand-500 shadow-sm'}`}
                   >
                     <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                       {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                     </div>
                     <p className={`text-sm font-bold leading-tight ${task.completed ? 'line-through text-slate-400 italic' : 'text-slate-700'}`}>{task.task}</p>
                   </button>
                 ))}
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-emerald-500 transition-all duration-500" 
                   style={{ width: `${(completedTasksCount / 3) * 100}%` }}
                 ></div>
              </div>
           </div>

           {/* DROITE : TABLEAU D'HONNEUR */}
           <div className="lg:col-span-5 bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 flex flex-col text-center hover:shadow-brand-900/5 transition-all duration-500">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center justify-center gap-3">
                 <Medal className="w-5 h-5 text-brand-500" /> Tableau d'Honneur
              </h2>
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 flex-grow content-center">
                   {earnedBadges.slice(0, 4).map(badge => (
                     <div key={badge.id} title={badge.description} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-3 group hover:scale-105 transition-transform shadow-sm">
                        <span className="text-4xl group-hover:rotate-12 transition-transform">{badge.icon}</span>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{badge.name}</p>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center gap-6 py-10">
                   <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Trophy className="w-10 h-10" />
                   </div>
                   <p className="text-xs font-medium text-slate-400 italic">Terminez votre premier module pour débloquer vos trophées.</p>
                </div>
              )}
              <Link to="/profile" className="mt-10 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Voir tous mes succès</Link>
           </div>
        </div>

        {/* SECTION MON RÉSEAU D'ÉLITE (BANDEAU FILLEULS) */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden group hover:shadow-brand-900/5 transition-all duration-500">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Users className="w-48 h-48" />
           </div>
           
           <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12 relative z-10">
              <div>
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <Handshake className="text-amber-500 w-6 h-6" /> Mon Réseau d'Élite
                 </h2>
                 <p className="text-slate-500 font-medium text-sm mt-1">{filleuls.length} gérant(s) parrainé(s) avec succès</p>
              </div>
              <div className="flex gap-4">
                 <button onClick={shareOnWhatsApp} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 flex items-center gap-3 transition-all">
                    <Share2 className="w-4 h-4" /> Recruter
                 </button>
                 <button onClick={copyRefLink} className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 flex items-center gap-3 transition-all">
                    {copying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copying ? 'Copié' : 'Lien'}
                 </button>
              </div>
           </div>

           {loadingFilleuls ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-500" /></div>
           ) : filleuls.length > 0 ? (
             <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-6 relative z-10">
                {filleuls.map(f => (
                  <div key={f.uid} className="flex flex-col items-center text-center gap-3 group/item">
                     <div className="h-16 w-16 rounded-2xl bg-brand-50 border-2 border-white shadow-md flex items-center justify-center overflow-hidden group-hover/item:border-brand-500 group-hover/item:scale-105 transition-all">
                        {f.photoURL ? <img src={f.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="font-black text-brand-900">{f.firstName?.[0]}</span>}
                     </div>
                     <p className="text-[10px] font-bold text-slate-600 truncate w-full px-1">{f.firstName}</p>
                  </div>
                ))}
                <button onClick={shareOnWhatsApp} className="flex flex-col items-center text-center gap-3 group/add">
                   <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 group-hover/add:border-brand-500 group-hover/add:text-brand-500 group-hover/add:bg-brand-50 transition-all">
                      <Plus className="w-6 h-6" />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400">Ajouter</p>
                </button>
             </div>
           ) : (
             <div className="bg-slate-50/50 rounded-[2.5rem] p-12 text-center border border-dashed border-slate-200">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <UserPlus className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed italic">"Votre empire grandit avec ceux que vous élevez. Parrainez vos confrères pour bâtir votre réseau."</p>
                <button onClick={shareOnWhatsApp} className="bg-brand-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                  Inviter un confrère
                </button>
             </div>
           )}
        </section>

        {/* SECTION MES FORMATIONS */}
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <BookOpen className="text-brand-500 w-6 h-6" /> Mon Parcours d'Élite
            </h2>
            <Link to="/results" className="text-brand-600 font-black text-[9px] uppercase tracking-widest hover:underline">Accéder au catalogue complet</Link>
          </div>

          {purchasedModules.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {purchasedModules.map(mod => {
                const score = user.progress?.[mod.id] || 0;
                const isCertified = score >= 80;
                return (
                  <Link key={mod.id} to={`/module/${mod.id}`} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col justify-between min-h-[220px] relative overflow-hidden">
                    {isCertified && <div className="absolute top-4 right-4 text-emerald-500"><Award className="w-5 h-5 fill-current" /></div>}
                    <div>
                      <span className="text-[8px] font-black text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-widest">{mod.topic}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-4 leading-tight group-hover:text-brand-600 transition-colors">{mod.title}</h3>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isCertified ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score: {score}%</span>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${isCertified ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'}`}>
                        {isCertified ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 shadow-xl">
               <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Votre empire attend son premier pilier.</h3>
               <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Lancez votre diagnostic ou choisissez un module dans la boutique pour commencer votre ascension.</p>
               <button onClick={() => navigate('/results')} className="bg-brand-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl">Explorer la boutique</button>
            </div>
          )}
        </section>

        {/* BLOC CAISSE KITA - Intégration du Sceau */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-t-[8px] border-emerald-500 relative overflow-hidden group">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <img src={KITA_LOGO} alt="KITA" className="h-10 w-10 object-contain" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0">GESTION KITA</h2>
                 </div>
                 <p className="text-slate-500 font-medium max-w-md m-0">Le standard d'excellence pour enregistrer vos ventes et sécuriser votre trésorerie en temps réel.</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button onClick={() => navigate('/caisse')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3">
                       <Plus className="w-4 h-4" /> Nouvelle vente
                    </button>
                    <button onClick={() => navigate('/caisse')} className="bg-slate-50 text-slate-400 border border-slate-100 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 flex items-center gap-3 transition-all">
                       <History className="w-4 h-4" /> Consulter le journal
                    </button>
                 </div>
              </div>
              <div className="h-40 w-40 bg-emerald-50 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-transform duration-500">
                 <Wallet className="w-16 h-16 text-emerald-500" />
              </div>
           </div>
        </section>

        {/* SECTION MES ENGAGEMENTS (ACTION PLAN) */}
        {user.actionPlan && user.actionPlan.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <Target className="text-rose-500 w-6 h-6" /> Mes Engagements de Transformation
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
               {user.actionPlan.slice(0, 4).map((plan, idx) => (
                 <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex items-start gap-6 group hover:border-brand-500 transition-all">
                    <div className="bg-brand-50 p-4 rounded-2xl text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                       <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> {plan.date} • {plan.moduleTitle}
                       </p>
                       <p className="text-slate-800 font-bold leading-relaxed">{plan.action}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
