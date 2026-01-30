
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyzeBeautyImage } from '../services/geminiService';
import { updateUserProfile } from '../services/supabase';
import KitaTopNav from '../components/KitaTopNav';
import { 
  Camera, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Instagram, 
  MessageCircle, 
  Quote, 
  Copy, 
  RefreshCw,
  X,
  ChevronLeft,
  Zap,
  Star,
  Award,
  Lock,
  ArrowRight,
  Gem,
  Coins
} from 'lucide-react';

const MarketingVisuel: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    technique: string;
    instagram: string;
    whatsapp: string;
    conseil: string;
    hashtags: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOGIQUE ELITE / CREDITS
  const isElite = useMemo(() => {
    if (!user) return false;
    return user.isKitaPremium || (user.purchasedModuleIds?.length || 0) >= 16;
  }, [user]);

  const hasCredits = useMemo(() => {
    if (!user) return false;
    return isElite || (user.marketingCredits || 0) > 0;
  }, [user, isElite]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image || !user || !hasCredits) return;
    
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      const text = await analyzeBeautyImage(base64Data, mimeType);
      
      // Parsing structuré
      const parse = (tag: string) => {
        const regex = new RegExp(`\\[${tag}\\]\\s*:\\s*([\\s\\S]*?)(?=\\n\\[|$)`, 'i');
        const match = text?.match(regex);
        return match ? match[1].trim() : "";
      };

      setResults({
        technique: parse('TECHNIQUE'),
        instagram: parse('INSTAGRAM'),
        whatsapp: parse('WHATSAPP'),
        conseil: parse('CONSEIL'),
        hashtags: parse('HASHTAGS')
      });

      // DÉCRÉMENTATION DES CRÉDITS (si pas Élite)
      if (!isElite) {
        const currentCredits = user.marketingCredits || 0;
        await updateUserProfile(user.uid, { marketingCredits: Math.max(0, currentCredits - 1) });
        await refreshProfile();
      }

    } catch (err) {
      alert("Erreur d'analyse. Réessayez avec une image plus claire.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <KitaTopNav />
      
      <header className="bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-900 pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Instagram className="w-96 h-96 text-white" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button onClick={() => navigate('/dashboard')} className="mb-6 inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest group mx-auto">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
          </button>
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-brand-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            <Zap className="w-4 h-4" /> Laboratoire IA Go'Top
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight mb-6">
            Assistant <span className="text-brand-500 italic">Marketing</span>
          </h1>
          
          <div className="flex justify-center gap-4 mt-8">
             <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                {isElite ? (
                   <>
                    <Gem className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Accès Élite Illimité</span>
                   </>
                ) : (
                   <>
                    <Coins className="w-4 h-4 text-brand-500" />
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{user.marketingCredits} Analyses restantes</span>
                   </>
                )}
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20">
        {!hasCredits && !results ? (
          /* ECRAN DE VERROUILLAGE CRÉDITS ÉPUISÉS */
          <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
             <div className="h-24 w-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Lock className="w-10 h-10" />
             </div>
             <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Crédits Marketing Épuisés</h2>
             <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto mb-12 leading-relaxed">
               Gérant, vous avez utilisé vos 3 essais offerts. Pour continuer à utiliser Coach Kita comme votre Community Manager personnel, passez au Pack Excellence.
             </p>
             <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button 
                   onClick={() => navigate('/results?pack=full')}
                   className="bg-brand-900 text-white p-8 rounded-[2.5rem] text-left hover:scale-105 transition-all shadow-xl group"
                >
                   <Gem className="w-8 h-8 text-amber-400 mb-4" />
                   <h3 className="text-xl font-bold mb-2">Pack Excellence</h3>
                   <p className="text-slate-400 text-xs mb-6 uppercase font-black">Accès illimité à vie</p>
                   <div className="flex items-center gap-2 text-brand-500 font-black text-[10px] uppercase tracking-widest">
                      Activer maintenant <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                   </div>
                </button>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] text-left border border-slate-100">
                   <h3 className="text-xl font-bold mb-2 text-slate-400">Recharge Simple</h3>
                   <p className="text-slate-400 text-xs mb-6">Prochainement disponible</p>
                   <p className="text-slate-300 font-medium italic text-xs">"Investissez dans votre visibilité pour attirer l'Élite."</p>
                </div>
             </div>
          </div>
        ) : (
          /* INTERFACE NORMALE */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* ZONE PHOTO */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 text-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Image de réalisation</h3>
                
                <div 
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className={`relative aspect-[4/5] rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${
                    image ? 'border-brand-500 shadow-xl' : 'border-slate-100 hover:border-brand-300 bg-slate-50'
                  }`}
                >
                  {image ? (
                    <>
                      <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Preview" />
                      {!loading && (
                        <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <RefreshCw className="text-white w-10 h-10 mb-2" />
                           <span className="text-white text-[10px] font-black uppercase tracking-widest">Changer la photo</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                         <Camera className="w-10 h-10 text-brand-500" />
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Prendre ou choisir une photo</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {image && !results && (
                  <button 
                    onClick={processImage} 
                    disabled={loading}
                    className="w-full mt-8 bg-brand-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                    {loading ? "Le mentor analyse..." : "Générer mon contenu"}
                  </button>
                )}

                {results && (
                  <button 
                    onClick={() => { setImage(null); setResults(null); }}
                    className="w-full mt-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Nouvelle Analyse
                  </button>
                )}
              </div>
              
              <div className="bg-brand-50 p-6 rounded-[2rem] border border-brand-100 flex items-start gap-4">
                 <Star className="w-5 h-5 text-brand-500 shrink-0 mt-1" />
                 <p className="text-[11px] font-medium text-brand-900 leading-relaxed italic">
                   "Gérant, une photo nette et lumineuse augmente vos chances de vente par 3. Préférez la lumière du jour."
                 </p>
              </div>
            </div>

            {/* ZONE RÉSULTATS */}
            <div className="lg:col-span-7">
              {results ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  
                  {/* Result Technique */}
                  <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex items-center gap-6">
                     <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600">
                        <Award className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Expertise détectée</p>
                        <p className="text-xl font-bold text-slate-900">{results.technique}</p>
                     </div>
                  </div>

                  {/* Instagram */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative group">
                     <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                           <Instagram className="w-5 h-5 text-rose-500" />
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Légende Instagram</h4>
                        </div>
                        <button onClick={() => copyToClipboard(results.instagram, 'insta')} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                           {copiedField === 'insta' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                     </div>
                     <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{results.instagram}</p>
                     <div className="mt-6 pt-6 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-brand-500">{results.hashtags}</p>
                     </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 group">
                     <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                           <MessageCircle className="w-5 h-5 text-emerald-500" />
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut WhatsApp</h4>
                        </div>
                        <button onClick={() => copyToClipboard(results.whatsapp, 'wa')} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                           {copiedField === 'wa' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                     </div>
                     <p className="text-lg text-slate-700 leading-relaxed font-medium bg-emerald-50/30 p-6 rounded-2xl italic border border-emerald-50">
                        "{results.whatsapp}"
                     </p>
                  </div>

                  {/* Conseil Mentor */}
                  <div className="bg-brand-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group text-white">
                     <Quote className="absolute top-6 right-6 w-20 h-20 text-brand-800 opacity-30" />
                     <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8">Conseil du Mentor</h4>
                        <p className="text-xl font-serif italic text-slate-200 leading-relaxed">
                          "{results.conseil}"
                        </p>
                     </div>
                  </div>

                </div>
              ) : loading ? (
                <div className="h-full flex flex-col items-center justify-center py-20 gap-8 bg-white/50 rounded-[3rem] border border-dashed border-slate-200 backdrop-blur-sm">
                   <div className="relative">
                      <Loader2 className="w-16 h-16 text-brand-500 animate-spin" />
                      <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full"></div>
                   </div>
                   <div className="text-center space-y-4">
                      <h4 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Analyse stratégique...</h4>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">L'œil du mentor scanne votre travail</p>
                   </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-100 text-center px-10">
                   <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                      <Sparkles className="w-12 h-12 text-slate-200" />
                   </div>
                   <h3 className="text-2xl font-serif font-bold text-slate-300 mb-4">En attente de votre chef-d'œuvre</h3>
                   <p className="text-slate-400 max-w-sm mx-auto italic font-medium">
                     Sélectionnez une photo de votre prestation pour que l'IA rédige votre stratégie de vente.
                   </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingVisuel;
