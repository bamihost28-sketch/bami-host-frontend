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
import { useAuth } from "@/contexts/AuthContext";
import { useGetGlobalWalletSummaryQuery, useLazyAdminLookupUserQuery, useAdminCreditWalletMutation, type AdminLookupData, type AdminCreditData } from "@/services/walletApi";
import { WalletCard } from "./WalletCard";
import { toast } from "@/components/ui/use-toast";
import {
  Wallet,
  PiggyBank,
  Settings,
  Loader,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Search,
  BadgeDollarSign,
  User,
  Phone,
  Mail,
  ChevronLeft,
  Shield,
} from "lucide-react";

const ADMIN_ROLES = ['admin', 'super_admin', 'super_manager', 'business_owner'] as const;

type CreditStep = 'lookup' | 'confirm' | 'success';

const fmt = (n: number) => `₦${n.toLocaleString()}`;

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
    setStep('lookup');
    setEmail('');
    setAmount('');
    setReason('');
    setLookedUp(null);
    setResult(null);
    setResultMessage('');
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleLookup = async () => {
    if (!email.trim()) return;
    try {
      const res = await lookupUser(email.trim()).unwrap();
      setLookedUp(res.data);
      setStep('confirm');
    } catch {
      // error shown inline via lookupError
    }
  };

  const handleCredit = async () => {
    const amt = Number(amount);
    if (!lookedUp || !amt || amt <= 0) return;
    try {
      const res = await creditWallet({
        email: lookedUp.email,
        amount: amt,
        reason: reason.trim() || undefined,
      }).unwrap();
      setResult(res.data);
      setResultMessage(res.message);
      setStep('success');
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={step === 'lookup' ? 'text-primary font-semibold' : step !== 'lookup' ? 'text-emerald-600 font-medium' : ''}>
            1. Look up user
          </span>
          <ArrowRight className="h-3 w-3" />
          <span className={step === 'confirm' ? 'text-primary font-semibold' : step === 'success' ? 'text-emerald-600 font-medium' : ''}>
            2. Confirm & credit
          </span>
          <ArrowRight className="h-3 w-3" />
          <span className={step === 'success' ? 'text-emerald-600 font-semibold' : ''}>
            3. Done
          </span>
        </div>

        <Separator />

        {/* ── Step 1: Look up ── */}
        {step === 'lookup' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lookup-email">User email address</Label>
              <div className="flex gap-2">
                <Input
                  id="lookup-email"
                  type="email"
                  placeholder="tenant@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  disabled={looking}
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

        {/* ── Step 2: Confirm & credit ── */}
        {step === 'confirm' && lookedUp && (
          <div className="space-y-4">
            {/* User card */}
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

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="credit-amount">Amount to credit (₦)</Label>
              <Input
                id="credit-amount"
                type="number"
                min={1}
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amountValid && (
                <p className="text-xs text-muted-foreground">
                  New balance will be: <span className="font-semibold text-foreground">{fmt(lookedUp.walletBalance + amountNum)}</span>
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label htmlFor="credit-reason">
                Reason <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="credit-reason"
                placeholder="e.g. Rent overpayment refund"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex justify-between gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep('lookup')} disabled={crediting}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleCredit}
                disabled={!amountValid || crediting}
                className="flex-1"
              >
                {crediting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {crediting ? 'Crediting…' : `Credit ${amountValid ? fmt(amountNum) : ''} to ${lookedUp.name.split(' ')[0]}`}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
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
              <Button variant="outline" className="flex-1" onClick={reset}>
                Credit another user
              </Button>
              <Button className="flex-1" onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
          <h1 className="text-3xl font-bold text-foreground">Universal Wallet</h1>
          <p className="text-muted-foreground">
            Global wallet management across all 3 engines — 50/30/20 Split
          </p>
        </div>
        {canAdminCredit && (
          <Button onClick={() => setCreditOpen(true)}>
            <BadgeDollarSign className="h-4 w-4 mr-2" />
            Credit User Wallet
          </Button>
        )}
      </div>

      {canAdminCredit && (
        <AdminCreditDialog open={creditOpen} onOpenChange={setCreditOpen} />
      )}

      {/* Global Wallet Summary - 3 Engines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Global Wallet Summary
          </CardTitle>
          <CardDescription>Aggregated wallet data across all 3 engines (Growth, Fulfillment, Innovation)</CardDescription>
        </CardHeader>
        <CardContent>
          {walletLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading wallet summary…</span>
            </div>
          ) : walletError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-semibold">Error loading wallet data</p>
              <p className="text-sm mt-1">Unable to fetch global wallet summary. Please try refreshing.</p>
            </div>
          ) : globalWalletData ? (
            <div className="space-y-6">
              {/* Growth Engine */}
              <div className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Growth Engine</h3>
                    <p className="text-sm text-muted-foreground">Primary revenue & scaling focus</p>
                  </div>
                  <Badge className="bg-blue-900 text-blue-100">{globalWalletData.growthEngine.percentage}% Allocation</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <WalletCard label={globalWalletData.growthEngine.marketing.name.split(' ').slice(-1)[0]} value={globalWalletData.growthEngine.marketing.balance} percentage={globalWalletData.growthEngine.marketing.percentage} showProgress />
                  <WalletCard label={globalWalletData.growthEngine.operations.name.split(' ').slice(-1)[0]} value={globalWalletData.growthEngine.operations.balance} percentage={globalWalletData.growthEngine.operations.percentage} showProgress />
                  <WalletCard label={globalWalletData.growthEngine.savings.name.split(' ').slice(-1)[0]} value={globalWalletData.growthEngine.savings.balance} percentage={globalWalletData.growthEngine.savings.percentage} showProgress />
                </div>
                <div className="mt-4 flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="font-medium">Growth Engine Total</span>
                  <span className="text-lg font-bold text-blue-700">₦{globalWalletData.growthEngine.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Fulfillment Engine */}
              <div className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Fulfillment Engine</h3>
                    <p className="text-sm text-muted-foreground">Service delivery & execution</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{globalWalletData.fulfillmentEngine.percentage}% Allocation</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <WalletCard label={globalWalletData.fulfillmentEngine.marketing.name.split(' ').slice(-1)[0]} value={globalWalletData.fulfillmentEngine.marketing.balance} percentage={globalWalletData.fulfillmentEngine.marketing.percentage} showProgress />
                  <WalletCard label={globalWalletData.fulfillmentEngine.operations.name.split(' ').slice(-1)[0]} value={globalWalletData.fulfillmentEngine.operations.balance} percentage={globalWalletData.fulfillmentEngine.operations.percentage} showProgress />
                  <WalletCard label="Family Savings" value={globalWalletData.fulfillmentEngine.savings.balance} percentage={globalWalletData.fulfillmentEngine.savings.percentage} showProgress />
                </div>
                <div className="mt-4 flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="font-medium">Fulfillment Engine Total</span>
                  <span className="text-lg font-bold text-green-700">₦{globalWalletData.fulfillmentEngine.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Innovation Engine */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Innovation Engine</h3>
                    <p className="text-sm text-muted-foreground">Research, development & experimentation</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">{globalWalletData.innovationEngine.percentage}% Allocation</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <WalletCard label={globalWalletData.innovationEngine.marketing.name.split(' ').slice(-1)[0]} value={globalWalletData.innovationEngine.marketing.balance} percentage={globalWalletData.innovationEngine.marketing.percentage} showProgress />
                  <WalletCard label={globalWalletData.innovationEngine.operations.name.split(' ').slice(-1)[0]} value={globalWalletData.innovationEngine.operations.balance} percentage={globalWalletData.innovationEngine.operations.percentage} showProgress />
                  <WalletCard label={globalWalletData.innovationEngine.savings.name.split(' ').slice(-1)[0]} value={globalWalletData.innovationEngine.savings.balance} percentage={globalWalletData.innovationEngine.savings.percentage} showProgress />
                </div>
                <div className="mt-4 flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="font-medium">Innovation Engine Total</span>
                  <span className="text-lg font-bold text-purple-700">₦{globalWalletData.innovationEngine.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Global Summary */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Global Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <WalletCard label="Total Balance" value={globalWalletData.summary.totalBalance} variant="summary" />
                  <WalletCard label="Total Received" value={globalWalletData.summary.totalReceived} variant="summary" />
                  <WalletCard label="Total Marketing" value={globalWalletData.summary.totalMarketing} variant="summary" />
                  <WalletCard label="Total Operations" value={globalWalletData.summary.totalOperations} variant="summary" />
                  <WalletCard label="Total Savings" value={globalWalletData.summary.totalSavings} variant="summary" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No wallet data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Management */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>View and manage all wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent-transactions" className="space-y-4">
            <TabsList className="dashboard-tabs-list">
              <TabsTrigger value="recent-transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="allocations">Allocation History</TabsTrigger>
              {canAdminCredit && <TabsTrigger value="admin-credit">Admin Credit</TabsTrigger>}
              <TabsTrigger value="settings">Wallet Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="recent-transactions" className="space-y-4">
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Recent Transactions</h3>
                <p className="text-muted-foreground">Transaction history coming soon — API integration in progress</p>
                <Button className="mt-4">Refresh Data</Button>
              </div>
            </TabsContent>

            <TabsContent value="allocations" className="space-y-4">
              <div className="text-center py-8">
                <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Allocation History</h3>
                <p className="text-muted-foreground">Track historical 50/30/20 allocations and performance</p>
                <Button className="mt-4">View Full History</Button>
              </div>
            </TabsContent>

            {canAdminCredit && (
              <TabsContent value="admin-credit" className="space-y-4">
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BadgeDollarSign className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Credit a User's Wallet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Look up any user by email and credit their wallet directly. The recipient gets an email notification automatically.
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
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Wallet Settings</h3>
                <p className="text-muted-foreground">Configure wallet preferences, notifications, and security</p>
                <Button className="mt-4">Open Settings</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
