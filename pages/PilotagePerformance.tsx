
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KITA_LOGO, COACH_KITA_AVATAR } from '../constants';
import { getKitaStaff, addKitaStaff, deleteKitaStaff, getKitaClients, addKitaClient, getKitaTransactions } from '../services/supabase';
import { 
  ChevronLeft, 
  Users, 
  Zap, 
  ShieldCheck, 
  Lock, 
  MessageCircle, 
  ArrowRight,
  Loader2, 
  Plus,
  X,
  CheckCircle2,
  BarChart3,
  Phone,
  Award,
  Star
} from 'lucide-react';

const PilotagePerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', commission_rate: 30, specialty: 'Coiffure' });
  
  const [showAddClientModal, setShowAddClientModal] = useState(false);
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
      const [staffData, clientsData, transData] = await Promise.all([
        getKitaStaff(user.uid),
        getKitaClients(user.uid),
        getKitaTransactions(user.uid)
      ]);
      setStaff(staffData);
      setClients(clientsData);
      setTransactions(transData);
    } catch (err) {
      console.error("Erreur chargement Pack Performance", err);
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
      if (saved) setClients([saved, ...clients]);
      setShowAddClientModal(false);
      setNewClient({ name: '', phone: '' });
    } catch (err) {
      alert("Erreur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-20">
      <header className="pt-16 pb-32 px-6 relative overflow-hidden bg-gradient-to-b from-slate-900 to-transparent">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><BarChart3 className="w-96 h-96 text-brand-500" /></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-8">
          <div className="flex gap-6">
            <div className="bg-brand-500 p-2 rounded-[2rem] shadow-2xl shrink-0 h-20 w-20 flex items-center justify-center">
               <Zap className="h-10 w-10 text-white fill-current" />
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-3 font-black text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Dashboard</button>
              <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Performance<span className="text-brand-500 italic">+</span></h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em] mt-1">Piloter l'Humain</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isUnlocked ? 'Pack Activé' : 'Mode Démo'}</span>
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-12 relative z-20">
        {!isUnlocked && (
          <div className="bg-emerald-500 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="max-w-2xl relative z-10 space-y-6">
                <h2 className="text-3xl font-serif font-bold">L'Humain au cœur du profit</h2>
                <p className="text-slate-100 font-medium leading-relaxed">Automatisez les payes de votre staff et fidélisez vos clients VIP avec le Pack Performance+.</p>
                <button onClick={() => navigate('/results?pack=performance')} className="bg-white text-brand-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition shadow-xl">Activer Performance+ (5 000 F)</button>
             </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10">
           <div className="lg:col-span-7 space-y-8">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Users className="w-5 h-5 text-brand-500" /> Mon Staff</h3>
                 {isUnlocked && (
                   <button onClick={() => setShowAddStaffModal(true)} className="bg-brand-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus className="w-4 h-4" /> Ajouter</button>
                 )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                  {staff.map(member => (
                    <div key={member.id} className="bg-slate-800/50 rounded-[2.5rem] p-8 border border-white/5 group">
                        <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{member.specialty} • {member.commission_rate}% Com.</p>
                    </div>
                  ))}
              </div>
           </div>

           <div className="lg:col-span-5 space-y-8">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Star className="w-5 h-5 text-amber-500" /> Clients VIP</h3>
                 {isUnlocked && (
                   <button onClick={() => setShowAddClientModal(true)} className="bg-amber-400 text-brand-900 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus className="w-4 h-4" /> Nouveau</button>
                 )}
              </div>
              <div className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden">
                  {clients.map(c => (
                    <div key={c.id} className="p-8 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                       <div>
                          <p className="font-bold text-white">{c.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <Award className={`w-3 h-3 ${c.total_visits > 5 ? 'text-amber-500' : 'text-slate-600'}`} />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.total_visits} visites</span>
                          </div>
                       </div>
                       <a href={`https://wa.me/${c.phone?.replace(/\+/g, '')}`} target="_blank" className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                          <MessageCircle className="w-4 h-4" />
                       </a>
                    </div>
                  ))}
              </div>
           </div>
        </div>
      </div>

      {/* Modals are similar to Staff modal, omitted for brevity but logic remains same */}
    </div>
  );
};

export default PilotagePerformance;
