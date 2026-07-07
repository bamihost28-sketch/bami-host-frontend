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
import { Loader, Radio, RefreshCw } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════════
   BAMIHOST HQ — a living cartoon office.
   Every AI agent is a character at a desk: typing when they have work, idle
   when standing by. Someone walks the floor. All hand-drawn in CSS/SVG, all
   driven by the real autopilot agents + action queue.
════════════════════════════════════════════════════════════════════════════ */

// Warm, bright daytime office — a deliberate single look (not theme-reactive):
// a control room is moody, but a staffed office is sunny and alive.
const C = {
  wallTop: "#F6EFE1",
  wallBot: "#ECE1CC",
  carpet: "#D7E2E8",
  carpetLine: "#C4D3DC",
  wood: "#C89B6A",
  woodDark: "#A97C4C",
  chair: "#3B4557",
  monitor: "#2A3140",
  ink: "#2C3242",
  muted: "#6B7688",
  dim: "#9AA6B6",
  amber: "#F5A524",
  green: "#2FBF71",
  blue: "#4C8DFF",
  red: "#EF5350",
  glass: "rgba(180,214,224,0.35)",
};

// Per-agent identity: shirt colour + skin + hair. Skin tones range across the
// team (a Nigerian office), assigned deterministically so each desk is distinct.
const SHIRT: Record<string, string> = {
  gm: "#EAB308",
  designer: "#F5A524",
  marketer: "#FF6B9D",
  sales: "#4C8DFF",
  finance: "#2FBF71",
  operations: "#14B8C4",
  hr: "#A78BFA",
  retention: "#FB923C",
  collections: "#EF4444",
  analyst: "#6366F1",
  compliance: "#64748B",
  records: "#8B5E3C",
};
const SKINS = ["#F1C27D", "#E0AC69", "#C68642", "#8D5524"];
const HAIRS = ["#1A1512", "#2B2119", "#3A2E22", "#0F0D0B"];

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "for your approval", color: C.blue },
  approved: { label: "approved", color: "#14B8C4" },
  executing: { label: "executing", color: C.amber },
  done: { label: "delivered", color: C.green },
  dismissed: { label: "set aside", color: C.dim },
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

type Duty = "working" | "delivered" | "idle";
function dutyOf(a: AgentInfo): Duty {
  if (a.pending > 0) return "working";
  if (a.done > 0) return "delivered";
  return "idle";
}
const DUTY_COLOR: Record<Duty, string> = { working: C.amber, delivered: C.green, idle: C.dim };
const DUTY_TEXT: Record<Duty, string> = {
  working: "on a task",
  delivered: "just delivered",
  idle: "standing by",
};

/* ── The character: an SVG person, seated or standing ──────────────────────── */
function Character({
  accent, skin, hair, working, pose = "sit", scale = 1,
}: {
  accent: string; skin: string; hair: string;
  working: boolean; pose?: "sit" | "stand"; scale?: number;
}) {
  return (
    <svg viewBox="0 0 80 96" width={72 * scale} height={86 * scale}
         className={`aiops-char ${working ? "aiops-busy" : "aiops-calm"}`} aria-hidden="true">
      {/* chair back (sit only) */}
      {pose === "sit" && <rect x="20" y="30" width="40" height="46" rx="10" fill={C.chair} />}
      {/* standing legs */}
      {pose === "stand" && (
        <g fill={C.ink}>
          <rect x="33" y="70" width="6" height="22" rx="3" />
          <rect x="41" y="70" width="6" height="22" rx="3" />
        </g>
      )}
      {/* torso / shirt */}
      <path d="M16 78 Q16 48 40 48 Q64 48 64 78 Z" fill={accent} />
      {/* collar */}
      <path d="M33 49 L40 56 L47 49 Z" fill="rgba(255,255,255,0.35)" />
      {/* neck */}
      <rect x="35" y="38" width="10" height="12" rx="4" fill={skin} />
      {/* head */}
      <circle cx="40" cy="28" r="14" fill={skin} />
      {/* hair */}
      <path d="M26 27 Q26 9 40 9 Q54 9 54 27 Q54 20 48 17 Q44 15 40 15 Q30 15 26 27 Z" fill={hair} />
      {/* eyes (blink) */}
      <ellipse className="aiops-eye" cx="34.5" cy="28" rx="1.9" ry="2.4" fill="#241C16" />
      <ellipse className="aiops-eye" cx="45.5" cy="28" rx="1.9" ry="2.4" fill="#241C16" />
      {/* smile */}
      <path d="M35 34 Q40 38 45 34" stroke="#241C16" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* hands on desk — typing when working */}
      <g className="aiops-hand-l"><circle cx="24" cy="76" r="4.5" fill={skin} /></g>
      <g className="aiops-hand-r"><circle cx="56" cy="76" r="4.5" fill={skin} /></g>
    </svg>
  );
}

