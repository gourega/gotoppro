
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaService, KitaBasketItem } from '../types';
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
  RefreshCw,
  Database,
  ChevronDown,
  Search,
  Users,
  FileText,
  Tag,
  Receipt,
  Calendar,
  ShoppingBag,
  MinusCircle,
  PlusCircle,
  CreditCard,
  Ban
} from 'lucide-react';
import KitaTopNav from '../components/KitaTopNav';
import { DEFAULT_KITA_SERVICES } from '../constants';
import ExportReportModal from '../components/ExportReportModal';

type PeriodFilter = 'today' | 'week' | 'month';

const EXPENSE_CATEGORIES = [
  "Loyer & Charges",
  "Achats Produits / Stock",
  "Salaires & Primes",
  "Transport & Logistique",
  "Électricité & Eau",
  "Marketing & Publicité",
  "Maintenance & Réparation",
  "Divers / Imprévus"
];

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('today');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const [isStaffListOpen, setIsStaffListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [basket, setBasket] = useState<KitaBasketItem[]>([]);
  const [newTrans, setNewTrans] = useState<Omit<KitaTransaction, 'id'>>({
    type: 'INCOME',
    amount: 0,
    label: '',
    category: 'Prestation',
    paymentMethod: 'Espèces',
    date: new Date().toISOString().split('T')[0],
    isCredit: false,
    staffName: '',
    commissionRate: 0,
    discount: 0,
    originalAmount: 0
  });
  
  const [saving, setSaving] = useState(false);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<KitaTransaction | null>(null);

  useEffect(() => { if (user?.uid) loadData(); }, [user?.uid]);

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
    } finally { setLoading(false); }
  };

  const basketTotal = useMemo(() => basket.reduce((acc, item) => acc + item.amount, 0), [basket]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (newTrans.type === 'INCOME' && basket.length === 0) || (newTrans.type === 'EXPENSE' && !newTrans.label)) return;
    setSaving(true);
    try {
      const finalTrans = { ...newTrans };
      if (newTrans.type === 'INCOME') {
        finalTrans.amount = basketTotal - (newTrans.discount || 0);
        finalTrans.label = basket.map(i => i.label).join(', ');
      }
      const trans = await addKitaTransaction(user.uid, finalTrans);
      if (trans) { await loadData(); setLastSavedTransaction(trans); }
    } catch (err) { alert("Erreur."); } finally { setSaving(false); }
  };

  const handleAddToBasket = (s: KitaService) => {
    setBasket([...basket, { label: s.name, amount: s.defaultPrice, category: s.category }]);
    setIsServiceListOpen(false);
  };

  const removeFromBasket = (idx: number) => setBasket(basket.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 relative">
      <KitaTopNav />
      
      <header className="bg-amber-500 pt-16 pb-32 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center shrink-0"><Wallet className="w-10 h-10 text-amber-500" /></div>
              <div>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-900/50 hover:text-brand-900 transition mb-2 font-black text-[10px] uppercase tracking-widest"><ChevronLeft className="w-3 h-3" /> Dashboard</button>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 tracking-tight">Pilotage <span className="text-white italic">Financier</span></h1>
              </div>
           </div>
           <div className="flex gap-4">
              <button onClick={() => setIsExportModalOpen(true)} className="h-16 w-16 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-all"><FileText className="w-6 h-6" /></button>
              <button onClick={() => { 
                setIsModalOpen(true); 
                setLastSavedTransaction(null);
                setBasket([]);
                setNewTrans({...newTrans, type: 'INCOME', amount: 0, label: '', isCredit: false});
              }} className="h-16 w-16 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all"><Plus className="w-8 h-8" /></button>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        <div className="bg-white rounded-[4rem] shadow-xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 border">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-24 flex-grow">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recettes</p><p className="text-2xl md:text-4xl font-black text-emerald-500">+{transactions.filter(t => t.type === 'INCOME').reduce((a,b)=>a+b.amount, 0).toLocaleString()} F</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dépenses</p><p className="text-2xl md:text-4xl font-black text-rose-500">-{transactions.filter(t => t.type === 'EXPENSE').reduce((a,b)=>a+b.amount, 0).toLocaleString()} F</p></div>
           </div>
        </div>

        <div className="space-y-4 pb-20">
          {transactions.map(t => (
            <div key={t.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border flex flex-col md:flex-row items-center justify-between hover:shadow-xl transition-all group gap-4">
              <div className="flex items-center gap-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {t.isCredit ? <Ban className="w-6 h-6 text-amber-500" /> : t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-900 text-xl">{t.label}</p>
                    {t.isCredit && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase">ARDOISE</span>}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{t.category} • {t.staffName || 'Gérant'} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className={`text-xl font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()} F</p>
                <button onClick={() => deleteKitaTransaction(t.id).then(loadData)} className="p-3 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TRANSACTION PANIER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-10 md:p-14 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {lastSavedTransaction ? (
              <div className="text-center space-y-8 animate-in fade-in py-10">
                 <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10" /></div>
                 <h2 className="text-3xl font-serif font-bold text-slate-900">Validé !</h2>
                 <button onClick={() => setIsModalOpen(false)} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px]">Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleSaveTransaction} className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Nouvelle Opération</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500"><X /></button>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-[2rem]">
                  <button type="button" onClick={() => setNewTrans({...newTrans, type: 'INCOME'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${newTrans.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400'}`}>Vente / Recette</button>
                  <button type="button" onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Dépense</button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Date</label><input type="date" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none" /></div>
                     <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Méthode</label><select value={newTrans.paymentMethod} onChange={e => setNewTrans({...newTrans, paymentMethod: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none appearance-none"><option>Espèces</option><option>Wave / Orange</option><option>Virement</option></select></div>
                  </div>

                  {newTrans.type === 'INCOME' ? (
                    <>
                      {/* LE PANIER */}
                      <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Détail du Panier</h3>
                            <button type="button" onClick={() => setIsServiceListOpen(true)} className="bg-brand-900 text-white p-2 rounded-xl hover:scale-105 transition-all"><Plus className="w-4 h-4" /></button>
                         </div>
                         <div className="space-y-3">
                            {basket.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                                 <div><p className="text-xs font-bold text-slate-900">{item.label}</p><p className="text-[8px] font-black text-slate-300 uppercase">{item.category}</p></div>
                                 <div className="flex items-center gap-4"><p className="font-black text-sm">{item.amount.toLocaleString()} F</p><button type="button" onClick={() => removeFromBasket(idx)} className="text-rose-500 hover:scale-110 transition-transform"><MinusCircle className="w-5 h-5" /></button></div>
                              </div>
                            ))}
                            {basket.length === 0 && <p className="text-center text-slate-300 text-[10px] py-4 uppercase font-bold">Panier Vide. Ajoutez une prestation.</p>}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Remise Globale (F)</label><input type="number" value={newTrans.discount || ''} onChange={e => setNewTrans({...newTrans, discount: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-amber-50 border border-amber-100 font-bold text-amber-600 outline-none" placeholder="0" /></div>
                        <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Collaborateur</label><button type="button" onClick={() => setIsStaffListOpen(true)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 text-left font-bold truncate">{newTrans.staffName || "Qui a travaillé ?"}</button></div>
                      </div>

                      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                         <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${newTrans.isCredit ? 'bg-amber-500 text-white' : 'bg-slate-300 text-white'}`}><CreditCard className="w-6 h-6" /></div>
                         <div className="flex-grow">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mettre sur Ardoise (Dette)</p>
                            <p className="text-[10px] font-bold text-slate-500 leading-tight">Cocher si le client ne paie pas immédiatement.</p>
                         </div>
                         <button type="button" onClick={() => setNewTrans({...newTrans, isCredit: !newTrans.isCredit})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newTrans.isCredit ? 'bg-amber-500' : 'bg-slate-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newTrans.isCredit ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Motif dépense</label><input type="text" value={newTrans.label} onChange={e => setNewTrans({...newTrans, label: e.target.value, amount: basketTotal})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold" placeholder="Ex: Achat Gobelets" required /></div>
                      <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Montant (F)</label><input type="number" value={newTrans.amount || ''} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-rose-50 border border-rose-100 font-bold text-rose-600 outline-none text-xl" placeholder="0" required /></div>
                    </>
                  )}

                  <div className="pt-4">
                    <div className={`w-full p-8 rounded-[3rem] text-center ${newTrans.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                       <p className="text-[9px] font-black uppercase mb-2">Total {newTrans.isCredit && 'en Ardoise'}</p>
                       <p className="text-5xl font-black">{(newTrans.type === 'INCOME' ? basketTotal - (newTrans.discount || 0) : newTrans.amount).toLocaleString()} F</p>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Enregistrer Opération
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CATALOGUE SERVICES */}
      {isServiceListOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/95 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl h-[80vh] md:rounded-[3rem] rounded-t-[3rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-8 border-b">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-serif font-bold">Catalogue</h3>
                    <button onClick={() => setIsServiceListOpen(false)} className="p-2 bg-slate-50 rounded-xl"><X /></button>
                 </div>
                 <div className="relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Chercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" /></div>
              </div>
              <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                    <button key={s.id} onClick={() => handleAddToBasket(s)} className="p-6 text-left bg-white rounded-3xl border-2 border-transparent hover:border-brand-500 hover:shadow-xl transition-all flex flex-col justify-between min-h-[120px] shadow-sm">
                       <div><span className="text-[8px] font-black uppercase text-slate-400">{s.category}</span><p className="font-bold text-slate-900 leading-tight">{s.name}</p></div>
                       <p className="mt-4 font-black text-emerald-600">{s.defaultPrice.toLocaleString()} F</p>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* STAFF LIST */}
      {isStaffListOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-serif font-bold">Qui a encaissé ?</h3><button onClick={() => setIsStaffListOpen(false)}><X /></button></div>
              <div className="space-y-3">
                 <button onClick={() => { setNewTrans({...newTrans, staffName: '', commissionRate: 0}); setIsStaffListOpen(false); }} className="w-full p-5 text-left bg-slate-50 rounded-2xl font-bold">Gérant (0%)</button>
                 {staff.map(member => (
                    <button key={member.id} onClick={() => { setNewTrans({...newTrans, staffName: member.name, commissionRate: member.commissionRate || member.commission_rate}); setIsStaffListOpen(false); }} className="w-full p-5 text-left bg-emerald-50 rounded-2xl font-bold flex justify-between items-center border border-emerald-100"><span className="text-emerald-900">{member.name}</span><span className="text-[10px] uppercase text-emerald-600 bg-white px-3 py-1 rounded-full">{member.commissionRate || member.commission_rate}%</span></button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {user && <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} transactions={transactions} user={user} />}
    </div>
  );
};

export default Caisse;
