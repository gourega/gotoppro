
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile, getProfileByPhone } from '../services/supabase';
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

  const handleUserSetup = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const uid = authUser.id;
    const email = (authUser.email || '').toLowerCase().trim();
    
    if (email === MASTER_ADMIN_EMAIL) {
      console.log("Auth: ACCÈS MAÎTRE DÉTECTÉ");
      
      const adminProfile: UserProfile = {
        uid,
        phoneNumber: SUPER_ADMIN_PHONE_NUMBER,
        email: email,
        firstName: 'Coach',
        lastName: 'Kita',
        role: 'SUPER_ADMIN',
        isActive: true,
        isAdmin: true,
        isKitaPremium: true,
        hasPerformancePack: true,
        badges: [],
        purchasedModuleIds: TRAINING_CATALOG.map(m => m.id),
        pendingModuleIds: [],
        actionPlan: [],
        createdAt: new Date().toISOString()
      };

      setUser(adminProfile);
      setLoading(false);

      // Tentative de synchronisation discrète
      try {
        const profile = await getUserProfile(uid);
        if (!profile || !profile.isAdmin) {
          // On n'envoie que les colonnes de base universelles pour éviter les 400
          await saveUserProfile({
            uid: adminProfile.uid,
            phoneNumber: adminProfile.phoneNumber,
            role: 'SUPER_ADMIN',
            isAdmin: true,
            isActive: true
          } as any);
        }
      } catch (e) {
        console.warn("Auth: Synchro DB indisponible (colonnes manquantes)");
      }
      return;
    }

    try {
      const profile = await getUserProfile(uid);
      setUser(profile);
    } catch (err) {
      console.error("Auth: Erreur profil", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (supabase) {
        try {
          const { data: { session } } = await (supabase.auth as any).getSession();
          if (session?.user) await handleUserSetup(session.user);
          else setLoading(false);
        } catch (e) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();

    if (supabase) {
      const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        if (session?.user) await handleUserSetup(session.user);
        else {
          setUser(null);
          setLoading(false);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const refreshProfile = async () => {
    if (user?.uid) {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) setUser(profile);
      } catch (e) {}
    }
  };

  const loginManually = async (phone: string): Promise<boolean> => {
    try {
      const profile = await getProfileByPhone(phone);
      if (profile && profile.isActive) {
        setUser(profile);
        localStorage.setItem('gotop_manual_phone', phone);
        return true;
      }
    } catch (e) {}
    return false;
  };

  const logout = async () => {
    try {
      if (supabase) await (supabase.auth as any).signOut();
    } catch (e) {}
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
