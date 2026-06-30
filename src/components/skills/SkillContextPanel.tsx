import { useState, useCallback } from "react";
import { Bot, ChevronDown, ChevronUp, Loader2, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BASE_API_URL } from "@/services/api";

type Skill = "designer" | "marketer" | "sales" | "finance" | "operations" | "hr";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  skill: Skill;
  event: string;
  context?: Record<string, string | number>;
  defaultPrompt?: string;
  title?: string;
  collapsed?: boolean;
}

const SKILL_META: Record<Skill, { label: string; color: string; badge: string }> = {
  designer:   { label: "Designer AI",    color: "bg-purple-50 border-purple-200 dark:bg-purple-900/20",  badge: "bg-purple-100 text-purple-700" },
  marketer:   { label: "Marketer AI",    color: "bg-orange-50 border-orange-200 dark:bg-orange-900/20", badge: "bg-orange-100 text-orange-700" },
  sales:      { label: "Sales AI",       color: "bg-green-50 border-green-200 dark:bg-green-900/20",    badge: "bg-green-100 text-green-700" },
  finance:    { label: "Finance AI",     color: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20", badge: "bg-emerald-100 text-emerald-700" },
  operations: { label: "Operations AI",  color: "bg-slate-50 border-slate-200 dark:bg-slate-800",       badge: "bg-slate-100 text-slate-700" },
  hr:         { label: "HR AI",          color: "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20", badge: "bg-indigo-100 text-indigo-700" },
};

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function callSkillTrigger(skill: Skill, event: string, context: Record<string, string | number>) {
  const res = await fetch(`${BASE_API_URL}/api/coach/skill-trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ skill, event, context }),
  });
  if (!res.ok) throw new Error("skill trigger failed");
  const data = await res.json();
  return data.advice as string;
}

async function callWebChat(message: string, history: Message[]) {
  const res = await fetch(`${BASE_API_URL}/api/coach/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ message, history: history.slice(-8) }),
  });
  if (!res.ok) throw new Error("chat failed");
  const data = await res.json();
  return data.reply as string;
}

export function SkillContextPanel({ skill, event, context = {}, defaultPrompt, title, collapsed: initCollapsed = false }: Props) {
  const meta = SKILL_META[skill];
  const [collapsed, setCollapsed] = useState(initCollapsed);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const triggerSkill = useCallback(async () => {
    if (triggered || loading) return;
    setLoading(true);
    try {
      const advice = await callSkillTrigger(skill, event, context);
      setMessages([{ role: "assistant", content: advice }]);
      setTriggered(true);
    } catch {
      setMessages([{ role: "assistant", content: `Your ${meta.label} is here. Ask me anything about this situation.` }]);
      setTriggered(true);
    } finally {
      setLoading(false);
    }
  }, [skill, event, context, triggered, loading, meta.label]);

  const handleOpen = () => {
    setCollapsed(false);
    if (!triggered) triggerSkill();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await callWebChat(text, next);
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, I couldn't get a response. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={handleOpen}
        className={`w-full text-left rounded-lg border p-3 flex items-center gap-3 transition-all hover:shadow-sm ${meta.color}`}
      >
        <Sparkles className="h-4 w-4 text-current opacity-60 flex-shrink-0" />
        <span className="text-sm font-medium flex-1">{title ?? meta.label} — tap to activate</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }

  return (
    <Card className={`border ${meta.color}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {title ?? meta.label}
            <Badge className={`text-xs ${meta.badge}`}>{skill.toUpperCase()}</Badge>
          </CardTitle>
          <button
            onClick={() => setCollapsed(true)}
            className="opacity-40 hover:opacity-100"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Messages */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {messages.length === 0 && loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              {meta.label} is analysing the situation...
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`rounded p-2 text-xs ${m.role === "assistant" ? "bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 self-end"}`}>
              {m.role === "assistant" && <span className="font-semibold text-current opacity-70">{meta.label}: </span>}
              {m.content}
            </div>
          ))}
          {loading && messages.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" /> thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder={defaultPrompt ?? `Ask ${meta.label} anything...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            className="text-xs h-8"
          />
          <Button size="sm" className="h-8 w-8 p-0" onClick={sendMessage} disabled={loading || !input.trim()}>
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
