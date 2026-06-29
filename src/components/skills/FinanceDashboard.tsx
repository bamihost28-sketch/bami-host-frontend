import { TrendingUp, DollarSign, AlertCircle, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetFinanceOverviewQuery,
  useGetCashflowQuery,
  useGetUnpaidBillsQuery,
} from "@/services/skillsApi";

function fmtN(n: number) { return `₦${(n ?? 0).toLocaleString()}`; }

const TIPS = [
  { icon: "📊", title: "Revenue ≠ Profit", body: "Track net profit, not gross revenue. After maintenance reserve (10%), management fees (5–10%), and vacancy, your real profit matters most." },
  { icon: "💸", title: "Pay Yourself First", body: "Set a fixed management salary and take it every month. If the business can't sustain it, that's your signal to scale." },
  { icon: "🏦", title: "Maintenance Reserve", body: "Set aside 10% of monthly rent roll into a maintenance fund. Emergency repairs won't destroy your cash flow." },
  { icon: "📅", title: "Annual Rent = Monthly Risk", body: "Nigerian tenants pay annually. Map out when each lease expires and start renewal discussions 60 days early." },
  { icon: "🎯", title: "Target: 20% Net Margin", body: "After all costs, you should net 20%+ of rent collected. If not, your vacancy or expenses are too high." },
];

export function FinanceDashboard() {
  const { data: overview, isLoading: ovLoading } = useGetFinanceOverviewQuery();
  const { data: cashflowData, isLoading: cfLoading } = useGetCashflowQuery({ months: 6 });
  const { data: billsData, isLoading: billsLoading } = useGetUnpaidBillsQuery();

  const ov = overview ?? {};
  const cashflow = cashflowData?.data ?? [];
  const bills = billsData?.data ?? [];

  const maxRev = Math.max(...cashflow.map((r: any) => r.income || 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-emerald-600" /> Finance Director Skill
        </h1>
        <p className="text-slate-500 mt-1">P&L overview, cash flow, revenue trends, and outstanding bills</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ovLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{fmtN(ov.revenue?.this_month ?? 0)}</p>
                <p className="text-sm text-slate-500">Revenue This Month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{fmtN(ov.revenue?.ytd ?? 0)}</p>
                <p className="text-sm text-slate-500">YTD Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  {(ov.net_profit_month ?? 0) >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-500" />
                  )}
                  <p className={`text-2xl font-bold ${(ov.net_profit_month ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {fmtN(Math.abs(ov.net_profit_month ?? 0))}
                  </p>
                </div>
                <p className="text-sm text-slate-500">Net Profit (Month)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{fmtN(ov.outstanding ?? 0)}</p>
                <p className="text-sm text-slate-500">Outstanding Bills</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="cashflow">
        <TabsList>
          <TabsTrigger value="cashflow">Cash Flow (6mo)</TabsTrigger>
          <TabsTrigger value="bills">Unpaid Bills</TabsTrigger>
          <TabsTrigger value="tips">Finance Tips</TabsTrigger>
        </TabsList>

        {/* Cash Flow */}
        <TabsContent value="cashflow" className="mt-4">
          <Card>
            <CardHeader><CardTitle>6-Month Cash Flow</CardTitle></CardHeader>
            <CardContent>
              {cfLoading ? <Skeleton className="h-64 w-full" /> : (
                <div className="space-y-4">
                  {cashflow.map((row: any) => (
                    <div key={row.month}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300 w-20">{row.month}</span>
                        <span className="text-green-600">{fmtN(row.income)}</span>
                        <span className="text-red-500">-{fmtN(row.expenses)}</span>
                        <span className={`font-bold ${row.net >= 0 ? "text-green-700" : "text-red-600"}`}>{fmtN(row.net)}</span>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div className="bg-green-400 rounded" style={{ width: `${(row.income / maxRev) * 100}%` }} />
                        <div className="bg-red-300 rounded" style={{ width: `${(row.expenses / maxRev) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-400 rounded" /> Income</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-300 rounded" /> Expenses</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unpaid Bills */}
        <TabsContent value="bills" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Unpaid Bills</CardTitle>
              {!billsLoading && <p className="text-sm text-slate-500">Total outstanding: <strong className="text-red-600">{fmtN(billsData?.total_outstanding ?? 0)}</strong></p>}
            </CardHeader>
            <CardContent className="space-y-3">
              {billsLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />) :
              bills.length === 0 ? (
                <p className="text-center text-green-600 py-8 font-medium">✅ No unpaid bills!</p>
              ) : (
                bills.map((b: any) => {
                  const isOverdue = b.due_date && new Date(b.due_date) < new Date();
                  return (
                    <div key={b.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{b.label}</p>
                        <p className="text-sm text-slate-500">{b.item_type} · {b.due_date ? `Due ${new Date(b.due_date).toLocaleDateString()}` : "No due date"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverdue && <Badge className="bg-red-100 text-red-700 text-xs">Overdue</Badge>}
                        <p className="font-bold text-red-600">{fmtN(b.amount)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips */}
        <TabsContent value="tips" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map(t => (
              <Card key={t.title} className="border-emerald-100">
                <CardContent className="p-5">
                  <p className="font-semibold text-emerald-700 mb-2">{t.icon} {t.title}</p>
                  <p className="text-sm text-slate-600">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
