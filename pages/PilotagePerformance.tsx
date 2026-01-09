
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getKitaStaff, addKitaStaff, getKitaClients, addKitaClient, deleteKitaStaff } from '../services/supabase';
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
  X
} from 'lucide-react';

const PilotagePerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // Modals States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  
  // Forms States
  const [newStaff, setNewStaff] = useState({ name: '', commission_rate: 30, specialty: 'Coiffure' });
  const [newClient, setNewClient] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const isUnlocked = user?.hasPerformancePack;

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [staffData, clientsData] = await Promise.all([
        getKitaStaff(user.uid),
        getKitaClients(user.uid)
      ]);
      setStaff(staffData);
      setClients(clientsData);
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

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Supprimer ce collaborateur ?")) return;
    try {
      await deleteKitaStaff(id);
      setStaff(staff.filter(s => s.id !== id));
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
          <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isUnlocked ? 'Pack RH Actif' : 'Mode Démo'}</span>
             </div>
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

        <div className="grid lg:grid-cols-12 gap-10">
           {/* Section Mon Staff */}
           <div className="lg:col-span-7 space-y-8">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Mon Staff</h3>
                 {isUnlocked && (
                   <button 
                     onClick={() => setShowAddStaffModal(true)} 
                     className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all"
                   >
                     <Plus className="w-4 h-4" /> Ajouter
                   </button>
                 )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                  {staff.length > 0 ? staff.map(member => (
                    <div key={member.id} className="bg-slate-800/50 rounded-[2.5rem] p-8 border border-white/5 relative group">
                        <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{member.specialty} • {member.commission_rate}% Com.</p>
                        <button onClick={() => handleDeleteStaff(member.id)} className="absolute top-6 right-6 p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  )) : (
                    <div className="col-span-2 py-12 text-center text-slate-500 italic border-2 border-dashed border-white/5 rounded-3xl">
                       Aucun collaborateur enregistré
                    </div>
                  )}
              </div>
           </div>

           {/* Section Clients VIP */}
           <div className="lg:col-span-5 space-y-8">
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
                       <div>
                          <p className="font-bold text-white">{c.name}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase">{c.phone}</p>
                       </div>
                       <a href={`https://wa.me/${c.phone?.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500/20 transition-all shadow-inner">
                          <MessageCircle className="w-5 h-5" />
                       </a>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-slate-500 italic">
                       Fichier client vide
                    </div>
                  )}
              </div>
           </div>
        </div>
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
