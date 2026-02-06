
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaService, KitaBasketItem, UserProfile } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  deleteKitaTransaction,
  getKitaServices,
  getKitaStaff,
  getKitaClients,
  addKitaClient,
  getProfileByPhone,
  getReferrals
} from '../services/supabase';
import { addToSyncQueue, getSyncQueue, processSyncQueue } from '../services/syncManager';
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
  Search,
  Users,
  FileText,
  ShoppingBag,
  MinusCircle,
  PlusCircle,
  CreditCard,
  Ban,
  UserPlus,
  Gem,
  Minus,
  CloudOff,
  CloudLightning,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import KitaTopNav from '../components/KitaTopNav';
import ExportReportModal from '../components/ExportReportModal';

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [staffConfigs, setStaffConfigs] = useState<any[]>([]); 
  const [referrals, setReferrals] = useState<UserProfile[]>([]); 
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États Offline-First
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const [isStaffListOpen, setIsStaffListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [basket, setBasket] = useState<KitaBasketItem[]>([]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [clientName, setClientName] = useState('');
  
  const isStaff = useMemo(() => user?.role === 'STAFF_ELITE' || user?.role === 'STAFF_ADMIN', [user]);

  const [newTrans, setNewTrans] = useState<Omit<KitaTransaction, 'id'>>({
    type: 'INCOME',
    amount: 0,
    label: '',
    category: 'Prestation',
    paymentMethod: 'Espèces',
    date: new Date().toISOString().split('T')[0],
    isCredit: false,
    staffName: '',
    commission_rate: 0,
    tipAmount: 0,
    discount: 0,
    originalAmount: 0
  });
  
  const [saving, setSaving] = useState(false);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<KitaTransaction | null>(null);

  // Monitoring de la connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial de la queue
    setPendingCount(getSyncQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!user || isSyncing) return;
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      await processSyncQueue(user.uid);
      setPendingCount(0);
      await loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'expense') {
      handleOpenModal('EXPENSE');
    }
  }, [location]);

  useEffect(() => { 
    if (user?.uid) {
      loadData();
      if (isStaff) {
         setNewTrans(prev => ({ ...prev, staffName: `${user.firstName} ${user.lastName}`.trim() }));
      }
    } 
  }, [user?.uid, isStaff]);

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      let targetUid = user.uid;
      if (isStaff && user.referredBy) {
         const sponsor = await getProfileByPhone(user.referredBy);
         if (sponsor) targetUid = sponsor.uid;
      }
      const [transData, serviceData, staffData, clientData, referralData] = await Promise.all([
        getKitaTransactions(targetUid),
        getKitaServices(targetUid),
        getKitaStaff(targetUid),
        getKitaClients(targetUid),
        getReferrals(targetUid)
      ]);
      setTransactions(user.role === 'STAFF_ELITE' ? transData.filter(t => t.staffName === `${user.firstName} ${user.lastName}`.trim() || t.staffName === user.firstName) : transData);
      setServices(serviceData);
      setStaffConfigs(staffData);
      setClients(clientData);
      setReferrals(referralData.filter(r => r.role === 'STAFF_ELITE' || r.role === 'STAFF_ADMIN'));
    } finally { setLoading(false); }
  };

  const handleOpenModal = (type: 'INCOME' | 'EXPENSE') => {
    setLastSavedTransaction(null);
    setBasket([]);
    setClientName('');
    setNewTrans({
      ...newTrans, 
      type, 
      amount: 0, 
      label: '', 
      isCredit: false, 
      discount: 0, 
      tipAmount: 0,
      staffName: isStaff ? `${user?.firstName} ${user?.lastName}`.trim() : (type === 'EXPENSE' ? 'Gérant' : '')
    });
    setIsModalOpen(true);
  };

  const basketTotal = useMemo(() => basket.reduce((acc, item) => acc + item.amount, 0), [basket]);
  const finalTotal = useMemo(() => Math.max(0, basketTotal - (newTrans.discount || 0)), [basketTotal, newTrans.discount]);
  const restToPay = useMemo(() => Math.max(0, finalTotal - amountPaid), [finalTotal, amountPaid]);

  useEffect(() => {
    if (!isModalOpen || newTrans.type === 'EXPENSE') return;
    setAmountPaid(finalTotal);
  }, [finalTotal, isModalOpen, newTrans.type]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newTrans.type === 'INCOME' && basket.length === 0) return;
    if (newTrans.type === 'EXPENSE' && !newTrans.label) return;

    let targetUid = user.uid;
    if (isStaff && user.referredBy) {
       const sponsor = await getProfileByPhone(user.referredBy);
       if (sponsor) targetUid = sponsor.uid;
    }

    setSaving(true);
    try {
      const baseLabel = basket.map(i => i.label).join(', ');
      let payload: Omit<KitaTransaction, 'id'>;

      if (newTrans.type === 'INCOME') {
        if (amountPaid > 0 && restToPay > 0) {
          // Gérer le crédit séparément
          payload = { ...newTrans, amount: amountPaid, label: baseLabel + " (Acompte)", isCredit: false };
          if (isOnline) {
            await addKitaTransaction(targetUid, payload);
            await addKitaTransaction(targetUid, { ...newTrans, amount: restToPay, label: baseLabel + " (Reste - " + clientName + ")", isCredit: true, tipAmount: 0 });
          } else {
            addToSyncQueue(targetUid, payload);
            addToSyncQueue(targetUid, { ...newTrans, amount: restToPay, label: baseLabel + " (Reste - " + clientName + ")", isCredit: true, tipAmount: 0 });
          }
        } else {
          payload = { ...newTrans, amount: amountPaid, label: baseLabel + (clientName ? ` (${clientName})` : ''), isCredit: false };
          if (isOnline) {
            await addKitaTransaction(targetUid, payload);
          } else {
            addToSyncQueue(targetUid, payload);
          }
        }
      } else {
        payload = { ...newTrans, category: 'Dépense Salon' };
        if (isOnline) {
          await addKitaTransaction(targetUid, payload);
        } else {
          addToSyncQueue(targetUid, payload);
        }
      }

      setLastSavedTransaction({ ...payload, id: 'temp' } as any);
      if (isOnline) await loadData();
      else setPendingCount(getSyncQueue().length);
      
    } catch (err) { 
      if (!isOnline) {
        // Fallback ultime si addKitaTransaction échoue mais qu'on ne savait pas qu'on était offline
        const baseLabel = basket.map(i => i.label).join(', ');
        addToSyncQueue(targetUid, { ...newTrans, amount: amountPaid, label: baseLabel });
        setPendingCount(getSyncQueue().length);
        setLastSavedTransaction({ label: baseLabel } as any);
      } else {
        alert("Erreur d'enregistrement."); 
      }
    } finally { setSaving(false); }
  };

  const handleAddToBasket = (s: KitaService) => {
    setBasket([...basket, { label: s.name, amount: s.defaultPrice, category: s.category }]);
    setIsServiceListOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 relative">
      <KitaTopNav />

      {/* BANDEAU OFFLINE */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-900 py-3 px-6 flex items-center justify-center gap-3 animate-in slide-in-from-top sticky top-40 z-40 shadow-lg">
          <WifiOff className="w-5 h-5 animate-pulse" />
          <p className="font-black text-[10px] uppercase tracking-widest">Mode Hors-ligne : Vos ventes sont sécurisées localement.</p>
        </div>
      )}

      {pendingCount > 0 && isOnline && (
        <div className="bg-emerald-500 text-white py-3 px-6 flex items-center justify-center gap-4 animate-in slide-in-from-top sticky top-40 z-40 shadow-lg">
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudLightning className="w-4 h-4" />}
          <p className="font-black text-[10px] uppercase tracking-widest">{isSyncing ? 'Synchronisation en cours...' : `${pendingCount} vente(s) en attente de sauvegarde cloud`}</p>
          {!isSyncing && <button onClick={handleSync} className="bg-white text-emerald-600 px-4 py-1 rounded-full font-black text-[9px] uppercase">Synchroniser maintenant</button>}
        </div>
      )}

      <header className={`pt-16 pb-32 px-6 md:px-12 relative overflow-hidden transition-colors ${isStaff ? 'bg-emerald-600' : 'bg-slate-900'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center shrink-0">
                <Wallet className={`w-10 h-10 ${isStaff ? 'text-emerald-600' : 'text-emerald-500'}`} />
              </div>
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/40 hover:text-white transition font-black text-[10px] uppercase tracking-widest"><ChevronLeft className="w-3" /> Dashboard</button>
                    <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`}></div>
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{isOnline ? 'Connecté' : 'Hors-Ligne'}</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Caisse <span className="text-emerald-500 italic">Opérationnelle</span></h1>
              </div>
           </div>
           <div className="flex gap-4">
              {!isStaff && <button onClick={() => setIsExportModalOpen(true)} className="h-16 w-16 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"><FileText className="w-6 h-6" /></button>}
              
              {(!isStaff || user?.role === 'STAFF_ADMIN') && (
                <button onClick={() => handleOpenModal('EXPENSE')} className="h-16 px-6 rounded-[2rem] bg-rose-500 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all gap-3 font-black text-[10px] uppercase tracking-widest border-2 border-rose-400">
                  <MinusCircle className="w-5 h-5" /> Dépense
                </button>
              )}

              <button onClick={() => handleOpenModal('INCOME')} className="h-16 px-6 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all gap-3 font-black text-[10px] uppercase tracking-widest border-2 border-emerald-400">
                <PlusCircle className="w-5 h-5" /> Encaisser
              </button>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        <div className="bg-white rounded-[4rem] shadow-xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 border">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-24 flex-grow text-center md:text-left">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isStaff ? 'Commissions' : 'Recettes réelles'}</p><p className="text-2xl md:text-4xl font-black text-emerald-500">{isStaff ? transactions.reduce((a,b) => a + (b.amount * (b.commission_rate || 0) / 100), 0).toLocaleString() : transactions.filter(t => t.type === 'INCOME' && !t.isCredit).reduce((a,b)=>a+b.amount, 0).toLocaleString()} F</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isStaff ? 'Mes Pourboires 💎' : 'Ardoises (Dû)'}</p><p className="text-2xl md:text-4xl font-black text-amber-500">{isStaff ? transactions.reduce((a,b) => a + (b.tipAmount || 0), 0).toLocaleString() : transactions.filter(t => t.isCredit).reduce((a,b)=>a+b.amount, 0).toLocaleString()} F</p></div>
              <div className="hidden lg:block"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isStaff ? 'Total Percu' : 'Dépenses Salon'}</p><p className={`text-2xl md:text-4xl font-black ${isStaff ? 'text-brand-900' : 'text-rose-500'}`}>{isStaff ? (transactions.reduce((a,b) => a + (b.amount * (b.commission_rate || 0) / 100), 0) + transactions.reduce((a,b) => a + (b.tipAmount || 0), 0)).toLocaleString() : `-${transactions.filter(t => t.type === 'EXPENSE').reduce((a,b)=>a+b.amount, 0).toLocaleString()}`} F</p></div>
           </div>
        </div>

        <div className="space-y-4 pb-20">
          <div className="flex items-center justify-between px-4 mb-4">
             <div className="flex items-center gap-4">
                <TrendingUp className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Journal d'activité</h3>
             </div>
             {pendingCount > 0 && (
                <div className="flex items-center gap-2 text-amber-600 font-black text-[9px] uppercase">
                   <CloudOff className="w-3 h-3" /> {pendingCount} opération(s) locale(s)
                </div>
             )}
          </div>
          
          {/* Fusion des transactions locales et distantes pour le journal */}
          {[...getSyncQueue().map(q => ({...q, id: q.tempId, isLocal: true})), ...transactions].map(t => (
            <div key={(t as any).id} className={`bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border flex flex-col md:flex-row items-center justify-between hover:shadow-xl transition-all group gap-4 ${(t as any).isLocal ? 'border-amber-200 bg-amber-50/10' : ''}`}>
              <div className="flex items-center gap-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                   {(t as any).isLocal ? <CloudOff className="w-6 h-6 text-amber-500" /> : t.isCredit ? <Ban className="w-6 h-6 text-amber-500" /> : t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-900 text-xl truncate max-w-[250px] md:max-w-md">{t.label}</p>
                    {t.tipAmount > 0 && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1"><Gem className="w-2 h-2" /> +{t.tipAmount} F</span>}
                    {(t as any).isLocal && <span className="text-[8px] font-black uppercase text-amber-600 px-2 py-0.5 rounded-lg bg-white border border-amber-200">En attente réseau</span>}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{t.category} • {t.staffName || 'Gérant'} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div><p className={`text-xl font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()} F</p>{isStaff && t.type === 'INCOME' && <p className="text-[9px] font-bold text-slate-400">Com: {(t.amount * (t.commission_rate || 0) / 100).toLocaleString()} F</p>}</div>
                {!isStaff && !(t as any).isLocal && <button onClick={() => deleteKitaTransaction(t.id).then(loadData)} className="p-3 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && getSyncQueue().length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 italic">"Aucune opération aujourd'hui."</p>
             </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-10 md:p-14 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {lastSavedTransaction ? (
              <div className="text-center space-y-8 animate-in fade-in py-10">
                 <div className={`h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner ${isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {isOnline ? <CheckCircle2 className="w-12 h-12" /> : <CloudOff className="w-12 h-12" />}
                 </div>
                 <div>
                    <h2 className="text-4xl font-serif font-bold text-slate-900">{isOnline ? 'Opération Validée' : 'Vente Sécurisée'}</h2>
                    <p className="mt-4 text-slate-500 font-medium">{isOnline ? "La transaction a été sauvegardée sur le Cloud." : "Connexion absente. Votre vente a été sauvegardée sur votre téléphone et sera envoyée dès le retour du réseau."}</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl">Fermer la caisse</button>
              </div>
            ) : (
              <form onSubmit={handleSaveTransaction} className="space-y-8">
                <div className="flex justify-between items-center"><h2 className="text-2xl font-serif font-bold text-slate-900">{newTrans.type === 'INCOME' ? 'Nouvelle Recette' : 'Sortie de Caisse'}</h2><button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 p-2"><X /></button></div>
                <div className="flex bg-slate-100 p-1.5 rounded-[2rem]"><button type="button" onClick={() => setNewTrans({...newTrans, type: 'INCOME'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${newTrans.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400'}`}>Recette</button><button type="button" onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Dépense</button></div>
                
                <div className="space-y-6">
                  {newTrans.type === 'INCOME' ? (
                    <>
                      <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                         <div className="flex justify-between items-center mb-6"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panier de soins</h3><button type="button" onClick={() => setIsServiceListOpen(true)} className="bg-brand-900 text-white p-2 rounded-xl shadow-lg"><Plus className="w-4 h-4" /></button></div>
                         <div className="space-y-3">{basket.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100"><div><p className="text-xs font-bold text-slate-900">{item.label}</p></div><div className="flex items-center gap-4"><p className="font-black text-sm">{item.amount.toLocaleString()} F</p><button type="button" onClick={() => setBasket(basket.filter((_, i) => i !== idx))} className="text-rose-500"><MinusCircle className="w-5 h-5" /></button></div></div>
                            ))}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Intervenant</label><button type="button" disabled={isStaff} onClick={() => setIsStaffListOpen(true)} className={`w-full px-6 py-4 rounded-2xl bg-slate-50 text-left font-bold truncate border border-slate-100 ${isStaff ? 'opacity-50' : ''}`}>{newTrans.staffName || "Sélectionner..."}</button></div>
                        <div><label className="block text-[9px] font-black text-amber-600 uppercase mb-2 ml-4">Pourboire (F) 💎</label><input type="number" value={newTrans.tipAmount || ''} onChange={e => setNewTrans({...newTrans, tipAmount: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-amber-50 border border-amber-100 font-black text-amber-700 outline-none" /></div>
                      </div>
                      <div className="bg-emerald-50/50 p-6 md:p-8 rounded-[3rem] border border-emerald-100 space-y-6"><div className="grid grid-cols-2 gap-4"><div><label className="block text-[9px] font-black text-emerald-600 uppercase mb-2 ml-4">Payé Cash (F)</label><input type="number" value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-emerald-200 font-black text-xl text-emerald-700 outline-none" /></div><div className="flex flex-col justify-center"><p className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-4">Total Net</p><p className="text-2xl font-black text-slate-900 ml-4">{finalTotal.toLocaleString()} F</p></div></div><div><label className="block text-[9px] font-black text-emerald-600 uppercase mb-2 ml-4">Client</label><div className="relative"><Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nom du client VIP..." className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white border-none font-bold shadow-sm" /></div></div></div>
                    </>
                  ) : (
                    <div className="bg-rose-50/50 p-8 rounded-[3rem] border border-rose-100 space-y-6">
                      <div><label className="block text-[9px] font-black text-rose-600 uppercase mb-2 ml-4">Motif de la dépense</label><input type="text" value={newTrans.label} onChange={e => setNewTrans({...newTrans, label: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-white border-none outline-none font-bold shadow-sm" placeholder="Ex: Achat électricité, Loyer..." required /></div>
                      <div><label className="block text-[9px] font-black text-rose-600 uppercase mb-2 ml-4">Montant de la sortie (F)</label><input type="number" value={newTrans.amount || ''} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} className="w-full px-8 py-6 rounded-2xl bg-white border-2 border-rose-200 font-black text-rose-600 outline-none text-3xl" placeholder="0" required /></div>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={saving || (newTrans.type === 'INCOME' && basket.length === 0)} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 transition-all ${newTrans.type === 'INCOME' ? 'bg-brand-900 text-white hover:bg-black' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isOnline ? <CheckCircle2 className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />} {isOnline ? "Enregistrer l'opération" : "Sécuriser sur mon téléphone"}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAUX LISTES (SERVICES/STAFF) */}
      {isServiceListOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/95 backdrop-blur-md"><div className="bg-white w-full max-w-2xl h-[85vh] md:rounded-[3rem] rounded-t-[3rem] overflow-hidden flex flex-col"><div className="p-8 border-b"><div className="flex justify-between items-center mb-6"><h3 className="text-3xl font-serif font-bold">Catalogue</h3><button onClick={() => setIsServiceListOpen(false)} className="p-3 bg-slate-50 rounded-xl"><X /></button></div><input type="text" placeholder="Recherche..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" /></div><div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">{services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (<button key={s.id} onClick={() => handleAddToBasket(s)} className="p-6 text-left bg-white rounded-[2rem] border-2 border-slate-50 hover:border-brand-500 transition-all flex flex-col justify-between shadow-sm"><p className="font-black text-slate-900 leading-tight text-lg">{s.name}</p><p className="mt-4 font-black text-2xl text-emerald-600">{s.defaultPrice.toLocaleString()} F</p></button>))}</div></div></div>
      )}

      {isStaffListOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10">
              <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-serif font-bold">Collaborateur</h3><button onClick={() => setIsStaffListOpen(false)} className="p-2"><X /></button></div>
              <div className="space-y-3">
                 <button onClick={() => { setNewTrans({...newTrans, staffName: 'Gérant', commission_rate: 0}); setIsStaffListOpen(false); }} className="w-full p-6 text-left bg-slate-50 rounded-2xl font-bold flex items-center gap-4">👑 Gérant (0%)</button>
                 {referrals.map(collab => {
                    const config = staffConfigs.find(s => s.phone?.replace(/\D/g,'').endsWith(collab.phoneNumber.replace(/\D/g,'').slice(-10)));
                    const memberName = `${collab.firstName} ${collab.lastName}`.trim();
                    return (
                       <button key={collab.uid} onClick={() => { setNewTrans({...newTrans, staffName: memberName, commission_rate: config ? config.commission_rate : 0}); setIsStaffListOpen(false); }} className="w-full p-6 text-left bg-emerald-50 rounded-2xl font-bold flex justify-between items-center"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full overflow-hidden bg-white">{collab.photoURL ? <img src={collab.photoURL} className="w-full h-full object-cover" /> : collab.firstName?.[0]}</div><span>{memberName}</span></div><span className="text-[10px] uppercase text-emerald-600 font-black">{config ? `${config.commission_rate}%` : '—'}</span></button>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {user && <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} transactions={transactions} user={user} />}
    </div>
  );
};

export default Caisse;
