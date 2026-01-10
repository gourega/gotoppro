
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllUsers, 
  deleteUserProfile, 
  grantModuleAccess, 
  updateQuizAttempts,
  saveUserProfile
} from '../services/supabase';
import { TRAINING_CATALOG, BADGES } from '../constants';
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
  ShoppingCart
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

  const handleToggleStatus = async (user: UserProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (user.uid === currentUser?.uid) return showNotification("Action impossible sur soi-même", "error");
    
    setProcessingId(user.uid);
    try {
      await saveUserProfile({ uid: user.uid, isActive: !user.isActive });
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

  const handleActivatePack = async (packType: 'ELITE' | 'PERFORMANCE' | 'STOCK' | 'INDIVIDUAL') => {
    if (!selectedUser) return;
    setProcessingId(packType);
    try {
      const updates: Partial<UserProfile> = { uid: selectedUser.uid, isActive: true };
      
      if (packType === 'ELITE') {
        updates.isKitaPremium = true;
        updates.purchasedModuleIds = [...new Set([...(selectedUser.purchasedModuleIds || []), ...TRAINING_CATALOG.map(m => m.id)])];
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => id !== 'REQUEST_ELITE');
      } else if (packType === 'PERFORMANCE') {
        updates.hasPerformancePack = true;
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => id !== 'REQUEST_PERFORMANCE');
      } else if (packType === 'STOCK') {
        updates.hasStockPack = true;
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => id !== 'REQUEST_STOCK');
      } else if (packType === 'INDIVIDUAL') {
        // Activation de tous les modules individuels demandés dans le panier
        const modulesToGrant = (selectedUser.pendingModuleIds || []).filter(id => id.startsWith('mod_'));
        updates.purchasedModuleIds = [...new Set([...(selectedUser.purchasedModuleIds || []), ...modulesToGrant])];
        updates.pendingModuleIds = (selectedUser.pendingModuleIds || []).filter(id => !id.startsWith('mod_'));
      }

      await saveUserProfile(updates as any);
      showNotification(`Accès validé pour ${selectedUser.firstName} !`);
      await fetchUsers();
      setSelectedUser(prev => prev ? { ...prev, ...updates } as any : null);
    } catch (err) {
      showNotification("Erreur lors de l'activation", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRewardModule = async (moduleId: string) => {
    if (!selectedUser) return;
    setProcessingId(moduleId);
    try {
      await grantModuleAccess(selectedUser.uid, moduleId);
      showNotification(`Module attribué avec succès`);
      await fetchUsers();
      setSelectedUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          purchasedModuleIds: [...new Set([...(prev.purchasedModuleIds || []), moduleId])],
          isActive: true
        };
      });
    } catch (err) {
      showNotification("Erreur d'attribution", "error");
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
      {/* Notification */}
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
        {/* Header Elite */}
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard title="Gérants Inscrits" value={stats.total} icon={<Users />} color="text-blue-400" sub="Total Network" />
          <StatCard title="Gérants Actifs" value={stats.active} icon={<ShieldCheck />} color="text-emerald-400" sub={`${Math.round((stats.active/stats.total)*100)}% Retention`} />
          <StatCard title="Attente Paiement" value={stats.pending} icon={<Clock />} color="text-amber-400" sub="Urgent Actions" highlight={stats.pending > 0} />
          <StatCard title="Recettes Totales" value={`${stats.revenue.toLocaleString()} F`} icon={<Banknote />} color="text-brand-500" sub="Revenue to date" />
        </div>

        {/* Main Interface */}
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
            <div className="flex bg-black/40 p-1.5 rounded-[2rem] border border-white/10 shrink-0">
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
                  <th className="px-8 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                  <tr 
                    key={u.uid} 
                    onClick={() => setSelectedUser(u)}
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
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="font-mono font-bold text-lg text-white">{calculateUserValue(u).toLocaleString()} F</span>
                    </td>
                    <td className="px-8 py-8">
                       <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          {u.isActive ? 'Actif' : 'Suspendu'}
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
                )) : (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="h-24 w-24 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center animate-pulse">
                           <Wifi className="w-10 h-10 text-slate-700" />
                        </div>
                        <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Inbox Zéro : Aucun gérant ne nécessite d'action urgente</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
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
              
              {/* PANIER EN ATTENTE (CORRECTION : AFFICHAGE DU CONTENU RÉEL) */}
              {(selectedUser.pendingModuleIds && selectedUser.pendingModuleIds.length > 0) && (
                <div className="bg-amber-500/10 rounded-[3rem] p-10 border border-amber-500/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><ShoppingCart className="w-24 h-24 text-amber-500" /></div>
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
                    {selectedUser.pendingModuleIds.filter(id => id.startsWith('mod_')).map(id => {
                      const mod = TRAINING_CATALOG.find(m => m.id === id);
                      return (
                        <div key={id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                           <span className="text-xs font-bold text-white">{mod?.title || id}</span>
                           <span className="text-[10px] font-black text-amber-500">500 F</span>
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
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-10">
                {/* Académie */}
                <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5">
                   <h3 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                      <Trophy className="w-5 h-5" /> État des Formations
                   </h3>
                   <div className="space-y-4">
                      {selectedUser.purchasedModuleIds?.length > 0 ? (
                        TRAINING_CATALOG.filter(m => selectedUser.purchasedModuleIds.includes(m.id)).map(mod => {
                          const score = selectedUser.progress?.[mod.id] || 0;
                          return (
                            <div key={mod.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                               <span className="text-[11px] font-bold text-white truncate max-w-[150px]">{mod.title}</span>
                               <span className={`text-[10px] font-black ${score >= 80 ? 'text-emerald-400' : 'text-slate-500'}`}>{score}%</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-10 text-center opacity-30 italic text-sm">Aucun module acheté</div>
                      )}
                   </div>
                </div>

                {/* Social */}
                <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5">
                   <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                      <Award className="w-5 h-5" /> Trophées & Influence
                   </h3>
                   <div className="flex items-end gap-4 mb-8">
                      <p className="text-5xl font-black text-white">{selectedUser.referralCount || 0}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Parrainages</p>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      {BADGES.map(badge => {
                        const has = selectedUser.badges?.includes(badge.id);
                        return (
                          <div key={badge.id} className={`h-16 rounded-xl flex items-center justify-center text-2xl border ${has ? 'bg-amber-500/10 border-amber-500/50 grayscale-0' : 'bg-white/5 border-white/5 grayscale opacity-20'}`}>
                             {badge.icon}
                          </div>
                        );
                      })}
                   </div>
                </div>
              </div>

              {/* Modules unitaires (CORRECTION : N'APPARAIT QUE SI VALIDE) */}
              {selectedUser.isActive && !selectedUser.isAdmin && (
                <section className="animate-in fade-in">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                      <Plus className="w-5 h-5" /> Offrir des modules bonus
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                      {TRAINING_CATALOG.filter(m => !(selectedUser.purchasedModuleIds || []).includes(m.id)).map(mod => (
                        <button 
                          key={mod.id} 
                          onClick={() => handleRewardModule(mod.id)}
                          disabled={processingId === mod.id}
                          className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:bg-brand-500/10 hover:border-brand-500/50 transition-all text-left"
                        >
                          <div>
                              <p className="text-[8px] font-black text-brand-500 uppercase mb-1">{mod.topic}</p>
                              <p className="text-xs font-bold text-white">{mod.title}</p>
                          </div>
                          <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
                              {processingId === mod.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          </div>
                        </button>
                      ))}
                  </div>
                </section>
              )}
            </div>

            {/* Actions Pied de page */}
            <div className="p-10 border-t border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-8 mt-auto">
               <button 
                onClick={() => handleToggleStatus(selectedUser)}
                disabled={selectedUser.uid === currentUser?.uid}
                className={`w-full md:w-auto px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                  selectedUser.isActive ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/20'
                } disabled:opacity-30`}
               >
                  {selectedUser.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  {selectedUser.isActive ? 'Suspendre Gérant' : 'Activer Gérant'}
               </button>

               <div className="flex items-center gap-4 w-full md:w-auto">
                 <a 
                   href={`https://wa.me/${selectedUser.phoneNumber.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour ${selectedUser.firstName}, Coach Kita ici. Votre accès Premium Go'Top Pro est maintenant actif !`)}`} 
                   target="_blank" rel="noreferrer" 
                   className="flex-grow md:flex-grow-0 bg-emerald-500 text-white px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl"
                 >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Confirm
                 </a>
                 <button 
                   onClick={() => { if(window.confirm("Action irréversible. Supprimer ce profil ?")) deleteUserProfile(selectedUser.uid).then(fetchUsers); }}
                   className="p-5 bg-rose-500/10 text-rose-500 rounded-[1.5rem] hover:bg-rose-500 transition-all hover:text-white"
                 >
                    <Trash2 className="w-5 h-5" />
                 </button>
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
    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-4 flex items-center gap-2">
      <div className="h-1 w-1 bg-slate-700 rounded-full"></div>
      {sub}
    </p>
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
      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${active ? 'bg-white/20 text-white' : isUrgent ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-400'}`}>
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
