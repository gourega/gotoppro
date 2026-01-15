
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier, KitaService } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * GÉNÉRATION & VALIDATION ID
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * MAPPING DATA (DB <=> APP)
 */
const mapProfileFromDB = (data: any): UserProfile | null => {
  if (!data) return null;
  return {
    ...data,
    pinCode: data.pinCode || '1234', 
    badges: Array.isArray(data.badges) ? data.badges : [],
    purchasedModuleIds: Array.isArray(data.purchasedModuleIds) ? data.purchasedModuleIds : [],
    pendingModuleIds: Array.isArray(data.pendingModuleIds) ? data.pendingModuleIds : [],
    actionPlan: Array.isArray(data.actionPlan) ? data.actionPlan : [],
    referralCount: data.referralCount || 0,
    createdAt: data.createdAt || new Date().toISOString()
  } as UserProfile;
};

const mapProfileToDB = (profile: Partial<UserProfile>) => {
  const cleanData: any = {};
  Object.keys(profile).forEach(key => {
    if ((profile as any)[key] !== undefined) {
      cleanData[key] = (profile as any)[key];
    }
  });
  return cleanData;
};

/**
 * PROFILS
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase || !uid) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
    if (error) throw error;
    return mapProfileFromDB(data);
  } catch (err) {
    return null;
  }
};

export const getProfileByPhone = async (phoneNumber: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('phoneNumber', phoneNumber).maybeSingle();
    if (error) throw error;
    return mapProfileFromDB(data);
  } catch (err) {
    return null;
  }
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Supabase non initialisé");
  const dbData = mapProfileToDB(profile);
  const { error } = await supabase
    .from('profiles')
    .upsert(dbData, { onConflict: 'uid' });
    
  if (error) {
    console.error("Supabase Save Error:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!supabase || !uid) return;
  const dbData = mapProfileToDB(updates);
  const { error } = await supabase.from('profiles').update(dbData).eq('uid', uid);
  if (error) throw error;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data || []).map(mapProfileFromDB) as UserProfile[];
  } catch (err) {
    return [];
  }
};

export const deleteUserProfile = async (uid: string) => {
  if (!supabase || !uid) return;
  const { error } = await supabase.from('profiles').delete().eq('uid', uid);
  if (error) throw error;
};

/**
 * KITA TRANSACTIONS (Caisse)
 */
export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_transactions').select('*').eq('user_id', userId);
  return error ? [] : data.map(t => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    label: t.label,
    category: t.category,
    paymentMethod: t.payment_method,
    date: t.date,
    staffName: t.staff_name,
    commissionRate: t.commission_rate,
    isCredit: t.is_credit
  }));
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase || !userId) return null;
  const { data, error } = await (supabase as any).from('kita_transactions').insert({
    user_id: userId,
    type: transaction.type,
    amount: transaction.amount,
    label: transaction.label,
    category: transaction.category,
    payment_method: transaction.paymentMethod,
    date: transaction.date,
    staff_name: transaction.staffName,
    commission_rate: transaction.commissionRate,
    is_credit: transaction.isCredit || false
  }).select().single();
  
  if (error || !data) {
    console.error("Transaction Error:", error);
    return null;
  }
  return mapTransactionFromDB(data);
};

const mapTransactionFromDB = (data: any): KitaTransaction => ({
  id: data.id,
  type: data.type,
  amount: data.amount,
  label: data.label,
  category: data.category,
  paymentMethod: data.payment_method,
  date: data.date,
  staffName: data.staff_name,
  commissionRate: data.commission_rate,
  isCredit: data.is_credit
});

export const deleteKitaTransaction = async (id: string) => {
  if (supabase) await supabase.from('kita_transactions').delete().eq('id', id);
};

/**
 * KITA DETTES
 */
export const getKitaDebts = async (userId: string): Promise<KitaDebt[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_debts').select('*').eq('user_id', userId);
  return error ? [] : data.map(d => ({
    id: d.id,
    personName: d.person_name,
    amount: d.amount,
    phone: d.phone,
    isPaid: d.is_paid,
    createdAt: d.created_at,
    paidAt: d.paid_at
  }));
};

export const addKitaDebt = async (userId: string, debt: Omit<KitaDebt, 'id'>) => {
  if (!supabase || !userId) return null;
  const { data, error } = await (supabase as any).from('kita_debts').insert({
    user_id: userId,
    person_name: debt.personName,
    amount: debt.amount,
    phone: debt.phone,
    is_paid: debt.isPaid,
    created_at: debt.createdAt
  }).select().single();
  return error ? null : {
    id: data.id,
    personName: data.person_name,
    amount: data.amount,
    phone: data.phone,
    isPaid: data.is_paid,
    createdAt: data.created_at
  };
};

export const markDebtAsPaid = async (debtId: string) => {
  if (supabase) await supabase.from('kita_debts').update({ is_paid: true, paid_at: new Date().toISOString() }).eq('id', debtId);
};

/**
 * KITA STOCK
 */
export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_products').select('*').eq('user_id', userId);
  return error ? [] : data.map(p => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    purchasePrice: p.purchase_price,
    sellPrice: p.sell_price,
    alertThreshold: p.alert_threshold,
    category: p.category,
    supplierId: p.supplier_id
  }));
};

