
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

const MASTER_ADMIN_EMAIL = (process.env.VITE_ADMIN_EMAIL && process.env.VITE_ADMIN_EMAIL.trim() !== "" 
  ? process.env.VITE_ADMIN_EMAIL 
  : "teletechnologyci@gmail.com").toLowerCase().trim();

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  loginManually: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
  loginManually: async (_p: string, _c: string) => ({ success: false, error: "Initialisation..." }),
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const lastUidRef = useRef<string | null>(null);
  const isSettingUpRef = useRef<boolean>(false);

  const handleUserSetup = async (authUser: any) => {
    const uid = authUser?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    if (isSettingUpRef.current && lastUidRef.current === uid) return;
    isSettingUpRef.current = true;
    lastUidRef.current = uid;
    const email = (authUser.email || '').toLowerCase().trim();

    try {
      if (email === MASTER_ADMIN_EMAIL) {
        const profile = await getUserProfile(uid).catch(() => null);
        const adminProfile: UserProfile = {
          uid,
          phoneNumber: profile?.phoneNumber || SUPER_ADMIN_PHONE_NUMBER,
          pinCode: profile?.pinCode || '0000',
          email: email,
          firstName: 'Coach',
          lastName: 'Kita',
          establishmentName: COACH_KITA_ESTABLISHMENT,
          openingYear: COACH_KITA_OPENING_YEAR,
          employeeCount: COACH_KITA_EMPLOYEES,
          bio: COACH_KITA_BIO,
          role: 'SUPER_ADMIN',
          isActive: true,
          isAdmin: true,
          isPublic: profile?.isPublic ?? true,
          isKitaPremium: true,
          hasPerformancePack: true,
          hasStockPack: true,
          badges: BADGES.map(b => b.id),
          purchasedModuleIds: TRAINING_CATALOG.map(m => m.id),
          pendingModuleIds: [],
          actionPlan: profile?.actionPlan || [],
          createdAt: profile?.createdAt || new Date().toISOString(),
          photoURL: profile?.photoURL || COACH_KITA_AVATAR
        };
        setUser(adminProfile);
      } else {
        const profile = await getUserProfile(uid);
        if (profile) setUser(profile);
      }
    } catch (err) {
      console.error("Auth: Profile setup error", err);
    } finally {
      isSettingUpRef.current = false;
      setLoading(false);
    }
  };

  const loginManually = async (phone: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // NETTOYAGE PRÉVENTIF : On retire tout ce qui n'est pas chiffre ou "+"
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      
      const profile = await getProfileByPhone(cleanPhone);
      if (!profile) return { success: false, error: "Numéro de téléphone inconnu dans notre base." };
      
      if (!profile.isActive) {
        return { success: false, error: "Votre compte est en attente d'activation par Coach Kita." };
      }
      
      if (profile.pinCode === pin) {
        lastUidRef.current = profile.uid;
        setUser(profile);
        localStorage.setItem('gotop_manual_phone', cleanPhone);
        return { success: true };
      } else {
        return { success: false, error: "Code PIN incorrect. Veuillez réessayer." };
      }
    } catch (err) {
      console.error("Manual login failed", err);
      return { success: false, error: "Erreur technique de connexion." };
    }
  };

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        if (supabase) {
          // Cast auth to any to handle environments with outdated or incomplete Supabase type definitions
          const { data: { session } } = await (supabase.auth as any).getSession();
          if (session?.user) await handleUserSetup(session.user);
        }
      } catch (err) {
        console.error("Auth init error", err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();

    if (supabase) {
      // Cast auth to any to handle environments with outdated or incomplete Supabase type definitions
      const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) handleUserSetup(session.user);
        } else if (event === 'SIGNED_OUT') {
          lastUidRef.current = null;
          setUser(null);
          localStorage.removeItem('gotop_manual_phone');
          setLoading(false);
        }
      });
      authSubscription = subscription;
    }
    
    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user?.uid) {
      const profile = await getUserProfile(user.uid);
      if (profile) setUser(profile);
    }
  };

  const logout = async () => {
    setLoading(true);
    // Cast auth to any to handle environments with outdated or incomplete Supabase type definitions
    if (supabase) await (supabase.auth as any).signOut();
    lastUidRef.current = null;
    localStorage.removeItem('gotop_manual_phone');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile, loginManually, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
