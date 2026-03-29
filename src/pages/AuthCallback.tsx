import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { isAllowedEmail, isAdminEmail } from '@/lib/AuthContext';

/**
 * Handles the magic link redirect from Supabase.
 * The magic link URL includes a hash fragment with the access token.
 * The Supabase client automatically picks this up and establishes a session.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The Supabase client automatically reads the hash fragment
        // and exchanges it for a session when we call getSession()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
          return;
        }

        if (!session?.user?.email) {
          setError('No session found. Please try logging in again.');
          setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
          return;
        }

        // Re-validate email domain
        if (!isAllowedEmail(session.user.email)) {
          await supabase.auth.signOut();
          setError('Only @umak.edu.ph email addresses or authorized admin accounts are permitted.');
          setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
          return;
        }

        // Route based on role (JWT metadata OR whitelisted admin email)
        const admin = session.user.user_metadata?.role === 'admin' || isAdminEmail(session.user.email);
        navigate(admin ? '/admin' : '/vote', { replace: true });
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred.');
        setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-navy-900 bg-grid-pattern flex items-center justify-center">
      <div className="flex flex-col items-center text-center gap-4">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-red-400 flex items-center justify-center">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <p className="font-mono text-sm text-red-300">{error}</p>
            <p className="font-mono text-xs text-parchment-muted">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-sm text-parchment-muted">
              Verifying your identity...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
