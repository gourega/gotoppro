
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
  loginManually: (phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
  loginManually: async () => false,
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
    if (lastUidRef.current === uid && user !== null) {
      setLoading(false);
      return;
    }

    isSettingUpRef.current = true;
    lastUidRef.current = uid;
    const email = (authUser.email || '').toLowerCase().trim();

    try {
      if (email === MASTER_ADMIN_EMAIL) {
        const profile = await getUserProfile(uid).catch(() => null);
        const adminProfile: UserProfile = {
          uid,
          phoneNumber: profile?.phoneNumber || SUPER_ADMIN_PHONE_NUMBER,
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
          // Attribuer tous les badges au Super Admin
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
        if (profile) {
          setUser(profile);
          localStorage.removeItem('gotop_manual_phone');
        }
      }
    } catch (err) {
      console.error("Auth: Profile setup error", err);
    } finally {
      isSettingUpRef.current = false;
      setLoading(false);
    }
  };

  const loginManually = async (phone: string): Promise<boolean> => {
    try {
      const profile = await getProfileByPhone(phone);
      if (profile && profile.isActive) {
        lastUidRef.current = profile.uid;
        setUser(profile);
        localStorage.setItem('gotop_manual_phone', phone);
        return true;
      }
    } catch (err) {
      console.error("Manual login failed", err);
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        const savedPhone = localStorage.getItem('gotop_manual_phone');
        if (savedPhone) {
          const success = await loginManually(savedPhone);
          if (success) {
            if (mounted) setLoading(false);
            return;
          }
        }
        
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await handleUserSetup(session.user);
          }
        }
      } catch (err) {
        console.error("Auth init error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    initAuth();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        if (!mounted) return;
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
      mounted = false;
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
    if (supabase) await supabase.auth.signOut();
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
