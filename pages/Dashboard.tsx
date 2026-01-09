
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReferrals, saveUserProfile } from '../services/supabase';
import { DAILY_CHALLENGES, TRAINING_CATALOG, BADGES, KITA_LOGO, COACH_KITA_AVATAR } from '../constants';
import { UserProfile } from '../types';
import { 
  CheckCircle2, 
  ArrowRight,
  Circle,
  Wallet,
  Plus,
  History,
  BookOpen,
  Trophy,
  Award,
  Users,
  Share2,
  Copy,
  Check,
  Flame,
  Medal,
  UserPlus,
  Handshake,
  Loader2,
  TrendingUp,
  Lock,
  Crown,
  Gem,
  ShieldCheck,
  Package
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [filleuls, setFilleuls] = useState<UserProfile[]>([]);
  const [copying, setCopying] = useState(false);
  const [loadingFilleuls, setLoadingFilleuls] = useState(false);

  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);
  const isPerformance = useMemo(() => user?.hasPerformancePack || false, [user]);
  const isStockExpert = useMemo(() => user?.hasStockPack || false, [user]);

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
              <Wallet className="w-4 h-4" /> ARGENT
            </button>
            <button onClick={() => navigate('/pilotage')} className="bg-brand-900 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" /> HUMAINS
            </button>
            <button onClick={() => navigate('/magasin')} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" /> MATÉRIEL
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
          </div>
          
          {!user.isAdmin && (
            <div className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-2xl mb-4 group hover:bg-white/10 transition-all duration-500">
              <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                 <svg className="w-full h-full -rotate-90 overflow-visible">
                    <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                    <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-brand-500 transition-all duration-1000 ease-out" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white leading-none">{progress}%</span>
                 </div>
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Masterclass</p>
                <button onClick={() => navigate('/results')} className="bg-amber-400 text-brand-900 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-amber-300 transition-all shadow-xl">
                  BOUTIQUE <ArrowRight className="ml-2 inline-block w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pb-32 space-y-12 relative z-20 w-full">
        
        {/* OFFRES PROMOTIONNELLES */}
        {!user.isAdmin && (!isElite || !isPerformance || !isStockExpert) && (
          <div className="grid md:grid-cols-3 gap-6 -mt-32">
             {!isElite && (
               <button onClick={() => navigate('/results?pack=elite')} className="bg-white border-4 border-amber-400 rounded-[2.5rem] p-8 text-left shadow-2xl hover:-translate-y-1 transition-all group flex items-center gap-6">
                  <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0"><Crown className="w-7 h-7" /></div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 uppercase">Pack Elite</h3>
                     <p className="text-xs text-slate-500 font-medium mt-1">16 modules experts (10 000 F)</p>
                  </div>
               </button>
             )}

             {!isPerformance && (
               <button onClick={() => navigate('/results?pack=performance')} className="bg-white border-4 border-emerald-500 rounded-[2.5rem] p-8 text-left shadow-2xl hover:-translate-y-1 transition-all group flex items-center gap-6">
                  <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0"><Gem className="w-7 h-7" /></div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 uppercase">Performance+</h3>
                     <p className="text-xs text-slate-500 font-medium mt-1">Staff & Clients VIP (5 000 F)</p>
                  </div>
               </button>
             )}

             {!isStockExpert && (
               <button onClick={() => navigate('/results?pack=stock')} className="bg-white border-4 border-[#0ea5e9] rounded-[2.5rem] p-8 text-left shadow-2xl hover:-translate-y-1 transition-all group flex items-center gap-6">
                  <div className="h-14 w-14 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0ea5e9] shrink-0"><Package className="w-7 h-7" /></div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 uppercase">Stock Expert</h3>
                     <p className="text-xs text-slate-500 font-medium mt-1">Inventaire & Alertes (5 000 F)</p>
                  </div>
               </button>
             )}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10">
           {/* Pilier Matériel / Magasin */}
           <div className="lg:col-span-6 bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                 <Package className="w-32 h-32 text-brand-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className="text-brand-400 font-black text-[11px] uppercase tracking-[0.3em] mb-4">MATÉRIEL</h2>
                 <h3 className="text-2xl font-serif font-bold text-white mb-6">Gestion du Magasin</h3>
                 <p className="text-slate-400 text-sm leading-relaxed mb-10 flex-grow">Contrôlez vos stocks de shampoings et colorations. Évitez les vols et les ruptures qui font perdre des clients.</p>
                 {isStockExpert ? (
                    <button onClick={() => navigate('/magasin')} className="w-full bg-brand-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-400 transition-all flex items-center justify-center gap-3">
                       Entrer au Magasin <ArrowRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button onClick={() => navigate('/results?pack=stock')} className="w-full bg-white/10 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                       <Lock className="w-4 h-4 text-amber-500" /> Débloquer Magasin
                    </button>
                 )}
              </div>
           </div>

           {/* Pilier Humains / Performance */}
           <div className="lg:col-span-6 bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform group-hover:scale-110">
                 <Users className="w-32 h-32 text-emerald-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">HUMAINS</h2>
                 <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Staff & Clients VIP</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">Pilotez votre équipe et fidélisez vos meilleures clientes. Transformez vos visiteurs en VIP.</p>
                 {isPerformance ? (
                    <button onClick={() => navigate('/pilotage')} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                       Piloter l'humain <ArrowRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button onClick={() => navigate('/results?pack=performance')} className="w-full bg-slate-50 text-slate-400 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                       <Lock className="w-4 h-4 text-emerald-500" /> Débloquer Performance
                    </button>
                 )}
              </div>
           </div>
        </div>

        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-t-[8px] border-emerald-500 relative overflow-hidden group w-full">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <img src={KITA_LOGO} alt="KITA" className="h-10 w-10 object-contain" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0">GESTION ARGENT</h2>
                 </div>
                 <p className="text-slate-500 font-medium max-w-md m-0 leading-relaxed">Le standard d'excellence pour enregistrer vos ventes, dépenses et ardoises en temps réel.</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button onClick={() => navigate('/caisse')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-emerald-700 transition-all">
                       <Plus className="w-4 h-4" /> Nouvelle opération
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
