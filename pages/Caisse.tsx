
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaDebt, KitaProduct } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  saveUserProfile,
  getKitaDebts,
  getKitaProducts
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
  Zap,
  Package,
  Users2,
  AlertTriangle
} from 'lucide-react';

type Timeframe = 'day' | 'week' | 'month' | 'year';

const Caisse: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'journal' | 'debts' | 'stock'>('journal');
  const [timeframe, setTimeframe] = useState<Timeframe>('day');
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [debts, setDebts] = useState<KitaDebt[]>([]);
  const [products, setProducts] = useState<KitaProduct[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState('Prestation');
  const [rentGoalInput, setRentGoalInput] = useState(user?.monthlyRentGoal?.toString() || '0');

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
      if (isPremium) {
        const [t, d, p] = await Promise.all([
          getKitaTransactions(user.uid),
          getKitaDebts(user.uid),
          getKitaProducts(user.uid)
        ]);
        setTransactions(t);
        setDebts(d);
        setProducts(p);
      } else {
        const localTrans = localStorage.getItem(`kita_trans_${user.uid}`);
        if (localTrans) setTransactions(JSON.parse(localTrans));
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

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* HEADER PREMIUM */}
      <header className="bg-brand-900 pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <img src={KITA_LOGO} alt="" className="w-64 h-64 object-contain" />
        </div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
          <div className="flex gap-6">
            <div className="bg-white p-2 rounded-[2rem] shadow-2xl shrink-0 h-24 w-24 flex items-center justify-center">
               <img src={KITA_LOGO} alt="KITA Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white transition mb-3 font-black text-[10px] uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Retour Dashboard
              </button>
              <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight leading-none">Console <span className="text-brand-500 italic">KITA</span></h1>
              
              <div className="flex flex-wrap items-center gap-3">
                {isPremium ? (
                  <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-400 shadow-lg">
                    <ShieldCheck className="w-3 h-3" /> Cloud Sécurisé
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
            className="bg-brand-500 text-white h-20 w-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-500/40 hover:scale-105 transition-all self-end md:self-center"
          >
            <Plus className="w-10 h-10" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 -mt-16">
        
        {/* JAUGE DE LOYER DYNAMIQUE */}
        <div className="mb-10 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 relative z-20 overflow-hidden shadow-2xl">
           {!user?.monthlyRentGoal || user.monthlyRentGoal === 0 ? (
             <div className="flex justify-between items-center">
                <p className="text-white/60 text-sm font-medium italic">Configurez votre loyer pour activer la jauge de sécurité.</p>
                <button onClick={() => setShowSettingsModal(true)} className="bg-white/20 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all">Définir l'objectif</button>
             </div>
           ) : (
             <>
               <div className="flex justify-between items-end mb-4">
                  <div>
                     <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Goal className="w-3 h-3"/> Provision Loyer Quotidienne</p>
                     <p className="text-2xl font-bold text-white">{Math.round(stats.dailyRentGoal).toLocaleString()} F <span className="text-[10px] opacity-40 uppercase tracking-widest ml-2">à sécuriser par jour</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Progression Jour</p>
                    <p className={`text-sm font-black ${stats.income >= stats.dailyRentGoal ? 'text-emerald-400' : 'text-brand-400'}`}>
                      {stats.income >= stats.dailyRentGoal ? 'OBJECTIF ATTEINT 🎉' : `${Math.round((stats.income / stats.dailyRentGoal) * 100)}%`}
                    </p>
                  </div>
               </div>
               <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${stats.income >= stats.dailyRentGoal ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'bg-brand-500'}`} 
                    style={{ width: `${Math.min(100, (stats.income / stats.dailyRentGoal) * 100)}%` }}
                  ></div>
               </div>
             </>
           )}
        </div>

        {/* NAVIGATION PAR ONGLETS */}
        <div className="flex justify-center mb-8">
           <div className="bg-white shadow-xl p-1.5 rounded-[2rem] border border-slate-100 flex gap-2 relative z-20">
              <button onClick={() => setActiveTab('journal')} className={`px-10 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'journal' ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:text-brand-900'}`}>
                <History className="w-4 h-4" /> Journal
              </button>
              <button onClick={() => setActiveTab('debts')} className={`px-10 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'debts' ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:text-brand-900'}`}>
                <Users2 className="w-4 h-4" /> Dettes
              </button>
              <button onClick={() => setActiveTab('stock')} className={`px-10 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'stock' ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:text-brand-900'}`}>
                <Package className="w-4 h-4" /> Stocks
              </button>
           </div>
        </div>

        {/* CONTENU : JOURNAL */}
        {activeTab === 'journal' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Filtre temporel */}
             <div className="flex justify-center">
                <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
                   {(['day', 'week', 'month'] as Timeframe[]).map((tf) => (
                     <button key={tf} onClick={() => setTimeframe(tf)} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${timeframe === tf ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500'}`}>
                        {tf === 'day' ? 'Aujourd\'hui' : tf === 'week' ? 'Semaine' : 'Mois'}
                     </button>
                   ))}
                </div>
             </div>

             {/* Résumé des chiffres */}
             <div className="bg-white rounded-[3rem] shadow-xl p-10 grid grid-cols-2 md:grid-cols-3 gap-8 border border-slate-100 overflow-hidden relative">
                <div className="space-y-1 relative z-10">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recettes</p>
                   <p className="text-3xl font-black text-emerald-600">+{stats.income.toLocaleString()} F</p>
                </div>
                <div className="space-y-1 relative z-10">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dépenses</p>
                   <p className="text-3xl font-black text-rose-600">-{stats.expense.toLocaleString()} F</p>
                </div>
                <div className="col-span-2 md:col-span-1 p-6 bg-slate-900 rounded-[2rem] text-white space-y-1 flex flex-col justify-center shadow-2xl relative z-10">
                   <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Balance Nette</p>
                   <p className="text-2xl font-black">{stats.balance.toLocaleString()} FCFA</p>
                </div>
             </div>

             {/* Liste des transactions */}
             <div className="space-y-4">
                {loading ? <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" /></div> : 
                transactions.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                     <History className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-400 font-bold italic text-sm">Aucun mouvement enregistré.</p>
                  </div>
                ) : (
                  transactions.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 flex items-center justify-between group hover:shadow-xl transition-all shadow-sm">
                       <div className="flex items-center gap-5">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 text-lg leading-none">{t.label}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                               {new Date(t.date).toLocaleDateString('fr-FR')} • {t.category}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <p className={`text-xl font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} F
                          </p>
                          {isPremium && <button onClick={() => deleteKitaTransaction(t.id).then(loadAllData)} className="opacity-0 group-hover:opacity-100 p-3 text-slate-300 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* CONTENU : DETTES */}
        {activeTab === 'debts' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex items-center gap-6">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0"><AlertTriangle className="w-8 h-8" /></div>
                <div>
                   <h3 className="font-bold text-amber-900">Suivi des créances</h3>
                   <p className="text-sm text-amber-700 font-medium">Ne laissez plus vos prestations impayées s'évaporer. Notez chaque crédit client ici.</p>
                </div>
             </div>

             <div className="grid gap-4">
                {debts.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                     <Users2 className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-400 font-bold italic text-sm">Aucune dette ou crédit en cours.</p>
                  </div>
                ) : (
                  debts.map(d => (
                    <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">{d.personName[0]}</div>
                          <div>
                             <p className="font-bold text-slate-900 text-xl">{d.personName}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Dû le : {d.dueDate ? new Date(d.dueDate).toLocaleDateString('fr-FR') : 'Non défini'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-black text-rose-600">{d.amount.toLocaleString()} F</p>
                          <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">En attente</span>
                       </div>
                    </div>
                  ))
                )}
             </div>
             
             <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all flex items-center justify-center gap-3">
                <Plus className="w-4 h-4" /> Enregistrer une nouvelle ardoise
             </button>
          </div>
        )}

        {/* CONTENU : STOCKS */}
        {activeTab === 'stock' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-[3.5rem] border border-dashed border-slate-200">
                     <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-500 font-bold italic">Votre inventaire est vide.</p>
                  </div>
                ) : (
                  products.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                       {p.quantity <= p.alertThreshold && (
                         <div className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-lg animate-pulse shadow-lg"><AlertTriangle className="w-4 h-4" /></div>
                       )}
                       <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest mb-4">Stock Produit</p>
                       <h4 className="text-xl font-black text-slate-900 mb-6 group-hover:text-brand-600 transition-colors">{p.name}</h4>
                       
                       <div className="flex justify-between items-end border-t border-slate-50 pt-6">
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Disponible</p>
                             <p className={`text-2xl font-black ${p.quantity <= p.alertThreshold ? 'text-rose-600' : 'text-emerald-600'}`}>{p.quantity} <span className="text-xs uppercase opacity-40 ml-1">Unités</span></p>
                          </div>
                          <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>
                  ))
                )}
             </div>

             <button className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-brand-600 transition-all flex items-center justify-center gap-6">
                Lancer un inventaire expert <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        )}

      </div>

      {/* MODALE AJOUT (RESTE INCHANGÉE MAIS STYLE AFFINÉ) */}
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

      {/* MODALE CONFIG LOYER */}
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
                 <button onClick={async () => {
                    if (!user) return;
                    setSyncing(true);
                    try {
                      await saveUserProfile({ uid: user.uid, monthlyRentGoal: parseInt(rentGoalInput) });
                      await refreshProfile();
                      setShowSettingsModal(false);
                    } catch (e) { alert("Erreur."); }
                    finally { setSyncing(false); }
                 }} disabled={syncing} className="w-full bg-brand-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-brand-800 transition-all flex items-center justify-center gap-3">
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
