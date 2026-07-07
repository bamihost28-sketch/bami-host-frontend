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

/* ────────────────────────────────────────────────────────────────────────────
   THE OPS ROOM — watch the AI staff on duty.
   Deliberately dark in both themes: it's a control room. Amber = working,
   green = delivered, blue = waiting on the owner.
──────────────────────────────────────────────────────────────────────────── */

const C = {
  bg: "#0B1220",
  panel: "#111A2E",
  panelSoft: "#0E1626",
  line: "#1E2A44",
  text: "#E8EDF7",
  muted: "#8FA0BF",
  dim: "#5A6A8C",
  amber: "#F5A524",
  green: "#2FBF71",
  blue: "#4C8DFF",
  red: "#F0524D",
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "awaiting approval", color: C.blue },
  approved: { label: "approved", color: "#3ECFCF" },
  executing: { label: "executing", color: C.amber },
  done: { label: "done", color: C.green },
  dismissed: { label: "dismissed", color: C.dim },
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

function agentDuty(a: AgentInfo): { color: string; label: string } {
  if (a.pending > 0) return { color: C.blue, label: `${a.pending} for your approval` };
  if (a.done > 0) return { color: C.green, label: `${a.done} delivered` };
  return { color: C.dim, label: "standing by" };
}

const ShiftClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-sm tabular-nums" style={{ color: C.muted }}>
      {now.toLocaleTimeString("en-GB")} WAT SHIFT
    </span>
  );
};

