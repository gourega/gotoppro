
import { createClient } from '@supabase/supabase-js';
import { UserProfile, KitaTransaction, KitaDebt, KitaProduct, KitaSupplier, KitaService, UserRole } from '../types';

/**
 * Robust polyfill for process.env in browser environments.
 */
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}
if (typeof (window as any).process.env === 'undefined') {
  (window as any).process.env = {};
}

// @ts-ignore
const definedUrl = typeof __KITA_URL__ !== 'undefined' ? __KITA_URL__ : "";
// @ts-ignore
const definedKey = typeof __KITA_KEY__ !== 'undefined' ? __KITA_KEY__ : "";
// @ts-ignore
const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toLocaleString();

const getSafeEnv = (key: string): string => {
  if (key === 'VITE_SUPABASE_URL' && definedUrl) return definedUrl;
  if (key === 'VITE_SUPABASE_ANON_KEY' && definedKey) return definedKey;
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {}
  return "";
};

const supabaseUrl = getSafeEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getSafeEnv('VITE_SUPABASE_ANON_KEY');

export const BUILD_CONFIG = {
  hasUrl: !!supabaseUrl && supabaseUrl.length > 5,
  hasKey: !!supabaseAnonKey && supabaseAnonKey.length > 20,
  urlSnippet: supabaseUrl ? (supabaseUrl.substring(0, 12) + '...') : 'MANQUANT',
  keySnippet: supabaseAnonKey ? (supabaseAnonKey.substring(0, 8) + '***') : 'MANQUANT',
  buildTime,
  version: "2.9.3-PARTNER-CORE"
};

const getSafeSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (e) {
    console.error("Supabase Initialization Error:", e);
    return null;
  }
};

export const supabase = getSafeSupabaseClient();

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

/**
 * Double Écriture pour support SnakeCase/CamelCase
 */
const mapProfileToDB = (profile: Partial<UserProfile>): any => {
  const db: any = {};
  if (profile.uid !== undefined) db.uid = profile.uid;
  if (profile.phoneNumber !== undefined) { db.phoneNumber = profile.phoneNumber; db.phone_number = profile.phoneNumber; }
  if (profile.pinCode !== undefined) { db.pinCode = profile.pinCode; db.phone_code = profile.pinCode; }
  if (profile.email !== undefined) db.email = profile.email;
  if (profile.firstName !== undefined) { db.firstName = profile.firstName; db.first_name = profile.firstName; }
  if (profile.lastName !== undefined) { db.lastName = profile.lastName; db.last_name = profile.lastName; }
  if (profile.establishmentName !== undefined) { db.establishmentName = profile.establishmentName; db.establishment_name = profile.establishmentName; }
  if (profile.photoURL !== undefined) { db.photoURL = profile.photoURL; db.photo_url = profile.photoURL; }
  if (profile.bio !== undefined) db.bio = profile.bio;
  if (profile.adminNotes !== undefined) { db.adminNotes = profile.adminNotes; db.admin_notes = profile.adminNotes; }
  if (profile.role !== undefined) db.role = profile.role;
  if (profile.isActive !== undefined) { db.isActive = profile.isActive; db.is_active = profile.isActive; }
  if (profile.isAdmin !== undefined) { db.isAdmin = profile.isAdmin; db.is_admin = profile.isAdmin; }
  if (profile.isPublic !== undefined) { db.isPublic = profile.isPublic; db.is_public = profile.isPublic; }
  if (profile.isKitaPremium !== undefined) { db.isKitaPremium = profile.isKitaPremium; db.is_kita_premium = profile.isKitaPremium; }
  if (profile.referredBy !== undefined) { db.referredBy = profile.referredBy; db.referred_by = profile.referredBy; }
  if (profile.marketingCredits !== undefined) { db.marketingCredits = profile.marketingCredits; db.marketing_credits = profile.marketingCredits; }
  if (profile.createdAt !== undefined) { db.createdAt = profile.createdAt; db.created_at = profile.createdAt; }
  return db;
};

const mapProfileFromDB = (data: any): UserProfile | null => {
  if (!data) return null;
  return {
    uid: data.uid || data.id,
    phoneNumber: data.phoneNumber || data.phone_number || '',
    pinCode: data.pinCode || data.phone_code || '1234',
    email: data.email,
    firstName: data.firstName || data.first_name || '',
    lastName: data.lastName || data.last_name || '',
    establishmentName: data.establishmentName || data.establishment_name || '',
    photoURL: data.photoURL || data.photo_url || '',
    bio: data.bio || '',
    adminNotes: data.adminNotes || data.admin_notes || '',
    employeeCount: data.employeeCount || data.employee_count || 0,
    openingYear: data.openingYear || data.opening_year || 0,
    role: (data.role || 'CLIENT') as UserRole,
    isActive: data.isActive ?? data.is_active ?? false,
    isAdmin: data.isAdmin ?? data.is_admin ?? false,
    isPublic: data.isPublic ?? data.is_public ?? true,
    isKitaPremium: data.isKitaPremium ?? data.is_kita_premium ?? false,
    marketingCredits: data.marketingCredits ?? data.marketing_credits ?? 3,
    gmbStatus: data.gmbStatus || data.gmb_status || 'NONE',
    gmbUrl: data.gmbUrl || data.gmb_url || '',
    badges: Array.isArray(data.badges) ? data.badges : [],
    purchasedModuleIds: Array.isArray(data.purchasedModuleIds || data.purchased_module_ids) ? (data.purchasedModuleIds || data.purchased_module_ids) : [],
    pendingModuleIds: Array.isArray(data.pendingModuleIds || data.pending_module_ids) ? (data.pendingModuleIds || data.pending_module_ids) : [],
    actionPlan: Array.isArray(data.actionPlan || data.action_plan) ? (data.actionPlan || data.action_plan) : [],
    referredBy: data.referredBy || data.referred_by || '',
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    progress: data.progress || {},
    attempts: data.attempts || {}
  } as UserProfile;
};

