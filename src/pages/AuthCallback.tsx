import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * Handles the OAuth redirect from Supabase (Google sign-in).
 * The Supabase client automatically picks up the session from the URL.
 * We then validate the user's email and route them accordingly.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
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

        // Validate email via database function (checks @umak.edu.ph OR admin_emails table)
        const { data: isAllowed, error: allowedError } = await supabase.rpc('is_allowed_email', {
          p_email: session.user.email,
        });

        if (allowedError) {
          console.error('Email validation error:', allowedError);
          // If the function doesn't exist yet, fall back to domain check
          const isUmak = session.user.email.toLowerCase().endsWith('@umak.edu.ph');
          if (!isUmak) {
            await supabase.auth.signOut();
            setError('Only @umak.edu.ph email addresses or authorized accounts are permitted.');
            setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
            return;
          }
        } else if (!isAllowed) {
          await supabase.auth.signOut();
          setError('Only @umak.edu.ph email addresses or authorized accounts are permitted.');
          setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
          return;
        }

        // Check admin status via database
        const { data: isAdmin } = await supabase.rpc('check_is_admin');
        const admin = session.user.user_metadata?.role === 'admin' || !!isAdmin;

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
