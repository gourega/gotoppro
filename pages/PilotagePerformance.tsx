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
  getProfileByPhone,
  updateUserProfile,
  getAllUsers,
  getReferrals
} from '../services/supabase';
import KitaTopNav from '../components/KitaTopNav';
import { 
  ChevronLeft, 
  Users, 
  Loader2, 
  CheckCircle2,
  X,
  Scissors,
  TrendingUp,
  Award,
  Crown,
  Sparkles,
  Phone,
  AlertCircle,
  Pencil,
  ShieldCheck,
  Smartphone,
  UserPlus,
  ArrowRight,
  Settings2,
  ShieldAlert,
  UserCheck,
  // Fix: Add missing AlertTriangle icon import from lucide-react
  AlertTriangle
} from 'lucide-react';
import { KitaService, KitaTransaction, UserProfile } from '../types';

const PilotagePerformance: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'staff' | 'commissions' | 'clients' | 'services'>('staff');
  
  const [staffConfigs, setStaffConfigs] = useState<any[]>([]); // Données de kita_staff
  const [referrals, setReferrals] = useState<UserProfile[]>([]); // Données des profils parrainés
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<UserProfile | null>(null);
  const [configData, setConfigData] = useState({ commission_rate: 25, isAdmin: false, specialty: 'Coiffure' });
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isUnlocked = user?.hasPerformancePack;

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [staffData, clientsData, serviceData, transData, referralsData] = await Promise.all([
        getKitaStaff(user.uid),
        getKitaClients(user.uid),
        getKitaServices(user.uid),
        getKitaTransactions(user.uid),
        getReferrals(user.uid)
      ]);
      setStaffConfigs(staffData);
      setClients(clientsData);
      setServices(serviceData);
      setTransactions(transData);
      setReferrals(referralsData);
    } catch (e: any) {
      setSaveError("Erreur de chargement des données.");
    } finally { setLoading(false); }
  };

  // Filtrage des parrainages pour ne garder que le STAFF
  const staffReferrals = useMemo(() => {
    return referrals.filter(ref => ref.role === 'STAFF_ELITE' || ref.role === 'STAFF_ADMIN');
  }, [referrals]);

  const handleOpenConfig = (collab: UserProfile) => {
    const existingConfig = staffConfigs.find(s => s.phone?.replace(/\D/g,'').endsWith(collab.phoneNumber.replace(/\D/g,'').slice(-10)));
    setSelectedCollab(collab);
    setConfigData({
      commission_rate: existingConfig ? existingConfig.commission_rate : 25,
      isAdmin: collab.role === 'STAFF_ADMIN',
      specialty: existingConfig ? existingConfig.specialty : 'Coiffure'
    });
    setShowConfigModal(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollab || !user) return;
    setSaving(true);
    setSaveError(null);

    try {
      const phoneMatch = selectedCollab.phoneNumber;
      const existingConfig = staffConfigs.find(s => s.phone?.replace(/\D/g,'').endsWith(phoneMatch.replace(/\D/g,'').slice(-10)));
      
      // 1. Mise à jour ou création de la config de commission (kita_staff)
      if (existingConfig) {
        await updateKitaStaff(existingConfig.id, { 
          commission_rate: configData.commission_rate,
          specialty: configData.specialty,
          name: `${selectedCollab.firstName} ${selectedCollab.lastName}`.trim(),
          phone: selectedCollab.phoneNumber
        });
      } else {
        await addKitaStaff(user.uid, {
          name: `${selectedCollab.firstName} ${selectedCollab.lastName}`.trim(),
          phone: selectedCollab.phoneNumber,
          commission_rate: configData.commission_rate,
          specialty: configData.specialty
        });
      }

      // 2. Mise à jour du rôle si changement admin
      const newRole = configData.isAdmin ? 'STAFF_ADMIN' : 'STAFF_ELITE';
      if (selectedCollab.role !== newRole) {
        await updateUserProfile(selectedCollab.uid, { role: newRole });
      }

      await loadData();
      setShowConfigModal(false);
    } catch (err) {
      setSaveError("Échec de la sauvegarde des paramètres.");
    } finally {
      setSaving(false);
    }
  };

  const staffStats = useMemo(() => {
    const results: any[] = [];
    staffReferrals.forEach(collab => {
      const config = staffConfigs.find(s => s.phone?.replace(/\D/g,'').endsWith(collab.phoneNumber.replace(/\D/g,'').slice(-10)));
      const memberName = `${collab.firstName} ${collab.lastName}`.trim();
      
      const memberTrans = transactions.filter(t => 
        (t.staffName === memberName || t.staffName === collab.firstName) && 
        t.type === 'INCOME' && !t.isCredit
      );
      
      const totalCA = memberTrans.reduce((acc, t) => acc + t.amount, 0);
      const totalComm = memberTrans.reduce((acc, t) => acc + (t.amount * (t.commissionRate || 0) / 100), 0);
      const totalTips = memberTrans.reduce((acc, t) => acc + (t.tipAmount || 0), 0);
      
      results.push({ 
        ...collab, 
        totalCA, 
        totalComm, 
        totalTips, 
        count: memberTrans.length,
        commission_rate: config?.commission_rate || 0
      });
    });
    return results.sort((a,b) => b.totalCA - a.totalCA);
  }, [staffReferrals, staffConfigs, transactions]);

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
        
        {activeTab === 'staff' && (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Mon Équipe Élite</h3>
              </div>
              
              {staffReferrals.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-xl">
                   <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><UserPlus className="w-10 h-10 text-slate-200" /></div>
                   <h4 className="text-xl font-bold text-slate-400 mb-6 italic">"Aucun collaborateur parrainé détecté."</h4>
                   <p className="text-slate-500 mb-10 max-w-sm mx-auto">Invitez vos employés à rejoindre Go'Top Pro avec votre lien de parrainage pour les voir apparaître ici.</p>
                   <button onClick={() => navigate('/profile')} className="bg-brand-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Générer mon lien de parrainage</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffReferrals.map(collab => {
                      const config = staffConfigs.find(s => s.phone?.replace(/\D/g,'').endsWith(collab.phoneNumber.replace(/\D/g,'').slice(-10)));
                      const isConfigured = !!config;
                      
                      return (
                        <div key={collab.uid} className="bg-white rounded-[2.5rem] p-8 border-2 transition-all group hover:shadow-xl relative overflow-hidden border-slate-100">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 p-1 shadow-inner relative overflow-hidden border border-slate-100">
                                  {collab.photoURL ? <img src={collab.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-2xl">{collab.firstName?.[0]}</div>}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {collab.role === 'STAFF_ADMIN' ? (
                                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-amber-100 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Staff Admin</span>
                                  ) : (
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-emerald-100">Collaborateur</span>
                                  )}
                                  {!isConfigured && <span className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-rose-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> À configurer</span>}
                                </div>
                            </div>

                            <h4 className="text-xl font-bold text-slate-900 mb-1">{collab.firstName} {collab.lastName}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{collab.phoneNumber}</p>
                            
                            <div className="space-y-4">
                              <div className="flex justify-between items-center py-3 border-t border-slate-50">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">Commission</span>
                                 <span className="font-black text-brand-900">{isConfigured ? `${config.commission_rate}%` : '—'}</span>
                              </div>
                              <div className="flex justify-between items-center py-3 border-t border-slate-50">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">Spécialité</span>
                                 <span className="font-bold text-slate-600 text-xs">{isConfigured ? config.specialty : '—'}</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleOpenConfig(collab)}
                              className="w-full mt-6 bg-slate-50 group-hover:bg-brand-900 group-hover:text-white text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-slate-100 group-hover:border-brand-900"
                            >
                               <Settings2 className="w-4 h-4" /> Configurer
                            </button>
                        </div>
                      );
                    })}
                </div>
              )}
          </div>
        )}

        {activeTab === 'commissions' && (
           <div className="space-y-8 animate-in fade-in">
              <div className="px-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Crown className="w-5 h-5 text-amber-500" /> Podium de Performance</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Prestations : {transactions.filter(t => t.type === 'INCOME' && !t.isCredit).length}</p>
              </div>
              
              {staffStats.length === 0 ? (
                 <div className="bg-white rounded-[3rem] p-20 text-center border shadow-sm italic text-slate-400">"Aucune prestation enregistrée pour le moment."</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffStats.map((member, i) => (
                    <div key={member.uid} className={`bg-white rounded-[3rem] p-8 border shadow-sm relative overflow-hidden transition-all hover:shadow-xl ${i === 0 ? 'ring-4 ring-amber-400' : ''}`}>
                      {i === 0 && <div className="absolute top-6 right-6 bg-amber-400 text-white p-2.5 rounded-full animate-bounce shadow-lg"><Award className="w-6 h-6" /></div>}
                      
                      <div className="flex items-center gap-4 mb-8">
                         <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-50 border shadow-inner">
                            {member.photoURL ? <img src={member.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-slate-300">{member.firstName?.[0]}</div>}
                         </div>
                         <div>
                            <h4 className="text-xl font-bold">{member.firstName}</h4>
                            <p className="text-[9px] font-black text-emerald-600 uppercase">Config: {member.commission_rate}%</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex justify-between items-end">
                            <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">CA Généré</p><p className="text-3xl font-black text-slate-900 tracking-tighter">{member.totalCA.toLocaleString()} F</p></div>
                            <div className="text-right"><p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Commissions</p><p className="text-lg font-black text-emerald-600">{member.totalComm.toLocaleString()} F</p></div>
                         </div>
                         
                         <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex justify-between items-center">
                             <p className="text-[9px] font-black text-amber-700 uppercase flex items-center gap-2"><Sparkles className="w-3 h-3" /> Pourboires 💎</p>
                             <p className="text-xl font-black text-amber-600">{member.totalTips.toLocaleString()} F</p>
                         </div>

                         <div className="bg-slate-900 p-5 rounded-[2rem] text-center shadow-xl group">
                            <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-1">Revenu Total Collaborateur</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{(member.totalComm + member.totalTips).toLocaleString()} <span className="text-sm font-bold opacity-30">F</span></p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        )}

        {/* ... Rest of components (clients, services) remain unchanged ... */}
        {activeTab === 'services' && (
           <div className="bg-white rounded-[3rem] p-10 border shadow-xl animate-in fade-in">
              <h3 className="text-xl font-serif font-bold mb-8">Catalogue des Services</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {services.map(s => (
                   <div key={s.id} className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">{s.category}</p>
                        <p className="font-bold text-slate-800">{s.name}</p>
                      </div>
                      <p className="font-black text-emerald-600">{s.defaultPrice.toLocaleString()} F</p>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* MODAL DE CONFIGURATION UNIQUE */}
      {showConfigModal && selectedCollab && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 md:p-14 relative animate-in zoom-in-95">
              <button onClick={() => setShowConfigModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              
              <div className="text-center mb-10">
                 <div className="h-20 w-20 rounded-[2rem] mx-auto mb-6 bg-slate-100 p-1 shadow-inner overflow-hidden border-2 border-white">
                    {selectedCollab.photoURL ? <img src={selectedCollab.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300">{selectedCollab.firstName?.[0]}</div>}
                 </div>
                 <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedCollab.firstName} {selectedCollab.lastName}</h2>
                 <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-1">{selectedCollab.phoneNumber}</p>
              </div>

              {saveError && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-[10px] font-bold mb-6 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {saveError}</div>}

              <form onSubmit={handleSaveConfig} className="space-y-8">
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Taux de Commission (%)</label>
                      <div className="relative">
                         <TrendingUp className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                         <input 
                           type="number" 
                           value={configData.commission_rate} 
                           onChange={e => setConfigData({...configData, commission_rate: Number(e.target.value)})} 
                           className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-black text-xl text-brand-900 focus:ring-2 focus:ring-brand-500/20 shadow-inner" 
                           required 
                         />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">Domaine d'expertise</label>
                      <select 
                        value={configData.specialty} 
                        onChange={e => setConfigData({...configData, specialty: e.target.value})} 
                        className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-500/20 shadow-inner"
                      >
                         <option>Coiffure</option>
                         <option>Esthétique</option>
                         <option>Onglerie</option>
                         <option>Mixte</option>
                      </select>
                    </div>

                    <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${configData.isAdmin ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-300'}`}>
                             <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Droits Admin</p>
                             <p className="text-xs font-bold text-slate-600">Autoriser la gestion caisse</p>
                          </div>
                       </div>
                       <button 
                        type="button" 
                        onClick={() => setConfigData({...configData, isAdmin: !configData.isAdmin})}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${configData.isAdmin ? 'bg-amber-500' : 'bg-slate-200'}`}
                       >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${configData.isAdmin ? 'translate-x-7' : 'translate-x-1'}`} />
                       </button>
                    </div>
                 </div>

                 <button type="submit" disabled={saving} className="w-full bg-brand-900 text-white py-6 rounded-[2rem] font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95">
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <UserCheck className="w-5 h-5 text-amber-400" />} 
                    Valider les Paramètres
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PilotagePerformance;