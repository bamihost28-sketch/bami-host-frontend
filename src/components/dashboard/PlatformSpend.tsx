import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, Receipt, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useGetSubscriptionSpendQuery, type SubscriptionCategory } from "@/services/subscriptionsApi";

type Range = 'all' | 'month' | 'year' | 'custom';

const CATEGORY_LABEL: Record<SubscriptionCategory, string> = {
    domain: 'Domain', frontend: 'Frontend hosting', backend: 'Backend hosting', other: 'Other',
};
const CATEGORY_BAR: Record<SubscriptionCategory, string> = {
    domain: 'bg-amber-500', frontend: 'bg-blue-500', backend: 'bg-purple-500', other: 'bg-slate-400',
};

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;
const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const monthLabel = (ym: string) =>
    new Date(`${ym}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const isoDay = (d: Date) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
};

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export const PlatformSpend = () => {
    const [range, setRange] = useState<Range>('all');
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const params = useMemo(() => {
        const now = new Date();
        if (range === 'month') return { from: isoDay(new Date(now.getFullYear(), now.getMonth(), 1)), to: isoDay(now) };
        if (range === 'year') return { from: `${now.getFullYear()}-01-01`, to: isoDay(now) };
        if (range === 'custom') return { from: customFrom || undefined, to: customTo || undefined };
        return {};
    }, [range, customFrom, customTo]);

    const { data, isLoading, isFetching, error } = useGetSubscriptionSpendQuery(params);
    const spend = data?.data;
    const periodLabel = { all: 'All time', month: 'This month', year: 'This year', custom: 'Selected dates' }[range];
    const maxCategory = Math.max(1, ...(spend?.byCategory.map((c) => c.amount) ?? [0]));

    const exportCsv = () => {
        if (!spend) return;
        const rows = [
            ['Date paid', 'Item', 'Category', 'Provider', 'Amount (NGN)', 'Months', 'Covers from', 'Covers until', 'Note'],
            ...spend.payments.map((p) => [
                p.paidOn.slice(0, 10), p.name, CATEGORY_LABEL[p.category], p.provider ?? '', p.amount,
                p.months ?? '', p.periodStart?.slice(0, 10) ?? '', p.periodEnd?.slice(0, 10) ?? '', p.note ?? '',
            ]),
        ];
        const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `platform-spend-${isoDay(new Date())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Spend</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Everything spent on running the platform — domain, hosting and other subscriptions. Compare this with your income to see the real profit.
                    </p>
                </div>
                <Button variant="outline" onClick={exportCsv} disabled={!spend?.payments.length}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
            </div>

            {/* Period */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1.5">
                    <Label className="text-xs">Period</Label>
                    <Select value={range} onValueChange={(v: Range) => setRange(v)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All time</SelectItem>
                            <SelectItem value="month">This month</SelectItem>
                            <SelectItem value="year">This year</SelectItem>
                            <SelectItem value="custom">Pick dates…</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {range === 'custom' && (
                    <>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">From</Label>
                            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs">To</Label>
                            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                        </div>
                    </>
                )}
                {isFetching && !isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400 mb-2.5" />}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : error || !spend ? (
                <Card className="border-red-200 dark:border-red-900">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Receipt className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white">Could not load the spend report</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please try again later</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: `Total spent · ${periodLabel}`, value: naira(spend.total) },
                            { label: 'Spent this month', value: naira(spend.thisMonth) },
                            { label: 'Spent this year', value: naira(spend.thisYear) },
                            { label: 'Payments in period', value: spend.paymentCount },
                        ].map(({ label, value }) => (
                            <Card key={label} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardContent className="pt-4 pb-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                                    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 -mt-3">
                        "This month" and "This year" are always the current month and year; the other figures follow the period you picked.
                    </p>

                    {spend.paymentCount === 0 ? (
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Wallet className="w-12 h-12 mb-4 text-slate-400 opacity-60" />
                                <p className="text-lg font-medium text-slate-900 dark:text-white">No payments recorded for this period</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Add your domain and hosting on the Subscription page, or press Renew when you pay again, and they will show up here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid lg:grid-cols-2 gap-4">
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 dark:text-white text-base">Where the money went</CardTitle>
                                        <CardDescription>{periodLabel}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {spend.byCategory.map((c) => (
                                            <div key={c.category}>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-700 dark:text-slate-300">{CATEGORY_LABEL[c.category]}</span>
                                                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{naira(c.amount)}</span>
                                                </div>
                                                <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <div className={`h-full rounded-full ${CATEGORY_BAR[c.category]}`} style={{ width: `${(c.amount / maxCategory) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 dark:text-white text-base">Month by month</CardTitle>
                                        <CardDescription>Based on the date each payment was made</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableBody>
                                                {spend.byMonth.map((m) => (
                                                    <TableRow key={m.month}>
                                                        <TableCell>{monthLabel(m.month)}</TableCell>
                                                        <TableCell className="text-right font-mono font-semibold">{naira(m.amount)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-slate-900 dark:text-white text-base">Every payment</CardTitle>
                                    <CardDescription>Newest first</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date paid</TableHead>
                                                <TableHead>Item</TableHead>
                                                <TableHead>Covers</TableHead>
                                                <TableHead>Note</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {spend.payments.map((p) => (
                                                <TableRow key={p.paymentId}>
                                                    <TableCell className="whitespace-nowrap">{fmtDate(p.paidOn)}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                                                        <div className="text-xs text-slate-500">{CATEGORY_LABEL[p.category]}{p.provider ? ` · ${p.provider}` : ''}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm whitespace-nowrap">
                                                        {fmtDate(p.periodStart)} → {fmtDate(p.periodEnd)}
                                                        {p.months ? <span className="text-slate-500"> ({p.months} mo)</span> : null}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-500">{p.note || '—'}</TableCell>
                                                    <TableCell className="text-right font-mono font-semibold">{naira(p.amount)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={4} className="font-semibold">Total</TableCell>
                                                <TableCell className="text-right font-mono font-bold">{naira(spend.total)}</TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
