
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaDebt, KitaService } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  getKitaDebts,
  getKitaServices,
  bulkAddKitaServices
} from '../services/supabase';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ChevronLeft, 
  Loader2, 
  Wallet,
  CheckCircle2,
  X,
  Scissors,
  Sparkles,
  Zap,
  ShoppingBag,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Database,
  ChevronDown,
  Search,
  ShieldHalf,
  Info,
  Cloud
} from 'lucide-react';
import KitaTopNav from '../components/KitaTopNav';
import { DEFAULT_KITA_SERVICES } from '../constants';

type PeriodFilter = 'today' | 'week' | 'month' | 'debts';

const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'Coiffure', label: 'Coiffure', icon: <Scissors className="w-4 h-4" /> },
  { id: 'Ongles', label: 'Ongles', icon: <Zap className="w-4 h-4" /> },
  { id: 'Soins', label: 'Soins', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'Vente', label: 'Vente', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'Autre', label: 'Autre', icon: <MoreHorizontal className="w-4 h-4" /> },
];

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [period, setPeriod] = useState<PeriodFilter>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTrans, setNewTrans] = useState<Omit<KitaTransaction, 'id'>>({
    type: 'INCOME',
    amount: 0,
    label: '',
    category: 'Prestation',
    paymentMethod: 'Espèces',
    date: new Date().toISOString().split('T')[0],
    isCredit: false
  });
  const [saving, setSaving] = useState(false);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<KitaTransaction | null>(null);

  const isElite = useMemo(() => {
    if (!user) return false;
    return user.isKitaPremium || (user.purchasedModuleIds?.length || 0) >= 16;
  }, [user]);

  useEffect(() => {
    if (user?.uid) loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const [transData, serviceData] = await Promise.all([
        getKitaTransactions(user.uid),
        getKitaServices(user.uid)
      ]);
      setTransactions(transData);
      setServices(serviceData);
    } catch (err: any) {
      console.error("Caisse loadData Error:", err);
      setError("Synchronisation impossible. Vérifiez votre table 'kita_services'.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newTrans.amount <= 0 || !newTrans.label) return;
    setSaving(true);
    try {
      const trans = await addKitaTransaction(user.uid, newTrans);
      if (trans) {
        await loadData();
        setLastSavedTransaction(trans);
      }
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const initializeDefaultServices = async () => {
    if (!user?.uid || isInitializing) return;
    if (services.length > 0) return alert("Catalogue déjà existant.");

    setIsInitializing(true);
    try {
      const servicesToCreate = DEFAULT_KITA_SERVICES.map(name => {
        let cat = 'Autre';
        if (name.match(/Coupe|Brushing|Tresse|Chignon|Teinture|Mise en plis|Shampoing|Bain|Défrisage|Babyliss|Balayage|Tissage/i)) cat = 'Coiffure';
        else if (name.match(/Vernis|Gel|Manicure|Pédicure|Capsules|Pose/i)) cat = 'Ongles';
        else if (name.match(/Massage|Visage|Corps|Soins|Epilation|Maquillage|Sourcils|Percing|Tatouage/i)) cat = 'Soins';
        else if (name.match(/Vente/i)) cat = 'Vente';
        return { name, category: cat, defaultPrice: 0, isActive: true };
      });
      await bulkAddKitaServices(user.uid, servicesToCreate);
      await loadData();
      alert("Catalogue généré avec succès !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return transactions.filter(t => {
      if (period === 'today') return t.date === todayStr;
      return true;
    });
  }, [transactions, period]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const handleSelectService = (s: KitaService) => {
    setNewTrans({
      ...newTrans,
      label: s.name,
      amount: s.defaultPrice > 0 ? s.defaultPrice : newTrans.amount
    });
    setIsServiceListOpen(false);
    setSearchTerm('');
  };

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCategory === 'all' || s.category.toLowerCase() === activeCategory.toLowerCase();
      return s.isActive && matchesSearch && matchesCat;
    });
  }, [services, searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 relative">
      <KitaTopNav />
      
      <header className="bg-amber-500 pt-16 pb-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-white text-[15rem] font-serif italic leading-none">CFA</div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl shrink-0"><Wallet className="w-full h-full text-amber-500" /></div>
              <div>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-900/50 hover:text-brand-900 transition mb-2 font-black text-[10px] uppercase tracking-widest group"><ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Dashboard</button>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 tracking-tight">Pilotage <span className="text-white italic">Financier</span></h1>
              </div>
           </div>
           <div className="flex gap-4">
              <button onClick={loadData} className="h-16 w-16 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-all">
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setIsModalOpen(true)} className="h-16 w-16 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"><Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" /></button>
           </div>
        </div>
      </header>

      {!isElite && !loading && (
        <div className="max-w-6xl mx-auto px-6 -mt-12 mb-12 relative z-50">
           <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-l-[12px] border-amber-500 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-6">
                 <div className="h-14 w-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldHalf className="w-7 h-7" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-brand-900 uppercase tracking-tight">Données en local</h2>
                    <p className="text-slate-500 text-sm font-medium">Vos chiffres ne sont pas encore sauvegardés sur le Cloud. <span className="text-amber-600 font-bold">Passez Élite pour sécuriser votre salon.</span></p>
                 </div>
              </div>
              <button onClick={() => navigate('/results?pack=elite')} className="bg-brand-900 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-black transition-all flex items-center gap-3 shrink-0"><Cloud className="w-4 h-4 text-brand-500" /> Sécuriser mon salon</button>
           </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 -mt-8 flex justify-center relative z-30">
        <div className="bg-white p-1.5 rounded-[2.5rem] flex gap-1 shadow-2xl border border-slate-50 overflow-x-auto">
          {(['today', 'week', 'month'] as PeriodFilter[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-8 md:px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${period === p ? 'bg-brand-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        <div className="bg-white rounded-[4rem] shadow-xl border border-slate-50 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
           <div className="grid grid-cols-2 gap-16 md:gap-24 flex-grow">
              <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recettes</p><p className="text-4xl font-black text-emerald-500">+{totals.income.toLocaleString()} F</p></div>
              <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dépenses</p><p className="text-4xl font-black text-rose-500">-{totals.expense.toLocaleString()} F</p></div>
           </div>
           <div className="bg-brand-900 p-10 rounded-[3rem] text-white min-w-[300px] shadow-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Balance du jour</p>
              <div className="flex items-baseline gap-2"><p className="text-4xl font-black">{(totals.income - totals.expense).toLocaleString()}</p><p className="text-lg font-bold text-slate-500">F</p></div>
           </div>
        </div>

        {loading ? (
          <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase text-[10px]">Chargement des données...</p></div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
              <div key={t.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div><p className="font-bold text-slate-900 text-xl mb-1">{t.label}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category} • {new Date(t.date).toLocaleDateString('fr-FR')}</p></div>
                </div>
                <div className="flex items-center gap-10">
                  <p className={`text-2xl font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()} F</p>
                  <button onClick={() => deleteKitaTransaction(t.id).then(loadData)} className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-slate-400 italic">Aucune opération pour cette période.</div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 animate-in zoom-in-95 duration-300">
            {lastSavedTransaction ? (
              <div className="text-center space-y-8 animate-in fade-in">
                 <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10" /></div>
                 <h2 className="text-3xl font-serif font-bold text-slate-900">Validé !</h2>
                 <button onClick={() => { setIsModalOpen(false); setLastSavedTransaction(null); }} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px]">Continuer</button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Nouvelle opération</h2>
                <form onSubmit={handleSaveTransaction} className="space-y-8">
                  <div className="flex bg-slate-100 p-1.5 rounded-[2rem]">
                    <button type="button" onClick={() => setNewTrans({...newTrans, type: 'INCOME'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400'}`}>Recette</button>
                    <button type="button" onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Dépense</button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Prestation</label>
                      <button type="button" onClick={() => setIsServiceListOpen(true)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-brand-500/20 text-left flex justify-between items-center transition-all">
                        <span className={newTrans.label ? 'text-slate-900 font-bold' : 'text-slate-400'}>{newTrans.label || "Choisir..."}</span>
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Montant (F)</label>
                      <input type="number" placeholder="0" value={newTrans.amount || ''} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border-none outline-none font-black text-4xl text-center focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={saving} className="flex-grow bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Enregistrer
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-6 rounded-2xl font-black text-[10px] uppercase text-slate-300">Fermer</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {isServiceListOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/95 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl h-[90vh] md:h-[80vh] md:rounded-[3rem] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-8 border-b border-slate-100">
                 <div className="flex justify-between items-center mb-8">
                    <div><h3 className="text-3xl font-serif font-bold text-slate-900">Catalogue Expert</h3><p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Sélectionnez une prestation</p></div>
                    <button onClick={() => setIsServiceListOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500"><X /></button>
                 </div>
                 {services.length > 0 && (
                   <div className="space-y-6">
                    <div className="relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-lg" /></div>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {CATEGORIES.map(cat => (
                          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-brand-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{cat.icon} {cat.label}</button>
                        ))}
                    </div>
                   </div>
                 )}
              </div>
              <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-slate-50/50 custom-scrollbar flex flex-col">
                 {isInitializing ? (
                   <div className="m-auto text-center"><Loader2 className="w-16 h-16 animate-spin text-brand-600 mx-auto mb-6" /><p className="text-brand-900 font-black uppercase text-xs">Création du catalogue en cours...</p></div>
                 ) : services.length === 0 ? (
                   <div className="m-auto text-center space-y-8 max-w-sm">
                      <div className="h-32 w-32 bg-brand-50 rounded-[2.5rem] flex items-center justify-center mx-auto"><Database className="w-16 h-16 text-brand-500 opacity-40" /></div>
                      <div><h4 className="text-slate-900 font-serif font-bold text-2xl mb-3">Catalogue vierge</h4><p className="text-slate-500 text-sm">Générez le catalogue standard KITA pour commencer à piloter vos ventes immédiatement.</p></div>
                      <button onClick={initializeDefaultServices} className="w-full bg-brand-900 text-white px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-brand-950 transition-all flex items-center justify-center gap-4"><RefreshCw className={`w-5 h-5 ${isInitializing ? 'animate-spin' : ''}`} /> Générer mon catalogue KITA</button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-4">
                      {filteredServices.map(s => (
                        <button key={s.id} onClick={() => handleSelectService(s)} className="p-6 text-left bg-white rounded-[2.5rem] border-2 border-transparent hover:border-brand-500 hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[160px]">
                          <div><div className="mb-3"><span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase">{s.category}</span></div><p className="font-bold text-slate-900 text-lg leading-tight">{s.name}</p></div>
                          <div className="mt-4 flex items-center justify-between"><span className={`px-4 py-1.5 rounded-xl font-black text-xs ${s.defaultPrice > 0 ? `${s.defaultPrice.toLocaleString()} F` : 'bg-slate-50 text-slate-500 uppercase text-[9px]'}`}>{s.defaultPrice > 0 ? `${s.defaultPrice.toLocaleString()} F` : 'Prix libre'}</span><div className="h-8 w-8 rounded-full border-2 border-slate-100 group-hover:bg-brand-500 group-hover:border-brand-500 transition-all flex items-center justify-center"><Plus className="w-4 h-4 text-transparent group-hover:text-white" /></div></div>
                        </button>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;
