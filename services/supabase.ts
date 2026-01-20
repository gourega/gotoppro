
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier, KitaService } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

const mapProfileFromDB = (data: any): UserProfile | null => {
  if (!data) return null;
  return {
    uid: data.uid,
    phoneNumber: data.phone_number || data.phoneNumber || '',
    pinCode: data.pin_code || data.pinCode || '1234',
    email: data.email,
    firstName: data.first_name || data.firstName || '',
    lastName: data.last_name || data.lastName || '',
    establishmentName: data.establishment_name || data.establishmentName || '',
    photoURL: data.photo_url || data.photoURL || '',
    bio: data.bio || '',
    employeeCount: data.employee_count || data.employeeCount || 0,
    openingYear: data.opening_year || data.openingYear || 0,
    role: data.role || 'CLIENT',
    isActive: data.is_active ?? data.isActive ?? false,
    isAdmin: data.is_admin ?? data.isAdmin ?? false,
    isPublic: data.is_public ?? data.isPublic ?? true,
    isKitaPremium: data.is_kita_premium ?? data.isKitaPremium ?? false,
    kitaPremiumUntil: data.kita_premium_until || data.kitaPremiumUntil,
    hasPerformancePack: data.has_performance_pack ?? data.hasPerformancePack ?? false,
    hasStockPack: data.has_stock_pack ?? data.hasStockPack ?? false,
    crmExpiryDate: data.crm_expiry_date || data.crmExpiryDate,
    badges: Array.isArray(data.badges) ? data.badges : [],
    purchasedModuleIds: Array.isArray(data.purchased_module_ids || data.purchasedModuleIds) ? (data.purchased_module_ids || data.purchasedModuleIds) : [],
    pendingModuleIds: Array.isArray(data.pending_module_ids || data.pendingModuleIds) ? (data.pending_module_ids || data.pendingModuleIds) : [],
    actionPlan: Array.isArray(data.action_plan || data.actionPlan) ? (data.action_plan || data.actionPlan) : [],
    referralCount: data.referral_count || data.referralCount || 0,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    progress: data.progress || {},
    attempts: data.attempts || {}
  } as UserProfile;
};

const PROFILE_MAPPING: Record<string, string> = {
  uid: 'uid',
  phoneNumber: 'phone_number',
  pinCode: 'pin_code',
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
  crmExpiryDate: 'crm_expiry_date',
  badges: 'badges',
  purchasedModuleIds: 'purchased_module_ids',
  pendingModuleIds: 'pending_module_ids',
  actionPlan: 'action_plan',
  referralCount: 'referral_count',
  createdAt: 'created_at',
  progress: 'progress',
  attempts: 'attempts'
};

const mapProfileToDB = (profile: Partial<UserProfile>) => {
  const dbData: any = {};
  Object.keys(profile).forEach(key => {
    const dbKey = PROFILE_MAPPING[key] || key;
    if ((profile as any)[key] !== undefined) {
      dbData[dbKey] = (profile as any)[key];
    }
  });
  return dbData;
};

export const getProfileByPhone = async (phoneNumber: string) => {
  if (!supabase) return null;
  const cleanSearch = phoneNumber.replace(/[^\d]/g, '').slice(-8);
  if (!cleanSearch) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('phone_number', `%${cleanSearch}`)
      .maybeSingle();
    
    if (error) {
      console.error("Supabase Query Error:", error);
      return null;
    }
    return mapProfileFromDB(data);
  } catch (err) {
    console.error("Supabase Search Exception:", err);
    return null;
  }
};

export const getUserProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
  return mapProfileFromDB(data);
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) throw new Error("Connexion Supabase non initialisée. Vérifiez vos variables d'environnement.");
  
  const dbData = mapProfileToDB(profile);
  console.log("[Supabase] Tentative de sauvegarde profil:", dbData);
  
  const { error } = await supabase
    .from('profiles')
    .upsert(dbData, { onConflict: 'uid' });
    
  if (error) {
    console.error("[Supabase] Upsert Error:", error);
    if (error.code === '42501') {
      throw new Error("ERREUR RLS : L'accès anonyme en 'INSERT/UPDATE' n'est pas autorisé sur votre table 'profiles'. Vérifiez vos politiques de sécurité Supabase.");
    }
    throw new Error(`Erreur Base de données (${error.code}) : ${error.message}`);
  }
  
  console.log("[Supabase] Profil sauvegardé avec succès.");
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!supabase || !uid) throw new Error("Identifiant manquant pour la mise à jour.");
  
  const dbData = mapProfileToDB(updates);
  console.log("[Supabase] Tentative de mise à jour profil:", dbData);
  
  const { error } = await supabase
    .from('profiles')
    .update(dbData)
    .eq('uid', uid);
    
  if (error) {
    console.error("[Supabase] Update Error:", error);
    if (error.code === '42501') {
      throw new Error("ERREUR RLS : Mise à jour interdite. Vérifiez les politiques RLS de la table 'profiles'.");
    }
    throw new Error(`Erreur Base de données (${error.code}) : ${error.message}`);
  }

  console.log("[Supabase] Profil mis à jour avec succès.");
};

export const getAllUsers = async () => {
  if (!supabase) return [];
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapProfileFromDB) as UserProfile[];
};

export const deleteUserProfile = async (uid: string) => {
  if (supabase) await supabase.from('profiles').delete().eq('uid', uid);
};

