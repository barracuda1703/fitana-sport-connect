import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  role: 'client' | 'trainer';
  email: string;
  name: string;
  surname?: string;
  city?: string;
  language?: string;
  avatarUrl?: string;
  bio?: string;
  password?: string;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  isLoading: boolean;
  bootstrapped: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.debug('[auth] AuthProvider mounting');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.debug('[auth] event:', event, 'expires_at:', session?.expires_at);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetch to avoid blocking
          setTimeout(async () => {
            if (!mounted) return;
            
            const { data: profile, error } = await (supabase as any)
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (mounted && profile) {
              setUser({
                ...profile,
                avatarUrl: profile.avatarurl
              } as Profile);
            } else if (error) {
              console.error('[auth] Error fetching profile:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.debug('[auth] Initial session check:', session?.user?.id);
      
      if (!mounted) return;
      
      setSession(session);
      
      if (session?.user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (mounted && profile) {
          setUser({
            ...profile,
            avatarUrl: profile.avatarurl
          } as Profile);
        }
      }
      
      if (mounted) {
        setIsLoading(false);
        setBootstrapped(true);
      }
    });

    // Monitor storage changes for multi-tab logout
    const handleStorageChange = (e: StorageEvent) => {
      if (String(e.key).includes('auth-token')) {
        console.debug('[auth] storage change detected:', e.key);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const refreshUser = async () => {
    if (session?.user) {
      const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profile) {
        setUser({
          ...profile,
          avatarUrl: profile.avatarurl
        } as Profile);

        // Auto-create trainer record for new trainers
        if (profile.role === 'trainer') {
          const { data: trainerExists } = await supabase
            .from('trainers')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!trainerExists) {
            await supabase
              .from('trainers')
              .insert({
                user_id: session.user.id,
                display_name: profile.name,
                specialties: [],
                languages: [profile.language || 'pl'],
                locations: [],
                services: [],
                availability: [],
                gallery: [],
                settings: {}
              });
          }
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    }
  };

  const value = React.useMemo(
    () => ({ user, session, isLoading, bootstrapped, logout, refreshUser }),
    [user, session, isLoading, bootstrapped]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};