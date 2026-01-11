
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, LEGACY_ID_MAP } from '../constants';
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
  Sparkles
} from 'lucide-react';

const MesFormations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sécurité Fail-safe + Migration Legacy + Affichage Global Elite
  const myModules = useMemo(() => {
    if (!user) return [];
    
    // RÈGLE D'OR : Si Elite ou Admin, on donne TOUT sans réfléchir aux IDs
    if (user.isKitaPremium || user.role === 'SUPER_ADMIN' || (user.purchasedModuleIds?.length || 0) >= 15) {
      return TRAINING_CATALOG;
    }

    const purchasedIds = user.purchasedModuleIds || [];
    
    // Traduction des IDs legacy pour le filtrage
    const translatedIds = purchasedIds.map(id => LEGACY_ID_MAP[id] || id);
    
    // On affiche aussi les modules qui ont de la progression (legacy recovery)
    const progressIds = user.progress ? Object.keys(user.progress).map(id => LEGACY_ID_MAP[id] || id) : [];
    
    const allValidIds = [...new Set([...translatedIds, ...progressIds])];

    return TRAINING_CATALOG.filter(m => allValidIds.includes(m.id));
  }, [user]);

  const certifiedCount = useMemo(() => {
    if (!user?.progress) return 0;
    
    // Compter les scores >= 80% en tenant compte de la migration
    const uniqueCertified = new Set<string>();
    Object.entries(user.progress).forEach(([id, score]) => {
      if (score >= 80) {
        uniqueCertified.add(LEGACY_ID_MAP[id] || id);
      }
    });
    
    return uniqueCertified.size;
  }, [user]);

  if (!user) return null;

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
        
        {/* TABLEAU DE PRESTIGE */}
        <section className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Badges Card */}
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
                          isUnlocked 
                          ? 'bg-amber-50 border-amber-200 grayscale-0 scale-100' 
                          : 'bg-slate-50 border-slate-100 grayscale opacity-20 scale-90 group-hover/badge:opacity-40'
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

           {/* Certifications Counter */}
           <div className="lg:col-span-4 bg-brand-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group text-white">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0 duration-1000">
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
                 // Rechercher le score en testant l'ID actuel et l'ancien ID
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
                         <div 
                           className={`h-full transition-all duration-1000 ${isCertified ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                           style={{ width: `${score}%` }}
                         ></div>
                       </div>
                     </div>

                     <button 
                       onClick={() => navigate(`/module/${module.id}`)}
                       className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                         isCertified 
                         ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                         : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                       }`}
                     >
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
                 <p className="text-slate-500 mb-10 max-w-md mx-auto">Vous n'avez pas encore acheté de modules. Réalisez votre diagnostic pour identifier vos besoins prioritaires.</p>
                 <button onClick={() => navigate('/quiz')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto">
                   Aller à la boutique <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
             )}
           </div>
        </div>

        {/* Aide du Mentor */}
        <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:scale-110">
              <BookOpen className="w-48 h-48" />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="h-32 w-32 bg-indigo-500 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl">
                 <Clock className="w-16 h-16 text-white" />
              </div>
              <div className="space-y-4 text-center md:text-left">
                 <h4 className="text-2xl font-serif font-bold italic">"Un gérant qui arrête d'apprendre est un gérant qui accepte de perdre."</h4>
                 <p className="text-slate-400 font-medium">Consultez Coach Kita à tout moment si un concept vous semble flou.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MesFormations;
