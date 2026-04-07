import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useColleges } from '@/hooks/useColleges';

type VoterCollegeData = {
  college_id: number | null;
  college_edits: number;
};

export default function CollegeSelectionModal() {
  const { user } = useAuth();
  const { colleges, loading: collegesLoading } = useColleges();

  const [voterData, setVoterData] = useState<VoterCollegeData | null>(null);
  const [voterLoading, setVoterLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchVoterData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('voters')
        .select('college_id, college_edits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching voter college data:', error);
        setVoterLoading(false);
        return;
      }

      const voter = data as VoterCollegeData;
      setVoterData(voter);

      // Auto-open modal if college is not set yet (first login)
      if (voter.college_id === null) {
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Error fetching voter data:', err);
    } finally {
      setVoterLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVoterData();
  }, [fetchVoterData]);

  const isFirstLogin = voterData?.college_id === null;
  const editsUsed = voterData?.college_edits ?? 0;
  const canEdit = editsUsed < 2;
  const isLastEdit = editsUsed === 1;

  const handleConfirm = async () => {
    if (selectedId === '' || !user) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.rpc('update_user_college', {
        p_college_id: selectedId,
      });

      if (error) {
        console.error('RPC error:', error);
        setErrorMsg('Failed to update college. Please try again.');
        setSubmitting(false);
        return;
      }

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        setErrorMsg(result.error ?? 'Unable to update college.');
        setSubmitting(false);
        return;
      }

      // Refetch voter data and close modal
      await fetchVoterData();
      setIsOpen(false);
      setSelectedId('');
      setErrorMsg('');
    } catch (err) {
      console.error('Error updating college:', err);
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render anything while loading or if can't edit
  if (voterLoading || collegesLoading) return null;
  if (!voterData) return null;
  if (!canEdit && !isFirstLogin) return null;

  // Find the current college name
  const currentCollege = colleges.find((c) => c.id === voterData.college_id);

  return (
    <>
      {/* Trigger button – visible when modal is closed and user can still edit */}
      {!isOpen && !isFirstLogin && canEdit && (
        <motion.button
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setSelectedId(voterData.college_id ?? '');
            setIsOpen(true);
          }}
          className="mb-4 self-center inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 bg-white text-zinc-600 font-interface text-[11px] uppercase tracking-[0.15em] hover:border-zinc-500 hover:text-black transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Change College · {2 - editsUsed} edit{2 - editsUsed !== 1 ? 's' : ''} remaining
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="college-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              key="college-modal"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md bg-white rounded-xl p-8 shadow-2xl relative"
            >
              {/* Close button – only if NOT first login */}
              {!isFirstLogin && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setErrorMsg('');
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:border-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              )}

              {/* Title */}
              <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
                {isFirstLogin ? 'Welcome — Select Your College' : 'Update College'}
              </p>
              <h2 className="font-display text-2xl font-bold text-black mb-1">
                {isFirstLogin ? 'College Registration' : 'Change College'}
              </h2>

              {isFirstLogin && (
                <p className="font-editorial text-sm text-zinc-600 leading-relaxed mb-6">
                  Please select your college or institute to complete registration. This selection can be changed up to 2 times.
                </p>
              )}

              {!isFirstLogin && currentCollege && (
                <p className="font-editorial text-sm text-zinc-600 leading-relaxed mb-2">
                  Current: <span className="font-semibold text-black">{currentCollege.name}</span>
                </p>
              )}

              {/* Last edit warning */}
              {isLastEdit && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
                  <p className="font-interface text-xs text-amber-800">
                    ⚠ This is your <span className="font-bold">last edit</span>. After this change, your college selection becomes permanent.
                  </p>
                </div>
              )}

              {!isLastEdit && !isFirstLogin && (
                <div className="mb-5" />
              )}

              {isFirstLogin && !isLastEdit && null}

              {/* College dropdown */}
              <label className="block mb-2">
                <span className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Select College / Institute
                </span>
              </label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value === '' ? '' : Number(e.target.value));
                  setErrorMsg('');
                }}
                className="w-full h-12 px-4 rounded-lg border border-zinc-300 bg-white text-sm font-interface text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none cursor-pointer mb-5"
              >
                <option value="">— Choose your college —</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Error */}
              {errorMsg && (
                <p className="font-interface text-xs text-red-600 mb-4">{errorMsg}</p>
              )}

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={selectedId === '' || submitting}
                className="w-full pill-button bg-black text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Confirm Selection'}
              </button>

              {/* Info */}
              <p className="font-interface text-[10px] text-zinc-400 text-center mt-4 leading-relaxed">
                You may change your college up to 2 times total.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
