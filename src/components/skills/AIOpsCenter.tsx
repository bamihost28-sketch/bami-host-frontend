import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  AgentInfo,
  AutopilotAction,
  useGetAgentsQuery,
  useGetQueueQuery,
  useGenerateActionsMutation,
} from "@/services/autopilotApi";
import { Loader, Radio, RefreshCw, Megaphone, Undo2 } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════════
   BAMIHOST TOWER — a living 3-storey cutaway office.
   Each AI agent is a character at a desk on their floor: typing with a glowing
   monitor when busy, standing by when idle. When the CEO calls an all-hands,
   everyone leaves their desk and walks up to the boardroom. All hand-drawn in
   CSS/SVG, driven by the real autopilot roster + action queue, with a built-in
   fallback roster so the building is always populated.
════════════════════════════════════════════════════════════════════════════ */

const SHIRT: Record<string, string> = {
  gm: "#EAB308", designer: "#F5A524", marketer: "#FF6B9D", sales: "#4C8DFF",
  finance: "#2FBF71", operations: "#14B8C4", hr: "#A78BFA", retention: "#FB923C",
  collections: "#EF4444", analyst: "#6366F1", compliance: "#64748B", records: "#8B5E3C",
};
const SKINS = ["#F1C27D", "#E0AC69", "#C68642", "#8D5524"];
const HAIRS = ["#1A1512", "#2B2119", "#3A2E22", "#0F0D0B"];

// Desk position (% of the building stage) + which agent sits where, grouped by
// floor: 3 = strategy, 2 = growth, 1 = operations. Order drives skin variety.
type Seat = { key: string; name: string; role: string; emoji: string; x: number; y: number };
const ROSTER: Seat[] = [
  { key: "gm",          name: "Gbenga", role: "GM",          emoji: "🧭", x: 45, y: 31 },
  { key: "analyst",     name: "Uche",   role: "Analyst",     emoji: "📊", x: 13, y: 31 },
  { key: "compliance",  name: "Sade",   role: "Compliance",  emoji: "🛡️", x: 29, y: 31 },
  { key: "designer",    name: "Ade",    role: "Designer",    emoji: "🎨", x: 13, y: 60 },
  { key: "marketer",    name: "Chidi",  role: "Marketer",    emoji: "📣", x: 30, y: 60 },
  { key: "sales",       name: "Bola",   role: "Sales",       emoji: "🤝", x: 47, y: 60 },
  { key: "records",     name: "Remi",   role: "Records",     emoji: "🗂️", x: 64, y: 60 },
  { key: "finance",     name: "Ngozi",  role: "Finance",     emoji: "💰", x: 12, y: 89 },
  { key: "collections", name: "Kemi",   role: "Collections", emoji: "📞", x: 27, y: 89 },
  { key: "operations",  name: "Emeka",  role: "Operations",  emoji: "⚙️", x: 42, y: 89 },
  { key: "hr",          name: "Funke",  role: "HR",          emoji: "👥", x: 57, y: 89 },
  { key: "retention",   name: "Tunde",  role: "Retention",   emoji: "💚", x: 72, y: 89 },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "for your approval", color: "#4C8DFF" },
  approved: { label: "approved", color: "#14B8C4" },
  executing: { label: "executing", color: "#F5A524" },
  done: { label: "delivered", color: "#2FBF71" },
  dismissed: { label: "set aside", color: "#9AA6B6" },
};

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Seats arranged in a ring around the boardroom table (top-right of floor 3).
function meetingRing(n: number): Array<[number, number]> {
  const cx = 78, cy = 26, rx = 13, ry = 8;
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / n) * 2 * Math.PI;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as [number, number];
  });
}

