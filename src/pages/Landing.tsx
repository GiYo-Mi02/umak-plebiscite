import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/AuthContext';
import { BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Landing() {
  const { user, loading, isAdmin } = useAuth();

  const ctaPath = user ? (isAdmin ? '/admin' : '/vote') : '/auth/login';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="flex-shrink-0 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-interface text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-6"
        >
          Enter the Archives
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-display leading-[0.95] mb-8"
        >
          <span className="block text-6xl md:text-8xl lg:text-9xl font-black text-black tracking-tight">
            The Modern
          </span>
          <span className="block text-6xl md:text-8xl lg:text-9xl font-bold italic text-black tracking-tight">
            Archivist
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="font-editorial italic text-base md:text-lg text-zinc-600 max-w-lg mb-10 leading-relaxed"
        >
          A digital forum for the curation of history and the collective governance of shared cultural documentation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            to={ctaPath}
            className="pill-button bg-black text-white hover:bg-zinc-800 inline-flex items-center justify-center"
          >
            {loading ? '...' : 'Cast Your Vote'}
          </Link>
          <Link
            to="/compare"
            className="pill-button border border-zinc-300 text-black hover:bg-zinc-50 inline-flex items-center justify-center"
          >
            Read the Proposal
          </Link>
        </motion.div>
      </section>

      {/* Featured Section: Image + Text */}
      <section className="max-w-6xl mx-auto w-full px-6 lg:px-10 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch"
        >
          {/* Image */}
          <div className="relative overflow-hidden bg-zinc-100">
            <img
              src="/hero-exhibition.png"
              alt="Exhibition room"
              className="w-full h-full object-cover grayscale"
              style={{ minHeight: '320px' }}
            />
            <div className="absolute bottom-4 left-4 bg-black/70 text-white font-interface text-[9px] uppercase tracking-[0.2em] px-3 py-1.5">
              Exhibition Room 01
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col justify-center p-8 lg:p-14">
            <div className="w-12 h-[1px] bg-zinc-300 mb-8" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-1 leading-tight">
              Preserving the
            </h2>
            <h2 className="font-display text-3xl md:text-4xl font-bold italic text-black mb-6 leading-tight">
              ephemeral.
            </h2>
            <p className="font-editorial text-sm md:text-base text-zinc-600 leading-relaxed mb-8 max-w-md">
              Our latest proposal examines the intersection of decentralized storage and classical archival methodologies. Join the discourse today.
            </p>
            <Link
              to="/compare"
              className="font-interface text-[10px] uppercase tracking-[0.2em] text-black font-semibold border-b border-black pb-1 self-start hover:text-zinc-600 hover:border-zinc-600 transition-colors"
            >
              View Journal Index
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto w-full px-6 lg:px-10 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="border border-zinc-200 rounded-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
            {/* Curation */}
            <div className="p-8 lg:p-10">
              <BarChart3 className="w-6 h-6 text-zinc-700 mb-5" />
              <h3 className="font-display italic text-xl font-bold text-black mb-3">Curation</h3>
              <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 leading-relaxed">
                Meticulously organized records for the discerning researcher.
              </p>
            </div>

            {/* Integrity */}
            <div className="p-8 lg:p-10">
              <ShieldCheck className="w-6 h-6 text-zinc-700 mb-5" />
              <h3 className="font-display italic text-xl font-bold text-black mb-3">Integrity</h3>
              <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 leading-relaxed">
                Immutable verification through decentralized proof systems.
              </p>
            </div>

            {/* Insights */}
            <div className="p-8 lg:p-10">
              <TrendingUp className="w-6 h-6 text-zinc-700 mb-5" />
              <h3 className="font-display italic text-xl font-bold text-black mb-3">Insights</h3>
              <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 leading-relaxed">
                Algorithmic analysis of historical data patterns and trends.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
