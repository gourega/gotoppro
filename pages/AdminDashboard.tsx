
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers, toggleUserStatus, deleteUserProfile, validateUserPurchases } from '../services/supabase';
import { UserProfile } from '../types';
import { 
  Loader2, 
  RefreshCcw, 
  Users, 
  Clock, 
  Banknote, 
  Search, 
  Check, 
  Square, 
  Trash2, 
  ShoppingCart, 
  MessageCircle, 
  ExternalLink, 
  Filter,
  TrendingUp,
  ChevronRight,
  X,
  Target,
  ListTodo,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active'>('all');
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
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la récupération des données", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePurchases = async (uid: string) => {
    setProcessingId(uid);
    try {
      await validateUserPurchases(uid);
      showNotification("Accès débloqués. Le client est désormais actif !");
      await fetchUsers(); 
    } catch (err) {
      showNotification("Erreur lors de la validation", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    if (!window.confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement le profil de ${name} ?`)) return;
    try {
      setLoading(true);
      await deleteUserProfile(uid);
      setUsers(users.filter(u => u.uid !== uid));
      setSelectedUser(null);
      showNotification("Profil supprimé avec succès");
    } catch (err) {
      showNotification("Erreur lors de la suppression", "error");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const active = users.filter(u => u.isActive);
    const pendingPayment = users.filter(u => u.pendingModuleIds && u.pendingModuleIds.length > 0);
    const revenue = users.reduce((acc, u) => acc + (u.purchasedModuleIds?.length || 0) * 500, 0);
    const conversionRate = users.length > 0 ? Math.round((active.length / users.length) * 100) : 0;

    return { 
      total: users.length, 
      active: active.length, 
      pending: pendingPayment.length, 
      revenue,
      conversionRate
    };
  }, [users]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.phoneNumber.includes(searchTerm) || 
      (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.establishmentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && (u.pendingModuleIds && u.pendingModuleIds.length > 0)) || 
      (filterStatus === 'active' && u.isActive && (!u.pendingModuleIds || u.pendingModuleIds.length === 0));
    
    return matchesSearch && matchesStatus;
  });

  const pendingUsers = users.filter(u => u.pendingModuleIds && u.pendingModuleIds.length > 0);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-24 right-6 z-[100] px-8 py-5 rounded-[2rem] shadow-2xl animate-in slide-in-from-right duration-300 font-black text-[10px] uppercase tracking-widest border backdrop-blur-xl ${
          notification.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-rose-500/90 text-white border-rose-400'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 text-brand-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
              {/* Fix: Added missing ShieldAlert component from lucide-react */}
              <ShieldAlert className="w-4 h-4" />
              Pilotage Stratégique v2.0
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Console de <span className="text-brand-500">Direction</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={fetchUsers} disabled={loading} className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-all group">
                <RefreshCcw className={`w-6 h-6 text-slate-400 group-hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`} />
             </button>
             <div className="bg-brand-600 px-8 py-4 rounded-3xl text-white shadow-2xl shadow-brand-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Admin</p>
                <p className="font-bold">{currentUser?.firstName}</p>
             </div>
          </div>
        </div>

        {/* Executive Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <StatBox title="Gérants Inscrits" value={stats.total} icon={<Users />} color="text-blue-400" />
          <StatBox title="Validations Wave" value={stats.pending} icon={<Clock />} color="text-amber-400" highlight={stats.pending > 0} />
          <StatBox title="Taux Conversion" value={`${stats.conversionRate}%`} icon={<TrendingUp />} color="text-emerald-400" />
          <StatBox title="Recettes Totales" value={`${stats.revenue.toLocaleString()} F`} icon={<Banknote />} color="text-brand-500" />
        </div>

        {/* Priority Section: Pending Payments */}
        {pendingUsers.length > 0 && (
          <section className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              {/* Fix: Added missing AlertCircle component from lucide-react */}
              <AlertCircle className="w-4 h-4" />
              Paiements en attente de traitement ({pendingUsers.length})
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
               {pendingUsers.map(u => (
                 <div key={u.uid} className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-amber-500/40 transition-all group">
                    <div className="flex items-center gap-6">
                       <div className="h-16 w-16 bg-white rounded-2xl overflow-hidden shadow-lg">
                          {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover"/> : <div className="h-full w-full flex items-center justify-center text-amber-500 font-black text-2xl">{u.firstName?.[0]}</div>}
                       </div>
                       <div>
                          <h3 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">{u.firstName} {u.lastName}</h3>
                          <p className="text-amber-500/70 font-black text-[10px] uppercase tracking-widest">{u.phoneNumber}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                       <a href={`https://wa.me/${u.phoneNumber.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 md:flex-none p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                       </a>
                       <button 
                         onClick={() => handleValidatePurchases(u.uid)}
                         disabled={processingId === u.uid}
                         className="flex-grow md:flex-none bg-amber-500 text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/10"
                       >
                         {processingId === u.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                         Valider le paiement
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {/* Global User Management */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between gap-8">
            <div className="relative flex-grow max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher un gérant ou un numéro..." 
                className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-brand-500/50 text-white placeholder-slate-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10">
              <FilterToggle active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} label="Tous" />
              <FilterToggle active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')} label="En attente" count={stats.pending} />
              <FilterToggle active={filterStatus === 'active'} onClick={() => setFilterStatus('active')} label="Actifs" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gérant & Salon</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Maîtrise</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-brand-500 overflow-hidden">
                          {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/> : (u.firstName?.[0] || 'U')}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg group-hover:text-brand-400 transition-colors">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-500 font-medium italic">{u.establishmentName || 'Salon non précisé'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-500" style={{ width: `${Math.round((u.purchasedModuleIds?.length || 0)/16 * 100)}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{u.purchasedModuleIds?.length || 0} / 16</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'
                       }`}>
                         {u.isActive ? 'Actif' : 'Prospect'}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                          <a href={`https://wa.me/${u.phoneNumber.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-brand-500 transition-colors">
                             <MessageCircle className="w-5 h-5" />
                          </a>
                          <button onClick={() => setSelectedUser(u)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
                             <ChevronRight className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal (Strategic Insight) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-[#1e293b] w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-brand-500 flex items-center justify-center font-black">
                       {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover"/> : selectedUser.firstName?.[0]}
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-white">{selectedUser.firstName} {selectedUser.lastName}</h2>
                       <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{selectedUser.phoneNumber}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-10 overflow-y-auto flex-grow custom-scrollbar space-y-12">
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Masterclasses Acquis</p>
                       <p className="text-4xl font-black text-white">{selectedUser.purchasedModuleIds?.length || 0}</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Actions Terrain Validées</p>
                       <p className="text-4xl font-black text-white">{selectedUser.actionPlan?.filter(a => a.isCompleted).length || 0}</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Expérience</p>
                       <p className="text-2xl font-black text-white">{selectedUser.yearsOfExistence || 0} ans</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">{selectedUser.employeeCount || 0} employés</p>
                    </div>
                 </div>

                 <div className="grid lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <h3 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] flex items-center gap-3">
                          <Target className="w-4 h-4" /> Diagnostic Actuel
                       </h3>
                       <div className="space-y-3">
                          {Object.entries(selectedUser.progress || {}).map(([id, score]) => (
                             <div key={id} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <span className="text-xs font-bold text-slate-300">Mod. {id.split('_').pop()}</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{score}%</span>
                             </div>
                          ))}
                          {(!selectedUser.progress || Object.keys(selectedUser.progress).length === 0) && (
                             <p className="text-slate-500 italic text-sm">Aucun test passé pour le moment.</p>
                          )}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] flex items-center gap-3">
                          <ListTodo className="w-4 h-4" /> Plan d'Action Engagé
                       </h3>
                       <div className="space-y-4">
                          {selectedUser.actionPlan && selectedUser.actionPlan.length > 0 ? (
                             selectedUser.actionPlan.map((action, i) => (
                                <div key={i} className={`p-5 rounded-2xl border ${action.isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{action.moduleTitle}</p>
                                   <p className={`text-sm font-medium ${action.isCompleted ? 'text-emerald-400 line-through' : 'text-slate-200'}`}>{action.action}</p>
                                </div>
                             ))
                          ) : (
                             <p className="text-slate-500 italic text-sm">Aucun engagement stratégique pris.</p>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <button 
                   onClick={() => handleDeleteUser(selectedUser.uid, `${selectedUser.firstName} ${selectedUser.lastName}`)}
                   className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-black text-[10px] uppercase tracking-widest transition-colors"
                 >
                    <Trash2 className="w-4 h-4" /> Supprimer le profil
                 </button>
                 <div className="flex gap-4">
                    <a href={`https://wa.me/${selectedUser.phoneNumber.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-3">
                       <MessageCircle className="w-4 h-4" /> Message WhatsApp
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

const FilterToggle = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
      active ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {label}
    {count !== undefined && count > 0 && <span className={`px-2 py-0.5 rounded-lg text-[9px] ${active ? 'bg-white/20' : 'bg-white/5'}`}>{count}</span>}
  </button>
);

export default AdminDashboard;
