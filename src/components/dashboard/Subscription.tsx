import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Layout, Globe, Package, Plus, Edit, Trash2, Loader2, RefreshCw, History, AlertTriangle, Wallet, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import {
    useGetSubscriptionsQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useRenewSubscriptionMutation,
    useDeleteSubscriptionMutation,
    type Subscription as SubscriptionItem,
    type SubscriptionCategory,
} from "@/services/subscriptionsApi";
import { CURRENCY_LABEL, CURRENCY_ORDER, CURRENCY_SYMBOL, formatMoney, formatTotals, type Currency, type CurrencyTotals } from "@/lib/money";

const DAY_MS = 86_400_000;
const EXPIRING_SOON_DAYS = 14;

type Cycle = 'month' | 'year' | 'week' | 'day' | 'one-time';
type ExpiryState = 'active' | 'expiring' | 'expired' | 'cancelled' | 'no-date';

const CATEGORY_META: Record<SubscriptionCategory, { label: string; icon: typeof Globe; tone: string }> = {
    domain: { label: 'Domain', icon: Globe, tone: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    frontend: { label: 'Frontend', icon: Layout, tone: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    backend: { label: 'Backend', icon: Server, tone: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    other: { label: 'Other', icon: Package, tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

const addMonths = (d: Date, months: number) => {
    const out = new Date(d);
    const day = out.getDate();
    out.setDate(1);
    out.setMonth(out.getMonth() + months);
    out.setDate(Math.min(day, new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate()));
    return out;
};

/** Older records have no category; infer it from the icon they were saved with. */
const categoryOf = (s: SubscriptionItem): SubscriptionCategory =>
    s.category ?? (s.icon === 'Server (Backend)' ? 'backend' : 'frontend');

const latestPayment = (s: SubscriptionItem) => s.payments?.[s.payments.length - 1];

/** The stretch of time the most recent payment covers (falls back to the plan's own dates). */
const currentPeriod = (s: SubscriptionItem) => {
    const last = latestPayment(s);
    return {
        start: last?.periodStart ?? s.startDate ?? null,
        end: s.expiresAt ?? last?.periodEnd ?? null,
    };
};

const daysLeft = (s: SubscriptionItem) =>
    s.expiresAt ? Math.ceil((new Date(s.expiresAt).getTime() - Date.now()) / DAY_MS) : null;

const expiryState = (s: SubscriptionItem): ExpiryState => {
    if (s.status === 'Inactive') return 'cancelled';
    const left = daysLeft(s);
    if (left === null) return 'no-date';
    if (left < 0) return 'expired';
    if (left <= EXPIRING_SOON_DAYS) return 'expiring';
    return 'active';
};

const elapsedPercent = (s: SubscriptionItem) => {
    const { start, end } = currentPeriod(s);
    if (!start || !end) return 0;
    const total = new Date(end).getTime() - new Date(start).getTime();
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((Date.now() - new Date(start).getTime()) / total) * 100));
};

const STATE_STYLE: Record<ExpiryState, { label: (left: number | null) => string; badge: string; bar: string }> = {
    active: { label: (l) => `${l} days left`, badge: 'bg-emerald-500 hover:bg-emerald-500 text-white', bar: 'bg-emerald-500' },
    expiring: { label: (l) => (l === 0 ? 'Expires today' : `${l} day${l === 1 ? '' : 's'} left`), badge: 'bg-amber-500 hover:bg-amber-500 text-white', bar: 'bg-amber-500' },
    expired: { label: (l) => `Expired ${Math.abs(l ?? 0)} day${Math.abs(l ?? 0) === 1 ? '' : 's'} ago`, badge: 'bg-red-500 hover:bg-red-500 text-white', bar: 'bg-red-500' },
    cancelled: { label: () => 'Cancelled', badge: 'bg-slate-400 hover:bg-slate-400 text-white', bar: 'bg-slate-300' },
    'no-date': { label: () => 'No expiry date', badge: 'bg-slate-400 hover:bg-slate-400 text-white', bar: 'bg-slate-300' },
};

const emptyForm = () => ({
    name: "",
    category: "frontend" as SubscriptionCategory,
    provider: "",
    price: "",
    currency: "USD" as Currency,
    ngnEquivalent: "",
    period: "month" as Cycle,
    description: "",
    status: "Active" as 'Active' | 'Inactive',
    startDate: toInputDate(new Date()),
    expiresAt: "",
});

export const Subscription = () => {
    const { data: subscriptionsData, isLoading, error } = useGetSubscriptionsQuery({ limit: 100 });
    const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
    const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
    const [renewSubscription, { isLoading: isRenewing }] = useRenewSubscriptionMutation();
    const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation();
    const { success, error: toastError } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm());

    const [renewing, setRenewing] = useState<SubscriptionItem | null>(null);
    const [renewForm, setRenewForm] = useState({ months: "3", amount: "", currency: "NGN" as Currency, ngn: "", paidOn: toInputDate(new Date()), note: "" });
    const [historyFor, setHistoryFor] = useState<SubscriptionItem | null>(null);
    const [deleting, setDeleting] = useState<SubscriptionItem | null>(null);

    const subscriptions = subscriptionsData?.data || [];
    const idOf = (s: SubscriptionItem) => s._id ?? s.id ?? '';

    // ── summary ──────────────────────────────────────────────────────────────
    const totalPaid: CurrencyTotals = {};
    subscriptions.forEach((s) =>
        Object.entries(s.totalPaidByCurrency ?? {}).forEach(([c, v]) => {
            totalPaid[c as Currency] = (totalPaid[c as Currency] ?? 0) + (v ?? 0);
        }));
    const states = subscriptions.map(expiryState);
    const activeCount = states.filter((x) => x === 'active' || x === 'expiring').length;
    const attention = subscriptions
        .filter((s) => ['expiring', 'expired'].includes(expiryState(s)))
        .sort((a, b) => (daysLeft(a) ?? 0) - (daysLeft(b) ?? 0));

    // ── add / edit ───────────────────────────────────────────────────────────
    const handleOpenDialog = (s?: SubscriptionItem) => {
        if (s) {
            setEditingId(idOf(s));
            setFormData({
                name: s.name,
                category: categoryOf(s),
                provider: s.provider ?? "",
                price: s.price.toString(),
                currency: s.currency ?? 'NGN',
                ngnEquivalent: "",
                period: s.billingPeriod,
                description: s.description || "",
                status: s.status,
                startDate: s.startDate ? s.startDate.slice(0, 10) : "",
                expiresAt: s.expiresAt ? s.expiresAt.slice(0, 10) : "",
            });
        } else {
            setEditingId(null);
            setFormData(emptyForm());
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData(emptyForm());
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return toastError("Please enter a name, e.g. bamihost.com or Frontend hosting");
        const priceNum = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
        if (isNaN(priceNum) || priceNum <= 0) return toastError("Please enter the amount");
        const ngnNum = !editingId && formData.currency === 'USD' && formData.ngnEquivalent.trim()
            ? parseFloat(formData.ngnEquivalent.replace(/[^0-9.]/g, ''))
            : undefined;
        if (ngnNum !== undefined && (isNaN(ngnNum) || ngnNum < 0)) return toastError("Enter the naira amount that was debited, or leave it empty");
        if (!editingId && (!formData.startDate || !formData.expiresAt)) return toastError("Please enter the start and expiry dates");
        if (formData.startDate && formData.expiresAt && formData.expiresAt <= formData.startDate) {
            return toastError("The expiry date must be after the start date");
        }

        const payload = {
            name: formData.name.trim(),
            category: formData.category,
            provider: formData.provider.trim() || undefined,
            price: priceNum,
            currency: formData.currency,
            billingPeriod: formData.period,
            description: formData.description,
            // keeps the icon older screens/records rely on in step with the category
            icon: formData.category === 'backend' ? 'Server (Backend)' as const : 'Layout (Frontend)' as const,
            status: formData.status,
            startDate: formData.startDate || undefined,
            expiresAt: formData.expiresAt || undefined,
        };

        try {
            if (editingId) {
                await updateSubscription({ id: editingId, payload }).unwrap();
                success("Subscription updated");
            } else {
                await createSubscription({ ...payload, ngnEquivalent: ngnNum }).unwrap();
                success("Subscription added");
            }
            handleCloseDialog();
        } catch (e: any) {
            toastError(e?.data?.detail || e?.data?.message || "Failed to save subscription");
        }
    };

    // ── renew ────────────────────────────────────────────────────────────────
    const openRenew = (s: SubscriptionItem) => {
        const last = latestPayment(s);
        const currency: Currency = s.currency ?? last?.currency ?? 'NGN';
        setRenewForm({
            months: String(last?.months ?? 3),
            currency,
            amount: String(last && (last.currency ?? 'NGN') === currency ? last.amount : s.price),
            ngn: "",
            paidOn: toInputDate(new Date()),
            note: "",
        });
        setRenewing(s);
    };

    const renewPreview = () => {
        if (!renewing) return null;
        const months = parseInt(renewForm.months, 10);
        if (!months || months < 1) return null;
        const paidOn = renewForm.paidOn ? new Date(renewForm.paidOn) : new Date();
        const current = renewing.expiresAt ? new Date(renewing.expiresAt) : null;
        const from = current && current > paidOn ? current : paidOn;
        return { from, to: addMonths(from, months) };
    };

    const handleRenew = async () => {
        if (!renewing) return;
        const months = parseInt(renewForm.months, 10);
        const amount = parseFloat(renewForm.amount.replace(/[^0-9.]/g, ''));
        if (!months || months < 1) return toastError("Enter how many months you paid for");
        if (isNaN(amount) || amount < 0) return toastError("Enter the amount you paid");
        const ngn = renewForm.currency === 'USD' && renewForm.ngn.trim() ? parseFloat(renewForm.ngn.replace(/[^0-9.]/g, '')) : undefined;
        if (ngn !== undefined && (isNaN(ngn) || ngn < 0)) return toastError("Enter the naira amount that was debited, or leave it empty");
        try {
            await renewSubscription({
                id: idOf(renewing),
                payload: { months, amount, currency: renewForm.currency, ngnEquivalent: ngn, paidOn: renewForm.paidOn || undefined, note: renewForm.note.trim() || undefined },
            }).unwrap();
            success(`${renewing.name} renewed for ${months} month${months === 1 ? '' : 's'}`);
            setRenewing(null);
        } catch (e: any) {
            toastError(e?.data?.detail || "Failed to record the renewal");
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await deleteSubscription(idOf(deleting)).unwrap();
            success("Subscription removed");
        } catch (e: any) {
            toastError(e?.data?.detail || e?.data?.message || "Failed to delete subscription");
        }
        setDeleting(null);
    };

    const preview = renewPreview();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Subscriptions & Payments</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Everything the platform runs on — domain, hosting and more. See what is paid for, how long it lasts, and renew before it runs out.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subscription
                </Button>
            </div>

            {/* Summary */}
            {!isLoading && !error && subscriptions.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Total paid to date', value: formatTotals(totalPaid), icon: Wallet, tone: 'text-slate-900 dark:text-white' },
                        { label: 'Running now', value: activeCount, icon: CheckCircle2, tone: 'text-emerald-600' },
                        { label: `Expiring in ${EXPIRING_SOON_DAYS} days`, value: states.filter((x) => x === 'expiring').length, icon: Clock, tone: 'text-amber-600' },
                        { label: 'Expired', value: states.filter((x) => x === 'expired').length, icon: AlertTriangle, tone: 'text-red-600' },
                    ].map(({ label, value, icon: Icon, tone }) => (
                        <Card key={label} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                                    <Icon className={`w-4 h-4 ${tone}`} />
                                </div>
                                <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Needs attention */}
            {attention.length > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 dark:text-amber-200 space-y-1">
                        <p className="font-semibold">Needs your attention</p>
                        {attention.map((s) => {
                            const left = daysLeft(s);
                            return (
                                <p key={idOf(s)}>
                                    <span className="font-medium">{s.name}</span>{' '}
                                    {left !== null && left < 0 ? `expired on ${fmtDate(s.expiresAt)}` : `expires on ${fmtDate(s.expiresAt)} (${STATE_STYLE.expiring.label(left)})`}
                                    {' — '}
                                    <button className="underline font-medium" onClick={() => openRenew(s)}>Renew now</button>
                                </p>
                            );
                        })}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : error ? (
                <Card className="border-red-200 dark:border-red-900">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white">Failed to load subscriptions</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please try again later</p>
                    </CardContent>
                </Card>
            ) : subscriptions.length > 0 ? (
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">All subscriptions</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            {subscriptions.length} item{subscriptions.length !== 1 ? 's' : ''} tracked
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                    <TableHead>Item</TableHead>
                                    <TableHead>Paid period</TableHead>
                                    <TableHead className="min-w-[180px]">Time left</TableHead>
                                    <TableHead>Total paid</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.map((s) => {
                                    const meta = CATEGORY_META[categoryOf(s)];
                                    const Icon = meta.icon;
                                    const state = expiryState(s);
                                    const style = STATE_STYLE[state];
                                    const left = daysLeft(s);
                                    const period = currentPeriod(s);
                                    return (
                                        <TableRow key={idOf(s)} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.tone}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {meta.label}{s.provider ? ` · ${s.provider}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {fmtDate(period.start)} → {fmtDate(period.end)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={style.badge}>{style.label(left)}</Badge>
                                                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${state === 'expired' ? 100 : elapsedPercent(s)}%` }} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                                                {s.payments?.length ? formatTotals(s.totalPaidByCurrency) : <span className="text-slate-400 font-normal">Not recorded</span>}
                                                {!!s.payments?.length && (
                                                    <div className="text-xs font-normal text-slate-500">{s.payments.length} payment{s.payments.length === 1 ? '' : 's'}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <Button size="sm" variant={state === 'active' ? 'outline' : 'default'} onClick={() => openRenew(s)}>
                                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Renew
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Payment history" onClick={() => setHistoryFor(s)}>
                                                        <History className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => handleOpenDialog(s)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon" title="Delete"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                        onClick={() => setDeleting(s)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-slate-500 dark:text-slate-400 text-center">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium text-slate-900 dark:text-white">Nothing tracked yet</p>
                            <p className="text-sm mt-1">Click "Add Subscription" to add your domain, frontend hosting and backend hosting.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add / edit */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : handleCloseDialog())}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit subscription" : "Add subscription"}</DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? "Fix the details here. To record a new payment, use Renew instead — that keeps the payment history."
                                : "Enter what you paid for and the period it covers. This is recorded as the first payment."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" placeholder="e.g. bamihost.com, Frontend hosting" value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>What is it? *</Label>
                                <Select value={formData.category} onValueChange={(v: SubscriptionCategory) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(CATEGORY_META) as SubscriptionCategory[]).map((c) => (
                                            <SelectItem key={c} value={c}>{CATEGORY_META[c].label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="provider">Provider</Label>
                                <Input id="provider" placeholder="e.g. Vercel, Render, Namecheap" value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>Paid in *</Label>
                                <Select value={formData.currency} onValueChange={(v: Currency) => setFormData({ ...formData, currency: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CURRENCY_ORDER.map((c) => <SelectItem key={c} value={c}>{CURRENCY_LABEL[c]}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">{editingId ? "Price" : "Amount paid"} ({CURRENCY_SYMBOL[formData.currency]}) *</Label>
                                <Input id="price" inputMode="decimal" placeholder={formData.currency === 'USD' ? "e.g. 27.49" : "e.g. 45000"} value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Billing cycle</Label>
                                <Select value={formData.period} onValueChange={(v: Cycle) => setFormData({ ...formData, period: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="month">Monthly</SelectItem>
                                        <SelectItem value="year">Yearly</SelectItem>
                                        <SelectItem value="week">Weekly</SelectItem>
                                        <SelectItem value="day">Daily</SelectItem>
                                        <SelectItem value="one-time">One-time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {!editingId && formData.currency === 'USD' && (
                            <div className="grid gap-2">
                                <Label htmlFor="ngn">Naira debited from your account (₦) — optional</Label>
                                <Input id="ngn" inputMode="decimal" placeholder="What your bank actually charged, e.g. 41200" value={formData.ngnEquivalent}
                                    onChange={(e) => setFormData({ ...formData, ngnEquivalent: e.target.value })} />
                                <p className="text-xs text-slate-500">Lets you see the real naira cost when you compare with profit.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startDate">Paid from {!editingId && '*'}</Label>
                                <Input id="startDate" type="date" value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="expiresAt">Paid until (expires) {!editingId && '*'}</Label>
                                <Input id="expiresAt" type="date" value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v: 'Active' | 'Inactive') => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Cancelled / not in use</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Notes</Label>
                                <Input id="description" placeholder="Anything worth remembering" value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
                            {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingId ? "Save changes" : "Add subscription"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Renew */}
            <Dialog open={!!renewing} onOpenChange={(open) => !open && setRenewing(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Renew {renewing?.name}</DialogTitle>
                        <DialogDescription>
                            Record the payment you just made. The new period starts where the current one ends, so no paid time is lost.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="r-months">Months paid for *</Label>
                                <Input id="r-months" type="number" min={1} max={60} value={renewForm.months}
                                    onChange={(e) => setRenewForm({ ...renewForm, months: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="r-amount">Amount paid ({CURRENCY_SYMBOL[renewForm.currency]}) *</Label>
                                <Input id="r-amount" inputMode="decimal" value={renewForm.amount}
                                    onChange={(e) => setRenewForm({ ...renewForm, amount: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Paid in</Label>
                            <Select value={renewForm.currency} onValueChange={(v: Currency) => setRenewForm({ ...renewForm, currency: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {CURRENCY_ORDER.map((c) => <SelectItem key={c} value={c}>{CURRENCY_LABEL[c]}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {renewForm.currency === 'USD' && (
                            <div className="grid gap-2">
                                <Label htmlFor="r-ngn">Naira debited from your account (₦) — optional</Label>
                                <Input id="r-ngn" inputMode="decimal" placeholder="What your bank actually charged" value={renewForm.ngn}
                                    onChange={(e) => setRenewForm({ ...renewForm, ngn: e.target.value })} />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="r-paid">Date paid</Label>
                            <Input id="r-paid" type="date" value={renewForm.paidOn}
                                onChange={(e) => setRenewForm({ ...renewForm, paidOn: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="r-note">Note</Label>
                            <Input id="r-note" placeholder="e.g. Paid by card, receipt no." value={renewForm.note}
                                onChange={(e) => setRenewForm({ ...renewForm, note: e.target.value })} />
                        </div>
                        {preview && (
                            <div className="rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-sm">
                                <p className="text-slate-500 dark:text-slate-400">After this payment it will run</p>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    {fmtDate(preview.from.toISOString())} → {fmtDate(preview.to.toISOString())}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenewing(null)}>Cancel</Button>
                        <Button onClick={handleRenew} disabled={isRenewing}>
                            {isRenewing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Record payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History */}
            <Dialog open={!!historyFor} onOpenChange={(open) => !open && setHistoryFor(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Payment history — {historyFor?.name}</DialogTitle>
                        <DialogDescription>
                            {historyFor?.payments?.length
                                ? `${historyFor.payments.length} payment${historyFor.payments.length === 1 ? '' : 's'} · ${formatTotals(historyFor.totalPaidByCurrency)} in total`
                                : 'No payments recorded yet.'}
                        </DialogDescription>
                    </DialogHeader>
                    {!!historyFor?.payments?.length && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paid on</TableHead>
                                    <TableHead>Covers</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Note</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...historyFor.payments].reverse().map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="whitespace-nowrap">{fmtDate(p.paidOn)}</TableCell>
                                        <TableCell className="text-sm whitespace-nowrap">
                                            {fmtDate(p.periodStart)} → {fmtDate(p.periodEnd)}
                                            {p.months ? <span className="text-slate-500"> ({p.months} mo)</span> : null}
                                        </TableCell>
                                        <TableCell className="font-mono font-semibold whitespace-nowrap">
                                            {formatMoney(p.amount, p.currency ?? 'NGN')}
                                            {(p.currency ?? 'NGN') === 'USD' && p.ngnEquivalent != null && (
                                                <div className="text-xs font-normal text-slate-500">{formatMoney(p.ngnEquivalent, 'NGN')} debited</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">{p.note || '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            It will disappear from this list and from the totals. Only super admins can do this.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