export const AIOpsCenter = () => {
  const { toast } = useToast();
  const { data: agentsData, isLoading: agentsLoading } = useGetAgentsQuery(undefined, {
    pollingInterval: 20000,
  });
  const { data: queueData, isLoading: queueLoading } = useGetQueueQuery(
    { status: "all" },
    { pollingInterval: 20000 }
  );
  const [generateActions, { isLoading: isScanning }] = useGenerateActionsMutation();

  const [focusAgent, setFocusAgent] = useState<string | null>(null);

  const agents = agentsData?.agents ?? [];
  const gm = agents.find((a) => a.key === "gm");
  const floor = agents.filter((a) => a.key !== "gm");

  const actions = useMemo(() => {
    const all = queueData?.data ?? [];
    return focusAgent ? all.filter((x) => x.skill === focusAgent) : all;
  }, [queueData, focusAgent]);

  const agentByKey = useMemo(() => {
    const map: Record<string, AgentInfo> = {};
    agents.forEach((a) => { map[a.key] = a; });
    return map;
  }, [agents]);

  const latestGmBriefing = useMemo(
    () => (queueData?.data ?? []).find((x) => x.skill === "gm"),
    [queueData]
  );

  const totals = useMemo(() => {
    const all = queueData?.data ?? [];
    return {
      moves: all.length,
      waiting: all.filter((x) => x.status === "pending").length,
      delivered: all.filter((x) => x.status === "done").length,
    };
  }, [queueData]);

  const runScan = async () => {
    try {
      const res = await generateActions().unwrap();
      toast(`Success: Team scan finished — ${res.generated} new move${res.generated === 1 ? "" : "s"} on the wire`);
    } catch (err: any) {
      toast(`Error: ${err?.data?.detail || "Team scan failed"}`);
    }
  };

  return (
    <div className="min-h-screen -m-3 sm:-m-6 p-4 sm:p-8" style={{ background: C.bg, color: C.text }}>
      <style>{`
        @keyframes aiops-desk-on {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes aiops-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,165,36,0.45); }
          50%      { box-shadow: 0 0 0 6px rgba(245,165,36,0); }
        }
        @keyframes aiops-wire-in {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: none; }
        }
        .aiops-desk { animation: aiops-desk-on .5s ease-out both; }
        .aiops-live { animation: aiops-pulse 2.2s ease-in-out infinite; }
        .aiops-wire-item { animation: aiops-wire-in .35s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .aiops-desk, .aiops-live, .aiops-wire-item { animation: none; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] mb-2" style={{ color: C.amber }}>
            BAMIHOST · OPS ROOM
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: C.text }}>
            Your AI staff, on duty
          </h1>
          <p className="mt-2 max-w-xl text-sm" style={{ color: C.muted }}>
            {agents.length || 12} agents patrol the business day and night — every move they
            make lands on the wire, and nothing sensitive happens without your approval.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <ShiftClock />
          <Button
            onClick={runScan}
            disabled={isScanning}
            className="border-0 font-semibold"
            style={{ background: C.amber, color: "#161006" }}
          >
            {isScanning ? (
              <><Loader className="h-4 w-4 mr-2 animate-spin" />Team is scanning…</>
            ) : (
              <><RefreshCw className="h-4 w-4 mr-2" />Run team scan</>
            )}
          </Button>
        </div>
      </header>

      {/* ── Tally strip ── */}
      <div className="grid grid-cols-3 max-w-md gap-px mb-8 rounded-lg overflow-hidden" style={{ background: C.line }}>
        {[
          { n: totals.moves, label: "moves logged" },
          { n: totals.waiting, label: "await approval", color: C.blue },
          { n: totals.delivered, label: "delivered", color: C.green },
        ].map((t) => (
          <div key={t.label} className="px-4 py-3" style={{ background: C.panelSoft }}>
            <p className="font-mono text-2xl tabular-nums" style={{ color: t.color || C.text }}>{t.n}</p>
            <p className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: C.dim }}>{t.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── The floor ── */}
        <section className="xl:col-span-7 2xl:col-span-8 space-y-4">
          {/* GM desk */}
          {gm && (
            <button
              onClick={() => setFocusAgent(focusAgent === "gm" ? null : "gm")}
              className="aiops-desk w-full text-left rounded-xl p-5 transition-colors"
              style={{
                background: C.panel,
                border: `1px solid ${focusAgent === "gm" ? C.amber : C.line}`,
                animationDelay: "0ms",
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl leading-none">{gm.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-lg">{gm.name}</h2>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{ background: "#251A05", color: C.amber }}>
                      runs last · reads everything
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>{gm.description}</p>
                  {latestGmBriefing && (
                    <div className="mt-3 rounded-lg p-3 text-sm whitespace-pre-wrap"
                         style={{ background: C.panelSoft, border: `1px solid ${C.line}`, color: C.text }}>
                      <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: C.amber }}>
                        latest briefing · {timeAgo(latestGmBriefing.created_at)}
                      </p>
                      <p className="line-clamp-4">{latestGmBriefing.content || latestGmBriefing.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )}

          {/* Team desks — rendered in real run order (Designer first) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
            {agentsLoading
              ? Array.from({ length: 11 }).map((_, i) => (
                  <div key={i} className="rounded-xl h-32 animate-pulse" style={{ background: C.panel }} />
                ))
              : floor.map((a, i) => {
                  const duty = agentDuty(a);
                  const focused = focusAgent === a.key;
                  const working = a.pending > 0;
                  return (
                    <button
                      key={a.key}
                      onClick={() => setFocusAgent(focused ? null : a.key)}
                      className="aiops-desk text-left rounded-xl p-4 transition-colors"
                      style={{
                        background: C.panel,
                        border: `1px solid ${focused ? C.amber : C.line}`,
                        animationDelay: `${(i + 1) * 70}ms`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{a.emoji}</span>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{a.name}</p>
                          <p className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: duty.color }}>
                            <span
                              className={`inline-block h-2 w-2 rounded-full shrink-0 ${working ? "aiops-live" : ""}`}
                              style={{ background: duty.color }}
                            />
                            {duty.label}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs mt-3 line-clamp-2" style={{ color: C.muted }}>
                        {a.description}
                      </p>
                      <p className="font-mono text-[10px] mt-3 uppercase tracking-wider" style={{ color: C.dim }}>
                        {a.total} move{a.total === 1 ? "" : "s"} all-time
                      </p>
                    </button>
                  );
                })}
          </div>
        </section>

        {/* ── The wire ── */}
        <aside className="xl:col-span-5 2xl:col-span-4">
          <div className="rounded-xl overflow-hidden xl:sticky xl:top-4"
               style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.line}` }}>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C.text }}>
                <Radio className="h-3.5 w-3.5" style={{ color: C.amber }} />
                Live wire
                <span className="h-1.5 w-1.5 rounded-full aiops-live" style={{ background: C.amber }} />
              </p>
              {focusAgent && (
                <button onClick={() => setFocusAgent(null)}
                        className="font-mono text-[11px] underline underline-offset-2"
                        style={{ color: C.muted }}>
                  showing {agentByKey[focusAgent]?.name?.split(" ")[0] || focusAgent} — show all
                </button>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {queueLoading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-5 w-5 animate-spin" style={{ color: C.dim }} />
                </div>
              ) : actions.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm" style={{ color: C.muted }}>
                    {focusAgent
                      ? "No moves from this agent yet."
                      : "No moves logged yet. Run a team scan to put the staff to work."}
                  </p>
                </div>
              ) : (
                <ol>
                  {actions.slice(0, 60).map((x: AutopilotAction, i) => {
                    const meta = STATUS_META[x.status] || STATUS_META.pending;
                    const who = agentByKey[x.skill];
                    return (
                      <li key={x.id}
                          className="aiops-wire-item px-4 py-3"
                          style={{
                            borderBottom: `1px solid ${C.line}`,
                            animationDelay: `${Math.min(i, 12) * 45}ms`,
                          }}>
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <p className="font-mono text-[10px] uppercase tracking-wider truncate" style={{ color: C.dim }}>
                            {timeAgo(x.created_at)} · {who ? `${who.emoji} ${who.name}` : x.skill}
                          </p>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ color: meta.color, border: `1px solid ${meta.color}55` }}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-snug" style={{ color: C.text }}>{x.title}</p>
                        {x.description && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: C.muted }}>{x.description}</p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AIOpsCenter;
