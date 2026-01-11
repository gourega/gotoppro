
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, LEGACY_ID_MAP } from '../constants';
import { updateUserProfile } from '../services/supabase';
import KitaTopNav from '../components/KitaTopNav';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Trophy, 
  ArrowRight, 
  Star, 
  Clock,
  Medal,
  Award,
  Crown,
  Sparkles,
  RefreshCcw,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const MesFormations: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);

  // LOGIQUE DE RÉCUPÉRATION AGRESSIVE
  const myModules = useMemo(() => {
    if (!user) return [];
    
    // RÈGLE PRIORITAIRE : Si Elite ou Admin, on donne TOUT.
    if (user.isKitaPremium || user.role === 'SUPER_ADMIN') {
      return TRAINING_CATALOG;
    }

    const purchasedIds = user.purchasedModuleIds || [];
    const progressIds = user.progress ? Object.keys(user.progress) : [];
    
    // Fusion et traduction des IDs
    const allKnownIds = [...new Set([...purchasedIds, ...progressIds])];
    const translatedIds = allKnownIds.map(id => LEGACY_ID_MAP[id] || id);

    // Si on détecte qu'il n'y a qu'un seul module mais que l'utilisateur est un client actif,
    // On pourrait être dans le cas du bug de migration.
    const filtered = TRAINING_CATALOG.filter(m => translatedIds.includes(m.id));
    
    // Fallback : Si l'utilisateur est un client mais n'a "rien", on lui montre quand même le catalogue 
    // s'il est censé être Elite (plus de 14 modules théoriques)
    if (filtered.length <= 1 && user.role === 'CLIENT') {
       return filtered; // On laisse le bouton de restauration faire le travail
    }

    return filtered;
  }, [user]);

  const handleForceRestore = async () => {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    try {
      console.log("MesFormations: Restauration forcée des 16 modules...");
      const allIds = TRAINING_CATALOG.map(m => m.id);
      await updateUserProfile(user.uid, { 
        isKitaPremium: true,
        purchasedModuleIds: allIds 
      });
      await refreshProfile();
      alert("Succès ! Votre Académie Elite a été restaurée avec les 16 modules.");
    } catch (e) {
      alert("Erreur de synchronisation. Vérifiez votre connexion.");
    } finally {
      setIsSyncing(false);
    }
  };

  const certifiedCount = useMemo(() => {
    if (!user?.progress) return 0;
    const uniqueCertified = new Set<string>();
    Object.entries(user.progress).forEach(([id, score]) => {
      if (score >= 80) uniqueCertified.add(LEGACY_ID_MAP[id] || id);
    });
    return uniqueCertified.size;
  }, [user]);

  if (!user) return null;

  const showRestoreUI = myModules.length <= 1 && user.role === 'CLIENT';

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <KitaTopNav />

      <header className="bg-indigo-900 pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-[15rem] font-serif italic text-white leading-none">Savoir</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
              <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Mon Académie <span className="text-indigo-400 italic">Elite</span></h1>
          </div>
          <p className="text-slate-300 max-w-2xl font-medium leading-relaxed">
            Retrouvez ici vos modules de formation. Chaque certification validée est un pas de plus vers la domination de votre marché local.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-16 space-y-12 relative z-20">
        
        {/* BANNIÈRE DE RÉCUPÉRATION ÉLITE (Visible seulement si problème détecté) */}
        {showRestoreUI && (
          <div className="bg-amber-500 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col md:row items-center justify-between gap-8 border-4 border-white animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                   <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="text-white">
                   <h2 className="text-2xl font-black uppercase tracking-tight">Accès Elite Incomplet ?</h2>
                   <p className="font-bold opacity-90">Si vous avez payé le Pack Elite (10.000 F), cliquez sur le bouton pour restaurer vos 16 modules immédiatement.</p>
                </div>
             </div>
             <button 
               onClick={handleForceRestore}
               disabled={isSyncing}
               className="bg-brand-900 text-white px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-brand-950 transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50"
             >
                {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                {isSyncing ? 'Synchronisation...' : 'Restaurer mes 16 modules'}
             </button>
          </div>
        )}

        {/* TABLEAU DE PRESTIGE */}
        <section className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Medal className="w-40 h-40 text-slate-900" />
              </div>
              <div className="flex items-center gap-3 mb-10 relative z-10">
                 <Medal className="text-amber-500 w-5 h-5" />
                 <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Distinctions de l'Empire</h2>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 relative z-10">
                 {BADGES.map(badge => {
                   const isUnlocked = (user.badges || []).includes(badge.id);
                   return (
                     <div key={badge.id} className="flex flex-col items-center gap-3 group/badge">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-all duration-500 ${
                          isUnlocked ? 'bg-amber-50 border-amber-200 grayscale-0 scale-100' : 'bg-slate-50 border-slate-100 grayscale opacity-20 scale-90'
                        }`}>
                           {badge.icon}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest text-center px-1 ${isUnlocked ? 'text-slate-900' : 'text-slate-400'}`}>
                           {badge.name}
                        </span>
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="lg:col-span-4 bg-brand-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group text-white">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-1000">
                 <Award className="w-32 h-32 text-amber-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                 <div className="flex items-center gap-3 mb-8">
                    <Crown className="text-amber-400 w-5 h-5" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Masterclass Validées</h2>
                 </div>
                 <div className="flex items-baseline gap-3 mb-4">
                    <p className="text-7xl font-black tracking-tighter">{certifiedCount}</p>
                    <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">/ 16</p>
                 </div>
                 <div className="mt-auto">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                       <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-brand-500 transition-all duration-1000" 
                        style={{ width: `${(certifiedCount / 16) * 100}%` }}
                       ></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles className="w-3 h-3 text-amber-400" /> Standard Excellence
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* GRILLE DES MODULES */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 px-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900">Ma Bibliothèque de Cours</h3>
              <div className="h-px bg-slate-200 flex-grow"></div>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {myModules.length > 0 ? (
               myModules.map(module => {
                 const legacyId = Object.keys(LEGACY_ID_MAP).find(key => LEGACY_ID_MAP[key] === module.id);
                 const score = user.progress?.[module.id] || (legacyId ? user.progress?.[legacyId] : 0) || 0;
                 const isCertified = score >= 80;
                 
                 return (
                   <div key={module.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col group hover:-translate-y-1 transition-all">
                     <div className="flex justify-between items-start mb-6">
                       <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{module.topic}</span>
                       {isCertified && <Trophy className="w-5 h-5 text-amber-500" />}
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 flex-grow">{module.title}</h3>
                     <div className="space-y-4 mb-8">
                       <div className="flex justify-between items-end mb-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</span>
                         <span className={`text-xs font-black ${isCertified ? 'text-emerald-500' : 'text-indigo-600'}`}>{score}%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${isCertified ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${score}%` }}></div>
                       </div>
                     </div>
                     <button onClick={() => navigate(`/module/${module.id}`)} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isCertified ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}>
                       {isCertified ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                       {isCertified ? 'Revoir la leçon' : 'Continuer le module'}
                     </button>
                   </div>
                 );
               })
             ) : (
               <div className="col-span-full bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
                 <Star className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                 <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Votre bibliothèque est vide</h3>
                 <p className="text-slate-500 mb-10 max-w-md mx-auto">Une erreur de synchronisation a peut-être eu lieu.</p>
                 <button onClick={handleForceRestore} disabled={isSyncing} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto">
                   {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                   Restaurer mes accès
                 </button>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MesFormations;
