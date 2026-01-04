
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllUsers, 
  deleteUserProfile, 
  validateUserPurchases, 
  grantModuleAccess, 
  updateQuizAttempts,
  createAdminAccount,
  saveUserProfile
} from '../services/supabase';
import { TRAINING_CATALOG } from '../constants';
import { UserProfile, UserRole } from '../types';
import { 
  Loader2, 
  RefreshCcw, 
  Users, 
  Clock, 
  Banknote, 
  Search, 
  Check, 
  Trash2, 
  MessageCircle, 
  Filter,
  TrendingUp,
  ChevronRight,
  X,
  Target,
  ListTodo,
  ShieldAlert,
  AlertCircle,
  Gift,
  Coins,
  UserPlus,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  UserX,
  UserCheck,
  Zap
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

  const handleDelete = async (uid: string) => {
    if (!window.confirm("Action irréversible. Confirmer la suppression ?")) return;
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
      showNotification("Module offert !");
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
      showNotification("Jetons réinitialisés (3 offerts)");
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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdminAccount(adminForm.email, adminForm.firstName, adminForm.phone);
      showNotification("Admin ajouté");
      setShowAddAdmin(false);
      setAdminForm({ email: '', firstName: '', phone: '' });
      await fetchUsers();
    } catch (err: any) {
      showNotification(err.message || "Erreur création", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateNetPrice = (count: number) => {
    const basePrice = count * 500;
    let discount = 0;
    if (count >= 13) discount = 0.50;
    else if (count >= 9) discount = 0.30;
    else if (count >= 5) discount = 0.20;
    return Math.round(basePrice * (1 - discount));
  };

  const stats = useMemo(() => {
    const clients = users.filter(u => !u.isAdmin);
    const pendingPayment = clients.filter(u => u.pendingModuleIds && u.pendingModuleIds.length > 0);
    const totalRevenue = clients.reduce((acc, u) => acc + calculateNetPrice(u.purchasedModuleIds?.length || 0), 0);
    const activeClients = clients.filter(u => u.isActive);
    return { 
      totalClients: clients.length, 
      pending: pendingPayment.length, 
      revenue: totalRevenue,
      conversionRate: clients.length > 0 ? Math.round((activeClients.length / clients.length) * 100) : 0 
    };
  }, [users]);

  const filteredData = users.filter(u => {
    const matchesSearch = u.phoneNumber.includes(searchTerm) || 
      (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.establishmentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (viewMode === 'clients' ? !u.isAdmin : u.isAdmin);
  });

  const pendingUsers = users.filter(u => !u.isAdmin && u.pendingModuleIds && u.pendingModuleIds.length > 0);

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
          <div>
            <div className="flex items-center gap-3 text-brand-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
              <ShieldAlert className="w-4 h-4" />
              Pilotage Stratégique v2.0
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Console de <span className="text-brand-500">Direction</span></h1>
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
          <StatBox title="Gérants Inscrits" value={stats.totalClients} icon={<Users />} color="text-blue-400" />
          <StatBox title="Validations Wave" value={stats.pending} icon={<Clock />} color="text-amber-400" highlight={stats.pending > 0} />
          <StatBox title="Taux Conversion" value={`${stats.conversionRate}%`} icon={<TrendingUp />} color="text-emerald-400" />
          <StatBox title="Recettes Nettes" value={`${stats.revenue.toLocaleString()} F`} icon={<Banknote />} color="text-brand-500" />
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between gap-8">
            <div className="relative flex-grow max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher..."
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
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Maîtrise</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map(u => (
                  <tr key={u.uid} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
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
                       <div className="flex items-center gap-3">
                          <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-500" style={{ width: `${Math.round((u.purchasedModuleIds?.length || 0)/16 * 100)}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{u.purchasedModuleIds?.length || 0} Acquis</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <button 
                        onClick={(e) => handleToggleStatus(u, e)}
                        disabled={processingId === u.uid}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                         u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                       }`}>
                         {processingId === u.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : u.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                         {u.isActive ? 'Actif' : 'Suspendu'}
                       </button>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button onClick={() => setSelectedUser(u)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reward & Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-[#1e293b] w-full max-w-5xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-brand-500 flex items-center justify-center font-black">
                       {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover"/> : selectedUser.firstName?.[0]}
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-white">{selectedUser.firstName} {selectedUser.lastName}</h2>
                       <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{selectedUser.isAdmin ? 'ADMINISTRATEUR' : 'GÉRANT DE SALON'}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-10 overflow-y-auto flex-grow custom-scrollbar">
                 <div className="grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-12">
                       {/* Section Offrir Module */}
                       {!selectedUser.isAdmin && (
                         <section>
                            <h3 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                               <Gift className="w-4 h-4" /> Offrir un Module (Déblocage Immédiat)
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                               {TRAINING_CATALOG.filter(m => !(selectedUser.purchasedModuleIds || []).includes(m.id)).slice(0, 10).map(mod => (
                                 <div key={mod.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand-500 transition-all">
                                    <div className="max-w-[200px]">
                                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{mod.topic}</p>
                                       <p className="text-sm font-bold text-white truncate">{mod.title}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleRewardModule(mod.id)}
                                      disabled={processingId === mod.id}
                                      className="h-10 w-10 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20"
                                    >
                                       {processingId === mod.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    </button>
                                 </div>
                               ))}
                            </div>
                         </section>
                       )}

                       {/* Section Jetons & Progrès */}
                       <section>
                          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                             <Zap className="w-4 h-4" /> Progrès & Gestion des Jetons (Tentatives)
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                             {selectedUser.purchasedModuleIds?.map(id => {
                               const m = TRAINING_CATALOG.find(tm => tm.id === id);
                               const attempts = selectedUser.attempts?.[id] || 0;
                               const score = selectedUser.progress?.[id] || 0;
                               return (
                                 <div key={id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                                    <div className="flex justify-between items-start">
                                       <div className="max-w-[150px]">
                                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Module {id.split('_').pop()}</p>
                                          <p className="text-xs font-bold text-white truncate">{m?.title}</p>
                                       </div>
                                       <div className={`px-3 py-1 rounded-lg text-[10px] font-black ${score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-500'}`}>
                                          {score}%
                                       </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                       <div className="flex items-center gap-2">
                                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisés : {attempts}/3</span>
                                       </div>
                                       <button 
                                         onClick={() => handleResetTokens(id)}
                                         disabled={processingId === `token_${id}`}
                                         className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2"
                                       >
                                          {processingId === `token_${id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                          Offrir 3 Jetons
                                       </button>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>
                       </section>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                       <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Valeur Nette Client</p>
                          <p className="text-3xl font-black text-white">{calculateNetPrice(selectedUser.purchasedModuleIds?.length || 0).toLocaleString()} F</p>
                       </div>
                       <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Plan d'Engagement</p>
                          <div className="space-y-4">
                             {selectedUser.actionPlan && selectedUser.actionPlan.length > 0 ? (
                                selectedUser.actionPlan.slice(0, 3).map((a, i) => (
                                   <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                      <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest mb-1">{a.moduleTitle}</p>
                                      <p className="text-[10px] text-slate-300 italic">"{a.action}"</p>
                                   </div>
                                ))
                             ) : <p className="text-[10px] text-slate-500 italic">Aucun plan d'action.</p>}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <button onClick={() => handleDelete(selectedUser.uid)} className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-black text-[10px] uppercase tracking-widest">
                    <Trash2 className="w-4 h-4" /> Supprimer Définitivement
                 </button>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleToggleStatus(selectedUser)}
                      className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedUser.isActive ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500 text-white'}`}
                    >
                       {selectedUser.isActive ? 'Suspendre l\'accès' : 'Débloquer le compte'}
                    </button>
                    <a href={`https://wa.me/${selectedUser.phoneNumber.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
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

const StatBox = ({ title, value, icon, color, highlight }: any) => (
  <div className={`bg-white/5 p-8 rounded-[2.5rem] border transition-all duration-500 ${highlight ? 'border-amber-500 shadow-2xl shadow-amber-500/10 scale-105' : 'border-white/10'}`}>
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
  <button onClick={onClick} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${active ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon} {label}
  </button>
);

export default AdminDashboard;
