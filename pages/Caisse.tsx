
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  updateKitaTransaction,
  deleteKitaTransaction 
} from '../services/supabase';
import { 
  Plus, 
  Trash2, 
  Pencil,
  TrendingUp, 
  TrendingDown, 
  ChevronLeft, 
  Loader2, 
  Wallet,
  Calendar,
  Settings,
  Target,
  History,
  CheckCircle2
} from 'lucide-react';
import { KITA_LOGO } from '../constants';

type PeriodFilter = 'today' | 'week' | 'month';

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTrans, setNewTrans] = useState<Omit<KitaTransaction, 'id'>>({
    type: 'INCOME',
    amount: 0,
    label: '',
    category: 'Prestation',
    paymentMethod: 'Espèces',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getKitaTransactions(user.uid);
      setTransactions(data);
    } catch (err) {
      console.error("Erreur chargement transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7;
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
    startOfWeek.setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(t => {
      const tDate = new Date(t.date).getTime();
      if (period === 'today') return tDate >= today;
      if (period === 'week') return tDate >= startOfWeek.getTime();
      if (period === 'month') return tDate >= startOfMonth;
      return true;
    });
  }, [transactions, period]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newTrans.amount <= 0 || !newTrans.label) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateKitaTransaction(editingId, newTrans);
      } else {
        await addKitaTransaction(user.uid, newTrans);
      }
      await loadTransactions();
      closeModal();
    } catch (err) {
      console.error("Erreur sauvegarde transaction:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: KitaTransaction) => {
    setEditingId(t.id);
    setNewTrans({
      type: t.type,
      amount: t.amount,
      label: t.label,
      category: t.category,
      paymentMethod: t.paymentMethod,
      date: t.date
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer cet enregistrement ?")) return;
    try {
      await deleteKitaTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      console.error("Erreur suppression transaction:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewTrans({
      type: 'INCOME',
      amount: 0,
      label: '',
      category: 'Prestation',
      paymentMethod: 'Espèces',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      
      {/* CONSOLE HEADER (Dark Blue Hero from Screenshot) */}
      <header className="bg-[#0c4a6e] pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none italic font-serif text-[15rem] leading-none">KITA</div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl shrink-0">
                 <img src={KITA_LOGO} alt="Logo Kita" className="w-full h-full object-contain" />
              </div>
              <div>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white transition mb-2 font-black text-[10px] uppercase tracking-widest group">
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Retour Dashboard
                 </button>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight flex items-baseline gap-3">
                    Console <span className="text-[#0ea5e9]">KITA</span>
                 </h1>
                 <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-brand-500/20 px-3 py-1.5 rounded-full text-[#fbbf24] text-[9px] font-black uppercase tracking-widest border border-brand-500/30">
                       <Settings className="w-3 h-3" /> Mode Local
                    </div>
                    <button className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-white/60 text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                       <Plus className="w-3 h-3" /> Config Loyer
                    </button>
                 </div>
              </div>
           </div>

           {/* LE GROS BOUTON + BLEU (Cercle jaune de ton image) */}
           <button 
             onClick={() => setIsModalOpen(true)}
             className="h-24 w-24 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center shadow-[0_20px_50px_rgba(14,165,233,0.5)] hover:scale-110 active:scale-95 transition-all group"
           >
              <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
           </button>
        </div>

        {/* Objectif Loyer Bar */}
        <div className="max-w-4xl mx-auto mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-4 flex items-center justify-between shadow-2xl">
           <p className="text-white/60 text-xs italic ml-6">Configurez votre loyer pour activer la jauge de sécurité.</p>
           <button className="bg-white/10 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
              Définir l'objectif
           </button>
        </div>
      </header>

      {/* Tabs Filter */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 flex justify-center relative z-30">
        <div className="bg-white p-1.5 rounded-[2.5rem] flex gap-1 shadow-2xl border border-slate-50">
          {(['today', 'week', 'month'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p 
                  ? 'bg-[#0f172a] text-white shadow-xl scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        
        {/* Main Summary Card */}
        <div className="bg-white rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-slate-50 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
           <div className="grid grid-cols-2 gap-16 md:gap-24 flex-grow">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recettes</p>
                 <p className="text-4xl font-black text-emerald-500">+{totals.income.toLocaleString()} F</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dépenses</p>
                 <p className="text-4xl font-black text-rose-500">-{totals.expense.toLocaleString()} F</p>
              </div>
           </div>

           <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white min-w-[320px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform group-hover:scale-110">
                 <Wallet className="w-24 h-24" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 relative z-10">Balance Nette</p>
              <div className="flex items-baseline gap-3 relative z-10">
                 <p className="text-4xl font-black tracking-tight">{(totals.income - totals.expense).toLocaleString()}</p>
                 <p className="text-lg font-bold text-slate-500">FCFA</p>
              </div>
           </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9] mx-auto" /></div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleEdit(t)}
                className="bg-white p-8 rounded-[2.5rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:border-brand-500 transition-all cursor-pointer group animate-in slide-in-from-bottom-2"
              >
                <div className="flex items-center gap-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xl leading-none mb-2">{t.label}</p>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                       <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                       <span>{t.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-10">
                  <p className={`text-2xl font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()} F
                  </p>
                  
                  {/* BOUTONS MODIFIER / SUPPRIMER */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(t); }} 
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-500 hover:text-white transition-all shadow-sm"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(t.id, e)} 
                      className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="text-center mb-10">
              <div className="h-16 w-16 bg-brand-50 text-brand-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                {editingId ? <Pencil className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900">{editingId ? "Modifier l'écriture" : "Nouvel Enregistrement"}</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Gestion Standard KITA</p>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-8">
              <div className="flex bg-slate-100 p-1.5 rounded-[2rem]">
                <button type="button" onClick={() => setNewTrans({...newTrans, type: 'INCOME'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400'}`}>Recette (+)</button>
                <button type="button" onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-400'}`}>Dépense (-)</button>
              </div>

              <div className="space-y-4">
                <input 
                  type="number" 
                  placeholder="Montant (FCFA)" 
                  value={newTrans.amount || ''} 
                  onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})} 
                  className="w-full px-8 py-8 rounded-[2.5rem] bg-slate-50 border-none outline-none font-black text-5xl text-center text-slate-900 shadow-inner focus:ring-4 focus:ring-brand-500/10" 
                  autoFocus
                />
                <input 
                  type="text" 
                  placeholder="Libellé (ex: Coupe dame...)" 
                  value={newTrans.label} 
                  onChange={e => setNewTrans({...newTrans, label: e.target.value})} 
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-lg shadow-inner focus:ring-4 focus:ring-brand-500/10" 
                />
                <div className="grid grid-cols-2 gap-4">
                   <select 
                    value={newTrans.category}
                    onChange={e => setNewTrans({...newTrans, category: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black text-[10px] uppercase tracking-widest shadow-inner outline-none"
                   >
                     <option>Prestation</option>
                     <option>Vente produit</option>
                     <option>Achat stock</option>
                     <option>Loyer/Charges</option>
                     <option>Salaires</option>
                     <option>Autre</option>
                   </select>
                   <input 
                    type="date" 
                    value={newTrans.date}
                    onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black text-[10px] uppercase tracking-widest shadow-inner outline-none" 
                   />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-grow bg-[#0f172a] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:scale-105 transition-all"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} 
                  {editingId ? "Mettre à jour" : "Valider l'écriture"}
                </button>
                <button type="button" onClick={closeModal} className="px-10 py-6 rounded-2xl font-black text-[10px] uppercase text-slate-300 hover:text-slate-900 transition-colors">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;