export const getKitaTransactions = async (userId: string): Promise<KitaTransaction[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
  return (data || []).map(t => ({
    id: t.id, type: t.type, amount: t.amount, label: t.label, category: t.category,
    paymentMethod: t.payment_method, date: t.date, staffName: t.staff_name,
    commissionRate: t.commission_rate, isCredit: t.is_credit, clientId: t.client_id, productId: t.product_id
  }));
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_transactions').insert({
    id: newId, user_id: userId, type: transaction.type, amount: transaction.amount,
    label: transaction.label, category: transaction.category, payment_method: transaction.paymentMethod,
    date: transaction.date, staff_name: transaction.staffName, commission_rate: transaction.commissionRate,
    is_credit: transaction.isCredit, client_id: transaction.clientId, product_id: transaction.productId
  });
  return error ? null : { ...transaction, id: newId } as KitaTransaction;
};

export const deleteKitaTransaction = async (id: string) => {
  if (supabase) await supabase.from('kita_transactions').delete().eq('id', id);
};

export const getKitaStaff = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
  return (data || []).map(s => ({
    id: s.id, name: s.name, phone: s.phone, commissionRate: s.commission_rate,
    specialty: s.specialty, isActive: s.is_active, userId: s.user_id
  }));
};

export const addKitaStaff = async (userId: string, staff: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_staff').insert({
    id: newId, user_id: userId, name: staff.name, phone: staff.phone,
    commission_rate: staff.commissionRate || staff.commission_rate, specialty: staff.specialty
  });
  return error ? null : { id: newId, ...staff, user_id: userId };
};

export const deleteKitaStaff = async (id: string) => {
  if (supabase) await supabase.from('kita_staff').delete().eq('id', id);
};

export const getKitaClients = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_clients').select('*').eq('user_id', userId);
  return (data || []).map(c => ({
    id: c.id, name: c.name, phone: c.phone, totalSpent: c.total_spent,
    totalVisits: c.total_visits, lastVisit: c.last_visit, notes: c.notes, userId: c.user_id
  }));
};

export const addKitaClient = async (userId: string, client: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_clients').insert({
    id: newId, user_id: userId, name: client.name, phone: client.phone
  });
  return error ? null : { id: newId, ...client, user_id: userId };
};

export const updateKitaClient = async (id: string, updates: any) => {
  if (!supabase) return;
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  await supabase.from('profiles').update(dbUpdates).eq('id', id);
};

export const getKitaServices = async (userId: string): Promise<KitaService[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_services').select('*').eq('user_id', userId);
  return (data || []).map(s => ({
    id: s.id, name: s.name, category: s.category, defaultPrice: s.default_price,
    isActive: s.is_active, userId: s.user_id
  }));
};

export const addKitaService = async (userId: string, service: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_services').insert({
    id: newId, user_id: userId, name: service.name, category: service.category,
    default_price: service.defaultPrice || service.default_price, is_active: true
  });
  return error ? null : { id: newId, ...service, user_id: userId };
};

export const bulkAddKitaServices = async (userId: string, services: any[]) => {
  if (!supabase || !userId) return;
  const payload = services.map(s => ({
    id: generateUUID(), user_id: userId, name: s.name, category: s.category,
    default_price: s.defaultPrice || 0, is_active: true
  }));
  await supabase.from('kita_services').insert(payload);
};

export const updateKitaService = async (id: string, updates: any) => {
  if (!supabase) return;
  const dbUpdates: any = {};
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  if (updates.defaultPrice !== undefined) dbUpdates.default_price = updates.defaultPrice;
  await supabase.from('kita_services').update(dbUpdates).eq('id', id);
};

export const deleteKitaService = async (id: string) => {
  if (supabase) await supabase.from('kita_services').delete().eq('id', id);
};

export const getKitaProducts = async (userId: string): Promise<KitaProduct[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_products').select('*').eq('user_id', userId);
  return (data || []).map(p => ({
    id: p.id, name: p.name, quantity: p.quantity, purchasePrice: p.purchase_price,
    sellPrice: p.sell_price, alertThreshold: p.alert_threshold, category: p.category, supplierId: p.supplier_id
  }));
};

export const addKitaProduct = async (userId: string, p: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_products').insert({
    id: newId, user_id: userId, name: p.name, quantity: p.quantity,
    purchase_price: p.purchasePrice, sell_price: p.sellPrice,
    alert_threshold: p.alertThreshold, category: p.category, supplier_id: p.supplierId
  });
  return error ? null : { id: newId, ...p };
};

export const getKitaSuppliers = async (userId: string): Promise<KitaSupplier[]> => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_suppliers').select('*').eq('user_id', userId);
  return (data || []).map(s => ({ id: s.id, name: s.name, phone: s.phone, category: s.category, userId: s.user_id }));
};

export const addKitaSupplier = async (userId: string, s: any) => {
  if (!supabase || !userId) return null;
  const newId = generateUUID();
  const { error } = await supabase.from('kita_suppliers').insert({ id: newId, user_id: userId, name: s.name, phone: s.phone, category: s.category });
  return error ? null : { id: newId, ...s, userId };
};

export const deleteKitaSupplier = async (id: string) => {
  if (supabase) await supabase.from('kita_suppliers').delete().eq('id', id);
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  if (!supabase || !userId) throw new Error("ID Invalide");
  const fileName = `${userId}_${Date.now()}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return publicUrl;
};

export const getReferrals = async (uid: string) => {
  if (!supabase || !uid) return [];
  const { data } = await supabase.from('profiles').select('*').eq('referred_by', uid);
  return (data || []).map(mapProfileFromDB) as UserProfile[];
};

export const getPublicProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('uid', uid).eq('is_public', true).maybeSingle();
  return mapProfileFromDB(data);
};
