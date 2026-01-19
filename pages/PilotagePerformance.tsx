
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getKitaStaff, 
  addKitaStaff, 
  getKitaClients, 
  addKitaClient, 
  deleteKitaStaff,
  getKitaTransactions,
  updateKitaClient,
  getKitaServices,
  addKitaService,
  deleteKitaService
} from '../services/supabase';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ChevronLeft, 
  Users, 
  MessageCircle, 
  Loader2, 
  Plus,
  BarChart3,
  Star,
  Trash2,
  CheckCircle2,
  X,
  Book,
  Scissors,
  Eye,
  EyeOff,
  Banknote,
  TrendingUp,
  History,
  Calendar,
  AlertCircle,
  ClipboardList,
  Lock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { KitaService, KitaTransaction } from '../types';

const PilotagePerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'staff' | 'commissions' | 'clients' | 'catalog'>('staff');
  
  // Data States
  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  
  // Modals States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  // Forms States
  const [newStaff, setNewStaff] = useState({ name: '', commissionRate: 30, specialty: 'Coiffure' });
  const [newClient, setNewClient] = useState({ name: '', phone: '', notes: '' });
  const [newService, setNewService] = useState({ name: '', category: 'Coiffure', defaultPrice: 0 });
  const [saving, setSaving] = useState(false);

  const isUnlocked = user?.hasPerformancePack;
  const isCRMActive = useMemo(() => {
    if (user?.isAdmin) return true;
    if (!user?.crmExpiryDate) return false;
    return new Date(user.crmExpiryDate) > new Date();
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [staffData, clientsData, serviceData, transData] = await Promise.all([
        getKitaStaff(user.uid),
        getKitaClients(user.uid),
        getKitaServices(user.uid),
        getKitaTransactions(user.uid)
      ]);
      setStaff(staffData);
      setClients(clientsData);
      setServices(serviceData);
      setTransactions(transData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newStaff.name) return;
    setSaving(true);
    try {
      const saved = await addKitaStaff(user.uid, newStaff);
      if (saved) setStaff([...staff, saved]);
      setShowAddStaffModal(false);
      setNewStaff({ name: '', commissionRate: 30, specialty: 'Coiffure' });
    } catch (err) {
      alert("Erreur.");
    } finally {
      setSaving(false);
    }
  };

  const staffCommissions = useMemo(() => {
    const results: any = {};
    staff.forEach(member => {
      const memberTrans = transactions.filter(t => t.staffName === member.name && t.type === 'INCOME');
      const totalPresta = memberTrans.reduce((acc, t) => acc + t.amount, 0);
      const totalComm = memberTrans.reduce((acc, t) => acc + (t.amount * (t.commissionRate || 0) / 100), 0);
      results[member.name] = { totalPresta, totalComm, count: memberTrans.length };
    });
    return results;
  }, [staff, transactions]);

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Supprimer ce collaborateur ?")) return;
    try {
      await deleteKitaStaff(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      alert("Erreur.");
    }
  };

  const handleUpdateClientNotes = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      await updateKitaClient(selectedClient.id, { notes: selectedClient.notes });
      await loadData();
      setSelectedClient(null);
    } catch (err) {
      alert("Erreur CRM.");
    } finally {
      setSaving(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
         <KitaTopNav />
         <div className="h-24 w-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 mt-20"><Users className="w-12 h-12" /></div>
         <h1 className="text-4xl font-serif font-bold text-white mb-6">Pilotez votre Performance</h1>
         <p className="text-slate-400 max-w-lg mb-12">Gérez les commissions de votre staff et votre fichier client VIP en toute transparence.</p>
         <button onClick={() => navigate('/results?pack=performance')} className="bg-emerald-500 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">Activer le Pack RH (5 000 F)</button>
      </div>
    );
  }

  const LockedScreen = () => (
    <div className="py-24 text-center animate-in zoom-in-95 px-6">
       <div className="h-24 w-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-rose-100">
          <Lock className="w-10 h-10" />
       </div>
       <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Pack Fidélité Expiré</h3>
       <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
          Pour accéder aux commissions détaillées, aux notes VIP et aux relances automatiques, activez votre abonnement CRM.
       </p>
       <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl inline-block">
          <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-2">Offre de Croissance</p>
          <p className="text-4xl font-black text-slate-900 mb-6 text-center">500 F <span className="text-sm opacity-30 uppercase text-center">/ mois</span></p>
          <button onClick={() => navigate('/results?pack=crm')} className="bg-brand-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:scale-105 transition-all flex items-center gap-3 justify-center">
             <Zap className="w-4 h-4 text-amber-400" /> Activer mon CRM <ArrowRight className="w-4 h-4" />
          </button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-20">
      <KitaTopNav />
      <header className="pt-16 pb-32 px-6 relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><BarChart3 className="w-96 h-96 text-emerald-500" /></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="bg-emerald-500 p-2 rounded-[2rem] shadow-2xl shrink-0 h-20 w-20 flex items-center justify-center">
               <Users className="h-10 w-10 text-white" />
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center md:justify-start gap-2 text-slate-500 hover:text-white transition mb-3 font-black text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Dashboard</button>
              <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Ressources <span className="text-emerald-500 italic">Humaines</span></h1>
            </div>
          </div>
          <div className="flex justify-center bg-white/5 p-1.5 rounded-[2rem] border border-white/10 overflow-x-auto max-w-full">
             <button onClick={() => setActiveTab('staff')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'staff' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Staff</button>
             <button onClick={() => setActiveTab('commissions')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'commissions' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Commissions</button>
             <button onClick={() => setActiveTab('clients')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'clients' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>CRM VIP</button>
             <button onClick={() => setActiveTab('catalog')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'catalog' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Catalogue</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-12 relative z-20">
        {loading ? (
          <div className="py-24 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" /></div>
        ) : activeTab === 'staff' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 text-center">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex justify-center items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Mon Équipe</h3>
                 <button onClick={() => setShowAddStaffModal(true)} className="w-full sm:w-auto bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl"><Plus className="w-4 h-4" /> Nouveau</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map(member => (
                    <div key={member.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 relative group hover:shadow-xl transition-all text-center md:text-left">
                        <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0"><Scissors className="w-6 h-6" /></div>
                        <h4 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{member.specialty} • {member.commissionRate}% Commission</p>
                        <button onClick={() => handleDeleteStaff(member.id)} className="absolute top-6 right-6 p-2 text-slate-200 hover:text-rose-500 md:opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
              </div>
          </div>
        ) : activeTab === 'commissions' ? (
          !isCRMActive ? <LockedScreen /> : (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="px-4 text-center md:text-left"><h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-3 text-slate-50"><Banknote className="w-5 h-5 text-amber-500" /> Suivi des Commissions</h3></div>
                <div className="grid md:grid-cols-2 gap-6">
                  {staff.map(member => {
                    const data = staffCommissions[member.name] || { totalPresta: 0, totalComm: 0, count: 0 };
                    return (
                      <div key={member.id} className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:shadow-2xl transition-all gap-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="h-20 w-20 bg-amber-50 text-amber-600 rounded-[1.5rem] flex flex-col items-center justify-center font-black shadow-inner shrink-0">
                              <span className="text-2xl">{member.name[0]}</span>
                              <span className="text-[8px] uppercase">{member.commissionRate}%</span>
                            </div>
                            <div>
                              <p className="font-serif font-bold text-slate-900 text-2xl mb-1">{member.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2"><History className="w-3 h-3" /> {data.count} prestations réalisées</p>
                            </div>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 text-center md:text-right">Dû au collaborateur</p>
                            <p className="text-3xl font-black text-emerald-600 text-center md:text-right">{data.totalComm.toLocaleString()} F</p>
                            <p className="text-[10px] font-bold text-slate-300 mt-1 text-center md:text-right">Sur {data.totalPresta.toLocaleString()} F de CA</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
          )
        ) : activeTab === 'clients' ? (
          !isCRMActive ? <LockedScreen /> : (
            <div className="space-y-8 animate-in fade-in duration-300 text-center">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] flex justify-center items-center gap-3 text-slate-500"><Star className="w-5 h-5 text-amber-500" /> Mini-CRM Excellence</h3>
                  <button onClick={() => setShowAddClientModal(true)} className="w-full sm:w-auto bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-amber-600 transition-all"><Plus className="w-4 h-4" /> Nouveau Client</button>
                </div>
                <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                    {clients.length > 0 ? clients.map(c => {
                      const lastVisitDate = c.lastVisit ? new Date(c.lastVisit) : null;
                      const daysSinceLast = lastVisitDate ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
                      const isSilent = daysSinceLast !== null && daysSinceLast > 30;

                      return (
                        <div key={c.id} className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50 transition-all group gap-6 text-center md:text-left">
                          <div className="flex flex-col md:flex-row items-center gap-6 flex-grow">
                              <div className="relative">
                                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-2xl group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors shrink-0">{c.name[0]}</div>
                                {isSilent && <div className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse"><AlertCircle className="w-3 h-3 text-white" /></div>}
                              </div>
                              <div>
                                <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                                  <p className="font-bold text-slate-900 text-lg">{c.name}</p>
                                  {c.totalSpent > 10000 && <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">VIP GOLD</span>}
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><History className="w-3 h-3" /> {c.totalVisits || 0} visites</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> {lastVisitDate ? `Dernière : ${lastVisitDate.toLocaleDateString()}` : 'Jamais venue'}</p>
                                </div>
                                {c.notes && <p className="text-xs text-slate-500 italic mt-2 line-clamp-1">"{c.notes}"</p>}
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-center">
                              <button onClick={() => setSelectedClient(c)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all"><ClipboardList className="w-5 h-5" /></button>
                              <a 
                                href={`https://wa.me/${c.phone?.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour ${c.name}, Coach Kita ici au salon ${user?.establishmentName}. Nous avons hâte de vous revoir pour votre prochaine mise en beauté !`)}`} 
                                target="_blank" rel="noreferrer" 
                                className={`flex-grow md:flex-grow-0 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm ${isSilent ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}
                              >
                                <MessageCircle className="w-4 h-4" /> Relancer
                              </a>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="py-20 text-center text-slate-400 italic">Aucun client enregistré.</div>
                    )}
                </div>
            </div>
          )
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300 text-center">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex justify-center items-center gap-3 text-slate-500"><Book className="w-5 h-5 text-indigo-500" /> Catalogue des Prestations</h3>
                 <button onClick={() => setShowAddServiceModal(true)} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-700 transition-all"><Plus className="w-4 h-4" /> Ajouter Service</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {services.map(s => (
                   <div key={s.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all group text-center md:text-left ${s.isActive ? 'border-slate-100' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between items-start mb-6">
                         <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mx-auto md:mx-0">{s.category}</span>
                         <div className="flex items-center gap-2">
                            <button onClick={() => deleteKitaService(s.id).then(loadData)} className="p-2 text-slate-200 hover:text-rose-500 md:opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{s.name}</h4>
                      <p className="text-2xl font-black text-indigo-600">{s.defaultPrice > 0 ? `${s.defaultPrice.toLocaleString()} F` : 'Prix libre'}</p>
                   </div>
                 ))}
              </div>
          </div>
        )}
      </div>

      {/* MODAL FICHE CLIENT (CRM) */}
      {selectedClient && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative animate-in zoom-in-95">
              <button onClick={() => setSelectedClient(null)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500"><X /></button>
              <div className="text-center mb-8">
                <div className="h-20 w-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><ClipboardList className="w-10 h-10" /></div>
                <h2 className="text-3xl font-serif font-bold text-slate-900">{selectedClient.name}</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">{selectedClient.phone}</p>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-4 text-center">Préférences & Historique Technique</label>
                    <textarea 
                      value={selectedClient.notes || ''} 
                      onChange={e => setSelectedClient({...selectedClient, notes: e.target.value})}
                      placeholder="N'aime pas le bac à gauche, mélange couleur 6.3+7.0, préfère le café noir..."
                      className="w-full p-8 rounded-[2rem] bg-slate-50 border-none outline-none font-medium text-slate-700 min-h-[150px] resize-none focus:ring-2 focus:ring-brand-500/20"
                    />
                 </div>
                 <button onClick={handleUpdateClientNotes} disabled={saving} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4">
                    {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Enregistrer les préférences
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL AJOUT STAFF */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddStaffModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Nouveau Collaborateur</h2>
              <form onSubmit={handleAddStaff} className="space-y-6">
                 <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom complet</label><input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Mme Sanogo" required /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Commission (%)</label><input type="number" value={newStaff.commissionRate} onChange={e => setNewStaff({...newStaff, commissionRate: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Spécialité</label><select value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 appearance-none"><option>Coiffure</option><option>Esthétique</option><option>Maquillage</option><option>Onglerie</option></select></div>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all">{saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL AJOUT CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddClientModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Inscrire un VIP</h2>
              <form onSubmit={async (e) => {
                 e.preventDefault(); setSaving(true);
                 const saved = await addKitaClient(user!.uid, newClient);
                 if (saved) setClients([...clients, saved]);
                 setShowAddClientModal(false); setSaving(false); setNewClient({name:'', phone:'', notes:''});
              }} className="space-y-6">
                 <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom de la cliente</label><input type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Mme Konan" required /></div>
                 <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">WhatsApp</label><input type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="+225 00000000" /></div>
                 <button type="submit" disabled={saving} className="w-full bg-amber-500 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-amber-600 transition-all">{saving ? <Loader2 className="animate-spin" /> : <Star />} Ajouter au CRM VIP</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL AJOUT SERVICE */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddServiceModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Créer une Prestation</h2>
              <form onSubmit={async (e) => {
                 e.preventDefault(); setSaving(true);
                 const saved = await addKitaService(user!.uid, newService);
                 if (saved) setServices([...services, saved]);
                 setShowAddServiceModal(false); setSaving(false); setNewService({name:'', category:'Coiffure', defaultPrice:0});
              }} className="space-y-6">
                 <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Titre du service</label><input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Massage Crânien VIP" required /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Prix (F)</label><input type="number" value={newService.defaultPrice} onChange={e => setNewService({...newService, defaultPrice: Number(e.target.value)})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Catégorie</label><select value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 appearance-none"><option>Coiffure</option><option>Esthétique</option><option>Vente</option><option>Massage</option></select></div>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all">{saving ? <Loader2 className="animate-spin" /> : <Plus />} Ajouter au catalogue</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PilotagePerformance;
