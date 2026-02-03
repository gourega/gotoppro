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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-black">
      {/* HEADER DE CONFIDENTIALITÉ */}
      <div className="border-b border-amber-500/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/admin')} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <ChevronLeft className="w-5 h-5 text-amber-500" />
            </button>
            <div>
              <p className="text-[8px] font-black tracking-[0.4em] text-amber-500/50 uppercase">CLASSIFIED — INTERNAL ONLY</p>
              <h1 className="text-xl font-bold tracking-tighter">PROJECT 2027 : <span className="text-amber-500">WAR ROOM</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Live Status</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* COMPTEUR STYLE BOURSE */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2 bg-gradient-to-br from-slate-900 to-black p-10 rounded-[3rem] border border-amber-500/10 relative overflow-hidden group">
            <Globe className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 text-amber-500 group-hover:rotate-12 transition-transform duration-1000" />
            <div className="relative z-10">
              <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.5em] mb-6">Manager Growth Engine</p>
              <div className="flex items-baseline gap-6">
                <span className="text-8xl font-black tracking-tighter text-white">{totalManagers}</span>
                <div className="flex flex-col">
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" /> +12%
                  </span>
                  <span className="text-slate-500 text-xs font-bold uppercase">Gérants Actifs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500 p-10 rounded-[3rem] text-slate-950 flex flex-col justify-between shadow-[0_20px_50px_rgba(245,158,11,0.2)]">
            <div>
              <p className="font-black text-[10px] uppercase tracking-[0.4em] mb-4 opacity-60">Mentor Protocol</p>
              <h3 className="text-2xl font-bold leading-tight mb-6 italic">"L'échelle est la seule preuve du succès."</h3>
            </div>
            <button className="bg-slate-950 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all">
              <Zap className="w-4 h-4 text-amber-500" /> Flash Mentor Global
            </button>
          </div>
        </section>

        {/* THERMOMETRE DE PUISSANCE */}
        <section className="bg-white/5 backdrop-blur-sm p-12 rounded-[4rem] border border-white/5">
           <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white mb-2">Thermomètre de Croissance</h2>
                <p className="text-slate-400 text-sm">Prochain palier : <span className="text-amber-500 font-bold">{nextMilestone.goal} Gérants</span></p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-amber-500">{Math.round(progressPercent)}%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacité Système</p>
              </div>
           </div>
           
           <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden p-1 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
           </div>
           
           <div className="grid grid-cols-4 mt-6">
              {milestones.map((m, i) => (
                <div key={i} className={`text-center space-y-2 ${totalManagers >= m.goal ? 'text-amber-500' : 'text-slate-700'}`}>
                  <div className="h-2 w-px bg-current mx-auto mb-2"></div>
                  <p className="text-[9px] font-black uppercase">{m.goal}</p>
                </div>
              ))}
           </div>
        </section>

        {/* TIMELINE ERE 2027 */}
        <section className="space-y-12">
           <div className="flex items-center gap-4">
              <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">Rétroplanning Stratégique</h2>
              <div className="h-px bg-amber-500/10 flex-grow"></div>
           </div>

           <div className="relative space-y-8 before:absolute before:left-[2.25rem] before:top-4 before:bottom-4 before:w-px before:bg-amber-500/10">
              {milestones.map((m, i) => (
                <div key={i} className={`relative pl-24 group ${m.status === 'LOCKED' ? 'opacity-40' : 'opacity-100'}`}>
                   <div className={`absolute left-0 top-0 h-[4.5rem] w-[4.5rem] rounded-3xl border-2 flex items-center justify-center transition-all duration-500 ${
                      m.status === 'ACTIVE' 
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
                      : 'bg-slate-900 border-white/10 text-slate-600'
                   }`}>
                      {m.status === 'ACTIVE' ? <CheckCircle2 className="w-8 h-8" /> : m.icon}
                   </div>
                   
                   <div className={`p-10 rounded-[3rem] border transition-all duration-500 ${
                     m.status === 'ACTIVE' ? 'bg-white/5 border-amber-500/20' : 'bg-transparent border-white/5 hover:border-white/10'
                   }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">{m.date}</p>
                          <h3 className="text-2xl font-bold">{m.title}</h3>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                          Objectif : {m.goal} Gérants
                        </div>
                      </div>
                      <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
                        {m.desc}
                      </p>
                      
                      {m.status === 'LOCKED' && (
                        <div className="mt-8 flex items-center gap-3 text-slate-600">
                          <Lock className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">En attente de masse critique</span>
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* FOOTER WAR ROOM */}
        <section className="pt-12 border-t border-white/5 text-center space-y-6">
           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 text-slate-500 border border-white/5 text-[10px] font-black uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" /> Secure Session : 001-KITA-ADMIN
           </div>
           <p className="text-slate-600 text-xs font-medium">© 2026-2027 Go'Top Pro Expansion — Strategic Intelligence Department</p>
        </section>
      </main>

      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay">
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