/* ── A workstation: desk + monitor + character + nameplate ─────────────────── */
function Workstation({
  agent, i, selected, onSelect, topAction,
}: {
  agent: AgentInfo; i: number; selected: boolean;
  onSelect: () => void; topAction?: AutopilotAction;
}) {
  const duty = dutyOf(agent);
  const accent = SHIRT[agent.key] || C.blue;
  const skin = SKINS[i % SKINS.length];
  const hair = HAIRS[(i * 3) % HAIRS.length];
  const working = duty === "working";
  const first = agent.name.split("·")[0].split(" ")[0].trim();

  return (
    <button
      onClick={onSelect}
      className="aiops-desk-in relative flex flex-col items-center pt-8 pb-2 px-1 rounded-2xl transition-all"
      style={{
        animationDelay: `${i * 80}ms`,
        outline: selected ? `2px solid ${accent}` : "2px solid transparent",
        outlineOffset: 3,
        background: selected ? "rgba(255,255,255,0.45)" : "transparent",
      }}
      title={`${agent.name} — ${DUTY_TEXT[duty]}`}
    >
      {/* status light + duty tag */}
      <div className="absolute top-1 flex items-center gap-1.5">
        <span
          className={`h-2.5 w-2.5 rounded-full ${working ? "aiops-blip" : ""}`}
          style={{ background: DUTY_COLOR[duty], boxShadow: `0 0 0 3px ${DUTY_COLOR[duty]}22` }}
        />
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: C.muted }}>
          {DUTY_TEXT[duty]}
        </span>
      </div>

      {/* speech bubble when selected & has a live action */}
      {selected && topAction && (
        <div className="aiops-bubble absolute -top-3 z-20 max-w-[180px] px-2.5 py-1.5 rounded-xl text-[11px] font-medium shadow-lg"
             style={{ background: "#fff", color: C.ink, left: "50%", transform: "translateX(-50%)" }}>
          {topAction.title}
          <span className="absolute left-1/2 -bottom-1 h-2 w-2 rotate-45 -translate-x-1/2" style={{ background: "#fff" }} />
        </div>
      )}

      {/* thought dots when working */}
      {working && !selected && (
        <div className="absolute top-6 z-10 flex gap-0.5">
          {[0, 1, 2].map((d) => (
            <span key={d} className="aiops-think h-1.5 w-1.5 rounded-full"
                  style={{ background: accent, animationDelay: `${d * 180}ms` }} />
          ))}
        </div>
      )}

      {/* the person */}
      <div className="relative z-[1] -mb-3">
        <Character accent={accent} skin={skin} hair={hair} working={working} />
      </div>

      {/* desk with monitor */}
      <div className="relative z-[2] w-[92%]">
        {/* monitor */}
        <div className="mx-auto w-14 -mb-0.5" style={{ marginBottom: -2 }}>
          <div className="mx-auto h-9 w-14 rounded-md overflow-hidden relative"
               style={{ background: C.monitor, border: `2px solid ${C.ink}` }}>
            <div className="absolute inset-0.5 rounded-sm overflow-hidden"
                 style={{ background: working ? `${accent}22` : "#141922" }}>
              {working && (
                <div className="aiops-scroll">
                  {Array.from({ length: 6 }).map((_, k) => (
                    <div key={k} className="h-1 my-0.5 rounded-full"
                         style={{ width: `${40 + ((k * 37) % 55)}%`, marginLeft: 3, background: accent, opacity: 0.85 }} />
                  ))}
                </div>
              )}
            </div>
            {working && <div className="absolute inset-0 aiops-glow" style={{ boxShadow: `inset 0 0 12px ${accent}` }} />}
          </div>
          <div className="mx-auto h-2 w-2" style={{ background: C.ink }} />
          <div className="mx-auto h-1 w-6 rounded-full" style={{ background: C.ink }} />
        </div>
        {/* desktop surface */}
        <div className="h-3 rounded-t-md" style={{ background: C.wood }} />
        <div className="h-2 rounded-b-md" style={{ background: C.woodDark }} />
      </div>

      {/* nameplate */}
      <div className="mt-2 text-center">
        <p className="text-xs font-bold leading-none" style={{ color: C.ink }}>{first}</p>
        <p className="text-[10px] leading-tight mt-0.5 capitalize" style={{ color: C.muted }}>{agent.key}</p>
      </div>
    </button>
  );
}

