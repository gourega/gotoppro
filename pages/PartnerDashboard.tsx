import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReferrals, updateUserProfile } from '../services/supabase';
import { UserProfile } from '../types';
/* Fix: Import missing constant for WhatsApp redirection */
import { COACH_KITA_PHONE } from '../constants';
import { 
  Handshake, 
  Copy, 
  Check, 
  TrendingUp, 
  Users, 
  Banknote, 
  Award, 
  ExternalLink,
  MessageCircle,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
  Star,
  Quote,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import ReactCanvasConfetti from 'react-canvas-confetti';

const COMMISSION_PER_ELITE = 1500;

const PartnerDashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [filleuls, setFilleuls] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [hasNewSuccess, setHasNewSuccess] = useState(false);
  const [shouldFire, setShouldFire] = useState(false);

  useEffect(() => {
    if (user?.role !== 'PARTNER') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getReferrals(user.uid);
      setFilleuls(data);
      
      // Détection de nouveaux succès (simulé pour l'effet Wow)
      const activeElites = data.filter(f => f.isActive && (f.isKitaPremium || f.hasPerformancePack)).length;
      const lastKnownEliteCount = Number(localStorage.getItem(`partner_elites_${user.uid}`) || 0);
      
      if (activeElites > lastKnownEliteCount) {
        setHasNewSuccess(true);
        setShouldFire(true);
        localStorage.setItem(`partner_elites_${user.uid}`, activeElites.toString());
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/#/quiz?ref=${user?.phoneNumber}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const activeElites = useMemo(() => filleuls.filter(f => f.isActive && (f.isKitaPremium || f.hasPerformancePack)), [filleuls]);
  const totalCagnotte = activeElites.length * COMMISSION_PER_ELITE;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 selection:bg-amber-500 selection:text-white">
      {shouldFire && (
        <ReactCanvasConfetti
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}
          onInit={({ confetti }) => {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#fbbf24', '#0c4a6e', '#10b981'] });
            setShouldFire(false);
          }}
        />
      )}

      {/* HEADER DORÉ */}
      <header className="bg-gradient-to-br from-brand-900 via-brand-950 to-black pt-16 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
               <Handshake className="w-4 h-4" /> Espace Partenaire Stratégique
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              Bonjour, <span className="text-amber-500 italic">{user.firstName}</span>
            </h1>
            <div className="flex gap-3">
               <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                  <Award className="w-4 h-4" /> Grade : Ambassadeur Excellence
               </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 flex items-center gap-8 shadow-2xl group transition-all hover:bg-white/10">
             <div className="text-right">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Cagnotte Commission</p>
                <p className="text-4xl font-black text-white">{totalCagnotte.toLocaleString()} <span className="text-lg opacity-40">F</span></p>
             </div>
             <button 
                onClick={() => setShowContract(true)}
                className="bg-amber-500 text-brand-900 p-4 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
             >
                <FileText className="w-6 h-6" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-20 relative z-20 space-y-12">
        
        {/* MODAL CONTRAT */}
        {showContract && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 md:p-14 relative animate-in zoom-in-95 overflow-y-auto max-h-[85vh]">
                 <button onClick={() => setShowContract(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"><X /></button>
                 <div className="text-center mb-10">
                    <Handshake className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-serif font-bold text-slate-900">Contrat Partenaire</h2>
                 </div>
                 <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 italic">
                    <p>En tant que Partenaire Stratégique Go'Top Pro, vous vous engagez à promouvoir l'Excellence Kita.</p>
                    <h4 className="text-brand-900 font-black uppercase text-[10px] tracking-widest mt-8">Article 1 : Commissions</h4>
                    <p>Chaque gérant s'inscrivant via votre lien et achetant le <strong>Pack Excellence Totale (15 000 FCFA)</strong> génère une commission de 10% (1 500 FCFA).</p>
                    <h4 className="text-brand-900 font-black uppercase text-[10px] tracking-widest mt-8">Article 2 : Paiement</h4>
                    <p>Les commissions sont payables par Wave CI sur demande dès que le compte du filleul est activé.</p>
                    <h4 className="text-brand-900 font-black uppercase text-[10px] tracking-widest mt-8">Article 3 : Éthique</h4>
                    <p>Le partenaire s'interdit toute pratique commerciale trompeuse ou agressive.</p>
                 </div>
                 <button onClick={() => setShowContract(false)} className="w-full mt-10 bg-brand-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest">J'accepte les termes</button>
              </div>
           </div>
        )}

        {/* NOTIFICATION WOW */}
        {hasNewSuccess && (
           <div className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 border-4 border-emerald-400">
              <div className="flex items-center gap-6">
                 <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                    <Banknote className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Nouvelle Commission !</h3>
                    <p className="font-bold opacity-90">Un de vos filleuls vient de passer Élite. Votre cagnotte a grimpé.</p>
                 </div>
              </div>
              <button onClick={() => setHasNewSuccess(false)} className="bg-white text-emerald-600 px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Super !</button>
           </div>
        )}

        {/* SECTION OUTIL PARRAINAGE */}
        <section className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-[15rem] font-serif italic pointer-events-none group-hover:scale-110 transition-transform duration-1000">Lien</div>
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
              <div className="space-y-6 text-center md:text-left">
                 <h2 className="text-3xl font-serif font-bold text-slate-900">Propulsez un Salon</h2>
                 <p className="text-slate-500 font-medium max-w-md leading-relaxed">
                   Copiez votre lien unique et partagez-le sur WhatsApp à vos contacts gérants. Chaque diagnostic lancé via ce lien vous est rattaché.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 font-mono text-xs text-slate-400 truncate max-w-xs">
                       gotoppro.ourega...ref={user.phoneNumber}
                    </div>
                    <button 
                       onClick={copyLink}
                       className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${copying ? 'bg-emerald-500 text-white' : 'bg-brand-900 text-white hover:bg-black'}`}
                    >
                       {copying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       {copying ? 'Copié !' : 'Copier mon lien'}
                    </button>
                 </div>
              </div>
              <div className="h-48 w-48 bg-amber-50 rounded-[3rem] flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-all">
                 <Handshake className="w-20 h-20 text-amber-500" />
              </div>
           </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* STATS RAPIDES */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-brand-900 rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden group">
                 <Zap className="absolute top-6 right-6 w-12 h-12 text-brand-700 group-hover:scale-125 transition-transform" />
                 <p className="text-brand-500 font-black text-[9px] uppercase tracking-[0.4em] mb-8">Efficacité Réseau</p>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-4xl font-black">{filleuls.length}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Salons inscrits</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-500" style={{ width: '40%' }}></div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl group cursor-pointer hover:border-amber-400 transition-all">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                       <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900">Paiement Wave</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase">Réclamer mes gains</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => window.open(`https://wa.me/${COACH_KITA_PHONE.replace(/\+/g,'')}?text=${encodeURIComponent(`Bonjour Coach Kita, je souhaite encaisser ma commission de ${totalCagnotte} F CFA.`)}`, '_blank')}
                   className="w-full py-4 rounded-xl bg-slate-50 text-brand-900 font-black text-[9px] uppercase tracking-widest group-hover:bg-amber-400 transition-all"
                 >
                    Demander Transfert
                 </button>
              </div>
           </div>

           {/* LISTE DES FILLEULS */}
           <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <Users className="w-6 h-6 text-brand-600" />
                    <h3 className="text-xl font-serif font-bold text-slate-900">Mon Réseau Propulsé</h3>
                 </div>
                 <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{filleuls.length} contact(s)</span>
              </div>

              <div className="space-y-4">
                 {filleuls.length > 0 ? filleuls.map((f, idx) => {
                    const isElite = f.isActive && (f.isKitaPremium || f.hasPerformancePack);
                    return (
                       <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-brand-100 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-white shrink-0 ${isElite ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-200 text-slate-400'}`}>
                                {f.firstName?.[0]}
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-900 text-lg leading-tight">{f.establishmentName || `${f.firstName} ${f.lastName}`}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <div className={`w-2 h-2 rounded-full ${isElite ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isElite ? 'Elite Actif' : 'Inscrit'}</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             {isElite ? (
                                <div className="flex items-center gap-2 text-emerald-600 font-black">
                                   <ArrowUpRight className="w-4 h-4" />
                                   <span className="text-sm">+ {COMMISSION_PER_ELITE} F</span>
                                </div>
                             ) : (
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Attente Activation</span>
                             )}
                          </div>
                       </div>
                    );
                 }) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                       <Handshake className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-medium italic">Partagez votre lien pour voir apparaître vos premiers salons ici.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* MANTRA DU PARTENAIRE */}
        <section className="bg-brand-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
           <Quote className="absolute top-6 left-6 w-16 h-16 opacity-10" />
           <p className="text-2xl font-serif italic mb-8 relative z-10">"Votre influence est votre plus grand capital. Transformez chaque salon de votre quartier en une institution d'excellence."</p>
           <div className="flex items-center justify-center gap-4">
              <div className="h-1.5 w-12 bg-amber-500 rounded-full"></div>
              <span className="font-black uppercase text-[10px] tracking-[0.4em] text-amber-500">Coach Kita Protocol</span>
              <div className="h-1.5 w-12 bg-amber-500 rounded-full"></div>
           </div>
        </section>

      </main>
    </div>
  );
};

export default PartnerDashboard;