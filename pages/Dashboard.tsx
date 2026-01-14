
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReferrals, updateUserProfile } from '../services/supabase';
import { DAILY_CHALLENGES, TRAINING_CATALOG, BADGES, LEGACY_ID_MAP } from '../constants';
import { UserProfile } from '../types';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ArrowRight,
  Wallet,
  BookOpen,
  Users,
  Package,
  Crown,
  Gem,
  Lock,
  Star,
  CheckCircle2,
  Play,
  Cloud,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Zap,
  Info,
  ShieldHalf
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  
  // LOGIQUE ÉLITE : 16 modules possédés ou flag Premium
  const isElite = useMemo(() => {
    if (!user) return false;
    return user.isKitaPremium || (user.purchasedModuleIds?.length || 0) >= 16;
  }, [user]);

  const isPerformance = useMemo(() => user?.hasPerformancePack || false, [user]);
  const isStockExpert = useMemo(() => user?.hasStockPack || false, [user]);

  useEffect(() => {
    const repairAccess = async () => {
      if (!user) return;
      const currentIds = user.purchasedModuleIds || [];
      const needsFullRestore = (user.isKitaPremium && currentIds.length < 16);

      if (needsFullRestore) {
        try {
          const allModuleIds = TRAINING_CATALOG.map(m => m.id);
          await updateUserProfile(user.uid, { 
            isKitaPremium: true,
            purchasedModuleIds: allModuleIds 
          });
          await refreshProfile();
        } catch (e) {
          console.warn("Restauration échouée", e);
        }
      }
    };
    repairAccess();
  }, [user?.uid, user?.purchasedModuleIds, user?.isKitaPremium, refreshProfile]);

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
    return {
      completed: completedCount,
      percent: Math.round((completedCount / TRAINING_CATALOG.length) * 100)
    };
  }, [user]);

  if (!user) return null;

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.percent / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <KitaTopNav />

      <div className="bg-brand-900 pt-16 pb-40 px-6 relative overflow-hidden w-full border-b border-brand-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
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
            
            {!user.isAdmin && (
              <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-md transition-all ${isElite ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                 {isElite ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 animate-pulse" />}
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest">{isElite ? 'Sauvegarde Cloud Active' : 'Mode Stockage Local'}</span>
                    <span className="text-[8px] font-bold opacity-70">
                      {isElite ? 'Données certifiées et synchronisées' : 'Risque de perte : données non sauvegardées en ligne'}
                    </span>
                 </div>
                 {!isElite && (
                    <button onClick={() => navigate('/results?pack=elite')} className="ml-4 bg-white text-brand-900 px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all shadow-lg">Devenir Élite</button>
                 )}
              </div>
            )}
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

      <div className="max-w-6xl mx-auto px-6 mt-12 pb-32 space-y-12 relative z-20 w-full">
        {/* BANDEAU PSYCHOLOGIQUE LOCAL SI PAS ÉLITE */}
        {!isElite && !user.isAdmin && (
           <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                    <ShieldHalf className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Stockage local uniquement</h3>
                    <p className="text-amber-800/70 text-xs font-medium">Vos données de caisse sont sur ce téléphone. <span className="font-black">Cumulez 16 modules</span> pour activer la sauvegarde Cloud illimitée.</p>
                 </div>
              </div>
              <button onClick={() => navigate('/results')} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all shrink-0">Sécuriser mes données</button>
           </div>
        )}

        {/* SECTION FINANCE - TOUJOURS ACCESSIBLE */}
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
           {/* SECTION STOCK - BANDEAU MARKETING */}
           <div className={`lg:col-span-6 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all ${isStockExpert ? 'bg-slate-900 border-none' : 'bg-white border-2 border-sky-500/20 shadow-sky-900/5'}`}>
              <div className={`absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 ${isStockExpert ? 'text-sky-500' : 'text-sky-300'}`}>
                 <Package className="w-32 h-32" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className={`font-black text-[11px] uppercase tracking-[0.3em] mb-4 ${isStockExpert ? 'text-sky-400' : 'text-sky-500'}`}>LOGISTIQUE {isStockExpert && 'ACTIVÉE'}</h2>
                 <h3 className={`text-2xl font-serif font-bold mb-6 ${isStockExpert ? 'text-white' : 'text-slate-900'}`}>Gestion du Stock</h3>
                 <p className={`text-sm leading-relaxed mb-10 flex-grow ${isStockExpert ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isStockExpert 
                      ? 'Contrôlez vos produits et colorations. Évitez les vols et les ruptures qui font perdre des clients.' 
                      : 'Fini le gaspillage de produits. Augmentez votre marge de 20% en contrôlant vos mélanges et vos stocks de revente.'}
                 </p>
                 {isStockExpert ? (
                    <button onClick={() => navigate('/magasin')} className="w-full bg-sky-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-sky-400 transition-all flex items-center justify-center gap-3">
                       Acc&eacute;der au Magasin <ArrowRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button onClick={() => navigate('/results?pack=stock')} className="w-full bg-sky-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-sky-700 transition-all flex items-center justify-center gap-3">
                       <Zap className="w-4 h-4" /> Activer le Stock (5 000 F)
                    </button>
                 )}
              </div>
           </div>

           {/* SECTION RH - BANDEAU MARKETING */}
           <div className={`lg:col-span-6 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all border-2 ${isPerformance ? 'bg-white border-emerald-500' : 'bg-white border-emerald-500/20 shadow-emerald-900/5'}`}>
              <div className={`absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 ${isPerformance ? 'text-emerald-500' : 'text-emerald-300'}`}>
                 <Users className="w-32 h-32" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">HUMAINS {isPerformance && 'ACTIFS'}</h2>
                 <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Ressources Humaines</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">
                    {isPerformance 
                      ? 'Pilotez votre équipe (commissions) et fidélisez vos meilleures clientes VIP.' 
                      : 'Évitez les départs de vos meilleurs collaborateurs. Gérez les commissions avec transparence et piloter vos clients VIP.'}
                 </p>
                 {isPerformance ? (
                    <button onClick={() => navigate('/pilotage')} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                       Piloter le Staff <ArrowRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button onClick={() => navigate('/results?pack=performance')} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                       <Zap className="w-4 h-4" /> Activer les RH (5 000 F)
                    </button>
                 )}
              </div>
           </div>
        </div>

        {/* SECTION FORMATION - TOUJOURS ACCESSIBLE */}
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
