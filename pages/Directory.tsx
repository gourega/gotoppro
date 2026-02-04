
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
  ArrowRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { BRAND_LOGO } from '../constants';

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

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20 space-y-12">
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
          <div className="space-y-16">
            {groupedProfiles.map(([char, members]) => (
              <section key={char} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-brand-900 text-brand-500 flex items-center justify-center font-serif font-bold text-2xl shadow-xl">
                    {char}
                  </div>
                  <div className="h-px bg-slate-200 flex-grow"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((p) => {
                    const isElite = p.isKitaPremium || (p.purchasedModuleIds?.length || 0) >= 16;
                    return (
                      <Link 
                        to={`/p/${p.uid}`} 
                        key={p.uid} 
                        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
                      >
                        {isElite && (
                          <div className="absolute -top-1 -right-1 bg-amber-400 text-brand-900 px-4 py-1.5 rounded-bl-2xl font-black text-[8px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                             <ShieldCheck className="w-3 h-3" /> Membre Élite
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 mb-8">
                          <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner shrink-0">
                            {p.photoURL ? (
                              <img src={p.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-2xl">
                                {p.firstName?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="text-xl font-bold text-slate-900 leading-tight truncate group-hover:text-brand-600 transition-colors">
                              {p.establishmentName || "Salon Indépendant"}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              Dirigé par {p.firstName} {p.lastName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-[9px] font-black uppercase">Standard KITA</span>
                           </div>
                           <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
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
