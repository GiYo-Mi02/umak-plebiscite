import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

type VoteChoice = 'old' | 'new';
type VoteStep = 'loading' | 'vote' | 'confirm' | 'success' | 'already_voted' | 'error';

export default function Vote() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const [selected, setSelected] = useState<VoteChoice | null>(null);
  const [step, setStep] = useState<VoteStep>('loading');
  const [submitError, setSubmitError] = useState('');
  const [existingChoice, setExistingChoice] = useState<VoteChoice | null>(null);

  // Check auth and existing vote status on mount
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

    // Check if the user has already voted
    const checkVoteStatus = async () => {
      try {
        const { data: voter, error: voterError } = await supabase
          .from('voters')
          .select('has_voted')
          .eq('id', user.id)
          .single();

        if (voterError) {
          console.error('Error checking voter status:', voterError);
          // Voter record might not exist yet (trigger may be delayed)
          setStep('vote');
          return;
        }

        if (voter?.has_voted) {
          // Fetch existing vote to show what they chose
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

  const handleVote = () => {
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
      // Call the atomic cast_vote() PostgreSQL function
      const { data, error: rpcError } = await supabase.rpc('cast_vote', {
        p_choice: selected,
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        setSubmitError('Unable to submit your ballot. Please try again.');
        return;
      }

      // The function returns JSON: { success: boolean, error?: string }
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

  // Loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-navy-900 bg-grid-pattern flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-parchment-muted">Loading your ballot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid-pattern flex flex-col items-center p-6">
      {/* Top Bar */}
      <nav className="w-full max-w-3xl flex items-center justify-between mb-12">
        <Link to="/" className="text-parchment-muted hover:text-gold transition-colors font-mono text-xs uppercase tracking-widest">
          ← Home
        </Link>
        <button
          onClick={handleSignOut}
          className="text-parchment-muted hover:text-gold transition-colors font-mono text-xs uppercase tracking-widest"
        >
          Sign Out
        </button>
      </nav>

      <main className="w-full max-w-2xl flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-4 block">
            Official Student Ballot
          </span>
          <h1 className="font-display text-4xl mb-6">Cast Your Vote</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mb-6"
        />

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-parchment-muted mb-10"
        >
          Voting as: {user?.email || 'loading...'}
        </motion.span>

        <AnimatePresence mode="wait">
          {step === 'vote' && (
            <motion.div
              key="vote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col gap-6"
            >
              <Card className="border-navy-700 bg-navy-800/50">
                <CardContent className="p-8">
                  <p className="font-serif italic text-xl text-parchment/90">
                    Do you support the adoption of the proposed New Federal Constitution to replace the 1987 Constitution?
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelected('old')}
                  className={`relative flex flex-col items-start text-left p-6 rounded-sm border transition-all ${
                    selected === 'old'
                      ? 'border-slate-400 bg-slate-900/40'
                      : 'border-navy-700 bg-navy-900/60 hover:border-slate-600'
                  }`}
                >
                  <Layers className={`w-6 h-6 mb-4 ${selected === 'old' ? 'text-slate-300' : 'text-slate-500'}`} />
                  <h3 className={`font-display text-lg mb-2 ${selected === 'old' ? 'text-slate-200' : 'text-slate-400'}`}>
                    Retain — 1987 Constitution
                  </h3>
                  <p className="font-serif text-sm text-slate-500">
                    Keep the current constitutional framework.
                  </p>
                  {selected === 'old' && (
                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-slate-400" />
                  )}
                </button>

                <button
                  onClick={() => setSelected('new')}
                  className={`relative flex flex-col items-start text-left p-6 rounded-sm border transition-all ${
                    selected === 'new'
                      ? 'border-gold bg-gold/10'
                      : 'border-navy-700 bg-navy-900/60 hover:border-gold/50'
                  }`}
                >
                  <PlusCircle className={`w-6 h-6 mb-4 ${selected === 'new' ? 'text-gold' : 'text-gold/50'}`} />
                  <h3 className={`font-display text-lg mb-2 ${selected === 'new' ? 'text-gold-light' : 'text-gold/70'}`}>
                    Adopt — New Federal Constitution
                  </h3>
                  <p className="font-serif text-sm text-parchment-muted">
                    Transition to the proposed federal system.
                  </p>
                  {selected === 'new' && (
                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gold" />
                  )}
                </button>
              </div>

              <div className="mt-4">
                <Link to="/compare" className="font-mono text-xs text-parchment-muted hover:text-gold transition-colors">
                  Read both constitutions before voting →
                </Link>
              </div>

              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <Button size="lg" onClick={handleVote} className="w-full sm:w-auto">
                      Review & Confirm Vote
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Card className={selected === 'new' ? 'border-gold/50' : 'border-slate-500/50'}>
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <span className="font-mono text-xs uppercase tracking-widest text-parchment-muted mb-4">
                    You have selected
                  </span>
                  <h2 className={`font-display text-3xl mb-6 ${selected === 'new' ? 'text-gold-light' : 'text-slate-200'}`}>
                    {selected === 'new' ? 'Adopt — New Federal Constitution' : 'Retain — 1987 Constitution'}
                  </h2>
                  
                  <div className="bg-red-950/30 border border-red-900/50 rounded-sm p-4 mb-8">
                    <p className="text-red-200/80 text-sm font-serif italic">
                      Warning: Your vote is permanent and irreversible. Once submitted, you cannot change your selection.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button variant="outline" size="lg" onClick={() => setStep('vote')}>
                      Go Back
                    </Button>
                    <Button size="lg" onClick={handleConfirm}>
                      Submit Ballot
                    </Button>
                  </div>
                  {submitError ? (
                    <p className="mt-4 text-sm text-red-300 font-mono">{submitError}</p>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'already_voted' && (
            <motion.div
              key="already-voted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Card className="border-gold/30 bg-navy-800/80">
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-gold" />
                  </div>
                  <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-4 block">
                    Ballot Locked
                  </span>
                  <h2 className="font-display text-3xl mb-4 text-parchment">This account already voted</h2>
                  <p className="text-parchment-muted max-w-md">
                    Each UMAK student can submit one ballot only. Your previously submitted vote remains final and cannot be changed.
                  </p>
                  {existingChoice ? (
                    <p className="mt-6 font-mono text-xs uppercase tracking-widest text-gold">
                      Recorded Selection: {existingChoice === 'new' ? 'Adopt - New Federal Constitution' : 'Retain - 1987 Constitution'}
                    </p>
                  ) : null}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button asChild variant="outline">
                      <Link to="/compare">Read the Constitutions</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/">Return Home</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Card className="border-gold/30 bg-navy-800/80">
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-gold" />
                  </div>
                  <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-4 block">
                    Ballot Accepted
                  </span>
                  <h2 className="font-display text-3xl mb-4 text-parchment">Vote successfully cast</h2>
                  <p className="text-parchment-muted max-w-md">
                    Thank you for participating in the plebiscite. Your vote has been securely recorded and remains completely anonymous.
                  </p>
                  <Button asChild variant="outline" className="mt-8">
                    <Link to="/">Return Home</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
