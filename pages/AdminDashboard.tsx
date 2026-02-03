import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateUserProfile,
  supabase,
  getAllUsers,
  getKitaTransactions
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
  Smartphone,
  Cpu,
  Terminal,
  Megaphone,
  ShieldCheck,
  Radio,
  Zap,
  Banknote,
  Save,
  MessageCircle,
  Copy,
  Eye
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivatingAll, setIsActivatingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'inbox' | 'active' | 'admins'>('inbox');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [selectedUserTurnover, setSelectedUserTurnover] = useState<number>(0);
  const [tempAdminNotes, setTempAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Simulation
  const [simPhone, setSimPhone] = useState('');
  const [simAmount, setSimAmount] = useState('15000');
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchLogs = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('automation_logs').select('*').order('created_at', { ascending: false }).limit(6);
      if (data) setLogs(data);
    } catch (e) { console.error("Log fetch error", e); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers || []);
      await fetchLogs();
    } catch (err) { console.error("Erreur chargement gérants:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers();
    } else {
      navigate('/dashboard');
    }
    const interval = setInterval(fetchLogs, 10000); 
    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  useEffect(() => {
    if (selectedUser) {
      setTempAdminNotes(selectedUser.adminNotes || '');
      fetchUserFinancials(selectedUser.uid);
    }
  }, [selectedUser]);

  const fetchUserFinancials = async (userId: string) => {
    try {
      const transactions = await getKitaTransactions(userId);
      const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
      setSelectedUserTurnover(totalIncome);
    } catch (e) { console.warn("Erreur finances"); }
  };

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedUser || !supabase) return;
    setIsSavingNotes(true);
    try {
      await updateUserProfile(selectedUser.uid, { adminNotes: tempAdminNotes });
      showNotify("Notes Mentor enregistrées");
      fetchUsers();
    } catch (err) { showNotify("Erreur sauvegarde notes", "error"); }
    finally { setIsSavingNotes(false); }
  };

  const handleActivateAll = async () => {
    if (!supabase || isActivatingAll) return;
    const pendingUsers = users.filter(u => !u.isActive && !u.isAdmin);
    if (pendingUsers.length === 0) return showNotify("Aucun gérant en attente.", "error");
    if (!window.confirm(`Activer les ${pendingUsers.length} gérants ?`)) return;

    setIsActivatingAll(true);
    try {
      const { error } = await supabase.from('profiles').update({ isActive: true }).eq('isActive', false).neq('role', 'SUPER_ADMIN');
      if (error) throw error;
      showNotify(`${pendingUsers.length} gérants activés !`);
      fetchUsers();
    } catch (err) { showNotify("Erreur activation groupée.", "error"); }
    finally { setIsActivatingAll(false); }
  };

  const handleSimulate = async () => {
    if (!simPhone || isSimulating) return;
    setIsSimulating(true);
    try {
      let cleanPhone = simPhone.replace(/\s/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = `+225${cleanPhone}`;
      if (!cleanPhone.startsWith('+')) cleanPhone = `+225${cleanPhone}`;
      const response = await fetch("https://uyqjorpvmqremxbfeepl.supabase.co/functions/v1/wave-webhook", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Kita-Auth': 'KITA_WEBHOOK_SECURE_2024' },
        body: JSON.stringify({ message: `Vous avez reçu ${simAmount}F de ${cleanPhone}`, from: "TEST_CONSOLE" })
      });
      if (response.ok) {
        showNotify("Signal capté par le Robot !");
        setTimeout(fetchUsers, 2000);
      } else { showNotify("Erreur Robot", "error"); }
    } catch (err) { showNotify("Échec de connexion", "error"); }
    finally { setIsSimulating(false); }
  };

  const filteredUsers = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (s) return users.filter(u => !u.isAdmin && (`${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || (u.establishmentName || '').toLowerCase().includes(s) || u.phoneNumber.includes(s)));
    if (viewMode === 'inbox') return users.filter(u => !u.isActive && !u.isAdmin);
    if (viewMode === 'active') return users.filter(u => u.isActive && !u.isAdmin);
    if (viewMode === 'admins') return users.filter(u => u.isAdmin);
    return users.filter(u => !u.isAdmin);
  }, [users, searchTerm, viewMode]);

  const stats = useMemo(() => {
    const clients = users.filter(u => !u.isAdmin);
    const activeClients = clients.filter(u => u.isActive);
    return { total: clients.length, active: activeClients.length, pending: clients.length - activeClients.length, revenue: activeClients.length * 10000 };
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
            <div className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">
               <Activity className="w-4 h-4 animate-pulse" /> Live Operations — Global HQ
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 tracking-tighter leading-none">Console de <span className="text-brand-600 italic">Direction</span></h1>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            {/* BOUTON SECRET WAR ROOM */}
            <button 
              onClick={() => navigate('/war-room')}
              className="h-14 w-14 rounded-2xl bg-slate-900 text-amber-500 flex items-center justify-center shadow-xl hover:scale-105 transition-all border border-amber-500/20"
              title="Vision 2027"
            >
              <Eye className="w-6 h-6" />
            </button>
            
            {stats.pending > 0 && (
              <button onClick={handleActivateAll} disabled={isActivatingAll} className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                {isActivatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Activer les {stats.pending} gérants
              </button>
            )}
            <button className="bg-emerald-100 text-emerald-700 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-200 transition-all flex items-center gap-3"><Megaphone className="w-4 h-4" /> Diffusion SMS</button>
            <button onClick={fetchUsers} className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 shadow-sm transition-all"><RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <AdminStatCard icon={<Users />} label="Inscrits" val={stats.total} />
           <AdminStatCard icon={<Clock />} label="En attente" val={stats.pending} color="text-amber-500" />
           <AdminStatCard icon={<ShieldCheck />} label="Statut Robot" val={stats.total >= 11 ? 'SCALE' : 'MANUEL'} sub={stats.total >= 11 ? 'Bouton Maître Actif' : 'Vérification Manuelle'} />
           <AdminStatCard icon={<TrendingUp />} label="Recettes" val={`${stats.revenue.toLocaleString()} F`} />
        </section>

        <section className="bg-slate-900 rounded-[4rem] p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:scale-110"><Smartphone className="w-48 h-48 text-emerald-500" /></div>
           <div className="relative z-10 flex flex-col lg:flex-row gap-16">
              <div className="flex-grow space-y-8">
                 <div className="flex items-center gap-5">
                    <div className="h-16 w-16 bg-emerald-500 text-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20"><Cpu className="w-10 h-10" /></div>
                    <div><h3 className="text-2xl font-serif font-bold text-white tracking-tight">Radar Wave Automatisé</h3><p className="text-emerald-400 font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-2"><Radio className="w-3 h-3 animate-pulse" /> Live Monitoring</p></div>
                 </div>
                 <div className="grid sm:grid-cols-2 gap-8 max-w-3xl">
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Test Signal Robot</p>
                       <div className="space-y-4">
                          <input type="tel" placeholder="0544869313" value={simPhone} onChange={e => setSimPhone(e.target.value)} className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-lg font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                          <select value={simAmount} onChange={e => setSimAmount(e.target.value)} className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-xs font-black appearance-none cursor-pointer"><option value="15000">PACK FULL (15.000 F)</option><option value="10000">PACK ELITE (10.000 F)</option><option value="5000">PACK OUTILS (5.000 F)</option></select>
                          <button onClick={handleSimulate} disabled={isSimulating || !simPhone} className="w-full bg-emerald-500 text-slate-900 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-emerald-400 transition-all">
                             {isSimulating ? <Loader2 className="animate-spin w-5 h-5" /> : <Terminal className="w-5 h-5" />} Simuler Réception Wave
                          </button>
                       </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/5 flex flex-col h-full min-h-[300px]">
                       <div className="flex justify-between items-center mb-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flux d'activité</p><button onClick={fetchLogs} className="p-2 text-slate-500 hover:text-white transition-colors"><RefreshCcw className="w-3.5 h-3.5" /></button></div>
                       <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-3">
                          {logs.map((log, i) => (
                            <div key={i} className={`border-l-4 pl-5 py-3 rounded-r-2xl bg-white/[0.02] ${log.status === 'SUCCÈS' ? 'border-emerald-500' : 'border-amber-500'}`}>
                               <div className="flex justify-between items-center mb-1"><p className="text-[11px] text-white font-black uppercase">{log.sender}</p><span className="text-[8px] text-slate-600">{new Date(log.created_at).toLocaleTimeString()}</span></div>
                               <p className={`text-[10px] font-bold ${log.status === 'SUCCÈS' ? 'text-emerald-400' : 'text-slate-300'}`}>{log.details || log.message}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8">
            <div className="relative w-full xl:max-w-xl">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input type="text" placeholder="Awa, Salon GoTop, 05..." className="w-full pl-20 pr-8 py-6 rounded-3xl border-none bg-slate-50 outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex bg-slate-100 p-2 rounded-3xl border">
              <button onClick={() => setViewMode('inbox')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'inbox' && !searchTerm ? 'bg-brand-900 text-white shadow-lg' : 'text-slate-500'}`}>Demandes</button>
              <button onClick={() => setViewMode('active')} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'active' && !searchTerm ? 'bg-brand-900 text-white shadow-lg' : 'text-slate-500'}`}>Actifs</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50"><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gérant & Établissement</th><th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const certs = Object.values(u.progress || {}).filter(s => Number(s) >= 80).length;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => setSelectedUser(u)}>
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white shrink-0 bg-slate-200 text-slate-400 overflow-hidden`}>
                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : u.firstName?.[0]}
                          </div>
                          <div><p className="font-bold text-slate-900 text-xl leading-tight">{u.firstName} {u.lastName}</p><p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{u.establishmentName || 'Salon GoTop'} • {u.phoneNumber}</p></div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{u.isActive ? 'Actif' : 'En attente'}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{certs} / 16 Certifications</span>
                         </div>
                      </td>
                      <td className="px-12 py-8 text-right"><button className="p-4 bg-slate-100 rounded-2xl text-slate-300 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-10 md:p-14 overflow-y-auto animate-in slide-in-from-right flex flex-col custom-scrollbar">
            <div className="flex justify-between items-center mb-12">
               <div><h2 className="text-3xl font-serif font-bold text-slate-900">Cockpit Mentor</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Dossier : {selectedUser.uid.substring(0,8)}</p></div>
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
               <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 bg-brand-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                     <Banknote className="absolute -bottom-4 -right-4 w-20 h-20 opacity-10" />
                     <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-3">Chiffre d'Affaires</p>
                     <p className="text-3xl font-black text-amber-400 tracking-tighter">{selectedUserTurnover.toLocaleString()} <span className="text-sm">F</span></p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                     <Zap className="absolute -bottom-4 -right-4 w-20 h-20 opacity-5" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Jetons IA Marketing</p>
                     <p className="text-3xl font-black text-slate-900 tracking-tighter">{selectedUser.marketingCredits || 0} <span className="text-sm opacity-30">PTS</span></p>
                  </div>
               </div>
               <section className="space-y-6">
                  <div className="flex items-center justify-between px-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Notes Mentor</h4>
                  </div>
                  <textarea 
                    value={tempAdminNotes}
                    onChange={e => setTempAdminNotes(e.target.value)}
                    className="w-full p-8 rounded-[2rem] bg-slate-50 border-none outline-none font-medium min-h-[200px]"
                    placeholder="Écrire une note sur ce gérant..."
                  />
                  <button 
                    onClick={handleSaveAdminNotes}
                    disabled={isSavingNotes}
                    className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3"
                  >
                    {isSavingNotes ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Sauvegarder les notes
                  </button>
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