import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGetGlobalWalletSummaryQuery,
  useGetWalletTransactionListQuery,
  useLazyAdminLookupUserQuery,
  useAdminCreditWalletMutation,
  type AdminLookupData,
  type AdminCreditData,
  type WalletTxType,
  type WalletTxStatus,
} from "@/services/walletApi";
import { WalletCard } from "./WalletCard";
import { BankDepositsPanel } from "./business/BankDepositsPanel";
import { toast } from "@/components/ui/use-toast";
import {
  Wallet,
  TrendingUp,
  Settings,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Search,
  BadgeDollarSign,
  Phone,
  Mail,
  ChevronLeft,
  Shield,
  X,
  Info,
  Zap,
  Cpu,
  Lightbulb,
  Building2,
  User,
  BarChart3,
} from "lucide-react";

const ADMIN_ROLES = ['admin', 'super_admin', 'super_manager', 'business_owner'] as const;
type CreditStep = 'lookup' | 'confirm' | 'success';

const fmt = (n: number) => `₦${n.toLocaleString()}`;

const TX_TYPE_LABELS: Record<string, string> = {
  rent: 'Rent',
  deposit: 'Deposit',
  service_charge: 'Service Charge',
  caution_fee: 'Caution Fee',
  legal_fee: 'Legal Fee',
  withdrawal: 'Withdrawal',
  transfer: 'Transfer',
  other: 'Other',
};

const TX_TYPE_COLORS: Record<string, string> = {
  rent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  deposit: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  service_charge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  caution_fee: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  legal_fee: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  withdrawal: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  transfer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  other: 'bg-muted text-muted-foreground',
};

const TX_STATUS_CLASSES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const TX_LIMIT = 20;

