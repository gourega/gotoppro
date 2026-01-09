
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
  
  // Verrous pour éviter les boucles de rendu
  const processingRef = useRef<boolean>(false);
  const lastProcessedUid = useRef<string | null>(null);

  const handleUserSetup = async (authUser: any) => {
    if (!authUser) {
      if (lastProcessedUid.current !== null) {
        lastProcessedUid.current = null;
        setUser(null);
      }
      setLoading(false);
      return;
    }

    // Si on est déjà en train de traiter cet utilisateur, on ignore
    if (processingRef.current && lastProcessedUid.current === authUser.id) return;
    
    processingRef.current = true;
    const uid = authUser.id;
    const email = (authUser.email || '').toLowerCase().trim();

    try {
      // CAS MASTER ADMIN
      if (email === MASTER_ADMIN_EMAIL) {
        // Si le Master Admin est déjà chargé avec le même UID, on ne fait rien
        if (user?.uid === uid && user?.role === 'SUPER_ADMIN') {
          setLoading(false);
          processingRef.current = false;
          return;
        }

        console.log("Auth: CONFIGURATION MASTER ADMIN", uid);
        
        // On récupère le profil réel pour les stats, mais on force les droits admin
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
        lastProcessedUid.current = uid;
      } else {
        // CAS CLIENT STANDARD
        const profile = await getUserProfile(uid);
        setUser(profile);
        lastProcessedUid.current = uid;
      }
    } catch (err) {
      console.error("Auth: Erreur critique setup", err);
    } finally {
      setLoading(false);
      processingRef.current = false;
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
        if (mounted && session?.user) {
          await handleUserSetup(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    let authListener: any = null;
    if (supabase) {
      const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) await handleUserSetup(session.user);
        } else if (event === 'SIGNED_OUT') {
          lastProcessedUid.current = null;
          setUser(null);
          setLoading(false);
        }
      });
      authListener = subscription;
    }
    
    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
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
