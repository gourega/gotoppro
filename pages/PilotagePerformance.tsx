
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate, useLocation } from 'react-router-dom';
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
  Banknote,
  History,
  Calendar,
  AlertCircle,
  ClipboardList,
  Lock,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  Crown,
  Ban,
  List
} from 'lucide-react';
import { KitaService, KitaTransaction } from '../types';

const PilotagePerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // Gestion de l'onglet actif via paramètre d'URL (?tab=services)
  const [activeTab, setActiveTab] = useState<'staff' | 'commissions' | 'clients' | 'dettes' | 'services'>('staff');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'services') setActiveTab('services');
  }, [location]);

  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<KitaService[]>([]);
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  const [newStaff, setNewStaff] = useState({ name: '', commissionRate: 30, specialty: 'Coiffure' });
  const [newClient, setNewClient] = useState({ name: '', phone: '', notes: '' });
  const [newService, setNewService] = useState({ name: '', defaultPrice: 0, category: 'Coiffure' });
  const [saving, setSaving] = useState(false);

  const isUnlocked = user?.hasPerformancePack;
  const isCRMActive = useMemo(() => user?.isAdmin || (user?.crmExpiryDate && new Date(user.crmExpiryDate) > new Date()), [user]);

  useEffect(() => { if (user) loadData(); }, [user]);

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
    } finally { setLoading(false); }
  };

  const staffStats = useMemo(() => {
    const results: any[] = [];
    staff.forEach(member => {
      const memberTrans = transactions.filter(t => t.staffName === member.name && t.type === 'INCOME' && !t.isCredit);
      const totalCA = memberTrans.reduce((acc, t) => acc + t.amount, 0);
      const totalComm = memberTrans.reduce((acc, t) => acc + (t.amount * (t.commissionRate || 0) / 100), 0);
      results.push({ ...member, totalCA, totalComm, count: memberTrans.length });
    });
    return results.sort((a,b) => b.totalCA - a.totalCA);
  }, [staff, transactions]);

  const ardoises = useMemo(() => transactions.filter(t => t.isCredit && t.type === 'INCOME'), [transactions]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newStaff.name) return;
    setSaving(true);
    try {
      const saved = await addKitaStaff(user.uid, newStaff);
      if (saved) setStaff([...staff, saved]);
      setShowAddStaffModal(false);
      setNewStaff({ name: '', commissionRate: 30, specialty: 'Coiffure' });
    } finally { setSaving(false); }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newService.name) return;
    setSaving(true);
    try {
      const saved = await addKitaService(user.uid, newService);
      if (saved) setServices([...services, saved as KitaService]);
      setShowAddServiceModal(false);
      setNewService({ name: '', defaultPrice: 0, category: 'Coiffure' });
    } finally { setSaving(false); }
  };

  const handleDeleteSvc = async (id: string) => {
    if (!window.confirm("Supprimer cette prestation du catalogue ?")) return;
    await deleteKitaService(id);
    setServices(services.filter(s => s.id !== id));
  };

  const LockedScreen = () => (
    <div className="py-24 text-center animate-in zoom-in-95 px-6">
       <div className="h-24 w-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-rose-100"><Lock className="w-10 h-10" /></div>
       <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Pack Croissance Requis</h3>
       <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">Activez votre CRM pour accéder au suivi des ardoises et aux relances automatiques.</p>
       <button onClick={() => navigate('/results?pack=crm')} className="bg-brand-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center gap-3 justify-center mx-auto"><Zap className="w-4 h-4 text-amber-400" /> Activer mon CRM (500 F)</button>
    </div>
  );

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
         <KitaTopNav />
         <div className="h-24 w-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 mt-20"><Users className="w-12 h-12" /></div>
         <h1 className="text-4xl font-serif font-bold text-white mb-6">Ressources Humaines</h1>
         <button onClick={() => navigate('/results?pack=performance')} className="bg-emerald-500 text-white px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Activer le Pack RH (5 000 F)</button>
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
          <div className="flex justify-center bg-white/5 p-1.5 rounded-[2rem] border border-white/10 overflow-x-auto max-w-full">
             <button onClick={() => setActiveTab('staff')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>Équipe</button>
             <button onClick={() => setActiveTab('commissions')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'commissions' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>Performance</button>
             <button onClick={() => setActiveTab('services')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'services' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>Services & Tarifs</button>
             <button onClick={() => setActiveTab('clients')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>Clients VIP</button>
             <button onClick={() => setActiveTab('dettes')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'dettes' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>Ardoises</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-12 relative z-20">
        {activeTab === 'staff' ? (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Mon Staff</h3>
                 <button onClick={() => setShowAddStaffModal(true)} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-xl"><Plus className="w-4 h-4" /> Nouveau</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map(member => (
                    <div key={member.id} className="bg-white rounded-[2.5rem] p-8 border group hover:shadow-xl transition-all">
                        <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6"><Scissors className="w-6 h-6" /></div>
                        <h4 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{member.specialty} • {member.commissionRate}%</p>
                    </div>
                  ))}
              </div>
          </div>
        ) : activeTab === 'services' ? (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><List className="w-5 h-5 text-indigo-500" /> Prestations & Tarifs</h3>
                 <button onClick={() => setShowAddServiceModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-xl"><Plus className="w-4 h-4" /> Nouveau Service</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {services.map(svc => (
                    <div key={svc.id} className="bg-white rounded-[2.5rem] p-6 border shadow-sm group hover:border-indigo-500 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[8px] font-black uppercase">{svc.category}</span>
                            <button onClick={() => handleDeleteSvc(svc.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{svc.name}</h4>
                        </div>
                        <p className="text-xl font-black text-emerald-600 mt-4">{svc.defaultPrice.toLocaleString()} F</p>
                    </div>
                  ))}
                  {services.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] text-slate-300 italic">Aucun service créé. Configurez vos prix ici pour la caisse.</div>}
              </div>
          </div>
        ) : activeTab === 'commissions' ? (
          <div className="space-y-8 animate-in fade-in">
              <div className="px-4"><h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Crown className="w-5 h-5 text-amber-500" /> Podium de Performance</h3></div>
              <div className="grid md:grid-cols-3 gap-6">
                {staffStats.map((member, i) => (
                  <div key={member.id} className={`bg-white rounded-[3rem] p-8 border shadow-sm relative overflow-hidden ${i === 0 ? 'ring-2 ring-amber-400' : ''}`}>
                    {i === 0 && <div className="absolute top-4 right-4 bg-amber-400 text-white p-2 rounded-full shadow-lg animate-bounce"><Award className="w-5 h-5" /></div>}
                    <div className="flex items-center gap-4 mb-6">
                       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                       <div><p className="font-bold text-xl">{member.name}</p><p className="text-[10px] font-black uppercase text-slate-400">{member.count} prestations</p></div>
                    </div>
                    <div className="space-y-4">
                       <div><p className="text-[9px] font-black text-slate-400 uppercase">CA Généré</p><p className="text-2xl font-black text-slate-900">{member.totalCA.toLocaleString()} F</p></div>
                       <div><p className="text-[9px] font-black text-slate-400 uppercase">Commissions</p><p className="text-xl font-black text-emerald-600">{member.totalComm.toLocaleString()} F</p></div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        ) : activeTab === 'clients' ? (
          !isCRMActive ? <LockedScreen /> : (
            <div className="space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center gap-4 px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Star className="w-5 h-5 text-amber-500" /> CRM VIP</h3>
                  <button onClick={() => setShowAddClientModal(true)} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2"><Plus className="w-4 h-4" /> Nouveau VIP</button>
                </div>
                <div className="bg-white rounded-[3rem] border overflow-hidden">
                    {clients.map(c => (
                        <div key={c.id} className="p-6 border-b flex items-center justify-between hover:bg-slate-50 transition-all gap-4">
                          <div className="flex items-center gap-6">
                              <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl">{c.name[0]}</div>
                              <div><p className="font-bold text-slate-900 text-lg">{c.name}</p><p className="text-[10px] font-black text-slate-400 uppercase">{c.phone}</p></div>
                          </div>
                          <button onClick={() => setSelectedClient(c)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all"><ClipboardList className="w-5 h-5" /></button>
                        </div>
                    ))}
                </div>
            </div>
          )
        ) : (
          !isCRMActive ? <LockedScreen /> : (
            <div className="space-y-8 animate-in fade-in">
                <div className="px-4"><h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Ban className="w-5 h-5 text-rose-500" /> Gestion des Ardoises</h3></div>
                <div className="grid md:grid-cols-2 gap-6">
                   {ardoises.map(t => (
                     <div key={t.id} className="bg-white rounded-[2.5rem] p-8 border-l-[10px] border-rose-500 shadow-xl flex flex-col justify-between group">
                        <div>
                           <div className="flex justify-between items-start mb-6">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(t.date).toLocaleDateString()}</p>
                              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">NON RÉGLÉ</span>
                           </div>
                           <h4 className="text-2xl font-bold text-slate-900 mb-2">{t.label}</h4>
                           <p className="text-sm text-slate-500 font-medium mb-8 italic">Réalisé par : {t.staffName || 'Gérant'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                           <p className="text-3xl font-black text-rose-600">{t.amount.toLocaleString()} F</p>
                           <a href={`https://wa.me/${user?.phoneNumber.replace(/\+/g,'')}?text=${encodeURIComponent(`Bonjour, Coach Kita ici. Nous vous rappelons le règlement de votre ardoise de ${t.amount} F pour votre prestation ${t.label}. Merci !`)}`} target="_blank" className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-200">
                              <MessageCircle className="w-4 h-4" /> Relancer
                           </a>
                        </div>
                     </div>
                   ))}
                   {ardoises.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] text-slate-300 italic">Aucune ardoise en cours. Vos comptes sont au top !</div>}
                </div>
            </div>
          )
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
              </div>
              <textarea value={selectedClient.notes || ''} onChange={e => setSelectedClient({...selectedClient, notes: e.target.value})} placeholder="Notes techniques ou préférences..." className="w-full p-8 rounded-[2rem] bg-slate-50 border-none outline-none font-medium min-h-[150px] mb-8" />
              <button onClick={async () => {
                await updateKitaClient(selectedClient.id, { notes: selectedClient.notes });
                loadData(); setSelectedClient(null);
              }} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl">Enregistrer</button>
           </div>
        </div>
      )}

      {/* MODAL STAFF */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddStaffModal(false)} className="absolute top-10 right-10 text-slate-300"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Nouveau Staff</h2>
              <form onSubmit={handleAddStaff} className="space-y-6">
                 <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Nom complet" required />
                 <input type="number" value={newStaff.commissionRate} onChange={e => setNewStaff({...newStaff, commissionRate: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Commission %" />
                 <button type="submit" className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase shadow-xl">Valider</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL SERVICE */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddServiceModal(false)} className="absolute top-10 right-10 text-slate-300"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Nouveau Service</h2>
              <form onSubmit={handleAddService} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom de la prestation</label>
                    <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Ex: Brushing simple" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Prix (F)</label>
                        <input type="number" value={newService.defaultPrice || ''} onChange={e => setNewService({...newService, defaultPrice: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="0" required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Catégorie</label>
                        <select value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold appearance-none">
                            <option>Coiffure</option>
                            <option>Esthétique</option>
                            <option>Onglerie</option>
                            <option>Soins</option>
                            <option>Mariage</option>
                            <option>Autre</option>
                        </select>
                    </div>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Enregistrer au catalogue
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PilotagePerformance;
