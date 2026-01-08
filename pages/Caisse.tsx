
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaDebt, KitaProduct } from '../types';
import { 
  supabase, 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  getKitaDebts,
  addKitaDebt,
  updateKitaDebt,
  getKitaProducts,
  addKitaProduct,
  updateKitaProduct
} from '../services/supabase';
import { KITA_LOGO, COACH_KITA_AVATAR } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { 
  ChevronLeft, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Package, 
  Users, 
  Cloud, 
  CloudOff, 
  AlertCircle,
  History,
  Trash2,
  Loader2,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowRight,
  PackageSearch,
  Filter,
  BarChart3,
  Lightbulb,
  Sparkles,
  PieChart
} from 'lucide-react';

type Timeframe = 'day' | 'week' | 'month' | 'year';

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'daily' | 'debts' | 'stock'>('daily');
  const [timeframe, setTimeframe] = useState<Timeframe>('day');
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [debts, setDebts] = useState<KitaDebt[]>([]);
  const [products, setProducts] = useState<KitaProduct[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState('Prestation');

  const isPremium = useMemo(() => {
    if (!user?.isKitaPremium) return false;
    if (!user.kitaPremiumUntil) return false;
    return new Date(user.kitaPremiumUntil) > new Date();
  }, [user]);

  useEffect(() => {
    if (user) loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const localTrans = localStorage.getItem(`kita_trans_${user.uid}`);
      if (localTrans) setTransactions(JSON.parse(localTrans));

      if (isPremium) {
        const [cloudTrans, cloudDebts, cloudProducts] = await Promise.all([
          getKitaTransactions(user.uid),
          getKitaDebts(user.uid),
          getKitaProducts(user.uid)
        ]);
        setTransactions(cloudTrans);
        setDebts(cloudDebts);
        setProducts(cloudProducts);
        localStorage.setItem(`kita_trans_${user.uid}`, JSON.stringify(cloudTrans));
      }
    } catch (err) {
      console.error("Erreur chargement données KITA", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !label || !user) return;

    setSyncing(true);
    const newTransData: Omit<KitaTransaction, 'id'> = {
      type,
      amount: parseFloat(amount),
      label: label.trim(),
      category,
      paymentMethod: 'CASH',
      date: new Date().toISOString()
    };

    try {
      if (isPremium) {
        const saved = await addKitaTransaction(user.uid, newTransData);
        if (saved) setTransactions([saved, ...transactions]);
      } else {
        const localTrans: KitaTransaction = { ...newTransData, id: Date.now().toString() };
        const updated = [localTrans, ...transactions];
        setTransactions(updated);
        localStorage.setItem(`kita_trans_${user.uid}`, JSON.stringify(updated));
      }
      setShowAddModal(false);
      setAmount('');
      setLabel('');
      setAiAdvice(null); // Reset advice when data changes
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette opération définitivement ?") || !user) return;
    
    setSyncing(true);
    try {
      if (isPremium) {
        await deleteKitaTransaction(id);
      }
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem(`kita_trans_${user.uid}`, JSON.stringify(updated));
      setAiAdvice(null);
    } catch (err) {
      alert("Erreur suppression.");
    } finally {
      setSyncing(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (timeframe === 'day') return tDate.toDateString() === now.toDateString();
      if (timeframe === 'week') {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay() || 7;
        if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
        startOfWeek.setHours(0, 0, 0, 0);
        return tDate >= startOfWeek;
      }
      if (timeframe === 'month') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      if (timeframe === 'year') return tDate.getFullYear() === now.getFullYear();
      return false;
    });

    const income = filtered.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;

    // Calcul de la répartition par catégorie
    const categories: { [key: string]: number } = {};
    filtered.filter(t => t.type === 'INCOME').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    return { income, expense, balance, categories, filteredCount: filtered.length };
  }, [transactions, timeframe]);

  const handleGetAIAnalysis = async () => {
    if (analyzing || stats.filteredCount === 0) return;
    setAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const dataSummary = `Recettes: ${stats.income} F, Dépenses: ${stats.expense} F, Balance: ${stats.balance} F. Répartition: ${JSON.stringify(stats.categories)}. Période: ${timeframe}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `En tant que Coach Kita, analyse ces chiffres financiers de mon salon de coiffure : ${dataSummary}. 
        Donne 3 conseils stratégiques très courts et percutants pour améliorer ma rentabilité. 
        Utilise un ton d'expert mentor. Pas d'anglicismes. Formate en Markdown avec des tirets.`,
      });

      setAiAdvice(response.text || "Continuez votre rigueur de gestion.");
    } catch (err) {
      console.error(err);
      setAiAdvice("Erreur lors de l'analyse. Concentrez-vous sur la réduction des charges.");
    } finally {
      setAnalyzing(false);
    }
  };

  const timeframeLabels = {
    day: "aujourd'hui",
    week: "cette semaine",
    month: "ce mois",
    year: "cette année"
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-brand-900 pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <img src={KITA_LOGO} alt="" className="w-64 h-64 object-contain" />
        </div>
        
        <div className="max-w-4xl mx-auto flex justify-between items-start relative z-10">
          <div className="flex gap-6">
            <div className="bg-white p-2 rounded-[2rem] shadow-2xl shrink-0 h-24 w-24 flex items-center justify-center">
               <img src={KITA_LOGO} alt="KITA Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white transition mb-3 font-black text-[10px] uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Retour Dashboard
              </button>
              <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight leading-none">Console <span className="text-brand-500 italic">KITA</span></h1>
              
              <div className="flex items-center gap-3">
                {isPremium ? (
                  <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-400 shadow-lg">
                    <Cloud className="w-3 h-3" /> Sauvegarde Cloud Active
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/30">
                    <CloudOff className="w-3 h-3" /> Mode Local
                  </div>
                )}
                {syncing && <Loader2 className="w-3 h-3 text-white/50 animate-spin" />}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => { setType('INCOME'); setShowAddModal(true); }}
            className="bg-brand-500 text-white h-16 w-16 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-500/40 hover:scale-105 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 -mt-16">
        
        {/* Filtre temporel */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20 flex gap-1 relative z-20">
            {(['day', 'week', 'month', 'year'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeframe === tf 
                    ? 'bg-white text-brand-900 shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf === 'day' ? 'Jour' : tf === 'week' ? 'Semaine' : tf === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        {/* Résumé dynamique */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 grid grid-cols-2 md:grid-cols-3 gap-8 border border-slate-100 relative z-20">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recettes ({timeframeLabels[timeframe]})</p>
            <p className="text-3xl font-black text-emerald-600">+{stats.income.toLocaleString()} <span className="text-xs">F</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dépenses ({timeframeLabels[timeframe]})</p>
            <p className="text-3xl font-black text-rose-600">-{stats.expense.toLocaleString()} <span className="text-xs">F</span></p>
          </div>
          <div className="col-span-2 md:col-span-1 p-6 bg-slate-900 rounded-[2rem] text-white space-y-1 flex flex-col justify-center shadow-xl">
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Balance Nette</p>
            <p className="text-2xl font-black">{stats.balance.toLocaleString()} FCFA</p>
          </div>
        </div>

        {/* SECTION ANALYSE & GRAPHIQUES */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
           {/* Graphique de Répartition */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                 <div className="bg-brand-50 p-2 rounded-lg text-brand-600"><PieChart className="w-4 h-4"/></div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Postes de revenus</h3>
              </div>
              <div className="space-y-4">
                 {Object.entries(stats.categories).length === 0 ? (
                   <p className="text-xs text-slate-400 italic">Données insuffisantes pour le graphique.</p>
                 ) : (
                   Object.entries(stats.categories)
                    .sort(([,a], [,b]) => b - a)
                    .map(([cat, val]) => {
                      const percentage = Math.round((val / stats.income) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                           <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-500 uppercase tracking-tighter">{cat}</span>
                              <span className="text-brand-600">{val.toLocaleString()} F ({percentage}%)</span>
                           </div>
                           <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                           </div>
                        </div>
                      )
                    })
                 )}
              </div>
           </div>

           {/* Analyse Coach Kita */}
           <div className="bg-brand-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Sparkles className="w-20 h-20 text-brand-500" /></div>
              <div className="relative z-10 h-full flex flex-col">
                 <div className="flex items-center gap-3 mb-6">
                    <img src={COACH_KITA_AVATAR} className="h-8 w-8 rounded-full border border-brand-500" alt="" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400">Analyse de Coach Kita</h3>
                 </div>
                 
                 <div className="flex-grow">
                    {aiAdvice ? (
                      <div className="text-sm font-medium leading-relaxed text-slate-300 italic animate-in fade-in slide-in-from-bottom-2 duration-500">
                         {aiAdvice.split('\n').map((line, i) => (
                           <p key={i} className="mb-2">{line}</p>
                         ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                         <p className="text-xs text-slate-400 font-medium">Laissez Coach Kita optimiser votre salon grâce à l'IA.</p>
                         <button 
                           onClick={handleGetAIAnalysis}
                           disabled={analyzing || stats.filteredCount === 0}
                           className="bg-brand-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-400 transition-all flex items-center gap-2 shadow-lg disabled:opacity-30"
                         >
                            {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3" />}
                            Générer mon audit stratégique
                         </button>
                      </div>
                    )}
                 </div>
                 {aiAdvice && (
                   <button onClick={() => setAiAdvice(null)} className="mt-4 text-[8px] font-black uppercase text-brand-500 hover:text-brand-400 tracking-widest">Réinitialiser l'audit</button>
                 )}
              </div>
           </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex gap-4 my-10 bg-white shadow-sm p-1.5 rounded-[2rem] border border-slate-200">
           <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} icon={<History className="w-4 h-4"/>} label="Journal" />
           <TabButton active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} icon={<Users className="w-4 h-4"/>} label="Dettes" />
           <TabButton active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} icon={<Package className="w-4 h-4"/>} label="Stocks" />
        </div>

        {/* Contenu Journal */}
        {activeTab === 'daily' && (
          <div className="space-y-4">
             {loading ? <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" /></div> : 
             transactions.length === 0 ? (
               <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <History className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold italic">Aucune transaction enregistrée sous le sceau KITA.</p>
               </div>
             ) : (
               transactions.map(t => (
                 <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-5">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                             <p className="font-bold text-slate-900 text-lg leading-none">{t.label}</p>
                             <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{t.category}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('fr-FR')} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <p className={`text-xl font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} F
                       </p>
                       <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-3 text-slate-300 hover:text-rose-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        {/* Contenu Dettes */}
        {activeTab === 'debts' && (
          <div className="space-y-4">
             {!isPremium ? (
               <PremiumWall message="Suivez vos ardoises clients et sécurisez vos remboursements avec l'Elite." />
             ) : loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" /> : (
               <>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Suivi des Crédits</h3>
                    <button className="bg-brand-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2"><Plus className="w-3 h-3"/> Nouveau crédit</button>
                 </div>
                 {debts.length === 0 ? (
                   <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                      <Users className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold italic">Toutes vos ardoises sont soldées.</p>
                   </div>
                 ) : (
                   debts.map(d => (
                     <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center font-black">{d.personName ? d.personName[0] : '?'}</div>
                           <div>
                              <p className="font-bold">{d.personName}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black">{d.type === 'CREDIT' ? 'On me doit' : 'Je dois'}</p>
                           </div>
                        </div>
                        <p className="text-lg font-black text-slate-900">{d.amount.toLocaleString()} F</p>
                     </div>
                   ))
                 )}
               </>
             )}
          </div>
        )}

        {/* Contenu Stocks */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
             {!isPremium ? (
               <PremiumWall message="Gérez votre inventaire technique et recevez des alertes de rupture KITA." />
             ) : loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" /> : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.length === 0 ? (
                    <div className="md:col-span-2 py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                       <PackageSearch className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-bold italic">Aucun produit en inventaire.</p>
                    </div>
                  ) : products.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                       <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className={`text-[10px] font-black uppercase ${p.quantity <= p.alertThreshold ? 'text-rose-500' : 'text-slate-400'}`}>Stock: {p.quantity}</p>
                       </div>
                       {p.quantity <= p.alertThreshold && <AlertCircle className="w-5 h-5 text-rose-500" />}
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {/* Section de parrainage Cloud (Banner Elite) */}
        {!isPremium && (
          <div className="mt-16 bg-brand-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-brand-900/20 border border-white/10">
             <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <img src={KITA_LOGO} alt="" className="w-48 h-48 object-contain" />
             </div>
             <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                <div className="space-y-4 text-center md:text-left">
                   <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest">CERTIFICATION KITA ELITE</h4>
                   <h3 className="text-2xl font-serif font-bold">Sécurisez vos chiffres à vie</h3>
                   <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">
                     L'assurance de ne jamais perdre votre comptabilité, même en changeant de téléphone. Le Cloud Elite KITA est votre coffre-fort.
                   </p>
                </div>
                <button 
                  onClick={() => navigate('/results')}
                  className="bg-brand-500 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-400 transition shadow-xl"
                >
                   Activer ma protection Cloud
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Modal Ajout Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <img src={KITA_LOGO} alt="" className="h-8 w-8 object-contain" />
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Enregistrement</h2>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-transform hover:rotate-90"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                 <button onClick={() => setType('INCOME')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>+ Recette</button>
                 <button onClick={() => setType('EXPENSE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'EXPENSE' ? 'bg-rose-50 text-white shadow-lg' : 'text-slate-400'}`}>- Dépense</button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                 <div className="space-y-2 text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant FCFA</label>
                    <input autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full text-6xl font-black text-center outline-none text-slate-900 placeholder-slate-100" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Libellé</label>
                       <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Coupe Homme" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 focus:bg-slate-100 transition-colors" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Catégorie</label>
                       <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 focus:bg-slate-100 transition-colors appearance-none">
                          <option>Prestation</option>
                          <option>Vente Produit</option>
                          <option>Loyer</option>
                          <option>Salaires</option>
                          <option>Stock</option>
                          <option>Autre</option>
                       </select>
                    </div>
                 </div>

                 <button type="submit" disabled={syncing} className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all flex items-center justify-center gap-3 ${type === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-100'}`}>
                    {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Valider l'opération
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-brand-900 text-white shadow-xl' : 'text-slate-400 hover:text-brand-900 hover:bg-brand-50'}`}>
    {icon} {label}
  </button>
);

const PremiumWall = ({ message }: { message: string }) => {
  const navigate = useNavigate();
  return (
    <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
       <div className="h-20 w-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Cloud className="w-10 h-10 text-brand-500" />
       </div>
       <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">Module ELITE KITA</h3>
       <p className="text-slate-500 font-medium mb-10 max-w-xs mx-auto">{message}</p>
       <button onClick={() => navigate('/results')} className="bg-brand-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Activer ma protection Cloud</button>
    </div>
  );
};

export default Caisse;