/**
 * RECHERCHE GLOBALE (Login) : Cherche dans profiles OU partners
 */
export const getProfileByPhone = async (phoneNumber: string) => {
  if (!supabase) return null;
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);
  if (!last10) return null;

  try {
    // 1. Chercher dans les profils gérants
    const { data: profile } = await supabase.from('profiles').select('*').or(`phoneNumber.eq.${digitsOnly},phone_number.eq.${digitsOnly}`).maybeSingle();
    if (profile) return mapProfileFromDB(profile);

    // 2. Chercher dans la table dédiée partenaires
    const { data: partner } = await supabase.from('partners').select('*').or(`phoneNumber.eq.${digitsOnly},phone_number.eq.${digitsOnly}`).maybeSingle();
    if (partner) {
      const mapped = mapProfileFromDB(partner);
      if (mapped) mapped.role = 'PARTNER'; // Forcer le rôle partenaire
      return mapped;
    }

    return null;
  } catch (err) { return null; }
};

export const getUserProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
    if (profile) return mapProfileFromDB(profile);
    
    const { data: partner } = await supabase.from('partners').select('*').eq('uid', uid).maybeSingle();
    if (partner) {
      const mapped = mapProfileFromDB(partner);
      if (mapped) mapped.role = 'PARTNER';
      return mapped;
    }
    return null;
  } catch (e) { return null; }
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  if (!supabase) return { success: true };
  const table = profile.role === 'PARTNER' ? 'partners' : 'profiles';
  try {
    const dbData = mapProfileToDB(profile);
    const { error } = await supabase.from(table).upsert(dbData, { onConflict: 'uid' });
    if (error) throw error;
    return { success: true };
  } catch (err) { throw err; }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!supabase || !uid) return;
  const table = updates.role === 'PARTNER' ? 'partners' : 'profiles';
  try {
    const dbData = mapProfileToDB(updates);
    const { error } = await supabase.from(table).update(dbData).eq('uid', uid);
    if (error && table === 'profiles') {
        // Essai croisé si on ne sait pas où est l'utilisateur
        await supabase.from('partners').update(dbData).eq('uid', uid);
    }
  } catch (err) {}
};

export const getAllUsers = async () => {
  if (!supabase) return [];
  try {
    const { data: p } = await supabase.from('profiles').select('*');
    const { data: part } = await supabase.from('partners').select('*');
    const profiles = (p || []).map(mapProfileFromDB);
    const partners = (part || []).map(d => {
      const m = mapProfileFromDB(d);
      if (m) m.role = 'PARTNER';
      return m;
    });
    return [...profiles, ...partners].filter(Boolean) as UserProfile[];
  } catch (e) { return []; }
};

export const getReferrals = async (userId: string) => {
  if (!supabase) return [];
  try {
    const user = await getUserProfile(userId);
    if (!user) return [];
    const phone = user.phoneNumber;
    const { data, error } = await supabase.from('profiles').select('*').eq('referredBy', phone);
    if (error) {
        const { data: fallback } = await supabase.from('profiles').select('*').eq('referred_by', phone);
        return (fallback || []).map(mapProfileFromDB);
    }
    return (data || []).map(mapProfileFromDB) as UserProfile[];
  } catch (e) { return []; }
};

// Fonctions Caisse & Services (Toujours liées à 'profiles' car les partenaires n'ont pas de caisse salon)
export const getKitaTransactions = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
  return (data || []).map(t => ({
    id: t.id, type: t.type, amount: t.amount, label: t.label, category: t.category,
    paymentMethod: t.payment_method, date: t.date, staffName: t.staff_name,
    commission_rate: t.commission_rate, tipAmount: t.tip_amount || 0,
    isCredit: t.is_credit, clientId: t.client_id, productId: t.product_id,
    discount: t.discount || 0, originalAmount: t.original_amount || t.amount
  }));
};

