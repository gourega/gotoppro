
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
 * MAPPING PROFILES (DB <=> APP)
 */
const mapProfileFromDB = (data: any): UserProfile | null => {
  if (!data) return null;
  return {
    uid: data.uid,
    phoneNumber: data.phoneNumber || data.phone_number || '',
    pinCode: data.pinCode || data.pin_code || '1234',
    email: data.email,
    firstName: data.firstName || data.first_name || '',
    lastName: data.lastName || data.last_name || '',
    establishmentName: data.establishmentName || data.establishment_name || '',
    photoURL: data.photoURL || data.photo_url || '',
    bio: data.bio || '',
    employeeCount: data.employeeCount || data.employee_count || 0,
    openingYear: data.openingYear || data.opening_year || 0,
    role: data.role || 'CLIENT',
    isActive: data.isActive ?? data.is_active ?? false,
    isAdmin: data.isAdmin ?? data.is_admin ?? false,
    isPublic: data.isPublic ?? data.is_public ?? true,
    isKitaPremium: data.isKitaPremium ?? data.is_kita_premium ?? false,
    kitaPremiumUntil: data.kitaPremiumUntil || data.kita_premium_until,
    hasPerformancePack: data.hasPerformancePack ?? data.has_performance_pack ?? false,
    hasStockPack: data.hasStockPack ?? data.has_stock_pack ?? false,
    badges: Array.isArray(data.badges) ? data.badges : [],
    purchasedModuleIds: Array.isArray(data.purchasedModuleIds || data.purchased_module_ids) ? (data.purchasedModuleIds || data.purchased_module_ids) : [],
    pendingModuleIds: Array.isArray(data.pendingModuleIds || data.pending_module_ids) ? (data.pendingModuleIds || data.pending_module_ids) : [],
    actionPlan: Array.isArray(data.actionPlan || data.action_plan) ? (data.actionPlan || data.action_plan) : [],
    referralCount: data.referralCount || data.referral_count || 0,
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    progress: data.progress || {},
    attempts: data.attempts || {}
  } as UserProfile;
};

const mapProfileToDB = (profile: Partial<UserProfile>) => {
  const dbData: any = {};
  const mapping: any = {
    uid: 'uid',
    phoneNumber: 'phone_number',
    pinCode: 'pin_code',
    email: 'email',
    firstName: 'first_name',
    lastName: 'last_name',
    establishmentName: 'establishment_name',
    photoURL: 'photo_url',
    bio: 'bio',
    employeeCount: 'employee_count',
    openingYear: 'opening_year',
    role: 'role',
    isActive: 'is_active',
    isAdmin: 'is_admin',
    isPublic: 'is_public',
    isKitaPremium: 'is_kita_premium',
    kitaPremiumUntil: 'kita_premium_until',
    hasPerformancePack: 'has_performance_pack',
    hasStockPack: 'has_stock_pack',
    badges: 'badges',
    purchasedModuleIds: 'purchased_module_ids',
    pendingModuleIds: 'pending_module_ids',
    actionPlan: 'action_plan',
    referralCount: 'referral_count',
    createdAt: 'created_at',
    progress: 'progress',
    attempts: 'attempts'
  };

  Object.keys(profile).forEach(key => {
    const dbKey = mapping[key] || key;
    if ((profile as any)[key] !== undefined) {
      dbData[dbKey] = (profile as any)[key];
    }
  });
  return dbData;
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
    console.error("Fetch Profile Error:", err);
    return null;
  }
};

export const getProfileByPhone = async (phoneNumber: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').or(`phoneNumber.eq.${phoneNumber},phone_number.eq.${phoneNumber}`).maybeSingle();
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
    console.error("Supabase Upsert Error:", error);
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
 * KITA TRANSACTIONS
 */
export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
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
    isCredit: t.is_credit,
    clientId: t.client_id,
    productId: t.product_id
  }));
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await (supabase as any).from('kita_transactions').insert({
    id: newId,
    user_id: userId,
    type: transaction.type,
    amount: transaction.amount,
    label: transaction.label,
    category: transaction.category,
    payment_method: transaction.paymentMethod,
    date: transaction.date,
    staff_name: transaction.staffName,
    commission_rate: transaction.commissionRate,
    is_credit: transaction.isCredit || false,
    client_id: transaction.clientId,
    product_id: transaction.productId
  });
  
  if (error) {
    console.error("Transaction Insert Error:", error);
    return null;
  }
  return { ...transaction, id: newId } as KitaTransaction;
};

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

/**
 * KITA STOCK (MAGASIN)
 */
