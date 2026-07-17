/**
 * Head Office — the owner's boardroom chat with the whole AI agent team.
 * Streams replies from POST /api/head-office/threads/{id}/chat (SSE), grounded
 * in live business data and what the agents have flagged.
 */
import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Building2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_API_URL } from "@/services/api";
import GoogleKnowledgePanel from "./GoogleKnowledgePanel";

interface Message { role: "user" | "assistant"; content: string; }
interface TeamMember { key: string; name: string; emoji: string; description: string; businessLine?: string; }

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}
function authHeaders(json = true): Record<string, string> {
  const h: Record<string, string> = { Authorization: `Bearer ${getToken()}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

// The AI replies in light Markdown (**bold** for names/labels). We don't want a
// whole Markdown library for this — just turn **bold** into real bold. Line
// breaks and bullets are preserved by `whitespace-pre-wrap` on the container.
function renderRich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

const SUGGESTIONS = [
  "Give me a quick boardroom read — how are we doing?",
  "Which tenants are overdue and what should we do?",
  "Any meters low on balance or offline?",
  "What should each department focus on this week?",
];

export default function HeadOfficePage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Distinct business lines the team covers, for the chips row.
  const businessLines = Array.from(
    new Set(team.map(t => t.businessLine).filter(Boolean) as string[])
  );

  // Task the whole team to re-scan, then drop a system note into the chat.
  const runTeam = async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/head-office/run-team`, {
        method: "POST", headers: authHeaders(),
      });
      const data = res.ok ? await res.json() : null;
      const ran = data?.ran ?? 0;
      const depts = (data?.byDepartment ?? [])
        .map((d: any) => `${d.name} (${d.items})`).join(", ");
      setMessages(m => [...m, {
        role: "assistant",
        content: `🔄 Team re-scan complete — ${ran} fresh item(s) across the business.` +
          (depts ? `\nDepartments reporting: ${depts}.` : "") +
          `\n\nAsk me anything and I'll answer against these updated numbers.`,
      }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Couldn't run the team just now — try again." }]);
    } finally {
      setRunning(false);
    }
  };

  // Load the roster + get-or-create a thread on mount.
  useEffect(() => {
    (async () => {
      try {
        const t = await fetch(`${BASE_API_URL}/api/head-office/team`, { headers: authHeaders(false) });
        if (t.ok) setTeam((await t.json()).team ?? []);
      } catch { /* roster is cosmetic */ }
      try {
        const list = await fetch(`${BASE_API_URL}/api/head-office/threads`, { headers: authHeaders(false) });
        const data = list.ok ? await list.json() : { data: [] };
        let tid = data.data?.[0]?.id;
        if (!tid) {
          const created = await fetch(`${BASE_API_URL}/api/head-office/threads`, { method: "POST", headers: authHeaders() });
          tid = (await created.json())?.data?.id;
        } else {
          const msgs = await fetch(`${BASE_API_URL}/api/head-office/threads/${tid}/messages`, { headers: authHeaders(false) });
          if (msgs.ok) setMessages(((await msgs.json()).data ?? []).map((m: any) => ({ role: m.role, content: m.content })));
        }
        setThreadId(tid);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || !threadId) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/head-office/threads/${threadId}/chat`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ message: msg }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const p = JSON.parse(payload);
            if (p.status) {
              // Transient tool-progress line ("Checking the inbox…") — replaced
              // by the real answer when the first delta arrives.
              setMessages(m => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: `⚙ ${p.status}` };
                return copy;
              });
            } else if (p.delta) {
              setMessages(m => {
                const copy = [...m];
                const prev = copy[copy.length - 1].content;
                const base = prev.startsWith("⚙ ") ? "" : prev;
                copy[copy.length - 1] = { role: "assistant", content: base + p.delta };
                return copy;
              });
            } else if (p.error) {
              setMessages(m => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: "Sorry — the Head Office couldn't respond. Try again." };
                return copy;
              });
            }
          } catch { /* skip malformed frame */ }
        }
      }
    } catch {
      setMessages(m => {
        const copy = [...m];
        if (copy.length && copy[copy.length - 1].role === "assistant" && !copy[copy.length - 1].content) {
          copy[copy.length - 1] = { role: "assistant", content: "Sorry — couldn't reach the Head Office. Try again." };
        }
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh] max-w-4xl mx-auto">
      {/* Header + roster */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold">Head Office</h1>
          <span className="hidden sm:inline text-xs text-muted-foreground">your boardroom with the whole AI team</span>
          <Button size="sm" variant="outline" onClick={runTeam} disabled={running}
            className="ml-auto flex-shrink-0 gap-1.5">
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {running ? "Running…" : "Run the team"}
          </Button>
        </div>
        {businessLines.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">Business lines:</span>
            {businessLines.map(line => (
              <span key={line}
                className="text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 font-medium">
                {line}
              </span>
            ))}
          </div>
        )}
        {team.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {team.map(t => (
              <span key={t.key} title={`${t.description}${t.businessLine ? ` — ${t.businessLine}` : ""}`}
                className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                {t.emoji} {t.name.split(" · ").pop()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Google Drive & Gmail knowledge — powers document-grounded answers */}
      <div className="mb-3">
        <GoogleKnowledgePanel />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border bg-white dark:bg-slate-900 p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <Sparkles className="h-9 w-9 mx-auto text-blue-300 mb-3" />
            <p className="text-sm text-slate-500">Ask the whole team anything — they answer with your real numbers.</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(q => (
                <button key={q} onClick={() => handleSend(q)}
                  className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 hover:bg-blue-100">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
            }`}>
              {m.content
                ? (m.role === "assistant" ? renderRich(m.content) : m.content)
                : (loading && i === messages.length - 1 ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 flex gap-2">
        <Input
          placeholder={threadId ? "Ask your Head Office…" : "Setting up the boardroom…"}
          value={input}
          disabled={!threadId}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <Button size="icon" onClick={() => handleSend()} disabled={loading || !input.trim() || !threadId}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
