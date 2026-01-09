
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Verrous critiques pour la performance
  const lastProcessedUid = useRef<string | null>(null);
  const isProcessing = useRef<boolean>(false);

  const handleUserSetup = async (authUser: any) => {
    // Si pas d'utilisateur, on reset tout
    if (!authUser) {
      if (lastProcessedUid.current !== null) {
        lastProcessedUid.current = null;
        setUser(null);
      }
      setLoading(false);
      return;
    }

    const uid = authUser.id;

    // VERROU : Si on traite déjà cet UID ou si c'est le même que le dernier traité, on stoppe
    if (isProcessing.current || (lastProcessedUid.current === uid && user !== null)) {
      setLoading(false);
      return;
    }

    isProcessing.current = true;
    lastProcessedUid.current = uid;
    
    const email = (authUser.email || '').toLowerCase().trim();

    try {
      // CAS MASTER ADMIN
      if (email === MASTER_ADMIN_EMAIL) {
        console.log("Auth: CONFIGURATION MASTER ADMIN", uid);
        
        // On tente de récupérer le profil, mais on ne bloque pas si ça échoue
        const profile = await getUserProfile(uid).catch(() => null);

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
          badges: profile?.badges || [],
          purchasedModuleIds: TRAINING_CATALOG.map(m => m.id),
          pendingModuleIds: [],
          actionPlan: profile?.actionPlan || [],
          createdAt: profile?.createdAt || new Date().toISOString(),
          photoURL: profile?.photoURL || COACH_KITA_AVATAR
        };

        setUser(adminProfile);
      } else {
        // CAS CLIENT STANDARD
        const profile = await getUserProfile(uid);
        if (profile) {
          setUser(profile);
        }
      }
    } catch (err) {
      console.error("Auth: Erreur de configuration profil", err);
    } finally {
      isProcessing.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }
      
      try {
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (mounted) {
          if (session?.user) {
            await handleUserSetup(session.user);
          } else {
            setLoading(false);
          }
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    let subscription: any = null;
    if (supabase) {
      const { data } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        if (!mounted) return;
        
        // On ne réagit qu'aux changements réels d'identité
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) {
            await handleUserSetup(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          lastProcessedUid.current = null;
          setUser(null);
          setLoading(false);
        }
      });
      subscription = data.subscription;
    }
    
    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
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
        lastProcessedUid.current = profile.uid;
        setUser(profile);
        localStorage.setItem('gotop_manual_phone', phone);
        return true;
      }
    } catch (e) {}
    return false;
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (supabase) await (supabase.auth as any).signOut();
    } catch (e) {}
    lastProcessedUid.current = null;
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