export const addKitaProduct = async (userId: string, product: Omit<KitaProduct, 'id'>) => {
  if (!supabase || !userId) return null;
  const { data, error } = await (supabase as any).from('kita_products').insert({
    user_id: userId,
    name: product.name,
    quantity: product.quantity,
    purchase_price: product.purchasePrice,
    sell_price: product.sellPrice,
    alert_threshold: product.alertThreshold,
    category: product.category,
    supplier_id: product.supplierId
  }).select().single();
  return error ? null : {
    id: data.id,
    name: data.name,
    quantity: data.quantity,
    purchasePrice: data.purchase_price,
    sellPrice: data.sell_price,
    alertThreshold: data.alert_threshold,
    category: data.category,
    supplierId: data.supplier_id
  };
};

/**
 * KITA SERVICES
 */
export const getKitaServices = async (userId: string): Promise<KitaService[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_services').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(s => ({
    id: s.id,
    name: s.name,
    category: s.category,
    defaultPrice: s.default_price,
    isActive: s.is_active,
    userId: s.user_id
  }));
};

export const bulkAddKitaServices = async (userId: string, services: Omit<KitaService, 'id' | 'userId'>[]) => {
  if (!supabase || !userId) return;
  const payload = services.map(s => ({
    user_id: userId,
    name: s.name,
    category: s.category,
    default_price: s.defaultPrice,
    is_active: s.isActive
  }));
  
  // Correction RLS : On retire le .select() final car l'insertion peut être autorisée 
  // mais la lecture immédiate du résultat (select) peut être bloquée par une police RLS différente.
  const { error } = await (supabase as any).from('kita_services').insert(payload);
  if (error) {
    console.error("Bulk Insert Error:", error);
    throw error;
  }
};

export const addKitaService = async (userId: string, service: Omit<KitaService, 'id' | 'userId'>) => {
  if (!supabase || !userId) return null;
  const { data, error } = await (supabase as any).from('kita_services').insert({
    user_id: userId,
    name: service.name,
    category: service.category,
    default_price: service.defaultPrice,
    is_active: service.isActive
  }).select().single();
  
  if (error) {
    console.error("Service Add Error:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    defaultPrice: data.default_price,
    isActive: data.is_active,
    userId: data.user_id
  };
};

export const updateKitaService = async (id: string, service: Partial<KitaService>) => {
  if (!supabase) return;
  const updates: any = {};
  if (service.name !== undefined) updates.name = service.name;
  if (service.category !== undefined) updates.category = service.category;
  if (service.defaultPrice !== undefined) updates.default_price = service.defaultPrice;
  if (service.isActive !== undefined) updates.is_active = service.isActive;
  const { error } = await supabase.from('kita_services').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteKitaService = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('kita_services').delete().eq('id', id);
  if (error) throw error;
};

/**
 * KITA FOURNISSEURS
 */
export const getKitaSuppliers = async (userId: string): Promise<KitaSupplier[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_suppliers').select('*').eq('user_id', userId);
  return error ? [] : data.map(s => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    category: s.category,
    userId: s.user_id
  }));
};

export const addKitaSupplier = async (userId: string, supplier: Omit<KitaSupplier, 'id' | 'userId'>) => {
  if (!supabase || !userId) return null;
  const { data, error } = await (supabase as any).from('kita_suppliers').insert({
    user_id: userId,
    name: supplier.name,
    phone: supplier.phone,
    category: supplier.category
  }).select().single();
  return error ? null : {
    id: data.id,
    name: data.name,
    phone: data.phone,
    category: data.category,
    userId: data.user_id
  };
};

export const deleteKitaSupplier = async (id: string) => {
  if (supabase) await supabase.from('kita_suppliers').delete().eq('id', id);
};

/**
 * KITA STAFF & CLIENTS
 */
export const getKitaStaff = async (userId: string): Promise<any[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
  return error ? [] : data;
};

export const addKitaStaff = async (userId: string, staff: { name: string, commission_rate: number, specialty: string }) => {
  if (!supabase || !userId) return null;
  const { data, error } = await (supabase as any).from('kita_staff').insert({
    user_id: userId,
    name: staff.name,
    commission_rate: staff.commission_rate,
    specialty: staff.specialty
  }).select().single();
  return error ? null : data;
};

export const deleteKitaStaff = async (id: string) => {
  if (supabase) await supabase.from('kita_staff').delete().eq('id', id);
};

export const getKitaClients = async (userId: string): Promise<any[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_clients').select('*').eq('user_id', userId);
  return error ? [] : data;
};

export const addKitaClient = async (userId: string, client: { name: string, phone: string }) => {
  if (!supabase || !userId) return null;
  const { data, error } = await (supabase as any).from('kita_clients').insert({
    user_id: userId,
    name: client.name,
    phone: client.phone,
    total_spent: 0,
    total_visits: 0
  }).select().single();
  return error ? null : data;
};

export const getPublicProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase || !uid) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', uid)
      .eq('isPublic', true)
      .maybeSingle();
    
    if (error) throw error;
    return mapProfileFromDB(data);
  } catch (err) {
    return null;
  }
};

export const getReferrals = async (uid: string): Promise<UserProfile[]> => {
  if (!supabase || !uid) return [];
  const { data, error } = await supabase.from('profiles').select('*').eq('referredBy', uid);
  return error ? [] : data.map(mapProfileFromDB) as UserProfile[];
};

export const grantModuleAccess = async (uid: string, moduleId: string) => {
  if (!uid) return;
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const updatedIds = [...new Set([...(profile.purchasedModuleIds || []), moduleId])];
  await updateUserProfile(uid, { purchasedModuleIds: updatedIds, isActive: true });
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  if (!supabase || !userId) throw new Error("ID Invalide");
  const fileName = `${userId}_${Date.now()}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return publicUrl;
};
