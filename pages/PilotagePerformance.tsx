
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KITA_LOGO, COACH_KITA_AVATAR } from '../constants';
import { getKitaStaff, addKitaStaff, deleteKitaStaff, getKitaClients, getKitaTransactions } from '../services/supabase';
import { GoogleGenAI } from "@google/genai";
import { 
  ChevronLeft, 
  Users, 
  UserPlus, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Lock, 
  MessageCircle, 
  Share2, 
  ArrowRight,
  Sparkles,
  Loader2,
  Trash2,
  Phone,
  Calendar,
  Award,
  Plus,
  X,
  CheckCircle2,
  BarChart3
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
  const [saving, setSaving] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

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

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Supprimer ce collaborateur ?")) return;
    try {
      await deleteKitaStaff(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (e) {
      alert("Erreur suppression.");
    }
  };

  const staffPerformance = useMemo(() => {
    const perf: { [key: string]: { sales: number, commission: number } } = {};
    const now = new Date();
    const thisMonthTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    thisMonthTrans.forEach(t => {
      if (t.staffName) {
        if (!perf[t.staffName]) perf[t.staffName] = { sales: 0, commission: 0 };
        perf[t.staffName].sales += t.amount;
        perf[t.staffName].commission += Math.round(t.amount * (t.commissionRate || 30) / 100);
      }
    });
    return perf;
  }, [transactions]);

  const handleGetAIAdvice = async () => {
    if (!isUnlocked || analyzing) return;
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `En tant que Coach Kita, analyse cette équipe : ${JSON.stringify(staff)} et leurs performances : ${JSON.stringify(staffPerformance)}. 
      Donne 2 conseils stratégiques pour augmenter la motivation et le panier moyen. 
      Ton: Mentor d'élite. Court et percutant. Pas d'anglicismes.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiAdvice(response.text || "Continuez votre rigueur de gestion.");
    } catch (err) {
      setAiAdvice("Erreur d'analyse. Concentrez-vous sur la régularité du staff.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-20">
      <header className="pt-16 pb-32 px-6 relative overflow-hidden bg-gradient-to-b from-slate-900 to-transparent">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <BarChart3 className="w-96 h-96 text-brand-500" />
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-8">
          <div className="flex gap-6">
            <div className="bg-brand-500 p-2 rounded-[2rem] shadow-2xl shrink-0 h-20 w-20 flex items-center justify-center">
               <Zap className="h-10 w-10 text-white fill-current" />
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-3 font-black text-[10px] uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Dashboard
              </button>
              <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Performance<span className="text-brand-500 italic">+</span></h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em] mt-1">Cockpit de Pilotage Expert</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isUnlocked ? 'Pack Activé' : 'Mode Démo'}</span>
             </div>
             <button onClick={() => navigate('/caisse')} className="bg-amber-400 text-brand-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                Aller à la Caisse
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-10 relative z-20">
        
        {!isUnlocked && (
          <div className="bg-brand-500 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Lock className="w-48 h-48" />
             </div>
             <div className="max-w-2xl relative z-10 space-y-6">
                <h2 className="text-3xl font-serif font-bold">Débloquez la puissance du standard ELITE</h2>
                <p className="text-slate-100 font-medium leading-relaxed text-lg">
                   Le Pack Performance+ automatise vos calculs de payes, sécurise votre base client et débloque l'audit IA stratégique de votre staff.
                </p>
                <button onClick={() => navigate('/results')} className="bg-white text-brand-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition shadow-xl">
                   Activer mon Cockpit Expert (5 000 F)
                </button>
             </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10">
           {/* Section Collaborateurs */}
           <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <Users className="w-5 h-5 text-brand-500" /> Mon Staff ({staff.length})
                 </h3>
                 {isUnlocked && (
                   <button onClick={() => setShowAddStaffModal(true)} className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all">
                      <Plus className="w-4 h-4" /> Nouvel Expert
                   </button>
                 )}
              </div>

              {loading ? <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" /></div> : 
               staff.length === 0 ? (
                <div className="bg-white/5 rounded-[3rem] p-20 text-center border border-dashed border-white/10">
                   <Users className="w-12 h-12 text-slate-700 mx-auto mb-6" />
                   <p className="text-slate-500 font-medium italic">Enregistrez vos coiffeurs pour suivre leurs commissions.</p>
                </div>
               ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {staff.map(member => {
                    const perf = staffPerformance[member.name] || { sales: 0, commission: 0 };
                    return (
                      <div key={member.id} className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 hover:border-brand-500/50 transition-all group relative overflow-hidden">
                          <div className="flex justify-between items-start mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-brand-500/20 flex items-center justify-center font-black text-brand-500 text-xl">{member.name[0]}</div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taux Com.</p>
                                <p className="text-xl font-black text-white">{member.commission_rate}%</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                             <div>
                                <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{member.specialty}</p>
                             </div>
                             {isUnlocked && (
                               <button onClick={() => handleDeleteStaff(member.id)} className="p-3 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                          
                          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">CA Mois</p>
                                <p className="text-lg font-black text-emerald-500">{perf.sales.toLocaleString()} F</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Dû (Com.)</p>
                                <p className="text-lg font-black text-white">{perf.commission.toLocaleString()} F</p>
                            </div>
                          </div>
                      </div>
                    )
                  })}
                </div>
               )
              }

              <div className="pt-8 px-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Répertoire Clients VIP
                 </h3>
                 <div className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden">
                    {clients.length === 0 ? (
                      <p className="p-12 text-center text-slate-500 text-sm italic">Les dettes sont gérées dans la Caisse, les clients VIP ici.</p>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</th>
                              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Visites</th>
                              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.map(c => (
                              <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-6">
                                    <p className="font-bold text-white">{c.name}</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-mono">{c.phone}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-[10px] font-black border border-brand-500/20">{c.total_visits}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <a href={`https://wa.me/${c.phone?.replace(/\+/g, '')}`} target="_blank" className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                 </div>
              </div>
           </div>

           {/* Audit IA */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 sticky top-24 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform group-hover:scale-110">
                    <img src={COACH_KITA_AVATAR} alt="" className="w-32 h-32 rounded-3xl" />
                 </div>
                 <h4 className="text-[11px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                    <Award className="w-5 h-5" /> Audit Performance
                 </h4>
                 
                 <div className="space-y-8">
                    {aiAdvice ? (
                      <div className="text-sm font-medium leading-relaxed text-slate-300 italic animate-in fade-in slide-in-from-bottom-2 duration-500">
                         {aiAdvice.split('\n').map((line, i) => (
                           <p key={i} className="mb-4">{line}</p>
                         ))}
                         <button onClick={() => setAiAdvice(null)} className="mt-4 text-[9px] font-black uppercase text-brand-600 hover:text-white tracking-widest transition-colors">Nouvel audit</button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Laissez Coach Kita analyser les résultats de votre équipe pour identifier les opportunités de croissance.
                         </p>
                         <button 
                           onClick={handleGetAIAdvice}
                           disabled={analyzing || !isUnlocked || staff.length === 0}
                           className="w-full bg-brand-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-400 transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-3"
                         >
                            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                            Audit Stratégique Equipe
                         </button>
                      </div>
                    )}
                 </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 text-center space-y-4">
                 <Share2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">Marketing WhatsApp</h4>
                 <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed px-4">
                    Utilisez vos données clients pour envoyer des promotions personnalisées.
                 </p>
                 <button className="text-[10px] font-black uppercase text-brand-500 tracking-[0.2em] hover:text-white transition-colors">Lancer une campagne</button>
              </div>
           </div>
        </div>
      </div>

      {/* Modal Ajout Staff */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-[#1e293b] w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-white/10">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-serif font-bold text-white">Nouvel Expert</h2>
                 <button onClick={() => setShowAddStaffModal(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nom de l'expert</label>
                    <input autoFocus type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="Ex: Jean" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spécialité</label>
                       <input type="text" value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} placeholder="Ex: Tresses" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Com. (%)</label>
                       <input type="number" value={newStaff.commission_rate} onChange={e => setNewStaff({...newStaff, commission_rate: Number(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white font-bold" />
                    </div>
                 </div>

                 <button type="submit" disabled={saving} className="w-full py-5 bg-brand-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-400 transition-all flex items-center justify-center gap-3 shadow-xl">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Valider l'expert
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PilotagePerformance;
