import { useEffect, useState, useMemo } from 'react';
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
  Eye,
  Globe,
  PenTool,
  ExternalLink,
  MapPin
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

  // GMB Management States
  const [gmbUrlInput, setGmbUrlInput] = useState('');
  const [isUpdatingGMB, setIsUpdatingGMB] = useState(false);

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
      setGmbUrlInput(selectedUser.gmbUrl || '');
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

  const handleValidateGMB = async () => {
    if (!selectedUser || !gmbUrlInput.trim()) {
      showNotify("L'URL Google Maps est requise.", "error");
      return;
    }
    setIsUpdatingGMB(true);
    try {
      await updateUserProfile(selectedUser.uid, { 
        gmbStatus: 'ACTIVE',
        gmbUrl: gmbUrlInput.trim()
      });
      showNotify("Fiche Google Business activée !");
      // Mettre à jour l'utilisateur sélectionné localement pour refléter le changement immédiat
      setSelectedUser({ ...selectedUser, gmbStatus: 'ACTIVE', gmbUrl: gmbUrlInput.trim() });
      fetchUsers();
    } catch (err) {
      showNotify("Erreur lors de la validation GMB", "error");
    } finally {
      setIsUpdatingGMB(false);
    }
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
            <button 
              onClick={() => navigate('/war-room')}
              className="flex items-center gap-3 text-brand-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 hover:text-amber-500 transition-colors group cursor-pointer"
            >
               <Activity className="w-4 h-4 animate-pulse group-hover:scale-125 transition-transform" /> 
               Live Operations — Global HQ
            </button>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 tracking-tighter leading-none">Console de <span className="text-brand-600 italic">Direction</span></h1>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            {stats.pending > 0 && (
              <button onClick={handleActivateAll} disabled={isActivatingAll} className="bg-amber-50 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3">
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
           <AdminStatCard icon={<PenTool />} label="Google Business" val={users.filter(u => u.gmbContractSignedAt).length} sub="Commandes en cours" />
           <AdminStatCard icon={<TrendingUp />} label="Recettes" val={`${stats.revenue.toLocaleString()} F`} />
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
              <thead><tr className="bg-slate-50"><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gérant & Établissement</th><th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut & Business</th><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const certs = Object.values(u.progress || {}).filter(s => Number(s) >= 80).length;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => setSelectedUser(u)}>
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white shrink-0 bg-slate-200 text-slate-400 overflow-hidden`}>
                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" alt="" /> : u.firstName?.[0]}
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
                            <div className="flex items-center gap-2">
                               {u.gmbContractSignedAt ? (
                                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border flex items-center gap-1 ${u.gmbStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-sky-50 text-sky-600 border-sky-100'}`}>
                                    <PenTool className="w-2.5 h-2.5" /> 
                                    {u.gmbStatus === 'ACTIVE' ? 'Google Actif' : 'Google à créer'}
                                  </span>
                               ) : (
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">{certs} / 16 Certifs</span>
                               )}
                            </div>
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
                  <div className="h-32 w-32 rounded-[2.5rem] mx-auto mb-8 bg-white shadow-2xl flex items-center justify-center font-black text-5xl text-slate-200 overflow-hidden border-8 border-white">{selectedUser.photoURL ? <img src={selectedUser.photoURL} className="w-full h-full object-cover" alt="" /> : selectedUser.firstName?.[0]}</div>
                  <h3 className="text-3xl font-bold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <div className="flex items-center justify-center gap-3 mt-4">
                     <button onClick={() => copyToClipboard(selectedUser.phoneNumber)} className="bg-white border px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-50 transition-all"><Copy className="w-3 h-3" /> {selectedUser.phoneNumber}</button>
                     <button onClick={() => window.open(`https://wa.me/${selectedUser.phoneNumber.replace(/\+/g,'')}`, '_blank')} className="bg-emerald-500 text-white p-2 rounded-xl hover:scale-110 transition-all"><MessageCircle className="w-4 h-4" /></button>
                  </div>
               </div>

               {/* PILOTAGE GOOGLE BUSINESS (GMB) DIRECT */}
               {selectedUser.gmbContractSignedAt && (
                 <div className={`rounded-[2.5rem] p-8 border-2 transition-all ${selectedUser.gmbStatus === 'ACTIVE' ? 'bg-emerald-50 border-emerald-100' : 'bg-sky-50 border-sky-100 shadow-xl shadow-sky-100'}`}>
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${selectedUser.gmbStatus === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}`}>
                             <Globe className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className={`text-xl font-bold ${selectedUser.gmbStatus === 'ACTIVE' ? 'text-emerald-900' : 'text-sky-900'}`}>
                                {selectedUser.gmbStatus === 'ACTIVE' ? 'Fiche Google Active' : 'Pilotage Google Business'}
                             </h4>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${selectedUser.gmbStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-sky-600'}`}>
                                Commandé le {new Date(selectedUser.gmbContractSignedAt).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                       {selectedUser.gmbStatus === 'ACTIVE' && (
                         <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full">
                           <CheckCircle2 className="w-6 h-6" />
                         </div>
                       )}
                    </div>

                    <div className="space-y-6">
                       <div>
                          <label className={`block text-[9px] font-black uppercase mb-2 ml-4 ${selectedUser.gmbStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-sky-400'}`}>
                             URL Google Maps (Lien final)
                          </label>
                          <div className="relative group">
                             <MapPin className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${selectedUser.gmbStatus === 'ACTIVE' ? 'text-emerald-300' : 'text-sky-300'}`} />
                             <input 
                               type="text" 
                               placeholder="https://maps.app.goo.gl/..." 
                               value={gmbUrlInput}
                               onChange={e => setGmbUrlInput(e.target.value)}
                               className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold focus:ring-2 focus:ring-sky-500/20 outline-none"
                             />
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button 
                             onClick={handleValidateGMB}
                             disabled={isUpdatingGMB || !gmbUrlInput.trim()}
                             className={`flex-grow py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${
                               selectedUser.gmbStatus === 'ACTIVE' 
                               ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                               : 'bg-brand-900 text-white hover:bg-black'
                             }`}
                          >
                             {isUpdatingGMB ? <Loader2 className="w-5 h-5 animate-spin" /> : selectedUser.gmbStatus === 'ACTIVE' ? <Save className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
                             {selectedUser.gmbStatus === 'ACTIVE' ? 'Mettre à jour le lien' : 'Publier & Activer la Fiche'}
                          </button>
                          
                          {selectedUser.gmbUrl && (
                             <a 
                               href={selectedUser.gmbUrl} 
                               target="_blank" 
                               rel="noreferrer" 
                               className="h-14 w-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-100 transition-all"
                             >
                                <ExternalLink className="w-6 h-6" />
                             </a>
                          )}
                       </div>

                       {selectedUser.gmbStatus !== 'ACTIVE' && (
                         <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                           <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                           <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
                             Action irréversible : L'activation informera le gérant par notification et débloquera son contrat scellé.
                           </p>
                         </div>
                       )}
                    </div>
                 </div>
               )}

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