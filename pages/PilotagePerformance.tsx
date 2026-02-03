import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getKitaStaff, 
  addKitaStaff, 
  updateKitaStaff,
  getKitaClients, 
  addKitaClient, 
  deleteKitaStaff,
  getKitaTransactions,
  updateKitaClient,
  getKitaServices,
  addKitaService,
  updateKitaService,
  deleteKitaService,
  bulkAddKitaServices,
  getProfileByPhone,
  updateUserProfile,
  getAllUsers,
  getReferrals
} from '../services/supabase';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ChevronLeft, 
  Users, 
  MessageCircle, 
  Loader2, 
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Scissors,
  TrendingUp,
  Award,
  Crown,
  Ban,
  List,
  Sparkles,
  Wand2,
  Phone,
  AlertCircle,
  Copy,
  Pencil,
  ShieldCheck,
  Smartphone,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { KitaService, KitaTransaction, UserProfile } from '../types';
import { COACH_KITA_PHONE } from '../constants';

const PilotagePerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'staff' | 'commissions' | 'clients' | 'services'>('staff');
  
  const [staff, setStaff] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [referrals, setReferrals] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', commission_rate: 25, specialty: 'Coiffure' });
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<{message: string, code?: string} | null>(null);

  const isUnlocked = user?.hasPerformancePack;

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [staffData, clientsData, serviceData, transData, profilesData, referralsData] = await Promise.all([
        getKitaStaff(user.uid),
        getKitaClients(user.uid),
        getKitaServices(user.uid),
        getKitaTransactions(user.uid),
        getAllUsers(),
        getReferrals(user.uid)
      ]);
      setStaff(staffData);
      setClients(clientsData);
      setServices(serviceData);
      setTransactions(transData);
      setAllProfiles(profilesData);
      setReferrals(referralsData);
    } catch (e: any) {
      setSaveError({ message: "Erreur de chargement." });
    } finally { setLoading(false); }
  };

  // Identification des parrainages pas encore dans kita_staff
  const orphanReferrals = useMemo(() => {
    return referrals.filter(ref => {
      // Uniquement les collaborateurs (pas les autres gérants parrainés)
      if (ref.role !== 'STAFF_ELITE' && ref.role !== 'STAFF_ADMIN') return false;
      // Pas encore présent dans la table kita_staff (comparaison par numéro de téléphone)
      return !staff.some(s => s.phone?.replace(/\D/g,'').endsWith(ref.phoneNumber.replace(/\D/g,'').slice(-10)));
    });
  }, [referrals, staff]);

  const handlePromoteToAdmin = async (phone: string) => {
    const profile = allProfiles.find(p => p.phoneNumber.replace(/\D/g,'').endsWith(phone.replace(/\D/g,'').slice(-10)));
    if (!profile) {
       alert("Aucun compte App trouvé pour ce numéro.");
       return;
    }
    if (window.confirm(`Nommer ${profile.firstName} comme Staff Admin ? Il pourra gérer les dépenses et le marketing IA.`)) {
       await updateUserProfile(profile.uid, { role: 'STAFF_ADMIN' });
       loadData();
    }
  };

  const handleImportReferral = async (ref: UserProfile) => {
    if (saving) return;
    setSaving(true);
    try {
      await addKitaStaff(user!.uid, {
        name: ref.firstName || 'Sans nom',
        phone: ref.phoneNumber,
        commission_rate: 25,
        specialty: 'Coiffure'
      });
      await loadData();
    } catch (e) {
      alert("Erreur lors de l'intégration.");
    } finally {
      setSaving(false);
    }
  };

  const staffStats = useMemo(() => {
    const results: any[] = [];
    staff.forEach(member => {
      const memberTrans = transactions.filter(t => t.staffName === member.name && t.type === 'INCOME' && !t.isCredit);
      const totalCA = memberTrans.reduce((acc, t) => acc + t.amount, 0);
      const totalComm = memberTrans.reduce((acc, t) => acc + (t.amount * (t.commissionRate || 0) / 100), 0);
      const totalTips = memberTrans.reduce((acc, t) => acc + (t.tipAmount || 0), 0);
      results.push({ ...member, totalCA, totalComm, totalTips, count: memberTrans.length });
    });
    return results.sort((a,b) => b.totalCA - a.totalCA);
  }, [staff, transactions]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newStaff.name) return;
    setSaving(true);
    try {
      const saved = await addKitaStaff(user.uid, newStaff);
      if (saved) {
        setStaff([...staff, saved]);
        setShowAddStaffModal(false);
        setNewStaff({ name: '', phone: '', commission_rate: 25, specialty: 'Coiffure' });
      }
    } catch (err: any) {
       setSaveError({ message: "Nom déjà utilisé ou erreur table." });
    } finally { setSaving(false); }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSaving(true);
    try {
      const updated = await updateKitaStaff(editingStaff.id, editingStaff);
      if (updated) {
        setStaff(staff.map(s => s.id === editingStaff.id ? updated : s));
        setShowEditStaffModal(false);
      }
    } finally { setSaving(false); }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
         <KitaTopNav />
         <div className="h-24 w-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8"><Users className="w-12 h-12" /></div>
         <h1 className="text-4xl font-serif font-bold text-white mb-6">Performance RH</h1>
         <button onClick={() => navigate('/results?pack=performance')} className="bg-emerald-500 text-white px-12 py-6 rounded-2xl font-black uppercase text-xs shadow-xl">Activer le Pack RH (5 000 F)</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-20">
      <KitaTopNav />
      <header className="pt-16 pb-32 px-6 relative overflow-hidden bg-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-emerald-500 p-2 rounded-[2rem] shadow-2xl shrink-0 h-20 w-20 flex items-center justify-center"><Users className="h-10 w-10 text-white" /></div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-3 font-black text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Dashboard</button>
              <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Pilotage <span className="text-emerald-500 italic">Performance</span></h1>
            </div>
          </div>
          <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10">
             <button onClick={() => setActiveTab('staff')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Équipe</button>
             <button onClick={() => setActiveTab('commissions')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'commissions' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Performance</button>
             <button onClick={() => setActiveTab('services')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'services' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Services</button>
             <button onClick={() => setActiveTab('clients')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Clients</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-12 relative z-20">
        
        {/* BRIDGE D'INTÉGRATION : Nouveaux parrainages */}
        {orphanReferrals.length > 0 && activeTab === 'staff' && (
           <section className="bg-emerald-50 border-2 border-emerald-500 rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in slide-in-from-top-4 duration-700">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-lg shrink-0">
                    <UserPlus className="w-10 h-10" />
                 </div>
                 <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">Un collaborateur a rejoint l'Élite !</h2>
                    <p className="text-emerald-700 font-medium max-w-xl">Coach Kita a détecté des parrainages actifs qui n'ont pas encore été intégrés à votre tableau de bord financier. Intégrez-les pour piloter leurs revenus.</p>
                 </div>
              </div>
              <div className="mt-10 grid gap-4">
                 {orphanReferrals.map(ref => (
                    <div key={ref.uid} className="bg-white p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between border border-emerald-100 shadow-sm group">
                       <div className="flex items-center gap-6">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 overflow-hidden">
                             {ref.photoURL ? <img src={ref.photoURL} className="w-full h-full object-cover" /> : ref.firstName?.[0]}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">{ref.firstName} {ref.lastName}</p>
                             <p className="text-[10px] font-black text-emerald-600 uppercase">{ref.phoneNumber}</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleImportReferral(ref)}
                        disabled={saving}
                        className="mt-4 sm:mt-0 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-emerald-700 transition-all active:scale-95"
                       >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                          Intégrer à mon équipe
                       </button>
                    </div>
                 ))}
              </div>
           </section>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Équipe Opérationnelle</h3>
                 <button onClick={() => setShowAddStaffModal(true)} className="bg-brand-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all"><Plus className="w-4 h-4" /> Manuel</button>
              </div>
              
              {staff.length === 0 && orphanReferrals.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                   <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Users className="w-10 h-10 text-slate-200" /></div>
                   <h4 className="text-xl font-bold text-slate-400 mb-6 italic">"Votre équipe est vide. Utilisez votre lien de parrainage pour les inviter."</h4>
                   <button onClick={() => navigate('/profile')} className="bg-brand-50 text-brand-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Voir mon lien de parrainage</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map(member => {
                      const profile = allProfiles.find(p => p.phoneNumber.replace(/\D/g,'').endsWith(member.phone?.replace(/\D/g,'').slice(-10) || 'INVALID'));
                      return (
                        <div key={member.id} className="bg-white rounded-[2.5rem] p-8 border group hover:shadow-xl transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                                  {profile?.role === 'STAFF_ADMIN' ? <ShieldCheck className="w-6 h-6" /> : <Scissors className="w-6 h-6" />}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingStaff(member); setShowEditStaffModal(true); }} className="p-2 text-slate-400 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                                  <button onClick={() => deleteKitaStaff(member.id).then(loadData)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{member.specialty} • {member.commission_rate}%</p>
                            
                            {profile ? (
                              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-emerald-700 uppercase">Compte App Actif</span>
                                  </div>
                                  {profile.role !== 'STAFF_ADMIN' && (
                                    <button onClick={() => handlePromoteToAdmin(member.phone)} className="bg-white text-emerald-600 px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all">Nommer Admin</button>
                                  )}
                                  {profile.role === 'STAFF_ADMIN' && <span className="text-[8px] font-black text-emerald-600 uppercase">Admin Salon</span>}
                              </div>
                            ) : member.phone && (
                              <div className="mt-4 flex items-center gap-2 text-slate-400 bg-slate-50 p-4 rounded-2xl">
                                  <Smartphone className="w-3 h-3" />
                                  <span className="text-[10px] font-bold">En attente d'abonnement App</span>
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              )}
          </div>
        )}

        {/* ... Reste du composant sans changement ... */}
        {activeTab === 'commissions' && (
           <div className="space-y-8 animate-in fade-in">
              <div className="px-4"><h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Crown className="w-5 h-5 text-amber-500" /> Podium de Performance</h3></div>
              <div className="grid md:grid-cols-3 gap-6">
                {staffStats.map((member, i) => (
                  <div key={member.id} className={`bg-white rounded-[3rem] p-8 border shadow-sm relative overflow-hidden ${i === 0 ? 'ring-2 ring-amber-400' : ''}`}>
                    {i === 0 && <div className="absolute top-4 right-4 bg-amber-400 text-white p-2 rounded-full animate-bounce"><Award className="w-5 h-5" /></div>}
                    <h4 className="text-xl font-bold mb-6">{member.name}</h4>
                    <div className="space-y-4">
                       <div><p className="text-[9px] font-black text-slate-400 uppercase">CA Salon</p><p className="text-2xl font-black text-slate-900">{member.totalCA.toLocaleString()} F</p></div>
                       <div className="flex justify-between border-t pt-4">
                          <div><p className="text-[9px] font-black text-emerald-600 uppercase">Com.</p><p className="text-lg font-black text-emerald-600">{member.totalComm.toLocaleString()} F</p></div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-amber-600 uppercase">Pourboires 💎</p>
                             <p className="text-lg font-black text-amber-600">{member.totalTips.toLocaleString()} F</p>
                          </div>
                       </div>
                       <div className="bg-slate-900 p-4 rounded-2xl text-center">
                          <p className="text-[8px] font-black text-brand-400 uppercase">Gain Réel Employé</p>
                          <p className="text-xl font-black text-white">{(member.totalComm + member.totalTips).toLocaleString()} F</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>

      {/* Modaux de modification et d'ajout sans changement ... */}
      {showEditStaffModal && editingStaff && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => setShowEditStaffModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Modifier Fiche</h2>
              <form onSubmit={handleEditStaff} className="space-y-6">
                 <input type="text" value={editingStaff.name} onChange={e => setEditingStaff({...editingStaff, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Nom" required />
                 <input type="tel" value={editingStaff.phone || ''} onChange={e => setEditingStaff({...editingStaff, phone: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Numéro WhatsApp" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={editingStaff.commission_rate} onChange={e => setEditingStaff({...editingStaff, commission_rate: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" />
                    <select value={editingStaff.specialty} onChange={e => setEditingStaff({...editingStaff, specialty: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold appearance-none"><option>Coiffure</option><option>Esthétique</option><option>Onglerie</option></select>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Enregistrer
                 </button>
              </form>
           </div>
        </div>
      )}

      {showAddStaffModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddStaffModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Nouveau Staff</h2>
              <form onSubmit={handleAddStaff} className="space-y-6">
                 <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Nom" required />
                 <input type="tel" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Numéro WhatsApp" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={newStaff.commission_rate} onChange={e => setNewStaff({...newStaff, commission_rate: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Com. %" />
                    <select value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold appearance-none"><option>Coiffure</option><option>Esthétique</option><option>Onglerie</option></select>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Créer
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PilotagePerformance;