import { useState, useEffect } from "react";
import {
  TrendingUp, Star, Target, Wallet, Loader2, Send, Check, Lock,
  CircleDollarSign, Users2, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetScaleOverviewQuery, useGetNpsQuery, useRequestNpsMutation,
  useGetGrowthScorecardQuery, useGetScorecardQuery, useGetValueEnginesQuery,
  useGetFinancePlanQuery, useUpdateFinancePlanMutation,
} from "@/services/scaleApi";

const DOT: Record<string, string> = { green: "bg-green-500", amber: "bg-yellow-500", red: "bg-red-500" };
const AGENT_EMOJI: Record<string, string> = {
  designer: "🎨", marketer: "📣", sales: "💼", finance: "💰", operations: "🔧", hr: "👥",
};

const naira = (n: number) => `₦${(n || 0).toLocaleString()}`;

export function ScaleDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-emerald-600" /> Scale — Your 7 Levels
        </h1>
        <p className="text-slate-500 mt-1">Your roadmap from where you are to hitting your number — diagnosed from live data.</p>
      </div>

      <LevelLadder />

      <Tabs defaultValue="scorecard">
        <TabsList>
          <TabsTrigger value="scorecard" className="gap-1"><Target className="h-4 w-4" /> Scorecard</TabsTrigger>
          <TabsTrigger value="engines" className="gap-1"><Sparkles className="h-4 w-4" /> Value Engines</TabsTrigger>
          <TabsTrigger value="nps" className="gap-1"><Star className="h-4 w-4" /> Level 1 · Promoters</TabsTrigger>
          <TabsTrigger value="growth" className="gap-1"><TrendingUp className="h-4 w-4" /> Level 2 · Growth</TabsTrigger>
          <TabsTrigger value="finance" className="gap-1"><Wallet className="h-4 w-4" /> Level 4 · Pay Yourself</TabsTrigger>
        </TabsList>
        <TabsContent value="scorecard" className="mt-4"><ScorecardPanel /></TabsContent>
        <TabsContent value="engines" className="mt-4"><ValueEnginesPanel /></TabsContent>
        <TabsContent value="nps" className="mt-4"><NpsPanel /></TabsContent>
        <TabsContent value="growth" className="mt-4"><GrowthPanel /></TabsContent>
        <TabsContent value="finance" className="mt-4"><FinancePanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function LevelLadder() {
  const { data, isLoading } = useGetScaleOverviewQuery();
  if (isLoading) return <Skeleton className="h-28 w-full" />;
  if (!data) return null;
  const plan = data.stated_plan;
  return (
    <Card className="border-emerald-200">
      <CardContent className="p-4">
        {plan?.has_plan && plan.target_revenue ? (
          <div className="mb-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-sm"><span className="text-slate-500">Your Number (3-yr): </span><strong className="text-emerald-700">{naira(plan.target_revenue)}</strong> revenue
              {plan.target_profit ? <> · {naira(plan.target_profit)} profit</> : null}</span>
            {plan.why_summary && <span className="text-xs text-slate-500 italic">Why: {plan.why_summary}</span>}
          </div>
        ) : (
          <div className="mb-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700">
            You haven't set your Number yet — define it in the <strong>Scalable Impact Planner</strong> (Defining Your Number).
          </div>
        )}
        <p className="text-sm text-slate-500 mb-3">
          You're at <span className="font-bold text-emerald-700">Level {data.current_level}</span>. Focus only on this level — you can't skip ahead.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {data.levels.map((l) => {
            const isCurrent = l.level === data.current_level;
            return (
              <div key={l.level}
                className={`rounded-lg border p-2 text-center ${
                  l.done ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                  : isCurrent ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-400"
                  : "border-slate-200 bg-slate-50 dark:bg-slate-800 opacity-70"}`}>
                <div className="flex items-center justify-center gap-1">
                  {l.done ? <Check className="h-3.5 w-3.5 text-green-600" />
                    : isCurrent ? <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    : <Lock className="h-3 w-3 text-slate-400" />}
                  <span className="text-xs font-bold">L{l.level}</span>
                </div>
                <p className="text-[11px] font-medium mt-1 leading-tight">{l.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{l.progress}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ValueEnginesPanel() {
  const { data, isLoading } = useGetValueEnginesQuery();
  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Your business as <strong>value engines</strong> — the flow of how value is created. ⭐ = power stage (critical), with the AI agent that automates it.
      </p>
      {data.engines.map((eng) => (
        <Card key={eng.name}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{eng.name}</CardTitle>
            <p className="text-xs text-slate-400">{eng.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
              {eng.stages.map((s, i) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <div className={`rounded-lg border p-3 w-32 text-center ${
                    s.terminus ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : s.power ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "bg-slate-50 dark:bg-slate-800"}`}>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{s.metric}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{s.name}</p>
                    {(s.agent || s.power) && (
                      <p className="text-[11px] mt-1">
                        {s.power && <span title="power stage">⭐</span>}
                        {s.agent && <span className="ml-0.5">{AGENT_EMOJI[s.agent]}</span>}
                        {s.agent2 && <span>{AGENT_EMOJI[s.agent2]}</span>}
                      </p>
                    )}
                  </div>
                  {i < eng.stages.length - 1 && <span className="text-slate-300 text-lg">→</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <p className="text-xs text-slate-400">The Growth Engine's terminus (Occupied) feeds the Fulfillment Engine — that's your full machine. Your AI agents already run the ⭐ power stages.</p>
    </div>
  );
}

function ScorecardPanel() {
  const { data, isLoading } = useGetScorecardQuery();
  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data) return null;
  const Metric = ({ m }: { m: { label: string; value: string | number; status: string } }) => (
    <div className="rounded-lg border p-3 bg-white dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT[m.status] ?? "bg-slate-300"}`} />
        <span className="text-lg font-bold text-slate-900 dark:text-white">{m.value}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">{m.label}</p>
    </div>
  );
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Your <strong>Company Scorecard</strong> — the OS "dashboard of truth", live from your data ({data.as_of}). Green = on track, amber = watch, red = act.
      </p>
      <Card>
        <CardHeader><CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Evergreen (the truth)</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{data.evergreen.map((m, i) => <Metric key={i} m={m} />)}</div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm text-slate-500 uppercase tracking-wide">North Star (leading)</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{data.north_star.map((m, i) => <Metric key={i} m={m} />)}</div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Team output — agent actions (30d)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {data.teams.map((t, i) => (
              <div key={i} className="rounded-lg border p-3 bg-slate-50 dark:bg-slate-800">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{t.metric}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.team}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NpsPanel() {
  const { toast } = useToast();
  const { data, isLoading } = useGetNpsQuery();
  const [requestNps, { isLoading: sending }] = useRequestNpsMutation();

  const send = async () => {
    try {
      const r = await requestNps().unwrap();
      toast({ title: "NPS sent", description: r.message });
    } catch {
      toast({ title: "Couldn't send", description: "Tenants must have connected the Telegram bot.", variant: "destructive" });
    }
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card className="border-purple-200">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Level 1 — Sell & Serve 10: get 10 tenants who'd recommend you (score 9–10).</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold text-purple-700">{data.promoters}</span>
                <span className="text-slate-400">/ {data.target} promoters</span>
              </div>
              <div className="w-64 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${data.progress_pct}%` }} />
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={send} disabled={sending}>
              {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : <><Send className="h-4 w-4 mr-2" /> Ask tenants for NPS</>}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-5 text-center">
            <Stat label="NPS Score" value={data.nps_score} />
            <Stat label="Promoters" value={data.promoters} cls="text-green-600" />
            <Stat label="Passives" value={data.passives} cls="text-yellow-600" />
            <Stat label="Detractors" value={data.detractors} cls="text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tenant scores</CardTitle></CardHeader>
        <CardContent>
          {data.scores.length === 0 ? <p className="text-sm text-slate-400">No tenants yet.</p> : (
            <div className="space-y-1.5">
              {data.scores.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border-b py-1.5">
                  <span className="font-medium">{s.name} <span className="text-slate-400">· {s.unit}</span></span>
                  <span className="flex items-center gap-2">
                    {!s.connected && <span className="text-[10px] text-slate-400">not on Telegram</span>}
                    {s.score == null ? <span className="text-slate-300">—</span>
                      : <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.score >= 9 ? "bg-green-100 text-green-700" : s.score >= 7 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{s.score}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GrowthPanel() {
  const { data, isLoading } = useGetGrowthScorecardQuery();
  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data) return null;
  const maxRev = Math.max(1, ...data.monthly_revenue.map((m) => m.revenue));
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-emerald-600" /> Growth Scorecard (the funnel)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {data.stages.map((s, i) => (
              <div key={i} className={`rounded-lg border p-3 ${s.stage === data.bottleneck ? "border-red-300 bg-red-50 dark:bg-red-900/20" : "bg-slate-50 dark:bg-slate-800"}`}>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.metric}</p>
                <p className="text-xs font-medium mt-1">{s.stage}</p>
                <p className="text-[10px] text-slate-400">{s.sub}</p>
                {s.stage === data.bottleneck && <p className="text-[10px] text-red-600 font-semibold mt-1">⚠ bottleneck</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-emerald-600" /> Monthly revenue</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-40">
            {data.monthly_revenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] text-slate-500">{naira(m.revenue)}</span>
                <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${Math.max(4, (m.revenue / maxRev) * 100)}%` }} />
                <span className="text-[10px] text-slate-400 mt-1">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Flywheel target: {naira(data.monthly_target)}/mo for 3 straight months → unlock Level 3.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancePanel() {
  const { toast } = useToast();
  const { data, isLoading } = useGetFinancePlanQuery();
  const [save, { isLoading: saving }] = useUpdateFinancePlanMutation();
  const [form, setForm] = useState({ living_expenses: 0, target_monthly_salary: 0, target_profit_pct: 20, emergency_fund_target: 0, emergency_fund_current: 0 });

  useEffect(() => {
    if (data) setForm({
      living_expenses: data.living_expenses, target_monthly_salary: data.target_monthly_salary,
      target_profit_pct: data.target_profit_pct, emergency_fund_target: data.emergency_fund_target,
      emergency_fund_current: data.emergency_fund_current,
    });
  }, [data]);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data) return null;

  const recommended = Math.round((form.living_expenses || 0) * 1.15);
  const onSave = async () => {
    try { await save(form).unwrap(); toast({ title: "Saved", description: "Your pay-yourself-first plan is updated." }); }
    catch { toast({ title: "Error", description: "Could not save.", variant: "destructive" }); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-600" /> Pay Yourself First</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Your monthly living expenses</Label>
            <Input type="number" value={form.living_expenses} onChange={(e) => setForm(p => ({ ...p, living_expenses: +e.target.value }))} />
            <p className="text-xs text-emerald-600 mt-1">Recommended salary (expenses + 15%): <strong>{naira(recommended)}</strong></p>
          </div>
          <div>
            <Label>Your current monthly salary</Label>
            <Input type="number" value={form.target_monthly_salary} onChange={(e) => setForm(p => ({ ...p, target_monthly_salary: +e.target.value }))} />
            {form.target_monthly_salary < recommended && recommended > 0 && (
              <p className="text-xs text-red-500 mt-1">Below target by {naira(recommended - form.target_monthly_salary)} — pay yourself first.</p>
            )}
          </div>
          <div>
            <Label>Target profit margin (%)</Label>
            <Input type="number" value={form.target_profit_pct} onChange={(e) => setForm(p => ({ ...p, target_profit_pct: +e.target.value }))} />
            <p className="text-xs text-slate-400 mt-1">Profit-first: Revenue − Profit = Expenses. Aim 10–20%.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save plan"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users2 className="h-4 w-4 text-emerald-600" /> Reality check</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Avg monthly revenue (3mo)" value={naira(data.avg_monthly_revenue)} />
            <Row label="Recommended salary" value={naira(recommended)} />
            <Row label="Target profit" value={`${form.target_profit_pct}%`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Emergency fund (3–6 months)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target</Label><Input type="number" value={form.emergency_fund_target} onChange={(e) => setForm(p => ({ ...p, emergency_fund_target: +e.target.value }))} /></div>
              <div><Label>Current</Label><Input type="number" value={form.emergency_fund_current} onChange={(e) => setForm(p => ({ ...p, emergency_fund_current: +e.target.value }))} /></div>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600" style={{ width: `${form.emergency_fund_target ? Math.min(100, Math.round(form.emergency_fund_current / form.emergency_fund_target * 100)) : 0}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls?: string }) {
  return <div><p className={`text-2xl font-bold ${cls ?? "text-slate-900 dark:text-white"}`}>{value}</p><p className="text-xs text-slate-400">{label}</p></div>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span className="font-semibold">{value}</span></div>;
}
