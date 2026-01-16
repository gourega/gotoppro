
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaService } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  getKitaServices,
  bulkAddKitaServices,
  getKitaStaff
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
  Database,
  ChevronDown,
  Search,
  Cloud,
  ShieldHalf,
  Users,
  FileText
} from 'lucide-react';
import KitaTopNav from '../components/KitaTopNav';
import { DEFAULT_KITA_SERVICES } from '../constants';
import ExportReportModal from '../components/ExportReportModal';

type PeriodFilter = 'today' | 'week' | 'month';

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('today');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const [isStaffListOpen, setIsStaffListOpen] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTrans, setNewTrans] = useState<Omit<KitaTransaction, 'id'>>({
    type: 'INCOME',
    amount: 0,
    label: '',
    category: 'Prestation',
    paymentMethod: 'Espèces',
    date: new Date().toISOString().split('T')[0],
    isCredit: false,
    staffName: '',
    commissionRate: 0
  });
  
  const [saving, setSaving] = useState(false);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<KitaTransaction | null>(null);

  const isElite = useMemo(() => user?.isKitaPremium || (user?.purchasedModuleIds?.length || 0) >= 16, [user]);

  useEffect(() => {
    if (user?.uid) loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [transData, serviceData, staffData] = await Promise.all([
        getKitaTransactions(user.uid),
        getKitaServices(user.uid),
        getKitaStaff(user.uid)
      ]);
      setTransactions(transData);
      setServices(serviceData);
      setStaff(staffData);
    } catch (err) {
      console.error(err);
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
      alert("Erreur enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const initializeDefaultServices = async () => {
    if (!user?.uid || isInitializing) return;
    setIsInitializing(true);
    try {
      const servicesToCreate = DEFAULT_KITA_SERVICES.map(name => {
        let cat = 'Autre';
        if (name.match(/Coupe|Brushing|Tresse|Chignon|Teinture|Mise en plis|Shampoing|Bain|Défrisage|Babyliss|Balayage|Tissage/i)) cat = 'Coiffure';
        else if (name.match(/Vernis|Gel|Manicure|Pédicure|Capsules|Pose/i)) cat = 'Ongles';
        else if (name.match(/Massage|Visage|Corps|Soins|Epilation|Maquillage|Sourcils|Percing|Tatouage/i)) cat = 'Soins';
        else if (name.match(/Vente/i)) cat = 'Vente';
        return { name, category: cat, defaultPrice: 0 };
      });
      await bulkAddKitaServices(user.uid, servicesToCreate);
      await loadData();
    } catch (err) {
      alert("Erreur génération.");
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
    setNewTrans(prev => ({
      ...prev,
      label: s.name,
      category: s.category,
      amount: s.defaultPrice > 0 ? s.defaultPrice : prev.amount
    }));
    setIsServiceListOpen(false);
  };

  const handleSelectStaff = (member: any) => {
    setNewTrans(prev => ({
      ...prev,
      staffName: member.name,
      commissionRate: member.commissionRate || member.commission_rate || 0
    }));
    setIsStaffListOpen(false);
  };

  const filteredServicesList = useMemo(() => {
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
              <button onClick={() => setIsExportModalOpen(true)} className="h-16 w-16 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-all" title="Télécharger un bilan">
                <FileText className="w-6 h-6" />
              </button>
              <button onClick={loadData} className="h-16 w-16 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-all">
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => { setIsModalOpen(true); setLastSavedTransaction(null); }} className="h-16 w-16 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all group"><Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" /></button>
           </div>
        </div>
      </header>

      {!isElite && !loading && (
        <div className="max-w-6xl mx-auto px-6 -mt-12 mb-12 relative z-40">
           <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-l-[12px] border-amber-500 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-6">
                 <div className="h-14 w-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldHalf className="w-7 h-7" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-brand-900 uppercase tracking-tight">Stockage Local</h2>
                    <p className="text-slate-500 text-sm font-medium">Activez le Pack Elite pour sauvegarder vos chiffres sur le Cloud.</p>
                 </div>
              </div>
              <button onClick={() => navigate('/results?pack=elite')} className="bg-brand-900 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-black transition-all flex items-center gap-3 shrink-0"><Cloud className="w-4 h-4 text-brand-500" /> Sécuriser mon salon</button>
           </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 -mt-8 flex justify-center relative z-30">
        <div className="bg-white p-1.5 rounded-[2.5rem] flex gap-1 shadow-2xl border border-slate-50">
          {(['today', 'week', 'month'] as PeriodFilter[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-brand-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        <div className="bg-white rounded-[4rem] shadow-xl border border-slate-50 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24 flex-grow">
              <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recettes</p><p className="text-4xl font-black text-emerald-500">+{totals.income.toLocaleString()} F</p></div>
              <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dépenses</p><p className="text-4xl font-black text-rose-500">-{totals.expense.toLocaleString()} F</p></div>
              <div className="space-y-2 lg:block hidden"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bénéfice Net</p><p className={`text-4xl font-black ${(totals.income - totals.expense) >= 0 ? 'text-amber-500' : 'text-rose-600'}`}>{(totals.income - totals.expense).toLocaleString()} F</p></div>
           </div>
           <div className="bg-brand-900 p-10 rounded-[3rem] text-white min-w-[300px] shadow-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Balance du jour</p>
              <div className="flex items-baseline gap-2"><p className="text-4xl font-black">{(totals.income - totals.expense).toLocaleString()}</p><p className="text-lg font-bold text-slate-500">F</p></div>
           </div>
        </div>

        {loading ? (
          <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase text-[10px]">Synchronisation...</p></div>
        ) : (
          <div className="space-y-4 pb-20">
            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
              <div key={t.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xl mb-1">{t.label}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t.category} • {t.staffName ? `Par ${t.staffName}` : 'Gérant'} • {new Date(t.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <p className={`text-2xl font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()} F</p>
                  <button onClick={() => deleteKitaTransaction(t.id).then(loadData)} className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-slate-400 italic">Aucune opération.</div>
            )}
          </div>
        )}
      </div>

      {/* MODAL TRANSACTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 animate-in zoom-in-95 duration-300">
            {lastSavedTransaction ? (
              <div className="text-center space-y-8 animate-in fade-in">
                 <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10" /></div>
                 <h2 className="text-3xl font-serif font-bold text-slate-900">Validé !</h2>
                 <button onClick={() => setIsModalOpen(false)} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px]">Fermer</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Nouvelle opération</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500"><X /></button>
                </div>
                <form onSubmit={handleSaveTransaction} className="space-y-8">
                  <div className="flex bg-slate-100 p-1.5 rounded-[2rem]">
                    <button type="button" onClick={() => setNewTrans({...newTrans, type: 'INCOME'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400'}`}>Recette</button>
                    <button type="button" onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Dépense</button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Prestation / Article</label>
                      <button type="button" onClick={() => setIsServiceListOpen(true)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 text-left flex justify-between items-center border border-transparent hover:border-brand-100 transition-all">
                        <span className={newTrans.label ? 'text-slate-900 font-bold' : 'text-slate-400'}>{newTrans.label || "Choisir dans le catalogue..."}</span>
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    {newTrans.type === 'INCOME' && (
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Collaborateur (Staff)</label>
                        <button type="button" onClick={() => setIsStaffListOpen(true)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 text-left flex justify-between items-center border border-transparent hover:border-brand-100 transition-all">
                          <span className={newTrans.staffName ? 'text-slate-900 font-bold' : 'text-slate-400'}>{newTrans.staffName || "Qui a encaissé ?"}</span>
                          <Users className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Montant (F)</label>
                      <input type="number" placeholder="0" value={newTrans.amount || ''} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 outline-none font-black text-4xl text-center focus:ring-2 focus:ring-brand-500/20" required />
                    </div>
                  </div>

                  <button type="submit" disabled={saving} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Enregistrer
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {user && (
        <ExportReportModal 
          isOpen={isExportModalOpen} 
          onClose={() => setIsExportModalOpen(false)} 
          transactions={transactions} 
          user={user} 
        />
      )}

      {/* MODAL CATALOGUE SERVICES */}
      {isServiceListOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/95 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl h-[85vh] md:rounded-[3rem] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-8 border-b border-slate-100">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Catalogue de Vente</h3>
                    <button onClick={() => setIsServiceListOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400"><X /></button>
                 </div>
                 {services.length > 0 ? (
                   <div className="relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" placeholder="Rechercher une prestation..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-lg" />
                   </div>
                 ) : null}
              </div>
              <div className="flex-grow overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
                 {isInitializing ? (
                   <div className="m-auto text-center py-20"><Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto" /></div>
                 ) : services.length === 0 ? (
                   <div className="text-center py-20 space-y-8">
                      <Database className="w-16 h-16 text-slate-300 mx-auto" />
                      <p className="text-slate-500 font-medium">Votre catalogue est vide. Générez la base standard KITA.</p>
                      <button onClick={initializeDefaultServices} className="bg-brand-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px]">Générer le catalogue</button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-4">
                      {filteredServicesList.map(s => (
                        <button key={s.id} onClick={() => handleSelectService(s)} className="p-6 text-left bg-white rounded-[2.5rem] border-2 border-transparent hover:border-brand-500 hover:shadow-xl transition-all flex flex-col justify-between min-h-[140px]">
                          <div><span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase mb-3 block w-fit">{s.category}</span><p className="font-bold text-slate-900 text-lg leading-tight">{s.name}</p></div>
                          <p className="mt-4 font-black text-emerald-600 text-sm">{s.defaultPrice > 0 ? `${s.defaultPrice.toLocaleString()} F` : 'Prix libre'}</p>
                        </button>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL STAFF SELECTION */}
      {isStaffListOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[4rem] shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-slate-900">Qui a travaillé ?</h3>
                <button onClick={() => setIsStaffListOpen(false)} className="text-slate-300"><X /></button>
              </div>
              <div className="space-y-3">
                 <button onClick={() => handleSelectStaff({ name: '', commission_rate: 0 })} className="w-full p-6 text-left bg-slate-50 rounded-3xl hover:bg-slate-100 font-bold transition-all border border-transparent hover:border-brand-200">Gérant (Sans commission)</button>
                 {staff.length > 0 ? staff.map(member => (
                   <button key={member.id} onClick={() => handleSelectStaff(member)} className="w-full p-6 text-left bg-emerald-50 rounded-3xl hover:bg-emerald-100 transition-all border border-emerald-100 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover:scale-110 transition-transform">{member.name[0]}</div>
                        <span className="font-bold text-emerald-900">{member.name}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-white px-3 py-1 rounded-full">{member.commissionRate || member.commission_rate}% Com.</span>
                   </button>
                 )) : (
                   <div className="py-10 text-center space-y-4">
                      <p className="text-slate-400 italic">Aucun collaborateur enregistré.</p>
                      <button onClick={() => navigate('/pilotage')} className="text-[10px] font-black uppercase text-brand-600 underline">Gérer mon staff</button>
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
