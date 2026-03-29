import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/AuthContext';

export default function Landing() {
  const { user, loading, isAdmin } = useAuth();

  const ctaPath = user ? (isAdmin ? '/admin' : '/vote') : '/auth/login';
  const ctaLabel = user ? (isAdmin ? 'Open Admin Dashboard' : 'Continue to Ballot') : 'Login to Vote';

  return (
    <div className="min-h-screen bg-navy-900 bg-grid-pattern relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Top Header Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 right-0 h-10 border-b border-navy-700/50 flex items-center justify-between px-6"
      >
        <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-parchment-muted">
          University of Makati
        </span>
        <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-parchment-muted">
          College of Information Technology Education
        </span>
      </motion.div>

      {/* Watermark */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
        <div className="w-96 h-96 rounded-full border border-parchment flex items-center justify-center">
          <div className="w-80 h-80 rounded-full border border-parchment"></div>
        </div>
      </div>

      <main className="max-w-4xl w-full flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-6 block">
            Official Student Plebiscite · Academic Year 2024–2025
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="font-display text-5xl md:text-7xl leading-tight mb-2">
            <span className="text-parchment block">Constitutional</span>
            <span className="text-gold italic block">Reform Plebiscite</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent my-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-parchment-muted max-w-2xl text-lg mb-12"
        >
          Exercise your right to shape the future of the University of Makati student body. Read the proposed changes and cast your vote on the new constitution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <Button asChild size="lg">
            <Link to="/compare">Read the Constitutions</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={ctaPath}>{loading ? '...' : ctaLabel}</Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {[
            { title: 'Eligible Voters', desc: 'All currently enrolled UMAK students are eligible to participate.' },
            { title: 'One Vote Per Person', desc: 'Each student may cast exactly one ballot. Votes cannot be changed.' },
            { title: 'Anonymous Ballot', desc: 'Your identity is verified, but your vote remains completely anonymous.' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gold">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-parchment-muted">{card.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-6 font-mono text-xs text-parchment-muted uppercase tracking-widest"
      >
        University of Makati · J.P. Rizal Ext, West Rembo, Taguig City
      </motion.footer>
    </div>
  );
}
