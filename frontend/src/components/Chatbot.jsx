import { useMemo, useState } from 'react';

const faqPairs = [
  {
    q: 'check in',
    a: 'Check-in is available from 12:00 PM. Early check-in depends on room readiness; contact the admin desk.'
  },
  {
    q: 'check out',
    a: 'Standard checkout is 10:00 AM. For late checkout, please request through the admin dashboard or contact staff.'
  },
  {
    q: 'room types',
    a: 'We offer single, double, triple, and quad rooms with AC and Non-AC options across floors 1-5.'
  },
  {
    q: 'food',
    a: 'Food plans can be managed under Food Services; you can subscribe or pause meals from your resident dashboard.'
  },
  {
    q: 'housekeeping',
    a: 'Housekeeping can be requested from the Resident dashboard > Housekeeping. Pick a date/time and service type.'
  },
  {
    q: 'complaint',
    a: 'Raise complaints from Resident > Complaints. Staff get assigned automatically based on department.'
  },
  {
    q: 'contact',
    a: 'You can call +91 4463 222333 or use the contact section on the landing page to reach the admin team.'
  },
  {
    q: 'parking',
    a: 'Limited two-wheeler parking is available. Four-wheeler parking is on request; please ask admin.'
  },
  {
    q: 'internet',
    a: 'High-speed Wi-Fi is provided on all floors. Ask admin for access details if you face issues.'
  }
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [
    { from: 'bot', text: 'Hi! I can answer questions about RSM Lakshmini Residency. Ask about rooms, check-in/out, food, housekeeping, or complaints.' }
  ]);

  const matcher = useMemo(() => {
    return faqPairs.map((pair) => ({
      ...pair,
      tokens: pair.q.toLowerCase().split(/\s+/)
    }));
  }, []);

  const findAnswer = (text) => {
    const normalized = text.toLowerCase();
    for (const m of matcher) {
      const hit = m.tokens.every((t) => normalized.includes(t));
      if (hit) return m.a;
    }
    return 'I can help with residency topics like rooms, check-in/out, food plans, housekeeping, and complaints. Please ask about those.';
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { from: 'user', text: trimmed };
    const botMsg = { from: 'bot', text: findAnswer(trimmed) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-80 max-w-[90vw] bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Residency Chat</p>
              <p className="text-xs text-slate-200">Answers are limited to RSM Lakshmini Residency</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white text-lg"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-2 text-sm text-slate-800">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl max-w-[90%] ${
                    m.from === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 bg-white px-3 py-2 flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              className="flex-1 resize-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ask about rooms, check-in/out, food, housekeeping..."
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center text-xl hover:bg-indigo-700"
        aria-label="Open residency chatbot"
      >
        💬
      </button>
    </div>
  );
};

export default Chatbot;