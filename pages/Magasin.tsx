
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KitaProduct, KitaSupplier } from '../types';
import { 
  getKitaProducts, 
  addKitaProduct, 
  getKitaSuppliers, 
  addKitaSupplier, 
  deleteKitaSupplier 
} from '../services/supabase';
import { 
  Package, 
  ChevronLeft, 
  Plus, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  TrendingUp,
  X,
  Truck,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  Tag,
  RefreshCw,
  Filter,
  UserPlus
} from 'lucide-react';
import KitaTopNav from '../components/KitaTopNav';

type ViewMode = 'inventory' | 'suppliers';

const Magasin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<KitaProduct[]>([]);
  const [suppliers, setSuppliers] = useState<KitaSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('inventory');
  const [filterAlerts, setFilterAlerts] = useState(false);
  
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  
  const [newProd, setNewProd] = useState<Omit<KitaProduct, 'id'>>({
    name: '',
    quantity: 0,
    purchasePrice: 0,
    sellPrice: 0,
    alertThreshold: 2,
    category: 'Shampoing',
    supplierId: ''
  });
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', category: 'Grossiste' });
  const [saving, setSaving] = useState(false);

  const isUnlocked = user?.hasStockPack;

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prodData, suppData] = await Promise.all([
        getKitaProducts(user.uid),
        getKitaSuppliers(user.uid)
      ]);
      setProducts(prodData);
      setSuppliers(suppData);
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
      const saved = await addKitaProduct(user.uid, newProd);
      if (saved) setProducts([...products, saved]);
      setShowAddProductModal(false);
      setNewProd({ name: '', quantity: 0, purchasePrice: 0, sellPrice: 0, alertThreshold: 2, category: 'Shampoing', supplierId: '' });
    } catch (err) {
      alert("Erreur ajout produit.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSupplier.name) return;
    setSaving(true);
    try {
      const saved = await addKitaSupplier(user.uid, newSupplier);
      if (saved) setSuppliers([...suppliers, saved]);
      setShowAddSupplierModal(false);
      setNewSupplier({ name: '', phone: '', category: 'Grossiste' });
    } catch (err) {
      alert("Erreur ajout fournisseur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm("Supprimer ce fournisseur ?")) return;
    try {
      await deleteKitaSupplier(id);
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (err) {
      alert("Erreur suppression.");
    }
  };

  const alertCount = useMemo(() => {
    return products.filter(p => p.quantity <= p.alertThreshold).length;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!filterAlerts) return products;
    return products.filter(p => p.quantity <= p.alertThreshold);
  }, [products, filterAlerts]);

  const inventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.purchasePrice * p.quantity), 0);
  }, [products]);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
         <KitaTopNav />
         <div className="h-24 w-24 bg-sky-500/10 text-sky-500 rounded-[2rem] flex items-center justify-center mb-8 mt-20"><Package className="w-12 h-12" /></div>
         <h1 className="text-4xl font-serif font-bold text-white mb-6">Contrôlez votre Stock</h1>
         <p className="text-slate-400 max-w-lg mb-12">Le Pack Stock Expert vous permet de suivre chaque produit et d'éviter les ruptures de stock qui font fuir les clients.</p>
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
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Pilotage du <span className="text-brand-900 italic">Stock</span></h1>
              </div>
           </div>
           
           <div className="flex gap-4">
              <button onClick={loadData} className="h-16 w-16 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-all"><RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} /></button>
              <button 
                onClick={() => view === 'inventory' ? setShowAddProductModal(true) : setShowAddSupplierModal(true)} 
                className="h-16 w-16 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all group"
              ><Plus className="w-8 h-8 group-hover:rotate-90 transition-all" /></button>
           </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[3rem] p-6 flex flex-col sm:flex-row items-center justify-between shadow-2xl gap-6">
           <div className="flex items-center gap-4 ml-4">
              <TrendingUp className="w-6 h-6 text-brand-900" />
              <div>
                 <p className="text-brand-900 font-black text-[10px] uppercase tracking-widest">Valeur Marchande</p>
                 <p className="text-xl font-bold text-white">{inventoryValue.toLocaleString()} F</p>
              </div>
           </div>
           <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10">
              <button onClick={() => setView('inventory')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${view === 'inventory' ? 'bg-white text-sky-600 shadow-lg' : 'text-white/60 hover:text-white'}`}>Inventaire</button>
              <button onClick={() => setView('suppliers')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${view === 'suppliers' ? 'bg-white text-sky-600 shadow-lg' : 'text-white/60 hover:text-white'}`}>Fournisseurs</button>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16 space-y-10">
        {view === 'inventory' && products.length > 0 && (
          <div className="flex justify-center">
            <button 
              onClick={() => setFilterAlerts(!filterAlerts)}
              className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${filterAlerts ? 'bg-rose-500 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              <AlertTriangle className="w-4 h-4" /> 
              {filterAlerts ? `Alerte Stock Uniquement (${alertCount})` : `Tout le stock`}
              <Filter className="w-3 h-3 ml-2" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto" /></div>
        ) : view === 'inventory' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
             {filteredProducts.length > 0 ? filteredProducts.map(p => {
               const isLow = p.quantity <= p.alertThreshold;
               const supplier = suppliers.find(s => s.id === p.supplierId);
               return (
                 <div key={p.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all group ${isLow ? 'border-rose-500 bg-rose-50/20' : 'border-slate-100 hover:border-sky-500 hover:shadow-xl'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                       {isLow && <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{p.name}</h3>
                    <div className="space-y-6 mb-8">
                       <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Actuel</p><p className={`text-4xl font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{p.quantity}</p></div>
                       {supplier && <div className="flex items-center gap-2 text-slate-500"><Truck className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase truncate">{supplier.name}</span></div>}
                    </div>
                    <div className="flex justify-between border-t border-slate-50 pt-6">
                       <div><p className="text-[9px] font-black text-slate-400 uppercase">Achat</p><p className="font-bold text-slate-600 text-sm">{p.purchasePrice.toLocaleString()} F</p></div>
                       <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Vente</p><p className="font-bold text-sky-600 text-sm">{p.sellPrice.toLocaleString()} F</p></div>
                    </div>
                 </div>
               );
             }) : (
               <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 italic">Aucun produit en stock.</div>
             )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
             {suppliers.length > 0 ? suppliers.map(s => (
               <div key={s.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
                  <div className="flex justify-between items-start mb-6">
                     <span className="bg-sky-50 text-sky-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">{s.category}</span>
                     <button onClick={() => handleDeleteSupplier(s.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{s.name}</h3>
                  <p className="text-xs text-slate-400 font-medium mb-8">{s.phone}</p>
                  <div className="flex gap-3">
                     <a href={`https://wa.me/${s.phone.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="flex-grow bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 shadow-lg transition-all"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
                     <a href={`tel:${s.phone}`} className="h-12 w-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all"><Phone className="w-5 h-5" /></a>
                  </div>
               </div>
             )) : (
               <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 italic">Aucun fournisseur enregistré.</div>
             )}
          </div>
        )}
      </div>

      {showAddProductModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-12 relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowAddProductModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Entrée de Stock</h2>
              <form onSubmit={handleAddProduct} className="space-y-6">
                 <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom du produit</label><input type="text" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Shampoing Keratine 1L" required /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantité</label><input type="number" value={newProd.quantity} onChange={e => setNewProd({...newProd, quantity: Number(e.target.value)})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alerte rupture</label><input type="number" value={newProd.alertThreshold} onChange={e => setNewProd({...newProd, alertThreshold: Number(e.target.value)})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prix d'Achat (F)</label><input type="number" value={newProd.purchasePrice} onChange={e => setNewProd({...newProd, purchasePrice: Number(e.target.value)})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prix de Vente (F)</label><input type="number" value={newProd.sellPrice} onChange={e => setNewProd({...newProd, sellPrice: Number(e.target.value)})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" /></div>
                 </div>
                 <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fournisseur</label><select value={newProd.supplierId} onChange={e => setNewProd({...newProd, supplierId: e.target.value})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 appearance-none"><option value="">-- Sélectionner --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                 <button type="submit" disabled={saving} className="w-full bg-sky-500 text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-sky-600 transition-all">{saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Enregistrer en Inventaire</button>
              </form>
           </div>
        </div>
      )}

      {showAddSupplierModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-12 relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowAddSupplierModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600"><X /></button>
              <h2 className="text-3xl font-serif font-bold text-slate-900 text-center mb-10">Fiche Fournisseur</h2>
              <form onSubmit={handleAddSupplier} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom du fournisseur</label>
                    <input type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: Grossiste Lumière" required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp / Téléphone</label>
                    <input type="tel" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900" placeholder="Ex: 0707881515" required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catégorie</label>
                    <select value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})} className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-900 appearance-none">
                       <option value="Grossiste">Grossiste</option>
                       <option value="Fabricant">Fabricant</option>
                       <option value="Revendeur">Revendeur</option>
                       <option value="Autre">Autre</option>
                    </select>
                 </div>
                 <button type="submit" disabled={saving} className="w-full bg-brand-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all">
                    {saving ? <Loader2 className="animate-spin" /> : <UserPlus className="w-5 h-5 text-brand-500" />} Enregistrer le Fournisseur
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Magasin;
