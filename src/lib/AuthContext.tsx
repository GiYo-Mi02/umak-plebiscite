import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Emails that are granted admin access to the dashboard.
 * These users bypass the @umak.edu.ph domain restriction.
 */
const ADMIN_EMAILS: string[] = [
  'umak.studentcongress@umak.edu.ph',
  'ggiojoshua2006@gmail.com',
];

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  const isAdmin =
    user?.user_metadata?.role === 'admin' ||
    (user?.email != null && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Check if an email is allowed to log in.
 * Allows @umak.edu.ph students and whitelisted admin emails.
 */
export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith('@umak.edu.ph') || ADMIN_EMAILS.includes(normalized);
}

/**
 * Check if an email is a designated admin.
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
