import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateUserProfile,
  supabase,
  getAllUsers,
  getKitaTransactions,
  saveUserProfile,
  getProfileByPhone,
  generateUUID
} from '../services/supabase';
import { UserProfile } from '../types';
import { 
  Loader2, 
  RefreshCcw, 
  Users, 
  Clock, 
  Search, 
  ChevronRight,
  X,
  AlertCircle,
  Activity,
  CheckCircle2,
  TrendingUp,
  Zap,
  Banknote,
  Save,
  MessageCircle,
  Copy,
  Shield,
  Handshake,
  UserPlus,
  Share2,
  Trash2,
  ShieldX
} from 'lucide-react';

const COMMISSION_PER_ELITE = 1500;

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivatingAll, setIsActivatingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'inbox' | 'active' | 'partners' | 'admins'>('inbox');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [selectedUserTurnover, setSelectedUserTurnover] = useState<number>(0);
  const [tempAdminNotes, setTempAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Partner Recruitment State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState({ firstName: '', lastName: '', whatsapp: '' });
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [partnerStats, setPartnerStats] = useState({ referrals: 0, earnings: 0 });

  const fetchLogs = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('automation_logs').select('*').order('created_at', { ascending: false }).limit(6);
      if (data) setLogs(data);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers || []);
      await fetchLogs();
    } catch (err) { 
      showNotify("Erreur de connexion base de données", "error");
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers();
    } else {
      navigate('/dashboard');
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      setTempAdminNotes(selectedUser.adminNotes || '');
      if (selectedUser.role === 'PARTNER') {
        calculatePartnerStats(selectedUser.phoneNumber);
      } else {
        fetchUserFinancials(selectedUser.uid);
      }
    }
  }, [selectedUser]);

  const calculatePartnerStats = (phone: string) => {
    const referrals = users.filter(u => u.referredBy === phone);
    const elites = referrals.filter(u => u.isActive && (u.isKitaPremium || u.hasPerformancePack)).length;
    setPartnerStats({
      referrals: referrals.length,
      earnings: elites * COMMISSION_PER_ELITE
    });
  };

  const fetchUserFinancials = async (userId: string) => {
    try {
      const transactions = await getKitaTransactions(userId);
      const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
      setSelectedUserTurnover(totalIncome);
    } catch (e) {}
  };

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPartner(true);
    try {
      let cleanPhone = partnerFormData.whatsapp.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;

      const existing = await getProfileByPhone(cleanPhone);
      if (existing) {
        showNotify("Ce numéro est déjà utilisé.", "error");
        return;
      }

      const newPartner: any = {
        uid: generateUUID(),
        phoneNumber: cleanPhone,
        pinCode: '1234',
        firstName: partnerFormData.firstName,
        lastName: partnerFormData.lastName,
        role: 'PARTNER',
        isActive: true, 
        isAdmin: false,
        createdAt: new Date().toISOString()
      };

      // Utilisation de saveUserProfile qui détecte désormais la table 'partners' via le rôle
      await saveUserProfile(newPartner);
      showNotify("Partenaire inscrit dans la table dédiée !");
      setIsPartnerModalOpen(false);
      setPartnerFormData({ firstName: '', lastName: '', whatsapp: '' });
      fetchUsers();
    } catch (err) {
      showNotify("Erreur lors de l'inscription.", "error");
    } finally {
      setIsCreatingPartner(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedUser) return;
    setIsSavingNotes(true);
    try {
      await updateUserProfile(selectedUser.uid, { adminNotes: tempAdminNotes, role: selectedUser.role });
      showNotify("Notes enregistrées");
      fetchUsers();
    } catch (err) { showNotify("Erreur sauvegarde", "error"); }
    finally { setIsSavingNotes(false); }
  };

  const handleActivateUser = async (u: UserProfile) => {
    try {
      await updateUserProfile(u.uid, { isActive: true, role: u.role });
      showNotify("Compte activé !");
      fetchUsers();
      setSelectedUser({ ...u, isActive: true });
    } catch (err) { showNotify("Erreur activation", "error"); }
  };

  const handleSuspendUser = async (u: UserProfile) => {
    if (!window.confirm(`Suspendre ${u.firstName} ?`)) return;
    try {
      await updateUserProfile(u.uid, { isActive: false, role: u.role });
      showNotify("Accès suspendu.");
      fetchUsers();
      setSelectedUser({ ...u, isActive: false });
    } catch (err) { showNotify("Erreur suspension", "error"); }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (!window.confirm(`Supprimer définitivement ${u.firstName} ?`)) return;
    try {
      const table = u.role === 'PARTNER' ? 'partners' : 'profiles';
      const { error } = await supabase!.from(table).delete().eq('uid', u.uid);
      if (error) throw error;
      showNotify("Supprimé.");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) { showNotify("Erreur suppression", "error"); }
  };

  const handleActivateAll = async () => {
    if (!supabase || isActivatingAll) return;
    const pendingUsers = users.filter(u => !u.isActive && u.role !== 'SUPER_ADMIN' && u.role !== 'PARTNER');
    if (pendingUsers.length === 0) return;
    if (!window.confirm(`Activer les ${pendingUsers.length} gérants ?`)) return;

    setIsActivatingAll(true);
    try {
      const { error } = await supabase.from('profiles').update({ isActive: true }).eq('isActive', false).neq('role', 'SUPER_ADMIN');
      if (error) throw error;
      showNotify(`${pendingUsers.length} gérants activés !`);
      fetchUsers();
    } catch (err) { showNotify("Erreur groupée.", "error"); }
    finally { setIsActivatingAll(false); }
  };

  const filteredUsers = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (s) return users.filter(u => u.role !== 'SUPER_ADMIN' && (`${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || (u.establishmentName || '').toLowerCase().includes(s) || u.phoneNumber.includes(s)));
    if (viewMode === 'inbox') return users.filter(u => !u.isActive && u.role !== 'PARTNER' && u.role !== 'SUPER_ADMIN');
    if (viewMode === 'active') return users.filter(u => u.isActive && u.role !== 'PARTNER' && u.role !== 'SUPER_ADMIN');
    if (viewMode === 'partners') return users.filter(u => u.role === 'PARTNER');
    return users.filter(u => u.role !== 'SUPER_ADMIN');
  }, [users, searchTerm, viewMode]);

  const stats = useMemo(() => {
    const clients = users.filter(u => u.role === 'CLIENT' || u.role === 'STAFF_ELITE');
    return { 
      total: clients.length, 
      active: clients.filter(u => u.isActive).length, 
      pending: clients.filter(c => !c.isActive).length, 
      partnerCount: users.filter(u => u.role === 'PARTNER').length
    };
  }, [users]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotify("Copié !");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      {notification && (
        <div className={`fixed top-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-black text-[10px] uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 tracking-tighter leading-none">Console de <span className="text-brand-600 italic">Direction</span></h1>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <button onClick={() => setIsPartnerModalOpen(true)} className="bg-amber-500 text-brand-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl flex items-center gap-3"><Handshake className="w-4 h-4" /> Recruter Partenaire</button>
            {stats.pending > 0 && (
              <button onClick={handleActivateAll} disabled={isActivatingAll} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                {isActivatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Activer {stats.pending} gérants
              </button>
            )}
            <button onClick={fetchUsers} className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 shadow-sm"><RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <AdminStatCard icon={<Users />} label="Gérants" val={stats.total} />
           <AdminStatCard icon={<Clock />} label="En attente" val={stats.pending} color="text-amber-500" />
           <AdminStatCard icon={<Handshake />} label="Partenaires" val={stats.partnerCount} sub="Table Dédiée" color="text-amber-600" />
           <AdminStatCard icon={<TrendingUp />} label="Recettes Est." val={`${(stats.active * 10000).toLocaleString()} F`} />
        </section>

        <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8">
            <div className="relative w-full xl:max-w-xl">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input type="text" placeholder="Recherche..." className="w-full pl-20 pr-8 py-6 rounded-3xl border-none bg-slate-50 outline-none font-medium text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex bg-slate-100 p-2 rounded-3xl border">
              <button onClick={() => setViewMode('inbox')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'inbox' ? 'bg-brand-900 text-white shadow-lg' : 'text-slate-500'}`}>Demandes</button>
              <button onClick={() => setViewMode('active')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'active' ? 'bg-brand-900 text-white shadow-lg' : 'text-slate-500'}`}>Actifs</button>
              <button onClick={() => setViewMode('partners')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'partners' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500'}`}>Partenaires</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50"><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th><th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôle & Statut</th><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => setSelectedUser(u)}>
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white shrink-0 bg-slate-200 text-slate-400 overflow-hidden`}>
                          {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : u.firstName?.[0]}
                        </div>
                        <div><p className="font-bold text-slate-900 text-xl">{u.firstName} {u.lastName}</p><p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{u.establishmentName || (u.role === 'PARTNER' ? 'Partenaire' : 'Indépendant')} • {u.phoneNumber}</p></div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === 'PARTNER' ? 'text-amber-600' : 'text-slate-600'}`}>{u.role} — {u.isActive ? 'Actif' : 'En attente'}</span>
                          </div>
                          {u.referredBy && <div className="flex items-center gap-1 text-[9px] font-bold text-brand-500"><Handshake className="w-3 h-3" /> Par {u.referredBy}</div>}
                       </div>
                    </td>
                    <td className="px-12 py-8 text-right"><button className="p-4 bg-slate-100 rounded-2xl text-slate-300 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all"><ChevronRight className="w-5 h-5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALE RECRUTEMENT PARTENAIRE */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 md:p-12 relative animate-in zoom-in-95">
              <button onClick={() => setIsPartnerModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <div className="text-center mb-10">
                 <div className="h-20 w-20 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><UserPlus className="w-10 h-10" /></div>
                 <h2 className="text-3xl font-serif font-bold text-slate-900">Nouveau Partenaire</h2>
                 <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest italic">Table 'partners' isolée</p>
              </div>
              <form onSubmit={handleCreatePartner} className="space-y-6">
                 <input type="text" placeholder="Prénom" value={partnerFormData.firstName} onChange={e => setPartnerFormData({...partnerFormData, firstName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 shadow-inner" required />
                 <input type="text" placeholder="Nom" value={partnerFormData.lastName} onChange={e => setPartnerFormData({...partnerFormData, lastName: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 shadow-inner" required />
                 <input type="tel" placeholder="WhatsApp (07...)" value={partnerFormData.whatsapp} onChange={e => setPartnerFormData({...partnerFormData, whatsapp: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 shadow-inner" required />
                 <button type="submit" disabled={isCreatingPartner} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-4 hover:bg-black transition-all">
                    {isCreatingPartner ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-amber-500" />} Inscrire le Partenaire
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* DRAWER PILOTAGE */}
      {selectedUser && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-10 md:p-14 overflow-y-auto animate-in slide-in-from-right flex flex-col custom-scrollbar">
            <div className="flex justify-between items-center mb-12">
               <div><h2 className="text-3xl font-serif font-bold text-slate-900">Cockpit Mentor</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID : {selectedUser.uid.substring(0,8)}</p></div>
               <button onClick={() => setSelectedUser(null)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm"><X /></button>
            </div>
            <div className="space-y-12 pb-20">
               <div className="p-12 bg-slate-50 rounded-[4rem] border border-slate-100 text-center relative overflow-hidden shadow-inner">
                  <div className="h-32 w-32 rounded-[2.5rem] mx-auto mb-8 bg-white shadow-2xl flex items-center justify-center font-black text-5xl text-slate-200 overflow-hidden border-8 border-white">{selectedUser.photoURL ? <img src={selectedUser.photoURL} className="w-full h-full object-cover" /> : selectedUser.firstName?.[0]}</div>
                  <h3 className="text-3xl font-bold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <div className="flex items-center justify-center gap-3 mt-4">
                     <button onClick={() => copyToClipboard(selectedUser.phoneNumber)} className="bg-white border px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-50 transition-all"><Copy className="w-3 h-3" /> {selectedUser.phoneNumber}</button>
                     <button onClick={() => window.open(`https://wa.me/${selectedUser.phoneNumber.replace(/\+/g,'')}`, '_blank')} className="bg-emerald-500 text-white p-2 rounded-xl hover:scale-110 transition-all"><MessageCircle className="w-4 h-4" /></button>
                  </div>
               </div>

               {selectedUser.role === 'PARTNER' ? (
                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-brand-900 rounded-[2.5rem] text-white shadow-xl relative group">
                           <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-3">Salons Recrutés</p>
                           <p className="text-4xl font-black text-white tracking-tighter">{partnerStats.referrals}</p>
                        </div>
                        <div className="p-8 bg-amber-50 rounded-[2.5rem] text-brand-900 shadow-xl relative group">
                           <p className="text-[9px] font-black text-amber-900/60 uppercase tracking-widest mb-3">Commissions Dues</p>
                           <p className="text-4xl font-black tracking-tighter">{partnerStats.earnings.toLocaleString()} <span className="text-sm">F</span></p>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Share2 className="w-4 h-4 text-brand-600" /> Lien de parrainage</p>
                       <div className="flex items-center gap-4">
                          <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-500 flex-grow truncate">{`${window.location.origin}/#/quiz?ref=${selectedUser.phoneNumber}`}</div>
                          <button onClick={() => copyToClipboard(`${window.location.origin}/#/quiz?ref=${selectedUser.phoneNumber}`)} className="bg-brand-900 text-white p-4 rounded-xl shadow-lg hover:scale-110 transition-all"><Copy className="w-5 h-5" /></button>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-brand-900 rounded-[2.5rem] text-white shadow-xl relative group">
                       <Banknote className="absolute -bottom-4 -right-4 w-20 h-20 opacity-10" />
                       <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-3">Chiffre d'Affaires</p>
                       <p className="text-3xl font-black text-amber-400 tracking-tighter">{selectedUserTurnover.toLocaleString()} <span className="text-sm">F</span></p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                       <Zap className="absolute -bottom-4 -right-4 w-20 h-20 opacity-5" />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Crédits Marketing</p>
                       <p className="text-3xl font-black text-slate-900 tracking-tighter">{selectedUser.marketingCredits || 0} <span className="text-sm opacity-30">PTS</span></p>
                    </div>
                 </div>
               )}

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Actions</h4>
                  <div className="space-y-4">
                    {!selectedUser.isActive ? (
                      <button onClick={() => handleActivateUser(selectedUser)} className="w-full py-6 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all"><CheckCircle2 className="w-5 h-5" /> Activer le compte</button>
                    ) : (
                      <button onClick={() => handleSuspendUser(selectedUser)} className="w-full py-6 rounded-2xl bg-amber-500 text-brand-900 font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-amber-600 transition-all"><ShieldX className="w-5 h-5" /> Suspendre l'accès</button>
                    )}
                    <button onClick={() => handleDeleteUser(selectedUser)} className="w-full py-6 rounded-2xl border-2 border-rose-500 text-rose-500 font-black uppercase text-[11px] tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3"><Trash2 className="w-5 h-5" /> Supprimer Définitivement</button>
                  </div>
               </div>

               <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Notes Mentor</h4>
                  <textarea value={tempAdminNotes} onChange={e => setTempAdminNotes(e.target.value)} className="w-full p-8 rounded-[2rem] bg-slate-50 border-none outline-none font-medium min-h-[200px]" placeholder="Note confidentielle..." />
                  <button onClick={handleSaveAdminNotes} disabled={isSavingNotes} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3">{isSavingNotes ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Sauvegarder</button>
               </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminStatCard = ({ icon, label, val, sub, color = "text-slate-900" }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 group hover:-translate-y-1 transition-all">
     <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        {sub && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sub}</span>}
     </div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-3xl font-black tracking-tighter ${color}`}>{val}</p>
  </div>
);

export default AdminDashboard;