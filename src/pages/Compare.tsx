import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Download, FileSearch } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import Chatbot from '../components/ChatbotPanel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type DocKey = 'old' | 'new';
type DocStatus = 'checking' | 'available' | 'missing';

const pdfDocs: Record<DocKey, { title: string; badge: string; path: string }> = {
  old: {
    title: '1987 Constitution',
    badge: 'Reference Edition',
    path: '/docs/2019%20Amended-USC-Constitution-By-Laws.pdf',
  },
  new: {
    title: 'Proposed Constitution',
    badge: 'Proposed Revision 2024.01',
    path: '/docs/NewConstitution.pdf',
  },
};

const chatbotPdfSources = [
  { title: pdfDocs.old.title, path: pdfDocs.old.path },
  { title: pdfDocs.new.title, path: pdfDocs.new.path },
];

const articles = ['Article I', 'Article II', 'Article III', 'Article IV', 'Article V', 'Article VI', 'Article VII'];

export default function Compare() {
  const [docStatus, setDocStatus] = useState<Record<DocKey, DocStatus>>({
    old: 'checking',
    new: 'checking',
  });
  const [activeArticle, setActiveArticle] = useState(0);
  const { user } = useAuth();

  const loginOrVoteLink = user ? '/vote' : '/auth/login';
  const loginOrVoteLabel = user ? 'Go to Ballot' : 'Login to Vote';

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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: 1987 Constitution */}
        <section className="bg-white flex flex-col border-r border-zinc-100">
          {/* Document Header */}
          <div className="border-b border-zinc-200 px-6 py-3 lg:px-8 lg:py-4 sticky top-14 z-30 glass-effect">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  {pdfDocs.old.badge}
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-black">
                  {pdfDocs.old.title}
                </h2>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <a
                  href={pdfDocs.old.path}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:border-zinc-400 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={pdfDocs.old.path}
                  download
                  className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:border-zinc-400 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* PDF / Content */}
          <div className="flex-1 overflow-hidden">
            {docStatus.old === 'available' && (
              <iframe
                title={pdfDocs.old.title}
                src={`${pdfDocs.old.path}#page=1&view=FitH`}
                className="w-full h-full min-h-[600px]"
              />
            )}
            {docStatus.old === 'checking' && (
              <div className="w-full h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-zinc-500">
                  <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                  <p className="font-interface text-sm">Loading document...</p>
                </div>
              </div>
            )}
            {docStatus.old === 'missing' && (
              <div className="w-full h-96 flex flex-col items-center justify-center text-center p-6">
                <FileSearch className="w-8 h-8 text-zinc-400 mb-3" />
                <h3 className="font-display font-bold text-black mb-1">Document Not Found</h3>
                <p className="font-interface text-sm text-zinc-500 max-w-xs">
                  Place the PDF at <span className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{pdfDocs.old.path}</span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right: Proposed Constitution */}
        <section className="bg-zinc-50/50 flex flex-col">
          {/* Document Header */}
          <div className="border-b border-zinc-200 px-6 py-3 lg:px-8 lg:py-4 sticky top-14 z-30 glass-effect">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-interface text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  {pdfDocs.new.badge}
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-black">
                  {pdfDocs.new.title}
                </h2>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <span className="font-interface text-[9px] uppercase tracking-[0.15em] bg-black text-white px-3 py-1.5 rounded-md font-medium">
                  Draft Phase
                </span>
                <a
                  href={pdfDocs.new.path}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:border-zinc-400 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={pdfDocs.new.path}
                  download
                  className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:border-zinc-400 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* PDF / Content */}
          <div className="flex-1 overflow-hidden">
            {docStatus.new === 'available' && (
              <iframe
                title={pdfDocs.new.title}
                src={`${pdfDocs.new.path}#page=1&view=FitH`}
                className="w-full h-full min-h-[600px]"
              />
            )}
            {docStatus.new === 'checking' && (
              <div className="w-full h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-zinc-500">
                  <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                  <p className="font-interface text-sm">Loading document...</p>
                </div>
              </div>
            )}
            {docStatus.new === 'missing' && (
              <div className="w-full h-96 flex flex-col items-center justify-center text-center p-6">
                <FileSearch className="w-8 h-8 text-zinc-400 mb-3" />
                <h3 className="font-display font-bold text-black mb-1">Document Not Found</h3>
                <p className="font-interface text-sm text-zinc-500 max-w-xs">
                  Place the PDF at <span className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{pdfDocs.new.path}</span>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />

      <Chatbot pdfSources={chatbotPdfSources} />
    </div>
  );
}
