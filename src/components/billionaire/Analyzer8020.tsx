import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Percent } from 'lucide-react';
import { ANALYZER_DATA } from './constants';

export default function Analyzer8020() {
  const max = Math.max(...ANALYZER_DATA.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
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

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> 80/20 Analyzer
          </CardTitle>
          <CardDescription>Estimated revenue contribution by activity. Green = high-yield, red = low-yield.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ANALYZER_DATA.map((d) => (
            <div key={d.activity}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{d.activity}</span>
                <span className="text-muted-foreground">{d.value}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${d.yield === 'high' ? 'bg-emerald-500' : 'bg-red-400'}`}
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
