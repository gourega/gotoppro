
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaService, KitaBasketItem } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  getKitaServices,
  getKitaStaff,
  getKitaClients,
  addKitaClient
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
  Search,
  Users,
  FileText,
  ShoppingBag,
  MinusCircle,
  PlusCircle,
  CreditCard,
  Ban,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import KitaTopNav from '../components/KitaTopNav';
import ExportReportModal from '../components/ExportReportModal';

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const [isStaffListOpen, setIsStaffListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [basket, setBasket] = useState<KitaBasketItem[]>([]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [clientName, setClientName] = useState('');
  const [saveAsVIP, setSaveAsVIP] = useState(false);
  
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
      const [transData, serviceData, staffData, clientData] = await Promise.all([
        getKitaTransactions(user.uid),
        getKitaServices(user.uid),
        getKitaStaff(user.uid),
        getKitaClients(user.uid)
      ]);
      setTransactions(transData);
      setServices(serviceData);
      setStaff(staffData);
      setClients(clientData);
    } finally { setLoading(false); }
  };

  const basketTotal = useMemo(() => basket.reduce((acc, item) => acc + item.amount, 0), [basket]);
  const finalTotal = useMemo(() => Math.max(0, basketTotal - (newTrans.discount || 0)), [basketTotal, newTrans.discount]);
  const restToPay = useMemo(() => Math.max(0, finalTotal - amountPaid), [finalTotal, amountPaid]);

  // Synchroniser amountPaid quand le total change pour éviter les erreurs de saisie
  useEffect(() => {
    if (!isModalOpen) return;
    setAmountPaid(finalTotal);
  }, [finalTotal, isModalOpen]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newTrans.type === 'INCOME' && basket.length === 0) return;
    if (newTrans.type === 'EXPENSE' && !newTrans.label) return;
    if (restToPay > 0 && !clientName.trim()) {
      alert("Veuillez renseigner le nom du client pour le reste à payer.");
      return;
    }

    setSaving(true);
    try {
      const baseLabel = basket.map(i => i.label).join(', ');
      
      // 1. Enregistrement du client si option VIP cochée et n'existe pas
      if (saveAsVIP && clientName.trim()) {
        const exists = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
        if (!exists) {
          await addKitaClient(user.uid, { name: clientName, phone: '', notes: 'Client enregistré depuis la caisse.' });
        }
      }

      if (newTrans.type === 'INCOME') {
        // SCÉNARIO A : Paiement partiel (Cash + Ardoise)
        if (amountPaid > 0 && restToPay > 0) {
          // Ligne Cash
          await addKitaTransaction(user.uid, {
            ...newTrans,
            amount: amountPaid,
            label: baseLabel + " (Acompte)",
            isCredit: false
          });
          // Ligne Ardoise
          const trans = await addKitaTransaction(user.uid, {
            ...newTrans,
            amount: restToPay,
            label: baseLabel + " (Reste à payer - " + clientName + ")",
            isCredit: true
          });
          setLastSavedTransaction(trans);
        } 
        // SCÉNARIO B : Tout en ardoise
        else if (amountPaid === 0 && restToPay > 0) {
          const trans = await addKitaTransaction(user.uid, {
            ...newTrans,
            amount: restToPay,
            label: baseLabel + " (Ardoise totale - " + clientName + ")",
            isCredit: true
          });
          setLastSavedTransaction(trans);
        }
        // SCÉNARIO C : Paiement complet
        else {
          const trans = await addKitaTransaction(user.uid, {
            ...newTrans,
            amount: amountPaid,
            label: baseLabel + (clientName ? ` (${clientName})` : ''),
            isCredit: false
          });
          setLastSavedTransaction(trans);
        }
      } else {
        // DÉPENSE
        await addKitaTransaction(user.uid, newTrans);
        setLastSavedTransaction({ ...newTrans, id: 'tmp' } as any);
      }
      
      await loadData();
    } catch (err) { 
      alert("Erreur lors de l'enregistrement."); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleAddToBasket = (s: KitaService) => {
    setBasket([...basket, { label: s.name, amount: s.defaultPrice, category: s.category }]);
    setIsServiceListOpen(false);
  };

  const removeFromBasket = (idx: number) => setBasket(basket.filter((_, i) => i !== idx));

  const filteredClients = useMemo(() => {
    if (!clientName) return [];
    return clients.filter(c => c.name.toLowerCase().includes(clientName.toLowerCase())).slice(0, 3);
  }, [clientName, clients]);

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 relative">
      <KitaTopNav />
      
      <header className="bg-amber-500 pt-16 pb-32 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center shrink-0"><Wallet className="w-10 h-10 text-amber-500" /></div>
              <div>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-900/50 hover:text-brand-900 transition mb-2 font-black text-[10px] uppercase tracking-widest"><ChevronLeft className="w-3" /> Dashboard</button>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 tracking-tight">Pilotage <span className="text-white italic">Financier</span></h1>
              </div>
           </div>
           <div className="flex gap-4">
              <button onClick={() => setIsExportModalOpen(true)} className="h-16 w-16 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-all"><FileText className="w-6 h-6" /></button>
              <button onClick={() => { 
                setIsModalOpen(true); 
                setLastSavedTransaction(null);
                setBasket([]);
                setClientName('');
                setSaveAsVIP(false);
                setNewTrans({...newTrans, type: 'INCOME', amount: 0, label: '', isCredit: false, discount: 0});
              }} className="h-16 w-16 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all"><Plus className="w-8 h-8" /></button>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        <div className="bg-white rounded-[4rem] shadow-xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 border">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-24 flex-grow text-center md:text-left">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recettes réelles</p><p className="text-2xl md:text-4xl font-black text-emerald-500">+{transactions.filter(t => t.type === 'INCOME' && !t.isCredit).reduce((a,b)=>a+b.amount, 0).toLocaleString()} F</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ardoises (Dû)</p><p className="text-2xl md:text-4xl font-black text-amber-600">+{transactions.filter(t => t.isCredit).reduce((a,b)=>a+b.amount, 0).toLocaleString()} F</p></div>
              <div className="hidden lg:block"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dépenses</p><p className="text-2xl md:text-4xl font-black text-rose-500">-{transactions.filter(t => t.type === 'EXPENSE').reduce((a,b)=>a+b.amount, 0).toLocaleString()} F</p></div>
           </div>
        </div>

        <div className="space-y-4 pb-20">
          <div className="flex items-center gap-4 px-4 mb-4">
             <TrendingUp className="w-5 h-5 text-slate-400" />
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Journal de caisse</h3>
          </div>
          {transactions.map(t => (
            <div key={t.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border flex flex-col md:flex-row items-center justify-between hover:shadow-xl transition-all group gap-4">
              <div className="flex items-center gap-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {t.isCredit ? <Ban className="w-6 h-6 text-amber-500" /> : t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-900 text-xl truncate max-w-[250px] md:max-w-md">{t.label}</p>
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
          {transactions.length === 0 && !loading && (
             <div className="py-20 text-center border-2 border-dashed rounded-[3rem] text-slate-300 italic">Aucune opération aujourd'hui.</div>
          )}
        </div>
      </div>

      {/* MODAL TRANSACTION PANIER AMÉLIORÉ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-10 md:p-14 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {lastSavedTransaction ? (
              <div className="text-center space-y-8 animate-in fade-in py-10">
                 <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 className="w-12 h-12" /></div>
                 <h2 className="text-4xl font-serif font-bold text-slate-900">Opération Validée</h2>
                 <p className="text-slate-500">Votre caisse a été mise à jour avec succès.</p>
                 <button onClick={() => setIsModalOpen(false)} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl">Fermer la fenêtre</button>
              </div>
            ) : (
              <form onSubmit={handleSaveTransaction} className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Nouvelle Opération</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 p-2"><X /></button>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-[2rem]">
                  <button type="button" onClick={() => setNewTrans({...newTrans, type: 'INCOME'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${newTrans.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400'}`}>Vente / Recette</button>
                  <button type="button" onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Dépense</button>
                </div>

                <div className="space-y-6">
                  {newTrans.type === 'INCOME' ? (
                    <>
                      {/* LE PANIER */}
                      <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Détail du Panier</h3>
                            <button type="button" onClick={() => setIsServiceListOpen(true)} className="bg-brand-900 text-white p-2 rounded-xl hover:scale-105 transition-all shadow-lg"><Plus className="w-4 h-4" /></button>
                         </div>
                         <div className="space-y-3">
                            {basket.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100">
                                 <div><p className="text-xs font-bold text-slate-900">{item.label}</p><p className="text-[8px] font-black text-slate-300 uppercase">{item.category}</p></div>
                                 <div className="flex items-center gap-4"><p className="font-black text-sm">{item.amount.toLocaleString()} F</p><button type="button" onClick={() => removeFromBasket(idx)} className="text-rose-500 hover:scale-110 transition-transform"><MinusCircle className="w-5 h-5" /></button></div>
                              </div>
                            ))}
                            {basket.length === 0 && <p className="text-center text-slate-300 text-[10px] py-4 uppercase font-bold">Panier Vide. Ajoutez une prestation.</p>}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Remise Globale (F)</label><input type="number" value={newTrans.discount || ''} onChange={e => setNewTrans({...newTrans, discount: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-amber-50 border border-amber-100 font-bold text-amber-600 outline-none" placeholder="0" /></div>
                        <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Collaborateur</label><button type="button" onClick={() => setIsStaffListOpen(true)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 text-left font-bold truncate border border-slate-100">{newTrans.staffName || "Qui a travaillé ?"}</button></div>
                      </div>

                      {/* NOUVEAU SYSTÈME DE PAIEMENT PARTIEL & CLIENT */}
                      <div className="bg-emerald-50/50 p-6 md:p-8 rounded-[3rem] border border-emerald-100 space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-[9px] font-black text-emerald-600 uppercase mb-2 ml-4">Montant Payé (F)</label>
                               <input 
                                 type="number" 
                                 value={amountPaid} 
                                 onChange={e => setAmountPaid(Number(e.target.value))} 
                                 className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-emerald-200 font-black text-xl text-emerald-700 outline-none"
                               />
                            </div>
                            <div className="flex flex-col justify-center">
                               <p className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-4">Total à payer</p>
                               <p className="text-2xl font-black text-slate-900 ml-4">{finalTotal.toLocaleString()} F</p>
                            </div>
                         </div>

                         {restToPay > 0 && (
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 animate-in slide-in-from-top-2">
                               <p className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-2">
                                  <CreditCard className="w-3.5 h-3.5" /> Reste à percevoir : {restToPay.toLocaleString()} F
                               </p>
                            </div>
                         )}

                         <div className="relative">
                            <label className="block text-[9px] font-black text-emerald-600 uppercase mb-2 ml-4">Nom du Client {restToPay > 0 && '*'}</label>
                            <div className="relative">
                               <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                               <input 
                                 type="text" 
                                 value={clientName} 
                                 onChange={e => setClientName(e.target.value)} 
                                 placeholder="Nom ou recherche VIP..." 
                                 className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white border-none font-bold text-slate-900 shadow-sm"
                               />
                            </div>
                            
                            {/* Autocomplétion Clients */}
                            {filteredClients.length > 0 && (
                               <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                                  {filteredClients.map(c => (
                                     <button key={c.id} type="button" onClick={() => { setClientName(c.name); setSearchTerm(''); }} className="w-full p-4 text-left hover:bg-emerald-50 flex items-center justify-between border-b last:border-none">
                                        <span className="font-bold text-sm">{c.name}</span>
                                        <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase font-black">VIP</span>
                                     </button>
                                  ))}
                               </div>
                            )}

                            {clientName && !clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()) && (
                               <button 
                                 type="button" 
                                 onClick={() => setSaveAsVIP(!saveAsVIP)}
                                 className={`mt-4 flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${saveAsVIP ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-400'}`}
                               >
                                  <UserPlus className="w-4 h-4" /> Enregistrer comme client VIP ?
                               </button>
                            )}
                         </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Date</label><input type="date" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none" /></div>
                        <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Méthode</label><select value={newTrans.paymentMethod} onChange={e => setNewTrans({...newTrans, paymentMethod: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none appearance-none"><option>Espèces</option><option>Wave / Orange</option><option>Virement</option></select></div>
                      </div>
                      <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Motif dépense</label><input type="text" value={newTrans.label} onChange={e => setNewTrans({...newTrans, label: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold" placeholder="Ex: Achat Gobelets" required /></div>
                      <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Montant (F)</label><input type="number" value={newTrans.amount || ''} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-rose-50 border border-rose-100 font-bold text-rose-600 outline-none text-2xl" placeholder="0" required /></div>
                    </>
                  )}

                  <div className="pt-4">
                    <div className={`w-full p-8 rounded-[3rem] text-center shadow-inner ${newTrans.type === 'INCOME' ? 'bg-emerald-900 text-white' : 'bg-rose-900 text-white'}`}>
                       <p className="text-[10px] font-black uppercase opacity-60 mb-2">
                         {newTrans.type === 'INCOME' ? (restToPay > 0 ? 'Total opération (partiel)' : 'Paiement complet') : 'Sortie de caisse'}
                       </p>
                       <p className="text-5xl font-black">
                         {(newTrans.type === 'INCOME' ? amountPaid : newTrans.amount).toLocaleString()} F
                       </p>
                       {restToPay > 0 && <p className="text-[10px] font-bold text-amber-400 mt-2 uppercase tracking-widest">+ {restToPay.toLocaleString()} F en ardoise</p>}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving || (newTrans.type === 'INCOME' && basket.length === 0)} className="w-full bg-brand-900 text-white py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-[0_20px_40px_rgba(12,74,110,0.3)] flex items-center justify-center gap-4 hover:bg-black transition-all">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />} Enregistrer l'opération
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CATALOGUE SERVICES */}
      {isServiceListOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/95 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl h-[85vh] md:rounded-[3rem] rounded-t-[3rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-8 border-b">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-serif font-bold text-slate-900">Catalogue</h3>
                    <button onClick={() => setIsServiceListOpen(false)} className="p-3 bg-slate-50 rounded-xl hover:text-rose-500 transition-colors"><X /></button>
                 </div>
                 <div className="relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Rechercher une prestation..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-2xl border-none outline-none font-bold text-lg" /></div>
              </div>
              <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                    <button key={s.id} onClick={() => handleAddToBasket(s)} className="p-6 text-left bg-white rounded-[2rem] border-2 border-slate-50 hover:border-brand-500 hover:shadow-xl transition-all flex flex-col justify-between min-h-[140px] shadow-sm">
                       <div><span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded mb-2 inline-block">{s.category}</span><p className="font-black text-slate-900 leading-tight text-lg">{s.name}</p></div>
                       <p className="mt-4 font-black text-2xl text-emerald-600">{s.defaultPrice.toLocaleString()} F</p>
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
              <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-serif font-bold">Collaborateur</h3><button onClick={() => setIsStaffListOpen(false)} className="p-2"><X /></button></div>
              <div className="space-y-3">
                 <button onClick={() => { setNewTrans({...newTrans, staffName: '', commissionRate: 0}); setIsStaffListOpen(false); }} className="w-full p-6 text-left bg-slate-50 rounded-2xl font-bold flex items-center gap-4 hover:bg-slate-100 transition-colors"><div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">👑</div> Gérant (0%)</button>
                 {staff.map(member => (
                    <button key={member.id} onClick={() => { setNewTrans({...newTrans, staffName: member.name, commissionRate: member.commissionRate || member.commission_rate}); setIsStaffListOpen(false); }} className="w-full p-6 text-left bg-emerald-50 rounded-2xl font-bold flex justify-between items-center border border-emerald-100 hover:bg-emerald-100 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><PlusCircle className="w-5 h-5 text-emerald-500" /></div>
                          <span className="text-emerald-900">{member.name}</span>
                       </div>
                       <span className="text-[10px] uppercase text-emerald-600 bg-white px-3 py-1 rounded-full font-black">{member.commissionRate || member.commission_rate}%</span>
                    </button>
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
