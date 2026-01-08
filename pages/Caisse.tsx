
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaDebt, KitaProduct } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  saveUserProfile
} from '../services/supabase';
import { KITA_LOGO } from '../constants';
import { 
  ChevronLeft, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Cloud, 
  CloudOff, 
  History,
  Trash2,
  Loader2,
  CheckCircle2,
  Settings2,
  Goal,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

type Timeframe = 'day' | 'week' | 'month' | 'year';

const Caisse: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'daily' | 'debts' | 'stock'>('daily');
  const [timeframe, setTimeframe] = useState<Timeframe>('day');
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState('Prestation');
  const [rentGoalInput, setRentGoalInput] = useState(user?.monthlyRentGoal?.toString() || '100000');

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
        const cloudTrans = await getKitaTransactions(user.uid);
        setTransactions(cloudTrans);
        localStorage.setItem(`kita_trans_${user.uid}`, JSON.stringify(cloudTrans));
      }
    } catch (err) {
      console.error("Erreur chargement données", err);
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
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSyncing(false);
    }
  };

  const updateRentGoal = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      await saveUserProfile({ uid: user.uid, monthlyRentGoal: parseInt(rentGoalInput) });
      await refreshProfile();
      setShowSettingsModal(false);
    } catch (e) {
      alert("Erreur mise à jour.");
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
    const dailyRentGoal = (user?.monthlyRentGoal || 0) / 26;

    return { income, expense, balance, dailyRentGoal };
  }, [transactions, timeframe, user?.monthlyRentGoal]);

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
                <ChevronLeft className="w-4 h-4" /> Dashboard
              </button>
              <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight leading-none">Ma Caisse <span className="text-brand-500 italic">KITA</span></h1>
              
              <div className="flex flex-wrap items-center gap-3">
                {isPremium ? (
                  <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-400 shadow-lg">
                    <Cloud className="w-3 h-3" /> Sauvegarde Cloud
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/30">
                    <CloudOff className="w-3 h-3" /> Mode Local
                  </div>
                )}
                <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/80 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all">
                  <Settings2 className="w-3 h-3" /> Config Loyer
                </button>
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
        
        {/* Provision Loyer */}
        {user?.monthlyRentGoal && (
          <div className="mb-8 bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 relative z-20 overflow-hidden shadow-2xl">
             <div className="flex justify-between items-end mb-3">
                <div>
                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Goal className="w-3 h-3"/> Provision Loyer Quotidienne</p>
                   <p className="text-white font-bold">{Math.round(stats.dailyRentGoal).toLocaleString()} F <span className="text-[10px] opacity-40">/ Jour</span></p>
                </div>
                <p className="text-[10px] font-black text-white/60 uppercase">Objectif : {stats.income >= stats.dailyRentGoal ? 'Atteint 🎉' : 'En cours'}</p>
             </div>
             <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${stats.income >= stats.dailyRentGoal ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-brand-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]'}`} 
                  style={{ width: `${Math.min(100, (stats.income / stats.dailyRentGoal) * 100)}%` }}
                ></div>
             </div>
          </div>
        )}

        {/* Filtre temporel */}
        <div className="flex justify-center mb-6">
          <div className="bg-white shadow-xl p-1 rounded-2xl border border-slate-100 flex gap-1 relative z-20">
            {(['day', 'week', 'month', 'year'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeframe === tf 
                    ? 'bg-brand-900 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-brand-900 hover:bg-slate-50'
                }`}
              >
                {tf === 'day' ? 'Jour' : tf === 'week' ? 'Semaine' : tf === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        {/* Résumé dynamique */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 grid grid-cols-2 md:grid-cols-3 gap-8 border border-slate-100 relative z-20 overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-8xl font-black italic pointer-events-none select-none uppercase tracking-tighter">Kita</div>
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recettes ({timeframe})</p>
            <p className="text-3xl font-black text-emerald-600">+{stats.income.toLocaleString()} <span className="text-xs">F</span></p>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dépenses ({timeframe})</p>
            <p className="text-3xl font-black text-rose-600">-{stats.expense.toLocaleString()} <span className="text-xs">F</span></p>
          </div>
          <div className="col-span-2 md:col-span-1 p-6 bg-slate-900 rounded-[2rem] text-white space-y-1 flex flex-col justify-center shadow-2xl relative z-10">
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Balance Nette</p>
            <p className="text-2xl font-black">{stats.balance.toLocaleString()} FCFA</p>
          </div>
        </div>

        {/* PROMOTION PACK PERFORMANCE (Bouton d'appel spécifique) */}
        <div className="mt-10 bg-gradient-to-r from-brand-600 to-brand-900 p-6 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shrink-0"><Zap className="w-7 h-7 text-amber-400 fill-current" /></div>
              <div>
                 <h3 className="font-bold text-lg leading-none mb-1">Gérez vos employés & vos clients</h3>
                 <p className="text-slate-300 text-xs font-medium">Automatisez vos commissions et envoyez des reçus WhatsApp prestige.</p>
              </div>
           </div>
           <button onClick={() => navigate('/pilotage')} className="bg-white text-brand-900 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shrink-0 flex items-center gap-2">
              Découvrir Performance+ <ArrowRight className="w-3.5 h-3.5" />
           </button>
        </div>

        {/* Navigation Journal */}
        <div className="my-12">
           <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-brand-500" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Journal des opérations ({timeframeLabels[timeframe]})</h2>
           </div>
           
           <div className="space-y-4">
              {loading ? <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" /></div> : 
              transactions.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                   <History className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold italic text-sm">Aucun mouvement pour cette période.</p>
                </div>
              ) : (
                transactions.map(t => (
                  <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all shadow-sm">
                     <div className="flex items-center gap-5">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                           {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <p className="font-bold text-slate-900 text-lg leading-none">{t.label}</p>
                              <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{t.category}</span>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                             {new Date(t.date).toLocaleDateString('fr-FR')} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <p className={`text-xl font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} F
                        </p>
                        <button onClick={() => deleteKitaTransaction(t.id).then(loadAllData)} className="opacity-0 group-hover:opacity-100 p-3 text-slate-300 hover:text-rose-500 transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>

      {/* Modal Ajout Transaction Simplifié */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                    <img src={KITA_LOGO} alt="" className="h-8 w-8 object-contain" />
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Enregistrement</h2>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-transform"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                 <button onClick={() => setType('INCOME')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>+ Recette</button>
                 <button onClick={() => setType('EXPENSE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>- Dépense</button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                 <div className="space-y-1 text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant FCFA</label>
                    <input autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full text-6xl font-black text-center outline-none text-slate-900 placeholder-slate-100" />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Libellé</label>
                    <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Coupe Homme" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 appearance-none">
                       <option>Prestation</option>
                       <option>Vente Produit</option>
                       <option>Loyer</option>
                       <option>Salaires</option>
                       <option>Stock</option>
                       <option>Autre</option>
                    </select>
                 </div>

                 <button type="submit" disabled={syncing} className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all flex items-center justify-center gap-3 ${type === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                    {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Valider l'opération
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal Paramètres Loyer */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-serif font-bold">Objectifs Salon</h2>
                 <button onClick={() => setShowSettingsModal(false)} className="text-slate-300"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Loyer Mensuel (FCFA)</label>
                    <input type="number" value={rentGoalInput} onChange={e => setRentGoalInput(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-slate-50 text-2xl font-black outline-none border-2 border-transparent focus:border-brand-500" />
                    <p className="text-[10px] text-slate-400 italic leading-relaxed">Kita calcule automatiquement votre provision journalière pour que le loyer ne soit plus un stress en fin de mois.</p>
                 </div>
                 <button onClick={updateRentGoal} disabled={syncing} className="w-full bg-brand-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-brand-800 transition-all flex items-center justify-center gap-3">
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Mettre à jour mon pilotage
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;
