
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_CATALOG, BADGES, COACH_KITA_AVATAR, DAILY_CHALLENGES } from '../constants';
import { ModuleStatus } from '../types';
import { saveUserProfile } from '../services/supabase';
import { 
  Award, 
  CheckCircle2, 
  Coins, 
  Zap, 
  ArrowRight,
  Circle,
  BookOpen,
  LayoutDashboard,
  Smartphone,
  Download,
  Users,
  Share2,
  Wallet,
  Cloud,
  CloudOff
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<{task: string, completed: boolean}[]>([]);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  useEffect(() => {
    if (user) {
      const today = new Date().toLocaleDateString('fr-FR');
      const savedTasksRaw = localStorage.getItem(`daily_tasks_${user.uid}`);
      const savedDate = localStorage.getItem(`daily_date_${user.uid}`);

      if (savedDate === today && savedTasksRaw) {
        setDailyTasks(JSON.parse(savedTasksRaw));
      } else {
        const shuffled = [...DAILY_CHALLENGES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(t => ({ task: t, completed: false }));
        setDailyTasks(selected);
        localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(selected));
        localStorage.setItem(`daily_date_${user.uid}`, today);
      }
      if (window.matchMedia('(display-mode: standalone)').matches) setShowInstallBanner(false);
    }
  }, [user]);

  if (!user) return null;

  const progress = Math.round(((user.purchasedModuleIds?.filter(id => (user.progress?.[id] || 0) >= 80).length || 0) / (user.purchasedModuleIds?.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      {showInstallBanner && (
        <div className="bg-brand-600 p-4 text-white flex items-center justify-between sticky top-20 z-50">
           <div className="flex items-center gap-3"><Smartphone className="w-5 h-5" /><p className="text-[10px] font-black uppercase tracking-widest">Installer Go'Top Pro sur mon écran</p></div>
           <button onClick={() => alert("Menu Partager > Sur l'écran d'accueil")} className="bg-white text-brand-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Download className="w-3 h-3" /> Comment ?</button>
        </div>
      )}

      <div className="bg-brand-900 pt-20 pb-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-400 font-black text-[10px] uppercase tracking-[0.4em]"><LayoutDashboard className="w-4 h-4" />Tableau de bord stratégique</div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight">Propulsez votre <span className="text-brand-500">empire</span></h1>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="px-10 py-5 bg-white rounded-[1.8rem] text-brand-900 shadow-xl"><p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Maitrise</p><span className="text-4xl font-black">{progress}%</span></div>
              <Link to="/results" className="bg-brand-500 text-white px-8 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-brand-400 transition-all shadow-xl">Boutique <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-32">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Wallet className="w-48 h-48" /></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase text-[14px]">Ma Caisse KITA</h2>
                       {user.isKitaPremium ? <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100"><Cloud className="w-3 h-3" /> Cloud Actif</div> : <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-amber-100"><CloudOff className="w-3 h-3" /> Mode Local</div>}
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-md">Gérez vos recettes, dépenses et stock en temps réel. Protégez vos chiffres avec la sauvegarde Elite.</p>
                    <div className="flex gap-4">
                       <button onClick={() => navigate('/caisse')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-600 transition-all">Saisir une vente</button>
                       <button onClick={() => navigate('/caisse')} className="bg-slate-50 text-slate-400 border border-slate-100 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Historique</button>
                    </div>
                 </div>
                 <div className="h-40 w-40 bg-brand-50 rounded-[3rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform"><Wallet className="w-16 h-16 text-brand-500" /></div>
               </div>
            </section>

            <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl overflow-hidden relative">
               <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase text-[14px]"><Zap className="w-6 h-6 text-brand-gold fill-current" />Discipline du jour</h2>
                 <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-full border border-slate-100"><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{dailyTasks.filter(t => t.completed).length} / 3 Validés</span></div>
               </div>
               <div className="grid md:grid-cols-3 gap-6">
                    {dailyTasks.map((task, idx) => (
                      <button key={idx} onClick={() => {
                        const updated = [...dailyTasks];
                        updated[idx].completed = !updated[idx].completed;
                        setDailyTasks(updated);
                        localStorage.setItem(`daily_tasks_${user.uid}`, JSON.stringify(updated));
                      }} className={`text-left p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 h-full ${task.completed ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-50 hover:border-brand-500'}`}>
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border-2 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>{task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}</div>
                        <span className={`text-sm font-bold leading-relaxed ${task.completed ? 'line-through opacity-50' : 'text-slate-800'}`}>{task.task}</span>
                      </button>
                    ))}
               </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <button onClick={() => {if(navigator.share) navigator.share({title:"Go'Top Pro", url: window.location.origin+"/#/login?ref="+user.phoneNumber}); else alert("Lien copié !");}} className="w-full bg-brand-500 text-white p-8 rounded-[3rem] shadow-xl flex flex-col items-center text-center gap-4 group hover:bg-brand-600 transition-all border border-brand-400">
               <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Share2 className="w-7 h-7" /></div>
               <div><h3 className="text-lg font-black uppercase tracking-widest mb-1">Recruter un filleul</h3><p className="text-[10px] font-medium text-white/80">Gagnez des bonus d'ambassadeur.</p></div>
            </button>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10">
              <div className="flex items-center justify-between mb-10"><div className="flex items-center gap-3"><Award className="w-5 h-5 text-brand-500" /><h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Certifications</h3></div><div className="bg-brand-50 text-brand-600 px-3 py-1 rounded-lg font-black text-xs">{user.badges.length}</div></div>
              <div className="grid grid-cols-2 gap-4">
                {BADGES.map(badge => (
                  <div key={badge.id} className={`h-24 rounded-[2rem] flex flex-col items-center justify-center gap-2 border-2 transition-all ${user.badges.includes(badge.id) ? 'bg-brand-50 border-brand-100 shadow-lg' : 'bg-slate-50 border-slate-50 grayscale opacity-20 scale-95'}`}><span className="text-3xl">{badge.icon}</span><span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{badge.name}</span></div>
                ))}
              </div>
            </div>

            <div className="bg-brand-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <h3 className="font-black text-brand-400 mb-8 uppercase text-[10px] tracking-[0.4em]">Mentor Kita</h3>
              <p className="text-2xl text-white italic leading-relaxed font-serif font-medium mb-12">« On ne gère bien que ce que l'on mesure précisément chaque jour. »</p>
              <div className="flex items-center gap-5 pt-10 border-t border-white/10"><div className="h-20 w-20 rounded-[2rem] overflow-hidden shadow-2xl border-2 border-brand-400"><img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" /></div><div><span className="text-[11px] font-black text-white uppercase tracking-widest block mb-1">Coach Kita</span><span className="text-[9px] text-brand-400 font-black uppercase tracking-widest opacity-80">Mentor d'Élite</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
