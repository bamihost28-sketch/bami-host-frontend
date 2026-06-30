import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ChevronDown, ChevronUp, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useGetHealthScoreQuery } from "@/services/autopilotApi";

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 50 50)" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
        fontSize="20" fontWeight="bold" fill={color}>{score}</text>
    </svg>
  );
}

function healthLabel(score: number) {
  if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-700" };
  if (score >= 65) return { label: "Good", color: "bg-blue-100 text-blue-700" };
  if (score >= 50) return { label: "Fair", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Needs Attention", color: "bg-red-100 text-red-700" };
}

export function BusinessHealthWidget() {
  const { data, isLoading, refetch, isFetching } = useGetHealthScoreQuery();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return (
    <Card><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>
  );

  const overall = data?.score?.overall ?? 0;
  const { label, color } = healthLabel(overall);
  const dimensions: any[] = data?.score?.dimensions ?? [];
  const topActions: string[] = data?.score?.top_actions ?? [];
  const m = data?.metrics ?? {};

  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Business Health Score
          </CardTitle>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isFetching}
              className="text-slate-400 hover:text-slate-600">
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setExpanded(e => !e)} className="text-slate-400 hover:text-slate-600">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Score + quick KPIs */}
        <div className="flex items-center gap-6">
          <ScoreRing score={overall} />
          <div className="flex-1 space-y-2">
            <Badge className={color}>{label}</Badge>
            <p className="text-xs text-slate-500 line-clamp-2">{data?.score?.summary}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-slate-500">Occupancy</span>
              <span className="font-semibold">{m.occupancy_rate}%</span>
              <span className="text-slate-500">Collection</span>
              <span className="font-semibold">{m.collection_rate}%</span>
              <span className="text-slate-500">Overdue</span>
              <span className={`font-semibold ${m.overdue_tenants > 0 ? "text-red-600" : "text-green-600"}`}>
                {m.overdue_tenants} tenants
              </span>
              <span className="text-slate-500">Open Issues</span>
              <span className={`font-semibold ${m.open_issues > 3 ? "text-amber-600" : ""}`}>{m.open_issues}</span>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Dimension bars */}
            {dimensions.length > 0 && (
              <div className="space-y-2.5">
                {dimensions.map((d: any) => {
                  const pct = Math.round((d.score / d.max) * 100);
                  const barColor = pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400";
                  return (
                    <div key={d.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">{d.name}</span>
                        <span className="font-bold">{d.score}/{d.max}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      {d.comment && <p className="text-xs text-slate-400 mt-0.5">{d.comment}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Top actions */}
            {topActions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Top Actions to Improve Score
                </p>
                <ul className="space-y-1.5">
                  {topActions.map((a, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600">
                      <span className="text-blue-500 flex-shrink-0">→</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
