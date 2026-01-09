
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaProduct } from '../types';
import { getKitaProducts, addKitaProduct, updateKitaProduct } from '../services/supabase';
import { 
  Package, 
  ChevronLeft, 
  Plus, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  TrendingUp, 
  ShoppingBag,
  Settings,
  X
} from 'lucide-react';
import { KITA_LOGO } from '../constants';

const Magasin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<KitaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState<Omit<KitaProduct, 'id'>>({
    name: '',
    quantity: 0,
    purchasePrice: 0,
    sellPrice: 0,
    alertThreshold: 2,
    category: 'Shampoing'
  });
  const [saving, setSaving] = useState(false);

  const isUnlocked = user?.hasStockPack;

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getKitaProducts(user.uid);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newProd.name) return;
    setSaving(true);
    try {
      await addKitaProduct(user.uid, newProd);
      await loadProducts();
      setShowAddModal(false);
      setNewProd({ name: '', quantity: 0, purchasePrice: 0, sellPrice: 0, alertThreshold: 2, category: 'Shampoing' });
    } catch (err) {
      alert("Erreur.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStock = async (id: string, newQty: number) => {
    try {
      await updateKitaProduct(id, { quantity: newQty });
      setProducts(products.map(p => p.id === id ? { ...p, quantity: newQty } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const inventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.purchasePrice * p.quantity), 0);
  }, [products]);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
         <div className="h-24 w-24 bg-sky-500/10 text-sky-500 rounded-[2rem] flex items-center justify-center mb-8"><Package className="w-12 h-12" /></div>
         <h1 className="text-4xl font-serif font-bold text-white mb-6">Contrôlez vos Marchandises</h1>
         <p className="text-slate-400 max-w-lg mb-12">Le Pack Stock Expert vous permet de suivre chaque produit et de recevoir des alertes avant la rupture de stock.</p>
         <button onClick={() => navigate('/results?pack=stock')} className="bg-sky-500 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sky-500/20">Activer Magasin (5 000 F)</button>
         <button onClick={() => navigate('/dashboard')} className="mt-8 text-slate-500 font-black text-[10px] uppercase tracking-widest">Retour Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      <header className="bg-slate-900 pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl shrink-0"><img src={KITA_LOGO} alt="" className="w-full h-full object-contain" /></div>
              <div>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white transition mb-2 font-black text-[10px] uppercase tracking-widest group"><ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Dashboard</button>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">KITA <span className="text-sky-500">Magasin</span></h1>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Pilotage Matériel Expert</p>
              </div>
           </div>
           <button onClick={() => setShowAddModal(true)} className="h-20 w-20 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"><Plus className="w-8 h-8" /></button>
        </div>

        <div className="max-w-4xl mx-auto mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-4 ml-4">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <div>
                 <p className="text-white font-black text-[10px] uppercase tracking-widest">Valeur du Stock</p>
                 <p className="text-xl font-bold text-white">{inventoryValue.toLocaleString()} FCFA sur les étagères</p>
              </div>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16">
        {loading ? <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto" /></div> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {products.map(p => {
               const isLow = p.quantity <= p.alertThreshold;
               return (
                 <div key={p.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all group ${isLow ? 'border-rose-500/50 bg-rose-50/20' : 'border-slate-100 hover:border-sky-500/30'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                       {isLow && <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{p.name}</h3>
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Quantité</p>
                          <p className={`text-4xl font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{p.quantity}</p>
                       </div>
                       <div className="flex flex-col gap-2">
                          <button onClick={() => handleUpdateStock(p.id, p.quantity + 1)} className="p-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-500 hover:text-white transition-all">+</button>
                          <button onClick={() => handleUpdateStock(p.id, Math.max(0, p.quantity - 1))} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">-</button>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex justify-between">
                       <div><p className="text-[9px] font-black text-slate-400 uppercase">Prix Achat</p><p className="font-bold">{p.purchasePrice} F</p></div>
                       <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Prix Vente</p><p className="font-bold text-emerald-600">{p.sellPrice} F</p></div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>

      {/* Modal Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-md">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-12 relative overflow-hidden">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8">Nouveau Produit</h2>
              <form onSubmit={handleAddProduct} className="space-y-6">
                 <input type="text" placeholder="Nom du produit" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-slate-50 border-none outline-none font-bold" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Stock Initial" onChange={e => setNewProd({...newProd, quantity: Number(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-slate-50 border-none outline-none font-bold" />
                    <input type="number" placeholder="Seuil Alerte" onChange={e => setNewProd({...newProd, alertThreshold: Number(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-slate-50 border-none outline-none font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Prix Achat" onChange={e => setNewProd({...newProd, purchasePrice: Number(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-slate-50 border-none outline-none font-bold" />
                    <input type="number" placeholder="Prix Revente" onChange={e => setNewProd({...newProd, sellPrice: Number(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-slate-50 border-none outline-none font-bold" />
                 </div>
                 <button type="submit" disabled={saving} className="w-full py-5 bg-sky-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-sky-600 transition-all flex items-center justify-center gap-3 shadow-xl">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Valider le produit
                 </button>
                 <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-slate-300 font-black text-[10px] uppercase">Annuler</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Magasin;
