
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
  X
} from 'lucide-react';
import KitaTopNav from '../components/KitaTopNav';

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

  const inventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.purchasePrice * p.quantity), 0);
  }, [products]);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
         <KitaTopNav />
         <div className="h-24 w-24 bg-sky-500/10 text-sky-500 rounded-[2rem] flex items-center justify-center mb-8 mt-20"><Package className="w-12 h-12" /></div>
         <h1 className="text-4xl font-serif font-bold text-white mb-6">Contrôlez votre Stock</h1>
         <p className="text-slate-400 max-w-lg mb-12">Le Pack Stock Expert vous permet de suivre chaque produit et de recevoir des alertes avant la rupture.</p>
         <button onClick={() => navigate('/results?pack=stock')} className="bg-sky-500 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sky-500/20">Activer le Stock Expert (5 000 F)</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      <KitaTopNav />
      <header className="bg-sky-600 pt-16 pb-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-white text-[15rem] font-serif italic leading-none">Box</div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
           <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl shrink-0"><Package className="w-full h-full text-sky-500" /></div>
              <div>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-brand-900/50 hover:text-brand-900 transition mb-2 font-black text-[10px] uppercase tracking-widest group"><ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Dashboard</button>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Gestion du <span className="text-brand-900 italic">Stock</span></h1>
              </div>
           </div>
           <button onClick={() => setShowAddModal(true)} className="h-20 w-20 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all"><Plus className="w-8 h-8" /></button>
        </div>
        <div className="max-w-4xl mx-auto mt-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[3rem] p-6 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-4 ml-4">
              <TrendingUp className="w-6 h-6 text-brand-900" />
              <div>
                 <p className="text-brand-900 font-black text-[10px] uppercase tracking-widest">Valeur Marchande</p>
                 <p className="text-xl font-bold text-white">{inventoryValue.toLocaleString()} F sur étagères</p>
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
                 <div key={p.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all group ${isLow ? 'border-rose-500/50 bg-rose-50/20' : 'border-slate-100 hover:border-sky-500'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                       {isLow && <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{p.name}</h3>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Stock</p><p className={`text-4xl font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{p.quantity}</p></div>
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Magasin;
