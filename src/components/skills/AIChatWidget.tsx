/**
 * AIChatWidget — persistent AI coach chat embedded anywhere in the dashboard.
 * Loads history from DB on mount. Every message is saved server-side.
 */
import { useState, useEffect, useRef } from "react";
import { Bot, Send, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_API_URL } from "@/services/api";

interface Message { role: "user" | "assistant"; content: string; created_at?: string; }

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function loadHistory(): Promise<Message[]> {
  try {
    const res = await fetch(`${BASE_API_URL}/api/coach/history`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.history ?? [];
  } catch { return []; }
}

async function sendChat(message: string): Promise<string> {
  const res = await fetch(`${BASE_API_URL}/api/coach/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ message, history: [] }), // backend loads from DB
  });
  if (!res.ok) throw new Error("Chat failed");
  const data = await res.json();
  return data.reply as string;
}

interface Props {
  floating?: boolean;
  placeholder?: string;
  initialMessage?: string;
}

export function AIChatWidget({ floating = false, placeholder, initialMessage }: Props) {
  const [open, setOpen] = useState(!floating);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !historyLoaded) {
      loadHistory().then(h => {
        setMessages(h);
        setHistoryLoaded(true);
      });
    }
  }, [open, historyLoaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial message once on first open if provided
  useEffect(() => {
    if (open && historyLoaded && initialMessage && messages.length === 0) {
      handleSend(initialMessage);
    }
  }, [open, historyLoaded]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const reply = await sendChat(msg);
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, couldn't get a response. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (floating && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Bot className="h-5 w-5" />
        <span className="text-sm font-semibold">AI Coach</span>
        <Sparkles className="h-4 w-4 text-yellow-300" />
      </button>
    );
  }

  return (
    <div className={floating
      ? "fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col"
      : "flex flex-col h-full min-h-[400px]"
    }>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <Bot className="h-5 w-5" />
          <span className="font-semibold text-sm">BamiHustle AI Coach</span>
          <span className="text-xs opacity-70">remembers everything</span>
        </div>
        {floating && (
          <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: floating ? "380px" : "500px" }}>
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <Bot className="h-10 w-10 mx-auto text-blue-300 mb-3" />
            <p className="text-sm text-slate-500">Your AI Coach knows your business.<br />Ask me anything.</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {["What should I focus on today?", "How do I fill my vacant units?", "My tenant is overdue, what do I do?"].map(q => (
                <button key={q} onClick={() => handleSend(q)}
                  className="text-xs bg-blue-50 text-blue-700 rounded-full px-3 py-1 hover:bg-blue-100">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder={placeholder ?? "Ask your AI coach..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="text-sm"
        />
        <Button size="icon" onClick={() => handleSend()} disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
