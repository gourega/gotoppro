
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaDebt, KitaService } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  getKitaDebts,
  addKitaDebt,
  markDebtAsPaid,
  getKitaServices,
  addKitaService,
  saveUserProfile,
  getUserProfile
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
  Clock,
  Printer,
  ChevronDown,
  Search,
  X,
  Scissors,
  Sparkles,
  Zap,
  ShoppingBag,
  MoreHorizontal,
  RefreshCw,
  AlertCircle
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
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [debts, setDebts] = useState<KitaDebt[]>([]);
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

  useEffect(() => {
    if (user) loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    console.log("Caisse: Tentative de chargement pour", user.uid);
    
    try {
      // 1. On vérifie d'abord si le profil existe en base (essentiel pour les clés étrangères)
      const existingProfile = await getUserProfile(user.uid);
      if (!existingProfile) {
        console.log("Caisse: Profil absent de la DB, création en cours...");
        await saveUserProfile({
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName || 'Gérant',
          lastName: user.lastName || '',
          establishmentName: user.establishmentName || 'Mon Salon',
          role: 'CLIENT',
          isActive: true,
          isAdmin: false,
          isKitaPremium: false,
          hasPerformancePack: false,
          hasStockPack: false,
          badges: [],
          purchasedModuleIds: [],
          pendingModuleIds: [],
          actionPlan: [],
          createdAt: new Date().toISOString()
        });
        await refreshProfile();
      }

      // 2. Chargement des données métier
      const [transData, debtData, serviceData] = await Promise.all([
        getKitaTransactions(user.uid),
        getKitaDebts(user.uid),
        getKitaServices(user.uid)
      ]);
      
      setTransactions(transData);
      setDebts(debtData);

      // 3. Gestion du catalogue
      if (serviceData.length === 0) {
        setServices([]);
      } else {
        setServices(serviceData);
      }

    } catch (err: any) {
      console.error("Caisse: Erreur de chargement", err);
      setError("Impossible de contacter la base de données. Vérifiez vos tables Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultServices = async () => {
    if (!user || isInitializing) return;
    setIsInitializing(true);
    setLoading(true);
    
    try {
      console.log("Caisse: Lancement de l'initialisation forcée...");
      for (const name of DEFAULT_KITA_SERVICES) {
        let cat = 'Autre';
        if (name.match(/Coupe|Brushing|Tresse|Chignon|Teinture|Mise en plis|Shampoing|Bain|Défrisage|Babyliss|Balayage|Tissage/i)) {
          cat = 'Coiffure';
        } else if (name.match(/Vernis|Gel|Manicure|Pédicure|Capsules|Pose/i)) {
          cat = 'Ongles';
        } else if (name.match(/Massage|Visage|Corps|Soins|Epilation|Maquillage|Sourcils|Percing|Tatouage/i)) {
          cat = 'Soins';
        } else if (name.match(/Vente/i)) {
          cat = 'Vente';
        }

        await addKitaService(user.uid, { name, category: cat, defaultPrice: 0, isActive: true });
      }
      const refreshedServices = await getKitaServices(user.uid);
      setServices(refreshedServices);
    } catch (err) {
      console.error("Caisse: Erreur init services", err);
      alert("Erreur lors de la création des services. Vérifiez que la table 'kita_services' existe.");
    } finally {
      setIsInitializing(false);
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7;
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
    startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(t => {
      if (t.isCredit) return false;
      const tDate = new Date(t.date).getTime();
      if (period === 'today') return t.date === todayStr;
      if (period === 'week') return tDate >= startOfWeek.getTime();
      if (period === 'month') return tDate >= startOfMonth;
      return true;
    });
  }, [transactions, period]);

  const totals = useMemo(() => {
    const cashTotals = filteredTransactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
    const totalDebts = debts.filter(d => !d.isPaid).reduce((acc, d) => acc + d.amount, 0);
    return { ...cashTotals, unpaidDebts: totalDebts };
  }, [filteredTransactions, debts]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newTrans.amount <= 0 || !newTrans.label) return;
    setSaving(true);
    try {
      let savedId = '';
      if (newTrans.isCredit && newTrans.type === 'INCOME') {
        await addKitaDebt(user.uid, {
          personName: newTrans.label,
          amount: newTrans.amount,
          isPaid: false,
          createdAt: new Date().toISOString(),
          phone: ''
        });
        const trans = await addKitaTransaction(user.uid, { ...newTrans, category: 'Ardoise' });
        savedId = trans.id;
      } else {
        const trans = await addKitaTransaction(user.uid, newTrans);
        savedId = trans.id;
      }
      
      await loadData();
      setLastSavedTransaction({ ...newTrans, id: savedId } as any);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCollectDebt = async (debt: KitaDebt) => {
    if (!user) return;
    if (!window.confirm(`Confirmer l'encaissement de ${debt.amount} F de ${debt.personName} ?`)) return;
    
    setLoading(true);
    try {
      await markDebtAsPaid(debt.id);
      await addKitaTransaction(user.uid, {
        type: 'INCOME',
        amount: debt.amount,
        label: `Recouvrement : ${debt.personName}`,
        category: 'Recouvrement',
        paymentMethod: 'Espèces',
        date: new Date().toISOString().split('T')[0],
        isCredit: false
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (s: KitaService) => {
    setNewTrans({
      ...newTrans,
      label: s.name,
      amount: s.defaultPrice > 0 ? s.defaultPrice : newTrans.amount
    });
    setIsServiceListOpen(false);
    setSearchTerm('');
  };

  const handlePrintTicket = (transaction: KitaTransaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const ticketHtml = `
      <html>
        <head>
          <style>
            @page { size: 80mm 200mm; margin: 0; }
            body { width: 70mm; margin: 0 auto; padding: 10mm 5mm; font-family: sans-serif; font-size: 12px; line-height: 1.4; color: black; }
            .text-center { text-align: center; }
            .logo { width: 30mm; margin-bottom: 10px; }
            .divider { border-bottom: 1px dashed black; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .bold { font-weight: bold; }
            .footer { margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header text-center">
            <div class="bold" style="font-size: 14px;">${user?.establishmentName || "Go'Top Pro Salon"}</div>
            <div>Tél: ${user?.phoneNumber}</div>
          </div>
          <div class="divider"></div>
          <div class="text-center bold" style="margin-bottom: 10px;">REÇU DE CAISSE</div>
          <div class="row"><span>Date:</span><span>${new Date(transaction.date).toLocaleDateString('fr-FR')}</span></div>
          <div class="row"><span>Prestation:</span><span class="bold">${transaction.label}</span></div>
          <div class="divider"></div>
          <div class="row bold" style="font-size: 16px;"><span>TOTAL</span><span>${transaction.amount.toLocaleString()} F</span></div>
          <div class="divider"></div>
          <div class="footer text-center">Propulsé par Go'Top Pro KITA</div>
        </body>
      </html>
    `;

    printWindow.document.write(ticketHtml);
    printWindow.document.close();
  };

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCategory === 'all' || s.category === activeCategory;
      return s.isActive && matchesSearch && matchesCat;
    });
  }, [services, searchTerm, activeCategory]);

  const closeModal = () => {
    setIsModalOpen(false);
    setLastSavedTransaction(null);
    setNewTrans({
      type: 'INCOME',
      amount: 0,
      label: '',
      category: 'Prestation',
      paymentMethod: 'Espèces',
      date: new Date().toISOString().split('T')[0],
      isCredit: false
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      <KitaTopNav />
      
      <header className="bg-amber-500 pt-16 pb-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none select-none italic font-serif text-[15rem] leading-none text-white">CFA</div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl shrink-0"><Wallet className="w-full h-full text-amber-500" /></div>
              <div>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-900/50 hover:text-brand-900 transition mb-2 font-black text-[10px] uppercase tracking-widest">
                    <ChevronLeft className="w-3 h-3" /> Dashboard
                 </button>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 tracking-tight">Pilotage <span className="text-white italic">Financier</span></h1>
              </div>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="h-20 w-20 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"><Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" /></button>
        </div>
      </header>

      {error && (
        <div className="max-w-6xl mx-auto px-6 mt-8">
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-bold text-sm">{error}</p>
            <button onClick={loadData} className="ml-auto bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Réessayer</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 -mt-8 flex justify-center relative z-30">
        <div className="bg-white p-1.5 rounded-[2.5rem] flex gap-1 shadow-2xl border border-slate-50 overflow-x-auto">
          {(['today', 'week', 'month', 'debts'] as PeriodFilter[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-8 md:px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${period === p ? 'bg-brand-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? "Semaine" : p === 'month' ? "Mois" : "Ardoises"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        {period !== 'debts' && (
          <div className="bg-white rounded-[4rem] shadow-xl border border-slate-50 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
             <div className="grid grid-cols-2 gap-16 md:gap-24 flex-grow">
                <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recettes (Cash)</p><p className="text-4xl font-black text-emerald-500">+{totals.income.toLocaleString()} F</p></div>
                <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dépenses</p><p className="text-4xl font-black text-rose-500">-{totals.expense.toLocaleString()} F</p></div>
             </div>
             <div className="bg-brand-900 p-10 rounded-[3rem] text-white min-w-[300px] shadow-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Balance Cash</p>
                <div className="flex items-baseline gap-2"><p className="text-4xl font-black">{(totals.income - totals.expense).toLocaleString()}</p><p className="text-lg font-bold text-slate-500">F</p></div>
             </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement des chiffres...</p>
          </div>
        ) : period === 'debts' ? (
          <div className="space-y-6">
             {debts.filter(d => !d.isPaid).length === 0 ? (
               <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                  <p className="text-slate-500 font-bold italic">Toutes vos dettes sont recouvrées.</p>
               </div>
             ) : (
               <div className="grid gap-4">
                  {debts.filter(d => !d.isPaid).map(d => (
                    <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all group">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center"><Clock className="w-6 h-6" /></div>
                          <div><p className="font-bold text-slate-900 text-xl mb-1">{d.personName}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depuis le {new Date(d.createdAt).toLocaleDateString('fr-FR')}</p></div>
                       </div>
                       <div className="flex items-center gap-8">
                          <p className="text-2xl font-black text-rose-600">{d.amount.toLocaleString()} F</p>
                          <button onClick={() => handleCollectDebt(d)} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg transition-all">Encaisser</button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(t => (
              <div key={t.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div><p className="font-bold text-slate-900 text-xl mb-1">{t.label}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category} • {new Date(t.date).toLocaleDateString('fr-FR')}</p></div>
                </div>
                <div className="flex items-center gap-10">
                  <p className={`text-2xl font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()} F</p>
                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
                    {t.type === 'INCOME' && <button onClick={() => handlePrintTicket(t)} className="p-3 text-brand-600 hover:bg-brand-50 rounded-xl"><Printer className="w-4 h-4" /></button>}
                    <button onClick={() => deleteKitaTransaction(t.id).then(loadData)} className="p-3 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {lastSavedTransaction ? (
              <div className="text-center space-y-8 animate-in fade-in">
                 <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl"><CheckCircle2 className="w-10 h-10" /></div>
                 <h2 className="text-3xl font-serif font-bold text-slate-900">Enregistré !</h2>
                 <p className="text-slate-500 font-medium leading-relaxed italic">La prestation "${lastSavedTransaction.label}" de ${lastSavedTransaction.amount} F a bien été ajoutée.</p>
                 <div className="flex flex-col gap-4">
                    <button onClick={() => handlePrintTicket(lastSavedTransaction)} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-brand-950 transition-all"><Printer className="w-5 h-5" /> Imprimer le ticket</button>
                    <button onClick={closeModal} className="w-full py-5 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50 transition-all">Terminer</button>
                 </div>
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
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Prestation (Menu Visuel)</label>
                      <button type="button" onClick={() => setIsServiceListOpen(true)} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-brand-500/20 text-left flex justify-between items-center group transition-all">
                        <span className={newTrans.label ? 'text-slate-900 font-bold' : 'text-slate-400'}>{newTrans.label || "Sélectionner un service..."}</span>
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-brand-500" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Montant (F)</label>
                      <input type="number" placeholder="0" value={newTrans.amount || ''} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border-none outline-none font-black text-4xl text-center focus:ring-2 focus:ring-brand-500/20" />
                    </div>

                    {newTrans.type === 'INCOME' && (
                      <label className="flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-all">
                        <input type="checkbox" checked={newTrans.isCredit} onChange={e => setNewTrans({...newTrans, isCredit: e.target.checked})} className="w-6 h-6 rounded-lg text-amber-500" />
                        <p className="text-sm font-black text-amber-900 uppercase">Vente à crédit (Ardoise)</p>
                      </label>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={saving} className="flex-grow bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-brand-950 transition-all">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Valider
                    </button>
                    <button type="button" onClick={closeModal} className="px-10 py-6 rounded-2xl font-black text-[10px] uppercase text-slate-300">Annuler</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Menu Visuel des Services */}
      {isServiceListOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl h-[90vh] md:h-[80vh] md:rounded-[3rem] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-8 border-b border-slate-100 bg-white">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-3xl font-serif font-bold text-slate-900 mb-1">Catalogue Expert</h3>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Sélectionnez une prestation</p>
                    </div>
                    <button onClick={() => setIsServiceListOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X /></button>
                 </div>
                 
                 <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Chercher une prestation (ex: Tresse...)" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-500/20 font-bold text-lg"
                      autoFocus
                    />
                 </div>

                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-brand-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                         {cat.icon} {cat.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
                 {isInitializing ? (
                   <div className="py-24 text-center">
                      <Loader2 className="w-16 h-16 animate-spin text-brand-600 mx-auto mb-6" />
                      <p className="text-brand-900 font-black uppercase tracking-widest text-xs">Initialisation de votre catalogue...</p>
                      <p className="text-slate-400 text-sm italic mt-2">Veuillez patienter quelques secondes.</p>
                   </div>
                 ) : services.length === 0 ? (
                   <div className="py-20 text-center text-slate-400">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-6 opacity-20" />
                      <h4 className="text-slate-900 font-bold text-xl mb-4">Catalogue vide</h4>
                      <p className="italic font-medium mb-10 max-w-sm mx-auto">Votre catalogue ne semble pas avoir été initialisé. Souhaitez-vous générer les prestations par défaut ?</p>
                      <button 
                        onClick={initializeDefaultServices}
                        className="bg-brand-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-brand-950 transition-all flex items-center gap-4 mx-auto"
                      >
                        <RefreshCw className="w-4 h-4" /> Générer mes prestations
                      </button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-4">
                      {filteredServices.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => handleSelectService(s)}
                          className="p-6 text-left bg-white rounded-[2.5rem] border-2 border-transparent hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all group relative flex flex-col justify-between min-h-[160px]"
                        >
                           <div>
                              <div className="flex justify-between items-start mb-3">
                                 <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">{s.category}</span>
                              </div>
                              <p className="font-bold text-slate-900 text-lg leading-tight group-hover:text-brand-900">{s.name}</p>
                           </div>
                           <div className="mt-4 flex items-center justify-between">
                              <span className={`px-4 py-1.5 rounded-xl font-black text-xs ${s.defaultPrice > 0 ? `${s.defaultPrice.toLocaleString()} F` : 'bg-slate-100 text-slate-500 uppercase tracking-widest text-[9px]'}`}>
                                 {s.defaultPrice > 0 ? `${s.defaultPrice.toLocaleString()} F` : 'Prix libre'}
                              </span>
                              <div className="h-8 w-8 rounded-full border-2 border-slate-100 group-hover:bg-brand-500 group-hover:border-brand-500 transition-all flex items-center justify-center">
                                 <Plus className="w-4 h-4 text-transparent group-hover:text-white" />
                              </div>
                           </div>
                        </button>
                      ))}
                      
                      {searchTerm && filteredServices.length === 0 && (
                        <button 
                          onClick={() => handleSelectService({ name: searchTerm, defaultPrice: 0 } as any)}
                          className="col-span-2 p-8 bg-brand-50 border-2 border-dashed border-brand-200 rounded-[2.5rem] text-center group hover:bg-brand-100 transition-all"
                        >
                           <p className="text-brand-900 font-bold mb-2">Libellé libre : "{searchTerm}"</p>
                           <p className="text-brand-600 text-xs font-black uppercase tracking-widest">Utiliser ce nom personnalisé</p>
                        </button>
                      )}
                      
                      {filteredServices.length === 0 && !searchTerm && (
                        <div className="col-span-2 py-20 text-center text-slate-400">
                          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="italic font-medium">Aucun service dans cette catégorie.</p>
                          <button onClick={() => navigate('/pilotage')} className="mt-4 text-brand-600 font-bold text-sm hover:underline">Gérer mon catalogue</button>
                        </div>
                      )}
                   </div>
                 )}
              </div>
              
              <div className="p-6 border-t border-slate-100 md:hidden bg-white">
                 <button onClick={() => setIsServiceListOpen(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Fermer</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;
