import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import { useNavigate, Link } from 'react-router-dom';
import { getPublicDirectory } from '../services/supabase';
import { UserProfile } from '../types';
import { 
  Search, 
  Loader2, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Users, 
  MapPin,
  CheckCircle2,
  Award,
  Sparkles,
  Scissors,
  Shield,
  Gem,
  Medal,
  Smartphone,
  // Add missing TrendingUp import
  TrendingUp
} from 'lucide-react';

const Directory: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getPublicDirectory();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    return profiles.filter(p => 
      (p.establishmentName || '').toLowerCase().includes(s) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(s)
    );
  }, [profiles, searchTerm]);

  // Groupement par initiale pour le tri alphabétique visuel
  const groupedProfiles = useMemo(() => {
    const groups: Record<string, UserProfile[]> = {};
    filteredProfiles.forEach(p => {
      const char = (p.establishmentName?.[0] || '#').toUpperCase();
      if (!groups[char]) groups[char] = [];
      groups[char].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredProfiles]);

  const getQualities = (p: UserProfile) => {
    const qualities = [];
    const progress = p.progress || {};
    
    if (progress['mod_accueil_tel'] >= 80) qualities.push({ label: 'Accueil Élite', icon: <Smartphone className="w-3 h-3" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' });
    if (progress['mod_diagnostic'] >= 80) qualities.push({ label: 'Expert Conseil', icon: <Award className="w-3 h-3" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' });
    if (progress['mod_hygiene'] >= 80) qualities.push({ label: 'Standard Hygiène', icon: <Shield className="w-3 h-3" />, color: 'bg-blue-50 text-blue-600 border-blue-100' });
    if (progress['mod_color'] >= 80) qualities.push({ label: 'Maître Couleur', icon: <Scissors className="w-3 h-3" />, color: 'bg-rose-50 text-rose-600 border-rose-100' });
    if (progress['mod_vip'] >= 80) qualities.push({ label: 'Service VIP', icon: <Gem className="w-3 h-3" />, color: 'bg-amber-50 text-amber-600 border-amber-100' });
    // TrendingUp is used here
    if (progress['mod_pricing'] >= 80) qualities.push({ label: 'Gestion Pro', icon: <TrendingUp className="w-3 h-3" />, color: 'bg-slate-50 text-slate-600 border-slate-100' });

    return qualities.slice(0, 3); // Garder les 3 meilleures
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-brand-900 pt-20 pb-40 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-brand-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            <CheckCircle2 className="w-4 h-4" />
            L'Annuaire de l'Excellence
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Nos <span className="text-brand-500 italic">Gérants</span> Certifiés</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto opacity-80 leading-relaxed font-medium">
            Découvrez les établissements qui ont adopté le standard Kita pour vous offrir une expérience beauté exceptionnelle.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 space-y-12">
        {/* Barre de Recherche */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center gap-4 group focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
          <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-focus-within:text-brand-500 transition-colors">
            <Search className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher un établissement ou un gérant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-transparent border-none outline-none font-bold text-lg text-slate-900 placeholder:text-slate-300"
          />
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-6">
            <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ouverture de l'annuaire...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-bold text-slate-400 italic">"Aucun établissement ne correspond à votre recherche."</h3>
          </div>
        ) : (
          <div className="space-y-24">
            {groupedProfiles.map(([char, members]) => (
              <section key={char} className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-brand-900 text-brand-500 flex items-center justify-center font-serif font-bold text-3xl shadow-xl border-4 border-white">
                    {char}
                  </div>
                  <div className="h-px bg-slate-200 flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {members.map((p) => {
                    const isElite = p.isKitaPremium || (p.purchasedModuleIds?.length || 0) >= 16;
                    const certCount = Object.values(p.progress || {}).filter(v => Number(v) >= 80).length;
                    const qualities = getQualities(p);
                    
                    return (
                      <Link 
                        to={`/p/${p.uid}`} 
                        key={p.uid} 
                        className="bg-white rounded-[3rem] shadow-xl border border-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all group relative flex flex-col overflow-hidden"
                      >
                        {/* Status Bar */}
                        <div className={`h-2 w-full ${isElite ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>

                        <div className="p-8 flex-grow">
                          {/* Header Card */}
                          <div className="flex justify-between items-start mb-8">
                            <div className="h-20 w-20 rounded-[2rem] bg-slate-50 border-2 border-white shadow-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                              {p.photoURL ? (
                                <img src={p.photoURL} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-3xl">
                                  {p.firstName?.[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               {isElite && (
                                 <div className="bg-amber-400 text-brand-900 px-3 py-1 rounded-full font-black text-[7px] uppercase tracking-widest shadow-sm flex items-center gap-1.5 border border-amber-300">
                                    <ShieldCheck className="w-2.5 h-2.5" /> Membre Élite
                                 </div>
                               )}
                               <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black text-[7px] uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                                  <Medal className="w-2.5 h-2.5" /> {certCount}/16 Certifs
                               </div>
                            </div>
                          </div>

                          {/* Identity */}
                          <div className="mb-6">
                            <h3 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-1 group-hover:text-brand-600 transition-colors truncate">
                              {p.establishmentName || "Salon Indépendant"}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Par {p.firstName} {p.lastName}
                            </p>
                          </div>

                          {/* Qualities Summary */}
                          <div className="flex flex-wrap gap-2 mb-8">
                             {qualities.length > 0 ? qualities.map((q, i) => (
                               <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-tight ${q.color}`}>
                                  {q.icon}
                                  {q.label}
                               </div>
                             )) : (
                               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 text-[8px] font-black uppercase italic">
                                  <Sparkles className="w-2.5 h-2.5" /> En cours de certification
                               </div>
                             )}
                          </div>

                          {/* Bio Snippet */}
                          {p.bio && (
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2 mb-8">
                               "{p.bio}"
                            </p>
                          )}
                        </div>

                        {/* Footer Card */}
                        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between group-hover:bg-brand-900 group-hover:text-white transition-all">
                           <div className="flex items-center gap-2">
                              <Star className={`w-3.5 h-3.5 ${isElite ? 'text-amber-500 fill-current' : 'text-emerald-500 fill-current'}`} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Label Excellence Kita</span>
                           </div>
                           <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;