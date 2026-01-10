
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getKitaStaff, 
  addKitaStaff, 
  getKitaClients, 
  addKitaClient, 
  deleteKitaStaff,
  getKitaServices,
  addKitaService,
  updateKitaService,
  deleteKitaService
} from '../services/supabase';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ChevronLeft, 
  Users, 
  ShieldCheck, 
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
  Edit2,
  Eye,
  EyeOff
} from 'lucide-react';
import { KitaService } from '../types';

const PilotagePerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'staff' | 'clients' | 'catalog'>('staff');
  
  // Data States
  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  
  // Modals States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  
  // Forms States
  const [newStaff, setNewStaff] = useState({ name: '', commission_rate: 30, specialty: 'Coiffure' });
  const [newClient, setNewClient] = useState({ name: '', phone: '' });
  const [newService, setNewService] = useState({ name: '', category: 'Coiffure', defaultPrice: 0 });
  const [saving, setSaving] = useState(false);

  const isUnlocked = user?.hasPerformancePack;

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [staffData, clientsData, serviceData] = await Promise.all([
        getKitaStaff(user.uid),
        getKitaClients(user.uid),
        getKitaServices(user.uid)
      ]);
      setStaff(staffData);
      setClients(clientsData);
      setServices(serviceData);
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
      setNewStaff({ name: '', commission_rate: 30, specialty: 'Coiffure' });
    } catch (err) {
      alert("Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClient.name) return;
    setSaving(true);
    try {
      const saved = await addKitaClient(user.uid, newClient);
      if (saved) setClients([...clients, saved]);
      setShowAddClientModal(false);
      setNewClient({ name: '', phone: '' });
    } catch (err) {
      alert("Erreur lors de l'ajout du client.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newService.name) return;
    setSaving(true);
    try {
      const saved = await addKitaService(user.uid, { ...newService, isActive: true });
      if (saved) setServices([...services, saved]);
      setShowAddServiceModal(false);
      setNewService({ name: '', category: 'Coiffure', defaultPrice: 0 });
    } catch (err) {
      alert("Erreur catalogue.");
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceStatus = async (s: KitaService) => {
    try {
      await updateKitaService(s.id, { isActive: !s.isActive });
      setServices(services.map(item => item.id === s.id ? { ...item, isActive: !item.isActive } : item));
    } catch (err) {
      alert("Erreur mise à jour.");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Supprimer ce collaborateur ?")) return;
    try {
      await deleteKitaStaff(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      alert("Erreur suppression.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Supprimer cette prestation du catalogue ?")) return;
    try {
      await deleteKitaService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      alert("Erreur suppression.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-20">
      <KitaTopNav />
      <header className="pt-16 pb-32 px-6 relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><BarChart3 className="w-96 h-96 text-emerald-500" /></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-8">
          <div className="flex gap-6">
            <div className="bg-emerald-500 p-2 rounded-[2rem] shadow-2xl shrink-0 h-20 w-20 flex items-center justify-center">
               <Users className="h-10 w-10 text-white" />
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-3 font-black text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Dashboard</button>
              <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Ressources <span className="text-emerald-500 italic">Humaines</span></h1>
            </div>
          </div>
          <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10">
             <button onClick={() => setActiveTab('staff')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Staff</button>
             <button onClick={() => setActiveTab('clients')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Clients VIP</button>
             <button onClick={() => setActiveTab('catalog')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Catalogue</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-12 relative z-20">
        {!isUnlocked && (
          <div className="bg-emerald-500 rounded-[3rem] p-10 text-white shadow-2xl">
             <div className="max-w-2xl space-y-6">
                <h2 className="text-3xl font-serif font-bold">Pilotez votre Staff & Vos Clients</h2>
                <p className="text-slate-100 font-medium">Automatisez les commissions et gérez votre fichier client VIP.</p>
                <button onClick={() => navigate('/results?pack=performance')} className="bg-white text-brand-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Activer Ressources Humaines</button>
             </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" /></div>
        ) : activeTab === 'staff' ? (
          <div className="space-y-8">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Mon Staff</h3>
                 {isUnlocked && (
                   <button 
                     onClick={() => setShowAddStaffModal(true)} 
                     className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all"
                   >
                     <Plus className="w-4 h-4" /> Ajouter Collaborateur
                   </button>
                 )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.length > 0 ? staff.map(member => (
                    <div key={member.id} className="bg-slate-800/50 rounded-[2.5rem] p-8 border border-white/5 relative group hover:bg-slate-800 transition-all">
                        <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-6">
                           <Scissors className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{member.specialty} • {member.commission_rate}% Com.</p>
                        <button onClick={() => handleDeleteStaff(member.id)} className="absolute top-6 right-6 p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-24 text-center text-slate-500 italic border-2 border-dashed border-white/5 rounded-[3rem]">
                       Aucun collaborateur enregistré
                    </div>
                  )}
              </div>
          </div>
        ) : activeTab === 'clients' ? (
          <div className="space-y-8">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Star className="w-5 h-5 text-amber-500" /> Clients VIP</h3>
                 {isUnlocked && (
                   <button 
                    onClick={() => setShowAddClientModal(true)} 
                    className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-600 transition-all"
                   >
                    <Plus className="w-4 h-4" /> Ajouter Client
                   </button>
                 )}
              </div>
              <div className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden">
                  {clients.length > 0 ? clients.map(c => (
                    <div key={c.id} className="p-8 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center font-black text-amber-500">
                             {c.name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{c.name}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase">{c.phone}</p>
                          </div>
                       </div>
                       <a href={`https://wa.me/${c.phone?.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500/20 transition-all shadow-inner">
                          <MessageCircle className="w-5 h-5" />
                       </a>
                    </div>
                  )) : (
                    <div className="p-20 text-center text-slate-500 italic">
                       Fichier client vide
                    </div>
                  )}
              </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Book className="w-5 h-5 text-brand-500" /> Catalogue des Prestations</h3>
                 <button 
                   onClick={() => setShowAddServiceModal(true)} 
                   className="bg-brand-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-600 transition-all"
                 >
                   <Plus className="w-4 h-4" /> Nouveau Service
                 </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {services.map(s => (
                   <div key={s.id} className={`bg-slate-800/50 p-8 rounded-[2.5rem] border transition-all group ${s.isActive ? 'border-white/5' : 'border-white/5 opacity-40 grayscale'}`}>
                      <div className="flex justify-between items-start mb-6">
                         <span className="bg-white/10 text-slate-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{s.category}</span>
                         <div className="flex items-center gap-2">
                            <button onClick={() => toggleServiceStatus(s)} className={`p-2 rounded-lg transition-all ${s.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-500/10'}`}>
                               {s.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDeleteService(s.id)} className="p-2 text-slate-500 hover:text-rose-500">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{s.name}</h4>
                      <p className="text-2xl font-black text-emerald-500">{s.defaultPrice > 0 ? `${s.defaultPrice.toLocaleString()} F` : 'Prix libre'}</p>
                   </div>
                 ))}
              </div>
          </div>
        )}
      </div>

      {/* Modal Ajouter Staff */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowAddStaffModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Nouveau Collaborateur</h2>
              <form onSubmit={handleAddStaff} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nom complet</label>
                    <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Jean Dupont" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Commission (%)</label>
                       <input type="number" value={newStaff.commission_rate} onChange={e => setNewStaff({...newStaff, commission_rate: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Spécialité</label>
                       <select value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 appearance-none">
                          <option>Coiffure</option>
                          <option>Manucure</option>
                          <option>Soins Visage</option>
                          <option>Mèches</option>
                       </select>
                    </div>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all mt-4">
                    {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Valider l'inscription
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal Ajouter Service */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowAddServiceModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Nouveau Service</h2>
              <form onSubmit={handleAddService} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nom de la prestation</label>
                    <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Tissage Pro" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Prix Standard (F)</label>
                       <input type="number" value={newService.defaultPrice} onChange={e => setNewService({...newService, defaultPrice: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Catégorie</label>
                       <select value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 appearance-none">
                          <option>Coiffure</option>
                          <option>Esthétique</option>
                          <option>Massage</option>
                          <option>Vente</option>
                          <option>Général</option>
                       </select>
                    </div>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-brand-500 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-brand-600 transition-all mt-4">
                    {saving ? <Loader2 className="animate-spin" /> : <Scissors className="w-5 h-5" />} Ajouter au catalogue
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal Ajouter Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowAddClientModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Nouveau Client VIP</h2>
              <form onSubmit={handleAddClient} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nom du Client</label>
                    <input type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Mme Koné" required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Numéro WhatsApp</label>
                    <input type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="+225 0000..." required />
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-amber-500 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-amber-600 transition-all mt-4">
                    {saving ? <Loader2 className="animate-spin" /> : <Star className="w-5 h-5" />} Enregistrer le VIP
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PilotagePerformance;
