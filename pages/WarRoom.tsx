import React, { useState, useMemo, useEffect } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers } from '../services/supabase';
import { 
  ShieldAlert, 
  ChevronLeft, 
  Target, 
  TrendingUp, 
  Zap, 
  Crown, 
  Users, 
  MessageSquare, 
  Rocket,
  ArrowUpRight,
  Lock,
  Eye,
  Activity,
  Globe,
  Star,
  CheckCircle2
} from 'lucide-react';

const WarRoom: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalManagers, setTotalManagers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await getAllUsers();
        // Filtrer les admins pour ne compter que les gérants réels pour les paliers
        setTotalManagers(users.filter(u => u.role === 'CLIENT').length);
      } catch (e) {
        console.warn("Stats load error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const milestones = [
    {
      date: "Juin 2026",
      goal: 100,
      title: "Consolidation : CRM Intelligent",
      desc: "Lancement de l'IA de relance automatique WhatsApp. Détection des clients inactifs à 30 jours.",
      status: totalManagers >= 100 ? 'ACTIVE' : 'LOCKED',
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      date: "Octobre 2026",
      goal: 250,
      title: "Expansion : Empire & Staff",
      desc: "Déploiement de l'accès mobile Collaborateur et de la console Multi-Salons pour gérants multisites.",
      status: totalManagers >= 250 ? 'ACTIVE' : 'LOCKED',
      icon: <Users className="w-6 h-6" />
    },
    {
      date: "Janvier 2027",
      goal: 500,
      title: "Monétisation : Marketplace",
      desc: "Intégration directe des flux fournisseurs et déploiement de la solution Pay-by-GoTop.",
      status: totalManagers >= 500 ? 'ACTIVE' : 'LOCKED',
      icon: <Target className="w-6 h-6" />
    },
    {
      date: "01 Mars 2027",
      goal: 1000,
      title: "Institution : IA Live & Label",
      desc: "Lancement de Coach Kita Live (Vocal Temps Réel) et création de l'Annuaire de l'Excellence Public.",
      status: totalManagers >= 1000 ? 'ACTIVE' : 'LOCKED',
      icon: <Crown className="w-6 h-6" />
    }
  ];

  const nextMilestone = milestones.find(m => m.status === 'LOCKED') || milestones[milestones.length - 1];
  const progressPercent = Math.min(100, (totalManagers / nextMilestone.goal) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      {/* HEADER DE CONFIDENTIALITÉ ÉCLAIRCI */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/admin')} className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all">
              <ChevronLeft className="w-5 h-5 text-slate-900" />
            </button>
            <div>
              <p className="text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase">CLASSIFIED — INTERNAL ONLY</p>
              <h1 className="text-xl font-bold tracking-tighter text-slate-900">PROJECT 2027 : <span className="text-amber-600 uppercase">War Room</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full border border-amber-200 bg-amber-50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Live Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* COMPTEUR STYLE BOURSE - VERSION CLAIRE */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl relative overflow-hidden group">
            <Globe className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.03] text-slate-900 group-hover:rotate-12 transition-transform duration-1000" />
            <div className="relative z-10">
              <p className="text-amber-600 font-black text-[10px] uppercase tracking-[0.5em] mb-6">Manager Growth Engine</p>
              <div className="flex items-baseline gap-6">
                <span className="text-8xl font-black tracking-tighter text-slate-900">{totalManagers}</span>
                <div className="flex flex-col">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" /> +12%
                  </span>
                  <span className="text-slate-400 text-xs font-bold uppercase">Gérants Actifs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500 p-10 rounded-[3rem] text-slate-950 flex flex-col justify-between shadow-2xl">
            <div>
              <p className="font-black text-[10px] uppercase tracking-[0.4em] mb-4 opacity-60">Mentor Protocol</p>
              <h3 className="text-2xl font-bold leading-tight mb-6 italic">"L'échelle est la seule preuve du succès."</h3>
            </div>
            <button className="bg-slate-950 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all">
              <Zap className="w-4 h-4 text-amber-500" /> Flash Mentor Global
            </button>
          </div>
        </section>

        {/* THERMOMETRE DE PUISSANCE - VERSION CLAIRE */}
        <section className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Thermomètre de Croissance</h2>
                <p className="text-slate-500 text-sm font-medium">Prochain palier stratégique : <span className="text-amber-600 font-black">{nextMilestone.goal} Gérants</span></p>
              </div>
              <div className="text-right">
                <p className="text-6xl font-black text-amber-600 tracking-tighter">{Math.round(progressPercent)}%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacité Système Go'Top</p>
              </div>
           </div>
           
           <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 border border-slate-200 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
           </div>
           
           <div className="grid grid-cols-4 mt-8">
              {milestones.map((m, i) => (
                <div key={i} className={`text-center space-y-3 ${totalManagers >= m.goal ? 'text-amber-600' : 'text-slate-300'}`}>
                  <div className={`h-3 w-3 rounded-full mx-auto transition-colors duration-500 ${totalManagers >= m.goal ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{m.goal}</p>
                </div>
              ))}
           </div>
        </section>

        {/* TIMELINE ERE 2027 - VERSION CLAIRE HAUT CONTRASTE */}
        <section className="space-y-12">
           <div className="flex items-center gap-4">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Rétroplanning Stratégique 2027</h2>
              <div className="h-px bg-slate-200 flex-grow"></div>
           </div>

           <div className="relative space-y-12 before:absolute before:left-[2.25rem] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100">
              {milestones.map((m, i) => (
                <div key={i} className={`relative pl-24 group ${m.status === 'LOCKED' ? 'opacity-50' : 'opacity-100'}`}>
                   <div className={`absolute left-0 top-0 h-[4.5rem] w-[4.5rem] rounded-3xl border-4 flex items-center justify-center transition-all duration-500 z-10 ${
                      m.status === 'ACTIVE' 
                      ? 'bg-amber-500 border-white text-white shadow-xl' 
                      : 'bg-white border-slate-100 text-slate-300 shadow-sm'
                   }`}>
                      {m.status === 'ACTIVE' ? <CheckCircle2 className="w-8 h-8" /> : m.icon}
                   </div>
                   
                   <div className={`p-10 rounded-[3rem] border-2 transition-all duration-500 ${
                     m.status === 'ACTIVE' 
                     ? 'bg-white border-amber-200 shadow-2xl' 
                     : 'bg-white/50 border-slate-100'
                   }`}>
                      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                          <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest mb-1">{m.date}</p>
                          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{m.title}</h3>
                        </div>
                        <div className="px-5 py-2.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                          Cible : {m.goal} Gérants
                        </div>
                      </div>
                      <p className="text-slate-600 text-xl leading-relaxed max-w-3xl font-medium">
                        {m.desc}
                      </p>
                      
                      {m.status === 'LOCKED' && (
                        <div className="mt-8 flex items-center gap-3 text-slate-300">
                          <Lock className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">En attente de masse critique</span>
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* FOOTER WAR ROOM - VERSION CLAIRE */}
        <section className="pt-16 border-t border-slate-200 text-center space-y-6">
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Secure Admin Session : 001-KITA
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026-2027 Go'Top Pro Expansion — Strategic Intelligence Department</p>
        </section>
      </main>

      {/* NOISE OVERLAY - ADAPTÉ POUR THÈME CLAIR */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
};

export default WarRoom;