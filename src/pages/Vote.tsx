import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';
import CollegeSelectionModal from '@/components/CollegeSelectionModal';

type VoteChoice = 'old' | 'new';
type VoteStep = 'loading' | 'vote' | 'confirm' | 'success' | 'already_voted' | 'error';

export default function Vote() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const [selected, setSelected] = useState<VoteChoice | null>(null);
  const [step, setStep] = useState<VoteStep>('loading');
  const [submitError, setSubmitError] = useState('');
  const [existingChoice, setExistingChoice] = useState<VoteChoice | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth/login', { replace: true });
      return;
    }

    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    const checkVoteStatus = async () => {
      try {
        const { data: voter, error: voterError } = await supabase
          .from('voters')
          .select('has_voted')
          .eq('id', user.id)
          .single();

        if (voterError) {
          console.error('Error checking voter status:', voterError);
          setStep('vote');
          return;
        }

        if (voter?.has_voted) {
          const { data: vote } = await supabase
            .from('votes')
            .select('choice')
            .eq('voter_id', user.id)
            .single();

          if (vote) {
            setExistingChoice(vote.choice as VoteChoice);
            setSelected(vote.choice as VoteChoice);
          }
          setStep('already_voted');
        } else {
          setStep('vote');
        }
      } catch (err) {
        console.error('Error checking vote status:', err);
        setStep('vote');
      }
    };

    checkVoteStatus();
  }, [user, authLoading, isAdmin, navigate]);

  const handleCastVote = () => {
    if (!selected) return;
    setSubmitError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selected || !user) {
      navigate('/auth/login', { replace: true });
      return;
    }

    setSubmitError('');

    try {
      const { data, error: rpcError } = await supabase.rpc('cast_vote', {
        p_choice: selected,
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        setSubmitError('Unable to submit your ballot. Please try again.');
        return;
      }

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        if (result.error === 'already_voted') {
          setExistingChoice(selected);
          setStep('already_voted');
          setSubmitError('A ballot is already registered for this account.');
          return;
        }
        setSubmitError(result.error || 'Unable to submit your ballot.');
        return;
      }

      setStep('success');
    } catch (err) {
      console.error('Vote submission error:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="font-interface text-sm text-zinc-500">Loading your ballot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Top Bar */}
      <div className="h-10 flex items-center justify-center px-6 border-b border-zinc-100">
        <div className="flex items-center gap-2 font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          <Link to="/" className="hover:text-black transition-colors">Plebescite 2026</Link>
          <span>/</span>
          <span className="text-zinc-600">Ballot XXXX</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-6">
        <CollegeSelectionModal />
        <AnimatePresence mode="wait">
          {/* ============ VOTE STEP ============ */}
          {step === 'vote' && (
            <motion.div
              key="vote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-3xl flex flex-col items-center pt-12 md:pt-20 pb-16"
            >
              {/* Question */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display italic text-4xl md:text-5xl lg:text-6xl font-bold text-black text-center leading-[1.1] mb-12 md:mb-16 max-w-2xl"
              >
                Should the Council adopt the proposed constitution charter?
              </motion.h1>

              {/* Divider */}
              <div className="w-full border-t border-zinc-200 mb-12 md:mb-16" />

              {/* Choice Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12"
              >
                {/* Option A: Retain */}
                <button
                  onClick={() => setSelected('old')}
                  className={`relative text-left p-8 md:p-10 rounded-lg transition-all duration-300 ${
                    selected === 'old'
                      ? 'border-[3px] border-black bg-white'
                      : 'border border-zinc-200 bg-white hover:border-zinc-400'
                  }`}
                >
                  {selected === 'old' && (
                    <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-black" />
                  )}
                  <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-4">
                    Option A
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-black mb-4">
                    Retain
                  </h3>
                  <p className="font-editorial text-sm text-zinc-600 leading-relaxed">
                    Maintain the current 2019 USC Constitution without amendment. Prioritizes historical continuity over structural expansion.
                  </p>
                  {selected === 'old' && (
                    <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-black font-semibold mt-6 pt-4 border-t border-zinc-200">
                      Selected
                    </p>
                  )}
                </button>

                {/* Option B: Adopt */}
                <button
                  onClick={() => setSelected('new')}
                  className={`relative text-left p-8 md:p-10 rounded-lg transition-all duration-300 ${
                    selected === 'new'
                      ? 'border-[3px] border-black bg-white'
                      : 'border border-zinc-200 bg-white hover:border-zinc-400'
                  }`}
                >
                  {selected === 'new' && (
                    <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-black" />
                  )}
                  <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-4">
                    Option B
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-black mb-4">
                    Adopt
                  </h3>
                  <p className="font-editorial text-sm text-zinc-600 leading-relaxed">
                    Implement the 2026 USC Constitution, Introduces digital redundancy and climate-controlled preservation vaults.
                  </p>
                  {selected === 'new' && (
                    <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-black font-semibold mt-6 pt-4 border-t border-zinc-200">
                      Selected
                    </p>
                  )}
                </button>
              </motion.div>

              {/* Institutional Notice */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full flex flex-col items-center"
                  >
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-8 py-6 mb-10 max-w-lg text-center">
                      <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
                        Institutional Notice
                      </p>
                      <p className="font-editorial italic text-sm text-zinc-600 leading-relaxed">
                        Your selection is recorded anonymously. Once cast, this digital ballot cannot be retrieved or modified.
                      </p>
                    </div>

                    {/* Error */}
                    {submitError && (
                      <p className="font-interface text-xs text-red-600 mb-4 text-center">
                        {submitError}
                      </p>
                    )}

                    <button
                      onClick={handleCastVote}
                      className="pill-button bg-black text-white hover:bg-zinc-800 mb-4"
                    >
                      Cast Permanent Vote
                    </button>
                    <Link
                      to="/compare"
                      className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-black transition-colors"
                    >
                      Review Ballot Documentation
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ============ CONFIRM STEP ============ */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md flex flex-col items-center pt-20 md:pt-28 pb-16"
            >
              <h2 className="font-interface text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-8">
                Confirm Your Choice
              </h2>

              <div className="border-[3px] border-black rounded-lg p-10 mb-10 w-full text-center bg-white">
                <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">
                  Your Selection
                </p>
                <h3 className="font-display text-4xl font-bold text-black mb-3">
                  {selected === 'old' ? 'Retain' : 'Adopt'}
                </h3>
                <p className="font-editorial text-sm text-zinc-600">
                  {selected === 'old'
                    ? 'Keep the current 1987 constitution'
                    : 'Adopt the 2024 modernization proposal'}
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-10 w-full text-center">
                <p className="font-editorial italic text-sm text-zinc-600 leading-relaxed">
                  This action is permanent and irreversible. Once cast, your ballot cannot be changed. Proceed only when you are certain.
                </p>
              </div>

              {submitError && (
                <p className="font-interface text-xs text-red-600 mb-6 text-center">
                  {submitError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => setStep('vote')}
                  className="pill-button border border-zinc-300 text-black hover:bg-zinc-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="pill-button bg-black text-white hover:bg-zinc-800"
                >
                  Cast Permanent Vote
                </button>
              </div>
            </motion.div>
          )}

          {/* ============ ALREADY VOTED ============ */}
          {step === 'already_voted' && (
            <motion.div
              key="already-voted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md flex flex-col items-center text-center pt-20 md:pt-28 pb-16"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-8"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="font-interface font-bold text-2xl text-black mb-3">Ballot Locked</h2>
              <p className="font-editorial text-sm text-zinc-600 mb-6 leading-relaxed">
                Your account has already cast a ballot. Each voter may submit one ballot only. Your vote is final and cannot be changed.
              </p>

              {existingChoice && (
                <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-600 mb-8 bg-zinc-100 px-5 py-2.5 rounded-full">
                  Recorded: {existingChoice === 'old' ? 'Retain' : 'Adopt'}
                </p>
              )}

              <div className="flex flex-col gap-3 w-full">
                <Link
                  to="/compare"
                  className="pill-button border border-zinc-300 text-black hover:bg-zinc-50 text-center"
                >
                  Read Full Documents
                </Link>
                <Link
                  to="/"
                  className="pill-button bg-black text-white hover:bg-zinc-800 text-center"
                >
                  Return Home
                </Link>
              </div>
            </motion.div>
          )}

          {/* ============ SUCCESS ============ */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md flex flex-col items-center text-center pt-20 md:pt-28 pb-16"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-8"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="font-interface font-bold text-2xl text-black mb-3">Ballot Accepted</h2>
              <p className="font-editorial text-sm text-zinc-600 mb-8 leading-relaxed">
                Your vote has been securely recorded. It remains completely anonymous and cannot be traced or changed. Thank you for participating.
              </p>

              <Link
                to="/"
                className="pill-button bg-black text-white hover:bg-zinc-800 text-center"
              >
                Return Home
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
