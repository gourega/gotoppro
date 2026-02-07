
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
  generateUUID,
  getAllAnnouncementsAdmin,
  updateAnnouncementStatus,
  deleteAnnouncement
} from '../services/supabase';
import { UserProfile, UserRole, KitaAnnouncement } from '../types';
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
  ShieldCheck,
  Handshake,
  UserPlus,
  Share2,
  Trash2,
  ShieldX,
  Rocket,
  ShieldAlert,
  Coins,
  Settings2,
  Megaphone,
  Eye,
  Plus,
  Minus
} from 'lucide-react';

const COMMISSION_PER_ELITE = 1500;

const AdminDashboard: React.FC = () => {
  const { user: currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<KitaAnnouncement[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'inbox' | 'active' | 'partners' | 'admins' | 'ads'>('inbox');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [tempAdminNotes, setTempAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Partner Recruitment State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState({ firstName: '', lastName: '', whatsapp: '' });
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);

  // Admin Creation State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ firstName: '', lastName: '', email: '', whatsapp: '', pin: '0000' });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // User Edit State (Drawer)
  const [tempRole, setTempRole] = useState<UserRole>('CLIENT');
  const [tempCredits, setTempCredits] = useState(0);
  const [tempAdCredits, setTempAdCredits] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [allUsers, allAds] = await Promise.all([
        getAllUsers(),
        getAllAnnouncementsAdmin()
      ]);
      setUsers(allUsers || []);
      setAnnouncements(allAds || []);
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
      setTempRole(selectedUser.role);
      setTempCredits(selectedUser.marketingCredits || 0);
      setTempAdCredits(selectedUser.announcementCredits || 0);
    }
  }, [selectedUser]);

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
      if (existing) { showNotify("Ce numéro est déjà utilisé.", "error"); return; }
      const newPartner: any = { uid: generateUUID(), phoneNumber: cleanPhone, pinCode: '1234', firstName: partnerFormData.firstName, lastName: partnerFormData.lastName, role: 'PARTNER', isActive: true, isAdmin: false, createdAt: new Date().toISOString() };
      await saveUserProfile(newPartner);
      showNotify("Partenaire inscrit et activé !");
      setIsPartnerModalOpen(false);
      setPartnerFormData({ firstName: '', lastName: '', whatsapp: '' });
      fetchUsers();
    } catch (err: any) { showNotify(err.message || "Erreur lors de l'inscription.", "error"); }
    finally { setIsCreatingPartner(false); }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      let cleanPhone = adminFormData.whatsapp.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;
      const newAdmin: any = { uid: generateUUID(), phoneNumber: cleanPhone, pinCode: adminFormData.pin, email: adminFormData.email, firstName: adminFormData.firstName, lastName: adminFormData.lastName, role: 'ADMIN', isAdmin: true, isActive: true, createdAt: new Date().toISOString() };
      await saveUserProfile(newAdmin);
      showNotify("Nouvel Administrateur créé !");
      setIsAdminModalOpen(false);
      setAdminFormData({ firstName: '', lastName: '', email: '', whatsapp: '', pin: '0000' });
      fetchUsers();
    } catch (err: any) { showNotify("Erreur lors de la création de l'admin.", "error"); }
    finally { setIsCreatingAdmin(false); }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedUser) return;
    setIsSavingNotes(true);
    try {
      await updateUserProfile(selectedUser.uid, { 
        adminNotes: tempAdminNotes, 
        role: tempRole, 
        marketingCredits: tempCredits, 
        announcementCredits: tempAdCredits,
        isAdmin: tempRole === 'ADMIN' || tempRole === 'SUPER_ADMIN' 
      });
      showNotify("Profil mis à jour avec succès");
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

  const handleActivateAd = async (id: string) => {
    try {
      await updateAnnouncementStatus(id, 'ACTIVE');
      showNotify("Annonce activée !");
      fetchUsers();
    } catch (e) { showNotify("Erreur", "error"); }
  };

  const filteredUsers = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (s) return users.filter(u => u.role !== 'SUPER_ADMIN' && (`${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || (u.establishmentName || '').toLowerCase().includes(s) || u.phoneNumber.includes(s)));
    if (viewMode === 'inbox') return users.filter(u => !u.isActive && u.role !== 'PARTNER' && u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN');
    if (viewMode === 'active') return users.filter(u => u.isActive && (u.role === 'CLIENT' || u.role === 'STAFF_ELITE'));
    if (viewMode === 'partners') return users.filter(u => u.role === 'PARTNER');
    if (viewMode === 'admins') return users.filter(u => u.role === 'ADMIN');
    return users.filter(u => u.role !== 'SUPER_ADMIN');
  }, [users, searchTerm, viewMode]);

  const stats = useMemo(() => {
    const clients = users.filter(u => u.role === 'CLIENT' || u.role === 'STAFF_ELITE');
    return { 
      total: clients.length, 
      active: clients.filter(u => u.isActive).length, 
      pending: clients.filter(c => !c.isActive).length, 
      partnerCount: users.filter(u => u.role === 'PARTNER').length, 
      adminCount: users.filter(u => u.role === 'ADMIN').length, 
      pendingAds: announcements.filter(a => a.status === 'PENDING').length 
    };
  }, [users, announcements]);

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
          <div><h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 tracking-tighter leading-none">Console de <span className="text-brand-600 italic">Direction</span></h1></div>
          <div className="flex flex-wrap gap-4 items-center">
            <button onClick={() => navigate('/war-room')} className="bg-brand-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-3"><Rocket className="w-4 h-4 text-amber-500" /> War Room</button>
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-white border-2 border-brand-900 text-brand-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-50 transition-all shadow-sm flex items-center gap-3"><ShieldAlert className="w-4 h-4" /> Créer Admin</button>
            <button onClick={() => setIsPartnerModalOpen(true)} className="bg-amber-500 text-brand-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl flex items-center gap-3"><Handshake className="w-4 h-4" /> Recruter Partenaire</button>
            <button onClick={fetchUsers} className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 shadow-sm"><RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
           <AdminStatCard icon={<Users />} label="Gérants" val={stats.total} />
           <AdminStatCard icon={<Clock />} label="En attente" val={stats.pending} color="text-amber-500" />
           <AdminStatCard icon={<Megaphone />} label="Annonces" val={stats.pendingAds} color="text-brand-600" sub="À Valider" />
           <AdminStatCard icon={<Handshake />} label="Partenaires" val={stats.partnerCount} color="text-amber-600" />
           <AdminStatCard icon={<ShieldCheck />} label="Admins" val={stats.adminCount} color="text-brand-600" />
        </section>

        <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8">
            <div className="relative w-full xl:max-w-xl">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input type="text" placeholder="Recherche..." className="w-full pl-20 pr-8 py-6 rounded-3xl border-none bg-slate-50 outline-none font-medium text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex bg-slate-100 p-2 rounded-3xl border">
              <button onClick={() => setViewMode('inbox')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'inbox' ? 'bg-brand-900 text-white shadow-lg' : 'text-slate-500'}`}>Inscriptions</button>
              <button onClick={() => setViewMode('ads')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ads' ? 'bg-amber-500 text-brand-900 shadow-lg' : 'text-slate-500'}`}>Annonces ({stats.pendingAds})</button>
              <button onClick={() => setViewMode('active')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'active' ? 'bg-brand-900 text-white shadow-lg' : 'text-slate-500'}`}>Actifs</button>
              <button onClick={() => setViewMode('partners')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'partners' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500'}`}>Partenaires</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {viewMode === 'ads' ? (
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50"><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Annonceur</th><th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenu</th><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Validation</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {announcements.filter(a => a.status === 'PENDING').map(ad => (
                    <tr key={ad.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-12 py-8">
                         <p className="font-bold text-slate-900">{ad.establishmentName}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase">{ad.contactPhone}</p>
                      </td>
                      <td className="px-8 py-8">
                         <div className="max-w-md">
                           <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">{ad.type}</span>
                           <p className="font-bold text-sm mt-1">{ad.title}</p>
                           <p className="text-[10px] text-slate-400 line-clamp-1">{ad.description}</p>
                         </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <div className="flex justify-end gap-3">
                           <button onClick={() => handleActivateAd(ad.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Valider (Payé)</button>
                           <button onClick={() => deleteAnnouncement(ad.id).then(fetchUsers)} className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl font-black text-[9px] uppercase">Rejeter</button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {announcements.filter(a => a.status === 'PENDING').length === 0 && (
                    <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">"Aucune annonce en attente de paiement."</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50"><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th><th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôle & Statut</th><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => setSelectedUser(u)}>
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white shrink-0 bg-slate-200 text-slate-400 overflow-hidden`}>{u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" alt="" /> : u.firstName?.[0]}</div>
                          <div><p className="font-bold text-slate-900 text-xl">{u.firstName} {u.lastName}</p><p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{u.establishmentName || (u.role === 'PARTNER' ? 'Partenaire Stratégique' : 'Gérant Indépendant')} • {u.phoneNumber}</p></div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === 'PARTNER' ? 'text-amber-600' : u.role === 'ADMIN' ? 'text-indigo-600' : 'text-slate-600'}`}>{u.role} — {u.isActive ? 'Actif' : 'En attente'}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-12 py-8 text-right"><button className="p-4 bg-slate-100 rounded-2xl text-slate-300 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all"><ChevronRight className="w-5 h-5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* DRAWER PILOTAGE */}
      {selectedUser && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-10 md:p-14 overflow-y-auto animate-in slide-in-from-right flex flex-col custom-scrollbar">
            <div className="flex justify-between items-center mb-12">
               <div><h2 className="text-3xl font-serif font-bold text-slate-900">Cockpit Mentor</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID : {selectedUser.uid.substring(0,8)}</p></div>
               <button onClick={() => setSelectedUser(null)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 transition-colors shadow-sm"><X /></button>
            </div>
            <div className="space-y-12 pb-20">
               <div className="p-12 bg-slate-50 rounded-[4rem] border border-slate-100 text-center shadow-inner">
                  <div className="h-32 w-32 rounded-[2.5rem] mx-auto mb-8 bg-white shadow-2xl flex items-center justify-center font-black text-5xl text-slate-200 overflow-hidden border-8 border-white">{selectedUser.photoURL ? <img src={selectedUser.photoURL} className="w-full h-full object-cover" alt="" /> : selectedUser.firstName?.[0]}</div>
                  <h3 className="text-3xl font-bold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
               </div>
               
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 flex items-center gap-2"><Settings2 className="w-3 h-3" /> Configuration Technique</h4>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                     <div>
                       <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2">Rôle</label>
                       <select value={tempRole} onChange={(e) => setTempRole(e.target.value as UserRole)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold outline-none"><option value="CLIENT">Gérant (Client)</option><option value="STAFF_ELITE">Staff Élite</option><option value="ADMIN">Administrateur</option><option value="PARTNER">Partenaire Stratégique</option></select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2">Crédits Marketing IA</label>
                           <div className="flex items-center gap-3">
                              <button onClick={() => setTempCredits(Math.max(0, tempCredits - 1))} className="p-2 bg-white rounded-lg border shadow-sm"><Minus className="w-4 h-4" /></button>
                              <span className="text-xl font-black">{tempCredits}</span>
                              <button onClick={() => setTempCredits(tempCredits + 1)} className="p-2 bg-white rounded-lg border shadow-sm"><Plus className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[9px] font-black text-brand-600 uppercase mb-2 ml-2">Crédits Annonces</label>
                           <div className="flex items-center gap-3">
                              <button onClick={() => setTempAdCredits(Math.max(0, tempAdCredits - 1))} className="p-2 bg-white rounded-lg border shadow-sm"><Minus className="w-4 h-4" /></button>
                              <span className="text-xl font-black text-brand-900">{tempAdCredits}</span>
                              <button onClick={() => setTempAdCredits(tempAdCredits + 1)} className="p-2 bg-white rounded-lg border shadow-sm"><Plus className="w-4 h-4" /></button>
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2">Notes Mentor</label>
                        <textarea value={tempAdminNotes} onChange={(e) => setTempAdminNotes(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-medium text-sm min-h-[100px]" placeholder="Observations privées..." />
                     </div>
                     <button onClick={handleSaveAdminNotes} disabled={isSavingNotes} className="w-full py-4 rounded-xl bg-brand-900 text-white font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-lg">{isSavingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer les modifications</button>
                  </div>

                  <div className="space-y-4">
                    {!selectedUser.isActive ? <button onClick={() => handleActivateUser(selectedUser)} className="w-full py-6 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all"><CheckCircle2 className="w-5 h-5" /> Activer le compte</button> : <button onClick={() => handleSuspendUser(selectedUser)} className="w-full py-6 rounded-2xl bg-amber-500 text-brand-900 font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3 hover:bg-amber-600 transition-all"><ShieldX className="w-5 h-5" /> Suspendre l'accès</button>}
                    <button onClick={() => handleDeleteUser(selectedUser)} className="w-full py-6 rounded-2xl border-2 border-rose-500 text-rose-500 font-black uppercase text-[11px] tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3"><Trash2 className="w-5 h-5" /> Supprimer Définitivement</button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminStatCard = ({ icon, label, val, sub, color = "text-slate-900" }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 group hover:-translate-y-1 transition-all">
     <div className="flex justify-between items-start mb-6"><div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>{sub && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sub}</span>}</div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-3xl font-black tracking-tighter ${color}`}>{val}</p>
  </div>
);

export default AdminDashboard;