export const addKitaTransaction = async (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  if (!supabase || !userId) throw new Error("Base de données déconnectée.");
  const newId = generateUUID();
  const { error } = await supabase.from('kita_transactions').insert({
    id: newId, user_id: userId, type: transaction.type, amount: transaction.amount,
    label: transaction.label, category: transaction.category, payment_method: transaction.paymentMethod,
    date: transaction.date, staff_name: transaction.staffName, commission_rate: transaction.commission_rate,
    tip_amount: transaction.tipAmount || 0, is_credit: transaction.isCredit,
    client_id: transaction.clientId, product_id: transaction.productId,
    original_amount: transaction.originalAmount || transaction.amount, discount: transaction.discount || 0
  });
  if (error) throw error;
  return { ...transaction, id: newId } as KitaTransaction;
};

export const deleteKitaTransaction = async (id: string) => {
  if (supabase) await supabase.from('kita_transactions').delete().eq('id', id);
};

export const uploadProfilePhoto = async (file: File, userId: string) => {
  if (!supabase) return "";
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  const { error: uploadError } = await supabase.storage.from('kita').upload(filePath, file);
  if (uploadError) return "";
  const { data: { publicUrl } } = supabase.storage.from('kita').getPublicUrl(filePath);
  return publicUrl;
};

export const getKitaServices = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_services').select('*').eq('user_id', userId);
  return (data || []).map(s => ({
    id: s.id, name: s.name, category: s.category, defaultPrice: s.default_price, isActive: s.is_active, userId: s.user_id
  }));
};

export const addKitaService = async (userId: string, service: Omit<KitaService, 'id' | 'isActive' | 'userId'>) => {
  const newId = generateUUID();
  const { error } = await supabase.from('kita_services').insert({
    id: newId, user_id: userId, name: service.name, category: service.category, default_price: service.defaultPrice, is_active: true
  });
  if (error) throw error;
  return { ...service, id: newId, isActive: true, userId } as KitaService;
};

export const deleteKitaService = async (id: string) => {
  if (supabase) await supabase.from('kita_services').delete().eq('id', id);
};

export const getKitaStaff = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_staff').select('*').eq('user_id', userId);
  return data || [];
};

export const addKitaStaff = async (userId: string, staff: any) => {
  const { data, error } = await supabase.from('kita_staff').insert({
    id: generateUUID(), user_id: userId, name: staff.name, phone: staff.phone || "", 
    commission_rate: Math.round(Number(staff.commission_rate || 0)), specialty: staff.specialty || "Coiffure"
  }).select().single();
  if (error) throw error;
  return data;
};

export const updateKitaStaff = async (id: string, updates: any) => {
  const { data } = await supabase.from('kita_staff').update(updates).eq('id', id).select().single();
  return data;
};

export const getKitaClients = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_clients').select('*').eq('user_id', userId);
  return data || [];
};

export const addKitaClient = async (userId: string, client: any) => {
  const { error } = await supabase.from('kita_clients').insert({
    id: generateUUID(), user_id: userId, name: client.name, phone: client.phone, notes: client.notes
  });
  if (error) throw error;
  return client;
};

export const getKitaProducts = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_products').select('*').eq('user_id', userId);
  return (data || []).map(p => ({
    id: p.id, name: p.name, quantity: p.quantity, purchasePrice: p.purchase_price,
    sellPrice: p.sell_price, alertThreshold: p.alert_threshold, category: p.category, supplier_id: p.supplier_id
  }));
};

export const addKitaProduct = async (userId: string, product: Omit<KitaProduct, 'id'>) => {
  const newId = generateUUID();
  const { error } = await supabase.from('kita_products').insert({
    id: newId, user_id: userId, name: product.name, quantity: product.quantity,
    purchase_price: product.purchasePrice, sell_price: product.sellPrice,
    alert_threshold: product.alertThreshold, category: product.category, supplier_id: product.supplierId
  });
  if (error) throw error;
  return { ...product, id: newId } as KitaProduct;
};

export const getKitaSuppliers = async (userId: string) => {
  if (!supabase || !userId) return [];
  const { data } = await supabase.from('kita_suppliers').select('*').eq('user_id', userId);
  return (data || []).map(s => ({
    id: s.id, name: s.name, phone: s.phone, category: s.category, userId: s.user_id
  }));
};

export const addKitaSupplier = async (userId: string, supplier: Omit<KitaSupplier, 'id' | 'userId'>) => {
  const newId = generateUUID();
  const { error } = await supabase.from('kita_suppliers').insert({
    id: newId, user_id: userId, name: supplier.name, phone: supplier.phone, category: supplier.category
  });
  if (error) throw error;
  return { ...supplier, id: newId, userId } as KitaSupplier;
};

export const deleteKitaSupplier = async (id: string) => {
  if (supabase) await supabase.from('kita_suppliers').delete().eq('id', id);
};

export const getPublicProfile = async (uid: string) => {
  if (!supabase || !uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('uid', uid).eq('isPublic', true).maybeSingle();
  return mapProfileFromDB(data);
};

/**
 * Fix: Added missing getPublicDirectory export.
 * Retourne tous les profils publics pour l'annuaire de l'excellence.
 */
export const getPublicDirectory = async () => {
  if (!supabase) return [];
  try {
    const { data } = await supabase.from('profiles').select('*').eq('isPublic', true);
    return (data || []).map(mapProfileFromDB).filter(Boolean) as UserProfile[];
  } catch (e) { return []; }
};
