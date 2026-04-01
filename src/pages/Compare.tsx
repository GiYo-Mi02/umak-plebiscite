import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ExternalLink, FileSearch } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import Chatbot from '../components/ChatbotPanel'; 


type DocKey = 'old' | 'new';
type DocStatus = 'checking' | 'available' | 'missing';

const pdfDocs: Record<DocKey, { title: string; badge: string; path: string; tone: string; panelTone: string }> = {
  old: {
    title: '1987 Constitution',
    badge: 'Current',
    path: '/docs/2019%20Amended-USC-Constitution-By-Laws.pdf',
    tone: 'text-slate-muted',
    panelTone: 'bg-navy-900',
  },
  new: {
    title: 'New Federal Constitution',
    badge: 'Proposed',
    path: '/docs/NewConstitution.pdf',
    tone: 'text-gold',
    panelTone: 'bg-gold/5',
  },
};

const chatbotPdfSources = [
  { title: pdfDocs.old.title, path: pdfDocs.old.path },
  { title: pdfDocs.new.title, path: pdfDocs.new.path },
];

export default function Compare() {
  const [docStatus, setDocStatus] = useState<Record<DocKey, DocStatus>>({
    old: 'checking',
    new: 'checking',
  });
  const { user } = useAuth();

  const loginOrVoteLink = user ? '/vote' : '/auth/login';
  const loginOrVoteLabel = user ? 'Go to Ballot →' : 'Login to Vote →';

  useEffect(() => {
    let isCancelled = false;

    const checkPdf = async (key: DocKey, path: string) => {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        if (!isCancelled) {
          setDocStatus((prev) => ({
            ...prev,
            [key]: response.ok ? 'available' : 'missing',
          }));
        }
      } catch {
        if (!isCancelled) {
          setDocStatus((prev) => ({ ...prev, [key]: 'missing' }));
        }
      }
    };

    checkPdf('old', pdfDocs.old.path);
    checkPdf('new', pdfDocs.new.path);

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-navy-700 flex items-center justify-between px-6 shrink-0 bg-navy-900/90 backdrop-blur z-20">
        <Link to="/" className="flex items-center gap-2 text-parchment-muted hover:text-gold transition-colors font-mono text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <Link to={loginOrVoteLink} className="text-gold hover:text-gold-light transition-colors font-mono text-xs uppercase tracking-widest">
          {loginOrVoteLabel}
        </Link>
      </nav>

      <div className="border-b border-navy-700 bg-navy-800 px-6 py-4">
        <p className="font-mono text-[0.68rem] tracking-[0.2em] uppercase text-parchment-muted">Whole-document PDF comparison</p>
        <h1 className="font-display text-2xl mt-1">Read the full constitutions side by side</h1>
        <p className="text-parchment-muted mt-2 max-w-3xl text-sm">
          This view now compares the complete documents in PDF format. Use each viewer's built-in find, zoom, and page navigation tools.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-navy-700 pb-28 lg:pb-24">
        {(['old', 'new'] as DocKey[]).map((key) => {
          const doc = pdfDocs[key];
          const status = docStatus[key];

          return (
            <section key={key} className={`${doc.panelTone} p-4 md:p-5`}> 
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className={`font-mono text-[0.65rem] tracking-[0.2em] uppercase block ${doc.tone}`}>{doc.badge}</span>
                  <h2 className={`font-display text-xl ${key === 'new' ? 'text-gold-light' : 'text-parchment'}`}>{doc.title}</h2>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.path}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded border border-navy-600 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-parchment-muted hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  <a
                    href={doc.path}
                    download
                    className="inline-flex items-center gap-1 rounded border border-navy-600 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-parchment-muted hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-navy-700 bg-navy-950 min-h-[65vh]">
                {status === 'available' && (
                  <iframe
                    title={doc.title}
                    src={`${doc.path}#page=1&view=FitH`}
                    className="w-full h-[65vh]"
                  />
                )}

                {status === 'checking' && (
                  <div className="w-full h-[65vh] flex items-center justify-center text-sm text-parchment-muted">
                    Checking PDF availability...
                  </div>
                )}

                {status === 'missing' && (
                  <div className="w-full h-[65vh] p-6 md:p-8 flex flex-col items-center justify-center text-center">
                    <FileSearch className="w-8 h-8 text-gold mb-4" />
                    <h3 className="font-display text-xl mb-2">PDF not found</h3>
                    <p className="text-parchment-muted text-sm max-w-md">
                      Place the file at <span className="font-mono text-xs text-gold">public{doc.path.replace(/^\//, '/')}</span> to render this viewer.
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 border-t border-navy-700 backdrop-blur flex items-center justify-between z-20">
        <span className="font-serif italic text-parchment-muted ml-4">Finished reading? Cast your official vote.</span>
        <Button asChild>
          <Link to={user ? '/vote' : '/auth/login'}>Go to Ballot →</Link>
        </Button>
      </div>
      <Chatbot pdfSources={chatbotPdfSources} />
    </div>
  );
}
