import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { useGetAnalyticsQuery } from '@/services/billionaireApi';
import { BLOCK_STYLES } from './constants';

export default function Analyzer8020() {
  const { data, isLoading } = useGetAnalyticsQuery({ days: 30 });
  const split = data?.timeSplit ?? { signal: 0, noise: 0, reminder: 0, neutral: 0 };
  const timeSnr = data?.timeSnr ?? 0;
  const kings = data?.kingsSplit ?? { high: 0, low: 0 };

  const totalBlocks = split.signal + split.noise + split.reminder + split.neutral;
  const totalKings = kings.high + kings.low;
  const maxSplit = Math.max(split.signal, split.noise, split.reminder, split.neutral, 1);

  const rows: { key: keyof typeof split; label: string }[] = [
    { key: 'signal', label: 'Signal (high-yield)' },
    { key: 'noise', label: 'Noise (low-yield)' },
    { key: 'reminder', label: 'Reminders' },
    { key: 'neutral', label: 'Neutral' },
  ];

  return (
    <div className="space-y-6">
      {/* The framework's stated principle (labelled reference, not your data) */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <Percent className="w-7 h-7 mb-2 opacity-80" />
            <p className="text-3xl font-bold">Top 20% → 80%</p>
            <p className="text-emerald-50 text-sm mt-1">of activities generate 80% of revenue</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <CardContent className="p-6">
            <Percent className="w-7 h-7 mb-2 opacity-80" />
            <p className="text-3xl font-bold">Top 4% → 64%</p>
            <p className="text-slate-300 text-sm mt-1">of activities generate 64% of revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Real: where your tracked time actually goes (last 30 days of Time Audit) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Where Your Time Actually Goes
          </CardTitle>
          <CardDescription>
            Your real time-audit blocks over the last 30 days. Are you living in the signal?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && totalBlocks === 0 && (
            <p className="text-sm text-muted-foreground">
              No time blocks logged yet. Build your schedule in the Time Audit tab to see your real signal-vs-noise split.
            </p>
          )}
          {totalBlocks > 0 && (
            <>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <span className="text-sm text-muted-foreground">Your time SNR (signal ÷ signal+noise)</span>
                <span className={`text-2xl font-bold ${timeSnr >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>{timeSnr}%</span>
              </div>
              {rows.map((r) => {
                const v = split[r.key];
                return (
                  <div key={r.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{r.label}</span>
                      <span className="text-muted-foreground">{v} block{v === 1 ? '' : 's'}</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${BLOCK_STYLES[r.key].dot}`} style={{ width: `${(v / maxSplit) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Real: King's Audit composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Activity Mix</CardTitle>
          <CardDescription>From your King's Audit — the balance you're aiming to shift toward high-yield.</CardDescription>
        </CardHeader>
        <CardContent>
          {totalKings === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing in your King's Audit yet. Add your activities there to see the balance.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                <TrendingUp className="w-5 h-5 text-emerald-600 mb-1" />
                <p className="text-2xl font-bold text-emerald-700">{kings.high}</p>
                <p className="text-xs text-emerald-700/80">high-yield (your 4%)</p>
              </div>
              <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                <TrendingDown className="w-5 h-5 text-red-500 mb-1" />
                <p className="text-2xl font-bold text-red-600">{kings.low}</p>
                <p className="text-xs text-red-600/80">low-yield (delegate / delete)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
