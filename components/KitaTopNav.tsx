
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Users, Package, BookOpen, Sparkles } from 'lucide-react';
import { KITA_LOGO } from '../constants';

const KitaTopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'finances', label: 'FINANCES', path: '/caisse', icon: <Wallet className="w-4 h-4" />, color: 'bg-amber-400 text-brand-900 shadow-amber-200' },
    { id: 'rh', label: 'RESSOURCES HUMAINES', path: '/pilotage', icon: <Users className="w-4 h-4" />, color: 'bg-emerald-500 text-white shadow-emerald-200' },
    { id: 'stock', label: 'STOCK', path: '/magasin', icon: <Package className="w-4 h-4" />, color: 'bg-sky-500 text-white shadow-sky-200' },
    { id: 'marketing', label: 'MARKETING IA', path: '/marketing', icon: <Sparkles className="w-4 h-4" />, color: 'bg-rose-500 text-white shadow-rose-200' },
    { id: 'formation', label: 'FORMATION', path: '/mes-formations', icon: <BookOpen className="w-4 h-4" />, color: 'bg-indigo-600 text-white shadow-indigo-200' },
  ];

  return (
    <div className="bg-slate-900 text-white px-6 py-4 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-2xl border-b border-white/5 w-full sticky top-20 z-50 backdrop-blur-md bg-slate-900/90">
      <div className="flex items-center gap-4">
        <div className="bg-white p-1 rounded-xl shadow-inner">
          <img src={KITA_LOGO} alt="KITA" className="w-8 h-8 object-contain" />
        </div>
        <div className="hidden md:block">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Standard KITA V2.5</h3>
          <p className="text-xs font-bold text-white uppercase">Console de Pilotage</p>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                isActive 
                ? `${item.color} shadow-lg ring-2 ring-white/20` 
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span className={isActive ? 'block' : 'hidden sm:block'}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default KitaTopNav;
