
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
  getProfileByPhone,
  getReferrals
} from '../services/supabase';
import { addToSyncQueue, getSyncQueue, processSyncQueue } from '../services/syncManager';
import { sendWhatsAppReceipt, generateSmartReceiptMessage } from '../services/whatsappService';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  ChevronLeft, 
  Loader2, 
  Wallet,
  CheckCircle2, 
  X,
  Users,
  FileText,
  PlusCircle,
  MinusCircle,
  Gem,
  CloudOff,
  CloudLightning,
  Wifi,
  WifiOff,
  MessageCircle,
  Sparkles,
  Send,
  ShieldCheck,
  ShieldAlert,
  Zap
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
  const [loading, setLoading] = useState(true);
  
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
  
  // États WhatsApp
  const [clientPhone, setClientPhone] = useState('');
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waSent, setWaSent] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

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

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); handleSync(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
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
    } finally { setIsSyncing(false); }
  };

  useEffect(() => { 
    if (user?.uid) loadData(); 
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      let targetUid = user.uid;
      if (isStaff && user.referredBy) {
         const sponsor = await getProfileByPhone(user.referredBy);
         if (sponsor) targetUid = sponsor.uid;
      }
      const [transData, serviceData, staffData, referralData] = await Promise.all([
        getKitaTransactions(targetUid),
        getKitaServices(targetUid),
        getKitaStaff(targetUid),
        getReferrals(targetUid)
      ]);
      setTransactions(user.role === 'STAFF_ELITE' ? transData.filter(t => t.staffName === `${user.firstName} ${user.lastName}`.trim()) : transData);
      setServices(serviceData);
      setStaffConfigs(staffData);
      setReferrals(referralData.filter(r => r.role === 'STAFF_ELITE' || r.role === 'STAFF_ADMIN'));
    } finally { setLoading(false); }
  };

  const handleOpenModal = (type: 'INCOME' | 'EXPENSE') => {
    setLastSavedTransaction(null);
    setBasket([]);
    setClientName('');
    setClientPhone('');
    setCustomMsg('');
    setWaSent(false);
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

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (newTrans.type === 'INCOME' && basket.length === 0)) return;
    
    setSaving(true);
    try {
      const baseLabel = basket.map(i => i.label).join(', ');
      const payload = { ...newTrans, amount: finalTotal, label: baseLabel + (clientName ? ` (${clientName})` : '') };
      
      let saved: any;
      if (isOnline) {
        saved = await addKitaTransaction(user.uid, payload);
        await loadData();
      } else {
        addToSyncQueue(user.uid, payload);
        saved = { ...payload, id: 'temp_' + Date.now() };
        setPendingCount(getSyncQueue().length);
      }
      setLastSavedTransaction(saved);
      
      // Auto-générer le message si on est en INCOME
      if (payload.type === 'INCOME' && isOnline) {
        setIsGeneratingMsg(true);
        const msg = await generateSmartReceiptMessage(clientName, baseLabel, finalTotal, user.establishmentName || "Go'Top Pro");
        setCustomMsg(msg);
        setIsGeneratingMsg(false);
      }
    } catch (err) {
      alert("Erreur d'enregistrement.");
    } finally { setSaving(false); }
  };

  const handleSendWhatsApp = async () => {
    if (!lastSavedTransaction || !clientPhone || isSendingWa) return;
    setIsSendingWa(true);
    try {
      const res = await sendWhatsAppReceipt(lastSavedTransaction.id, clientPhone, customMsg);
      if (res.success) setWaSent(true);
      else alert("Erreur lors de l'envoi.");
    } finally { setIsSendingWa(false); }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 relative">
      <KitaTopNav />
      
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
              <button onClick={() => handleOpenModal('EXPENSE')} className="h-16 px-6 rounded-[2rem] bg-rose-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all gap-3 font-black text-[10px] uppercase tracking-widest border-2 border-rose-400">
                <MinusCircle className="w-5 h-5" /> Dépense
              </button>
              
              <div className="relative group">
                <div className="absolute -top-4 -right-2 z-10 bg-amber-400 text-brand-900 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border-2 border-white animate-bounce pointer-events-none">
                    <Sparkles className="w-3 h-3" /> Reçu IA Inclus
                </div>
                <button onClick={() => handleOpenModal('INCOME')} className="h-16 px-6 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all gap-3 font-black text-[10px] uppercase tracking-widest border-2 border-emerald-400">
                    <PlusCircle className="w-5 h-5" /> Encaisser
                </button>
              </div>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16">
         <div className="space-y-4">
            {[...getSyncQueue().map(q => ({...q, id: q.tempId, isLocal: true})), ...transactions].map(t => (
               <div key={(t as any).id} className="bg-white p-6 rounded-2xl border flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${(t as any).isLocal ? 'bg-amber-50 text-amber-500' : t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        {(t as any).isLocal ? <CloudOff className="w-6 h-6" /> : t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <MinusCircle className="w-6 h-6" />}
                     </div>
                     <div>
                        <p className="font-bold text-slate-900">{t.label}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(t.date).toLocaleDateString()} • {t.staffName}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <p className={`font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} F</p>
                     {t.whatsapp_sent && <MessageCircle className="w-4 h-4 text-emerald-500" />}
                  </div>
               </div>
            ))}
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
                    <h2 className="text-3xl font-serif font-bold text-slate-900">{isOnline ? 'Vente Enregistrée' : 'Vente Sécurisée Localement'}</h2>
                    <p className="mt-4 text-slate-500 font-medium">{isOnline ? "Voulez-vous envoyer un reçu digital WhatsApp ?" : "Connectez-vous pour envoyer le reçu."}</p>
                 </div>

                 {isOnline && lastSavedTransaction.type === 'INCOME' && (
                    <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 space-y-6 text-left">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp du client</p>
                          {waSent && <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase">Envoyé avec succès !</span>}
                       </div>
                       
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+225</span>
                          <input 
                            type="tel" 
                            placeholder="0707..." 
                            value={clientPhone}
                            onChange={e => setClientPhone(e.target.value)}
                            disabled={waSent}
                            className="w-full pl-20 pr-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-lg"
                          />
                       </div>

                       <div className="p-6 bg-white rounded-2xl border border-slate-100 relative group">
                          <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-2 text-brand-600 font-black text-[9px] uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" /> Message rédigé par Coach Kita
                             </div>
                             <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Service Premium Offert
                             </div>
                          </div>
                          {isGeneratingMsg ? (
                            <div className="flex items-center gap-3 py-4 text-slate-300 italic text-sm">
                               <Loader2 className="w-4 h-4 animate-spin" /> Inspiration du mentor...
                            </div>
                          ) : (
                            <textarea 
                              value={customMsg}
                              onChange={e => setCustomMsg(e.target.value)}
                              className="w-full bg-transparent border-none outline-none font-medium text-sm leading-relaxed min-h-[100px] resize-none italic text-slate-600"
                            />
                          )}
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3 bg-emerald-50 py-4 rounded-2xl border-2 border-emerald-100/50 shadow-inner group">
                             <ShieldCheck className="w-5 h-5 text-emerald-600 animate-pulse" />
                             <div className="text-left">
                                <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Canal Officiel Certifié Meta Business</p>
                                <p className="text-[8px] font-bold text-emerald-600/70 uppercase">Financé par Go'Top Pro pour votre prestige</p>
                             </div>
                          </div>
                          <button 
                            onClick={handleSendWhatsApp}
                            disabled={isSendingWa || !clientPhone || waSent}
                            className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-4 transition-all ${waSent ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-[1.02]'}`}
                          >
                            {isSendingWa ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                            {waSent ? 'Reçu Digital Envoyé' : 'Envoyer via WhatsApp API'}
                          </button>
                       </div>
                    </div>
                 )}

                 <button onClick={() => setIsModalOpen(false)} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl">Terminer</button>
              </div>
            ) : (
              <form onSubmit={handleSaveTransaction} className="space-y-8">
                <div className="flex justify-between items-center"><h2 className="text-2xl font-serif font-bold text-slate-900">{newTrans.type === 'INCOME' ? 'Nouvelle Vente' : 'Nouvelle Dépense'}</h2><button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 p-2"><X /></button></div>
                
                <div className="space-y-6">
                   {newTrans.type === 'INCOME' ? (
                     <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panier</h3><button type="button" onClick={() => setIsServiceListOpen(true)} className="bg-brand-900 text-white p-2 rounded-xl"><Plus className="w-4 h-4" /></button></div>
                        <div className="space-y-3">
                           {basket.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-slate-100">
                                 <p className="text-xs font-bold">{item.label}</p>
                                 <p className="font-black">{item.amount.toLocaleString()} F</p>
                              </div>
                           ))}
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Libellé de la dépense</label>
                           <input type="text" value={newTrans.label} onChange={e => setNewTrans({...newTrans, label: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" placeholder="Ex: Achat Gazoil" />
                        </div>
                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Montant (F)</label>
                           <input type="number" value={newTrans.amount || ''} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-black text-rose-600" placeholder="0" />
                        </div>
                     </div>
                   )}
                   
                   {newTrans.type === 'INCOME' && (
                     <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-4">Nom du client VIP (pour le message personnalisé)</label>
                        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Mme Traoré" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
                     </div>
                   )}

                   <div className={`${newTrans.type === 'INCOME' ? 'bg-emerald-50' : 'bg-rose-50'} p-8 rounded-[2.5rem] border ${newTrans.type === 'INCOME' ? 'border-emerald-100' : 'border-rose-100'} flex justify-between items-center`}>
                      <div><p className={`text-[9px] font-black uppercase mb-1 ${newTrans.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>Total Net</p><p className={`text-3xl font-black ${newTrans.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>{finalTotal.toLocaleString()} F</p></div>
                      {newTrans.type === 'INCOME' ? <CheckCircle2 className="w-10 h-10 text-emerald-200" /> : <MinusCircle className="w-10 h-10 text-rose-200" />}
                   </div>
                </div>

                <button type="submit" disabled={saving || (newTrans.type === 'INCOME' && basket.length === 0) || (newTrans.type === 'EXPENSE' && !newTrans.label)} className="w-full py-8 rounded-[2.5rem] bg-brand-900 text-white font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 transition-all">
                   {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isOnline ? <CheckCircle2 className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />} 
                   {isOnline ? (newTrans.type === 'INCOME' ? "Valider & Préparer Reçu IA" : "Valider la Dépense") : "Sécuriser sur mon téléphone"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {isServiceListOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/95 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl h-[85vh] md:rounded-[3rem] rounded-t-[3rem] overflow-hidden flex flex-col">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-2xl font-serif font-bold">Catalogue</h3><button onClick={() => setIsServiceListOpen(false)} className="p-2"><X /></button></div>
              <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {services.map(s => (
                   <button key={s.id} onClick={() => { setBasket([...basket, { label: s.name, amount: s.defaultPrice, category: s.category }]); setIsServiceListOpen(false); }} className="p-6 text-left bg-white rounded-2xl border-2 hover:border-brand-500 transition-all shadow-sm">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="mt-2 font-black text-emerald-600">{s.defaultPrice.toLocaleString()} F</p>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;
