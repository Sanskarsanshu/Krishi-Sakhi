import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const GROQ_API_KEY   = import.meta.env.VITE_GROQ_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are Krishi-Sakhi, a friendly and knowledgeable AI assistant for Indian farmers.
You help farmers with:
- Crop disease and pest detection advice
- Government agricultural schemes and subsidies
- Market prices and selling strategies
- Weather and irrigation guidance
- Soil health and fertilizer recommendations
- Financial planning for farming
- General farming best practices

Always respond in a warm, simple, and supportive tone. If a farmer asks in Hindi or mixed Hindi-English, respond in a way they can understand.
Keep responses concise (2-4 sentences) unless a detailed answer is genuinely needed.
Always stay focused on farming and agriculture topics. If asked unrelated questions, gently redirect to farming topics.`;

// ─── Groq (Primary — 14,400 req/day free) ───────────────────────────────────
const callGroq = async (messages) => {
  if (!GROQ_API_KEY) throw new Error('NO_GROQ_KEY');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // 14,400 req/day free
      messages,
      max_tokens: 450,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return text;
};

// ─── Gemini (Fallback — 1,500 req/day free) ──────────────────────────────────
const callGemini = async (conversationHistory) => {
  if (!GEMINI_API_KEY) throw new Error('NO_GEMINI_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversationHistory,
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
};

// ─── Smart offline fallback ──────────────────────────────────────────────────
const OFFLINE_RESPONSES = [
  {
    keywords: ['pest', 'insect', 'bug', 'kida', 'aphid', 'whitefly', 'locust'],
    response: `🌿 For pest control:\n\n1. Inspect crops early morning when pests are most visible.\n2. Use neem oil spray (5 ml/litre water) as a natural pesticide.\n3. For severe infestations, contact your local Krishi Vigyan Kendra (KVK).\n4. Encourage natural predators like ladybugs by avoiding broad-spectrum chemicals.`,
  },
  {
    keywords: ['disease', 'blight', 'fungus', 'rot', 'yellow', 'rust', 'wilt'],
    response: `🍃 Common crop disease tips:\n\n1. Remove and destroy infected plant parts immediately.\n2. Use Bordeaux mixture for fungal diseases.\n3. Ensure proper plant spacing for air circulation.\n4. Water at the base — keep leaves dry. Visit your nearest agriculture office for treatment.`,
  },
  {
    keywords: ['scheme', 'subsidy', 'yojana', 'government', 'pm kisan', 'loan', 'insurance', 'fasal bima'],
    response: `💰 Key government schemes:\n\n• **PM-KISAN** — ₹6,000/year direct to farmer families\n• **PM Fasal Bima Yojana** — crop insurance with low premiums\n• **Kisan Credit Card** — loans at 4% interest\n• **PM Krishi Sinchayee Yojana** — irrigation support\n\nVisit pmkisan.gov.in or call 1800-180-1111 (free).`,
  },
  {
    keywords: ['price', 'mandi', 'market', 'sell', 'rate', 'bhav', 'crop price'],
    response: `📈 To get best crop prices:\n\n1. Check MSP at agmarknet.gov.in.\n2. Use e-NAM (enam.gov.in) to sell at online mandis.\n3. Form FPOs to negotiate better rates collectively.\n4. Use cold storage to sell when prices are higher.`,
  },
  {
    keywords: ['soil', 'fertilizer', 'urea', 'dap', 'npk', 'compost', 'organic'],
    response: `🌱 Soil health tips:\n\n1. Get a free soil test at your KVK — it tells you exactly what's missing.\n2. Use compost/vermicompost to improve organic matter.\n3. Follow recommended NPK ratio — over-fertilizing wastes money.\n4. Practise crop rotation to naturally restore nutrients.`,
  },
  {
    keywords: ['water', 'irrigation', 'drip', 'sprinkler', 'rain', 'drought'],
    response: `💧 Water management:\n\n1. Drip irrigation saves 40-60% water vs flood irrigation.\n2. Water crops early morning or evening to reduce evaporation.\n3. Mulching retains soil moisture longer.\n4. PM Krishi Sinchayee Yojana gives subsidies for drip/sprinkler systems.`,
  },
  {
    keywords: ['weather', 'forecast', 'barish', 'temperature', 'frost', 'heat'],
    response: `☁️ Weather tips:\n\n1. Use IMD's Meghdoot app for crop-specific forecasts.\n2. Check the 10-day forecast before sowing.\n3. Use shade nets during extreme heat for vegetable crops.\n4. Mulch young plants during cold nights to prevent frost damage.`,
  },
  {
    keywords: ['wheat', 'rice', 'paddy', 'gehu', 'dhaan', 'corn', 'maize'],
    response: `🌾 Wheat/paddy tips:\n\n1. Use certified seeds approved for your region.\n2. Wheat sowing: Oct 25–Nov 10; paddy transplanting varies by state.\n3. Watch for stem borer and brown planthopper in paddy.\n4. Wheat needs 4-5 irrigations; paddy needs 5cm standing water during growth.`,
  },
  {
    keywords: ['finance', 'loan', 'credit', 'money', 'paisa', 'invest', 'kharcha'],
    response: `💵 Farm financial planning:\n\n1. Keep a simple diary of all farming expenses.\n2. Kisan Credit Card gives up to ₹3 lakh credit at 4% interest.\n3. PMFBY crop insurance premium is only 1.5-2% for Rabi crops.\n4. Join an FPO for bulk buying discounts and better market rates.`,
  },
];

