import { useState, useEffect, useCallback } from "react";
import { ArrowDownRight, ArrowUpRight, Send, Loader2, ChevronLeft, ChevronRight, Filter, X, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: number | string;
  date: string;
  createdAt?: string;
  description: string;
  type: "deposit" | "withdraw" | "withdrawal" | "transfer";
  amount: number;
  status: string;
  reference?: string;
}

interface TransactionsPanelProps {
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  onTransactionComplete?: () => void;
}

export const TransactionsPanel = ({ formatCurrency, formatDate, getStatusColor, onTransactionComplete }: TransactionsPanelProps) => {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "", method: "bank_transfer", description: "" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", accountName: "", accountNumber: "", bankName: "" });
  const [transferForm, setTransferForm] = useState({ amount: "", recipientEmail: "", recipientType: "user" as "user" | "estate", recipientId: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wallet balance state
  const [balance, setBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ type: "", status: "", search: "", startDate: "", endDate: "" });
  const [showFilters, setShowFilters] = useState(false);

  const fetchWallet = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch wallet");
      setBalance(data.balance ?? 0);
    } catch {
      // Silently fail — balance shows 0
    } finally {
      setWalletLoading(false);
    }
  }, [getToken]);

  const fetchTransactions = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await fetch(`/api/wallet/transactions/list?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setFetchError(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch transactions");
      setFetchError(false);
      setTransactions(data.transactions || data.data || []);
      setTotal(data.total || 0);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, getToken, toast]);

  useEffect(() => {
    fetchTransactions();
    fetchWallet();
  }, [fetchTransactions, fetchWallet]);

  const refreshTransactions = () => {
    setPage(1);
    fetchTransactions();
    fetchWallet();
    onTransactionComplete?.();
  };

  const handleOpenDeposit = () => {
    setDepositForm({ amount: "", method: "bank_transfer", description: "" });
    setDepositDialogOpen(true);
  };

  const handleOpenWithdraw = () => {
    setWithdrawForm({ amount: "", accountName: "", accountNumber: "", bankName: "" });
    setWithdrawDialogOpen(true);
  };

  const handleOpenTransfer = () => {
    setTransferForm({ amount: "", recipientEmail: "", recipientType: "user", recipientId: "", description: "" });
    setTransferDialogOpen(true);
  };

  const handleDeposit = async () => {
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      toast("Please enter a valid amount", "error");
      return;
    }
    const token = getToken();
    if (!token) {
      toast("Not authenticated", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wallet/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "deposit", amount: parseFloat(depositForm.amount), ...(depositForm.description ? { description: depositForm.description } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deposit failed");
      toast(`${formatCurrency(parseFloat(depositForm.amount))} deposited to wallet`, "success");
      setDepositDialogOpen(false);
      setDepositForm({ amount: "", method: "bank_transfer", description: "" });
      refreshTransactions();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      toast("Please enter a valid amount", "error");
      return;
    }
    const amount = parseFloat(withdrawForm.amount);
    if (amount > balance) {
      toast("Insufficient wallet balance", "error");
      return;
    }
    if (!withdrawForm.accountName || !withdrawForm.accountNumber || !withdrawForm.bankName) {
      toast("Please fill in all bank details", "error");
      return;
    }
    const token = getToken();
    if (!token) {
      toast("Not authenticated", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wallet/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: "withdraw",
          amount,
          bankDetails: {
            accountName: withdrawForm.accountName,
            accountNumber: withdrawForm.accountNumber,
            bankName: withdrawForm.bankName,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal failed");
      toast(`${formatCurrency(amount)} withdrawal request submitted`, "success");
      setWithdrawDialogOpen(false);
      refreshTransactions();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      toast("Please enter a valid amount", "error");
      return;
    }
    if (!transferForm.recipientEmail) {
      toast("Please enter recipient email", "error");
      return;
    }
    const amount = parseFloat(transferForm.amount);
    if (amount > balance) {
      toast("Insufficient wallet balance", "error");
      return;
    }
    const token = getToken();
    if (!token) {
      toast("Not authenticated", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wallet/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: "transfer",
          amount,
          recipientEmail: transferForm.recipientEmail,
          recipientType: transferForm.recipientType,
          ...(transferForm.recipientType === "estate" && transferForm.recipientId ? { recipientId: transferForm.recipientId } : {}),
          ...(transferForm.description ? { description: transferForm.description } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Transfer failed");
      toast(`${formatCurrency(amount)} transferred to ${transferForm.recipientEmail}`, "success");
      setTransferDialogOpen(false);
      setTransferForm({ amount: "", recipientEmail: "", recipientType: "user", recipientId: "", description: "" });
      refreshTransactions();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setFilters({ type: "", status: "", search: "", startDate: "", endDate: "" });
    setPage(1);
  };

  const hasActiveFilters = filters.type || filters.status || filters.search || filters.startDate || filters.endDate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your wallet and view transaction history</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Wallet Balance</CardTitle>
          <CardDescription>Your current wallet balance and quick actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Available Balance</p>
                {walletLoading ? (
                  <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{formatCurrency(balance)}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={handleOpenDeposit} className="bg-green-600 hover:bg-green-700">
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button variant="outline" onClick={handleOpenWithdraw}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
                <Button variant="outline" onClick={handleOpenTransfer}>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Transaction History</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description or reference..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={filters.type} onValueChange={(v) => { setFilters({ ...filters, type: v }); setPage(1); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="All types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={filters.status} onValueChange={(v) => { setFilters({ ...filters, status: v }); setPage(1); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="All status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">From Date</Label>
                  <Input type="date" className="mt-1" value={filters.startDate} onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }} />
                </div>
                <div>
                  <Label className="text-xs">To Date</Label>
                  <Input type="date" className="mt-1" value={filters.endDate} onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }} />
                </div>
                {hasActiveFilters && (
                  <div className="sm:col-span-2 md:col-span-4">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-3 w-3 mr-1" />
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fetchError ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">Unable to load transactions. Please try again later.</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">No transactions found</p>
            ) : (
              <>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === "deposit" ? "bg-green-100 dark:bg-green-900/30" :
                        transaction.type === "withdraw" || transaction.type === "withdrawal" ? "bg-red-100 dark:bg-red-900/30" :
                        "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        {transaction.type === "deposit" ? (
                          <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : transaction.type === "withdraw" || transaction.type === "withdrawal" ? (
                          <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(transaction.date || transaction.createdAt || "")} • {transaction.reference || `#${transaction.id}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === "deposit" ? "text-green-600 dark:text-green-400" :
                        "text-red-600 dark:text-red-400"
                      }`}>
                        {transaction.type === "deposit" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={`${getStatusColor(transaction.status)}`}>{transaction.status}</Badge>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total}
                    </p>
                    <div className="flex items-center gap-2">
                      <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-[80px] h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">{page} / {totalPages}</span>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit to Wallet</DialogTitle>
            <DialogDescription>Add funds to your wallet balance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input placeholder="e.g., Monthly rent deposit" value={depositForm.description} onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={depositForm.method} onValueChange={(value) => setDepositForm({ ...depositForm, method: value })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Debit/Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleDeposit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw from Wallet</DialogTitle>
            <DialogDescription>Withdraw funds to your bank account. Withdrawals require admin approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Account Name</Label>
              <Input placeholder="Enter account name" value={withdrawForm.accountName} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })} />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input placeholder="Enter account number" value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })} />
            </div>
            <div>
              <Label>Bank Name</Label>
              <Input placeholder="Enter bank name" value={withdrawForm.bankName} onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleWithdraw} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>Send money to another user or estate wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
            </div>
            <div>
              <Label>Recipient Type</Label>
              <Select value={transferForm.recipientType} onValueChange={(value: "user" | "estate") => setTransferForm({ ...transferForm, recipientType: value })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="estate">Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recipient Email</Label>
              <Input type="email" placeholder="Enter recipient email" value={transferForm.recipientEmail} onChange={(e) => setTransferForm({ ...transferForm, recipientEmail: e.target.value })} />
            </div>
            {transferForm.recipientType === "estate" && (
              <div>
                <Label>Estate ID</Label>
                <Input placeholder="Enter estate ID" value={transferForm.recipientId} onChange={(e) => setTransferForm({ ...transferForm, recipientId: e.target.value })} />
              </div>
            )}
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input placeholder="e.g., Payment for services" value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
