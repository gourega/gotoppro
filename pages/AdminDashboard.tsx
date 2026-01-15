
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllUsers, 
  deleteUserProfile, 
  grantModuleAccess, 
  saveUserProfile,
  updateUserProfile
} from '../services/supabase';
import { TRAINING_CATALOG, BADGES, COACH_KITA_PHONE } from '../constants';
import { UserProfile } from '../types';
import { 
  Loader2, 
  RefreshCcw, 
  Users, 
  Clock, 
  Banknote, 
  Search, 
  Trash2, 
  MessageCircle, 
  Filter,
  TrendingUp,
  ChevronRight,
  X,
  ShieldAlert,
  Gift,
  Coins,
  UserPlus,
  ShieldCheck,
  Plus,
  UserX,
  UserCheck,
  Zap,
  Award,
  Crown,
  Handshake,
  CheckCircle,
  Medal,
  Star,
  Trophy,
  Gem,
  LayoutDashboard,
  Activity,
  ArrowUpRight,
  AlertCircle,
  Package,
  Wifi,
  SearchCode,
  ShoppingCart,
  Cloud,
  Lock,
  Edit2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'inbox' | 'pending' | 'active' | 'admins'>('inbox');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // États pour modification PIN
  const [editingPin, setEditingPin] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.isAdmin) {
      fetchUsers();
    } else if (currentUser && !currentUser.isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      showNotification("Erreur de synchronisation Cloud", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!selectedUser || newPinValue.length !== 4) return;
    setProcessingId('pin');
    try {
      await updateUserProfile(selectedUser.uid, { pinCode: newPinValue });
      showNotification(`Code PIN mis à jour : ${newPinValue}`);
      await fetchUsers();
      setSelectedUser({ ...selectedUser, pinCode: newPinValue });
      setEditingPin(false);
    } catch (err) {
      showNotification("Erreur mise à jour PIN", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (user: UserProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (user.uid === currentUser?.uid) return showNotification("Action impossible sur soi-même", "error");
    
    setProcessingId(user.uid);
    try {
      await updateUserProfile(user.uid, { isActive: !user.isActive });
      showNotification(user.isActive ? "Accès suspendu avec succès" : "Accès gérant réactivé");
      await fetchUsers();
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, isActive: !user.isActive });
      }
    } catch (err) {
      showNotification("Erreur de communication serveur", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!user) return;
    if (user.uid === currentUser?.uid) return showNotification("Vous ne pouvez pas vous supprimer vous-même", "error");
    
    const confirmDelete = window.confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement le profil de ${user.firstName} ${user.lastName} ?\n\nCette action supprimera ses formations achetées, ses certificats et ses données de caisse. C'est irréversible.`);
    
    if (!confirmDelete) return;

    setProcessingId('delete');
    try {
      await deleteUserProfile(user.uid);
      showNotification("Profil gérant supprimé avec succès");
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      showNotification(`Erreur lors de la suppression : ${err.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivatePack = async (packType: 'ELITE' | 'PERFORMANCE' | 'STOCK' | 'INDIVIDUAL' | 'CLOUD') => {
    if (!selectedUser) return;
    setProcessingId(packType);
    try {
      const updates: Partial<UserProfile> = { isActive: true };
      
      if (packType === 'ELITE') {
        updates.isKitaPremium = true;
        const allIds = TRAINING_CATALOG.map(m => m.id);
        updates.purchasedModuleIds = [...new Set([...(selectedUser.purchasedModuleIds || []), ...allIds])];
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => id !== 'REQUEST_ELITE');
        updates.attempts = { ...(selectedUser.attempts || {}) };
        allIds.forEach(id => { updates.attempts![id] = 0; });

      } else if (packType === 'PERFORMANCE') {
        updates.hasPerformancePack = true;
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => id !== 'REQUEST_PERFORMANCE');
      } else if (packType === 'STOCK') {
        updates.hasStockPack = true;
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => id !== 'REQUEST_STOCK');
      } else if (packType === 'CLOUD') {
        const currentEnd = selectedUser.kitaPremiumUntil ? new Date(selectedUser.kitaPremiumUntil) : new Date();
        const baseDate = currentEnd > new Date() ? currentEnd : new Date();
        const newEnd = new Date(baseDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        updates.kitaPremiumUntil = newEnd.toISOString();
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => id !== 'REQUEST_CLOUD');
      } else if (packType === 'INDIVIDUAL') {
        const modulesToGrant = (selectedUser.pendingModuleIds || []).filter(id => id.startsWith('mod_'));
        updates.purchasedModuleIds = [...new Set([...(selectedUser.purchasedModuleIds || []), ...modulesToGrant])];
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => !id.startsWith('mod_'));
        updates.attempts = { ...(selectedUser.attempts || {}) };
        modulesToGrant.forEach(id => { updates.attempts![id] = 0; });
      }

      await updateUserProfile(selectedUser.uid, updates);
      showNotification(`Accès validé avec succès !`);
      await fetchUsers();
      setSelectedUser(prev => prev ? { ...prev, ...updates } as any : null);
    } catch (err) {
      showNotification("Erreur lors de l'activation", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const calculateUserValue = (user: UserProfile) => {
    let total = 0;
    if (user.isKitaPremium) total += 10000;
    if (user.hasPerformancePack) total += 5000;
    if (user.hasStockPack) total += 5000;
    if (!user.isKitaPremium) {
      const count = (user.purchasedModuleIds || []).length;
      total += count * 500;
    }
    return total;
  };

  const stats = useMemo(() => {
    const clients = users.filter(u => !u.isAdmin);
    const pending = clients.filter(u => u.pendingModuleIds && u.pendingModuleIds.length > 0);
    return { 
      total: clients.length, 
      active: clients.filter(u => u.isActive).length,
      pending: pending.length,
      revenue: clients.reduce((acc, u) => acc + calculateUserValue(u), 0)
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const isSearching = searchTerm.trim().length > 0;
    const baseInboxUsers = users.filter(u => u.isAdmin || (u.pendingModuleIds && u.pendingModuleIds.length > 0));
    const sourceSet = isSearching ? users : baseInboxUsers;

    return sourceSet.filter(u => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (u.phoneNumber || '').includes(search) || 
        (u.firstName || '').toLowerCase().includes(search) || 
        (u.lastName || '').toLowerCase().includes(search) ||
        (u.establishmentName || '').toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
      
      if (viewMode === 'admins') return u.isAdmin;
      if (viewMode === 'pending') return !u.isAdmin && u.pendingModuleIds && u.pendingModuleIds.length > 0;
      if (viewMode === 'active') return !u.isAdmin && u.isActive;
      
      return true;
    });
  }, [users, searchTerm, viewMode]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-brand-500/30">
      {notification && (
        <div className={`fixed top-8 right-8 z-[200] px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 ${
          notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-xs uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      <div className="fixed inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-500 via-emerald-500 to-amber-500 opacity-20"></div>

      <div className="max-w-[1600px] mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
          <div>
            <div className="flex items-center gap-4 text-brand-500 font-black text-[10px] uppercase tracking-[0.6em] mb-4">
               <Activity className="w-4 h-4 animate-pulse" />
               Live Operations — Global HQ
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter">
              Console de <span className="text-brand-500 italic">Direction</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchUsers} 
              disabled={loading} 
              className="bg-white/5 border border-white/10 p-5 rounded-[2rem] hover:bg-white/10 transition-all group active:scale-95"
              title="Rafraîchir les données"
            >
              <RefreshCcw className={`w-6 h-6 text-slate-400 group-hover:text-white transition-all ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-[2rem] flex items-center gap-4">
               <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></div>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Système Opérationnel</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard title="Gérants Inscrits" value={stats.total} icon={<Users />} color="text-blue-400" sub="Total Network" />
          <StatCard title="Gérants Actifs" value={stats.active} icon={<ShieldCheck />} color="text-emerald-400" sub={`${Math.round((stats.active/stats.total)*100)}% Retention`} />
          <StatCard title="Attente Paiement" value={stats.pending} icon={<Clock />} color="text-amber-400" sub="Urgent Actions" highlight={stats.pending > 0} />
          <StatCard title="Recettes Totales" value={`${stats.revenue.toLocaleString()} F`} icon={<Banknote />} color="text-brand-500" sub="Revenue to date" />
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-10">
            <div className="relative w-full xl:max-w-2xl">
              <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchTerm ? 'text-brand-500' : 'text-slate-500'}`} />
              <input 
                type="text" 
                placeholder="Rechercher partout (Radar Global)..."
                className={`w-full pl-16 pr-8 py-6 rounded-[2rem] border outline-none focus:ring-2 transition-all font-medium ${
                  searchTerm 
                  ? 'bg-brand-500/5 border-brand-500/30 text-white focus:ring-brand-500/40' 
                  : 'bg-white/5 border-white/10 text-slate-300 focus:ring-brand-500/20 placeholder-slate-600'
                }`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-brand-500/5 p-1.5 rounded-[2rem] border border-white/10 shrink-0">
              <NavTab active={viewMode === 'inbox'} onClick={() => setViewMode('inbox')} label="Opérations" count={stats.pending + users.filter(u => u.isAdmin).length} />
              <NavTab active={viewMode === 'pending'} onClick={() => setViewMode('pending')} label="En attente" count={stats.pending} isUrgent={stats.pending > 0} />
              <NavTab active={viewMode === 'active'} onClick={() => setViewMode('active')} label="Gérants" />
              <NavTab active={viewMode === 'admins'} onClick={() => setViewMode('admins')} label="Équipe" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gérant & Établissement</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Engagement</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valeur</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cloud</th>
                  <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? filteredUsers.map(u => {
                  const cloudActive = u.isKitaPremium || (u.kitaPremiumUntil && new Date(u.kitaPremiumUntil) > new Date());
                  return (
                    <tr 
                      key={u.uid} 
                      onClick={() => { setSelectedUser(u); setEditingPin(false); setNewPinValue(u.pinCode || ''); }}
                      className={`group hover:bg-white/[0.04] transition-all cursor-pointer ${u.pendingModuleIds && u.pendingModuleIds.length > 0 ? 'bg-amber-500/[0.02]' : ''}`}
                    >
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-6">
                          <div className={`h-16 w-16 rounded-[1.5rem] border border-white/10 flex items-center justify-center font-black text-xl overflow-hidden relative shadow-inner ${u.isAdmin ? 'bg-brand-900 text-brand-500 border-brand-500/30' : 'bg-slate-800 text-slate-500'}`}>
                            {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"/> : (u.firstName?.[0] || 'U')}
                            {u.isActive && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#020617]"></div>}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-serif font-bold text-white text-xl group-hover:text-brand-400 transition-colors">{u.firstName} {u.lastName}</p>
                              {u.isAdmin && <ShieldAlert className="w-4 h-4 text-brand-500" />}
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{u.establishmentName || 'SALON INDÉPENDANT'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-wrap gap-2">
                          {u.isKitaPremium ? <Badge text="ELITE" color="amber" /> : u.purchasedModuleIds?.length > 0 ? <Badge text={`${u.purchasedModuleIds.length} MODULES`} color="blue" /> : <Badge text="NOUVEAU" color="slate" />}
                          {u.pendingModuleIds?.some(id => id.startsWith('mod_')) && <Badge text="PANIER INDIVIDUEL" color="blue" animate />}
                          {u.pendingModuleIds?.includes('REQUEST_ELITE') && <Badge text="ATTENTE ELITE" color="amber" animate />}
                          {u.pendingModuleIds?.includes('REQUEST_PERFORMANCE') && <Badge text="ATTENTE PERF" color="emerald" animate />}
                          {u.pendingModuleIds?.includes('REQUEST_STOCK') && <Badge text="ATTENTE STOCK" color="sky" animate />}
                          {u.pendingModuleIds?.includes('REQUEST_CLOUD') && <Badge text="PASS CLOUD" color="blue" animate />}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className="font-mono font-bold text-lg text-white">{calculateUserValue(u).toLocaleString()} F</span>
                      </td>
                      <td className="px-8 py-8">
                         <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${cloudActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {cloudActive ? 'Cloud OK' : 'Cloud Expire'}
                         </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <div className="flex justify-end items-center gap-3">
                           <button className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                             <ChevronRight className="w-5 h-5" />
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="h-24 w-24 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center animate-pulse">
                           <Wifi className="w-10 h-10 text-slate-700" />
                        </div>
                        <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Aucun gérant ne nécessite d'action urgente</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-[#0f172a] h-full shadow-[-20px_0_60px_rgba(0,0,0,0.5)] border-l border-white/10 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
            
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-6">
                <div className={`h-20 w-20 rounded-[2rem] overflow-hidden flex items-center justify-center font-black text-3xl shadow-2xl border-2 ${selectedUser.isAdmin ? 'bg-brand-900 border-brand-500/50' : 'bg-slate-800 border-white/10'}`}>
                  {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover"/> : selectedUser.firstName?.[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-4">
                    {selectedUser.firstName} {selectedUser.lastName}
                    {selectedUser.isAdmin && <Badge text="EQUIPE DIRECTION" color="blue" />}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{selectedUser.phoneNumber}</p>
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SALON: {selectedUser.establishmentName || 'INCONNU'}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-5 bg-white/5 rounded-[1.5rem] hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 transition-all active:scale-90"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-12 space-y-12 flex-grow">
              {/* SECTION SÉCURITÉ & PIN */}
              <div className="bg-indigo-500/10 rounded-[3rem] p-10 border border-indigo-500/30">
                 <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                    <Lock className="w-5 h-5" /> Sécurité & Accès
                 </h3>
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Code PIN Actuel</p>
                       {editingPin ? (
                          <div className="flex items-center gap-4">
                             <input 
                              type="text" 
                              maxLength={4} 
                              value={newPinValue} 
                              onChange={e => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                              className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black text-white w-24 tracking-[0.2em]"
                             />
                             <button onClick={handleUpdatePin} disabled={processingId === 'pin' || newPinValue.length !== 4} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 transition-all">
                                {processingId === 'pin' ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                             </button>
                             <button onClick={() => setEditingPin(false)} className="text-slate-500 hover:text-white p-3"><X /></button>
                          </div>
                       ) : (
                          <div className="flex items-center gap-6">
                             <p className="text-4xl font-black text-white tracking-widest">{selectedUser.pinCode || '1234'}</p>
                             <button onClick={() => setEditingPin(true)} className="p-3 bg-white/5 rounded-xl text-indigo-400 hover:bg-white/10 transition-all">
                                <Edit2 className="w-4 h-4" />
                             </button>
                          </div>
                       )}
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 max-w-xs">
                       <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                         "Communiquez ce code au gérant pour qu'il puisse se connecter. Recommandé : demandez-lui de le garder secret."
                       </p>
                    </div>
                 </div>
              </div>

              {(selectedUser.pendingModuleIds && selectedUser.pendingModuleIds.length > 0) && (
                <div className="bg-amber-500/10 rounded-[3rem] p-10 border border-amber-500/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><ShoppingCart className="w-24 h-24 text-amber-500" /></div>
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="h-14 w-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl animate-pulse">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Panier à Valider</h3>
                      <p className="text-amber-400/70 text-sm font-medium">Le gérant attend l'activation de son paiement Wave.</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 relative z-10">
                    {selectedUser.pendingModuleIds.map(id => {
                      const mod = TRAINING_CATALOG.find(m => m.id === id);
                      const isPackRequest = id.startsWith('REQUEST_');
                      return (
                        <div key={id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                           <span className="text-xs font-bold text-white">{isPackRequest ? id.replace('REQUEST_', 'PACK ') : (mod?.title || id)}</span>
                           <span className="text-[10px] font-black text-amber-500">{isPackRequest ? 'PROMO' : '500 F'}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                    {selectedUser.pendingModuleIds.includes('REQUEST_ELITE') && (
                      <ActionBtn onClick={() => handleActivatePack('ELITE')} loading={processingId === 'ELITE'} icon={<Crown />} label="Activer Elite" price="10.000 F" color="amber" />
                    )}
                    {selectedUser.pendingModuleIds.some(id => id.startsWith('mod_')) && (
                      <ActionBtn onClick={() => handleActivatePack('INDIVIDUAL')} loading={processingId === 'INDIVIDUAL'} icon={<CheckCircle />} label="Activer Panier" price="Modules unitaires" color="blue" />
                    )}
                    {selectedUser.pendingModuleIds.includes('REQUEST_PERFORMANCE') && (
                      <ActionBtn onClick={() => handleActivatePack('PERFORMANCE')} loading={processingId === 'PERFORMANCE'} icon={<Gem />} label="Activer Perf+" price="5.000 F" color="emerald" />
                    )}
                    {selectedUser.pendingModuleIds.includes('REQUEST_STOCK') && (
                      <ActionBtn onClick={() => handleActivatePack('STOCK')} loading={processingId === 'STOCK'} icon={<Package />} label="Activer Stock" price="5.000 F" color="sky" />
                    )}
                    {selectedUser.pendingModuleIds.includes('REQUEST_CLOUD') && (
                      <ActionBtn onClick={() => handleActivatePack('CLOUD')} loading={processingId === 'CLOUD'} icon={<Cloud />} label="Prolonger Cloud" price="1.000 F (30j)" color="blue" />
                    )}
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-10">
                <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5">
                   <h3 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                      <Cloud className="w-5 h-5" /> Maintenance Cloud
                   </h3>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Statut Protection</span>
                         <span className={`text-[10px] font-black uppercase ${selectedUser.isKitaPremium || (selectedUser.kitaPremiumUntil && new Date(selectedUser.kitaPremiumUntil) > new Date()) ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {selectedUser.isKitaPremium ? 'Elite (Illimité)' : (selectedUser.kitaPremiumUntil ? `Expire le ${new Date(selectedUser.kitaPremiumUntil).toLocaleDateString()}` : 'Non protégé')}
                         </span>
                      </div>
                      {!selectedUser.isKitaPremium && (
                        <button 
                          onClick={() => handleActivatePack('CLOUD')}
                          disabled={!!processingId}
                          className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3 h-3" /> Ajouter +30 jours (Maintenance)
                        </button>
                      )}
                   </div>
                </div>

                <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5">
                   <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                      <Award className="w-5 h-5" /> Influence Network
                   </h3>
                   <div className="flex items-end gap-4 mb-8">
                      <p className="text-5xl font-black text-white">{selectedUser.referralCount || 0}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Parrainages</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-8 mt-auto">
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <button 
                  onClick={() => handleToggleStatus(selectedUser)}
                  disabled={selectedUser.uid === currentUser?.uid}
                  className={`flex-grow md:flex-grow-0 px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                    selectedUser.isActive ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/20'
                  } disabled:opacity-30`}
                 >
                    {selectedUser.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    {selectedUser.isActive ? 'Suspendre Gérant' : 'Activer Gérant'}
                 </button>
                 
                 {currentUser?.role === 'SUPER_ADMIN' && (
                   <button 
                     onClick={() => handleDeleteUser(selectedUser)}
                     disabled={processingId === 'delete'}
                     className="p-5 bg-rose-500/10 text-rose-500 rounded-[1.5rem] hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                     title="Supprimer définitivement"
                   >
                      {processingId === 'delete' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                   </button>
                 )}
               </div>

               <div className="flex items-center gap-4 w-full md:w-auto">
                 <a 
                   href={`https://wa.me/${selectedUser.phoneNumber.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour ${selectedUser.firstName}, Coach Kita ici. Vos accès sont prêts !\n\n📲 Connexion : ${selectedUser.phoneNumber}\n🔑 Code PIN : ${selectedUser.pinCode || '1234'}\n\nBienvenue dans l'Excellence.`)}`} 
                   target="_blank" rel="noreferrer" 
                   className="flex-grow md:flex-grow-0 bg-[#25D366] text-white px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#128C7E] transition-all flex items-center justify-center gap-3 shadow-xl"
                 >
                    <MessageCircle className="w-4 h-4" /> Envoyer les accès
                 </a>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, sub, highlight }: any) => (
  <div className={`bg-white/[0.03] p-8 rounded-[2.5rem] border transition-all duration-500 hover:bg-white/[0.06] ${highlight ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-white/10'}`}>
    <div className="flex justify-between items-start mb-6">
       <div className={`h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl ${color} border border-white/10 shadow-inner`}>
          {icon}
       </div>
       <ArrowUpRight className="w-4 h-4 text-slate-700" />
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{title}</p>
    <p className="text-4xl font-black text-white tracking-tight">{value}</p>
    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-4 flex items-center gap-2">
      <div className="h-1 w-1 bg-slate-700 rounded-full"></div>
      {sub}
    </div>
  </div>
);

const NavTab = ({ active, onClick, label, count, isUrgent }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 relative ${
      active ? 'bg-brand-500 text-white shadow-2xl shadow-brand-900/50' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${active ? 'bg-white/20 text-white' : isUrgent ? 'bg-amber-50 text-black' : 'bg-white/10 text-slate-400'}`}>
        {count}
      </span>
    )}
  </button>
);

const Badge = ({ text, color, animate }: any) => {
  const colors: any = {
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    blue: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    slate: 'bg-slate-500/10 text-slate-500 border-white/5'
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${colors[color]} ${animate ? 'animate-pulse' : ''}`}>
      {text}
    </span>
  );
};

const ActionBtn = ({ onClick, loading, icon, label, price, color }: any) => {
  const colors: any = {
    amber: 'bg-amber-500 hover:bg-amber-400 text-black',
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    sky: 'bg-sky-500 hover:bg-sky-400 text-white',
    blue: 'bg-indigo-600 hover:bg-indigo-500 text-white'
  };
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`w-full p-6 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl ${colors[color]}`}
    >
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : React.cloneElement(icon, { className: "w-6 h-6" })}
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[9px] font-bold opacity-70">{price}</p>
      </div>
    </button>
  );
};

export default AdminDashboard;
