
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule, UserProfile } from '../types';
import { supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';
import { 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Plus, 
  X,
  TrendingUp,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  Info,
  Star,
  Crown,
  AlertTriangle,
  Smartphone
} from 'lucide-react';

const Results: React.FC = () => {
  const [strategicModules, setStrategicModules] = useState<TrainingModule[]>([]);
  const [catalogueModules, setCatalogueModules] = useState<TrainingModule[]>([]);
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'phone' | 'payment'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [isPerfectScore, setIsPerfectScore] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('temp_quiz_results');
    if (!raw) {
      navigate('/');
      return;
    }
    const results = JSON.parse(raw);
    const negativeQuestions = results.filter((r: any) => !r.answer);
    
    let recommended: TrainingModule[] = [];
    let others: TrainingModule[] = [];
    let perfect = false;

    if (negativeQuestions.length === 0) {
      perfect = true;
      setIsPerfectScore(true);
      const masteryIds = ["mod_tarification", "mod_social_media", "mod_management", "mod_tresorerie"];
      recommended = TRAINING_CATALOG.filter(m => masteryIds.includes(m.id));
      others = TRAINING_CATALOG.filter(m => !masteryIds.includes(m.id));
    } else {
      const negativeLinkedIds = negativeQuestions.map((r: any) => {
        const q = DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId);
        return q?.linkedModuleId;
      });
      recommended = TRAINING_CATALOG.filter(m => negativeLinkedIds.includes(m.id));
      others = TRAINING_CATALOG.filter(m => !negativeLinkedIds.includes(m.id));
    }
    
    setStrategicModules(recommended);
    setCatalogueModules(others);
    setCart(recommended);

    const getAdvice = async () => {
      const negativeTexts = negativeQuestions.map((r: any) => {
        return DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text;
      }).filter(Boolean) as string[];

      const advice = await generateStrategicAdvice(negativeTexts, perfect);
      setAiAdvice(advice ?? null);
      setLoadingAdvice(false);
    };
    getAdvice();

    window.scrollTo(0,0);
  }, [navigate]);

  const pricingData = useMemo(() => {
    const count = cart.length;
    let discount = 0;
    let nextTierCount = 5;
    let nextTierPercent = 20;

    if (count >= 13) {
      discount = 50;
    } else if (count >= 9) {
      discount = 30;
      nextTierCount = 13;
      nextTierPercent = 50;
    } else if (count >= 5) {
      discount = 20;
      nextTierCount = 9;
      nextTierPercent = 30;
    }

    const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
    const savings = Math.round(subtotal * (discount / 100));
    const progress = Math.min((count / 13) * 100, 100);

    return { 
      discount, 
      subtotal, 
      savings, 
      total: subtotal - savings,
      remainingForNext: nextTierCount > count ? nextTierCount - count : 0,
      nextTierPercent,
      progress,
      count
    };
  }, [cart]);

  const toggleCartItem = (mod: TrainingModule) => {
    setCart(prev => 
      prev.find(item => item.id === mod.id) 
        ? prev.filter(item => item.id !== mod.id)
        : [...prev, mod]
    );
  };

  const handleIdentification = async () => {
    setDbError(null);
    const digitsOnly = phoneInput.replace(/\D/g, '');
    
    if (digitsOnly.length < 10) {
      alert("Veuillez entrer un numéro à 10 chiffres (ex: 07 08 04 79 14)");
      return;
    }

    setLoading(true);
    const formattedPhone = `+225${digitsOnly.slice(-10)}`;

    try {
      if (!supabase) throw new Error("Base de données non configurée.");

      // 1. Vérifier si l'utilisateur existe
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phoneNumber', formattedPhone)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const purchasedModuleIds = cart.map(m => m.id);
      
      if (!existingProfile) {
        // 2. Création du profil Prospect
        const newProfile = {
          uid: `client_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          phoneNumber: formattedPhone,
          role: 'CLIENT',
          isActive: false,
          isAdmin: false,
          badges: [],
          purchasedModuleIds: purchasedModuleIds,
          pendingModuleIds: purchasedModuleIds,
          actionPlan: [],
          createdAt: new Date().toISOString()
        };
        
        const { error: insError } = await supabase.from('profiles').insert(newProfile);
        if (insError) throw insError;
      } else {
        // 3. Mise à jour des modules désirés pour un profil existant
        const updatedPending = [...new Set([...(existingProfile.pendingModuleIds || []), ...purchasedModuleIds])];
        const { error: updError } = await supabase
          .from('profiles')
          .update({ pendingModuleIds: updatedPending })
          .eq('uid', existingProfile.uid);
        
        if (updError) throw updError;
      }

      setCheckoutStep('payment');
    } catch (err: any) {
      console.error("Erreur d'enregistrement:", err);
      setDbError(`Erreur technique : ${err.message || "Vérifiez votre script SQL dans Supabase"}`);
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (id: string) => cart.some(item => item.id === id);

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <header className="mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {isPerfectScore ? "Parcours Maîtrise Elite" : "Optimisation Stratégique"}
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">
            {isPerfectScore 
              ? "Vos bases sont solides. Passons maintenant à la vitesse supérieure pour dominer votre marché."
              : "Votre plan de transformation est prêt. Sélectionnez les modules pour activer votre croissance."}
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-16">
            
            {/* L'Analyse de Coach Kita */}
            <section className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                {isPerfectScore ? <Crown className="w-48 h-48" /> : <TrendingUp className="w-48 h-48" />}
              </div>
              
              <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                <div className="shrink-0 mx-auto">
                  <div className="h-28 w-28 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 ring-1 ring-slate-100">
                    <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div className="flex-grow space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 font-serif italic">L'audit de Coach Kita</h2>
                    <div className="h-1.5 w-16 bg-brand-500 rounded-full"></div>
                  </div>
                  
                  <div className="text-slate-700 font-medium text-lg leading-relaxed">
                    {loadingAdvice ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                        <span>Analyse de votre potentiel en cours...</span>
                      </div>
                    ) : (
                      aiAdvice || "Préparez-vous à une transformation radicale."
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Réduction progressive</span>
                      <span className="text-brand-600 font-black">PALIER ACTUEL: -{pricingData.discount}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative shadow-inner border border-slate-200">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-1000 ease-out"
                        style={{ width: `${pricingData.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>0%</span>
                      <span>-20% (5 modules)</span>
                      <span>-30% (9 modules)</span>
                      <span>-50% (13 modules)</span>
                    </div>
                    {pricingData.remainingForNext > 0 && (
                      <div className="flex items-center gap-2 text-brand-700 font-black text-xs bg-brand-50 p-4 rounded-2xl border border-brand-100 animate-in fade-in duration-500">
                        <Star className="w-4 h-4 fill-brand-500 text-brand-500" />
                        Plus que {pricingData.remainingForNext} module(s) pour économiser -{pricingData.nextTierPercent}% !
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Priorités Stratégiques */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  {isPerfectScore ? <Crown className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isPerfectScore ? "Vos Modules de Maîtrise Elite" : "Vos Priorités Stratégiques"}
                  </h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    {isPerfectScore ? "Sélectionnés pour sécuriser votre position de leader" : "Recommandé par l'IA pour corriger vos points faibles"}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {strategicModules.map((mod) => (
                  <ModuleCard key={mod.id} mod={mod} isInCart={isInCart(mod.id)} onToggle={() => toggleCartItem(mod)} variant="premium" />
                ))}
              </div>
            </section>

            {/* Catalogue Général */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catalogue de Perfectionnement</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Modules complémentaires pour une expertise complète</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {catalogueModules.map((mod) => (
                  <ModuleCard key={mod.id} mod={mod} isInCart={isInCart(mod.id)} onToggle={() => toggleCartItem(mod)} variant="standard" />
                ))}
              </div>
            </section>
          </div>

          {/* COLONNE DROITE */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-brand-600" />
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Votre Panier</h3>
                </div>
                <div className="h-8 w-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-brand-100">
                  {cart.length}
                </div>
              </div>

              <div className="p-6 max-h-[350px] overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30">
                {cart.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <p className="text-slate-300 font-bold italic text-sm">Panier vide</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="p-5 bg-white rounded-3xl border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                        <div className="pr-4 max-w-[160px]">
                          <p className="text-[13px] font-black text-slate-800 leading-tight mb-1 truncate">{item.title}</p>
                          <p className="text-[9px] text-brand-50 font-black px-2 py-0.5 rounded bg-brand-500 uppercase tracking-widest font-mono inline-block">{item.price.toLocaleString()} FCFA</p>
                        </div>
                        <button 
                          onClick={() => toggleCartItem(item)}
                          className="p-3 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-10 bg-slate-900 text-white rounded-t-[3.5rem] space-y-8 relative">
                <div className="space-y-5">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valeur totale</span>
                    <span className="text-lg">{pricingData.subtotal.toLocaleString()} FCFA</span>
                  </div>
                  
                  {pricingData.discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 font-mono">
                      <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-current" />
                        Économie Pack (-{pricingData.discount}%)
                      </span>
                      <span className="text-lg">-{pricingData.savings.toLocaleString()} FCFA</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-white/20 pt-4"></div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Investissement Net</p>
                      <p className="text-4xl font-black text-white tracking-tighter font-mono">
                        {pricingData.total.toLocaleString()}
                        <span className="text-xs font-bold ml-1 opacity-50">FCFA</span>
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={cart.length === 0}
                  className="w-full py-6 bg-brand-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-brand-900/40 hover:bg-brand-400 hover:-translate-y-1 active:scale-95 disabled:opacity-30 disabled:translate-y-0 transition-all flex items-center justify-center gap-4 group"
                >
                  Démarrer mon parcours
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-3 pt-2 opacity-50">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Validation via Wave Côte d'Ivoire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL D'IDENTIFICATION ET PAIEMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {checkoutStep === 'phone' ? (
              <div className="p-12">
                <div className="mb-12 text-center">
                  <div className="h-20 w-20 bg-brand-50 text-brand-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Identification</h2>
                  <p className="text-slate-500 font-medium text-sm">Votre numéro est votre clé d'accès.</p>
                </div>

                {dbError && (
                  <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-[11px] font-bold leading-tight">{dbError}</p>
                  </div>
                )}
                
                <div className="mb-10">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Numéro WhatsApp</label>
                  <input 
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="07 08 04 79 14"
                    className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-none outline-none text-2xl font-black text-slate-900 focus:ring-4 focus:ring-brand-500/10 transition-all text-center"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-6">
                  <button 
                    onClick={handleIdentification}
                    disabled={loading}
                    className="w-full py-6 bg-brand-600 text-white font-black rounded-3xl hover:bg-brand-700 shadow-xl shadow-brand-100 text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Étape suivante"}
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">Retour au diagnostic</button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg">
                   <Zap className="w-10 h-10 fill-current" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Paiement Wave CI</h2>
                <p className="text-slate-500 mb-10 font-medium">
                  Réglez <b className="text-slate-900 text-2xl font-mono block mt-2">{pricingData.total.toLocaleString()} FCFA</b>
                </p>
                
                <div className="bg-slate-50 p-10 rounded-[3rem] mb-10 border border-slate-100 shadow-inner">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Scannez le code QR ci-dessous</div>
                   <div className="p-6 bg-white rounded-[2.5rem] shadow-xl inline-block group border border-slate-100">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://pay.wave.com/m/M_ci_tl569RJDWLXi/c/ci/`} 
                      alt="Paiement Wave" 
                      className="w-48 h-48 group-hover:scale-105 transition-transform duration-500" 
                    />
                   </div>
                   <p className="mt-8 font-black text-slate-900 text-2xl tracking-tight">+225 01 03 43 84 56</p>
                </div>

                <div className="mb-8 p-4 bg-brand-50 rounded-2xl flex items-start gap-3 text-left">
                  <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-brand-900 font-medium leading-relaxed">
                    Votre paiement sera vérifié par Coach Kita. <br/>
                    <b>Délai : 15 min max.</b>
                  </p>
                </div>
                
                <button 
                  onClick={() => navigate('/login')} 
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-2xl"
                >
                  J'ai payé, accéder à mon espace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

const ModuleCard: React.FC<{
  mod: TrainingModule;
  isInCart: boolean;
  onToggle: () => void;
  variant: 'premium' | 'standard';
}> = ({ mod, isInCart, onToggle, variant }) => (
  <div className={`bg-white rounded-[2.5rem] p-8 border transition-all duration-500 flex flex-col h-full group ${
    isInCart 
      ? 'border-brand-500 shadow-xl shadow-brand-50 bg-brand-50/5' 
      : 'border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1'
  }`}>
    <div className="flex-grow space-y-4 mb-10">
      <div className="flex justify-between items-center">
        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
          variant === 'premium' 
            ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/20' 
            : isInCart ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {mod.topic} {variant === 'premium' && '★'}
        </span>
        {isInCart && <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
      </div>
      <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">{mod.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{mod.description}</p>
    </div>
    
    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Prix Module</p>
        <span className="text-xl font-black text-brand-600 font-mono">{mod.price.toLocaleString()} FCFA</span>
      </div>
      <button 
        onClick={onToggle}
        className={`px-7 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
          isInCart 
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-rose-100' 
            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-emerald-100'
        }`}
      >
        {isInCart ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isInCart ? 'Retirer' : 'Ajouter'}
      </button>
    </div>
  </div>
);

export default Results;
