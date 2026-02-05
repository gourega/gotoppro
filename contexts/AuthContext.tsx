import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, getUserProfile, getProfileByPhone } from '../services/supabase';
import { UserProfile } from '../types';
import { 
  COACH_KITA_AVATAR, 
  SUPER_ADMIN_PHONE_NUMBER, 
  TRAINING_CATALOG, 
  COACH_KITA_BIO, 
  COACH_KITA_ESTABLISHMENT,
  COACH_KITA_OPENING_YEAR,
  COACH_KITA_EMPLOYEES,
  BADGES
} from '../constants';

const FALLBACK_ADMIN = "teletechnologyci@gmail.com";
// @ts-ignore
const MASTER_ADMIN_EMAIL = (typeof __KITA_ADMIN__ !== 'undefined' && __KITA_ADMIN__ 
// @ts-ignore
  ? __KITA_ADMIN__ 
  : FALLBACK_ADMIN).toLowerCase().trim();

// On utilise un UUID "zéro" qui est syntaxiquement correct pour la base de données
const MASTER_ADMIN_UUID = "00000000-0000-0000-0000-000000000000";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  loginManually: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminManually: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
  loginManually: async (_p: string, _c: string) => ({ success: false, error: "Initialisation..." }),
  loginAdminManually: () => {},
  logout: async () => {}
});

/* Fix: Import React to provide namespace access for FC and ReactNode */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getMasterAdminProfile = (uid: string = MASTER_ADMIN_UUID): UserProfile => ({
    uid,
    phoneNumber: SUPER_ADMIN_PHONE_NUMBER,
    pinCode: '0000',
    email: MASTER_ADMIN_EMAIL,
    firstName: 'Coach',
    lastName: 'Kita',
    establishmentName: COACH_KITA_ESTABLISHMENT,
    openingYear: COACH_KITA_OPENING_YEAR,
    employeeCount: COACH_KITA_EMPLOYEES,
    bio: COACH_KITA_BIO,
    role: 'SUPER_ADMIN',
    isActive: true,
    isAdmin: true,
    isPublic: true,
    isKitaPremium: true,
    hasPerformancePack: true,
    hasStockPack: true,
    marketingCredits: 999,
    badges: BADGES.map(b => b.id),
    purchasedModuleIds: TRAINING_CATALOG.map(m => m.id),
    pendingModuleIds: [],
    actionPlan: [],
    createdAt: new Date().toISOString(),
    photoURL: COACH_KITA_AVATAR
  });

  const handleUserSetup = async (authUser: any) => {
    const uid = authUser?.id;
    if (!uid) return;
    const email = (authUser.email || '').toLowerCase().trim();

    try {
      if (email === MASTER_ADMIN_EMAIL || email === FALLBACK_ADMIN) {
        setUser(getMasterAdminProfile(uid));
      } else {
        const profile = await getUserProfile(uid);
        if (profile) setUser(profile);
      }
    } catch (err) {
      console.error("Auth setup error", err);
    }
  };

  const loginAdminManually = () => {
    console.log("Go'Top Pro: Activation de la Master Key...");
    localStorage.setItem('gotop_master_bypass', 'true');
    setUser(getMasterAdminProfile());
    setLoading(false);
  };

  const loginManually = async (phone: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const profile = await getProfileByPhone(cleanPhone);
      if (!profile) return { success: false, error: "Numéro inconnu." };
      if (!profile.isActive) return { success: false, error: "Compte non activé." };
      
      if (profile.pinCode === pin) {
        setUser(profile);
        localStorage.setItem('gotop_manual_phone', cleanPhone);
        return { success: true };
      }
      return { success: false, error: "Code PIN incorrect." };
    } catch (err) {
      return { success: false, error: "Erreur technique." };
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (localStorage.getItem('gotop_master_bypass') === 'true') {
          setUser(getMasterAdminProfile());
          setLoading(false);
          return;
        }

        if (supabase) {
          const { data: { session } } = await (supabase.auth as any).getSession();
          if (session?.user) {
            await handleUserSetup(session.user);
          }
        }
      } catch (err) {
        console.error("Auth init error", err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();

    if (supabase) {
      const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) await handleUserSetup(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('gotop_manual_phone');
          localStorage.removeItem('gotop_master_bypass');
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const refreshProfile = async () => {
    if (localStorage.getItem('gotop_master_bypass') === 'true') return;
    if (user?.uid) {
      const profile = await getUserProfile(user.uid);
      if (profile) setUser(profile);
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('gotop_master_bypass');
    localStorage.removeItem('gotop_manual_phone');
    if (supabase) await (supabase.auth as any).signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile, loginManually, loginAdminManually, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);