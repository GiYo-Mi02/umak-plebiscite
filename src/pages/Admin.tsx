import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { RefreshCw, Lock, Info } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

type VoteStats = {
  votes_old: number;
  votes_new: number;
  total_votes: number;
  total_voters: number;
  participation_rate: number;
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
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

  // Auth guard + initial data fetch
  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    fetchStats();

    // Auto-refresh every 30 seconds
    const intervalId = window.setInterval(fetchStats, 30000);
    return () => window.clearInterval(intervalId);
  }, [user, authLoading, isAdmin, navigate, fetchStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setTimeout(() => setIsRefreshing(false), 350);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  // Loading state
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-parchment-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <p className="font-mono text-sm text-red-300">Failed to load dashboard data.</p>
      </div>
    );
  }

  const participationRate = data.participation_rate.toFixed(1);
  const votesRemaining = Math.max(data.total_voters - data.total_votes, 0);
  const retainPercent = data.total_votes > 0 ? ((data.votes_old / data.total_votes) * 100).toFixed(1) : '0.0';
  const adoptPercent = data.total_votes > 0 ? ((data.votes_new / data.total_votes) * 100).toFixed(1) : '0.0';

  const pieData = [
    { name: 'Retain', value: data.votes_old, color: '#94a3b8' },
    { name: 'Adopt', value: data.votes_new, color: '#f59e0b' },
  ];

  const barData = [
    { name: '1987 Const.', votes: data.votes_old, fill: '#94a3b8' },
    { name: 'New Fed.', votes: data.votes_new, fill: '#f59e0b' },
  ];

  const participationPieData = [
    { name: 'Voted', value: data.total_votes, color: '#f59e0b' },
    { name: 'Remaining', value: votesRemaining, color: '#0d1f38' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      {/* Top Nav */}
      <nav className="h-16 border-b border-navy-700 flex items-center justify-between px-6 bg-navy-900/90 backdrop-blur sticky top-0 z-20">
        <div className="flex flex-col">
          <span className="font-display text-lg text-parchment">Admin Dashboard</span>
          <span className="font-mono text-[0.65rem] tracking-widest text-parchment-muted uppercase">
            {user?.email}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-parchment-muted hover:text-gold transition-colors font-mono text-xs uppercase tracking-widest"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSignOut}
            className="text-parchment-muted hover:text-red-400 transition-colors font-mono text-xs uppercase tracking-widest"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">Plebiscite Results</h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className="font-mono text-xs text-parchment-muted uppercase tracking-widest">
              Last Updated
            </span>
            <span className="font-mono text-sm text-gold">
              {lastRefresh.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Read-only Notice */}
        <div className="bg-navy-800/50 border border-navy-700 rounded-sm p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display text-lg text-parchment mb-1">Read-Only Mode</h4>
            <p className="text-sm text-parchment-muted font-serif">
              This dashboard provides real-time, anonymized aggregate results. Individual ballots cannot be viewed or modified.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Votes Cast', value: data.total_votes.toLocaleString(), sub: 'Valid ballots' },
            { label: 'Registered Voters', value: data.total_voters.toLocaleString(), sub: 'Eligible students' },
            { label: 'Participation Rate', value: `${participationRate}%`, sub: 'Of registered voters' },
            { label: 'Votes Remaining', value: votesRemaining.toLocaleString(), sub: 'Pending ballots' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-3xl md:text-4xl text-parchment mb-1">
                    {stat.value}
                  </div>
                  <div className="font-serif text-xs text-parchment-muted">
                    {stat.sub}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Vote Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-slate-400 relative overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">
                  Retain — 1987 Constitution
                </span>
                <div className="flex items-end justify-between mb-6">
                  <span className="font-display text-5xl text-parchment">{data.votes_old.toLocaleString()}</span>
                  <span className="font-mono text-xl text-slate-400">{retainPercent}%</span>
                </div>
                <div className="h-2 w-full bg-navy-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${retainPercent}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-slate-400"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border-l-4 border-l-gold relative overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-gold block mb-2">
                  Adopt — New Federal Constitution
                </span>
                <div className="flex items-end justify-between mb-6">
                  <span className="font-display text-5xl text-gold-light">{data.votes_new.toLocaleString()}</span>
                  <span className="font-mono text-xl text-gold">{adoptPercent}%</span>
                </div>
                <div className="h-2 w-full bg-navy-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${adoptPercent}%` }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-full bg-gold"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-parchment-muted text-center">
                  Vote Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1f38', borderColor: '#27406b', borderRadius: '2px', color: '#faf4e6', fontFamily: 'IBM Plex Mono' }}
                      itemStyle={{ color: '#faf4e6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-parchment-muted text-center">
                  Votes by Option
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontFamily="IBM Plex Mono" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: '#0d1f38' }}
                      contentStyle={{ backgroundColor: '#0d1f38', borderColor: '#27406b', borderRadius: '2px', color: '#faf4e6', fontFamily: 'IBM Plex Mono' }}
                    />
                    <Bar dataKey="votes" radius={[2, 2, 0, 0]} maxBarSize={60}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-parchment-muted text-center">
                  Participation
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={participationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {participationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1f38', borderColor: '#27406b', borderRadius: '2px', color: '#faf4e6', fontFamily: 'IBM Plex Mono' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display text-3xl text-gold">{participationRate}%</span>
                  <span className="font-mono text-[0.65rem] text-parchment-muted uppercase tracking-widest">Voted</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Info Banner */}
        <div className="mt-8 flex items-center justify-center gap-2 text-parchment-muted font-mono text-xs uppercase tracking-widest opacity-60">
          <Info className="w-4 h-4" />
          <span>Dashboard auto-refreshes every 30 seconds. Data sourced from the vote_stats database view.</span>
        </div>
      </main>
    </div>
  );
}
