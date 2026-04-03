import { Link } from 'react-router-dom';

type FooterProps = {
  variant?: 'full' | 'minimal';
};

export default function Footer({ variant = 'full' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className="py-8 text-center">
        <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          © 2024 The Modern Archivist. All rights reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="font-display italic text-sm font-bold text-black tracking-tight">
          ARCHIVE
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/compare"
            className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-black transition-colors"
          >
            Constitution
          </Link>
          <Link
            to="/"
            className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-black transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="/"
            className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-black transition-colors"
          >
            Legal
          </Link>
        </div>

        {/* Copyright */}
        <p className="font-interface text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          © 2024 The Modern Archivist. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
