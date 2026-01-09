
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReferrals, saveUserProfile } from '../services/supabase';
import { DAILY_CHALLENGES, TRAINING_CATALOG, BADGES, KITA_LOGO, COACH_KITA_AVATAR } from '../constants';
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
  Loader2,
  TrendingUp,
  Lock,
  Crown,
  Gem,
  ShieldCheck,
  Star
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [filleuls, setFilleuls] = useState<UserProfile[]>([]);
  const [copying, setCopying] = useState(false);
  const [loadingFilleuls, setLoadingFilleuls] = useState(false);

  // Calcul du statut Elite cumulé (Achat direct OU possession des 16 modules)
  const isElite = useMemo(() => {
    if (!user) return false;
    return user.isKitaPremium || (user.purchasedModuleIds?.length >= 16);
  }, [user]);

  const isPerformance = useMemo(() => user?.hasPerformancePack || false, [user]);

  // Synchronisation du statut Elite en base si les 16 modules sont atteints
  useEffect(() => {
    const syncEliteStatus = async () => {
      if (user && (user.purchasedModuleIds?.length || 0) >= 16 && !user.isKitaPremium) {
        try {
          await saveUserProfile({ uid: user.uid, isKitaPremium: true });
          await refreshProfile();
        } catch (e) {
          console.warn("Elite sync failed", e);
        }
      }
    };
    syncEliteStatus();
  }, [user?.purchasedModuleIds, user?.isKitaPremium, refreshProfile, user?.uid]);

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

  const certifiedModulesCount = useMemo(() => {
    if (!user) return 0;
    return Object.values(user.progress || {}).filter(score => score >= 80).length;
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

  const progress = Math.round(((user.purchasedModuleIds?.filter(id => (user.progress?.[id] || 0) >= 80).length || 0) / (TRAINING_CATALOG.length || 1)) * 100);
  
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      
      {/* BANDEAU KITA */}
      <div className="bg-emerald-600 text-white px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border-b border-emerald-400 w-full">
         <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-xl shadow-inner">
               <img src={KITA_LOGO} alt="KITA Seal" className="w-8 h-8 object-contain" />
            </div>
            <h3 className="text-sm font-bold tracking-tight">Standard d'excellence KITA activé.</h3>
         </div>
         <div className="flex gap-3">
            <button onClick={() => navigate('/caisse')} className="bg-amber-400 text-brand-900 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              <Wallet className="w-4 h-4" /> MA CAISSE
            </button>
            <button onClick={() => navigate('/pilotage')} className="bg-brand-900 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" /> PERFORMANCE+
            </button>
         </div>
      </div>

      <div className="bg-brand-900 pt-16 pb-40 px-6 relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <p className="text-brand-400 font-black text-[10px] uppercase tracking-[0.5em]">{user.isAdmin ? 'Console Administrative' : 'Tableau de Bord Elite'}</p>
              {isElite && !user.isAdmin && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[8px] font-black uppercase tracking-widest">
                  <Crown className="w-3 h-3" /> Membre Elite
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              Bonjour, <span className="text-brand-500 italic">{user.firstName}</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl italic opacity-80 leading-relaxed">
              {user.isAdmin 
                ? "« Diriger, c'est prévoir l'excellence de demain. »" 
                : "« Votre succès n'est pas une chance, c'est une discipline. »"}
            </p>
          </div>
          
          {!user.isAdmin && (
            <div className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-2xl mb-4 group hover:bg-white/10 transition-all duration-500">
              <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                 <svg className="w-full h-full -rotate-90 overflow-visible">
                    <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                    <circle 
                      cx="56" cy="56" r={radius} 
                      fill="transparent" stroke="currentColor" strokeWidth="8" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={offset} 
                      strokeLinecap="round"
                      className="text-brand-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white leading-none">{progress}%</span>
                    <span className="text-[7px] font-black text-brand-400 uppercase tracking-widest mt-1">Maîtrise</span>
                 </div>
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Masterclass d'élite</p>
                <button onClick={() => navigate('/results')} className="bg-amber-400 text-brand-900 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-amber-300 transition-all shadow-xl active:scale-95">
                  BOUTIQUE <ArrowRight className="ml-2 inline-block w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {user.isAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              className="bg-brand-500 text-white px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-400 transition-all flex items-center gap-4"
            >
              Accéder au Pilotage Global <ShieldCheck className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pb-32 space-y-12 relative z-20 w-full">
        
        {/* SECTION RECLAME : Masquée si tout est acquis */}
        {!user.isAdmin && (!isElite || !isPerformance) && (
          <div className="grid md:grid-cols-2 gap-6 -mt-32">
             {!isElite && (
               <button onClick={() => navigate('/results?pack=elite')} className="bg-white border-4 border-amber-400 rounded-[2.5rem] p-8 text-left shadow-2xl hover:-translate-y-1 transition-all group flex items-center gap-8">
                  <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><Crown className="w-8 h-8" /></div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Offre Spéciale</p>
                     <h3 className="text-xl font-bold text-slate-900 uppercase">Passer à l'Elite <span className="text-amber-500 font-black ml-2">(10 000 F)</span></h3>
                     <p className="text-xs text-slate-500 font-medium mt-1">Débloquez les 16 modules experts immédiatement.</p>
                  </div>
               </button>
             )}

             {!isPerformance && (
               <button onClick={() => navigate(`/results?pack=${isElite ? 'performance' : 'elite_performance'}`)} className={`bg-white border-4 border-emerald-500 rounded-[2.5rem] p-8 text-left shadow-2xl hover:-translate-y-1 transition-all group flex items-center gap-8 ${isElite ? 'col-span-full' : ''}`}>
                  <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><Gem className="w-8 h-8" /></div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Empire</p>
                     <h3 className="text-xl font-bold text-slate-900 uppercase">
                       {isElite ? 'Activer Performance+' : 'Elite Performance+'} 
                       <span className="text-emerald-500 font-black ml-2">({isElite ? '5 000 F' : '15 000 F'})</span>
                     </h3>
                     <p className="text-xs text-slate-500 font-medium mt-1">
                       {isElite ? 'Pilotage staff, clients VIP et sauvegarde Cloud.' : 'Formation complète + Logiciels de pilotage.'}
                     </p>
                  </div>
               </button>
             )}
          </div>
        )}

        <div className={`grid lg:grid-cols-12 gap-10 items-stretch ${(!user.isAdmin && isElite && isPerformance) ? 'mt-0' : 'mt-20'}`}>
           <div className="lg:col-span-5 bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                 <TrendingUp className="w-32 h-32 text-brand-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className="text-brand-400 font-black text-[11px] uppercase tracking-[0.3em] mb-4">Pilotage Expert</h2>
                 <h3 className="text-2xl font-serif font-bold text-white mb-6">Staff & Performance</h3>
                 <p className="text-slate-400 text-sm leading-relaxed mb-10 flex-grow">
                   Gérez vos collaborateurs, leurs commissions et votre base clients VIP pour multiplier votre CA par 2.
                 </p>
                 {user.hasPerformancePack ? (
                    <button onClick={() => navigate('/pilotage')} className="w-full bg-brand-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-400 transition-all flex items-center justify-center gap-3">
                       Accéder au Cockpit <ArrowRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button onClick={() => navigate('/results?pack=performance')} className="w-full bg-white/10 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                       <Lock className="w-4 h-4 text-amber-500" /> Débloquer les outils
                    </button>
                 )}
              </div>
           </div>

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
              <div className="relative pt-2">
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                      style={{ width: `${(completedTasksCount / 3) * 100}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between mt-2">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Début</span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Excellence</span>
                 </div>
              </div>
           </div>
        </div>

        {/* NOUVELLE SECTION : TABLEAU PRESTIGE (BADGES & CERTIFICATS) */}
        {!user.isAdmin && (
          <section className="bg-slate-950 rounded-[4rem] p-10 md:p-16 shadow-2xl relative overflow-hidden border border-white/5">
             <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-[20rem] font-serif italic pointer-events-none select-none -mr-20 -mt-20">Elite</div>
             
             <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                   <div>
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                         <Crown className="w-4 h-4" /> Tableau de Prestige
                      </div>
                      <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">Vos Honneurs & <span className="text-amber-500">Réussites</span></h2>
                   </div>
                   <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[200px]">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Certifications</p>
                      <div className="flex items-baseline justify-center gap-2">
                         <span className="text-5xl font-black text-emerald-500">{certifiedModulesCount}</span>
                         <span className="text-sm font-bold text-slate-400">/ 16</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
                   {BADGES.map(badge => {
                     const isUnlocked = user.badges?.includes(badge.id);
                     return (
                       <div 
                         key={badge.id} 
                         className={`relative p-6 rounded-[2.5rem] border-2 transition-all duration-700 flex flex-col items-center text-center group ${
                           isUnlocked 
                             ? 'bg-gradient-to-br from-amber-500/20 to-transparent border-amber-500/50 shadow-2xl shadow-amber-500/10' 
                             : 'bg-white/5 border-transparent opacity-30 grayscale'
                         }`}
                       >
                         {isUnlocked && (
                           <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg animate-bounce">
                             <Check className="w-3 h-3 stroke-[4]" />
                           </div>
                         )}
                         <span className={`text-5xl mb-4 transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-125' : ''}`}>{badge.icon}</span>
                         <p className={`text-[9px] font-black uppercase tracking-tight mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</p>
                         <p className="text-[7px] font-medium text-slate-400 leading-tight line-clamp-2">{badge.description}</p>
                       </div>
                     )
                   })}
                </div>

                <div className="bg-white/[0.03] rounded-[3rem] p-10 border border-white/5 flex flex-col md:flex-row items-center gap-12">
                   <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <Medal className="w-12 h-12 text-emerald-500" />
                   </div>
                   <div className="space-y-4 flex-grow text-center md:text-left">
                      <h4 className="text-xl font-serif font-bold text-white italic">"L'excellence est une habitude, pas un acte isolé."</h4>
                      <p className="text-slate-400 text-sm font-medium">Vous avez déjà validé <span className="text-emerald-500 font-black">{certifiedModulesCount} piliers</span> de votre futur empire. Le certificat "Légende du Salon" vous attend au 12ème module maîtrisé.</p>
                   </div>
                   <button 
                    onClick={() => navigate('/results')}
                    className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl"
                   >
                     Poursuivre ma quête
                   </button>
                </div>
             </div>
          </section>
        )}

        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden group hover:shadow-brand-900/5 transition-all duration-500 w-full">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
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
                    {copying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copying ? 'Lien' : 'Lien'}
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

        {!user.isAdmin && (
          <section className="space-y-8 w-full">
            <div className="flex justify-between items-end px-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <BookOpen className="text-brand-500 w-6 h-6" /> Mon Parcours d'Élite
              </h2>
              <Link to="/results" className="text-brand-600 font-black text-[9px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Catalogue complet</Link>
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
                 <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto italic">Lancez votre diagnostic ou choisissez un module dans la boutique pour commencer votre ascension.</p>
                 <button onClick={() => navigate('/results')} className="bg-brand-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Explorer la boutique</button>
              </div>
            )}
          </section>
        )}

        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-t-[8px] border-emerald-500 relative overflow-hidden group w-full">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <img src={KITA_LOGO} alt="KITA" className="h-10 w-10 object-contain" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0">GESTION KITA</h2>
                 </div>
                 <p className="text-slate-500 font-medium max-w-md m-0 leading-relaxed">Le standard d'excellence pour enregistrer vos ventes et sécuriser votre trésorerie en temps réel.</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button onClick={() => navigate('/caisse')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-emerald-700 transition-all">
                       <Plus className="w-4 h-4" /> Nouvelle vente
                    </button>
                    <button onClick={() => navigate('/caisse')} className="bg-slate-50 text-slate-400 border border-slate-100 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 flex items-center gap-3 transition-all">
                       <History className="w-4 h-4" /> Journal
                    </button>
                 </div>
              </div>
              <div className="h-40 w-40 bg-emerald-50 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-transform duration-500">
                 <Wallet className="w-16 h-16 text-emerald-500" />
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
