import { useState, useEffect, useMemo, type ElementType } from "react";
import {
  TrendingUp, Star, Target, Wallet, Loader2, Send, Check, Lock,
  CircleDollarSign, Users2, Sparkles, ListChecks, Clock, Square,
  ArrowUp, ArrowDown, Save, RefreshCw, DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetScaleOverviewQuery, useGetNpsQuery, useRequestNpsMutation,
  useGetGrowthScorecardQuery, useGetScorecardQuery, useGetValueEnginesQuery,
  useGetTeamCanvasQuery, useGetFinancePlanQuery, useUpdateFinancePlanMutation,
  useGetPlaybooksQuery, useCreatePlaybookMutation, useUpdatePlaybookMutation, useDeletePlaybookMutation,
  useGetCashWaterfallQuery,
} from "@/services/scaleApi";
import {
  useGetCandidatesQuery, useCreateCandidateMutation,
  useUpdateCandidateMutation, useDeleteCandidateMutation,
} from "@/services/skillsApi";
import { useGetGrowthPlanQuery, useSaveGrowthPlanMutation } from "@/services/growthApi";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Trash2, Plus } from "lucide-react";
import ScalableImpactPlanner from "@/components/scalable-impact/ScalableImpactPlanner";
import { StartingPointSection } from "@/components/scalable-impact/StartingPointSection";
import { EndGameSection } from "@/components/scalable-impact/EndGameSection";
import WhySection from "@/components/scalable-impact/WhySection";
import HowSection from "@/components/scalable-impact/HowSection";
import TakingActionSection from "@/components/scalable-impact/TakingActionSection";
import type { TimeEntry, TaskItem, DelegationItem, HourlyRateConfig } from "@/types/hiring";
import {
  calculateDuration, formatDuration, calculateTimeValue, updateHourlyRateConfig,
  analyzeProductivity, createTask, createDelegationItem, formatDate as formatHiringDate,
} from "@/lib/hiringUtils";

const DOT: Record<string, string> = { green: "bg-green-500", amber: "bg-yellow-500", red: "bg-red-500" };
const AGENT_EMOJI: Record<string, string> = {
  designer: "🎨", marketer: "📣", sales: "💼", finance: "💰", operations: "🔧", hr: "👥",
  retention: "🔁", collections: "⏰", analyst: "📊", compliance: "📋",
};

const naira = (n: number) => `₦${(n || 0).toLocaleString()}`;

