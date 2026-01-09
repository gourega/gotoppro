
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  Loader2, 
  ShoppingBag, 
  Users, 
  Plus, 
  Trash2, 
  Crown, 
  ShieldCheck,
  Phone,
  TrendingUp,
  Gem,
  Package,
  CheckCircle2
} from 'lucide-react';
import { TRAINING_CATALOG, DIAGNOSTIC_QUESTIONS, COACH_KITA_AVATAR } from '../constants';
import { TrainingModule } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { generateStrategicAdvice } from '../services/geminiService';

const Results: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState<TrainingModule[]>([]);
  const [activePack, setActivePack] = useState<'none' | 'elite' | 'performance' | 'stock' | 'elite_performance'>('none');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [phoneInput, setPhoneInput] = useState('');
  const [employeeCount, setEmployeeCount] = useState<number>(user?.employeeCount || 0);
  const [yearsOfExistence, setYearsOfExistence] = useState<number>(user?.yearsOfExistence || 0);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(true);

  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const packParam = params.get('pack');
    if (packParam === 'performance') setActivePack('performance');
    else if (packParam === 'elite') setActivePack('elite');
    else if (packParam === 'stock') setActivePack('stock');
    else if (packParam === 'elite_performance') setActivePack('elite_performance');

    const raw = localStorage.getItem('temp_quiz_results');
    const results = raw ? JSON.parse(raw) : null;
    
    if (results) {
      const negativeQuestions = results.filter((r: any) => !r.answer);
      const getAdvice = async () => {
        const negativeTexts = negativeQuestions.map((r: any) => 
          DIAGNOSTIC_QUESTIONS.find(dq => dq.id === r.questionId)?.text
        ).filter(Boolean) as string[];
        const advice = await generateStrategicAdvice(negativeTexts, negativeQuestions.length === 0);
        setAiAdvice(advice ?? null);
        setLoadingAdvice(false);
      };
      getAdvice();
    } else {
      setLoadingAdvice(false);
      setAiAdvice("Explorez notre catalogue expert pour transformer votre salon.");
    }
  }, [user, location.search]);

  const pricingData = useMemo(() => {
    if (activePack === 'elite') return { total: 10000, label: 'Pack Elite (Formations)' };
    if (activePack === 'performance') return { total: 5000, label: 'Pack Performance+ (Humains)' };
    if (activePack === 'stock') return { total: 5000, label: 'Pack Stock Expert (Magasin)' };
    if (activePack === 'elite_performance') return { total: 15000, label: 'Pack Elite Performance+' };

    const total = cart.reduce((acc, curr) => acc + curr.price, 0);
    return { total, label: null };
  }, [cart, activePack]);

  const handleValidateEngagement = async () => {
    if (user) {
      setLoading(true);
      try {
        if (!supabase) throw new Error("Base de données indisponible");
        
        let newPendingIds: string[] = activePack === 'elite' ? TRAINING_CATALOG.map(m => m.id) : cart.map(m => m.id);
        
        if (activePack === 'elite' || activePack === 'elite_performance') newPendingIds.push('REQUEST_ELITE');
        if (activePack === 'performance' || activePack === 'elite_performance') newPendingIds.push('REQUEST_PERFORMANCE');
        if (activePack === 'stock') newPendingIds.push('REQUEST_STOCK');
        
        const updatedPending = [...new Set([...(user.pendingModuleIds || []), ...newPendingIds])];
        await supabase.from('profiles').update({ pendingModuleIds: updatedPending }).eq('uid', user.uid);
        navigate('/dashboard');
      } catch (err: any) {
        alert(`Erreur : ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>');
      return <p key={i} className="mb-4 text-slate-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-14 flex items-center gap-6">
           <div className="bg-[#0ea5e9] p-3.5 rounded-2xl text-white shadow-lg"><ShoppingBag className="w-7 h-7" /></div>
           <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] tracking-tighter">Boutique de l'excellence</h1>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
           {!isElite && (
             <button onClick={() => setActivePack('elite')} className={`p-10 rounded-[3rem] border-4 text-left transition-all ${activePack === 'elite' ? 'border-amber-400 bg-amber-50' : 'border-slate-100 bg-white hover:border-amber-200'}`}>
                <Crown className="w-10 h-10 text-amber-500 mb-6" />
                <h2 className="text-3xl font-serif font-bold text-slate-900">Pack ELITE</h2>
                <p className="text-slate-500 mt-2">Débloquez les 16 modules experts (10 000 F).</p>
             </button>
           )}
           <button onClick={() => setActivePack('stock')} className={`p-10 rounded-[3rem] border-4 text-left transition-all ${activePack === 'stock' ? 'border-[#0ea5e9] bg-sky-50' : 'border-slate-100 bg-white hover:border-sky-200'}`}>
              <Package className="w-10 h-10 text-[#0ea5e9] mb-6" />
              <h2 className="text-3xl font-serif font-bold text-slate-900">Stock Expert</h2>
              <p className="text-slate-500 mt-2">Maîtrisez votre magasin et évitez les pertes (5 000 F).</p>
           </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-12">
            <section className="bg-white rounded-[4rem] border border-slate-100 p-12 shadow-xl">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="h-44 w-44 rounded-[3.5rem] overflow-hidden border-[8px] border-slate-50 shadow-xl shrink-0">
                  <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-4xl font-serif font-bold text-[#0f172a] mb-6">Audit stratégique</h2>
                  {loadingAdvice ? <Loader2 className="animate-spin text-brand-600" /> : renderFormattedText(aiAdvice || "")}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="bg-[#0f172a] rounded-[3.5rem] p-10 text-white shadow-2xl">
              <h3 className="text-2xl font-black mb-8">Votre Engagement</h3>
              <div className="space-y-6 mb-10">
                 {activePack !== 'none' ? (
                   <p className="text-brand-400 font-bold uppercase tracking-widest">{pricingData.label}</p>
                 ) : (
                   <p className="text-slate-400 italic">Plan personnalisé sélectionné.</p>
                 )}
                 <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black">{pricingData.total.toLocaleString()}</p>
                    <p className="text-xl font-bold text-slate-500">FCFA</p>
                 </div>
              </div>
              <button 
                onClick={handleValidateEngagement}
                className="w-full py-6 bg-[#0ea5e9] rounded-2xl font-black uppercase tracking-widest hover:bg-[#0284c7] transition-all"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Valider l'engagement"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
