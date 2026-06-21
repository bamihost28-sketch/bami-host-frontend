import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetMyMeterHistoryQuery } from "@/services/meterApi";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function MeterHistory({ open, onOpenChange }: Props) {
  const [days, setDays]   = useState(7);
  const [page, setPage]   = useState(1);

  const { data, isLoading } = useGetMyMeterHistoryQuery(
    { days, page },
    { skip: !open }
  );

  const readings = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Build daily chart data (group readings by date)
  const dailyMap = new Map<string, { kwh: number; cost: number; count: number; lastKwh?: number; firstKwh?: number }>();
  const sorted = [...readings].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  sorted.forEach((r) => {
    const day = new Date(r.recordedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    const existing = dailyMap.get(day) ?? { kwh: 0, cost: 0, count: 0 };
    if (!existing.firstKwh) existing.firstKwh = r.kwh;
    existing.lastKwh = r.kwh;
    existing.count++;
    dailyMap.set(day, existing);
  });

  // Compute delta kWh per day
  const chartData = Array.from(dailyMap.entries()).map(([date, v]) => {
    const delta = Math.max(0, (v.lastKwh ?? 0) - (v.firstKwh ?? 0));
    return { date, kwh: parseFloat(delta.toFixed(3)), cost: parseFloat((delta * 70).toFixed(0)) };
  });

  const totalKwh  = chartData.reduce((s, d) => s + d.kwh, 0);
  const totalCost = chartData.reduce((s, d) => s + d.cost, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Electricity Usage History
          </DialogTitle>
        </DialogHeader>

        {/* period selector */}
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => { setDays(d); setPage(1); }}
              className="h-8 text-xs"
            >
              {d} days
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Raw Readings</TabsTrigger>
            </TabsList>

            {/* ── chart tab ── */}
            <TabsContent value="chart" className="space-y-4">
              {/* summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/30 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Total Usage</p>
                  <p className="text-xl font-bold">{totalKwh.toFixed(2)} kWh</p>
                </div>
                <div className="rounded-lg bg-muted/30 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Est. Cost</p>
                  <p className="text-xl font-bold">{fmt(totalCost)}</p>
                </div>
              </div>

              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No readings for this period.</p>
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit=" kWh" width={60} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                        formatter={(v: number, name: string) =>
                          name === "kwh" ? [`${v} kWh`, "Usage"] : [fmt(v), "Cost"]}
                      />
                      <Bar dataKey="kwh" fill="#eab308" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>

            {/* ── table tab ── */}
            <TabsContent value="table">
              {readings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No readings available.</p>
              ) : (
                <>
                  <div className="rounded-lg border border-border/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border/40">
                          {["Time", "kWh", "Power (W)", "Voltage (V)", "Balance"].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {readings.map((r, i) => (
                          <tr key={r.id ?? i} className="border-b border-border/20 hover:bg-muted/20">
                            <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(r.recordedAt).toLocaleString("en-GB", {
                                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                              })}
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">{r.kwh.toFixed(3)}</td>
                            <td className="px-3 py-2 text-xs">{r.power.toFixed(1)}</td>
                            <td className="px-3 py-2 text-xs">{r.voltage.toFixed(1)}</td>
                            <td className="px-3 py-2 text-xs">{fmt(r.creditBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                          disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                          disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
