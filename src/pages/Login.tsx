import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? '/admin' : '/vote', { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setSigning(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        console.error('Google sign-in error:', oauthError);
        setError(oauthError.message || 'Failed to sign in with Google. Please try again.');
        setSigning(false);
      }
      // If successful, the browser will redirect to Google — no need to setSigning(false)
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setSigning(false);
    }
  };

  // Don't render while checking existing auth
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 bg-grid-pattern flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid-pattern flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-[440px] flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-full border border-navy-700 flex items-center justify-center mb-6"
        >
          <Lock className="w-6 h-6 text-gold" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-4 block">
            Student Authentication
          </span>
          <h1 className="font-display text-4xl mb-6">Access Your Ballot</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mb-8"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full flex flex-col gap-4 items-center"
        >
          <Button
            size="lg"
            className="w-full flex items-center justify-center gap-3"
            onClick={handleGoogleSignIn}
            disabled={signing}
          >
            {signing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                Redirecting...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <p className="font-mono text-xs text-parchment-muted mt-2 max-w-sm">
            Use your official <span className="text-gold">@umak.edu.ph</span> Google account to verify your identity and access one secure ballot.
          </p>

          {error ? (
            <p className="font-mono text-xs text-red-300 mt-2">{error}</p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <Link
            to="/compare"
            className="font-mono text-xs text-parchment-muted hover:text-gold transition-colors"
          >
            Read the Constitutions without logging in →
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
