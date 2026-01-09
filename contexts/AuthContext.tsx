
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, getUserProfile, getProfileByPhone } from '../services/supabase';
import { UserProfile } from '../types';
import { COACH_KITA_AVATAR, SUPER_ADMIN_PHONE_NUMBER, TRAINING_CATALOG } from '../constants';

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
  
  // Ref pour suivre l'UID en cours de traitement de manière synchrone
  const lastUidRef = useRef<string | null>(null);
  const isSettingUpRef = useRef<boolean>(false);

  const handleUserSetup = async (authUser: any) => {
    const uid = authUser?.id;

    // 1. Si pas d'utilisateur, on nettoie
    if (!uid) {
      if (lastUidRef.current !== null) {
        lastUidRef.current = null;
        setUser(null);
      }
      setLoading(false);
      return;
    }

    // 2. VERROU ATOMIQUE : Si on traite déjà cet UID, on sort direct
    if (isSettingUpRef.current && lastUidRef.current === uid) return;
    
    // Si l'utilisateur est déjà le même dans le state, on ne refait pas le job
    if (lastUidRef.current === uid && user !== null) {
      setLoading(false);
      return;
    }

    isSettingUpRef.current = true;
    lastUidRef.current = uid;
    
    const email = (authUser.email || '').toLowerCase().trim();

    try {
      if (email === MASTER_ADMIN_EMAIL) {
        // Log unique pour confirmer que le verrou fonctionne
        console.log("Auth: CONFIGURATION MASTER ADMIN (Unique)", uid);
        
        const profile = await getUserProfile(uid).catch(() => null);

        // Fix: Added missing 'hasStockPack' property required by UserProfile interface
        const adminProfile: UserProfile = {
          uid,
          phoneNumber: profile?.phoneNumber || SUPER_ADMIN_PHONE_NUMBER,
          email: email,
          firstName: profile?.firstName || 'Coach',
          lastName: profile?.lastName || 'Kita',
          establishmentName: profile?.establishmentName || "Go'Top Pro HQ",
          role: 'SUPER_ADMIN',
          isActive: true,
          isAdmin: true,
          isKitaPremium: true,
          hasPerformancePack: true,
          hasStockPack: true,
          badges: profile?.badges || [],
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
      console.error("Auth: Error during profile setup", err);
    } finally {
      isSettingUpRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // On s'appuie principalement sur onAuthStateChange qui gère aussi l'état initial
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (!mounted) return;
      
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          handleUserSetup(session.user);
        } else {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        lastUidRef.current = null;
        setUser(null);
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user?.uid) {
      const profile = await getUserProfile(user.uid);
      if (profile) setUser(profile);
    }
  };

  const loginManually = async (phone: string): Promise<boolean> => {
    const profile = await getProfileByPhone(phone);
    if (profile && profile.isActive) {
      lastUidRef.current = profile.uid;
      setUser(profile);
      localStorage.setItem('gotop_manual_phone', phone);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setLoading(true);
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