export const AIOpsCenter = () => {
  const { toast } = useToast();
  const { data: agentsData, isLoading: agentsLoading } = useGetAgentsQuery(undefined, { pollingInterval: 20000 });
  const { data: queueData, isLoading: queueLoading } = useGetQueueQuery({ status: "all" }, { pollingInterval: 20000 });
  const [generateActions, { isLoading: isScanning }] = useGenerateActionsMutation();

  const [focus, setFocus] = useState<string | null>(null);
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const agents = agentsData?.agents ?? [];
  const gm = agents.find((a) => a.key === "gm");
  const floor = agents.filter((a) => a.key !== "gm");

  const queue = queueData?.data ?? [];
  const topByAgent = useMemo(() => {
    const map: Record<string, AutopilotAction> = {};
    for (const a of queue) if (!map[a.skill]) map[a.skill] = a;
    return map;
  }, [queue]);
  const agentByKey = useMemo(() => {
    const m: Record<string, AgentInfo> = {};
    agents.forEach((a) => { m[a.key] = a; });
    return m;
  }, [agents]);

  const wire = useMemo(
    () => (focus ? queue.filter((x) => x.skill === focus) : queue),
    [queue, focus]
  );
  const gmBriefing = topByAgent["gm"];

  const totals = useMemo(() => ({
    moves: queue.length,
    waiting: queue.filter((x) => x.status === "pending").length,
    delivered: queue.filter((x) => x.status === "done").length,
    onTask: floor.filter((a) => dutyOf(a) === "working").length,
  }), [queue, floor]);

  const runScan = async () => {
    try {
      const res = await generateActions().unwrap();
      toast(`Success: The team just did a round — ${res.generated} new move${res.generated === 1 ? "" : "s"} on the floor`);
    } catch (err: any) {
      toast(`Error: ${err?.data?.detail || "Team scan failed"}`);
    }
  };

  return (
    <div className="-m-3 sm:-m-6">
      <style>{`
        @keyframes aiops-breathe { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-2px) } }
        @keyframes aiops-busybob { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-1px) } }
        @keyframes aiops-eyeblink { 0%,92%,100%{ transform: scaleY(1) } 96%{ transform: scaleY(0.1) } }
        @keyframes aiops-typea { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-3px) } }
        @keyframes aiops-typeb { 0%,100%{ transform: translateY(-3px) } 50%{ transform: translateY(0) } }
        @keyframes aiops-scroll { from{ transform: translateY(0) } to{ transform: translateY(-50%) } }
        @keyframes aiops-glow { 0%,100%{ opacity:.4 } 50%{ opacity:.9 } }
        @keyframes aiops-blip { 0%,100%{ box-shadow:0 0 0 0 currentColor } 50%{ box-shadow:0 0 0 5px transparent } }
        @keyframes aiops-think { 0%,100%{ transform: translateY(0); opacity:.4 } 50%{ transform: translateY(-3px); opacity:1 } }
        @keyframes aiops-deskin { from{ opacity:0; transform: translateY(10px) } to{ opacity:1; transform:none } }
        @keyframes aiops-bubblein { from{ opacity:0; transform: translate(-50%,4px) } to{ opacity:1; transform: translate(-50%,0) } }
        @keyframes aiops-walk { 0%{ transform: translateX(-8vw) } 100%{ transform: translateX(108vw) } }
        @keyframes aiops-walkbob { 0%,100%{ transform: translateY(0) rotate(-1deg) } 50%{ transform: translateY(-3px) rotate(1deg) } }
        @keyframes aiops-wirein { from{ opacity:0; transform: translateX(8px) } to{ opacity:1; transform:none } }
        @keyframes aiops-plant { 0%,100%{ transform: rotate(-2deg) } 50%{ transform: rotate(2deg) } }

        .aiops-char { display:block; }
        .aiops-calm { animation: aiops-breathe 4s ease-in-out infinite; }
        .aiops-busy { animation: aiops-busybob 0.6s ease-in-out infinite; }
        .aiops-eye { transform-box: fill-box; transform-origin: center; animation: aiops-eyeblink 5s ease-in-out infinite; }
        .aiops-busy .aiops-hand-l { animation: aiops-typea .28s ease-in-out infinite; }
        .aiops-busy .aiops-hand-r { animation: aiops-typeb .28s ease-in-out infinite; }
        .aiops-scroll > div { }
        .aiops-scroll { animation: aiops-scroll 1.6s linear infinite; }
        .aiops-glow { animation: aiops-glow 1.4s ease-in-out infinite; }
        .aiops-blip { color: currentColor; animation: aiops-blip 1.8s ease-in-out infinite; }
        .aiops-think { animation: aiops-think 1s ease-in-out infinite; }
        .aiops-desk-in { animation: aiops-deskin .5s ease-out both; }
        .aiops-bubble { animation: aiops-bubblein .25s ease-out both; }
        .aiops-walker { animation: aiops-walk 26s linear infinite; }
        .aiops-walker > svg { animation: aiops-walkbob .5s ease-in-out infinite; }
        .aiops-wire-item { animation: aiops-wirein .35s ease-out both; }
        .aiops-plant { transform-origin: bottom center; animation: aiops-plant 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .aiops-calm,.aiops-busy,.aiops-eye,.aiops-busy .aiops-hand-l,.aiops-busy .aiops-hand-r,
          .aiops-scroll,.aiops-glow,.aiops-blip,.aiops-think,.aiops-desk-in,.aiops-bubble,
          .aiops-walker,.aiops-walker>svg,.aiops-wire-item,.aiops-plant { animation: none !important; }
        }
      `}</style>

      {/* ── Header bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-3"
           style={{ background: C.ink }}>
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] mb-1" style={{ color: C.amber }}>BAMIHOST · HQ FLOOR</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">The office is open</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-mono text-sm tabular-nums text-white/90">{clock.toLocaleTimeString("en-GB")}</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: C.dim }}>
              {totals.onTask} on task · {totals.waiting} need you
            </p>
          </div>
          <Button onClick={runScan} disabled={isScanning} className="border-0 font-semibold"
                  style={{ background: C.amber, color: "#1a1206" }}>
            {isScanning ? (<><Loader className="h-4 w-4 mr-2 animate-spin" />Doing a round…</>)
                        : (<><RefreshCw className="h-4 w-4 mr-2" />Send them around</>)}
          </Button>
        </div>
      </div>

      {/* ── The office scene ── */}
      <div className="relative overflow-hidden"
           style={{ background: `linear-gradient(${C.wallTop}, ${C.wallBot} 42%, ${C.carpet} 42%)` }}>
        {/* wall: windows + clock + sign */}
        <div className="relative h-16 sm:h-20">
          <div className="absolute inset-x-0 top-0 flex justify-around px-8 pt-2 opacity-80">
            {[0, 1, 2, 3].map((w) => (
              <div key={w} className="h-8 w-16 sm:w-24 rounded-md"
                   style={{ background: "linear-gradient(160deg,#CDE7F2,#EAF6FB)", border: `2px solid ${C.woodDark}` }} />
            ))}
          </div>
          <div className="absolute right-4 top-2 h-9 w-9 rounded-full flex items-center justify-center"
               style={{ background: "#fff", border: `2px solid ${C.ink}` }}>
            <span className="font-mono text-[9px] font-bold tabular-nums" style={{ color: C.ink }}>
              {clock.getHours().toString().padStart(2, "0")}:{clock.getMinutes().toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* carpet grid */}
        <div className="absolute left-0 right-0 bottom-0" style={{
          top: "42%",
          backgroundImage: `repeating-linear-gradient(0deg, ${C.carpetLine} 0 1px, transparent 1px 46px),
                            repeating-linear-gradient(90deg, ${C.carpetLine} 0 1px, transparent 1px 46px)`,
          maskImage: "linear-gradient(#000, #000)",
          opacity: 0.5,
        }} />

        {/* wandering colleague */}
        <div className="aiops-walker absolute z-10 pointer-events-none" style={{ top: "44%" }}>
          <svg viewBox="0 0 40 60" width="34" height="50" aria-hidden="true">
            <rect x="17" y="42" width="5" height="16" rx="2" fill={C.ink} />
            <rect x="23" y="42" width="5" height="16" rx="2" fill={C.ink} />
            <path d="M10 44 Q10 26 22 26 Q34 26 34 44 Z" fill="#14B8C4" />
            <rect x="6" y="34" width="10" height="7" rx="1.5" fill="#fff" stroke={C.ink} strokeWidth="1" />
            <circle cx="22" cy="16" r="9" fill="#E0AC69" />
            <path d="M13 15 Q13 3 22 3 Q31 3 31 15 Q31 9 22 9 Q15 9 13 15Z" fill="#1A1512" />
          </svg>
        </div>

        {/* plants for life */}
        <div className="absolute z-[5] left-2 sm:left-4" style={{ top: "40%" }}>
          <div className="aiops-plant">
            <div className="mx-auto h-6 w-8" style={{ background: "#3E9E6A", borderRadius: "60% 60% 20% 20%" }} />
            <div className="mx-auto h-3 w-4" style={{ background: C.woodDark }} />
          </div>
        </div>

        {/* GM glass office */}
        {gm && (
          <div className="relative z-[6] mx-3 sm:mx-6 mt-1 mb-4 rounded-2xl p-3 sm:p-4"
               style={{ background: C.glass, border: `2px solid ${C.woodDark}`, backdropFilter: "blur(1px)" }}>
            <div className="flex items-center gap-3 sm:gap-5">
              <button onClick={() => setFocus(focus === "gm" ? null : "gm")}
                      className="relative shrink-0 flex flex-col items-center" title={gm.name}>
                <span className="absolute -top-1 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider z-10"
                      style={{ background: C.amber, color: "#1a1206" }}>manager</span>
                <Character accent={SHIRT.gm} skin={SKINS[1]} hair={HAIRS[0]}
                           working={gm.pending > 0} pose="stand" scale={1.15} />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold text-base sm:text-lg" style={{ color: C.ink }}>{gm.name}</h2>
                <p className="text-xs sm:text-sm" style={{ color: C.muted }}>{gm.description}</p>
                {gmBriefing && (
                  <div className="mt-2 rounded-lg p-2.5 text-xs sm:text-sm"
                       style={{ background: "rgba(255,255,255,0.7)", color: C.ink }}>
                    <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: C.amber }}>
                      state of the company · {timeAgo(gmBriefing.created_at)}
                    </p>
                    <p className="line-clamp-3">{gmBriefing.content || gmBriefing.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* the open floor — every agent at a workstation */}
        <div className="relative z-[6] px-2 sm:px-6 pb-8">
          {agentsLoading ? (
            <div className="flex justify-center py-16">
              <Loader className="h-6 w-6 animate-spin" style={{ color: C.muted }} />
            </div>
          ) : (
            <div className="grid gap-x-1 gap-y-6 justify-items-center"
                 style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
              {floor.map((a, i) => (
                <Workstation key={a.key} agent={a} i={i}
                             selected={focus === a.key}
                             onSelect={() => setFocus(focus === a.key ? null : a.key)}
                             topAction={topByAgent[a.key]} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Live wire ── */}
      <div className="px-4 sm:px-6 py-5" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C.ink }}>
            <Radio className="h-3.5 w-3.5" style={{ color: C.amber }} />
            Live wire
            <span className="h-1.5 w-1.5 rounded-full aiops-blip" style={{ color: C.amber, background: C.amber }} />
          </p>
          {focus && (
            <button onClick={() => setFocus(null)} className="text-[11px] underline underline-offset-2" style={{ color: C.muted }}>
              showing {agentByKey[focus]?.name?.split(" ")[0] || focus} — show everyone
            </button>
          )}
        </div>

        {queueLoading ? (
          <div className="flex justify-center py-10"><Loader className="h-5 w-5 animate-spin" style={{ color: C.dim }} /></div>
        ) : wire.length === 0 ? (
          <p className="text-center text-sm py-10" style={{ color: C.muted }}>
            {focus ? "Nothing from this desk yet." : "The floor is quiet. Hit “Send them around” to put the team to work."}
          </p>
        ) : (
          <ol className="space-y-1.5">
            {wire.slice(0, 60).map((x, i) => {
              const meta = STATUS_META[x.status] || STATUS_META.pending;
              const who = agentByKey[x.skill];
              return (
                <li key={x.id} className="aiops-wire-item flex items-start gap-3 rounded-lg px-3 py-2.5"
                    style={{ background: "#F6F8FB", animationDelay: `${Math.min(i, 12) * 45}ms` }}>
                  <span className="text-lg leading-none mt-0.5">{who?.emoji || "•"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider truncate" style={{ color: C.dim }}>
                        {who?.name || x.skill} · {timeAgo(x.created_at)}
                      </p>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ color: meta.color, border: `1px solid ${meta.color}55` }}>{meta.label}</span>
                    </div>
                    <p className="text-sm font-medium leading-snug" style={{ color: C.ink }}>{x.title}</p>
                    {x.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: C.muted }}>{x.description}</p>}
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