function CharSVG({ i, accent, big }: { i: number; accent: string; big?: boolean }) {
  const skin = SKINS[i % SKINS.length];
  const hair = HAIRS[(i * 3) % HAIRS.length];
  const s = big ? 1.15 : 1;
  return (
    <svg viewBox="0 0 80 104" width={70 * s} height={92 * s} aria-hidden="true">
      <g className="lg lgL"><rect x="33" y="70" width="6" height="24" rx="3" fill="#242A38" /></g>
      <g className="lg lgR"><rect x="41" y="70" width="6" height="24" rx="3" fill="#242A38" /></g>
      <path d="M16 78 Q16 48 40 48 Q64 48 64 78 Z" fill={accent} />
      <path d="M33 49 L40 56 L47 49 Z" fill="rgba(255,255,255,.35)" />
      <rect x="35" y="38" width="10" height="12" rx="4" fill={skin} />
      <circle cx="40" cy="28" r="14" fill={skin} />
      <path d="M26 27 Q26 9 40 9 Q54 9 54 27 Q54 20 48 17 Q44 15 40 15 Q30 15 26 27Z" fill={hair} />
      <ellipse className="aiops-eye" cx="34.5" cy="28" rx="1.9" ry="2.4" fill="#241C16" />
      <ellipse className="aiops-eye" cx="45.5" cy="28" rx="1.9" ry="2.4" fill="#241C16" />
      <path d="M35 34 Q40 38 45 34" stroke="#241C16" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <g className="hL"><circle cx="22" cy="74" r="4.5" fill={skin} /></g>
      <g className="hR"><circle cx="58" cy="74" r="4.5" fill={skin} /></g>
    </svg>
  );
}

