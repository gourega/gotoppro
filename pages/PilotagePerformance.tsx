
import { useState, useEffect, useMemo } from 'react';
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
  bulkAddKitaServices
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
  List,
  Sparkles,
  Wand2,
  Phone,
  ShieldAlert,
  Database,
  Terminal,
  Copy,
  Info,
  RefreshCw,
  Bug,
  Share2,
  Pencil
} from 'lucide-react';
import { KitaService, KitaTransaction } from '../types';
import { COACH_KITA_PHONE } from '../constants';

const PilotagePerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  
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
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', commission_rate: 25, specialty: 'Coiffure' });
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [newClient, setNewClient] = useState({ name: '', phone: '', notes: '' });
  const [newService, setNewService] = useState({ name: '', defaultPrice: 0, category: 'Coiffure' });
  const [editingService, setEditingService] = useState<KitaService | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<{message: string, code?: string, raw?: any} | null>(null);

  const isUnlocked = user?.hasPerformancePack;
  const isCRMActive = useMemo(() => user?.isAdmin || (user?.crmExpiryDate && new Date(user.crmExpiryDate) > new Date()), [user]);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setSaveError(null);
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
    } catch (e: any) {
      console.error("Erreur de chargement", e);
      setSaveError({ 
        message: "Erreur de connexion aux tables. Vérifiez que les tables existent dans Supabase.", 
        code: e.code,
        raw: e
      });
    } finally { setLoading(false); }
  };

  const handleCopyError = () => {
    if (!saveError) return;
    const text = `Erreur Go'Top Pro: ${saveError.message}\nCode: ${saveError.code}\nRaw: ${JSON.stringify(saveError.raw)}`;
    navigator.clipboard.writeText(text);
    alert("Détails techniques copiés ! Envoyez-les au support.");
  };

  const handleImportStandardCatalog = async () => {
    if (!user || isImporting) return;
    setIsImporting(true);
    try {
      const standardCatalog = [
        { name: "Coupe Homme Simple", category: "Coiffure", defaultPrice: 2000 },
        { name: "Coupe Femme (Rafraîchissement)", category: "Coiffure", defaultPrice: 3000 },
        { name: "Brushing Simple", category: "Coiffure", defaultPrice: 5000 },
        { name: "Tresses (Nattes classiques)", category: "Coiffure", defaultPrice: 10000 },
        { name: "Tissage Fermé de Luxe", category: "Coiffure", defaultPrice: 15000 },
        { name: "Shampoing & Soin Profond", category: "Coiffure", defaultPrice: 5000 },
        { name: "Teinture / Coloration", category: "Coiffure", defaultPrice: 15000 },
        { name: "Pédicure complète", category: "Soins", defaultPrice: 7000 },
        { name: "Manucure simple", category: "Soins", defaultPrice: 5000 },
        { name: "Pose Capsules + Gel", category: "Onglerie", defaultPrice: 15000 },
        { name: "Soin de Visage Éclat", category: "Esthétique", defaultPrice: 20000 },
        { name: "Maquillage Jour / Pro", category: "Esthétique", defaultPrice: 10000 },
        { name: "Tracé de Sourcils", category: "Esthétique", defaultPrice: 2000 },
        { name: "Défrisage Technique", category: "Coiffure", defaultPrice: 8000 },
        { name: "Chignon Mariée / Soirée", category: "Coiffure", defaultPrice: 25000 }
      ];
      await bulkAddKitaServices(user.uid, standardCatalog);
      await loadData();
    } catch (e: any) {
      alert("Erreur importation : " + (e.message || "Table manquante"));
    } finally { setIsImporting(false); }
  };

  const staffStats = useMemo(() => {
    const results: any[] = [];
    staff.forEach(member => {
      const memberTrans = transactions.filter(t => t.staffName === member.name && t.type === 'INCOME' && !t.isCredit);
      const totalCA = memberTrans.reduce((acc, t) => acc + t.amount, 0);
      const totalComm = memberTrans.reduce((acc, t) => acc + (t.amount * (t.commissionRate || t.commission_rate || 0) / 100), 0);
      results.push({ ...member, totalCA, totalComm, count: memberTrans.length });
    });
    return results.sort((a,b) => b.totalCA - a.totalCA);
  }, [staff, transactions]);

  const ardoises = useMemo(() => transactions.filter(t => t.isCredit && t.type === 'INCOME'), [transactions]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newStaff.name) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await addKitaStaff(user.uid, newStaff);
      if (saved) {
        setStaff([...staff, saved]);
        setShowAddStaffModal(false);
        setNewStaff({ name: '', phone: '', commission_rate: 25, specialty: 'Coiffure' });
      }
    } catch (err: any) {
      if (err.code === '23505' || err.status === 409 || err.message?.includes('duplicate')) {
        setSaveError({ 
          message: `Le membre "${newStaff.name}" existe déjà. Utilisez un nom légèrement différent.`,
          code: "DOUBLON",
          raw: err
        });
      } else {
        setSaveError({ message: "L'enregistrement a échoué.", code: err.code || "UNK", raw: err });
      }
    } finally { setSaving(false); }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editingStaff.id) return;
    setSaving(true);
    try {
      const updated = await updateKitaStaff(editingStaff.id, editingStaff);
      if (updated) {
        setStaff(staff.map(s => s.id === editingStaff.id ? updated : s));
        setShowEditStaffModal(false);
        setEditingStaff(null);
      }
    } catch (err: any) {
      setSaveError({ message: "Erreur lors de la modification.", code: err.code, raw: err });
    } finally { setSaving(false); }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Supprimer ce membre de l'équipe ? Ses statistiques ne seront plus visibles.")) return;
    try {
      await deleteKitaStaff(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (e) {
      alert("Erreur suppression");
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClient.name) return;
    setSaving(true);
    try {
      const saved = await addKitaClient(user.uid, newClient);
      if (saved) {
        setClients([saved, ...clients]);
        setShowAddClientModal(false);
        setNewClient({ name: '', phone: '', notes: '' });
      }
    } catch (err: any) {
      setSaveError({ message: "Erreur lors de l'ajout du client.", code: err.code, raw: err });
    } finally { setSaving(false); }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newService.name) return;
    setSaving(true);
    try {
      const saved = await addKitaService(user.uid, newService);
      if (saved) {
        setServices([...services, saved as KitaService]);
        setShowAddServiceModal(false);
        setNewService({ name: '', defaultPrice: 0, category: 'Coiffure' });
      }
    } catch (e: any) {
      alert("Erreur technique sur la table Services.");
    } finally { setSaving(false); }
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.id) return;
    setSaving(true);
    try {
      const updated = await updateKitaService(editingService.id, editingService);
      if (updated) {
        setServices(services.map(s => s.id === editingService.id ? updated : s));
        setShowEditServiceModal(false);
        setEditingService(null);
      }
    } catch (err: any) {
      alert("Erreur lors de la mise à jour du service.");
    } finally { setSaving(false); }
  };

  const handleDeleteSvc = async (id: string) => {
    if (!window.confirm("Supprimer cette prestation ?")) return;
    try {
      await deleteKitaService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (e) {
      alert("Erreur suppression");
    }
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
             <button onClick={() => setActiveTab('staff')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Équipe</button>
             <button onClick={() => setActiveTab('commissions')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'commissions' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Performance</button>
             <button onClick={() => setActiveTab('services')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'services' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Services & Tarifs</button>
             <button onClick={() => setActiveTab('clients')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Clients VIP</button>
             <button onClick={() => setActiveTab('dettes')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'dettes' ? 'bg-emerald-500 text-white' : 'text-slate-50'}`}>Ardoises</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-12 relative z-20">
        
        {saveError && (
          <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between shadow-xl animate-in slide-in-from-top-4 gap-4">
             <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-rose-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-900 leading-tight">{saveError.message}</p>
                  <p className="text-[8px] font-mono text-rose-400 mt-1 uppercase">CODE: {saveError.code}</p>
                </div>
             </div>
             <div className="flex gap-2 shrink-0">
               <button onClick={handleCopyError} title="Copier l'erreur pour le support" className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-brand-600 transition-all flex items-center gap-2">
                 <Copy className="w-4 h-4" />
                 <span className="text-[8px] font-black uppercase">Copier Log</span>
               </button>
               <button onClick={loadData} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-brand-600 transition-all"><RefreshCw className="w-5 h-5" /></button>
               <button onClick={() => window.open(`https://wa.me/${COACH_KITA_PHONE.replace(/\+/g,'')}?text=${encodeURIComponent(`Bonjour Coach Kita, j'ai une erreur ${saveError.code} lors de l'ajout de mon staff.`)}`, '_blank')} className="p-3 bg-brand-900 rounded-xl shadow-sm text-white hover:bg-black transition-all"><MessageCircle className="w-5 h-5" /></button>
             </div>
          </div>
        )}

        {activeTab === 'staff' ? (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Users className="w-5 h-5 text-emerald-500" /> Mon Staff</h3>
                 <button onClick={() => { setShowAddStaffModal(true); setSaveError(null); }} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-xl"><Plus className="w-4 h-4" /> Nouveau Collaborateur</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map(member => (
                    <div key={member.id} className="bg-white rounded-[2.5rem] p-8 border group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                           <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><Scissors className="w-6 h-6" /></div>
                           <div className="flex gap-2">
                              <button onClick={() => { setEditingStaff({ ...member, commission_rate: member.commission_rate || member.commissionRate }); setShowEditStaffModal(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all shadow-sm"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteStaff(member.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{member.specialty} • {member.commission_rate || member.commissionRate}%</p>
                        {member.phone && (
                          <div className="mt-4 flex items-center gap-2 text-slate-400">
                             <Phone className="w-3 h-3" />
                             <span className="text-[10px] font-bold">{member.phone}</span>
                          </div>
                        )}
                    </div>
                  ))}
                  {staff.length === 0 && !loading && <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] text-slate-300 italic">Aucun membre dans l'équipe. Cliquez sur Nouveau.</div>}
              </div>
          </div>
        ) : activeTab === 'services' ? (
          <div className="space-y-12 animate-in fade-in">
              {services.length <= 4 && !loading && (
                <section className="bg-indigo-900 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                      <Wand2 className="w-48 h-48 text-indigo-400" />
                   </div>
                   <div className="relative z-10 max-w-2xl">
                      <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-6">
                        <Sparkles className="w-4 h-4" /> Configuration Express
                      </div>
                      <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                        Chargez la méthode <span className="text-indigo-400 italic">Coach Kita</span>
                      </h2>
                      <p className="text-indigo-100 text-lg mb-10 leading-relaxed font-medium">
                        Ne perdez pas de temps à tout saisir. Importez les 15 prestations standards (Coiffure, Soins, Onglerie) et ajustez simplement vos prix.
                      </p>
                      <button 
                        onClick={handleImportStandardCatalog}
                        disabled={isImporting}
                        className="bg-white text-indigo-900 px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-4 active:scale-95"
                      >
                         {isImporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                         {isImporting ? "Injection en cours..." : "Importer le catalogue (15 services)"}
                      </button>
                   </div>
                </section>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><List className="w-5 h-5 text-indigo-500" /> Prestations & Tarifs</h3>
                 <button onClick={() => setShowAddServiceModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-xl"><Plus className="w-4 h-4" /> Nouveau Service</button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {services.map(svc => (
                    <div key={svc.id} className="bg-white rounded-[2.5rem] p-8 border shadow-sm group hover:border-indigo-500 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[8px] font-black uppercase">{svc.category}</span>
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingService(svc); setShowEditServiceModal(true); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteSvc(svc.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{svc.name}</h4>
                        </div>
                        <p className="text-2xl font-black text-emerald-600 mt-6">{svc.defaultPrice.toLocaleString()} F</p>
                    </div>
                  ))}
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
                              <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl">{c.name?.[0] || 'V'}</div>
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
                           <a href={`https://wa.me/${user?.phoneNumber.replace(/\+/g,'')}?text=${encodeURIComponent(`Bonjour, Coach Kita ici. Nous vous rappelons le règlement de votre ardoise de ${t.amount} F.`)}`} target="_blank" className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-lg">
                              <MessageCircle className="w-4 h-4" /> Relancer
                           </a>
                        </div>
                     </div>
                   ))}
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
              <textarea value={selectedClient.notes || ''} onChange={e => setSelectedClient({...selectedClient, notes: e.target.value})} placeholder="Notes techniques..." className="w-full p-8 rounded-[2rem] bg-slate-50 border-none outline-none font-medium min-h-[150px] mb-8" />
              <button onClick={async () => {
                await updateKitaClient(selectedClient.id, { notes: selectedClient.notes });
                loadData(); setSelectedClient(null);
              }} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl">Enregistrer</button>
           </div>
        </div>
      )}

      {/* MODAL NOUVEAU VIP */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddClientModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Nouveau Client VIP</h2>
              <form onSubmit={handleAddClient} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom du Client</label>
                    <input type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Nom complet" required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Numéro WhatsApp</label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <input type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="0505..." />
                    </div>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-amber-500 text-white py-6 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Créer la fiche VIP
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL STAFF (AJOUT) */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddStaffModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Nouveau Staff</h2>
              <form onSubmit={handleAddStaff} className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom Complet</label>
                   <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Ex: Honoré" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Commission %</label>
                      <input type="number" value={newStaff.commission_rate} onChange={e => setNewStaff({...newStaff, commission_rate: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Ex: 25" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Spécialité</label>
                      <select value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold appearance-none">
                        <option>Coiffure</option>
                        <option>Esthétique</option>
                        <option>Onglerie</option>
                        <option>Général</option>
                      </select>
                    </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Téléphone WhatsApp</label>
                   <input type="tel" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="0101..." />
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Créer le membre
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL STAFF (EDITION) */}
      {showEditStaffModal && editingStaff && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => { setShowEditStaffModal(false); setEditingStaff(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Modifier : {editingStaff.name}</h2>
              <form onSubmit={handleEditStaff} className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom Complet</label>
                   <input type="text" value={editingStaff.name} onChange={e => setEditingStaff({...editingStaff, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Nom" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Commission %</label>
                      <input type="number" value={editingStaff.commission_rate} onChange={e => setEditingStaff({...editingStaff, commission_rate: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Spécialité</label>
                      <select value={editingStaff.specialty} onChange={e => setEditingStaff({...editingStaff, specialty: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold appearance-none">
                        <option>Coiffure</option>
                        <option>Esthétique</option>
                        <option>Onglerie</option>
                        <option>Général</option>
                      </select>
                    </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Téléphone WhatsApp</label>
                   <input type="tel" value={editingStaff.phone || ''} onChange={e => setEditingStaff({...editingStaff, phone: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="0101..." />
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Enregistrer les modifications
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL SERVICE (AJOUT) */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => setShowAddServiceModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Nouveau Service</h2>
              <form onSubmit={handleAddService} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom de la prestation</label>
                    <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Brushing..." required />
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

      {/* MODAL SERVICE (EDITION) */}
      {showEditServiceModal && editingService && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative animate-in zoom-in-95">
              <button onClick={() => { setShowEditServiceModal(false); setEditingService(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-center mb-10">Modifier Tarif : {editingService.name}</h2>
              <form onSubmit={handleEditService} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Nom de la prestation</label>
                    <input type="text" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold" placeholder="Nom" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Prix (F)</label>
                        <input type="number" value={editingService.defaultPrice} onChange={e => setEditingService({...editingService, defaultPrice: Number(e.target.value)})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-black text-emerald-600 text-xl" required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-4">Catégorie</label>
                        <select value={editingService.category} onChange={e => setEditingService({...editingService, category: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 font-bold appearance-none">
                            <option>Coiffure</option>
                            <option>Esthétique</option>
                            <option>Onglerie</option>
                            <option>Soins</option>
                        </select>
                    </div>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Mettre à jour le tarif
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PilotagePerformance;
