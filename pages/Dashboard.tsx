import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, getKitaTransactions, getProfileByPhone } from '../services/supabase';
import { DAILY_CHALLENGES, TRAINING_CATALOG, BADGES, COACH_KITA_AVATAR, COACH_KITA_SLOGAN } from '../constants';
import { analyzeBusinessTrends } from '../services/geminiService';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ArrowRight,
  Wallet,
  Users,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Loader2,
  Quote,
  Target,
  Circle,
  ClipboardList,
  Scissors,
  PlusCircle,
  MinusCircle,
  Camera,
  Book,
  Check,
  Gem,
  Star
} from 'lucide-react';
import { UserActionCommitment, KitaTransaction } from '../types';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [isUpdatingCommitment, setIsUpdatingCommitment] = useState<string | null>(null);
  const [businessInsight, setBusinessInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [salonTransactions, setSalonTransactions] = useState<KitaTransaction[]>([]);
  const [loadingTrans, setLoadingTrans] = useState(false);
  
  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);
  const isPerformance = useMemo(() => user?.hasPerformancePack || false, [user]);
  const isStockExpert = useMemo(() => user?.hasStockPack || false, [user]);
  const isStaff = useMemo(() => user?.role === 'STAFF_ELITE' || user?.role === 'STAFF_ADMIN', [user]);

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
      loadSalonData();
    }
  }, [user?.uid]);

  const loadSalonData = async () => {
    if (!user || loadingTrans) return;
    setLoadingTrans(true);
    try {
      let targetUid = user.uid;
      
      // Si c'est un employé, on doit charger les transactions du salon du gérant parrain
      if (isStaff && user.referredBy) {
         const sponsor = await getProfileByPhone(user.referredBy);
         if (sponsor) targetUid = sponsor.uid;
      }

      const trans = await getKitaTransactions(targetUid);
      setSalonTransactions(trans);
      
      if (trans.length > 5 && !isStaff) {
        const insight = await analyzeBusinessTrends(trans, user.firstName || 'Gérant');
        setBusinessInsight(insight);
      }
    } catch (e) {
      console.warn("Erreur chargement données salon");
    } finally {
      setLoadingTrans(false);
    }
  };

  const myPerformance = useMemo(() => {
    if (!isStaff || !user) return { commissions: 0, tips: 0, count: 0 };
    const myName = `${user.firstName} ${user.lastName}`.trim();
    const myTrans = salonTransactions.filter(t => t.staffName === myName || t.staffName === user.firstName);
    
    const commissions = myTrans.reduce((acc, t) => acc + (t.amount * (t.commissionRate || 0) / 100), 0);
    const tips = myTrans.reduce((acc, t) => acc + (t.tipAmount || 0), 0);
    
    return { commissions, tips, count: myTrans.length };
  }, [salonTransactions, isStaff, user]);

  const handleToggleCommitment = async (commitment: UserActionCommitment) => {
    if (!user || isUpdatingCommitment) return;
    const uniqueKey = `${commitment.moduleId}-${commitment.date}-${commitment.action}`;
    setIsUpdatingCommitment(uniqueKey);
    try {
      const updatedActionPlan = user.actionPlan.map(a => {
        if (a.moduleId === commitment.moduleId && a.date === commitment.date && a.action === commitment.action) {
          return { ...a, isCompleted: !a.isCompleted };
        }
        return a;
      });
      await updateUserProfile(user.uid, { actionPlan: updatedActionPlan });
      await refreshProfile();
    } finally {
      setIsUpdatingCommitment(null);
    }
  };

  const stats = useMemo(() => {
    if (!user?.progress) return { completed: 0, percent: 0 };
    let completedCount = 0;
    TRAINING_CATALOG.forEach(module => {
      const score = Number(user.progress?.[module.id] || 0);
      if (score >= 80) completedCount++;
    });
    return { completed: completedCount, percent: Math.round((completedCount / (TRAINING_CATALOG.length || 1)) * 100) };
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <KitaTopNav />

      <div className="bg-brand-900 pt-16 pb-40 px-6 relative overflow-hidden w-full border-b border-brand-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              {isStaff ? 'Mon Espace' : 'Bonjour,'} <span className="text-brand-500 italic">{user.firstName}</span>
            </h1>
            <div className="flex flex-wrap gap-3">
              <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-md ${isElite ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                   {isElite ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 animate-pulse" />}
                   <span className="text-[9px] font-black uppercase tracking-widest">{isElite ? 'Compte Elite' : 'Mode Local'}</span>
              </div>
              {isStaff && (
                <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400 backdrop-blur-md">
                   <Star className="w-4 h-4" />
                   <span className="text-[9px] font-black uppercase tracking-widest">{user.role === 'STAFF_ADMIN' ? 'Staff Admin' : 'Collaborateur Kita'}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-2xl">
              <div className="text-right">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Score Académie</p>
                <p className="text-3xl font-black text-white">{stats.percent}%</p>
              </div>
              <button onClick={() => navigate('/mes-formations')} className="bg-brand-500 text-white p-4 rounded-2xl hover:bg-brand-400 transition-all shadow-xl"><ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-[-100px] pb-32 space-y-12 relative z-20 w-full">
        
        {/* QUICK ACTIONS */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
           <QuickActionBtn icon={<PlusCircle className="w-6 h-6" />} label="ENCAISSER" sub="Vente Directe" onClick={() => navigate('/caisse')} color="bg-emerald-500" />
           
           {/* RESTAURÉ : Accessible au gérant (!isStaff) et au staff admin */}
           {(!isStaff || user.role === 'STAFF_ADMIN') && (
             <QuickActionBtn icon={<MinusCircle className="w-6 h-6" />} label="DÉPENSES" sub="Sortie Caisse" onClick={() => navigate('/caisse?mode=expense')} color="bg-rose-500" />
           )}

           <QuickActionBtn icon={<Scissors className="w-6 h-6" />} label="SERVICES" sub="Tarifs Salon" onClick={() => navigate('/pilotage?tab=services')} color="bg-indigo-500" />
           
           {(!isStaff || user.role === 'STAFF_ADMIN') && (
             <QuickActionBtn icon={<Users className="w-6 h-6" />} label="CLIENT VIP" sub="Fichier CRM" onClick={() => navigate('/pilotage?tab=clients')} color="bg-amber-500" />
           )}
           
           <QuickActionBtn icon={<Camera className="w-6 h-6" />} label="POST IA" sub="Marketing" onClick={() => navigate('/marketing')} color="bg-indigo-600" />
        </section>

        {/* PERFORMANCE STAFF (Vue Spécifique) */}
        {isStaff && (
          <section className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
             <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-l-[12px] border-emerald-500 flex flex-col justify-between group overflow-hidden relative">
                <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.03] group-hover:rotate-12 transition-transform" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mes Commissions</p>
                   <p className="text-5xl font-black text-slate-900 tracking-tighter">{myPerformance.commissions.toLocaleString()} <span className="text-sm">F</span></p>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-6 uppercase">Basé sur {myPerformance.count} prestations terminées</p>
             </div>
             
             <div className="bg-brand-900 rounded-[3rem] p-10 shadow-2xl border-l-[12px] border-amber-400 flex flex-col justify-between group overflow-hidden relative text-white">
                <Gem className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform" />
                <div>
                   <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">Mes Pourboires 💎</p>
                   <p className="text-5xl font-black text-amber-400 tracking-tighter">{myPerformance.tips.toLocaleString()} <span className="text-sm">F</span></p>
                </div>
                <p className="text-[9px] font-bold text-white/40 mt-6 uppercase">La récompense de votre excellence</p>
             </div>
          </section>
        )}

        {/* ANALYSE PROACTIVE DU MENTOR (Gérant uniquement) */}
        {businessInsight && !isStaff && (
          <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border-l-[12px] border-emerald-500 animate-in slide-in-from-top-4">
             <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="h-20 w-20 rounded-full overflow-hidden shrink-0 border-4 border-emerald-50 shadow-xl">
                   <img src={COACH_KITA_AVATAR} className="w-full h-full object-cover" alt="Coach" />
                </div>
                <div className="flex-grow">
                   <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-2">
                      <PlusCircle className="w-3 h-3" /> Analyse Flash du Mentor
                   </div>
                   <p className="text-xl font-serif italic text-slate-700 leading-relaxed">
                     "{businessInsight}"
                   </p>
                </div>
                <button onClick={loadSalonData} className="p-4 text-slate-300 hover:text-emerald-500 transition-colors"><RefreshCw className="w-5 h-5" /></button>
             </div>
          </section>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
           <div className="lg:col-span-4 bg-brand-900 rounded-[3rem] p-10 border border-brand-800 shadow-2xl relative overflow-hidden group">
              <Quote className="absolute top-6 right-6 w-20 h-20 text-brand-800 opacity-20" />
              <h3 className="text-brand-500 font-black text-[10px] uppercase tracking-[0.4em] mb-8">Mantra du Succès</h3>
              <p className="text-2xl font-serif italic text-white leading-relaxed flex-grow">"{COACH_KITA_SLOGAN}"</p>
           </div>

           <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4"><Target className="w-6 h-6 text-brand-600" /><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Défis du Jour</h3></div>
              </div>
              <div className="space-y-3">
                 {dailyTasks.map((t, idx) => (
                    <button key={idx} onClick={() => {
                        const n = [...dailyTasks]; n[idx].completed = !n[idx].completed; setDailyTasks(n);
                        localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(n));
                    }} className={`w-full flex items-center gap-6 p-6 rounded-2xl border-2 transition-all ${t.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:border-brand-200'}`}>
                       <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${t.completed ? 'bg-emerald-500 text-white' : 'bg-white border'}`}>
                          {t.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                       </div>
                       <p className={`text-sm font-bold ${t.completed ? 'text-emerald-900 line-through' : 'text-slate-700'}`}>{t.task}</p>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* SECTION MES ENGAGEMENTS D'ÉLITE */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border border-slate-100">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
              <div className="flex items-center gap-5">
                 <div className="h-16 w-16 bg-brand-50 text-brand-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <Target className="w-8 h-8" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mes Engagements</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Actions scellées avec le Mentor</p>
                 </div>
              </div>
              {user.actionPlan && user.actionPlan.length > 0 && (
                <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                      {user.actionPlan.filter(a => a.isCompleted).length} / {user.actionPlan.length} Réalisés
                   </span>
                </div>
              )}
           </div>

           {user.actionPlan && user.actionPlan.length > 0 ? (
             <div className="grid md:grid-cols-2 gap-6">
                {user.actionPlan.map((commitment, idx) => {
                   const uniqueKey = `${commitment.moduleId}-${commitment.date}-${commitment.action}`;
                   const isUpdating = isUpdatingCommitment === uniqueKey;
                   
                   return (
                      <div 
                        key={idx} 
                        className={`p-8 rounded-[2.5rem] border-2 transition-all relative group ${
                          commitment.isCompleted 
                          ? 'bg-emerald-50/30 border-emerald-100 shadow-sm' 
                          : 'bg-white border-slate-50 shadow-xl hover:border-brand-100'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${commitment.isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  <Book className="w-3.5 h-3.5" />
                               </div>
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest line-clamp-1 max-w-[150px]">
                                  {commitment.moduleTitle}
                               </span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{commitment.date}</span>
                         </div>
                         
                         <p className={`text-lg font-bold leading-relaxed mb-8 ${commitment.isCompleted ? 'text-slate-400 line-through italic' : 'text-slate-900'}`}>
                            "{commitment.action}"
                         </p>

                         <button 
                           onClick={() => handleToggleCommitment(commitment)}
                           disabled={isUpdating}
                           className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                             commitment.isCompleted 
                             ? 'bg-white text-emerald-600 border border-emerald-100 shadow-sm' 
                             : 'bg-brand-900 text-white shadow-xl hover:bg-brand-950'
                           }`}
                         >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : commitment.isCompleted ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                            {commitment.isCompleted ? 'Action Réalisée' : 'Valider mon action'}
                         </button>
                      </div>
                   );
                })}
             </div>
           ) : (
             <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] group hover:border-brand-200 transition-colors">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:scale-110 transition-transform">
                   <ClipboardList className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2 italic">"Aucun engagement scellé pour le moment."</h3>
                <button 
                  onClick={() => navigate('/mes-formations')}
                  className="bg-brand-50 text-brand-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-100 transition-all"
                >
                   Aller aux formations
                </button>
             </div>
           )}
        </section>

        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-t-[8px] border-amber-400 relative overflow-hidden group w-full">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4"><Wallet className="w-10 h-10 text-amber-500" /><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{isStaff ? 'MA PERFORMANCE' : 'GESTION FINANCIÈRE'}</h2></div>
                 <p className="text-slate-500 font-medium max-w-md">
                   {isStaff 
                    ? "Suivez vos commissions et pourboires en temps réel pour mesurer votre montée en gamme." 
                    : "Suivez vos recettes, vos dépenses et recouvrez vos ardoises pour garantir la santé financière de votre empire."}
                 </p>
                 <div className="flex gap-4 justify-center md:justify-start">
                    <button onClick={() => navigate('/caisse')} className="bg-brand-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-950 transition-all flex items-center gap-3">
                      {isStaff ? 'Journal de bord' : 'Ouvrir la Caisse'} <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                    {!isStaff && (
                      <button onClick={() => navigate('/caisse?mode=expense')} className="bg-rose-50 text-rose-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-100 shadow-sm hover:bg-rose-100 transition-all flex items-center gap-3">
                        <MinusCircle className="w-4 h-4" /> Dépense
                      </button>
                    )}
                 </div>
              </div>
              <div className="h-40 w-40 bg-amber-50 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-all"><TrendingUp className="w-16 h-16 text-amber-500" /></div>
           </div>
        </section>

        {!isStaff && (
          <div className="grid lg:grid-cols-2 gap-8">
             <div className={`rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all ${isStockExpert ? 'bg-slate-900 border-none' : 'bg-white border-2 border-sky-500/20'}`}>
                <div className="relative z-10 h-full flex flex-col">
                   <h2 className={`font-black text-[11px] uppercase tracking-[0.3em] mb-4 ${isStockExpert ? 'text-sky-400' : 'text-sky-500'}`}>LOGISTIQUE</h2>
                   <h3 className={`text-2xl font-serif font-bold mb-6 ${isStockExpert ? 'text-white' : 'text-slate-900'}`}>Gestion du Stock</h3>
                   {isStockExpert ? <button onClick={() => navigate('/magasin')} className="w-full bg-sky-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Accéder au Magasin</button> : <button onClick={() => navigate('/results?pack=stock')} className="w-full bg-sky-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl"><ShieldAlert className="w-4 h-4" /> Activer le Stock</button>}
                </div>
             </div>
             <div className={`rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all border-2 ${isPerformance ? 'bg-white border-emerald-500' : 'bg-white border-emerald-500/20'}`}>
                <div className="relative z-10 h-full flex flex-col">
                   <h2 className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">HUMAINS</h2>
                   <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Pilotage d'Équipe</h3>
                   {isPerformance ? <button onClick={() => navigate('/pilotage')} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Piloter le Staff</button> : <button onClick={() => navigate('/results?pack=performance')} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl"><ShieldAlert className="w-4 h-4" /> Activer les RH</button>}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickActionBtn = ({ icon, label, sub, onClick, color }: any) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 hover:scale-105 active:scale-95 transition-all text-left flex flex-col gap-4 group">
     <div className={`${color} text-white p-3 rounded-2xl w-fit shadow-lg group-hover:rotate-12 transition-transform`}>{icon}</div>
     <div>
        <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{label}</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase">{sub}</p>
     </div>
  </button>
);

export default Dashboard;