export const AIOpsCenter = () => {
  const { toast } = useToast();
  const { data: agentsData } = useGetAgentsQuery(undefined, { pollingInterval: 20000 });
  const { data: queueData, isLoading: queueLoading } = useGetQueueQuery({ status: "all" }, { pollingInterval: 20000 });
  const [generateActions, { isLoading: isScanning }] = useGenerateActionsMutation();

  const [meeting, setMeeting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const live = useMemo(() => {
    const m: Record<string, AgentInfo> = {};
    (agentsData?.agents ?? []).forEach((a) => { m[a.key] = a; });
    return m;
  }, [agentsData]);

  // Merge the fixed roster (positions + friendly names) with live counts.
  const agents = useMemo(() => ROSTER.map((seat) => {
    const l = live[seat.key];
    return {
      ...seat,
      emoji: l?.emoji || seat.emoji,
      pending: l?.pending ?? 0,
      done: l?.done ?? 0,
      total: l?.total ?? 0,
      busy: (l?.pending ?? 0) > 0,
    };
  }), [live]);

  const queue = queueData?.data ?? [];
  const topByAgent = useMemo(() => {
    const map: Record<string, AutopilotAction> = {};
    for (const a of queue) if (!map[a.skill]) map[a.skill] = a;
    return map;
  }, [queue]);
  const gmBriefing = topByAgent["gm"];
  const wire = useMemo(() => (focus ? queue.filter((x) => x.skill === focus) : queue), [queue, focus]);
  const ring = useMemo(() => meetingRing(agents.length), [agents.length]);
  const waiting = agents.reduce((n, a) => n + a.pending, 0);
  const onTask = agents.filter((a) => a.busy).length;

  const callMeeting = () => {
    const next = !meeting;
    setMeeting(next);
    setMoving(true);
    window.setTimeout(() => setMoving(false), 2500);
    toast(next
      ? "Gbenga called an all-hands — everyone's heading to the boardroom"
      : "Meeting over — back to their desks");
  };

  const runScan = async () => {
    try {
      const res = await generateActions().unwrap();
      toast(`Success: The team did a round — ${res.generated} new move${res.generated === 1 ? "" : "s"}`);
    } catch (err: any) {
      toast(`Error: ${err?.data?.detail || "Team scan failed"}`);
    }
  };

  return (
    <div className="-m-3 sm:-m-6">
      <style>{`
        @keyframes aiops-bob{50%{transform:translateY(-3px)}}
        @keyframes aiops-stepA{0%,100%{transform:rotate(16deg)}50%{transform:rotate(-16deg)}}
        @keyframes aiops-stepB{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(16deg)}}
        @keyframes aiops-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
        @keyframes aiops-tA{50%{transform:translateY(-3px)}}
        @keyframes aiops-tB{0%,100%{transform:translateY(-3px)}50%{transform:translateY(0)}}
        @keyframes aiops-scr{to{transform:translateY(-50%)}}
        @keyframes aiops-pulse{50%{opacity:.5}}
        @keyframes aiops-idle{50%{transform:translateY(-2px)}}
        @keyframes aiops-wirein{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
        .aiops-ch{position:absolute;transform:translate(-50%,-100%);transition:left 2.3s cubic-bezier(.5,0,.3,1),top 2.3s cubic-bezier(.5,0,.3,1);will-change:left,top;cursor:pointer}
        .aiops-ch svg{display:block;position:relative}
        .aiops-ch .lg{transform-box:fill-box;transform-origin:top center}
        .aiops-ch.calm svg{animation:aiops-idle 4s ease-in-out infinite}
        .aiops-ch.walk svg{animation:aiops-bob .5s ease-in-out infinite}
        .aiops-ch.walk .lgL{animation:aiops-stepA .5s ease-in-out infinite}
        .aiops-ch.walk .lgR{animation:aiops-stepB .5s ease-in-out infinite}
        .aiops-eye{transform-box:fill-box;transform-origin:center;animation:aiops-blink 5s infinite}
        .aiops-ch.busy .hL{animation:aiops-tA .28s infinite}
        .aiops-ch.busy .hR{animation:aiops-tB .28s infinite}
        .aiops-sh{position:absolute;left:50%;bottom:-4px;transform:translateX(-50%);width:40px;height:9px;border-radius:50%;background:rgba(0,0,0,.22);filter:blur(2px)}
        .aiops-scroll{animation:aiops-scr 1.6s linear infinite}
        .aiops-board.live .aiops-sign{background:#EF5350;color:#fff;animation:aiops-pulse 1.4s infinite}
        .aiops-wire-item{animation:aiops-wirein .35s ease-out both}
        @media (prefers-reduced-motion: reduce){
          .aiops-ch{transition:none}
          .aiops-ch svg,.aiops-ch .lgL,.aiops-ch .lgR,.aiops-eye,.aiops-ch .hL,.aiops-ch .hR,
          .aiops-scroll,.aiops-board.live .aiops-sign,.aiops-wire-item{animation:none!important}
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 py-4" style={{ background: "#242A38" }}>
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] mb-1" style={{ color: "#F5A524" }}>BAMIHOST · HQ</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {meeting ? "All-hands · everyone in the boardroom" : "Head office · the team at work"}
          </h1>
          <p className="text-[11px] mt-1" style={{ color: "#9AA6B6" }}>
            {clock.toLocaleTimeString("en-GB")} · {onTask} on task · {waiting} need you
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={runScan} disabled={isScanning} variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 bg-transparent">
            {isScanning ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Send them around
          </Button>
          <Button onClick={callMeeting} className="border-0 font-semibold" style={{ background: "#F5A524", color: "#1a1206" }}>
            {meeting ? <><Undo2 className="h-4 w-4 mr-2" />Back to work</> : <><Megaphone className="h-4 w-4 mr-2" />Call all-hands</>}
          </Button>
        </div>
      </div>

      {/* ── The building ── */}
      <div className="relative overflow-hidden" style={{ height: 760, background: "linear-gradient(#0f1420,#182234)" }}>
        <div className="absolute" style={{ inset: "14px 20px", borderRadius: "14px 14px 6px 6px", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
          {/* roof */}
          <div className="absolute left-0 right-0 flex items-center justify-center"
               style={{ top: -2, height: 26, background: "linear-gradient(#3A4152,#2C3342)", borderRadius: "14px 14px 0 0" }}>
            <span className="font-mono font-extrabold text-[13px]" style={{ letterSpacing: "0.35em", color: "#EAD9B0" }}>BAMIHOST TOWER</span>
          </div>

          {/* three floors */}
          {[
            { top: 24, label: "3 · Strategy" },
            { top: 268, label: "2 · Growth" },
            { top: 512, label: "1 · Operations" },
          ].map((f, fi) => (
            <div key={fi} className="absolute left-0 right-0" style={{ top: f.top, height: 244, borderLeft: "3px solid #cbb184", borderRight: "3px solid #cbb184" }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(#E9E2D3,#E2D9C6)" }} />
              {/* windows */}
              <div className="absolute inset-x-0 flex justify-around px-16" style={{ top: 20 }}>
                {[0, 1, 2, 3, 4].map((w) => (
                  <div key={w} style={{ height: 34, width: 74, borderRadius: 5, background: "linear-gradient(160deg,#CBE7F1,#EAF7FB)", border: "2px solid #b79b6f" }} />
                ))}
              </div>
              <div className="absolute font-mono font-bold text-[10px]" style={{ left: 8, bottom: 26, letterSpacing: "0.12em", color: "#9c8a68", textTransform: "uppercase", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{f.label}</div>
              {/* floor slab with 3D lip */}
              <div className="absolute left-0 right-0 bottom-0" style={{ height: 20, background: "#B98C5A" }}>
                <div className="absolute left-0 right-0" style={{ top: -6, height: 6, background: "#CDA271" }} />
              </div>
            </div>
          ))}

          {/* stairwell */}
          <div className="absolute" style={{ left: 14, top: 24, bottom: 20, width: 52, background: "repeating-linear-gradient(180deg,#C9BCA3 0 14px,#bfb094 14px 16px)", opacity: 0.55, borderRight: "2px dashed #b3a488" }} />

          {/* boardroom */}
          <div className={`aiops-board absolute ${meeting ? "live" : ""}`} style={{ right: 12, top: 14, width: 360, height: 212, borderRadius: 10, background: "rgba(174,214,226,.30)", border: "2px solid #8FB6C2" }}>
            <div className="aiops-sign absolute font-mono font-extrabold text-[10px]" style={{ top: 8, left: 12, letterSpacing: "0.2em", padding: "4px 8px", borderRadius: 6, background: "#fff", color: "#6B7688" }}>
              {meeting ? "● MEETING IN PROGRESS" : "BOARDROOM"}
            </div>
            <div className="absolute" style={{ right: 14, top: 44, width: 64, height: 40, borderRadius: 5, background: "#111826", border: "2px solid #2b3342" }} />
            <div className="absolute" style={{ left: "50%", top: "56%", transform: "translate(-50%,-50%)", width: 250, height: 96, borderRadius: 60, background: "linear-gradient(#8a5a34,#6f4526)", boxShadow: "0 10px 20px rgba(0,0,0,.25),inset 0 2px 6px rgba(255,255,255,.15)" }} />
          </div>

          {/* desks (backdrop) */}
          {agents.map((a, i) => {
            const accent = SHIRT[a.key] || "#4C8DFF";
            const duty = a.busy ? { c: "#F5A524", t: "on a task" } : { c: "#9AA6B6", t: "standing by" };
            const bars = Array.from({ length: 6 });
            return (
              <div key={a.key} className="absolute" style={{ left: `${a.x}%`, top: `${a.y}%`, transform: "translate(-50%,-42%)", width: 78, zIndex: 2 }}>
                <div className="mx-auto" style={{ width: 52, marginBottom: -2 }}>
                  <div className="relative mx-auto overflow-hidden" style={{ height: 32, width: 52, borderRadius: 5, background: "#2A3140", border: "2px solid #242A38" }}>
                    <div className="absolute overflow-hidden" style={{ inset: 2, borderRadius: 3, background: a.busy ? `${accent}22` : "#141922" }}>
                      {a.busy && !meeting && (
                        <div className="aiops-scroll">
                          {[...bars, ...bars].map((_, k) => (
                            <div key={k} style={{ height: 3, margin: "2px 0 2px 3px", borderRadius: 9, width: `${40 + ((k * 37) % 55)}%`, background: accent, opacity: 0.85 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mx-auto" style={{ height: 7, width: 7, background: "#242A38" }} />
                  <div className="mx-auto" style={{ height: 3, width: 22, borderRadius: 9, background: "#242A38" }} />
                </div>
                <div style={{ height: 11, borderRadius: "6px 6px 0 0", background: "#C89B6A" }} />
                <div style={{ height: 7, borderRadius: "0 0 6px 6px", background: "#A97C4C" }} />
                <div className="text-center" style={{ marginTop: 5 }}>
                  <div className="text-[11px] font-bold" style={{ color: "#242A38" }}>{a.name}</div>
                  <div className="text-[9px] leading-tight" style={{ color: "#6B7688" }}>{a.role}</div>
                  <div className="font-mono font-bold text-[8px] mt-0.5 flex items-center justify-center gap-1" style={{ color: duty.c, textTransform: "uppercase" }}>
                    <span style={{ height: 7, width: 7, borderRadius: "50%", background: duty.c, display: "inline-block" }} />{duty.t}
                  </div>
                </div>
              </div>
            );
          })}

          {/* character layer */}
          <div className="absolute inset-0" style={{ zIndex: 5 }}>
            {agents.map((a, i) => {
              const [mx, my] = ring[i];
              const left = meeting ? mx : a.x;
              const top = meeting ? my : a.y;
              const cls = ["aiops-ch", moving ? "walk" : "calm", (a.busy && !meeting) ? "busy" : ""].join(" ");
              return (
                <div key={a.key} className={cls} style={{ left: `${left}%`, top: `${top}%` }}
                     onClick={() => setFocus(focus === a.key ? null : a.key)}
                     title={`${a.name} · ${a.role}`}>
                  <div className="aiops-sh" />
                  <CharSVG i={i} accent={SHIRT[a.key] || "#4C8DFF"} big={a.key === "gm"} />
                  {focus === a.key && topByAgent[a.key] && !meeting && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1.5 rounded-xl text-[11px] font-medium shadow-lg whitespace-nowrap"
                         style={{ background: "#fff", color: "#242A38" }}>
                      {topByAgent[a.key].title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── GM briefing + live wire ── */}
      <div className="px-4 sm:px-6 py-5" style={{ background: "#fff" }}>
        {gmBriefing && (
          <div className="mb-4 rounded-xl p-3 sm:p-4" style={{ background: "#FFF7E6", border: "1px solid #F5D58A" }}>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#B7791F" }}>
              🧭 Gbenga · state of the company · {timeAgo(gmBriefing.created_at)}
            </p>
            <p className="text-sm" style={{ color: "#5C4A1A" }}>{gmBriefing.content || gmBriefing.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "#242A38" }}>
            <Radio className="h-3.5 w-3.5" style={{ color: "#F5A524" }} /> Live wire
          </p>
          {focus && (
            <button onClick={() => setFocus(null)} className="text-[11px] underline underline-offset-2" style={{ color: "#6B7688" }}>
              showing {ROSTER.find((r) => r.key === focus)?.name || focus} — show everyone
            </button>
          )}
        </div>

        {queueLoading ? (
          <div className="flex justify-center py-10"><Loader className="h-5 w-5 animate-spin" style={{ color: "#9AA6B6" }} /></div>
        ) : wire.length === 0 ? (
          <p className="text-center text-sm py-10" style={{ color: "#6B7688" }}>
            {focus ? "Nothing from this desk yet." : "The floor is quiet. Hit “Send them around” to put the team to work."}
          </p>
        ) : (
          <ol className="space-y-1.5">
            {wire.slice(0, 60).map((x, i) => {
              const meta = STATUS_META[x.status] || STATUS_META.pending;
              const who = agents.find((a) => a.key === x.skill);
              return (
                <li key={x.id} className="aiops-wire-item flex items-start gap-3 rounded-lg px-3 py-2.5"
                    style={{ background: "#F6F8FB", animationDelay: `${Math.min(i, 12) * 45}ms` }}>
                  <span className="text-lg leading-none mt-0.5">{who?.emoji || "•"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider truncate" style={{ color: "#9AA6B6" }}>
                        {who ? `${who.name} · ${who.role}` : x.skill} · {timeAgo(x.created_at)}
                      </p>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{ color: meta.color, border: `1px solid ${meta.color}55` }}>{meta.label}</span>
                    </div>
                    <p className="text-sm font-medium leading-snug" style={{ color: "#242A38" }}>{x.title}</p>
                    {x.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#6B7688" }}>{x.description}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default AIOpsCenter;
