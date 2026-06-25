import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Crown, Target, Clock, Gauge, Zap, CalendarClock, BarChart3, Calculator, BookOpen, Flame, TrendingUp,
} from 'lucide-react';
import { useGetSummaryQuery, useGetAnalyticsQuery, useGetKingsAuditQuery } from '@/services/billionaireApi';
import { localDate } from './constants';
import SignalWindow from './SignalWindow';
import TimeAudit from './TimeAudit';
import KingsAudit from './KingsAudit';
import Analyzer8020 from './Analyzer8020';
import TimeValueCalculator from './TimeValueCalculator';
import Playbook from './Playbook';

export default function BillionaireOS() {
  const today = localDate();
  const { data } = useGetSummaryQuery({ day: today });
  const { data: analytics } = useGetAnalyticsQuery({ days: 7 });
  const { data: kings } = useGetKingsAuditQuery();

  const snr = data?.snrScore ?? 96;
  const done = data?.missionsDone ?? 0;
  const total = data?.missionsTotal ?? 0;
  const streak = analytics?.streak ?? 0;
  const completion = analytics?.completionRate ?? 0;
  const daily = analytics?.daily ?? [];
  const fourPercent = kings?.high ?? [];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Billionaire OS</h1>
            <p className="text-sm text-muted-foreground">Your 18-hour personal operating system · 96% signal, 4% noise</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Signal-to-Noise</p>
          <p className="text-3xl font-bold text-emerald-600">{snr}%</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="dashboard" className="gap-1.5"><Gauge className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
          <TabsTrigger value="signal" className="gap-1.5"><Target className="w-4 h-4" /><span className="hidden sm:inline">Signal</span></TabsTrigger>
          <TabsTrigger value="time" className="gap-1.5"><CalendarClock className="w-4 h-4" /><span className="hidden sm:inline">Time Audit</span></TabsTrigger>
          <TabsTrigger value="kings" className="gap-1.5"><Crown className="w-4 h-4" /><span className="hidden sm:inline">King's Audit</span></TabsTrigger>
          <TabsTrigger value="analyzer" className="gap-1.5"><BarChart3 className="w-4 h-4" /><span className="hidden sm:inline">80/20</span></TabsTrigger>
          <TabsTrigger value="value" className="gap-1.5"><Calculator className="w-4 h-4" /><span className="hidden sm:inline">Time Value</span></TabsTrigger>
          <TabsTrigger value="playbook" className="gap-1.5"><BookOpen className="w-4 h-4" /><span className="hidden sm:inline">Playbook</span></TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={<Target className="w-5 h-5" />} label="Missions Done" value={`${done}/${total || 0}`} sub="today's signal" />
            <MetricCard icon={<Gauge className="w-5 h-5" />} label="SNR Score" value={`${snr}%`} sub="signal vs noise" />
            <MetricCard icon={<Flame className="w-5 h-5" />} label="Streak" value={`${streak}`} sub={streak === 1 ? 'day' : 'days'} />
            <MetricCard icon={<TrendingUp className="w-5 h-5" />} label="7-Day Completion" value={`${completion}%`} sub="missions completed" />
          </div>

          {/* SNR bar */}
          <Card>
            <CardHeader><CardTitle className="text-base">Today's Signal Progress</CardTitle></CardHeader>
            <CardContent>
              <Progress value={snr} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {total === 0
                  ? 'No missions set yet — head to the Signal tab to set your 3–5 for today.'
                  : `${done} of ${total} missions complete. Drive your SNR to 100% by finishing them all.`}
              </p>
            </CardContent>
          </Card>

          {/* 7-day SNR trend (real data) */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4 text-emerald-600" /> 7-Day SNR Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {daily.map((d) => {
                  const val = d.snr ?? 0;
                  // map 90–100 range to bar height for visual contrast
                  const pct = d.snr === null ? 0 : Math.max(8, ((val - 90) / 10) * 100);
                  const label = new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t transition-all ${d.snr === null ? 'bg-muted' : 'bg-emerald-500'}`}
                          style={{ height: `${pct}%` }}
                          title={d.snr === null ? 'No missions' : `${d.snr}% · ${d.done}/${d.total}`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                      <span className="text-[10px] font-medium">{d.snr === null ? '–' : `${Math.round(val)}`}</span>
                    </div>
                  );
                })}
                {daily.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Today's missions preview */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="w-4 h-4 text-emerald-600" /> Today's Missions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(data?.missions ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nothing set yet.</p>}
                {(data?.missions ?? []).map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                    <span className={`flex-1 ${m.completed ? 'line-through text-muted-foreground' : ''}`}>{m.title}</span>
                    {m.completed && <Badge className="bg-emerald-500 text-xs">Done</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Your 4% — from King's Audit high-yield items (real data) */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="w-4 h-4 text-amber-500" /> Your 4% Activities</CardTitle></CardHeader>
              <CardContent>
                {fourPercent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Define these in the King's Audit tab — your high-yield 20% activities will appear here.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {fourPercent.map((a) => (
                      <Badge key={a.id} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{a.text}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Active window: 18 hrs (4 AM – 10 PM) · the 4% rule: 4% of activities drive 64% of revenue.
          </div>
        </TabsContent>

        <TabsContent value="signal" className="mt-6"><SignalWindow /></TabsContent>
        <TabsContent value="time" className="mt-6"><TimeAudit /></TabsContent>
        <TabsContent value="kings" className="mt-6"><KingsAudit /></TabsContent>
        <TabsContent value="analyzer" className="mt-6"><Analyzer8020 /></TabsContent>
        <TabsContent value="value" className="mt-6"><TimeValueCalculator /></TabsContent>
        <TabsContent value="playbook" className="mt-6"><Playbook /></TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">{icon}<span className="text-xs">{label}</span></div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
