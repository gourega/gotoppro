
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
  Gem
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'clients' | 'admins'>('clients');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', firstName: '', phone: '' });

  useEffect(() => {
    if (currentUser && currentUser.isAdmin) {
      fetchUsers();
    } else if (currentUser && !currentUser.isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showNotification("Erreur de synchronisation", "error");
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
      showNotification(user.isActive ? "Accès suspendu" : "Accès activé");
      await fetchUsers();
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, isActive: !user.isActive });
      }
    } catch (err) {
      showNotification("Erreur", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivatePack = async (packType: 'ELITE' | 'PERFORMANCE') => {
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
      }

      await saveUserProfile(updates as any);
      showNotification(`Pack ${packType} activé !`);
      await fetchUsers();
      setSelectedUser(prev => prev ? { ...prev, ...updates } as any : null);
    } catch (err) {
      showNotification("Erreur activation", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm("Suppression définitive. Confirmer ?")) return;
    setProcessingId(uid);
    try {
      await deleteUserProfile(uid);
      showNotification("Compte supprimé");
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      showNotification("Erreur suppression", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRewardModule = async (moduleId: string) => {
    if (!selectedUser) return;
    setProcessingId(moduleId);
    try {
      await grantModuleAccess(selectedUser.uid, moduleId);
      showNotification("Module offert avec succès ! 🎁");
      await fetchUsers();
      setSelectedUser(prev => prev ? { 
        ...prev, 
        purchasedModuleIds: [...new Set([...(prev.purchasedModuleIds || []), moduleId])],
        isActive: true 
      } : null);
    } catch (err) {
      showNotification("Erreur attribution", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetTokens = async (moduleId: string) => {
    if (!selectedUser) return;
    setProcessingId(`token_${moduleId}`);
    try {
      await updateQuizAttempts(selectedUser.uid, moduleId, 0);
      showNotification("3 Jetons offerts sur ce module ! ⚡");
      await fetchUsers();
      setSelectedUser(prev => prev ? { 
        ...prev, 
        attempts: { ...(prev.attempts || {}), [moduleId]: 0 } 
      } : null);
    } catch (err) {
      showNotification("Erreur jetons", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const calculateNetPrice = (user: UserProfile) => {
    // Calcul incluant les packs
    let total = 0;
    if (user.isKitaPremium) total += 10000;
    if (user.hasPerformancePack) total += 5000;
    
    // Si pas Elite, calcul par module avec remises
    if (!user.isKitaPremium) {
      const count = (user.purchasedModuleIds || []).length;
      const basePrice = count * 500;
      let discount = 0;
      if (count >= 13) discount = 0.50;
      else if (count >= 9) discount = 0.30;
      else if (count >= 5) discount = 0.20;
      total += Math.round(basePrice * (1 - discount));
    }
    
    return total;
  };

  const stats = useMemo(() => {
    const clients = users.filter(u => !u.isAdmin);
    const activeClients = clients.filter(u => u.isActive);
    return { 
      totalClients: clients.length, 
      active: activeClients.length,
      revenue: clients.reduce((acc, u) => acc + calculateNetPrice(u), 0)
    };
  }, [users]);

  const filteredData = users.filter(u => {
    const matchesSearch = u.phoneNumber.includes(searchTerm) || 
      (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.establishmentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (viewMode === 'clients' ? !u.isAdmin : u.isAdmin);
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {notification && (
        <div className={`fixed top-24 right-6 z-[100] px-8 py-5 rounded-[2rem] shadow-2xl animate-in slide-in-from-right duration-300 font-black text-[10px] uppercase tracking-widest border backdrop-blur-xl ${
          notification.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-rose-500/90 text-white border-rose-400'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-brand-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">
              <ShieldAlert className="w-4 h-4" />
              Pilotage Stratégique v2.5
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Console de <span className="text-brand-500">Direction</span></h1>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                <CheckCircle className="w-3 h-3" />
                Production Active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={fetchUsers} disabled={loading} className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-all group">
                <RefreshCcw className={`w-6 h-6 text-slate-400 group-hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`} />
             </button>
             {currentUser?.role === 'SUPER_ADMIN' && (
               <button onClick={() => setShowAddAdmin(true)} className="bg-brand-600 px-8 py-4 rounded-3xl text-white shadow-2xl shadow-brand-500/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-500 transition-all">
                  <UserPlus className="w-4 h-4" /> Ajouter Admin
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <StatBox title="Gérants" value={stats.totalClients} icon={<Users />} color="text-blue-400" />
          <StatBox title="Actifs" value={stats.active} icon={<ShieldCheck />} color="text-emerald-400" />
          <StatBox title="Parrainages" value={users.reduce((acc, u) => acc + (u.referralCount || 0), 0)} icon={<Handshake />} color="text-amber-400" />
          <StatBox title="Recettes" value={`${stats.revenue.toLocaleString()} F`} icon={<Banknote />} color="text-brand-500" />
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between gap-8">
            <div className="relative flex-grow max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher par nom, téléphone ou salon..."
                className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-brand-500/50 text-white placeholder-slate-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10">
              <FilterToggle active={viewMode === 'clients'} onClick={() => setViewMode('clients')} label="Gérants" icon={<Users className="w-3 h-3" />} />
              <FilterToggle active={viewMode === 'admins'} onClick={() => setViewMode('admins')} label="Équipe Admin" icon={<ShieldCheck className="w-3 h-3" />} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identité</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut Pack</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Modules</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map(u => {
                  const hasEliteRequest = u.pendingModuleIds?.includes('REQUEST_ELITE');
                  const hasPerfRequest = u.pendingModuleIds?.includes('REQUEST_PERFORMANCE');
                  
                  return (
                    <tr key={u.uid} className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${!u.isActive ? 'bg-amber-500/5' : ''}`} onClick={() => setSelectedUser(u)}>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-black bg-white/10 text-brand-500 overflow-hidden">
                            {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/> : (u.firstName?.[0] || 'U')}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg group-hover:text-brand-400 transition-colors">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-slate-500 font-medium">{u.phoneNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex flex-wrap gap-2">
                            {u.isKitaPremium && <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[8px] font-black uppercase">Elite</span>}
                            {u.hasPerformancePack && <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase">Perf+</span>}
                            {hasEliteRequest && <span className="px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-[8px] font-black uppercase animate-pulse">Demande Elite</span>}
                            {hasPerfRequest && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-lg text-[8px] font-black uppercase animate-pulse">Demande Perf+</span>}
                            {!u.isKitaPremium && !u.hasPerformancePack && !hasEliteRequest && !hasPerfRequest && <span className="text-slate-600 text-[8px] font-black uppercase">Standard</span>}
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                            {u.purchasedModuleIds?.length || 0} / 16
                         </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <button onClick={() => setSelectedUser(u)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-[#1e293b] w-full max-w-6xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
              
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.5rem] overflow-hidden bg-brand-500 flex items-center justify-center font-black relative">
                       {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover"/> : selectedUser.firstName?.[0]}
                       {selectedUser.isActive && (
                         <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 border-4 border-[#1e293b] rounded-full shadow-lg"></div>
                       )}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-white">{selectedUser.firstName} {selectedUser.lastName}</h2>
                       <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{selectedUser.establishmentName || 'GÉRANT DE SALON'}</p>
                          <span className="h-1 w-1 bg-slate-600 rounded-full"></span>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedUser.phoneNumber}</p>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-10 overflow-y-auto flex-grow custom-scrollbar">
                 <div className="grid lg:grid-cols-12 gap-10">
                    
                    <div className="lg:col-span-8 space-y-12">
                       
                       {/* NOUVELLE SECTION : GESTION DES PACKS DEMANDES */}
                       {(selectedUser.pendingModuleIds?.includes('REQUEST_ELITE') || selectedUser.pendingModuleIds?.includes('REQUEST_PERFORMANCE')) && (
                          <div className="bg-amber-500/10 rounded-[2.5rem] p-10 border border-amber-500/20">
                             <div className="flex items-center gap-4 mb-8">
                                <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                                <div>
                                   <h3 className="text-xl font-black text-white uppercase tracking-tight">Paiement en attente</h3>
                                   <p className="text-slate-400 text-sm">Le gérant a validé l'engagement, en attente du transfert Wave.</p>
                                </div>
                             </div>
                             <div className="flex flex-wrap gap-4">
                                {selectedUser.pendingModuleIds?.includes('REQUEST_ELITE') && (
                                  <button 
                                    onClick={() => handleActivatePack('ELITE')}
                                    disabled={processingId === 'ELITE'}
                                    className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-amber-400 flex items-center gap-3 transition-all"
                                  >
                                     {processingId === 'ELITE' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                                     Activer Pack Elite (10 000 F)
                                  </button>
                                )}
                                {selectedUser.pendingModuleIds?.includes('REQUEST_PERFORMANCE') && (
                                  <button 
                                    onClick={() => handleActivatePack('PERFORMANCE')}
                                    disabled={processingId === 'PERFORMANCE'}
                                    className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-400 flex items-center gap-3 transition-all"
                                  >
                                     {processingId === 'PERFORMANCE' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gem className="w-4 h-4" />}
                                     Activer Pack Perf+ (5 000 F)
                                  </button>
                                )}
                             </div>
                          </div>
                       )}

                       <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/10">
                          <div className="flex items-center justify-between mb-8">
                             <h3 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                <Trophy className="w-4 h-4" /> Palmarès & Réussites
                             </h3>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                             {TRAINING_CATALOG.filter(m => (selectedUser.progress?.[m.id] || 0) >= 80).length > 0 ? (
                               TRAINING_CATALOG.filter(m => (selectedUser.progress?.[m.id] || 0) >= 80).map(mod => (
                                 <div key={mod.id} className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex items-center gap-4 group">
                                    <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                       <Medal className="w-6 h-6" />
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{mod.topic}</p>
                                       <p className="text-sm font-bold text-white leading-tight">{mod.title}</p>
                                       <div className="flex items-center gap-2 mt-1">
                                          <div className="h-1 w-1 bg-emerald-500 rounded-full"></div>
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score : {selectedUser.progress?.[mod.id]}%</p>
                                       </div>
                                    </div>
                                 </div>
                               ))
                             ) : (
                               <div className="md:col-span-2 py-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                  <p className="text-slate-500 text-xs italic">Aucune certification validée pour le moment.</p>
                               </div>
                             )}
                          </div>
                       </div>

                       <section>
                          <div className="flex items-center justify-between mb-8">
                             <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                <Crown className="w-4 h-4" /> Récompenser (Modules seuls)
                             </h3>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                             {TRAINING_CATALOG.filter(m => !(selectedUser.purchasedModuleIds || []).includes(m.id)).map(mod => (
                               <div key={mod.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-amber-500/50 hover:bg-amber-500/[0.02] transition-all">
                                  <div className="max-w-[220px]">
                                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{mod.topic}</p>
                                     <p className="text-sm font-bold text-white truncate">{mod.title}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleRewardModule(mod.id)}
                                    disabled={processingId === mod.id}
                                    className="h-12 w-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/20 group-hover:scale-110"
                                  >
                                     {processingId === mod.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                  </button>
                               </div>
                             ))}
                          </div>
                       </section>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                       <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Star className="w-3 h-3 text-amber-500" /> Trophées</p>
                          <div className="grid grid-cols-2 gap-4">
                             {BADGES.map(badge => {
                               const hasBadge = selectedUser.badges?.includes(badge.id);
                               return (
                                 <div key={badge.id} className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${hasBadge ? 'bg-white/10 border-brand-500 shadow-lg scale-100' : 'bg-white/5 border-transparent opacity-20 grayscale scale-90'}`}>
                                    <span className="text-3xl mb-2">{badge.icon}</span>
                                    <p className="text-[8px] font-black uppercase tracking-tight text-white">{badge.name}</p>
                                 </div>
                               )
                             })}
                          </div>
                       </div>

                       <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-8 rounded-[2.5rem] border border-amber-500/20">
                          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Handshake className="w-3 h-3"/> Score Ambassadeur</p>
                          <div className="flex items-end gap-3 mb-2">
                             <p className="text-5xl font-black text-white">{selectedUser.referralCount || 0}</p>
                             <p className="text-xs text-slate-400 font-bold mb-2">Parrainages</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <button 
                   onClick={() => handleDelete(selectedUser.uid)}
                   disabled={processingId === selectedUser.uid}
                   className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-black text-[10px] uppercase tracking-widest p-4 hover:bg-rose-500/10 rounded-2xl transition-all"
                 >
                    {processingId === selectedUser.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Désinscription
                 </button>
                 
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleToggleStatus(selectedUser)}
                      disabled={processingId === selectedUser.uid}
                      className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${
                        selectedUser.isActive 
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20'
                      }`}
                    >
                       {selectedUser.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                       {selectedUser.isActive ? 'Suspendre' : 'Activer Compte'}
                    </button>
                    <a href={`https://wa.me/${selectedUser.phoneNumber.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-3">
                       <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ title, value, icon, color }: any) => (
  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 transition-all duration-500 hover:bg-white/[0.08]">
    <div className="flex justify-between items-start mb-6">
       <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl ${color} border border-white/10`}>
          {icon}
       </div>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
  </div>
);

const FilterToggle = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
      active ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default AdminDashboard;