export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_products').select('*').eq('user_id', userId);
  return error ? [] : data.map(p => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    purchasePrice: Number(p.purchase_price),
    sellPrice: Number(p.sell_price),
    alertThreshold: p.alert_threshold,
    category: p.category,
    supplierId: p.supplier_id
  }));
};

export const addKitaProduct = async (userId: string, product: Omit<KitaProduct, 'id'>) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await (supabase as any).from('kita_products').insert({
    id: newId,
    user_id: userId,
    name: product.name,
    quantity: product.quantity,
    purchase_price: product.purchasePrice,
    sell_price: product.sellPrice,
    alert_threshold: product.alertThreshold,
    category: product.category,
    supplier_id: product.supplierId
  });
  
  if (error) {
    console.error("Product Insert Error:", error);
    throw error;
  }
  
  return { ...product, id: newId } as KitaProduct;
};

/**
 * KITA SERVICES
 */
export const getKitaServices = async (userId: string): Promise<KitaService[]> => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase.from('kita_services').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      defaultPrice: Number(s.default_price),
      isActive: s.is_active,
      userId: s.user_id
    }));
  } catch (err) {
    return [];
  }
};

export const bulkAddKitaServices = async (userId: string, services: Omit<KitaService, 'id' | 'userId'>[]) => {
  if (!supabase || !userId) return;
  const payload = services.map(s => ({
    id: generateUUID(),
    user_id: userId,
    name: s.name,
    category: s.category,
    default_price: s.defaultPrice || 0,
    is_active: s.isActive ?? true
  }));
  
  const { error } = await (supabase as any).from('kita_services').insert(payload);
  if (error) {
    console.error("Bulk Insert Error:", error);
    throw error;
  }
};

export const addKitaService = async (userId: string, service: Omit<KitaService, 'id' | 'userId'>) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await (supabase as any).from('kita_services').insert({
    id: newId,
    user_id: userId,
    name: service.name,
    category: service.category,
    default_price: service.defaultPrice,
    is_active: service.isActive
  });
  
  if (error) {
    console.error("Service Insert Error:", error);
    throw error;
  }
  
  return { ...service, id: newId, userId } as KitaService;
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
 * KITA FOURNISSEURS (MAGASIN)
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
  const newId = generateUUID();
  const { error } = await (supabase as any).from('kita_suppliers').insert({
    id: newId,
    user_id: userId,
    name: supplier.name,
    phone: supplier.phone,
    category: supplier.category
  });
  return error ? null : { ...supplier, id: newId, userId };
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
  return error ? [] : data.map(s => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    commissionRate: s.commission_rate,
    specialty: s.specialty,
    isActive: s.is_active,
    userId: s.user_id
  }));
};

export const addKitaStaff = async (userId: string, staff: { name: string, commission_rate: number, specialty: string }) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await (supabase as any).from('kita_staff').insert({
    id: newId,
    user_id: userId,
    name: staff.name,
    commission_rate: staff.commission_rate,
    specialty: staff.specialty,
    is_active: true
  });
  return error ? null : { id: newId, ...staff, user_id: userId, isActive: true };
};

export const deleteKitaStaff = async (id: string) => {
  if (supabase) await supabase.from('kita_staff').delete().eq('id', id);
};

export const getKitaClients = async (userId: string): Promise<any[]> => {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('kita_clients').select('*').eq('user_id', userId);
  return error ? [] : data.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    totalSpent: Number(c.total_spent || 0),
    totalVisits: Number(c.total_visits || 0),
    lastVisit: c.last_visit,
    notes: c.notes,
    userId: c.user_id
  }));
};

export const addKitaClient = async (userId: string, client: { name: string, phone: string }) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await (supabase as any).from('kita_clients').insert({
    id: newId,
    user_id: userId,
    name: client.name,
    phone: client.phone,
    total_spent: 0,
    total_visits: 0
  });
  return error ? null : { id: newId, ...client, user_id: userId, totalSpent: 0, totalVisits: 0 };
};

export const getPublicProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!supabase || !uid) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', uid)
      .eq('is_public', true)
      .maybeSingle();
    
    if (error) throw error;
    return mapProfileFromDB(data);
  } catch (err) {
    return null;
  }
};

export const getReferrals = async (uid: string): Promise<UserProfile[]> => {
  if (!supabase || !uid) return [];
  const { data, error } = await supabase.from('profiles').select('*').eq('referred_by', uid);
  return error ? [] : data.map(mapProfileFromDB) as UserProfile[];
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  if (!supabase || !userId) throw new Error("ID Invalide");
  const fileName = `${userId}_${Date.now()}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return publicUrl;
};
