
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, saveUserProfile } from '../services/supabase';
import { UserProfile } from '../types';
import { SUPER_ADMIN_PHONE_NUMBER } from '../constants';

const MASTER_ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) setUser(profile);
      }
    } catch (e) {
      console.error("Refresh profile failed:", e);
    }
  };

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          await handleUserSetup(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Session init error:", err);
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth State Change:", event);
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // Lancer le setup sans forcément "await" si on veut éviter de bloquer l'event loop
        handleUserSetup(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSetup = async (authUser: any) => {
    const uid = authUser.id;
    const phone = authUser.phone || '';
    const email = (authUser.email || '').toLowerCase();
    const masterEmail = MASTER_ADMIN_EMAIL.toLowerCase();

    // Vérification immédiate si c'est l'admin maître
    const isMaster = email === masterEmail || phone === SUPER_ADMIN_PHONE_NUMBER;

    if (isMaster) {
      console.log("Master Admin détecté, accès prioritaire activé.");
      // On définit un profil minimal immédiatement pour débloquer l'UI
      const adminProfile: UserProfile = {
        uid,
        phoneNumber: phone,
        email: email,
        firstName: 'Super',
        lastName: 'Admin',
        establishmentName: "Go'Top Pro HQ",
        role: 'SUPER_ADMIN',
        isActive: true,
        isAdmin: true,
        badges: [],
        purchasedModuleIds: [],
        pendingModuleIds: [],
        actionPlan: [],
        createdAt: new Date().toISOString()
      };
      setUser(adminProfile);
      setLoading(false);
      
      // On tente quand même de synchroniser avec la DB en arrière-plan sans bloquer
      getUserProfile(uid).then(async (dbProfile) => {
        if (!dbProfile) {
          await saveUserProfile(adminProfile).catch(e => console.warn("Background save failed:", e));
        } else {
          setUser(dbProfile);
        }
      });
      return;
    }

    // Pour les autres utilisateurs, on garde la logique standard mais avec un timeout plus court
    setLoading(true);
    const setupTimeout = setTimeout(() => {
      console.warn("User setup timeout reached - Fallback to current state");
      setLoading(false);
    }, 5000);

    try {
      let profile = await getUserProfile(uid);
      if (!profile) {
        const newProfile: UserProfile = {
          uid,
          phoneNumber: phone,
          email: email,
          firstName: '',
          lastName: '',
          establishmentName: '',
          role: 'CLIENT',
          isActive: false,
          isAdmin: false,
          badges: [],
          purchasedModuleIds: [],
          pendingModuleIds: [],
          actionPlan: [],
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(newProfile);
        profile = newProfile;
      }
      setUser(profile);
    } catch (err) {
      console.error("Erreur setup utilisateur:", err);
    } finally {
      clearTimeout(setupTimeout);
      setLoading(false);
    }
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
