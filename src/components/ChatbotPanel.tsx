import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

// Initialize the Gemini SDK
// Note: Exposing API keys in the frontend is fine for school prototypes, 
// but for production, this call should be moved to your Express backend.
const MAX_TOTAL_CONTEXT_CHARS = 120000;
const MAX_PAGES_PER_DOCUMENT = 120;

type Message = {
  role: 'user' | 'model';
  text: string;
};

type ChatBotProps = {
  pdfSources: {
    title: string;
    path: string;
  }[];
};

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function getAiClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

async function readPdfText(getDocumentFn: (params: { url: string }) => any, title: string, path: string) {
  const loadingTask = getDocumentFn({ url: path });
  const pdf = await loadingTask.promise;
  const pageCount = Math.min(pdf.numPages, MAX_PAGES_PER_DOCUMENT);

  let charsUsed = 0;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const rawPageText = textContent.items
      .map((item: { str?: string }) => item.str ?? '')
      .join(' ');
    const pageText = normalizeText(rawPageText);

    if (!pageText) {
      continue;
    }

    const entry = `Page ${pageNumber}: ${pageText}`;
    charsUsed += entry.length;
    pages.push(entry);

    if (charsUsed >= MAX_TOTAL_CONTEXT_CHARS / 2) {
      break;
    }
  }

  return [
    `### DOCUMENT: ${title}`,
    pages.join('\n'),
  ].join('\n');
}

// Context is extracted directly from the actual PDF files shown on Compare.
export default function ChatBot({ pdfSources }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am your Constitutional Guide. Ask me anything about the differences between the 1987 Constitution and the proposed Federal Constitution.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextStatus, setContextStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pdfContext, setPdfContext] = useState('');
  const [contextError, setContextError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let isCancelled = false;

    const loadContext = async () => {
      setContextStatus('loading');
      setContextError(null);

      try {
        const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
          import('pdfjs-dist/build/pdf.mjs'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ]);

        GlobalWorkerOptions.workerSrc = workerModule.default;

        const chunks = await Promise.all(
          pdfSources.map((source) => readPdfText(getDocument, source.title, source.path))
        );

        const merged = chunks.join('\n\n---\n\n').slice(0, MAX_TOTAL_CONTEXT_CHARS);

        if (!merged.trim()) {
          throw new Error('No extractable text found in the provided PDF files.');
        }

        if (!isCancelled) {
          setPdfContext(merged);
          setContextStatus('ready');
        }
      } catch (error) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : 'Unable to parse PDF files.';
          setPdfContext('');
          setContextError(message);
          setContextStatus('error');
        }
      }
    };

    loadContext();

    return () => {
      isCancelled = true;
    };
  }, [pdfSources]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();

    if (contextStatus === 'loading') {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: userText },
        { role: 'model', text: 'I am still reading the PDF documents. Please try again in a few seconds.' },
      ]);
      setInput('');
      return;
    }

    if (contextStatus === 'error') {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: userText },
        { role: 'model', text: `I could not load the PDF comparison context yet: ${contextError ?? 'unknown error'}` },
      ]);
      setInput('');
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const ai = getAiClient();
      if (!ai) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: 'AI is not configured yet. Add VITE_GEMINI_API_KEY in your deployment environment to enable chatbot answers.',
          },
        ]);
        return;
      }

      // Prompt includes strict guardrails and an app-provided reference context.
      const systemInstruction = `You are "GovAI", a neutral and highly knowledgeable constitutional tutor for university students. 

YOUR MISSION:
Help students understand the differences between the 1987 Philippine Constitution and the proposed New Federal Constitution based ONLY on the provided reference text.

STRICT RULES:
1. SOURCE OF TRUTH: You must ONLY use the provided reference text below. Do not use outside knowledge. 
2. GUARDRAIL: If a student asks a question unrelated to the constitutions (e.g., math, coding, general trivia), politely decline and remind them you are here to discuss the plebiscite.
3. NO HALLUCINATIONS: If the answer is not in the text, say "The provided text does not mention that."

FORMATTING RULES:
- NEVER output a "wall of text".
- ALWAYS use bullet points for comparisons or lists.
- ALWAYS **bold** key legal terms (e.g., **exclusive economic zone**, **Federal Electoral Commission**).
- Keep your answers concise, structured, and easy for a student to skim.

REFERENCE TEXT:
${pdfContext}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userText,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1, // Lowered temperature to 0.1 for highly factual, strict adherence to the text
        }
      });

      setMessages((prev) => [...prev, { role: 'model', text: response.text || 'Sorry, I could not generate a response.' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-navy-800 border border-navy-700 rounded-lg shadow-2xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right">
          <div className="bg-navy-900 border-b border-navy-700 p-4 flex justify-between items-center text-parchment">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gold" />
              <h3 className="font-display text-lg text-gold-light">CongressAI Guide</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-muted hover:text-parchment">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 h-80 overflow-y-auto flex flex-col gap-3 bg-navy-800/50">
            {contextStatus !== 'ready' && (
              <div className="text-xs text-parchment-muted border border-navy-700 rounded-md px-3 py-2 bg-navy-900/60">
                {contextStatus === 'loading'
                  ? 'Preparing AI context from the PDF files...'
                  : `PDF context unavailable: ${contextError}`}
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-gold/20 text-parchment self-end rounded-br-none border border-gold/30' 
                  : 'bg-navy-700 text-parchment-muted self-start rounded-bl-none border border-navy-600'
              }`}>
                {msg.role === 'model' ? (
                  <div className="prose prose-invert prose-sm max-w-none text-parchment-muted marker:text-gold">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && (
              <div className="bg-navy-700 text-parchment-muted self-start rounded-lg rounded-bl-none p-3 max-w-[85%] border border-navy-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gold" /> Let me check...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-navy-700 bg-navy-900 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about the constitutions..."
              className="flex-1 bg-navy-800 border border-navy-700 rounded-md px-3 py-2 text-sm text-parchment focus:outline-none focus:border-gold/50"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gold/10 hover:bg-gold/20 text-gold p-2 rounded-md disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gold hover:bg-gold-light text-navy-900 p-4 rounded-full shadow-lg transition-transform hover:scale-105 float-right"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}