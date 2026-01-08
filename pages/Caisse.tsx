
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaDebt, KitaProduct } from '../types';
import { supabase } from '../services/supabase';
import { KITA_LOGO } from '../constants';
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
  Loader2
} from 'lucide-react';

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'daily' | 'debts' | 'stock'>('daily');
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const isPremium = useMemo(() => {
    if (!user?.isKitaPremium) return false;
    if (!user.kitaPremiumUntil) return false;
    return new Date(user.kitaPremiumUntil) > new Date();
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    // On charge toujours le local en premier pour la rapidité (Offline first)
    const localTrans = localStorage.getItem(`kita_trans_${user?.uid}`);
    if (localTrans) setTransactions(JSON.parse(localTrans));
    
    // Si Premium, on pourrait ici synchroniser avec Supabase
    if (isPremium && supabase) {
      // Intégration future : fetch depuis table 'kita_transactions'
    }
    
    setLoading(false);
  };

  const saveData = (newTransactions: KitaTransaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(`kita_trans_${user?.uid}`, JSON.stringify(newTransactions));
    
    if (isPremium && supabase) {
      syncWithCloud(newTransactions);
    }
  };

  const syncWithCloud = async (data: KitaTransaction[]) => {
    setSyncing(true);
    // Simulation d'un délai réseau pour l'UX
    setTimeout(() => setSyncing(false), 800);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !label) return;

    const newTrans: KitaTransaction = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      label: label.trim(),
      category: 'General',
      paymentMethod: 'CASH',
      date: new Date().toISOString()
    };

    saveData([newTrans, ...transactions]);
    setShowAddModal(false);
    setAmount('');
    setLabel('');
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm("Supprimer cette opération ?")) {
      saveData(transactions.filter(t => t.id !== id));
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayTrans = transactions.filter(t => new Date(t.date).toDateString() === today);
    const income = todayTrans.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = todayTrans.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-brand-900 pt-16 pb-32 px-6 relative overflow-hidden">
        {/* Sceau KITA en filigrane */}
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
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 grid grid-cols-2 md:grid-cols-3 gap-8 border border-slate-100 relative z-20">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recettes Jour</p>
            <p className="text-3xl font-black text-emerald-600">+{stats.income.toLocaleString()} <span className="text-xs">F</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dépenses Jour</p>
            <p className="text-3xl font-black text-rose-600">-{stats.expense.toLocaleString()} <span className="text-xs">F</span></p>
          </div>
          <div className="col-span-2 md:col-span-1 p-6 bg-slate-900 rounded-[2rem] text-white space-y-1 flex flex-col justify-center shadow-xl">
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Balance Nette</p>
            <p className="text-2xl font-black">{stats.balance.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="flex gap-4 my-10 bg-white shadow-sm p-1.5 rounded-[2rem] border border-slate-200">
           <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} icon={<History className="w-4 h-4"/>} label="Journal" />
           <TabButton active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} icon={<Users className="w-4 h-4"/>} label="Dettes" />
           <TabButton active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} icon={<Package className="w-4 h-4"/>} label="Stocks" />
        </div>

        {activeTab === 'daily' && (
          <div className="space-y-4">
             {transactions.length === 0 ? (
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
                          <p className="font-bold text-slate-900 text-lg leading-none mb-1">{t.label}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <p className={`text-xl font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} F
                       </p>
                       <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 p-3 text-slate-300 hover:text-rose-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        {activeTab !== 'daily' && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <img src={KITA_LOGO} alt="" className="w-10 h-10 object-contain grayscale opacity-20" />
             </div>
             <h3 className="text-xl font-serif font-bold text-slate-900">Module Certifié KITA</h3>
             <p className="text-slate-500 font-medium">Bientôt disponible dans votre console de pilotage.</p>
          </div>
        )}

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

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                    <img src={KITA_LOGO} alt="" className="h-8 w-8 object-contain" />
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Enregistrement</h2>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-transform hover:rotate-90"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                 <button onClick={() => setType('INCOME')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>+ Recette</button>
                 <button onClick={() => setType('EXPENSE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>- Dépense</button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-8">
                 <div className="space-y-2 text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant FCFA</label>
                    <input autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full text-6xl font-black text-center outline-none text-slate-900 placeholder-slate-100" />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Libellé / Détail</label>
                    <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Vente Shampoing" className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-slate-900 focus:bg-slate-100 transition-colors" />
                 </div>

                 <button type="submit" className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all ${type === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-100'}`}>
                    Valider sous le sceau KITA
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

export default Caisse;
