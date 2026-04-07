import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type VoteStats = {
  votes_old: number;
  votes_new: number;
  total_votes: number;
  total_voters: number;
  participation_rate: number;
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [data, setData] = useState<VoteStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const { data: stats, error } = await supabase
        .from('vote_stats')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching vote stats:', error);
        return;
      }

      setData(stats as VoteStats);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    fetchStats();

    const intervalId = window.setInterval(fetchStats, 30000);
    return () => window.clearInterval(intervalId);
  }, [user, authLoading, isAdmin, navigate, fetchStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setTimeout(() => setIsRefreshing(false), 350);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <p className="font-interface text-sm text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="font-interface text-sm text-red-600">Failed to load dashboard data.</p>
      </div>
    );
  }

  const participationRate = data.participation_rate.toFixed(1);
  const retainPercent = data.total_votes > 0 ? ((data.votes_old / data.total_votes) * 100).toFixed(1) : '0.0';
  const adoptPercent = data.total_votes > 0 ? ((data.votes_new / data.total_votes) * 100).toFixed(1) : '0.0';

  const barData = [
    { name: 'Retain', votes: data.votes_old, fill: '#a1a1aa' },
    { name: 'Adopt', votes: data.votes_new, fill: '#27272a' },
  ];

  const formatCompact = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header showRefreshIndicator lastRefresh={lastRefresh} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8 md:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
              Executive Summary / Plebiscite 2026
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-black tracking-tight">
              Voting Data Analytics
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            className="pill-button bg-black text-white hover:bg-zinc-800 self-start md:self-auto inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </motion.div>

        {/* Key Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        >
          {/* Total Ballots */}
          <div className="bg-white rounded-xl p-6 md:p-8 card-shadow">
            <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-4">
              Total Ballots Cast
            </p>
            <div className="flex items-end gap-3 mb-4">
              <span className="font-display text-5xl md:text-6xl font-black text-black tracking-tight leading-none">
                {formatCompact(data.total_votes)}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[3px] w-5 bg-black rounded-full" />
              ))}
            </div>
          </div>

          {/* Registered Voters */}
          <div className="bg-white rounded-xl p-6 md:p-8 card-shadow">
            <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-4">
              Registered Voters
            </p>
            <div className="flex items-end gap-3 mb-4">
              <span className="font-display text-5xl md:text-6xl font-black text-black tracking-tight leading-none">
                {formatCompact(data.total_voters)}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[3px] w-5 bg-zinc-400 rounded-full" />
              ))}
            </div>
          </div>

          {/* Turnout Rate */}
          <div className="bg-white rounded-xl p-6 md:p-8 card-shadow">
            <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-4">
              Turnout Rate
            </p>
            <div className="flex items-end gap-3 mb-4">
              <span className="font-display text-5xl md:text-6xl font-black text-black tracking-tight leading-none">
                {participationRate}%
              </span>
              <span className="font-interface text-xs text-zinc-400 mb-2">
                of registered
              </span>
            </div>
            {/* Progress bar showing participation */}
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Number(participationRate), 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-black rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* College Registrations Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="mb-8"
        >
          <Link
            to="/admin/colleges"
            className="flex items-center justify-between bg-white rounded-xl p-6 card-shadow hover:shadow-md transition-shadow group"
          >
            <div>
              <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1">
                Voter Demographics
              </p>
              <h3 className="font-display text-lg font-bold text-black group-hover:text-zinc-700 transition-colors">
                View College Registrations
              </h3>
            </div>
            <span className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-black transition-colors">
              →
            </span>
          </Link>
        </motion.div>

        {/* Charts Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8"
        >
          {/* Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl p-6 md:p-8 card-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display text-xl font-bold text-black mb-1">Vote Distribution</h3>
                <p className="font-interface text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Live Aggregate Data
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-zinc-400" />
                  <span className="font-interface text-[10px] text-zinc-500">Retain</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800" />
                  <span className="font-interface text-[10px] text-zinc-500">Adopt</span>
                </div>
              </div>
            </div>
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#d4d4d8"
                    fontSize={11}
                    fontFamily="Inter, sans-serif"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e4e4e7',
                      borderRadius: '8px',
                      color: '#000000',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]} maxBarSize={100}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Panel — real data only */}
          <div className="lg:col-span-2 bg-zinc-900 text-white rounded-xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-4">
                Plebiscite Overview
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                {data.total_votes.toLocaleString()} ballots cast
              </h3>
              <p className="font-editorial text-sm text-zinc-400 leading-relaxed">
                out of {data.total_voters.toLocaleString()} registered voters. Turnout is currently at {participationRate}%.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-interface text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Retain Votes
                </span>
                <span className="font-interface text-sm font-semibold text-white tabular-nums">
                  {data.votes_old.toLocaleString()} ({retainPercent}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${retainPercent}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full bg-zinc-400 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-interface text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Adopt Votes
                </span>
                <span className="font-interface text-sm font-semibold text-white tabular-nums">
                  {data.votes_new.toLocaleString()} ({adoptPercent}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${adoptPercent}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vote Breakdown Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Retain Breakdown */}
          <div className="bg-white rounded-xl p-6 md:p-8 card-shadow">
            <h3 className="font-display text-lg font-bold text-black mb-4">Retain (1987)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-interface text-xs text-zinc-500">Total Votes</span>
                <span className="font-interface text-sm font-semibold text-black">{data.votes_old.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${retainPercent}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="h-full bg-zinc-400 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-interface text-xs text-zinc-400">Share</span>
                <span className="font-interface text-xs font-semibold text-zinc-600">{retainPercent}%</span>
              </div>
            </div>
          </div>

          {/* Adopt Breakdown */}
          <div className="bg-white rounded-xl p-6 md:p-8 card-shadow">
            <h3 className="font-display text-lg font-bold text-black mb-4">Adopt (2024)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-interface text-xs text-zinc-500">Total Votes</span>
                <span className="font-interface text-sm font-semibold text-black">{data.votes_new.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${adoptPercent}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full bg-zinc-800 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-interface text-xs text-zinc-400">Share</span>
                <span className="font-interface text-xs font-semibold text-zinc-600">{adoptPercent}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
