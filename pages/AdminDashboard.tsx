
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers, toggleUserStatus, updateUserRole, deleteUserProfile } from '../services/supabase';
import { UserProfile, UserRole } from '../types';
import { Loader2, ShieldAlert, RefreshCcw, Users, Clock, Banknote, Search, Check, Square, Trash2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active'>('all');
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

  const handleDeleteUser = async (uid: string, name: string) => {
    if (!window.confirm(`⚠️ Action irréversible : Supprimer le profil de ${name} ?`)) return;
    
    try {
      setLoading(true);
      await deleteUserProfile(uid);
      setUsers(users.filter(u => u.uid !== uid));
      showNotification("Profil supprimé");
    } catch (err) {
      showNotification("Erreur lors de la suppression", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (uid: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(uid, !currentStatus);
      setUsers(users.map(u => u.uid === uid ? { ...u, isActive: !currentStatus } : u));
      showNotification(currentStatus ? "Compte désactivé" : "Compte activé");
    } catch (err) {
      showNotification("Erreur de modification", "error");
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (currentUser?.role !== 'SUPER_ADMIN') return;
    try {
      await updateUserRole(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole, isAdmin: newRole !== 'CLIENT' } : u));
      showNotification(`Rôle mis à jour : ${newRole}`);
    } catch (err) {
      showNotification("Erreur de rôle", "error");
    }
  };

  const stats = useMemo(() => {
    const active = users.filter(u => u.isActive);
    const pending = users.filter(u => !u.isActive);
    const estimatedRevenue = active.reduce((acc, u) => acc + (u.purchasedModuleIds?.length || 0) * 500, 0);

    return { total: users.length, active: active.length, pending: pending.length, revenue: estimatedRevenue };
  }, [users]);

  const filteredUsers = users.filter(u => {
    const nameMatch = (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                     (u.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = u.phoneNumber.includes(searchTerm) || nameMatch;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && !u.isActive) || 
      (filterStatus === 'active' && u.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès Restreint</h2>
        <p className="text-slate-500">Vous n'avez pas les permissions nécessaires pour accéder à cette console.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {notification && (
        <div className={`fixed top-20 right-4 z-[100] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 font-bold text-sm border ${
          notification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Console d'Administration</h1>
            <p className="text-slate-500 mt-2 font-medium">Pilotage stratégique de Go'Top Pro.</p>
          </div>
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm text-slate-400 disabled:opacity-50"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Clients" value={stats.total} icon={<Users />} color="bg-blue-50 text-blue-600" />
          <StatCard title="Attente Wave" value={stats.pending} icon={<Clock />} color="bg-amber-50 text-amber-600" pulse={stats.pending > 0} />
          <StatCard title="Revenus Réels" value={`${stats.revenue.toLocaleString()} FCFA`} icon={<Banknote />} color="bg-emerald-50 text-emerald-600" />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row justify-between gap-6">
          <div className="relative flex-grow max-w-xl">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text" 
              placeholder="Rechercher un gérant ou un numéro..." 
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 self-start">
            <FilterBtn active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} label="Tous" />
            <FilterBtn active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')} label="En attente" count={stats.pending} />
            <FilterBtn active={filterStatus === 'active'} onClick={() => setFilterStatus('active')} label="Actifs" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && users.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
              <p className="text-slate-400 font-medium">Chargement des clients...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-medium">Aucun client trouvé.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paiement</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-400 shadow-sm overflow-hidden">
                          {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover"/> : (u.firstName?.[0] || 'U')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.firstName} {u.lastName || ''}</p>
                          <p className="text-xs font-bold text-slate-400">{u.phoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        disabled={currentUser?.role !== 'SUPER_ADMIN'}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-none ring-1 ring-slate-200 outline-none bg-white cursor-pointer"
                      >
                        <option value="CLIENT">Client</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {u.isActive ? 'Payé' : 'À valider'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(u.uid, u.isActive)}
                          className={`p-2.5 rounded-xl transition-all ${
                            u.isActive ? 'text-slate-400 hover:bg-slate-100' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-100'
                          }`}
                          title={u.isActive ? "Désactiver" : "Activer & Valider"}
                        >
                          {u.isActive ? <Square className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        {currentUser?.role === 'SUPER_ADMIN' && (
                          <button 
                            onClick={() => handleDeleteUser(u.uid, `${u.firstName} ${u.lastName}`)}
                            className="p-2.5 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string, pulse?: boolean }> = ({ title, value, icon, color, pulse }) => (
  <div className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 ${pulse ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}>
    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const FilterBtn: React.FC<{ active: boolean, onClick: () => void, label: string, count?: number }> = ({ active, onClick, label, count }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
      active ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {label}
    {count !== undefined && count > 0 && <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${active ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}
  </button>
);

export default AdminDashboard;
