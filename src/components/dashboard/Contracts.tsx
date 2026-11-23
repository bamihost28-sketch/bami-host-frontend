import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Check, CheckCircle2, Clock, Download, FilePlus2, FileSignature, Loader2, Package, Plus, Trash2, UserPlus, Wallet, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/providers/ToastProvider";
import {
    useGetContractsQuery,
    useCreateContractMutation,
    useUpdateContractMutation,
    useDeleteContractMutation,
    useAddContractPaymentMutation,
    useDeleteContractPaymentMutation,
    useGetDevelopersQuery,
    useOnboardDeveloperMutation,
    useConfirmContractPaymentMutation,
    useRejectContractPaymentMutation,
    useAcceptContractMutation,
    useDeclineContractMutation,
    downloadContractPdf,
    type Contract,
    type ContractCategory,
    type ContractPayment,
    type ContractInstalment,
    type ContractPaymentStatus,
    type OnboardedDeveloper,
} from "@/services/contractsApi";
import { CURRENCY_LABEL, CURRENCY_ORDER, CURRENCY_SYMBOL, formatMoney, formatTotals, type Currency, type CurrencyTotals } from "@/lib/money";

const ROLE_LABEL: Record<string, string> = {
    developer: 'Contractor', vendor: 'Vendor', super_vendor: 'Vendor', super_admin: 'Admin', admin: 'Admin',
};
const CATEGORY_OPTIONS: { value: ContractCategory; label: string }[] = [
    { value: 'development', label: 'Development' }, { value: 'legal', label: 'Legal' },
    { value: 'maintenance', label: 'Maintenance & repairs' }, { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' }, { value: 'other', label: 'Other' },
];
const ACCEPTANCE: Record<string, { label: string; badge: string }> = {
    accepted: { label: 'Accepted', badge: 'bg-emerald-500 hover:bg-emerald-500 text-white' },
    pending: { label: 'Waiting for acceptance', badge: 'bg-amber-500 hover:bg-amber-500 text-white' },
    changed: { label: 'Changed — accept again', badge: 'bg-amber-500 hover:bg-amber-500 text-white' },
    declined: { label: 'Changes requested', badge: 'bg-red-500 hover:bg-red-500 text-white' },
};

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const toInputDate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const num = (v: string) => parseFloat(v.replace(/[^0-9.]/g, ''));

const STATUS: Record<ContractPaymentStatus, { label: string; badge: string; bar: string }> = {
    paid: { label: 'Fully paid', badge: 'bg-emerald-500 hover:bg-emerald-500 text-white', bar: 'bg-emerald-500' },
    partial: { label: 'Part paid', badge: 'bg-blue-500 hover:bg-blue-500 text-white', bar: 'bg-blue-500' },
    unpaid: { label: 'Not paid yet', badge: 'bg-slate-500 hover:bg-slate-500 text-white', bar: 'bg-slate-400' },
    overdue: { label: 'Overdue', badge: 'bg-red-500 hover:bg-red-500 text-white', bar: 'bg-red-500' },
    cancelled: { label: 'Cancelled', badge: 'bg-slate-400 hover:bg-slate-400 text-white', bar: 'bg-slate-300' },
};

const dueText = (i: Pick<ContractInstalment, 'daysUntilDue' | 'overdue'>) => {
    if (i.daysUntilDue === null) return 'no due date';
    if (i.overdue) return `${-i.daysUntilDue} day${i.daysUntilDue === -1 ? '' : 's'} overdue`;
    if (i.daysUntilDue === 0) return 'due today';
    return `due in ${i.daysUntilDue} day${i.daysUntilDue === 1 ? '' : 's'}`;
};

interface FormRow { label: string; amount: string; dueDate: string }
const emptyForm = () => ({
    kind: "project" as 'project' | 'retainer',
    monthlyAmount: "", billingDay: "1", startDate: toInputDate(new Date()), endDate: "",
    category: "" as ContractCategory | "", terms: "",
    title: "", clientName: "", developerId: "", currency: "NGN" as Currency, total: "", description: "",
    instalments: [] as FormRow[],
    receivedAmount: "", receivedDate: toInputDate(new Date()), receivedMethod: "",
});

export const Contracts = () => {
    const { user } = useAuth();
    const isOwner = user?.role === 'super_admin' || user?.role === 'admin';
    const isManager = user?.role === 'manager' || user?.role === 'super_manager';
    const isCreator = isOwner || isManager;                       // set contracts up for contractors and vendors
    const canCreate = isCreator || user?.role === 'developer';    // a company contractor can record their own
    const { success, error: toastError } = useToast();

    const { data, isLoading, error } = useGetContractsQuery();
    const { data: devData } = useGetDevelopersQuery(undefined, { skip: !isCreator });
    const [createContract, { isLoading: isCreating }] = useCreateContractMutation();
    const [updateContract, { isLoading: isUpdating }] = useUpdateContractMutation();
    const [deleteContract] = useDeleteContractMutation();
    const [addPayment, { isLoading: isPaying }] = useAddContractPaymentMutation();
    const [deletePayment] = useDeleteContractPaymentMutation();
    const [confirmPayment] = useConfirmContractPaymentMutation();
    const [rejectPayment, { isLoading: isRejecting }] = useRejectContractPaymentMutation();
    const [acceptContract, { isLoading: isAccepting }] = useAcceptContractMutation();
    const [declineContract, { isLoading: isDeclining }] = useDeclineContractMutation();
    const [onboardDeveloper, { isLoading: isOnboarding }] = useOnboardDeveloperMutation();

    const contracts = data?.data ?? [];
    const developers = devData?.data ?? [];

    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [payFor, setPayFor] = useState<Contract | null>(null);
    const [pay, setPay] = useState({ amount: "", paidOn: toInputDate(new Date()), method: "", note: "" });
    const [detailId, setDetailId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Contract | null>(null);
    const [rejecting, setRejecting] = useState<{ c: Contract; p: ContractPayment } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [downloading, setDownloading] = useState<string | null>(null);
    const [acceptName, setAcceptName] = useState("");
    const [declineFor, setDeclineFor] = useState<Contract | null>(null);
    const [declineReason, setDeclineReason] = useState("");
    const [onboardOpen, setOnboardOpen] = useState(false);
    const [dev, setDev] = useState({ name: "", email: "", phone: "" });
    const [onboarded, setOnboarded] = useState<OnboardedDeveloper | null>(null);

    const detail = contracts.find((c) => c.id === detailId) ?? null;
    const apiError = (e: any, fallback: string) => {
        const d = e?.data?.detail;
        return typeof d === 'string' ? d : Array.isArray(d) ? d.map((x: any) => x.msg).join('; ') : fallback;
    };

    // ── summary ──────────────────────────────────────────────────────────────
    const summary = data?.summary ?? {};
    const sum = (k: 'contracted' | 'received' | 'outstanding' | 'overdue' | 'pending'): CurrencyTotals => {
        const out: CurrencyTotals = {};
        CURRENCY_ORDER.forEach((c) => { if (summary[c]) out[c] = summary[c]![k]; });
        return out;
    };
    const attention = contracts
        .filter((c) => c.status !== 'cancelled')
        .flatMap((c) => c.instalments.filter((i) => i.overdue || i.dueSoon).map((i) => ({ c, i })))
        .sort((a, b) => (a.i.daysUntilDue ?? 0) - (b.i.daysUntilDue ?? 0));

    const pendingText = formatTotals(sum('pending'));
    // Payments the developer still has to confirm (shown to them) / that others are waiting on (shown to admins).
    const awaitingMe = contracts.filter((c) => c.developerId === user?.id && c.pendingCount > 0);
    const awaitingOthers = contracts.filter((c) => c.developerId !== user?.id && c.pendingCount > 0);
    const toAccept = contracts.filter((c) => c.canAccept);                       // contracts waiting for the signed-in person to accept
    const withoutContract = developers.filter((d) => d.contractCount === 0 && d.role !== 'super_admin' && d.role !== 'admin');

    // ── add / edit contract ──────────────────────────────────────────────────
    const openNew = (personId?: string) => {
        const firstDev = developers.find((d) => d.role === 'developer') ?? developers.find((d) => d.id === user?.id);
        setEditingId(null);
        setForm({ ...emptyForm(), developerId: personId ?? firstDev?.id ?? "" });
        setFormOpen(true);
    };

    const openEdit = (c: Contract) => {
        setEditingId(c.id);
        setForm({
            ...emptyForm(),
            title: c.title, clientName: c.clientName ?? "", developerId: c.developerId ?? "", currency: c.currency,
            kind: c.kind, monthlyAmount: c.monthlyAmount ? String(c.monthlyAmount) : "", billingDay: String(c.billingDay ?? 1),
            startDate: c.startDate ?? "", endDate: c.endDate ?? "",
            category: c.category ?? "", terms: c.terms ?? "",
            total: String(c.totalAmount), description: c.description ?? "",
            instalments: c.instalments.map((i) => ({ label: i.label, amount: String(i.amount), dueDate: i.dueDate ?? "" })),
        });
        setFormOpen(true);
    };

    const setRow = (idx: number, patch: Partial<FormRow>) =>
        setForm((f) => ({ ...f, instalments: f.instalments.map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));

    const handleSave = async () => {
        const retainer = form.kind === 'retainer';
        const total = num(form.total);
        const monthly = num(form.monthlyAmount);
        const day = parseInt(form.billingDay, 10);
        if (!form.title.trim()) return toastError(retainer ? "Give it a name, e.g. Monthly support" : "Give the contract a name, e.g. Mobile app");
        if (!retainer && (isNaN(total) || total <= 0)) return toastError("Enter the total amount agreed");
        if (retainer && (isNaN(monthly) || monthly <= 0)) return toastError("Enter the monthly amount");
        if (retainer && !(day >= 1 && day <= 28)) return toastError("Pick a day of the month between 1 and 28");
        if (retainer && form.startDate && form.endDate && form.endDate < form.startDate) return toastError("The end date is before the start date");
        if (isCreator && !form.developerId) return toastError("Choose who this contract is with");

        let instalments: { label: string; amount: number; dueDate?: string }[] = [];
        if (!retainer) {
            const rows = form.instalments.filter((r) => r.label.trim() || r.amount.trim() || r.dueDate);
            for (const r of rows) {
                if (!r.label.trim() || isNaN(num(r.amount)) || num(r.amount) <= 0) {
                    return toastError("Each instalment needs a name and an amount");
                }
            }
            instalments = rows.map((r) => ({ label: r.label.trim(), amount: num(r.amount), dueDate: r.dueDate || undefined }));
            if (instalments.reduce((sum, i) => sum + i.amount, 0) > total + 0.01) return toastError("The instalments add up to more than the total");
        }

        const received = !editingId && form.receivedAmount.trim() ? num(form.receivedAmount) : 0;
        if (received && (isNaN(received) || received < 0)) return toastError("Enter the amount already received, or leave it empty");
        if (!retainer && received > total) return toastError("The amount already received is more than the total");

        try {
            if (editingId) {
                await updateContract({
                    id: editingId,
                    payload: {
                        title: form.title.trim(), clientName: form.clientName, description: form.description, currency: form.currency,
                        terms: form.terms, category: form.category || undefined,
                        ...(retainer
                            ? { monthlyAmount: monthly, billingDay: day, startDate: form.startDate || undefined, endDate: form.endDate }
                            : { totalAmount: total, instalments }),
                        ...(isCreator ? { developerId: form.developerId } : {}),
                    },
                }).unwrap();
                success(retainer ? "Monthly support updated" : "Contract updated");
            } else {
                await createContract({
                    title: form.title.trim(), clientName: form.clientName.trim() || undefined,
                    description: form.description.trim() || undefined, currency: form.currency, kind: form.kind,
                    terms: form.terms.trim() || undefined, category: form.category || undefined,
                    ...(retainer
                        ? { monthlyAmount: monthly, billingDay: day, startDate: form.startDate || undefined, endDate: form.endDate || undefined }
                        : { totalAmount: total, instalments }),
                    developerId: isCreator ? form.developerId : undefined,
                    received: received > 0
                        ? [{ amount: received, paidOn: form.receivedDate || undefined, method: form.receivedMethod.trim() || undefined }]
                        : [],
                }).unwrap();
                success(retainer ? "Monthly support added" : "Contract added");
            }
            setFormOpen(false);
        } catch (e: any) {
            toastError(apiError(e, "Could not save the contract"));
        }
    };

    // ── record a payment ─────────────────────────────────────────────────────
    const openPay = (c: Contract) => {
        const next = c.nextDue?.outstanding ?? c.balance;
        setPay({ amount: String(c.kind === 'retainer' ? (next || c.monthlyAmount || '') : Math.min(next || c.balance, c.balance)), paidOn: toInputDate(new Date()), method: "", note: "" });
        setPayFor(c);
    };

    const handlePay = async () => {
        if (!payFor) return;
        const amount = num(pay.amount);
        if (isNaN(amount) || amount <= 0) return toastError("Enter the amount received");
        try {
            await addPayment({
                id: payFor.id,
                payload: { amount, paidOn: pay.paidOn || undefined, method: pay.method.trim() || undefined, note: pay.note.trim() || undefined },
            }).unwrap();
            success(`Recorded ${formatMoney(amount, payFor.currency)}`);
            setPayFor(null);
        } catch (e: any) {
            toastError(apiError(e, "Could not record the payment"));
        }
    };

    const handleDeletePayment = async (c: Contract, paymentId: string) => {
        try {
            await deletePayment({ id: c.id, paymentId }).unwrap();
            success("Payment removed");
        } catch (e: any) {
            toastError(apiError(e, "Could not remove the payment"));
        }
    };

    const handleConfirm = async (c: Contract, p: ContractPayment) => {
        try {
            await confirmPayment({ id: c.id, paymentId: p.id }).unwrap();
            success(`Confirmed ${formatMoney(p.amount, c.currency)}`);
        } catch (e: any) {
            toastError(apiError(e, "Could not confirm the payment"));
        }
    };

    const handleReject = async () => {
        if (!rejecting) return;
        try {
            await rejectPayment({ id: rejecting.c.id, paymentId: rejecting.p.id, reason: rejectReason.trim() || undefined }).unwrap();
            success("Marked as not received");
            setRejecting(null);
            setRejectReason("");
        } catch (e: any) {
            toastError(apiError(e, "Could not reject the payment"));
        }
    };

    const handleAccept = async (c: Contract) => {
        if (acceptName.trim().length < 3) return toastError("Type your full name to accept");
        try {
            await acceptContract({ id: c.id, typedName: acceptName.trim() }).unwrap();
            success("Contract accepted");
            setAcceptName("");
        } catch (e: any) {
            toastError(apiError(e, "Could not accept the contract"));
        }
    };

    const handleDecline = async () => {
        if (!declineFor) return;
        if (declineReason.trim().length < 3) return toastError("Say what you would like changed");
        try {
            await declineContract({ id: declineFor.id, reason: declineReason.trim() }).unwrap();
            success("Your request was sent");
            setDeclineFor(null);
            setDeclineReason("");
        } catch (e: any) {
            toastError(apiError(e, "Could not send your request"));
        }
    };

    const handleDownload = async (path: string, fallbackName: string, key: string) => {
        setDownloading(key);
        try {
            await downloadContractPdf(path, fallbackName);
        } catch (e: any) {
            toastError(e?.message || "Could not download the PDF");
        } finally {
            setDownloading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await deleteContract(deleting.id).unwrap();
            success("Contract removed");
            setDetailId(null);
        } catch (e: any) {
            toastError(apiError(e, "Could not remove the contract"));
        }
        setDeleting(null);
    };

    // ── onboard a developer ──────────────────────────────────────────────────
    const handleOnboard = async () => {
        if (dev.name.trim().length < 2) return toastError("Enter the person's name");
        if (dev.phone.replace(/\D/g, '').length < 10) return toastError("Enter their phone number (at least 10 digits)");
        if (dev.email.trim() && !dev.email.includes('@')) return toastError("Enter a valid email address, or leave it blank");
        try {
            const res = await onboardDeveloper({ name: dev.name.trim(), email: dev.email.trim() || undefined, phone: dev.phone.trim() }).unwrap();
            setOnboarded(res.data);
        } catch (e: any) {
            toastError(apiError(e, "Could not add the developer"));
        }
    };

    const closeOnboard = () => { setOnboardOpen(false); setOnboarded(null); setDev({ name: "", email: "", phone: "" }); };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {isCreator ? 'Contracts & Payments' : 'My Contracts & Payments'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Every job, what was agreed, what has been paid and what is still owed — with a reminder before each payment is due.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isCreator && (
                        <Button variant="outline" onClick={() => setOnboardOpen(true)}>
                            <UserPlus className="w-4 h-4 mr-2" /> Onboard contractor
                        </Button>
                    )}
                    {canCreate && (
                        <Button onClick={() => openNew()}>
                            <Plus className="w-4 h-4 mr-2" /> New contract
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary */}
            {!isLoading && !error && contracts.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Projects: total agreed', value: formatTotals(sum('contracted')), tone: 'text-slate-900 dark:text-white' },
                        { label: 'Received so far', value: formatTotals(sum('received')), tone: 'text-emerald-600',
                          caption: pendingText !== '—' ? `+ ${pendingText} waiting for confirmation` : undefined },
                        { label: 'Still owed', value: formatTotals(sum('outstanding')), tone: 'text-amber-600' },
                        { label: 'Overdue', value: formatTotals(sum('overdue')), tone: 'text-red-600' },
                    ].map(({ label, value, tone, caption }) => (
                        <Card key={label} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardContent className="pt-4 pb-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                                <p className={`text-xl font-bold mt-1 break-words ${tone}`}>{value}</p>
                                {caption && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{caption}</p>}
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
                        <p className="font-semibold">Payments that need attention</p>
                        {attention.map(({ c, i }) => (
                            <p key={`${c.id}-${i.id}`}>
                                <span className="font-medium">{c.title}</span> — {i.label}: {formatMoney(i.outstanding, c.currency)} {dueText(i)}
                                {' — '}
                                <button className="underline font-medium" onClick={() => openPay(c)}>Record payment</button>
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {toAccept.length > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex gap-3">
                    <FileSignature className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 dark:text-amber-200 space-y-1">
                        <p className="font-semibold">Contracts waiting for you to read and accept</p>
                        {toAccept.map((c) => (
                            <p key={c.id}>
                                <span className="font-medium">{c.title}</span>
                                {c.acceptanceStatus === 'changed' ? ' — changed since you accepted it' : ''}
                                {' — '}
                                <button className="underline font-medium" onClick={() => setDetailId(c.id)}>Review</button>
                            </p>
                        ))}
                    </div>
                </div>
            )}
            {awaitingMe.length > 0 && (
                <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 flex gap-3">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-200 space-y-1">
                        <p className="font-semibold">Payments waiting for you to confirm</p>
                        {awaitingMe.map((c) => (
                            <p key={c.id}>
                                <span className="font-medium">{c.title}</span> — {formatMoney(c.pendingAmount, c.currency)} recorded as paid
                                {' — '}
                                <button className="underline font-medium" onClick={() => setDetailId(c.id)}>Review</button>
                            </p>
                        ))}
                    </div>
                </div>
            )}
            {awaitingOthers.length > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {awaitingOthers.reduce((n, c) => n + c.pendingCount, 0)} payment(s) are waiting for the developer to confirm.
                </p>
            )}

            {isCreator && withoutContract.length > 0 && (
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-sm font-semibold mb-1">No contract yet</p>
                        <p className="text-xs text-slate-500 mb-3">These contractors and vendors have no contract on record. Set one up so what is agreed and paid is tracked.</p>
                        <div className="flex flex-wrap gap-2">
                            {withoutContract.map((d) => (
                                <Button key={d.id} size="sm" variant="outline" onClick={() => openNew(d.id)}>
                                    <FilePlus2 className="w-3.5 h-3.5 mr-1.5" /> {d.name} · {ROLE_LABEL[d.role] ?? d.role}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : error ? (
                <Card className="border-red-200 dark:border-red-900">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white">Failed to load contracts</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please try again later</p>
                    </CardContent>
                </Card>
            ) : contracts.length === 0 ? (
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <FilePlus2 className="w-12 h-12 mb-4 text-slate-400 opacity-60" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white">No contracts yet</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                            {canCreate ? 'Add a job with the total agreed and what has been paid so far. The balance and reminders take care of themselves.' : 'When the company sets up a contract with you, it will appear here for you to read and accept.'}
                        </p>
                        {canCreate && <Button className="mt-4" onClick={() => openNew()}><Plus className="w-4 h-4 mr-2" /> New contract</Button>}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {contracts.map((c) => {
                        const st = STATUS[c.paymentStatus];
                        return (
                            <Card key={c.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardContent className="pt-5 space-y-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">{c.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {c.kind === 'retainer' && <span className="font-medium text-slate-600 dark:text-slate-300">Monthly support · </span>}{c.clientName ? `For ${c.clientName}` : 'No client named'}
                                                {isCreator && c.developerName ? ` · With: ${c.developerName}` : ''}
                                            </p>
                                        </div>
                                        <Badge className={st.badge}>{c.kind === 'retainer' && c.paymentStatus === 'paid' ? 'Up to date' : st.label}</Badge>
                                    </div>

                                    {c.kind === 'project' && (
                                        <div>
                                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${c.percentPaid}%` }} />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{c.percentPaid}% paid</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div><p className="text-xs text-slate-500">{c.kind === 'retainer' ? `Monthly (day ${c.billingDay ?? 1})` : 'Agreed'}</p><p className="font-mono font-semibold">{formatMoney(c.kind === 'retainer' ? (c.monthlyAmount ?? 0) : c.totalAmount, c.currency)}</p></div>
                                        <div><p className="text-xs text-slate-500">Received</p><p className="font-mono font-semibold text-emerald-600">{formatMoney(c.paid, c.currency)}</p></div>
                                        <div><p className="text-xs text-slate-500">{c.kind === 'retainer' ? 'Owed now' : 'Still owed'}</p><p className="font-mono font-semibold text-amber-600">{formatMoney(c.balance, c.currency)}</p></div>
                                    </div>

                                    {c.acceptanceStatus !== 'accepted' && (
                                        <p className={`text-xs flex items-center gap-1 ${c.acceptanceStatus === 'declined' ? 'text-red-600' : 'text-amber-600'}`}>
                                            <FileSignature className="w-3.5 h-3.5" />
                                            {c.canAccept
                                                ? (c.acceptanceStatus === 'changed' ? 'Changed — please review and accept again' : 'Waiting for you to review and accept')
                                                : c.acceptanceStatus === 'declined' ? `${c.developerName ?? 'They'} asked for changes`
                                                : c.acceptanceStatus === 'changed' ? `Changed — waiting for ${c.developerName ?? 'them'} to accept again`
                                                : `Waiting for ${c.developerName ?? 'them'} to accept`}
                                        </p>
                                    )}
                                    {c.pendingCount > 0 && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> {formatMoney(c.pendingAmount, c.currency)} waiting for {c.developerId === user?.id ? 'your' : "the developer's"} confirmation
                                        </p>
                                    )}

                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {c.paymentStatus === 'paid' && !c.nextDue ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Nothing left to pay</span>
                                        ) : c.nextDue ? (
                                            <>Next: <span className="font-medium">{c.nextDue.label}</span> · {formatMoney(c.nextDue.outstanding, c.currency)}
                                                {c.nextDue.dueDate ? <> · {fmtDate(c.nextDue.dueDate)} <span className={c.nextDue.overdue ? 'text-red-600 font-medium' : 'text-slate-500'}>({dueText(c.nextDue)})</span></> : <span className="text-slate-500"> · no due date set</span>}</>
                                        ) : (
                                            <span className="text-slate-500">No payment dates set — add instalments to get reminders.</span>
                                        )}
                                    </p>

                                    <div className="flex gap-2 pt-1">
                                        {(c.balance > 0 || (c.kind === 'retainer' && c.status === 'active')) && c.status !== 'cancelled' && (
                                            <Button size="sm" onClick={() => openPay(c)}><Wallet className="w-3.5 h-3.5 mr-1.5" /> Record payment</Button>
                                        )}
                                        {c.canAccept && <Button size="sm" onClick={() => setDetailId(c.id)}><FileSignature className="w-3.5 h-3.5 mr-1.5" /> Review &amp; accept</Button>}
                                        <Button size="sm" variant="outline" onClick={() => setDetailId(c.id)}>Details</Button>
                                        {c.canEdit && <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>Edit</Button>}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add / edit contract */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit contract' : 'New contract'}</DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? 'Change the details or the payment schedule. To record money received, use Record payment instead.'
                                : form.kind === 'retainer'
                                    ? 'A regular amount paid each month to keep the work going. It is tracked separately from any project, so it never reduces what a project still owes.'
                                    : 'Enter the job, the total agreed, and anything already paid.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        {!editingId && (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {([
                                    ['project', 'Project', 'A job with an agreed total price'],
                                    ['retainer', 'Monthly support', 'A regular monthly amount to keep the work going'],
                                ] as const).map(([k, name, blurb]) => (
                                    <button key={k} type="button" onClick={() => setForm({ ...form, kind: k })}
                                        className={`text-left rounded-md border p-3 transition-colors ${form.kind === k ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                        <span className="block text-sm font-semibold">{name}</span>
                                        <span className="block text-xs text-slate-500">{blurb}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="c-title">{form.kind === 'retainer' ? 'Name *' : 'Job / contract name *'}</Label>
                                <Input id="c-title" placeholder={form.kind === 'retainer' ? 'e.g. Monthly support' : 'e.g. Mobile app'} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="c-client">Client</Label>
                                <Input id="c-client" placeholder="Who is paying" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
                            </div>
                        </div>

                        {isCreator && (
                            <div className="grid gap-2">
                                <Label>Who is this contract with? *</Label>
                                <Select value={form.developerId} onValueChange={(v) => setForm({ ...form, developerId: v })}>
                                    <SelectTrigger><SelectValue placeholder={developers.length ? 'Choose…' : 'No one yet — onboard a contractor first'} /></SelectTrigger>
                                    <SelectContent>
                                        {developers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} · {ROLE_LABEL[d.role] ?? d.role}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <Select value={form.currency} onValueChange={(v: Currency) => setForm({ ...form, currency: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CURRENCY_ORDER.map((c) => <SelectItem key={c} value={c}>{CURRENCY_LABEL[c]}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            {form.kind === 'retainer' ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="c-monthly">Amount per month ({CURRENCY_SYMBOL[form.currency]}) *</Label>
                                    <Input id="c-monthly" inputMode="decimal" placeholder="e.g. 50000" value={form.monthlyAmount} onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })} />
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <Label htmlFor="c-total">Total agreed ({CURRENCY_SYMBOL[form.currency]}) *</Label>
                                    <Input id="c-total" inputMode="decimal" placeholder="e.g. 150000" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
                                </div>
                            )}
                        </div>

                        {form.kind === 'retainer' && (
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="c-day">Due on day *</Label>
                                        <Input id="c-day" type="number" min={1} max={28} value={form.billingDay} onChange={(e) => setForm({ ...form, billingDay: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="c-start">Starts</Label>
                                        <Input id="c-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="c-end">Ends (optional)</Label>
                                        <Input id="c-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    One payment falls due each month on that day (1–28), with a reminder before it.
                                    {editingId ? ' Changing the amount re-prices every month of this arrangement.' : ''}
                                </p>
                            </div>
                        )}

                        {!editingId && (
                            <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 grid gap-3">
                                <div>
                                    <p className="text-sm font-medium">Already received</p>
                                    <p className="text-xs text-slate-500">{form.kind === 'retainer' ? 'Support already received, e.g. the months paid so far. Leave empty if nothing yet.' : 'What has been paid so far, e.g. 50000 on the ₦150,000 app. Leave empty if nothing yet.'}{isCreator && form.developerId !== user?.id ? ' They will be asked to confirm it.' : ''}</p>
                                </div>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <Input inputMode="decimal" placeholder={`Amount (${CURRENCY_SYMBOL[form.currency]})`} value={form.receivedAmount} onChange={(e) => setForm({ ...form, receivedAmount: e.target.value })} />
                                    <Input type="date" value={form.receivedDate} onChange={(e) => setForm({ ...form, receivedDate: e.target.value })} />
                                    <Input placeholder="How (bank transfer, cash…)" value={form.receivedMethod} onChange={(e) => setForm({ ...form, receivedMethod: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {form.kind === 'project' && (
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Payments still to come</Label>
                                    <p className="text-xs text-slate-500">Add what is still owed and when. Reminders go out before each date. Anything you leave out counts as already paid up front.</p>
                                </div>
                                <Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, instalments: [...form.instalments, { label: "", amount: "", dueDate: "" }] })}>
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                </Button>
                            </div>
                            {form.instalments.map((r, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_120px_150px_32px] gap-2 items-center">
                                    <Input placeholder="e.g. Balance on delivery" value={r.label} onChange={(e) => setRow(idx, { label: e.target.value })} />
                                    <Input inputMode="decimal" placeholder="Amount" value={r.amount} onChange={(e) => setRow(idx, { amount: e.target.value })} />
                                    <Input type="date" value={r.dueDate} onChange={(e) => setRow(idx, { dueDate: e.target.value })} />
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm({ ...form, instalments: form.instalments.filter((_, i) => i !== idx) })}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Type of work</Label>
                            <Select value={form.category || undefined} onValueChange={(v: ContractCategory) => setForm({ ...form, category: v })}>
                                <SelectTrigger><SelectValue placeholder="Optional — used to group costs in Platform Spend" /></SelectTrigger>
                                <SelectContent>{CATEGORY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="c-terms">Terms</Label>
                            <Textarea id="c-terms" rows={4} placeholder="What is to be done, deadlines, warranty, how it is paid…" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
                            <p className="text-xs text-slate-500">
                                {form.developerId && form.developerId !== user?.id || !isCreator
                                    ? 'The contractor must read and accept these terms. If you change the terms, amounts or dates later, they are asked to accept again.'
                                    : 'These are the terms of the agreement.'}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="c-desc">Notes</Label>
                            <Textarea id="c-desc" rows={2} placeholder="Scope, what was agreed…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isCreating || isUpdating}>
                            {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingId ? 'Save changes' : 'Add contract'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Record payment */}
            <Dialog open={!!payFor} onOpenChange={(open) => !open && setPayFor(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record payment — {payFor?.title}</DialogTitle>
                        <DialogDescription>
                            {payFor ? `${payFor.kind === 'retainer' ? `${formatMoney(payFor.balance, payFor.currency)} is due now (${formatMoney(payFor.monthlyAmount ?? 0, payFor.currency)} a month). You can also pay ahead.` : `${formatMoney(payFor.balance, payFor.currency)} is still owed on this contract.`}${payFor.developerId !== user?.id ? ` It will count once ${payFor.developerName ?? 'the developer'} confirms receiving it.` : ''}` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="p-amount">Amount received ({payFor ? CURRENCY_SYMBOL[payFor.currency] : ''}) *</Label>
                                <Input id="p-amount" inputMode="decimal" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="p-date">Date received</Label>
                                <Input id="p-date" type="date" value={pay.paidOn} onChange={(e) => setPay({ ...pay, paidOn: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="p-method">How was it paid?</Label>
                            <Input id="p-method" placeholder="Bank transfer, cash…" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="p-note">Note</Label>
                            <Input id="p-note" placeholder="Reference number, anything to remember" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPayFor(null)}>Cancel</Button>
                        <Button onClick={handlePay} disabled={isPaying}>
                            {isPaying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Record payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details */}
            <Dialog open={!!detail} onOpenChange={(open) => !open && setDetailId(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {detail && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{detail.title}</DialogTitle>
                                <DialogDescription>
                                    {detail.kind === 'retainer'
                                        ? `Monthly support · ${formatMoney(detail.monthlyAmount ?? 0, detail.currency)} on day ${detail.billingDay ?? 1} · ${formatMoney(detail.paid, detail.currency)} received · ${formatMoney(detail.balance, detail.currency)} owed now`
                                        : `${formatMoney(detail.paid, detail.currency)} received of ${formatMoney(detail.totalAmount, detail.currency)} · ${formatMoney(detail.balance, detail.currency)} still owed`}
                                </DialogDescription>
                            </DialogHeader>
                            {detail.description && <p className="text-sm text-slate-600 dark:text-slate-300">{detail.description}</p>}

                            <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2"><FileSignature className="w-4 h-4" /> Agreement</h4>
                                    <Badge className={ACCEPTANCE[detail.acceptanceStatus].badge}>{ACCEPTANCE[detail.acceptanceStatus].label}</Badge>
                                </div>
                                {detail.category && <p className="text-xs text-slate-500">Type of work: {CATEGORY_OPTIONS.find((o) => o.value === detail.category)?.label ?? detail.category}</p>}
                                {detail.terms
                                    ? <p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">{detail.terms}</p>
                                    : <p className="text-sm text-slate-500">No written terms — the amounts and dates in this contract are what is agreed.</p>}
                                {detail.acceptanceStatus === 'accepted' && (
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                        Accepted by {detail.acceptance.typedName} on {fmtDate(detail.acceptance.acceptedAt)}{detail.acceptance.how === 'own contract' ? ' (their own contract)' : ''}.
                                    </p>
                                )}
                                {detail.acceptanceStatus === 'changed' && (
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        Changed since {detail.acceptance.typedName} accepted it on {fmtDate(detail.acceptance.acceptedAt)} — it needs to be accepted again.
                                    </p>
                                )}
                                {detail.acceptanceStatus === 'declined' && (
                                    <p className="text-xs text-red-600">Changes requested: {detail.acceptance.declineReason}</p>
                                )}
                                {detail.acceptance.ip && <p className="text-xs text-slate-400">Accepted from IP address {detail.acceptance.ip}</p>}

                                {detail.canAccept && (
                                    <div className="grid gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <Label htmlFor="acc-name">Type your full name to accept this contract</Label>
                                        <Input id="acc-name" placeholder="Your full name" value={acceptName} onChange={(e) => setAcceptName(e.target.value)} />
                                        <div className="flex flex-wrap gap-2">
                                            <Button onClick={() => handleAccept(detail)} disabled={isAccepting}>
                                                {isAccepting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />} Accept contract
                                            </Button>
                                            <Button variant="outline" onClick={() => { setDeclineFor(detail); setDeclineReason(""); }}>Ask for changes</Button>
                                        </div>
                                        <p className="text-xs text-slate-500">By accepting you agree to the terms, amounts and dates shown here. If any of them change later, you will be asked to accept again.</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">{detail.kind === 'retainer' ? 'Monthly schedule' : 'Payment schedule'}</h4>
                                {detail.instalments.length === 0 ? (
                                    <p className="text-sm text-slate-500">No instalments set. Edit the contract to add payment dates and get reminders.</p>
                                ) : (
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Payment</TableHead><TableHead>Due</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {detail.instalments.map((i) => (
                                                <TableRow key={i.id}>
                                                    <TableCell className="font-medium">{i.label}</TableCell>
                                                    <TableCell className="text-sm whitespace-nowrap">
                                                        {i.dueDate ? fmtDate(i.dueDate) : '—'}
                                                        {i.status !== 'paid' && i.dueDate && <div className={`text-xs ${i.overdue ? 'text-red-600' : 'text-slate-500'}`}>{dueText(i)}</div>}
                                                    </TableCell>
                                                    <TableCell className="font-mono whitespace-nowrap">
                                                        {formatMoney(i.amount, detail.currency)}
                                                        {i.status === 'partial' && <div className="text-xs text-slate-500">{formatMoney(i.outstanding, detail.currency)} left</div>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={i.status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : i.overdue ? 'bg-red-500 hover:bg-red-500 text-white' : 'bg-slate-500 hover:bg-slate-500 text-white'}>
                                                            {i.status === 'paid' ? 'Paid' : i.status === 'partial' ? 'Part paid' : i.overdue ? 'Overdue' : 'To pay'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">Payments received</h4>
                                {detail.payments.length === 0 ? (
                                    <p className="text-sm text-slate-500">Nothing received yet.</p>
                                ) : (
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
                                        <TableBody>
                                            {[...detail.payments].reverse().map((p) => {
                                                const isDeveloper = user?.id === detail.developerId;
                                                // a confirmed payment is the developer's record; unconfirmed ones can also be withdrawn by whoever entered them
                                                const canDelete = p.status === 'confirmed' ? isDeveloper : (isDeveloper || p.recordedBy === user?.id);
                                                return (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="whitespace-nowrap">{fmtDate(p.paidOn)}</TableCell>
                                                        <TableCell className="font-mono font-semibold whitespace-nowrap">{formatMoney(p.amount, detail.currency)}</TableCell>
                                                        <TableCell className="text-sm">
                                                            <Badge className={p.status === 'confirmed' ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : p.status === 'pending' ? 'bg-blue-500 hover:bg-blue-500 text-white' : 'bg-red-500 hover:bg-red-500 text-white'}>
                                                                {p.status === 'confirmed' ? 'Confirmed' : p.status === 'pending' ? 'Waiting for confirmation' : 'Not confirmed'}
                                                            </Badge>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {[p.method, p.note].filter(Boolean).join(' · ')}
                                                                {p.recordedByName && <span>{[p.method, p.note].some(Boolean) ? ' · ' : ''}recorded by {p.recordedByName}</span>}
                                                            </div>
                                                            {p.status === 'rejected' && p.rejectReason && <div className="text-xs text-red-600">Reason: {p.rejectReason}</div>}
                                                        </TableCell>
                                                        <TableCell className="text-right whitespace-nowrap">
                                                            {p.status === 'pending' && isDeveloper && (
                                                                <>
                                                                    <Button size="sm" className="mr-1" onClick={() => handleConfirm(detail, p)}><Check className="w-3.5 h-3.5 mr-1" /> Confirm</Button>
                                                                    <Button size="sm" variant="outline" className="mr-1" onClick={() => { setRejecting({ c: detail, p }); setRejectReason(""); }}>Not received</Button>
                                                                </>
                                                            )}
                                                            {p.status === 'confirmed' && (
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Download receipt (PDF)" disabled={downloading === p.id}
                                                                    onClick={() => handleDownload(`/api/contracts/${detail.id}/payments/${p.id}/receipt.pdf`, `receipt-${p.id.slice(0, 8)}.pdf`, p.id)}>
                                                                    {downloading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                                </Button>
                                                            )}
                                                            {canDelete && (
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" title="Remove this payment (use only to fix a mistake)" onClick={() => handleDeletePayment(detail, p.id)}>
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            <DialogFooter className="sm:justify-between gap-2">
                                <div className="flex gap-2">
                                    {detail.canDelete && (
                                        <Button variant="ghost" className="text-red-600" onClick={() => setDeleting(detail)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Remove contract
                                        </Button>
                                    )}
                                    <Button variant="outline" disabled={downloading === 'invoice'}
                                        onClick={() => handleDownload(`/api/contracts/${detail.id}/invoice.pdf`, 'invoice.pdf', 'invoice')}>
                                        {downloading === 'invoice' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                        {detail.balance > 0 ? 'Invoice (PDF)' : 'Statement (PDF)'}
                                    </Button>
                                </div>
                                {(detail.balance > 0 || (detail.kind === 'retainer' && detail.status === 'active')) && detail.status !== 'cancelled' && (
                                    <Button onClick={() => { const c = detail; setDetailId(null); openPay(c); }}><Wallet className="w-4 h-4 mr-2" /> Record payment</Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Onboard contractor */}
            <Dialog open={onboardOpen} onOpenChange={(open) => !open && closeOnboard()}>
                <DialogContent className="max-w-md">
                    {!onboarded ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>Onboard a contractor</DialogTitle>
                                <DialogDescription>
                                    They get their own login and see only the contracts that belong to them — nothing else in the system.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                                <div className="grid gap-2"><Label htmlFor="d-name">Full name *</Label>
                                    <Input id="d-name" value={dev.name} onChange={(e) => setDev({ ...dev, name: e.target.value })} /></div>
                                <div className="grid gap-2"><Label htmlFor="d-phone">Phone number * (they sign in with it)</Label>
                                    <Input id="d-phone" type="tel" value={dev.phone} onChange={(e) => setDev({ ...dev, phone: e.target.value })} /></div>
                                <div className="grid gap-2"><Label htmlFor="d-email">Email (optional)</Label>
                                    <Input id="d-email" type="email" value={dev.email} onChange={(e) => setDev({ ...dev, email: e.target.value })} /></div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={closeOnboard}>Cancel</Button>
                                <Button onClick={handleOnboard} disabled={isOnboarding}>
                                    {isOnboarding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add developer
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>{onboarded.name} has been added</DialogTitle>
                                <DialogDescription>
                                    {onboarded.emailSent || onboarded.smsSent
                                        ? `Their sign-in details were sent by ${[onboarded.smsSent && 'text message', onboarded.emailSent && 'email'].filter(Boolean).join(' and ')}.`
                                        : 'The message could not be sent — give them these details yourself.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-sm space-y-1">
                                <p>{onboarded.email ? 'Email' : 'Sign in with phone'}: <span className="font-mono font-semibold select-all">{onboarded.email || dev.phone}</span></p>
                                <p>Temporary password: <span className="font-mono font-semibold select-all">{onboarded.tempPassword}</span></p>
                            </div>
                            <p className="text-xs text-slate-500">This password is shown only now. They should change it after signing in.</p>
                            <DialogFooter><Button onClick={closeOnboard}>Done</Button></DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Ask for changes */}
            <Dialog open={!!declineFor} onOpenChange={(open) => !open && setDeclineFor(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ask for changes</DialogTitle>
                        <DialogDescription>
                            {declineFor ? `Tell ${declineFor.createdBy ? 'the person who set up' : ''} "${declineFor.title}" what you would like changed. They are notified, and can update the contract for you to accept.` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                        <Label htmlFor="dec">What would you like changed? *</Label>
                        <Textarea id="dec" rows={3} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeclineFor(null)}>Cancel</Button>
                        <Button onClick={handleDecline} disabled={isDeclining}>
                            {isDeclining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Send
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Not received */}
            <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark as not received?</DialogTitle>
                        <DialogDescription>
                            {rejecting ? `${formatMoney(rejecting.p.amount, rejecting.c.currency)} recorded by ${rejecting.p.recordedByName ?? 'someone'} will not count. It stays in the history, marked as not confirmed.` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                        <Label htmlFor="rej">Reason (optional)</Label>
                        <Input id="rej" placeholder="e.g. Nothing came into my account" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
                        <Button onClick={handleReject} disabled={isRejecting}>
                            {isRejecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Not received
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove {deleting?.title}?</AlertDialogTitle>
                        <AlertDialogDescription>It disappears from every list and total, including the developer's. This is meant for contracts entered by mistake.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