// ── Transaction List ────────────────────────────────────────────────────────
const TransactionList = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const params = {
    page,
    limit: TX_LIMIT,
    ...(search.trim() && { search: search.trim() }),
    ...(type !== 'all' && { type: type as WalletTxType }),
    ...(status !== 'all' && { status: status as WalletTxStatus }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data, isLoading, isFetching } = useGetWalletTransactionListQuery(params);
  const totalPages = data ? Math.ceil((data.total ?? 0) / TX_LIMIT) : 0;
  const hasFilters = search || type !== 'all' || status !== 'all' || startDate || endDate;

  const clearFilters = () => {
    setSearch(''); setType('all'); setStatus('all');
    setStartDate(''); setEndDate(''); setPage(1);
  };
  const onFilterChange = () => setPage(1);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by description or reference…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); onFilterChange(); }}
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={(v) => { setType(v); onFilterChange(); }}>
          <SelectTrigger className="w-[155px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="service_charge">Service Charge</SelectItem>
            <SelectItem value="caution_fee">Caution Fee</SelectItem>
            <SelectItem value="legal_fee">Legal Fee</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); onFilterChange(); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date" className="w-[145px]" value={startDate}
          onChange={(e) => { setStartDate(e.target.value); onFilterChange(); }}
        />
        <Input
          type="date" className="w-[145px]" value={endDate}
          onChange={(e) => { setEndDate(e.target.value); onFilterChange(); }}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Stats row */}
      {data && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><span className="font-semibold text-foreground">{data.total ?? 0}</span> total transactions</span>
          {hasFilters && <Badge variant="secondary" className="text-xs">Filtered</Badge>}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-14">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-14 border border-dashed rounded-xl">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground text-sm">No transactions found</p>
          {hasFilters && (
            <Button variant="link" size="sm" onClick={clearFilters} className="mt-1">Clear filters</Button>
          )}
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tenant / User</TableHead>
                <TableHead>Estate</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((tx) => (
                <TableRow key={tx._id} className="hover:bg-muted/30">
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TX_TYPE_COLORS[tx.type] ?? 'bg-muted text-muted-foreground'}`}>
                      {TX_TYPE_LABELS[tx.type] ?? tx.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[120px]">
                        {tx.tenant?.tenantName || tx.user?.name || <span className="text-muted-foreground">—</span>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tx.estate?.name ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[110px]">{tx.estate.name}</span>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                    {tx.description || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[100px] truncate">
                    {tx.reference || '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TX_STATUS_CLASSES[tx.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">
                    {tx.type === 'withdrawal' ? (
                      <span className="text-red-600 dark:text-red-400">-{fmt(tx.amount)}</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">+{fmt(tx.amount)}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages} — {data?.total ?? 0} transactions</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isFetching}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || isFetching}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Admin Credit Dialog ─────────────────────────────────────────────────────
const AdminCreditDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [step, setStep] = useState<CreditStep>('lookup');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [lookedUp, setLookedUp] = useState<AdminLookupData | null>(null);
  const [result, setResult] = useState<AdminCreditData | null>(null);
  const [resultMessage, setResultMessage] = useState('');

  const [lookupUser, { isFetching: looking, error: lookupError }] = useLazyAdminLookupUserQuery();
  const [creditWallet, { isLoading: crediting }] = useAdminCreditWalletMutation();

  const reset = () => {
    setStep('lookup'); setEmail(''); setAmount(''); setReason('');
    setLookedUp(null); setResult(null); setResultMessage('');
  };
  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v); };

  const handleLookup = async () => {
    if (!email.trim()) return;
    try {
      const res = await lookupUser(email.trim()).unwrap();
      setLookedUp(res.data); setStep('confirm');
    } catch { /* error shown inline */ }
  };

  const handleCredit = async () => {
    const amt = Number(amount);
    if (!lookedUp || !amt || amt <= 0) return;
    try {
      const res = await creditWallet({ email: lookedUp.email, amount: amt, reason: reason.trim() || undefined }).unwrap();
      setResult(res.data); setResultMessage(res.message); setStep('success');
    } catch {
      toast({ title: 'Credit failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const amountNum = Number(amount);
  const amountValid = amountNum > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-primary" />
            Credit User Wallet
          </DialogTitle>
          <DialogDescription>
            {step === 'lookup' && 'Find the user by email before sending funds.'}
            {step === 'confirm' && 'Confirm the recipient and enter the credit amount.'}
            {step === 'success' && 'Wallet credited successfully.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={step === 'lookup' ? 'text-primary font-semibold' : step !== 'lookup' ? 'text-emerald-600 font-medium' : ''}>1. Look up user</span>
          <ArrowRight className="h-3 w-3" />
          <span className={step === 'confirm' ? 'text-primary font-semibold' : step === 'success' ? 'text-emerald-600 font-medium' : ''}>2. Confirm & credit</span>
          <ArrowRight className="h-3 w-3" />
          <span className={step === 'success' ? 'text-emerald-600 font-semibold' : ''}>3. Done</span>
        </div>

        <Separator />

        {step === 'lookup' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lookup-email">User email address</Label>
              <div className="flex gap-2">
                <Input
                  id="lookup-email" type="email" placeholder="tenant@mail.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()} disabled={looking}
                />
                <Button onClick={handleLookup} disabled={!email.trim() || looking}>
                  {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {lookupError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>No user found with that email. Double-check and try again.</span>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {step === 'confirm' && lookedUp && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {lookedUp.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{lookedUp.name}</p>
                  <Badge variant="secondary" className="text-xs capitalize">{lookedUp.role}</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{lookedUp.email}</span>
                </div>
                {lookedUp.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{lookedUp.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Current balance:</span>
                  <span className="font-semibold text-foreground">{fmt(lookedUp.walletBalance)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
              <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Confirm this is the correct recipient before proceeding.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="credit-amount">Amount to credit (₦)</Label>
              <Input
                id="credit-amount" type="number" min={1} placeholder="e.g. 50000"
                value={amount} onChange={(e) => setAmount(e.target.value)}
              />
              {amountValid && (
                <p className="text-xs text-muted-foreground">
                  New balance will be: <span className="font-semibold text-foreground">{fmt(lookedUp.walletBalance + amountNum)}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="credit-reason">Reason <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea id="credit-reason" placeholder="e.g. Rent overpayment refund" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>

            <div className="flex justify-between gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep('lookup')} disabled={crediting}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleCredit} disabled={!amountValid || crediting} className="flex-1">
                {crediting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {crediting ? 'Crediting…' : `Credit ${amountValid ? fmt(amountNum) : ''} to ${lookedUp.name.split(' ')[0]}`}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && result && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center py-2 gap-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-semibold text-foreground">{resultMessage}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium">{result.recipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount credited</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{fmt(result.amountCredited)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New balance</span>
                <span className="font-semibold">{fmt(result.newBalance)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-foreground truncate max-w-[160px]">{result.transactionId}</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {result.recipient.name.split(' ')[0]} will receive an email notification of this credit.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>Credit another user</Button>
              <Button className="flex-1" onClick={() => handleClose(false)}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Engine Section ──────────────────────────────────────────────────────────
const ENGINE_CONFIG = {
  growth: {
    label: 'Growth Engine',
    icon: <Zap className="h-5 w-5" />,
    description: 'Primary business scaling — 50% of all received payments',
    variant: 'growth' as const,
    headerClass: 'bg-blue-600',
    totalClass: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900',
    totalTextClass: 'text-blue-700 dark:text-blue-300',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  fulfillment: {
    label: 'Fulfillment Engine',
    icon: <Cpu className="h-5 w-5" />,
    description: 'Service delivery & owner operations — 30% of all received payments',
    variant: 'fulfillment' as const,
    headerClass: 'bg-emerald-600',
    totalClass: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900',
    totalTextClass: 'text-emerald-700 dark:text-emerald-300',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  innovation: {
    label: 'Innovation Engine',
    icon: <Lightbulb className="h-5 w-5" />,
    description: 'Research, savings & emergency reserves — 20% of all received payments',
    variant: 'innovation' as const,
    headerClass: 'bg-purple-600',
    totalClass: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900',
    totalTextClass: 'text-purple-700 dark:text-purple-300',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
};

interface EngineData {
  marketing: { name: string; balance: number; percentage: number };
  operations: { name: string; balance: number; percentage: number };
  savings: { name: string; balance: number; percentage: number };
  total: number;
  percentage: number;
}

const EngineSection = ({
  engineKey,
  data,
  fulfillmentSavingsLabel,
}: {
  engineKey: keyof typeof ENGINE_CONFIG;
  data: EngineData;
  fulfillmentSavingsLabel?: string;
}) => {
  const cfg = ENGINE_CONFIG[engineKey];

  const subWallets = [
    {
      label: 'Marketing & Sales',
      description: `${data.marketing.percentage}% of total — growth & affiliate`,
      value: data.marketing.balance,
      percentage: data.marketing.percentage,
    },
    {
      label: 'Operations',
      description: `${data.operations.percentage}% of total — service & delivery`,
      value: data.operations.balance,
      percentage: data.operations.percentage,
    },
    {
      label: fulfillmentSavingsLabel ?? 'Savings & Emergency',
      description: `${data.savings.percentage}% of total — reserves`,
      value: data.savings.balance,
      percentage: data.savings.percentage,
    },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Engine header */}
      <div className={`${cfg.headerClass} px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3 text-white">
          {cfg.icon}
          <div>
            <p className="font-bold text-base">{cfg.label}</p>
            <p className="text-xs opacity-80">{cfg.description}</p>
          </div>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${cfg.badgeClass}`}>
          {data.percentage}% Allocation
        </span>
      </div>

      {/* Sub-wallets */}
      <div className="p-4 bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {subWallets.map((w) => (
            <WalletCard
              key={w.label}
              label={w.label}
              description={w.description}
              value={w.value}
              percentage={w.percentage}
              showProgress
              variant={cfg.variant}
            />
          ))}
        </div>

        {/* Engine total */}
        <div className={`mt-3 flex items-center justify-between px-4 py-3 rounded-lg border ${cfg.totalClass}`}>
          <span className="text-sm font-semibold text-muted-foreground">{cfg.label} Total</span>
          <span className={`text-lg font-bold ${cfg.totalTextClass}`}>{fmt(data.total)}</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────────────────────
export const WalletDashboard = () => {
  const { user } = useAuth();
  const [creditOpen, setCreditOpen] = useState(false);

  const canAdminCredit = ADMIN_ROLES.includes(user?.role as typeof ADMIN_ROLES[number]);
  const { data: walletResponse, isLoading: walletLoading, error: walletError } = useGetGlobalWalletSummaryQuery();
  const globalWalletData = walletResponse?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallet Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            All tenant payments split automatically — 50% Growth · 30% Fulfillment · 20% Innovation
          </p>
        </div>
        {canAdminCredit && (
          <Button onClick={() => setCreditOpen(true)}>
            <BadgeDollarSign className="h-4 w-4 mr-2" />
            Credit User Wallet
          </Button>
        )}
      </div>

      {canAdminCredit && <AdminCreditDialog open={creditOpen} onOpenChange={setCreditOpen} />}

      {/* Top summary bar */}
      {!walletLoading && globalWalletData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total balance hero */}
          <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Wallet Balance</p>
                    <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      Real Money Received
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-100">
                    {fmt(globalWalletData.summary.totalBalance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total collected from tenant payments · distributed across 9 sub-wallets
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              {globalWalletData.summary.totalReceived > 0 && (
                <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-900">
                  <p className="text-xs text-muted-foreground">
                    Total ever received: <span className="font-semibold text-foreground">{fmt(globalWalletData.summary.totalReceived)}</span>
                    {globalWalletData.summary.totalReceived !== globalWalletData.summary.totalBalance && (
                      <span className="ml-2 text-amber-600 dark:text-amber-400">
                        (Difference = withdrawals made)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Balance by Category
              </CardTitle>
              <CardDescription className="text-xs">How funds are split across all 3 engines combined</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Total Marketing (50%)', value: globalWalletData.summary.totalMarketing, color: 'bg-blue-500' },
                { label: 'Total Operations (30%)', value: globalWalletData.summary.totalOperations, color: 'bg-emerald-500' },
                { label: 'Total Savings (20%)', value: globalWalletData.summary.totalSavings, color: 'bg-purple-500' },
              ].map((item) => {
                const pct = globalWalletData.summary.totalBalance > 0
                  ? Math.round((item.value / globalWalletData.summary.totalBalance) * 100)
                  : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{fmt(item.value)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Wallet — 3 Engines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            50/30/20 Engine Breakdown
          </CardTitle>
          <CardDescription>
            Every payment received is automatically split across these 3 engines and their 9 sub-wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {walletLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading wallet data…</span>
            </div>
          ) : walletError ? (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Failed to load wallet data</p>
                <p className="text-sm">Please refresh the page to try again.</p>
              </div>
            </div>
          ) : globalWalletData ? (
            <div className="space-y-4">
              <EngineSection engineKey="growth" data={globalWalletData.growthEngine} />
              <EngineSection engineKey="fulfillment" data={globalWalletData.fulfillmentEngine} fulfillmentSavingsLabel="Family Savings" />
              <EngineSection engineKey="innovation" data={globalWalletData.innovationEngine} />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No wallet data available yet.</p>
              <p className="text-xs mt-1">Wallet balances appear once tenant payments are recorded.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions + Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>View and manage all wallet transactions across estates</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="dashboard-tabs-list">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              {canAdminCredit && <TabsTrigger value="bank-deposits">Bank Deposits</TabsTrigger>}
              <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
              {canAdminCredit && <TabsTrigger value="admin-credit">Admin Credit</TabsTrigger>}
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <TransactionList />
            </TabsContent>

            {canAdminCredit && (
              <TabsContent value="bank-deposits">
                <BankDepositsPanel />
              </TabsContent>
            )}

            {/* How It Works — replaces empty "Allocation History" */}
            <TabsContent value="how-it-works" className="space-y-4">
              <div className="rounded-xl border border-border p-5 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">How the 50/30/20 Split Works</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every naira received from a tenant payment is automatically distributed across 9 sub-wallets using a nested 50/30/20 model. Nothing sits idle — funds are always categorised.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {[
                    {
                      engine: 'Growth Engine (50%)',
                      color: 'border-l-blue-500',
                      bg: 'bg-blue-50 dark:bg-blue-950/20',
                      description: 'Business scaling and acquisition. The largest bucket — funds here grow the business.',
                      items: [
                        { name: 'Marketing & Sales', pct: '25%', note: 'Advertising, affiliate commissions, lead generation' },
                        { name: 'Operations', pct: '15%', note: 'Day-to-day business running costs' },
                        { name: 'Savings & Emergency', pct: '10%', note: 'Business reserve fund' },
                      ],
                    },
                    {
                      engine: 'Fulfillment Engine (30%)',
                      color: 'border-l-emerald-500',
                      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
                      description: 'Service delivery and owner asset operations.',
                      items: [
                        { name: 'Marketing & Sales', pct: '15%', note: 'Owner-level marketing and affiliate' },
                        { name: 'Operations', pct: '9%', note: 'Property management and service costs' },
                        { name: 'Family Savings', pct: '6%', note: 'Personal/family reserve — withdrawable' },
                      ],
                    },
                    {
                      engine: 'Innovation Engine (20%)',
                      color: 'border-l-purple-500',
                      bg: 'bg-purple-50 dark:bg-purple-950/20',
                      description: 'Research, development, and emergency reserves.',
                      items: [
                        { name: 'Marketing & Sales', pct: '10%', note: 'Innovation and product marketing' },
                        { name: 'Operations', pct: '6%', note: 'R&D and experimental spending' },
                        { name: 'Savings & Emergency', pct: '4%', note: 'Long-term emergency reserve' },
                      ],
                    },
                  ].map((eng) => (
                    <div key={eng.engine} className={`border-l-4 ${eng.color} ${eng.bg} rounded-r-xl pl-4 pr-4 py-4 space-y-3`}>
                      <div>
                        <p className="font-semibold text-foreground">{eng.engine}</p>
                        <p className="text-xs text-muted-foreground">{eng.description}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {eng.items.map((item) => (
                          <div key={item.name} className="bg-background/60 rounded-lg p-2.5 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-foreground">{item.name}</p>
                              <span className="text-[10px] font-bold text-muted-foreground">{item.pct}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>The <strong>Wallet Balance</strong> you see on the dashboard is real collected money — not a projection. Projections show what you <em>expect</em> to earn based on active tenants.</span>
                </div>
              </div>
            </TabsContent>

            {canAdminCredit && (
              <TabsContent value="admin-credit">
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BadgeDollarSign className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Credit a User's Wallet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Look up any user by email and credit their personal wallet directly. The recipient gets an email notification automatically.
                    </p>
                  </div>
                  <Button onClick={() => setCreditOpen(true)}>
                    <BadgeDollarSign className="h-4 w-4 mr-2" />
                    Start Credit Transfer
                  </Button>
                </div>
              </TabsContent>
            )}

            <TabsContent value="settings" className="space-y-4">
              <div className="rounded-xl border border-border p-5 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Wallet Configuration</h3>
                    <p className="text-sm text-muted-foreground mt-1">Current split settings applied to all incoming payments.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Growth Engine', pct: 50, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    { label: 'Fulfillment Engine', pct: 30, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                    { label: 'Innovation Engine', pct: 20, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 text-center ${s.bg}`}>
                      <p className={`text-3xl font-black ${s.color}`}>{s.pct}%</p>
                      <p className="text-xs font-semibold text-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-muted/40 border border-border p-4 text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Distribution Rules</p>
                  <p>• Split is applied automatically on every confirmed payment.</p>
                  <p>• Each engine is further split 50/30/20 internally across Marketing, Operations, and Savings.</p>
                  <p>• Family Savings (Fulfillment Engine, 6% of total) can be withdrawn separately.</p>
                  <p>• The allocation percentages are fixed — contact your system administrator to change them.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