export function ScaleDashboard() {
  const { data: overview } = useGetScaleOverviewQuery();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Default the open level to wherever the owner currently is, once diagnosed.
  useEffect(() => {
    if (selectedLevel === null && overview?.current_level) {
      setSelectedLevel(overview.current_level);
    }
  }, [overview?.current_level, selectedLevel]);

  const activeLevel = selectedLevel ?? overview?.current_level ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-emerald-600" /> Scale — Your 7 Levels
        </h1>
        <p className="text-slate-500 mt-1">Your roadmap from where you are to hitting your number. Click a level to work on it.</p>
      </div>

      <LevelLadder selectedLevel={activeLevel} onSelect={setSelectedLevel} />

      <LevelDetail level={activeLevel} />

      {/* Cross-cutting tools that apply across every level */}
      <Tabs defaultValue="scorecard">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="scorecard" className="gap-1"><Target className="h-4 w-4" /> Scorecard</TabsTrigger>
          <TabsTrigger value="engines" className="gap-1"><Sparkles className="h-4 w-4" /> Value Engines</TabsTrigger>
          <TabsTrigger value="team" className="gap-1"><Users2 className="h-4 w-4" /> Team Canvas</TabsTrigger>
          <TabsTrigger value="playbooks" className="gap-1"><BookOpen className="h-4 w-4" /> Playbooks</TabsTrigger>
          <TabsTrigger value="strategy" className="gap-1"><Star className="h-4 w-4" /> Strategy</TabsTrigger>
          <TabsTrigger value="focus" className="gap-1"><ListChecks className="h-4 w-4" /> Focus (Big 5)</TabsTrigger>
          <TabsTrigger value="time" className="gap-1"><Clock className="h-4 w-4" /> Time & Delegation</TabsTrigger>
        </TabsList>
        <TabsContent value="scorecard" className="mt-4"><ScorecardPanel /></TabsContent>
        <TabsContent value="engines" className="mt-4"><ValueEnginesPanel /></TabsContent>
        <TabsContent value="team" className="mt-4"><TeamCanvasPanel /></TabsContent>
        <TabsContent value="playbooks" className="mt-4"><PlaybooksPanel /></TabsContent>
        <TabsContent value="strategy" className="mt-4"><StrategyPanel /></TabsContent>
        <TabsContent value="focus" className="mt-4"><FocusPanel /></TabsContent>
        <TabsContent value="time" className="mt-4"><TimeDelegationPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

// Which levels have a live-data tracker panel (the rest are workbook-only).
const LEVEL_LIVE_PANEL: Record<number, () => JSX.Element> = {
  1: () => <NpsPanel />,
  2: () => <GrowthPanel />,
  4: () => <FinancePanel />,
};

// Per-level narrative: a tagline, the goal in one line, and an icon.
const LEVEL_META: Record<number, { tagline: string; goal: string; Icon: ElementType }> = {
  1: { tagline: "Prove it", goal: "Win 10 real customers and turn them into promoters — your proof the offer works.", Icon: Target },
  2: { tagline: "Grow it", goal: "Turn ad-hoc wins into a predictable growth flywheel that compounds every month.", Icon: TrendingUp },
  3: { tagline: "Systemize it", goal: "Document your playbooks and let your AI agents run the day-to-day.", Icon: Sparkles },
  4: { tagline: "Pay yourself", goal: "Install cash discipline so the business pays you first — profitably.", Icon: Wallet },
  5: { tagline: "Advise it", goal: "Surround yourself with mentors and peers who pull you up a level.", Icon: Users2 },
  6: { tagline: "Expand it", goal: "Add scale by acquiring, not just building — integrate your first deal.", Icon: CircleDollarSign },
  7: { tagline: "Arrive", goal: "Everything compounds into the revenue, profit and valuation you set.", Icon: Star },
};

function SectionLabel({ icon: Icon, title, hint }: { icon: ElementType; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <Icon className="h-4 w-4 text-emerald-600" />
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">{title}</h3>
      {hint && <span className="text-xs text-slate-400 dark:text-slate-500">· {hint}</span>}
    </div>
  );
}

function LevelHero({ level, name, status }: {
  level: number; name: string; status: "done" | "current" | "locked";
}) {
  const meta = LEVEL_META[level];
  const pill = status === "done"
    ? { label: "Completed", cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", Icon: Check }
    : status === "current"
    ? { label: "In progress", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", Icon: Sparkles }
    : { label: "Locked", cls: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300", Icon: Lock };
  const PillIcon = pill.Icon;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/25">
          <span className="text-[9px] font-semibold uppercase tracking-widest opacity-80">Level</span>
          <span className="text-2xl font-extrabold leading-none">{level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{name}</h2>
            {meta && <span className="rounded-full bg-white/80 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">{meta.tagline}</span>}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill.cls}`}>
              <PillIcon className="h-3 w-3" /> {pill.label}
            </span>
          </div>
          {meta && <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">{meta.goal}</p>}
        </div>
      </div>
    </div>
  );
}

function LevelDetail({ level }: { level: number }) {
  const { data } = useGetScaleOverviewQuery();
  const row = data?.levels.find((l) => l.level === level);
  const LivePanel = LEVEL_LIVE_PANEL[level];
  const current = data?.current_level ?? 1;
  const status: "done" | "current" | "locked" = row?.done ? "done" : level <= current ? "current" : "locked";

  return (
    <div className="space-y-5">
      <LevelHero level={level} name={row?.name ?? `Level ${level}`} status={status} />

      {/* Live tracker for this level (Promoters / Growth / Pay Yourself), if any */}
      {LivePanel && (
        <section className="space-y-2.5">
          <SectionLabel icon={TrendingUp} title="Live status" hint="pulled from your real data" />
          <LivePanel />
        </section>
      )}

      {/* Workbook for this level. L1–L6 map 1:1 to the planner steps; L7 is the finish line. */}
      {level <= 6 ? (
        <section className="space-y-2.5">
          <SectionLabel icon={Sparkles} title="Workbook" hint="fill this in — it saves automatically" />
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <ScalableImpactPlanner embedded hideChrome controlledStep={level} />
            </CardContent>
          </Card>
        </section>
      ) : (
        <L7Summary />
      )}
    </div>
  );
}

function L7Summary() {
  const { data, refetch } = useGetScaleOverviewQuery();
  const plan = data?.stated_plan;
  return (
    <section className="space-y-2.5">
      <SectionLabel icon={Star} title="Your finish line" hint="the number everything compounds toward" />
      <Card className="border-emerald-200 dark:border-emerald-900/40 rounded-xl bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-slate-900">
        <CardContent className="p-5">
          {plan?.has_plan && plan.target_revenue ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Revenue</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{naira(plan.target_revenue)}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Profit</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{plan.target_profit ? naira(plan.target_profit) : "—"}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Valuation</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{plan.target_valuation ? naira(plan.target_valuation) : "—"}</p>
              </div>
              {plan.why_summary && (
                <p className="sm:col-span-3 text-sm text-slate-600 dark:text-slate-300 pt-1">Your why: <em>{plan.why_summary}</em></p>
              )}
            </div>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-400">This finish line has no target yet — <NumberDialog onSaved={refetch} trigger={<button type="button" className="underline font-medium">set your Number</button>} />.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function NumberDialog({ trigger, onSaved }: { trigger: React.ReactNode; onSaved?: () => void }) {
  const { toast } = useToast();
  const { data: plan, refetch } = useGetGrowthPlanQuery();
  const [saveGrowthPlan, { isLoading }] = useSaveGrowthPlanMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ target_revenue: "", target_profit: "", target_valuation: "", why_summary: "" });

  useEffect(() => {
    if (plan) setForm({
      target_revenue: plan.target_revenue != null ? String(plan.target_revenue) : "",
      target_profit: plan.target_profit != null ? String(plan.target_profit) : "",
      target_valuation: plan.target_valuation != null ? String(plan.target_valuation) : "",
      why_summary: plan.why_summary ?? "",
    });
  }, [plan, open]);

  const save = async () => {
    if (!form.target_revenue) { toast({ title: "Enter at least a target revenue", variant: "destructive" }); return; }
    try {
      await saveGrowthPlan({
        target_revenue: form.target_revenue ? +form.target_revenue : undefined,
        target_profit: form.target_profit ? +form.target_profit : undefined,
        target_valuation: form.target_valuation ? +form.target_valuation : undefined,
        why_summary: form.why_summary || undefined,
      }).unwrap();
      toast({ title: "Your Number is set 🎯", description: "It now drives your roadmap and the AI Coach." });
      setOpen(false);
      refetch();
      onSaved?.();
    } catch { toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Set your Number — your 3-year target</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Where do you want the business in 3 years? This is your destination — it drives your whole 7-level roadmap and what the AI Coach advises.</p>
          <div><Label>Target revenue (₦ / year) *</Label><Input type="number" value={form.target_revenue} onChange={(e) => setForm(p => ({ ...p, target_revenue: e.target.value }))} placeholder="e.g. 50000000" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Target profit (₦ / year)</Label><Input type="number" value={form.target_profit} onChange={(e) => setForm(p => ({ ...p, target_profit: e.target.value }))} placeholder="e.g. 10000000" /></div>
            <div><Label>Target valuation (₦)</Label><Input type="number" value={form.target_valuation} onChange={(e) => setForm(p => ({ ...p, target_valuation: e.target.value }))} placeholder="optional" /></div>
          </div>
          <div><Label>Your why</Label><Textarea rows={3} value={form.why_summary} onChange={(e) => setForm(p => ({ ...p, why_summary: e.target.value }))} placeholder="Why does this number matter to you? (e.g. travel a month a year, fund a cause)" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={save} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Number"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LevelLadder({ selectedLevel, onSelect }: { selectedLevel: number; onSelect: (level: number) => void }) {
  const { data, isLoading, refetch } = useGetScaleOverviewQuery();
  if (isLoading) return <Skeleton className="h-28 w-full" />;
  if (!data) return null;
  const plan = data.stated_plan;
  return (
    <Card className="border-emerald-200">
      <CardContent className="p-4">
        {plan?.has_plan && plan.target_revenue ? (
          <div className="mb-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-sm"><span className="text-slate-500">Your Number (3-yr): </span><strong className="text-emerald-700">{naira(plan.target_revenue)}</strong> revenue
              {plan.target_profit ? <> · {naira(plan.target_profit)} profit</> : null}</span>
            {plan.why_summary && <span className="text-xs text-slate-500 italic">Why: {plan.why_summary}</span>}
            <NumberDialog onSaved={refetch} trigger={<button type="button" className="text-xs underline font-medium text-emerald-700 ml-auto">Edit</button>} />
          </div>
        ) : (
          <div className="mb-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700">
            You haven't set your Number yet — <NumberDialog onSaved={refetch} trigger={<button type="button" className="underline font-medium">set your Number now</button>} /> to define your 3-year target.
          </div>
        )}
        <p className="text-sm text-slate-500 mb-3">
          You're at <span className="font-bold text-emerald-700">Level {data.current_level}</span>. Focus only on this level — you can't skip ahead. Click any level to open it below.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {data.levels.map((l) => {
            const isCurrent = l.level === data.current_level;
            const isSelected = l.level === selectedLevel;
            return (
              <button key={l.level} type="button" onClick={() => onSelect(l.level)}
                className={`rounded-lg border p-2 text-center transition hover:shadow-md hover:opacity-100 ${
                  isSelected ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-500"
                  : l.done ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                  : isCurrent ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-slate-200 bg-slate-50 dark:bg-slate-800 opacity-70"}`}>
                <div className="flex items-center justify-center gap-1">
                  {l.done ? <Check className="h-3.5 w-3.5 text-green-600" />
                    : isCurrent ? <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    : <Lock className="h-3 w-3 text-slate-400" />}
                  <span className="text-xs font-bold">L{l.level}</span>
                </div>
                <p className="text-[11px] font-medium mt-1 leading-tight">{l.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{l.progress}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PlaybooksPanel() {
  const { toast } = useToast();
  const { data, isLoading } = useGetPlaybooksQuery();
  const [createPb] = useCreatePlaybookMutation();
  const [updatePb] = useUpdatePlaybookMutation();
  const [deletePb] = useDeletePlaybookMutation();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", engine: "growth", stage: "", playbook_owner: "", stepsText: "", notes: "" });

  const reset = () => setForm({ title: "", engine: "growth", stage: "", playbook_owner: "", stepsText: "", notes: "" });
  const openNew = () => { reset(); setEditId(null); setOpen(true); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({ title: p.title, engine: p.engine, stage: p.stage || "", playbook_owner: p.playbook_owner || "", stepsText: (p.steps || []).join("\n"), notes: p.notes || "" });
    setOpen(true);
  };
  const save = async () => {
    if (!form.title.trim()) { setOpen(false); return; }
    const body = {
      title: form.title, engine: form.engine, stage: form.stage || null,
      playbook_owner: form.playbook_owner || null, notes: form.notes || null,
      steps: form.stepsText.split("\n").map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editId) await updatePb({ id: editId, body }).unwrap();
      else await createPb(body).unwrap();
      toast({ title: editId ? "Playbook updated" : "Playbook created" });
      setOpen(false); reset();
    } catch { toast({ title: "Error", description: "Could not save", variant: "destructive" }); }
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  const playbooks = data?.playbooks ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <strong>Business Playbooks</strong> — step-by-step checklists for your power stages. One owner each, reviewed every 90 days ("always open").
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Playbook</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input placeholder="e.g. Collect overdue rent" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Value engine</Label>
                  <Select value={form.engine} onValueChange={(v) => setForm(p => ({ ...p, engine: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="fulfillment">Fulfillment</SelectItem>
                      <SelectItem value="innovation">Innovation</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Power stage</Label><Input placeholder="e.g. Rent overdue" value={form.stage} onChange={(e) => setForm(p => ({ ...p, stage: e.target.value }))} /></div>
              </div>
              <div><Label>Owner (who runs it — not the CEO)</Label><Input placeholder="e.g. Finance agent / manager name" value={form.playbook_owner} onChange={(e) => setForm(p => ({ ...p, playbook_owner: e.target.value }))} /></div>
              <div><Label>Steps (one per line)</Label><Textarea rows={5} placeholder={"1. …\n2. …\n3. …"} value={form.stepsText} onChange={(e) => setForm(p => ({ ...p, stepsText: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {playbooks.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-400">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          No playbooks yet. Document the 2–3 critical "power stages" of each value engine.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {playbooks.map((p) => (
            <Card key={p.id} className={p.review_overdue ? "border-amber-300" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="capitalize">{p.engine}</span>{p.stage ? ` · ${p.stage}` : ""}{p.playbook_owner ? ` · 👤 ${p.playbook_owner}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><BookOpen className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => deletePb(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside space-y-0.5">
                  {p.steps.slice(0, 6).map((s, i) => <li key={i}>{s}</li>)}
                  {p.steps.length > 6 && <li className="list-none text-slate-400">+{p.steps.length - 6} more…</li>}
                </ol>
                {p.review_overdue && <p className="text-xs text-amber-600 mt-2">⚠ Review overdue (90-day cycle)</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamCanvasPanel() {
  const { data, isLoading } = useGetTeamCanvasQuery();
  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Your <strong>High Output Team Canvas</strong> — who's accountable for each critical function. In Bami Host your AI agents are team members owning the power stages.
      </p>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">🤖 AI agent team</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.agents.map((a) => (
              <div key={a.key} className="flex items-center justify-between border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.accountability}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{a.output_30d} / 30d</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">👤 Human team</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.humans.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b py-1.5">
                <span className="font-medium">{h.name} {h.is_owner && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">owner</span>}</span>
                <span className="text-slate-400 text-xs">{h.role} · {h.estates} estate{h.estates !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={data.hiring.should_hire ? "border-amber-300" : ""}>
          <CardHeader className="pb-2"><CardTitle className="text-base">📈 Hiring signal (HR agent)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{data.hiring.active_tenants}</span>
              <span className="text-slate-400">/ {data.hiring.threshold} tenants</span>
            </div>
            <p className={`text-sm mt-2 ${data.hiring.should_hire ? "text-amber-700 font-medium" : "text-slate-500"}`}>{data.hiring.message}</p>
            {data.candidate_total > 0 && (
              <p className="text-xs text-slate-400 mt-2">{data.candidate_total} candidate{data.candidate_total !== 1 ? "s" : ""} in your pipeline.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <HiringPipelineCard />
    </div>
  );
}

const HIRE_STAGES = ["sourced", "screened", "interview", "offer", "hired", "rejected", "withdrawn"];
const STAGE_LABEL: Record<string, string> = {
  sourced: "Sourced", screened: "Screened", interview: "Interview", offer: "Offer",
  hired: "Hired", rejected: "Rejected", withdrawn: "Withdrawn",
};
const STAGE_COLOR: Record<string, string> = {
  sourced: "bg-slate-100 text-slate-700", screened: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700", offer: "bg-violet-100 text-violet-700",
  hired: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-500",
};

function HiringPipelineCard() {
  const { toast } = useToast();
  const { data, isLoading } = useGetCandidatesQuery({});
  const [createCandidate, { isLoading: adding }] = useCreateCandidateMutation();
  const [updateCandidate] = useUpdateCandidateMutation();
  const [deleteCandidate] = useDeleteCandidateMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", stage: "sourced", department: "", email: "", phone: "" });
  const candidates: any[] = data?.data ?? [];

  const add = async () => {
    if (!form.name.trim() || !form.role.trim()) { toast({ title: "Name and role are required", variant: "destructive" }); return; }
    try {
      await createCandidate({ ...form }).unwrap();
      toast({ title: "Candidate added", description: `${form.name} → ${STAGE_LABEL[form.stage]}` });
      setForm({ name: "", role: "", stage: "sourced", department: "", email: "", phone: "" });
      setOpen(false);
    } catch { toast({ title: "Couldn't add candidate", variant: "destructive" }); }
  };
  const move = async (id: string, stage: string) => {
    try { await updateCandidate({ id, body: { stage } }).unwrap(); }
    catch { toast({ title: "Couldn't update stage", variant: "destructive" }); }
  };
  const remove = async (id: string) => {
    try { await deleteCandidate(id).unwrap(); }
    catch { toast({ title: "Couldn't remove", variant: "destructive" }); }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">🧑‍💼 Hiring pipeline</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="h-4 w-4 mr-1" /> Add candidate</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add candidate</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ada Obi" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Role *</Label><Input value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Property manager" /></div>
                  <div><Label>Stage</Label>
                    <Select value={form.stage} onValueChange={(v) => setForm(p => ({ ...p, stage: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{HIRE_STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))} placeholder="optional" /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="optional" /></div>
                </div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="optional" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={add} disabled={adding}>{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-slate-400">When your HR agent flags it's time to hire, track candidates here from sourced → hired.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-16 w-full" /> : candidates.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No candidates yet. Add your first hire above.</p>
        ) : (
          <div className="space-y-1.5">
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 border-b py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name} <span className="text-slate-400 font-normal">· {c.role}</span></p>
                  {c.department && <p className="text-[11px] text-slate-400">{c.department}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={c.stage} onValueChange={(v) => move(c.id, v)}>
                    <SelectTrigger className={`h-7 w-28 text-xs ${STAGE_COLOR[c.stage] ?? ""}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{HIRE_STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
      {/* Per-agent 30-day output lives in the Team Canvas tab (with each agent's
          accountability) — not duplicated here, so the Scorecard stays focused on
          business truth (Evergreen + North Star). */}
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

      {data.model_10 && data.model_10.count > 0 && (
        <Card className="border-purple-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /> Model 10 — your best tenants, analysed</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.model_10.insights.length > 0 && (
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                {data.model_10.insights.map((s, i) => <li key={i}>💡 {s}</li>)}
              </ul>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-1">By estate</p>
                {Object.entries(data.model_10.by_estate).map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold">{v}</span></div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Avg rent (promoters)</p>
                <p className="text-lg font-bold text-purple-700">{naira(data.model_10.avg_rent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
      {/* Rate diagnostics — the numbers the Value Engines "Growth Engine" doesn't show
          (that view has the raw funnel counts + agents). This keeps L2 distinct. */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-lg border p-3 bg-white dark:bg-slate-800">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.conversion_pct}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Conversion — enquiries → tenants</p>
        </div>
        <div className="rounded-lg border p-3 bg-white dark:bg-slate-800">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.occupancy_pct}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Occupancy — units filled</p>
        </div>
        <div className="rounded-lg border p-3 bg-white dark:bg-slate-800">
          <p className="text-2xl font-bold text-emerald-700">{naira(data.monthly_target)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Flywheel target — /mo × 3 → unlock L3</p>
        </div>
      </div>

      {data.bottleneck && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-3 text-sm">
          <span className="font-semibold text-red-700 dark:text-red-300">⚠ Bottleneck: {data.bottleneck}</span>
          <span className="text-slate-500 dark:text-slate-400"> — the tightest stage throttling growth. See the full funnel in the <strong>Value Engines</strong> tab.</span>
        </div>
      )}

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
  const [form, setForm] = useState({ living_expenses: 0, target_monthly_salary: 0, target_profit_pct: 20, emergency_fund_target: 0, emergency_fund_current: 0, monthly_opex: 0, operating_reserve_current: 0, tax_pct: 0, tax_current: 0, sweep_current: 0 });

  useEffect(() => {
    if (data) setForm({
      living_expenses: data.living_expenses, target_monthly_salary: data.target_monthly_salary,
      target_profit_pct: data.target_profit_pct, emergency_fund_target: data.emergency_fund_target,
      emergency_fund_current: data.emergency_fund_current,
      monthly_opex: data.monthly_opex || 0, operating_reserve_current: data.operating_reserve_current || 0,
      tax_pct: data.tax_pct || 0, tax_current: data.tax_current || 0, sweep_current: data.sweep_current || 0,
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
   <div className="space-y-4">
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
            <Row label="Your current salary" value={naira(form.target_monthly_salary)} />
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
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Cash accounts (for the waterfall)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Monthly opex (₦)</Label><Input type="number" value={form.monthly_opex} onChange={(e) => setForm(p => ({ ...p, monthly_opex: +e.target.value }))} /></div>
              <div><Label>Operating reserve (₦)</Label><Input type="number" value={form.operating_reserve_current} onChange={(e) => setForm(p => ({ ...p, operating_reserve_current: +e.target.value }))} /></div>
              <div><Label>Tax set-aside (%)</Label><Input type="number" value={form.tax_pct} onChange={(e) => setForm(p => ({ ...p, tax_pct: +e.target.value }))} /></div>
              <div><Label>Tax account (₦)</Label><Input type="number" value={form.tax_current} onChange={(e) => setForm(p => ({ ...p, tax_current: +e.target.value }))} /></div>
              <div><Label>Sweep account (₦)</Label><Input type="number" value={form.sweep_current} onChange={(e) => setForm(p => ({ ...p, sweep_current: +e.target.value }))} /></div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full" onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save accounts"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    <CashWaterfallCard />
   </div>
  );
}

function CashWaterfallCard() {
  const { data } = useGetCashWaterfallQuery();
  if (!data) return null;
  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-emerald-600" /> Cash Sweep Waterfall</CardTitle>
        <p className="text-xs text-slate-400">Where every ₦ flows, in priority order. Next ₦ → <span className="text-emerald-700 font-medium">{data.next_destination}</span></p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.stages.map((s, i) => {
            const pct = s.target ? Math.min(100, Math.round((s.current / s.target) * 100)) : (s.done ? 100 : 0);
            const isNext = data.stages.findIndex(x => !x.done) === i;
            return (
              <div key={s.key} className={`rounded-lg border p-2.5 ${s.done ? "bg-green-50 dark:bg-green-900/20 border-green-200" : isNext ? "border-emerald-400 ring-1 ring-emerald-300" : "bg-slate-50 dark:bg-slate-800"}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-xs w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">{i + 1}</span>
                    {s.done ? "✅ " : ""}{s.label}
                  </span>
                  <span className="text-xs text-slate-500">{s.target ? `${naira(s.current)} / ${naira(s.target)}` : naira(s.current)}</span>
                </div>
                {s.target ? (
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full ${s.done ? "bg-green-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">Set your monthly operating expenses, tax %, and account balances in the fields above to drive this waterfall.</p>
      </CardContent>
    </Card>
  );
}

// ── Strategy (Starting Point / End Game / WHY / How + Taking Action) ─────────
// Restored from the old "Defining Your Number" page. These are NOT duplicates
// of anything already in Scale — the embedded planner's newer 6-step workbook
// never rendered this content, so this was the only working UI for it.
// Persisted to the real growth_plan API (same fields as before), not localStorage.

const DEFAULT_STARTING_POINT = {
  currentRevenue: "", currentProfit: "", currentProfitMargin: "", currentValuation: "",
  assessmentDate: "", revenueSource: "", businessStage: "owner-dependent" as "owner-dependent" | "professionalized",
};
const DEFAULT_END_GAME = {
  targetRevenue: "", targetProfit: "", targetValuation: "", timeframe: "3-year" as "3-year",
  growthStrategy: "", selectedBenchmark: "", targetProfitMargin: "",
};
const DEFAULT_WHY = {
  me: { personalGoals: "", motivation: "", skillsDevelopment: "", personalWhy: "" },
  us: { teamVision: "", companyMission: "", culturalValues: "", collectiveWhy: "" },
  them: { customerImpact: "", marketProblem: "", socialContribution: "", externalWhy: "" },
};
const DEFAULT_HOW = { action1: "", action2: "", action3: "", action4: "", action5: "" };
const DEFAULT_TAKING_ACTION = { currentAction1: "", currentAction2: "", currentAction3: "" };

function StrategyPanel() {
  const { toast } = useToast();
  const { data: plan, isLoading, isSuccess } = useGetGrowthPlanQuery();
  const [saveGrowthPlan] = useSaveGrowthPlanMutation();
  const [subTab, setSubTab] = useState("starting-point");

  const [startingPointData, setStartingPointData] = useState(DEFAULT_STARTING_POINT);
  const [endGameData, setEndGameData] = useState(DEFAULT_END_GAME);
  const [whyStatement, setWhyStatement] = useState(DEFAULT_WHY);
  const [howStatement, setHowStatement] = useState(DEFAULT_HOW);
  const [takingActionItems, setTakingActionItems] = useState(DEFAULT_TAKING_ACTION);
  const hydratedRef = useState(() => ({ done: false }))[0];

  useEffect(() => {
    if (!isSuccess || hydratedRef.done) return;
    hydratedRef.done = true;
    const d = plan?.exists ? (plan.data || {}) : {};
    if (d.starting_data) setStartingPointData(d.starting_data);
    if (d.endgame_data) setEndGameData(d.endgame_data);
    if (d.why) setWhyStatement(d.why);
    if (d.how) setHowStatement(d.how);
    if (d.taking_action) setTakingActionItems(d.taking_action);
  }, [isSuccess, plan, hydratedRef]);

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        The strategic groundwork behind your Number — where you stand today, your 3-year destination, your WHY,
        and the 5 actions that get you there.
      </p>
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="starting-point">Starting Point</TabsTrigger>
          <TabsTrigger value="end-game">End Game</TabsTrigger>
          <TabsTrigger value="why">WHY</TabsTrigger>
          <TabsTrigger value="focus5">How + Taking Action</TabsTrigger>
        </TabsList>

        <TabsContent value="starting-point" className="space-y-6 mt-4">
          <StartingPointSection
            data={startingPointData}
            onDataChange={setStartingPointData}
            onComplete={async () => {
              try {
                await saveGrowthPlan({ data: { starting_data: startingPointData } }).unwrap();
                toast({ title: "Starting point saved", description: "We updated your current metrics." });
              } catch { toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" }); }
            }}
          />
        </TabsContent>

        <TabsContent value="end-game" className="space-y-6 mt-4">
          <EndGameSection
            data={endGameData}
            startingPoint={startingPointData}
            onDataChange={setEndGameData}
            onComplete={async () => {
              const num = (v: string) => { const n = parseFloat(String(v || "").replace(/[^\d.]/g, "")); return isNaN(n) ? undefined : n; };
              try {
                await saveGrowthPlan({
                  data: { endgame_data: endGameData },
                  target_revenue: num(endGameData.targetRevenue),
                  target_profit: num(endGameData.targetProfit),
                  target_valuation: num(endGameData.targetValuation),
                }).unwrap();
                toast({ title: "End game set", description: "Your 3-year targets were saved — this also updates Your Number." });
              } catch { toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" }); }
            }}
          />
        </TabsContent>

        <TabsContent value="why" className="space-y-6 mt-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base text-blue-800">Start with these three questions</CardTitle>
              <CardDescription className="text-blue-700">Use them to guide your WHY for the next 3 years</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="text-xs font-semibold text-blue-600 mb-1">THE "ME" QUESTION</div>
                  <div className="text-sm font-bold">How do I want my life to look in 3 years?<br />What is my Level 7 Life?</div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <div className="text-xs font-semibold text-blue-600 mb-1">THE "US" QUESTION</div>
                  <div className="text-sm font-bold">What do I want for the people closest to me?</div>
                  <div className="text-xs text-muted-foreground">Family / Partners / Key Execs</div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                  <div className="text-xs font-semibold text-blue-600 mb-1">THE "THEM" QUESTION</div>
                  <div className="text-sm font-bold">What dent do I want to make in my little corner of the universe?</div>
                  <div className="text-xs text-muted-foreground">Industry / Community</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <WhySection
                whyStatement={whyStatement}
                setWhyStatement={setWhyStatement}
                onSave={async () => {
                  const w = whyStatement;
                  const why_summary = [w.me.personalWhy, w.us.collectiveWhy || w.us.companyMission, w.them.externalWhy || w.them.customerImpact]
                    .filter(Boolean).join(" · ") || undefined;
                  try {
                    await saveGrowthPlan({ data: { why: whyStatement }, why_summary }).unwrap();
                    toast({ title: "WHY saved", description: "Your impact statement has been saved — this also updates Your Number's why." });
                  } catch { toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" }); }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus5" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent>
                <HowSection
                  howStatement={howStatement}
                  setHowStatement={setHowStatement}
                  onSave={async () => {
                    try {
                      await saveGrowthPlan({ data: { how: howStatement } }).unwrap();
                      toast({ title: "Focus 5 saved", description: "Your 5 key actions have been saved." });
                    } catch { toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" }); }
                  }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <TakingActionSection
                  takingActionItems={takingActionItems}
                  setTakingActionItems={setTakingActionItems}
                  onSave={async () => {
                    try {
                      await saveGrowthPlan({ data: { taking_action: takingActionItems } }).unwrap();
                      toast({ title: "Action plan saved", description: "Your current initiatives were saved." });
                    } catch { toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" }); }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls?: string }) {
  return <div><p className={`text-2xl font-bold ${cls ?? "text-slate-900 dark:text-white"}`}>{value}</p><p className="text-xs text-slate-400">{label}</p></div>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span className="font-semibold">{value}</span></div>;
}

// ── Focus (Big 5) — the few things only the owner should personally own ──────
// Moved here from the old standalone "Defining Your Number" page, which was
// merged into Scale. Persisted to the real growth_plan API (data.big5_items) —
// same shape as before, so nothing anyone already filled in is lost.

interface BigItem { id: string; title: string; description?: string; }
const createBig5Item = (): BigItem => ({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, title: "", description: "" });
const DEFAULT_BIG5_ITEMS = [createBig5Item(), createBig5Item(), createBig5Item(), createBig5Item(), createBig5Item()];

function FocusPanel() {
  const { toast } = useToast();
  const { data: plan, isLoading, isSuccess } = useGetGrowthPlanQuery();
  const [saveGrowthPlan, { isLoading: saving }] = useSaveGrowthPlanMutation();
  const [items, setItems] = useState<BigItem[]>(DEFAULT_BIG5_ITEMS);
  const hydratedRef = useState(() => ({ done: false }))[0];

  useEffect(() => {
    if (!isSuccess || hydratedRef.done) return;
    hydratedRef.done = true;
    const saved = plan?.exists ? plan.data?.big5_items : null;
    if (Array.isArray(saved) && saved.length) setItems(saved);
  }, [isSuccess, plan, hydratedRef]);

  const filledCount = useMemo(() => items.filter((i) => i.title?.trim()).length, [items]);

  const persist = async (next: BigItem[]) => {
    try {
      await saveGrowthPlan({ data: { big5_items: next } }).unwrap();
    } catch {
      toast({ title: "Couldn't save your Big 5", description: "Please try again.", variant: "destructive" });
    }
  };
  const save = () => persist(items).then(() => toast({ title: "Big 5 saved" }));
  const reset = () => { setItems([]); persist([]); };
  const addItem = () => setItems((prev) => [...prev, createBig5Item()]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const moveItem = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const [spliced] = next.splice(index, 1);
      next.splice(newIndex, 0, spliced);
      return next;
    });
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Your <strong>Big 5</strong> — the few things only you should personally own. Keep each item crisp and
        action-oriented; everything else is a candidate for the <strong>Time & Delegation</strong> tab.
      </p>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <div className="text-sm font-medium">Big 5 Items completed</div>
          </div>
          <div className="text-2xl font-bold">{filledCount}/{items.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Your Big Items</CardTitle>
              <CardDescription>Keep each item crisp and action-oriented.</CardDescription>
            </div>
            <Button size="sm" onClick={addItem} className="gap-2"><Plus className="w-4 h-4" /> Add item</Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No items yet. Click "Add item" to get started.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {items.map((item, i) => (
                <div key={item.id} className="rounded-lg border bg-card p-4">
                  <div className="text-sm font-medium mb-2">{i + 1}. {item.title?.trim() || "Add a title"}</div>
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap">{item.description?.trim() || "Optional description"}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit your list</CardTitle>
          <CardDescription>Write what you own and will focus on. Add, remove, and reorder freely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Your list is empty.
              <Button size="sm" variant="outline" onClick={addItem} className="gap-2"><Plus className="w-4 h-4" /> Add first item</Button>
            </div>
          )}
          {items.map((item, idx) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{idx + 1}. Title</div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveItem(idx, -1)} disabled={idx === 0} title="Move up"><ArrowUp className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} title="Move down"><ArrowDown className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} title="Remove"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <Input
                placeholder="e.g. Create and publish content & be the face of the business"
                value={item.title}
                onChange={(e) => { const next = [...items]; next[idx] = { ...item, title: e.target.value }; setItems(next); }}
              />
              <div className="text-xs text-muted-foreground">Optional note</div>
              <Textarea
                placeholder="Add details if helpful (e.g., frequency, scope, ownership)"
                value={item.description}
                onChange={(e) => { const next = [...items]; next[idx] = { ...item, description: e.target.value }; setItems(next); }}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving} className="gap-2"><Save className="w-4 h-4" /> Save</Button>
            <Button variant="outline" onClick={reset} disabled={saving} className="gap-2"><RefreshCw className="w-4 h-4" /> Clear all</Button>
            <Button variant="outline" onClick={addItem} className="gap-2"><Plus className="w-4 h-4" /> Add another</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Time & Delegation ("King's Audit") ────────────────────────────────────────
// Also moved from the old "Defining Your Number" page. Tracks where time
// actually goes, values it against your hourly rate, and builds a delegation
// list. Complements Team Canvas's Hiring signal/pipeline (which tracks
// candidates/people) — this tracks TASKS worth delegating and their cost.

const DEFAULT_HOURLY_RATE_CONFIG: HourlyRateConfig = { weeklyIncome: 50000, workHoursPerWeek: 40, calculatedRate: 1250, lastUpdated: new Date() };

function TimeDelegationPanel() {
  const { toast } = useToast();
  const { data: plan, isLoading, isSuccess } = useGetGrowthPlanQuery();
  const [saveGrowthPlan] = useSaveGrowthPlanMutation();

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [delegationItems, setDelegationItems] = useState<DelegationItem[]>([]);
  const [hourlyRateConfig, setHourlyRateConfig] = useState<HourlyRateConfig>(DEFAULT_HOURLY_RATE_CONFIG);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<"big5" | "below-the-line">("big5");
  const [weeklyIncomeInput, setWeeklyIncomeInput] = useState(String(DEFAULT_HOURLY_RATE_CONFIG.weeklyIncome));
  const [workHoursInput, setWorkHoursInput] = useState(String(DEFAULT_HOURLY_RATE_CONFIG.workHoursPerWeek));
  const hydratedRef = useState(() => ({ done: false }))[0];

  useEffect(() => {
    if (!isSuccess || hydratedRef.done) return;
    hydratedRef.done = true;
    const d = plan?.exists ? (plan.data || {}) : {};
    if (Array.isArray(d.time_entries)) setTimeEntries(d.time_entries);
    if (Array.isArray(d.tasks)) setTasks(d.tasks);
    if (Array.isArray(d.delegation_items)) setDelegationItems(d.delegation_items);
    if (d.hourly_rate_config) {
      setHourlyRateConfig(d.hourly_rate_config);
      setWeeklyIncomeInput(String(d.hourly_rate_config.weeklyIncome));
      setWorkHoursInput(String(d.hourly_rate_config.workHoursPerWeek));
    }
  }, [isSuccess, plan, hydratedRef]);

  const persist = (key: string, value: unknown) => {
    saveGrowthPlan({ data: { [key]: value } }).unwrap().catch(() => {
      toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
    });
  };

  const productivityAnalysis = useMemo(() => analyzeProductivity(timeEntries, hourlyRateConfig.calculatedRate), [timeEntries, hourlyRateConfig.calculatedRate]);
  const big5Tasks = useMemo(() => tasks.filter((t) => t.category === "big5"), [tasks]);
  const belowTheLineTasks = useMemo(() => tasks.filter((t) => t.category === "below-the-line"), [tasks]);

  const startTimeTracking = (task: string, category: "big5" | "below-the-line") => {
    if (currentTimeEntry) stopTimeTracking();
    setCurrentTimeEntry({
      id: `time_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      task, category, startTime: new Date(), hourlyRate: hourlyRateConfig.calculatedRate,
    });
  };
  const stopTimeTracking = () => {
    if (!currentTimeEntry) return;
    const endTime = new Date();
    const duration = calculateDuration(currentTimeEntry.startTime, endTime);
    const value = calculateTimeValue(duration, hourlyRateConfig.calculatedRate);
    const updated = [...timeEntries, { ...currentTimeEntry, endTime, duration, value }];
    setTimeEntries(updated);
    persist("time_entries", updated);
    setCurrentTimeEntry(null);
  };
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const updated = [...tasks, createTask(newTaskTitle, newTaskCategory)];
    setTasks(updated);
    persist("tasks", updated);
    setNewTaskTitle("");
  };
  const toggleTaskCompletion = (taskId: string) => {
    const updated = tasks.map((t) => t.id === taskId ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date() : undefined } : t);
    setTasks(updated);
    persist("tasks", updated);
  };
  const moveTaskToDelegation = (task: TaskItem) => {
    const delegationItem = createDelegationItem(task.title, hourlyRateConfig.calculatedRate * 2, "within-week");
    const updatedDelegation = [...delegationItems, delegationItem];
    setDelegationItems(updatedDelegation);
    persist("delegation_items", updatedDelegation);
    const updatedTasks = tasks.map((t) => t.id === task.id ? { ...t, isDelegated: true } : t);
    setTasks(updatedTasks);
    persist("tasks", updatedTasks);
  };
  const updateHourlyRate = () => {
    const newConfig = updateHourlyRateConfig(parseFloat(weeklyIncomeInput) || 0, parseFloat(workHoursInput) || 0);
    setHourlyRateConfig(newConfig);
    persist("hourly_rate_config", newConfig);
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Track where your time actually goes, value it against your hourly rate, and build a delegation list —
        for people/candidates, see the <strong>Team Canvas</strong> tab's hiring pipeline instead.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-green-500" /><div className="text-sm font-medium">Big 5 Focus</div></div>
          <div className="text-2xl font-bold">{Math.round(productivityAnalysis.big5Percentage)}%</div>
          <div className="text-xs text-muted-foreground">of tracked time</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-yellow-500" /><div className="text-sm font-medium">Potential Savings</div></div>
          <div className="text-2xl font-bold">₦{Math.round(productivityAnalysis.potentialSavings).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">delegation opportunity</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-600" /><div className="text-sm font-medium">Hourly Rate</div></div>
          <div className="text-2xl font-bold">₦{hourlyRateConfig.calculatedRate.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">per hour</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hourly Rate Calculator</CardTitle>
          <CardDescription>Configure your hourly rate for accurate time-tracking value</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Weekly Income (₦)</label>
              <Input type="number" value={weeklyIncomeInput} onChange={(e) => setWeeklyIncomeInput(e.target.value)} placeholder="50000" />
            </div>
            <div>
              <label className="text-sm font-medium">Work Hours/Week</label>
              <Input type="number" value={workHoursInput} onChange={(e) => setWorkHoursInput(e.target.value)} placeholder="40" />
            </div>
            <div className="flex flex-col justify-end">
              <Button onClick={updateHourlyRate} className="gap-2"><Save className="w-4 h-4" /> Update Rate</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentTimeEntry && (
        <Card className="border-destructive">
          <CardHeader><CardTitle className="text-base text-destructive">Active Time Entry</CardTitle><CardDescription>Currently tracking: {currentTimeEntry.task}</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Started: {new Date(currentTimeEntry.startTime).toLocaleTimeString()}</div>
              <Button onClick={stopTimeTracking} variant="destructive" className="gap-2"><Square className="w-4 h-4" /> Stop Tracking</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Start Time Tracking</CardTitle><CardDescription>Track your activities to analyze productivity</CardDescription></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button onClick={() => startTimeTracking("Big 5 Activity", "big5")} disabled={!!currentTimeEntry} className="gap-2 h-20 flex-col" variant="outline">
              <Target className="w-6 h-6 text-blue-500" />
              <div className="text-center"><div className="font-medium">Track Big 5 Activity</div><div className="text-xs text-muted-foreground">High-value strategic work</div></div>
            </Button>
            <Button onClick={() => startTimeTracking("Below the Line Task", "below-the-line")} disabled={!!currentTimeEntry} className="gap-2 h-20 flex-col" variant="outline">
              <Clock className="w-6 h-6 text-orange-500" />
              <div className="text-center"><div className="font-medium">Track Below the Line</div><div className="text-xs text-muted-foreground">Delegatable tasks</div></div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {timeEntries.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Time Entries</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {timeEntries.slice(-10).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-sm font-medium">{entry.task}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.category === "big5" ? "🎯 Big 5" : "⏰ Below the Line"} · {formatDuration(entry.duration || 0)} · {formatHiringDate(new Date(entry.startTime))}
                    </div>
                  </div>
                  <div className="text-sm font-medium">₦{(entry.value || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Add New Task</CardTitle><CardDescription>Categorize tasks as Big 5 (strategic) or Below the Line (delegatable)</CardDescription></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Enter task description..." onKeyDown={(e) => e.key === "Enter" && addTask()} />
            <Select value={newTaskCategory} onValueChange={(v: "big5" | "below-the-line") => setNewTaskCategory(v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="big5">🎯 Big 5</SelectItem><SelectItem value="below-the-line">⏰ Below the Line</SelectItem></SelectContent>
            </Select>
            <Button onClick={addTask} disabled={!newTaskTitle.trim()} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-blue-500" /> Big 5 Tasks ({big5Tasks.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {big5Tasks.length === 0 ? <div className="text-sm text-muted-foreground">No Big 5 tasks yet</div> : big5Tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 p-2 border rounded">
                <input type="checkbox" checked={task.isCompleted} onChange={() => toggleTaskCompletion(task.id)} className="rounded" />
                <span className={`text-sm ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Below the Line Tasks ({belowTheLineTasks.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {belowTheLineTasks.length === 0 ? <div className="text-sm text-muted-foreground">No delegation candidates yet</div> : belowTheLineTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <input type="checkbox" checked={task.isCompleted} onChange={() => toggleTaskCompletion(task.id)} className="rounded" />
                  <span className={`text-sm ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                </div>
                {!task.isDelegated && !task.isCompleted && (
                  <Button size="sm" variant="outline" onClick={() => moveTaskToDelegation(task)} className="gap-1"><ArrowUp className="w-3 h-3" /> Delegate</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delegation List</CardTitle>
          <CardDescription>Tasks ready for delegation or outsourcing. Total estimated cost: ₦{delegationItems.reduce((sum, item) => sum + item.estimatedCost, 0).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          {delegationItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground mb-4">No items in delegation list yet.</div>
              <div className="text-xs text-muted-foreground">Move "Below the Line" tasks here to prepare for delegation.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {delegationItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.task}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Estimated Cost: ₦{item.estimatedCost.toLocaleString()}</span>
                        <span>Urgency: {item.urgency.replace("-", " ")}</span>
                        <span>Added: {formatHiringDate(new Date(item.createdAt))}</span>
                      </div>
                    </div>
                    <Badge variant={item.urgency === "immediate" ? "destructive" : item.urgency === "within-week" ? "default" : "secondary"}>{item.urgency}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {delegationItems.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader><CardTitle className="text-base text-blue-800">Hiring Recommendation</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700"><strong>Analysis:</strong> You have {delegationItems.length} tasks ready for delegation with estimated total cost of ₦{delegationItems.reduce((sum, item) => sum + item.estimatedCost, 0).toLocaleString()}.</div>
            <div className="text-sm text-blue-700 mt-2"><strong>Recommendation:</strong> {productivityAnalysis.recommendedAction.replace("-", " ").toUpperCase()}</div>
            <div className="text-sm text-blue-700 mt-2"><strong>Potential Monthly Savings:</strong> ₦{Math.round(productivityAnalysis.potentialSavings * 4.33).toLocaleString()}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
