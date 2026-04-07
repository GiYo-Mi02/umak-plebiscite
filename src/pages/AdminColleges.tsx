import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type CollegeStat = {
  college: string;
  registered_count: number;
};

export default function AdminColleges() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [stats, setStats] = useState<CollegeStat[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('college_registration_stats')
          .select('*');

        if (error) {
          console.error('Error fetching college stats:', error);
          return;
        }

        setStats((data as CollegeStat[]) ?? []);
      } catch (err) {
        console.error('Error fetching college stats:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchStats();
  }, [user, authLoading, isAdmin, navigate]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <p className="font-interface text-sm text-zinc-500">Loading college data...</p>
        </div>
      </div>
    );
  }

  const total = stats.reduce((sum, s) => sum + Number(s.registered_count), 0);

  const computeShare = (count: number) => {
    if (total === 0) return '—';
    return ((count / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8 md:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Administrative Data / College Breakdown
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-black tracking-tight">
                College Registrations
              </h1>
            </div>
            <div className="flex items-baseline gap-2 self-start md:self-auto">
              <span className="font-display text-3xl font-black text-black tracking-tight">
                {total.toLocaleString()}
              </span>
              <span className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Total Voters
              </span>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="bg-white rounded-xl card-shadow overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left px-6 py-4 font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
                    College / Institute
                  </th>
                  <th className="text-right px-6 py-4 font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
                    Registered
                  </th>
                  <th className="text-right px-6 py-4 font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
                    Share %
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row, index) => (
                  <motion.tr
                    key={row.college}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-zinc-800 shrink-0" />
                        <span className="font-interface text-sm text-black">
                          {row.college}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-interface text-sm font-semibold text-black tabular-nums">
                        {Number(row.registered_count).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-interface text-sm text-zinc-600 tabular-nums">
                        {computeShare(Number(row.registered_count))}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="border-t border-zinc-200 px-6 py-4 flex items-center justify-between bg-zinc-50">
            <span className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {stats.length} Colleges / Institutes
            </span>
            <span className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Total: {total.toLocaleString()} Voters
            </span>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