const getOfflineFallback = (userMessage) => {
  const lower = userMessage.toLowerCase();
  for (const item of OFFLINE_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) return item.response;
  }
  return `🌾 Our AI is temporarily unavailable. Here are some helpful resources:\n\n• **Pest/Disease help**: Contact your local KVK\n• **Government Schemes**: pmkisan.gov.in or call 1800-180-1111 (free)\n• **Market Prices**: agmarknet.gov.in\n• **Weather Forecast**: meghdoot.imd.gov.in\n\nPlease try sending your message again!`;
};

// ─── Main component ───────────────────────────────────────────────────────────
const Chatbot = ({ onShowToast }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Jai Kisan! 🌾 I'm Krishi-Sakhi, your AI farming assistant. Ask me anything about crops, pests, government schemes, market prices, or farming tips!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Build messages array for Groq (OpenAI format)
  const buildGroqMessages = (history, newUserText) => {
    const msgs = [{ role: 'system', content: SYSTEM_PROMPT }];
    history
      .filter((m) => m.type === 'user' || m.type === 'bot')
      .slice(-8)
      .forEach((m) => msgs.push({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text }));
    msgs.push({ role: 'user', content: newUserText });
    return msgs;
  };

  // Build contents array for Gemini format
  const buildGeminiContents = (history, newUserText) => {
    const contents = history
      .filter((m) => m.type === 'user' || m.type === 'bot')
      .slice(-8)
      .map((m) => ({ role: m.type === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
    contents.push({ role: 'user', parts: [{ text: newUserText }] });
    return contents;
  };

  const getAIResponse = async (userText, history) => {
    // 1️⃣ Try Groq first
    if (GROQ_API_KEY) {
      try {
        return await callGroq(buildGroqMessages(history, userText));
      } catch (err) {
        console.warn('Groq failed, trying Gemini:', err.message);
      }
    }

    // 2️⃣ Try Gemini as fallback
    if (GEMINI_API_KEY) {
      try {
        return await callGemini(buildGeminiContents(history, userText));
      } catch (err) {
        console.warn('Gemini failed:', err.message);
      }
    }

    // 3️⃣ Both failed — return null to trigger offline fallback
    return null;
  };

  const sendMessage = async (userText, historySnapshot) => {
    setIsTyping(true);
    try {
      const aiText = await getAIResponse(userText, historySnapshot);

      if (aiText) {
        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: aiText, timestamp: new Date() },
        ]);
      } else {
        // Both APIs down — show topic-specific offline answer
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: getOfflineFallback(userText),
            timestamp: new Date(),
            isOffline: true,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: getOfflineFallback(userText),
          timestamp: new Date(),
          isOffline: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const historySnapshot = [...messages];
    setMessages((prev) => [...prev, { type: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    sendMessage(userText, historySnapshot);
  };

  const quickReplies = [
    '🌿 Pest detection help',
    '💰 Government schemes',
    '📈 Current market prices',
    '🌱 Soil health tips',
    '💧 Irrigation advice',
  ];

  const handleQuickReply = (reply) => {
    setInput(reply.replace(/^[^\w\s]+\s*/, ''));
    inputRef.current?.focus();
  };

  const dark = theme === 'dark';

  return (
    <div className={`min-h-full p-4 sm:p-6 transition-colors duration-300 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto max-w-4xl h-full">
        <div
          className={`rounded-xl shadow-2xl transition-colors duration-300 ${
            dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border flex flex-col`}
          style={{ height: 'calc(100vh - 140px)' }}
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-4 sm:p-5 rounded-t-xl flex items-center gap-4 shadow-md">
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0 text-xl">
              🌾
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-white text-lg font-bold leading-tight">Krishi-Sakhi AI Assistant</h1>
              <p className="text-emerald-100 text-xs flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse inline-block" />
                Powered by Groq · Always here to help
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              <span className="text-white text-xs font-medium">Llama 3.1</span>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm mr-2 flex-shrink-0 self-end mb-1">
                    🌾
                  </div>
                )}
                <div
                  className={`max-w-[78%] sm:max-w-[72%] rounded-2xl p-3 shadow-sm ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-none'
                      : msg.isOffline
                      ? dark
                        ? 'bg-amber-900/30 text-amber-100 rounded-bl-none border border-amber-700'
                        : 'bg-amber-50 text-amber-900 rounded-bl-none border border-amber-200'
                      : dark
                      ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.isOffline && (
                    <p className="text-[10px] mt-1.5 opacity-60 italic">📡 Offline knowledge response</p>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-emerald-100' : dark ? 'text-gray-400' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm ml-2 flex-shrink-0 self-end mb-1">
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm mr-2 flex-shrink-0 self-end mb-1">
                  🌾
                </div>
                <div className={`rounded-2xl rounded-bl-none p-3 shadow-sm ${dark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="flex gap-1 items-center h-5">
                    {[0, 160, 320].map((delay) => (
                      <span
                        key={delay}
                        className="w-2 h-2 rounded-full animate-bounce bg-gray-400"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Replies ── */}
          {messages.length === 1 && !isTyping && (
            <div className={`px-4 pb-3 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <p className={`text-xs mb-2 font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(reply)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                      dark
                        ? 'border-emerald-700 text-emerald-300 hover:bg-emerald-900/40'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input ── */}
          <form
            onSubmit={handleSend}
            className={`p-3 sm:p-4 border-t ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-b-xl`}
          >
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isTyping ? 'Thinking...' : 'Ask about crops, pests, schemes...'}
                disabled={isTyping}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60 border ${
                  dark
                    ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                    : 'bg-gray-100 text-gray-800 placeholder-gray-500 border-gray-200'
                }`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className={`text-center text-[10px] mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Powered by Groq (Llama 3.1) · Gemini fallback · Responses may not always be accurate
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
