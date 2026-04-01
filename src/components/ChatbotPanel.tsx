import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

// Initialize the Gemini SDK
// Note: Exposing API keys in the frontend is fine for school prototypes, 
// but for production, this call should be moved to your Express backend.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

type Message = {
  role: 'user' | 'model';
  text: string;
};

// We pass the articles as context so the AI knows exactly what it's talking about
export default function ChatBot({ articles }: { articles: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am your Constitutional Guide. Ask me anything about the differences between the 1987 Constitution and the proposed Federal Constitution.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // 1. IMPROVED CONTEXT FORMATTING
      // We format the raw data into a clean, markdown-like structure 
      // so the AI parses the exact differences more easily.
      const formattedContext = articles.map(a => 
        `### ARTICLE: ${a.title}\n` +
        `**1987 Constitution:**\n${a.old.map(text => `- ${text}`).join('\n')}\n` +
        `**Proposed Federal Constitution:**\n${a.new.map(text => `- ${text}`).join('\n')}\n`
      ).join('\n\n---\n\n');

      // 2. IMPROVED SYSTEM PROMPT (The "Brain" and Guardrails)
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
${formattedContext}`;

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