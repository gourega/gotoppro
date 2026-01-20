
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/supabase';
import { DAILY_CHALLENGES, TRAINING_CATALOG, BADGES, LEGACY_ID_MAP, COACH_KITA_AVATAR, DIAGNOSTIC_QUESTIONS, COACH_KITA_SLOGAN } from '../constants';
import { generateStrategicAdvice } from '../services/geminiService';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ArrowRight,
  Wallet,
  Users,
  Package,
  Crown,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Zap,
  Loader2,
  FileSearch,
  Quote,
  Target,
  Circle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  const isElite = useMemo(() => {
    if (!user) return false;
    return user.isKitaPremium || (user.purchasedModuleIds?.length || 0) >= 16;
  }, [user]);

  const isPerformance = useMemo(() => user?.hasPerformancePack || false, [user]);
  const isStockExpert = useMemo(() => user?.hasStockPack || false, [user]);

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

  const toggleTask = (index: number) => {
    const newTasks = [...dailyTasks];
    newTasks[index].completed = !newTasks[index].completed;
    setDailyTasks(newTasks);
    localStorage.setItem(`daily_tasks_${user?.uid}`, JSON.stringify(newTasks));
  };

  const handleGenerateAudit = async () => {
    if (!user || loadingAudit) return;
    setLoadingAudit(true);
    try {
      const rawResults = localStorage.getItem('temp_quiz_results');
      const results = rawResults ? JSON.parse(rawResults) : null;
      const negativeTexts = results 
        ? results.filter((r: any) => !r.answer).map((r: any) => DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text).filter(Boolean) as string[]
        : ["Organisation générale", "Gestion de la rentabilité"];
      const advice = await generateStrategicAdvice(negativeTexts, negativeTexts.length === 0);
      if (advice) {
        await updateUserProfile(user.uid, { strategicAudit: advice });
        await refreshProfile();
      }
    } catch (err) {
      alert("L'IA est occupée. Réessayez dans un instant.");
    } finally {
      setLoadingAudit(false);
    }
  };

  const stats = useMemo(() => {
    if (!user?.progress) return { completed: 0, percent: 0 };
    let completedCount = 0;
    TRAINING_CATALOG.forEach(module => {
      const legacyId = Object.keys(LEGACY_ID_MAP).find(key => LEGACY_ID_MAP[key] === module.id);
      const score = Math.max(Number(user.progress?.[module.id] || 0), legacyId ? Number(user.progress?.[legacyId] || 0) : 0);
      if (score >= 80) completedCount++;
    });
    return { completed: completedCount, percent: Math.round((completedCount / TRAINING_CATALOG.length) * 100) };
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
              {isElite && !user.isAdmin && <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[8px] font-black uppercase tracking-widest"><Crown className="w-3 h-3" /> Membre Elite</div>}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">Bonjour, <span className="text-brand-500 italic">{user.firstName}</span></h1>
            {!user.isAdmin && (
              <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-md transition-all ${isElite ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                 {isElite ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 animate-pulse" />}
                 <div className="flex flex-col"><span className="text-[9px] font-black uppercase tracking-widest">{isElite ? 'Sauvegarde Cloud Active' : 'Mode Stockage Local'}</span><span className="text-[8px] font-bold opacity-70">{isElite ? 'Données synchronisées' : 'Données non sauvegardées'}</span></div>
              </div>
            )}
          </div>
          {!user.isAdmin && (
            <div className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-2xl mb-4 group">
              <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                 <svg className="w-full h-full -rotate-90 overflow-visible">
                    <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                    <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-brand-500 transition-all duration-1000" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black text-white">{stats.percent}%</span></div>
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Formation Globale</p>
                <button onClick={() => navigate('/mes-formations')} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl">MES COURS <ArrowRight className="ml-2 inline-block w-3 h-3" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 pb-32 space-y-12 relative z-20 w-full">
        
        {/* SECTION 0 : MANTRA & DÉFIS (LA BASE QUOTIDIENNE) */}
        <section className="grid lg:grid-cols-12 gap-8 w-full">
           {/* Mantra Stratégique */}
           <div className="lg:col-span-4 bg-brand-900 rounded-[3rem] p-10 border border-brand-800 shadow-2xl relative overflow-hidden group">
              <Quote className="absolute top-6 right-6 w-20 h-20 text-brand-800 opacity-20" />
              <div className="relative z-10 h-full flex flex-col">
                 <h3 className="text-brand-500 font-black text-[10px] uppercase tracking-[0.4em] mb-8">Mantra du Succès</h3>
                 <p className="text-2xl font-serif italic text-white leading-relaxed flex-grow">"{COACH_KITA_SLOGAN}"</p>
                 <div className="mt-8 pt-6 border-t border-brand-800">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Architecte Kita — Abidjan</p>
                 </div>
              </div>
           </div>

           {/* Défis de l'Excellence */}
           <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 p-12 opacity-[0.03] text-8xl font-black italic">DÉFIS</div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="flex items-center gap-4">
                    <Target className="w-6 h-6 text-brand-600" />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Les 3 Défis du Jour</h3>
                 </div>
                 <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase">Standard Kita</span>
              </div>
              
              <div className="space-y-4 relative z-10">
                 {dailyTasks.map((t, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => toggleTask(idx)}
                      className={`w-full flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${t.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:border-brand-200'}`}
                    >
                       <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${t.completed ? 'bg-emerald-500 text-white' : 'bg-white text-slate-200 border border-slate-100'}`}>
                          {t.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                       </div>
                       <p className={`text-sm font-bold leading-tight ${t.completed ? 'text-emerald-900 line-through' : 'text-slate-700'}`}>{t.task}</p>
                    </button>
                 ))}
              </div>
           </div>
        </section>

        {/* SECTION 1 : VISION STRATÉGIQUE IA */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-l-[12px] border-indigo-500 relative overflow-hidden group w-full">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[15rem] font-serif italic pointer-events-none transition-transform duration-1000">Vision</div>
           <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
              <div className="shrink-0 mx-auto md:mx-0">
                  <div className="h-24 w-24 rounded-3xl overflow-hidden border-2 border-indigo-100 shadow-xl rotate-2"><img src={COACH_KITA_AVATAR} className="w-full h-full object-cover" alt="Mentor" /></div>
              </div>
              <div className="flex-grow">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1">Vision Stratégique du Mentor</h2>
                      <p className="text-2xl font-serif font-bold text-slate-900">Directives de Coach Kita</p>
                    </div>
                    {user.strategicAudit && <button onClick={handleGenerateAudit} disabled={loadingAudit} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-2">{loadingAudit ? <Loader2 className="animate-spin w-3 h-3" /> : <RefreshCw className="w-3 h-3" />} Mettre à jour mon audit</button>}
                 </div>
                 {user.strategicAudit ? <div className="prose-kita whitespace-pre-wrap font-medium" dangerouslySetInnerHTML={{ __html: user.strategicAudit.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-900">$1</strong>') }} /> : (
                   <div className="py-10 text-center md:text-left">
                      <p className="text-slate-500 italic mb-8 max-w-lg">"Gérant, votre plan de route personnalisé n'est pas encore activé en ligne. Cliquez ci-dessous pour que je scanne votre potentiel."</p>
                      <button onClick={handleGenerateAudit} disabled={loadingAudit} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center gap-4 mx-auto md:mx-0">{loadingAudit ? <Loader2 className="animate-spin w-4 h-4" /> : <FileSearch className="w-4 h-4" />}{loadingAudit ? 'Analyse de votre salon...' : 'Générer mon audit stratégique'}</button>
                   </div>
                 )}
              </div>
           </div>
        </section>

        {/* SECTION FINANCE */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border-t-[8px] border-amber-400 relative overflow-hidden group w-full">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4 mb-2"><Wallet className="w-10 h-10 text-amber-500" /><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0">GESTION DES FINANCES</h2></div>
                 <p className="text-slate-500 font-medium max-w-md m-0 leading-relaxed">Suivez vos recettes, vos dépenses et recouvrez vos ardoises pour garantir la santé financière de votre empire.</p>
                 <button onClick={() => navigate('/caisse')} className="bg-brand-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-brand-950 transition-all">Ouvrir la Caisse KITA <ArrowRight className="w-4 h-4 text-amber-400" /></button>
              </div>
              <div className="h-40 w-40 bg-amber-50 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-all duration-500"><TrendingUp className="w-16 h-16 text-amber-500" /></div>
           </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-10">
           <div className={`lg:col-span-6 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all ${isStockExpert ? 'bg-slate-900 border-none' : 'bg-white border-2 border-sky-500/20 shadow-sky-900/5'}`}>
              <div className={`absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 ${isStockExpert ? 'text-sky-500' : 'text-sky-300'}`}><Package className="w-32 h-32" /></div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className={`font-black text-[11px] uppercase tracking-[0.3em] mb-4 ${isStockExpert ? 'text-sky-400' : 'text-sky-500'}`}>LOGISTIQUE {isStockExpert && 'ACTIVÉE'}</h2>
                 <h3 className={`text-2xl font-serif font-bold mb-6 ${isStockExpert ? 'text-white' : 'text-slate-900'}`}>Gestion du Stock</h3>
                 <p className={`text-sm leading-relaxed mb-10 flex-grow ${isStockExpert ? 'text-slate-400' : 'text-slate-500'}`}>{isStockExpert ? 'Contrôlez vos produits et colorations. Évitez les vols et les ruptures.' : 'Augmentez votre marge de 20% en contrôlant vos mélanges et stocks.'}</p>
                 {isStockExpert ? <button onClick={() => navigate('/magasin')} className="w-full bg-sky-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-sky-400 transition-all flex items-center justify-center gap-3">Accéder au Magasin <ArrowRight className="w-4 h-4" /></button> : <button onClick={() => navigate('/results?pack=stock')} className="w-full bg-sky-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-sky-700 transition-all flex items-center justify-center gap-3"><Zap className="w-4 h-4" /> Activer le Stock (5 000 F)</button>}
              </div>
           </div>
           <div className={`lg:col-span-6 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all border-2 ${isPerformance ? 'bg-white border-emerald-500' : 'bg-white border-emerald-500/20 shadow-emerald-900/5'}`}>
              <div className={`absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 ${isPerformance ? 'text-emerald-500' : 'text-emerald-300'}`}><Users className="w-32 h-32" /></div>
              <div className="relative z-10 h-full flex flex-col">
                 <h2 className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">HUMAINS {isPerformance && 'ACTIFS'}</h2>
                 <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Ressources Humaines</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">{isPerformance ? 'Pilotez votre équipe (commissions) et fidélisez vos meilleures clientes VIP.' : 'Gérez les commissions avec transparence et piloter vos clients VIP.'}</p>
                 {isPerformance ? <button onClick={() => navigate('/pilotage')} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">Piloter le Staff <ArrowRight className="w-4 h-4" /></button> : <button onClick={() => navigate('/results?pack=performance')} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><Zap className="w-4 h-4" /> Activer les RH (5 000 F)</button>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
