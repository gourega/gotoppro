
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaTransaction, KitaDebt } from '../types';
import { 
  getKitaTransactions, 
  addKitaTransaction, 
  updateKitaTransaction,
  deleteKitaTransaction,
  getKitaDebts,
  addKitaDebt,
  markDebtAsPaid
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
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone
} from 'lucide-react';
import { KITA_LOGO } from '../constants';

type PeriodFilter = 'today' | 'week' | 'month' | 'debts';

const Caisse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<KitaTransaction[]>([]);
  const [debts, setDebts] = useState<KitaDebt[]>([]);
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
    date: new Date().toISOString().split('T')[0],
    isCredit: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [transData, debtData] = await Promise.all([
        getKitaTransactions(user.uid),
        getKitaDebts(user.uid)
      ]);
      setTransactions(transData);
      setDebts(debtData);
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7;
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
    startOfWeek.setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(t => {
      // On exclut les crédits du calcul de cash flow direct
      if (t.isCredit) return false;
      
      const tDate = new Date(t.date).getTime();
      if (period === 'today') return t.date === todayStr;
      if (period === 'week') return tDate >= startOfWeek.getTime();
      if (period === 'month') return tDate >= startOfMonth;
      return true;
    });
  }, [transactions, period]);

  const totals = useMemo(() => {
    const cashTotals = filteredTransactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });

    const totalDebts = debts.filter(d => !d.isPaid).reduce((acc, d) => acc + d.amount, 0);
    return { ...cashTotals, unpaidDebts: totalDebts };
  }, [filteredTransactions, debts]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newTrans.amount <= 0 || !newTrans.label) return;
    setSaving(true);
    try {
      if (newTrans.isCredit && newTrans.type === 'INCOME') {
        // C'est une dette
        await addKitaDebt(user.uid, {
          personName: newTrans.label,
          amount: newTrans.amount,
          isPaid: false,
          createdAt: new Date().toISOString(),
          phone: ''
        });
        // On enregistre aussi dans l'historique mais marqué comme crédit
        await addKitaTransaction(user.uid, { ...newTrans, category: 'Ardoise' });
      } else {
        if (editingId) {
          await updateKitaTransaction(editingId, newTrans);
        } else {
          await addKitaTransaction(user.uid, newTrans);
        }
      }
      await loadData();
      closeModal();
    } catch (err) {
      console.error("Erreur sauvegarde transaction:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCollectDebt = async (debt: KitaDebt) => {
    if (!user || !window.confirm(`Encaisser ${debt.amount} F de ${debt.personName} ?`)) return;
    setSaving(true);
    try {
      await markDebtAsPaid(debt.id);
      // Créer la transaction de recette réelle
      await addKitaTransaction(user.uid, {
        type: 'INCOME',
        amount: debt.amount,
        label: `Paiement Ardoise: ${debt.personName}`,
        category: 'Ardoise récupérée',
        paymentMethod: 'Espèces',
        date: new Date().toISOString().split('T')[0],
        isCredit: false
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
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
      date: new Date().toISOString().split('T')[0],
      isCredit: false
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      
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
                       <Settings className="w-3 h-3" /> Pilotage Argent
                    </div>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => setIsModalOpen(true)}
             className="h-24 w-24 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center shadow-[0_20px_50px_rgba(14,165,233,0.5)] hover:scale-110 active:scale-95 transition-all group"
           >
              <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
           </button>
        </div>

        <div className="max-w-4xl mx-auto mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-4 ml-4">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <div>
                 <p className="text-white font-black text-[10px] uppercase tracking-widest">Total des Ardoises</p>
                 <p className="text-xl font-bold text-white">{totals.unpaidDebts.toLocaleString()} FCFA à récupérer</p>
              </div>
           </div>
           <button onClick={() => setPeriod('debts')} className="bg-amber-400 text-brand-900 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
              Gérer les ardoises
           </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-8 flex justify-center relative z-30">
        <div className="bg-white p-1.5 rounded-[2.5rem] flex gap-1 shadow-2xl border border-slate-50 overflow-x-auto">
          {(['today', 'week', 'month', 'debts'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-8 md:px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                period === p 
                  ? 'bg-[#0f172a] text-white shadow-xl scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? "Semaine" : p === 'month' ? "Mois" : "Ardoises"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
        
        {period !== 'debts' && (
          <div className="bg-white rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-slate-50 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
             <div className="grid grid-cols-2 gap-16 md:gap-24 flex-grow">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recettes (Cash)</p>
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
        )}

        {loading ? (
          <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9] mx-auto" /></div>
        ) : period === 'debts' ? (
          <div className="space-y-6">
             <div className="flex items-center gap-4 px-4">
                <History className="w-6 h-6 text-brand-900" />
                <h2 className="text-xl font-black uppercase tracking-widest text-brand-900">Le Carnet d'Ardoises</h2>
             </div>
             {debts.filter(d => !d.isPaid).length === 0 ? (
               <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                  <p className="text-slate-500 font-bold italic">Toutes vos dettes sont recouvrées. Excellence KITA !</p>
               </div>
             ) : (
               <div className="grid gap-4">
                  {debts.filter(d => !d.isPaid).map(d => (
                    <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all group">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                             <Clock className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 text-xl mb-1">{d.personName}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En attente depuis le {new Date(d.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <p className="text-2xl font-black text-rose-600">{d.amount.toLocaleString()} F</p>
                          <button 
                            onClick={() => handleCollectDebt(d)}
                            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg transition-all flex items-center gap-2"
                          >
                             <CheckCircle2 className="w-4 h-4" /> Encaisser
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(t => (
              <div 
                key={t.id} 
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2"
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
                  <button onClick={(e) => handleDelete(t.id, e)} className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Nouvelle opération</h2>

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
                  className="w-full px-8 py-8 rounded-[2.5rem] bg-slate-50 border-none outline-none font-black text-5xl text-center shadow-inner" 
                />
                <input 
                  type="text" 
                  placeholder={newTrans.isCredit ? "Nom du client" : "Libellé"} 
                  value={newTrans.label} 
                  onChange={e => setNewTrans({...newTrans, label: e.target.value})} 
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold" 
                />
                
                {newTrans.type === 'INCOME' && (
                  <label className="flex items-center gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={newTrans.isCredit} 
                      onChange={e => setNewTrans({...newTrans, isCredit: e.target.checked})}
                      className="w-6 h-6 rounded-lg text-amber-500 border-none focus:ring-0"
                    />
                    <div className="flex-grow">
                       <p className="text-sm font-black text-amber-900 uppercase">Vente à crédit (Ardoise)</p>
                       <p className="text-[10px] font-medium text-amber-700 italic">N'entrera pas dans le cash aujourd'hui.</p>
                    </div>
                  </label>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <select 
                    value={newTrans.category}
                    onChange={e => setNewTrans({...newTrans, category: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black text-[10px] uppercase shadow-inner outline-none"
                   >
                     <option>Prestation</option>
                     <option>Vente produit</option>
                     <option>Loyer/Charges</option>
                     <option>Salaires</option>
                   </select>
                   <input type="date" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black text-[10px] uppercase shadow-inner outline-none" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={saving} className="flex-grow bg-[#0f172a] text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} 
                  Valider l'écriture
                </button>
                <button type="button" onClick={closeModal} className="px-10 py-6 rounded-2xl font-black text-[10px] uppercase text-slate-300">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caisse;
