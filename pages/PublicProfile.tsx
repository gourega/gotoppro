
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile } from '../services/supabase';
import { TRAINING_CATALOG, BADGES, BRAND_LOGO } from '../constants';
import { UserProfile } from '../types';
import { 
  Loader2, 
  Quote, 
  Award, 
  CheckCircle2, 
  Crown, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Briefcase,
  X,
  Download,
  Share2
} from 'lucide-react';

const PublicProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (uid) {
        const data = await getPublicProfile(uid);
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [uid]);

  const certifiedModules = useMemo(() => {
    if (!profile?.progress) return [];
    return TRAINING_CATALOG.filter(m => (profile.progress?.[m.id] || 0) >= 80);
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Profil Introuvable</h1>
        <p className="text-slate-500 mb-8 max-w-md">Ce gérant n'a pas encore activé son profil public ou le lien est erroné.</p>
        <Link to="/" className="bg-brand-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Retour à l'accueil</Link>
      </div>
    );
  }

  const handleDownloadCert = () => {
    window.print();
  };

  const handleShareCert = async (moduleId: string) => {
    const moduleTitle = TRAINING_CATALOG.find(m => m.id === moduleId)?.title || "Formation Go'Top Pro";
    const shareData = {
      title: "Certification d'Excellence",
      text: `Découvrez la certification de ${profile.firstName} sur Go'Top Pro : "${moduleTitle}"`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Lien du profil copié !");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Banner */}
      <div className="bg-brand-900 h-64 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
          {/* Main Info */}
          <div className="p-8 md:p-12 text-center border-b border-slate-50">
             <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl mx-auto mb-8 border-4 border-white overflow-hidden">
                <div className="h-full w-full rounded-[2rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-slate-300">{profile.firstName?.[0]}</span>
                  )}
                </div>
             </div>
             <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-2">{profile.firstName} {profile.lastName}</h1>
             <div className="flex items-center gap-1.5 text-emerald-600 font-black uppercase text-[9px] tracking-widest bg-emerald-50 px-3 py-1 rounded-full justify-center w-fit mx-auto mb-6">
                <ShieldCheck className="w-3 h-3" /> Expert Certifié
             </div>
             {profile.bio && (
               <div className="max-w-2xl mx-auto relative px-8 py-6 bg-brand-50/20 rounded-[2rem] border border-brand-100/30">
                  <Quote className="absolute top-4 left-4 w-8 h-8 text-brand-500 opacity-10" />
                  <p className="text-lg font-serif italic text-slate-700 leading-relaxed">"{profile.bio}"</p>
               </div>
             )}
          </div>

          <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-50">
            {/* Trophées */}
            <div className="md:col-span-4 p-8 md:p-12">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <Award className="w-4 h-4" /> Distinctions
               </h2>
               <div className="grid grid-cols-2 gap-4">
                  {BADGES.map(badge => {
                    const has = (profile.badges || []).includes(badge.id);
                    return (
                      <div key={badge.id} className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${has ? 'bg-white border-2 border-brand-50 shadow-md' : 'bg-slate-50 border-2 border-transparent opacity-20 grayscale'}`}>
                         <span className="text-3xl mb-2">{badge.icon}</span>
                         <span className="text-[8px] font-black uppercase tracking-tight text-slate-600">{badge.name}</span>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Certificats */}
            <div className="md:col-span-8 p-8 md:p-12">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" /> Certifications d'Excellence
               </h2>
               <div className="space-y-4">
                  {certifiedModules.length > 0 ? certifiedModules.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setSelectedCert(m.id)}
                      className="w-full p-6 bg-slate-50 hover:bg-brand-50 rounded-3xl border border-transparent hover:border-brand-200 transition-all flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-600">
                             <Briefcase className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                             <p className="text-[8px] font-black text-brand-600 uppercase mb-1">{m.topic}</p>
                             <p className="font-bold text-slate-900 group-hover:text-brand-900">{m.title}</p>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500" />
                    </button>
                  )) : (
                    <div className="py-20 text-center text-slate-400 italic bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                      Aucune certification publique pour le moment.
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <p className="text-slate-400 font-bold text-sm mb-6">Vous êtes gérant(e) et souhaitez aussi certifier votre expertise ?</p>
           <Link to="/" className="inline-flex items-center gap-3 bg-white border border-slate-200 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <img src={BRAND_LOGO} alt="" className="h-6 w-6" />
              <span className="text-brand-900 font-black text-[11px] uppercase tracking-widest">Rejoindre Go'Top Pro</span>
           </Link>
        </div>
      </div>

      {/* Modal Certificat */}
      {selectedCert && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
           <div className="max-w-2xl w-full animate-in zoom-in-95 duration-300">
              <div className="bg-white border-[12px] border-double border-slate-100 p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden shadow-2xl print:shadow-none print:border-none print:rounded-none">
                <button onClick={() => setSelectedCert(null)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-rose-500 hover:text-white transition-all print:hidden"><X /></button>
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-slate-200 pointer-events-none rounded-[2.5rem] m-1.5 print:hidden"></div>
                <div className="relative z-10">
                  <div className="mb-10">
                    <Crown className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                    <h2 className="text-[10px] font-black text-brand-900 uppercase tracking-[0.5em] mb-3">Certificat d'Excellence Go'Top Pro</h2>
                    <div className="h-px w-20 bg-brand-200 mx-auto"></div>
                  </div>
                  <p className="text-lg font-serif text-slate-500 mb-6 italic">Ce document atteste que l'expert(e)</p>
                  <h3 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-8 tracking-tight">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-md font-medium text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                    A validé avec succès le module de formation magistrale :<br/>
                    <span className="text-brand-900 font-black uppercase tracking-widest text-lg mt-4 block">
                      "{TRAINING_CATALOG.find(m => m.id === selectedCert)?.title}"
                    </span>
                  </p>

                  <div className="flex justify-center gap-4 mb-12 print:hidden">
                    <button 
                      onClick={handleDownloadCert}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-brand-900/20"
                    >
                      <Download className="w-4 h-4" /> Télécharger
                    </button>
                    <button 
                      onClick={() => handleShareCert(selectedCert)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      <Share2 className="w-4 h-4" /> Partager
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-2 opacity-30 mt-4">
                     <img src={BRAND_LOGO} alt="" className="h-8 w-8 grayscale" />
                     <p className="text-[8px] font-black uppercase tracking-widest tracking-[0.3em]">Verify on gotop.pro</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
