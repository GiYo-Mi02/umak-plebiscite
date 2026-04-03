import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);

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
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100/60 flex flex-col items-center justify-center p-6 relative">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-white rounded-2xl p-10 card-shadow"
      >
        {/* Lock Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mb-10"
        >
          <p className="font-interface text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-3">
            Institutional Gateway
          </p>
          <h1 className="font-interface font-bold text-2xl text-black mb-4">Access Ballot</h1>
          <p className="font-editorial italic text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
            Verify your identity to engage with the modern archive and cast your institutional vote.
          </p>
        </motion.div>

        {/* Google Sign In Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-8"
        >
          <button
            onClick={handleGoogleSignIn}
            disabled={signing}
            className="w-full h-12 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            {signing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span className="font-interface text-sm font-medium text-black">Redirecting...</span>
              </span>
            ) : (
              <>
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-interface text-sm font-medium text-black">Sign in with Google</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-interface text-xs text-red-600 mb-6 text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Labels */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center space-y-3 mb-10"
        >
          <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Institutional Access
          </p>
          <Link
            to="/"
            className="block font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-black transition-colors"
          >
            Trouble Accessing? Contact Registrar
          </Link>
        </motion.div>

        {/* Divider + Archive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="border-t border-zinc-100 pt-6 text-center"
        >
          <span className="font-display italic text-sm text-zinc-300 tracking-tight">ARCHIVE</span>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-16"
      >
        <Footer variant="minimal" />
      </motion.div>
    </div>
  );
}
