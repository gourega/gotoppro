
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
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
  Smartphone,
  Users,
  History
} from 'lucide-react';

const Results: React.FC = () => {
  const { user } = useAuth();
  const [strategicModules, setStrategicModules] = useState<TrainingModule[]>([]);
  const [catalogueModules, setCatalogueModules] = useState<TrainingModule[]>([]);
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [phoneInput, setPhoneInput] = useState('');
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [yearsOfExistence, setYearsOfExistence] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [isPerfectScore, setIsPerfectScore] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. On récupère les résultats du diagnostic s'ils existent
    const raw = localStorage.getItem('temp_quiz_results');
    const results = raw ? JSON.parse(raw) : null;
    
    // 2. On filtre les modules pour ne garder que ceux que l'utilisateur ne possède pas encore
    const purchasedIds = user?.purchasedModuleIds || [];
    const availableCatalog = TRAINING_CATALOG.filter(m => !purchasedIds.includes(m.id));

    let recommended: TrainingModule[] = [];
    let others: TrainingModule[] = [];
    let perfect = false;

    if (results) {
      const negativeQuestions = results.filter((r: any) => !r.answer);
      if (negativeQuestions.length === 0) {
        perfect = true;
        setIsPerfectScore(true);
        const masteryIds = ["mod_tarification", "mod_social_media", "mod_management", "mod_tresorerie"];
        recommended = availableCatalog.filter(m => masteryIds.includes(m.id));
        others = availableCatalog.filter(m => !masteryIds.includes(m.id));
      } else {
        const negativeLinkedIds = negativeQuestions.map((r: any) => {
          const q = DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId);
          return q?.linkedModuleId;
        });
        recommended = availableCatalog.filter(m => negativeLinkedIds.includes(m.id));
        others = availableCatalog.filter(m => !negativeLinkedIds.includes(m.id));
      }

      // Appel à l'IA pour l'audit
      const getAdvice = async () => {
        const negativeTexts = negativeQuestions.map((r: any) => {
          return DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text;
        }).filter(Boolean) as string[];
        const advice = await generateStrategicAdvice(negativeTexts, perfect);
        setAiAdvice(advice ?? null);
        setLoadingAdvice(false);
      };
      getAdvice();
    } else {
      // Pas de diagnostic récent (accès direct depuis Dashboard)
      recommended = [];
      others = availableCatalog;
      setLoadingAdvice(false);
      setAiAdvice("Explorez notre catalogue complet pour renforcer les piliers de votre salon.");
    }
    
    setStrategicModules(recommended);
    setCatalogueModules(others);
    // Panier par défaut : les recommandations
    setCart(recommended);

    window.scrollTo(0,0);
  }, [user, navigate]);

  const pricingData = useMemo(() => {
    const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
    return { subtotal, total: subtotal, count: cart.length };
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
      alert("Veuillez entrer un numéro à 10 chiffres");
      return;
    }

    setLoading(true);
    const formattedPhone = `+225${digitsOnly.slice(-10)}`;
    try {
      if (!supabase) throw new Error("Base de données non configurée.");
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phoneNumber', formattedPhone)
        .maybeSingle();

      const newPendingIds = cart.map(m => m.id);
      
      if (!existingProfile) {
        const newProfile = {
          uid: `client_${Date.now()}`,
          phoneNumber: formattedPhone,
          role: 'CLIENT',
          isActive: false,
          isAdmin: false,
          badges: [],
          employeeCount,
          yearsOfExistence,
          purchasedModuleIds: [],
          pendingModuleIds: newPendingIds,
          actionPlan: [],
          createdAt: new Date().toISOString()
        };
        await supabase.from('profiles').insert(newProfile);
      } else {
        const updatedPending = [...new Set([...(existingProfile.pendingModuleIds || []), ...newPendingIds])];
        await supabase.from('profiles').update({ 
          pendingModuleIds: updatedPending,
          employeeCount: employeeCount || existingProfile.employeeCount,
          yearsOfExistence: yearsOfExistence || existingProfile.yearsOfExistence
        }).eq('uid', existingProfile.uid);
      }
      setCheckoutStep('payment');
    } catch (err: any) {
      setDbError(`Erreur technique : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (id: string) => cart.some(item => item.id === id);

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>');
      return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <header className="mb-14">
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-brand-500 p-2 rounded-xl text-white">
                <ShoppingBag className="w-6 h-6" />
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
               Boutique de l'Excellence
             </h1>
          </div>
          <p className="text-slate-500 text-lg font-medium max-w-2xl ml-14">
            Sélectionnez les modules nécessaires pour franchir la prochaine étape de votre réussite.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-16">
            {/* Coach Kita Advice section */}
            <section className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-14 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-brand-900 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                <Crown className="w-64 h-64" />
              </div>
              <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                <div className="shrink-0 mx-auto">
                  <div className="h-40 w-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 ring-1 ring-slate-100">
                    <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-grow space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 font-serif italic tracking-tight">Audit Stratégique</h2>
                  <div className="text-slate-700 font-medium text-lg leading-relaxed whitespace-pre-line animate-in fade-in duration-1000">
                    {loadingAdvice ? (
                      <div className="flex flex-col items-center gap-6 py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
                        <span className="text-slate-400 font-black uppercase text-xs tracking-widest">Analyse en cours...</span>
                      </div>
                    ) : (
                      <div className="prose prose-slate max-w-none">
                        {aiAdvice ? renderFormattedText(aiAdvice) : "Explorez nos modules experts."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Recommended Modules */}
            {strategicModules.length > 0 && (
              <section className="space-y-8 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recommandations de Coach Kita</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {strategicModules.map((mod) => (
                    <ModuleCard key={mod.id} mod={mod} isInCart={isInCart(mod.id)} onToggle={() => toggleCartItem(mod)} variant="premium" />
                  ))}
                </div>
              </section>
            )}

            {/* Other Modules */}
            {catalogueModules.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catalogue de Formation</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {catalogueModules.map((mod) => (
                    <ModuleCard key={mod.id} mod={mod} isInCart={isInCart(mod.id)} onToggle={() => toggleCartItem(mod)} variant="standard" />
                  ))}
                </div>
              </section>
            )}
            
            {strategicModules.length === 0 && catalogueModules.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-100 p-16 rounded-[4rem] text-center">
                 <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                 <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-4 tracking-tight">Excellence Maximale</h2>
                 <p className="text-emerald-700 text-lg font-medium max-w-xl mx-auto italic">
                   "Félicitations Expert ! Vous avez déjà acquis l'intégralité de nos modules de masterclass Go'Top Pro."
                 </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-brand-600" />
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mon Panier</h3>
                </div>
                <div className="h-8 w-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-brand-100">
                  {cart.length}
                </div>
              </div>

              <div className="p-6 max-h-[350px] overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30">
                {cart.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <p className="text-slate-300 font-bold italic text-sm">Votre sélection est vide</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="p-5 bg-white rounded-3xl border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                        <div className="pr-4 max-w-[160px]">
                          <p className="text-[13px] font-black text-slate-800 leading-tight mb-1 truncate">{item.title}</p>
                          <p className="text-[9px] text-brand-500 font-black uppercase tracking-widest">{item.price.toLocaleString()} FCFA</p>
                        </div>
                        <button onClick={() => toggleCartItem(item)} className="p-3 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-10 bg-slate-900 text-white rounded-t-[3.5rem] space-y-8 relative">
                <div className="space-y-5">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valeur brute</span>
                    <span className="text-lg">{pricingData.subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t border-dashed border-white/20 pt-4"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Investissement Net</p>
                    <p className="text-4xl font-black text-white tracking-tighter font-mono">{pricingData.total.toLocaleString()} <span className="text-xs font-bold ml-1 opacity-50">FCFA</span></p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={cart.length === 0}
                  className="w-full py-6 bg-brand-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-400 transition-all flex items-center justify-center gap-4"
                >
                  Valider l'Engagement
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {checkoutStep === 'details' ? (
              <div className="p-10">
                <div className="mb-10 text-center">
                  <div className="h-20 w-20 bg-brand-50 text-brand-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Identification Gérant</h2>
                  <p className="text-slate-500 font-medium text-xs">Ces informations serviront à générer vos accès.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp (Requis)</label>
                    <input 
                      type="tel"
                      value={phoneInput || user?.phoneNumber || ''}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="07 08 04 79 14"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none text-xl font-black text-center"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleIdentification}
                  disabled={loading}
                  className="w-full py-6 mt-10 bg-brand-600 text-white font-black rounded-[2rem] text-[11px] uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Générer mon accès"}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Annuler</button>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                   <Zap className="w-10 h-10 fill-current" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Paiement Wave CI</h2>
                <p className="text-slate-500 mb-8 font-medium">Réglez <b className="text-slate-900">{pricingData.total.toLocaleString()} FCFA</b> pour débloquer vos modules.</p>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-10 border border-slate-100">
                   <p className="mb-6 font-black text-slate-900 text-xl tracking-tighter">01 03 43 84 56</p>
                   <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest">Coach Kita / Wave</p>
                </div>
                <button onClick={() => navigate('/login')} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px]">J'ai payé, accéder à mon espace</button>
              </div>
            )}
          </div>
        </div>
      )}
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
    isInCart ? 'border-brand-500 shadow-xl bg-brand-50/5' : 'border-slate-100 hover:shadow-2xl hover:-translate-y-1'
  }`}>
    <div className="flex-grow space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${variant === 'premium' ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {mod.topic} {variant === 'premium' && '★'}
        </span>
        {isInCart && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
      </div>
      <h3 className="text-2xl font-black text-slate-900 leading-tight">{mod.title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{mod.description}</p>
    </div>
    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
      <span className="text-xl font-black text-brand-600 font-mono">{mod.price.toLocaleString()} FCFA</span>
      <button onClick={onToggle} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${isInCart ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {isInCart ? 'Retirer' : 'Ajouter'}
      </button>
    </div>
  </div>
);

export default Results;
