import { useState, useMemo } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Search, Filter, Download,
  RefreshCw, Calendar, ChevronLeft, ChevronRight, Receipt,
  TrendingUp, TrendingDown, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTransactionsListQuery } from "@/services/walletTransactionApi";

// ── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const CREDIT_TYPES = new Set(["admin_credit", "credit", "rent", "deposit"]);

const isCredit = (type: string) => CREDIT_TYPES.has(type);

const TYPE_META: Record<string, { label: string; color: string }> = {
  rent:         { label: "Rent",         color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  admin_credit: { label: "Admin Credit", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  credit:       { label: "Credit",       color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  deposit:      { label: "Deposit",      color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  debit:        { label: "Debit",        color: "bg-red-500/15 text-red-400 border-red-500/30" },
  transfer:     { label: "Transfer",     color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  withdrawal:   { label: "Withdrawal",   color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  paid:      { label: "Paid",      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pending:   { label: "Pending",   color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  failed:    { label: "Failed",    color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const TypeBadge = ({ type }: { type: string }) => {
  const m = TYPE_META[type] ?? { label: type, color: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${m.color}`}>
      {m.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const m = STATUS_META[status] ?? { label: status, color: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${m.color}`}>
      {m.label}
    </span>
  );
};

// ── summary card ─────────────────────────────────────────────────────────────

const SummaryCard = ({
  label, value, icon: Icon, color, sub,
}: {
  label: string; value: string; icon: React.ElementType;
  color: string; sub?: string;
}) => (
  <Card className="border-border/50">
    <CardContent className="pt-5 pb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ── row skeleton ──────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <tr className="border-b border-border/40">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full rounded" />
      </td>
    ))}
  </tr>
);

// ── main component ────────────────────────────────────────────────────────────

const LIMIT = 15;

export const SuperAdminTransactions = () => {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [typeFilter, setType]   = useState("all");
  const [statusFilter, setStatus] = useState("all");
  const [startDate, setStart]   = useState("");
  const [endDate, setEnd]       = useState("");

  const params = useMemo(() => ({
    page,
    limit: LIMIT,
    ...(typeFilter   !== "all" && { type: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(search       && { search }),
    ...(startDate    && { startDate }),
    ...(endDate      && { endDate }),
  }), [page, typeFilter, statusFilter, search, startDate, endDate]);

  const { data, isLoading, isFetching, refetch } = useGetTransactionsListQuery(params);

  const rows       = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = (data?.totalPages ?? data?.pages) || Math.ceil(total / LIMIT) || 1;

  // client-side summary from current filtered set (all pages approximated from this page)
  const totalIn  = rows.filter(t => isCredit(t.type)).reduce((s, t) => s + t.amount, 0);
  const totalOut = rows.filter(t => !isCredit(t.type)).reduce((s, t) => s + t.amount, 0);

  const resetFilters = () => {
    setPage(1); setSearch(""); setType("all"); setStatus("all");
    setStart(""); setEnd("");
  };

  const exportCSV = () => {
    if (!rows.length) return;
    const headers = ["Date", "Type", "User", "Estate", "Description", "Reference", "Status", "Amount"];
    const csvRows = rows.map(tx => [
      fmtDate(tx.createdAt),
      tx.type,
      (typeof tx.tenant === "object" ? tx.tenant?.tenantName : null)
        ?? (typeof tx.user === "object" ? (tx.user as any)?.name : null) ?? "—",
      (typeof tx.estate === "object" ? tx.estate?.name : null) ?? "—",
      tx.description ?? "—",
      tx.reference ?? "—",
      tx.status,
      tx.amount,
    ]);
    const csv = [headers, ...csvRows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All money movements across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!rows.length}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Records"
          value={total.toLocaleString()}
          icon={Receipt}
          color="bg-primary/10 text-primary"
          sub={`Page ${page} of ${totalPages || 1}`}
        />
        <SummaryCard
          label="This Page — In"
          value={fmt(totalIn)}
          icon={TrendingUp}
          color="bg-emerald-500/10 text-emerald-500"
          sub={`${rows.filter(t => isCredit(t.type)).length} inflow(s)`}
        />
        <SummaryCard
          label="This Page — Out"
          value={fmt(totalOut)}
          icon={TrendingDown}
          color="bg-red-500/10 text-red-500"
          sub={`${rows.filter(t => !isCredit(t.type)).length} outflow(s)`}
        />
        <SummaryCard
          label="Net (This Page)"
          value={fmt(totalIn - totalOut)}
          icon={Activity}
          color={totalIn >= totalOut ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}
          sub="credits minus debits"
        />
      </div>

      {/* ── filter bar ── */}
      <Card className="border-border/50">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            {/* search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search description, ref…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 h-9 text-sm"
              />
            </div>

            {/* type */}
            <Select value={typeFilter} onValueChange={v => { setType(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="admin_credit">Admin Credit</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>

            {/* status */}
            <Select value={statusFilter} onValueChange={v => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-[140px] text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* date range */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={startDate}
                onChange={e => { setStart(e.target.value); setPage(1); }}
                className="h-9 w-[135px] text-sm"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={e => { setEnd(e.target.value); setPage(1); }}
                className="h-9 w-[135px] text-sm"
              />
            </div>

            {/* reset */}
            {(search || typeFilter !== "all" || statusFilter !== "all" || startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-muted-foreground">
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── table ── */}
      <Card className="border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {["Date", "Type", "Tenant / User", "Estate", "Description", "Reference", "Status", "Amount"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(LIMIT)].map((_, i) => <RowSkeleton key={i} />)
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Receipt className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No transactions found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                rows.map((tx, i) => {
                  const credit = isCredit(tx.type);
                  const tenantObj = typeof tx.tenant === "object" ? tx.tenant : null;
                  const userObj   = typeof tx.user   === "object" ? tx.user   : null;
                  const userName  = tenantObj?.tenantName ?? (userObj as any)?.name ?? null;
                  const estateName = (typeof tx.estate === "object" ? tx.estate?.name : null) ?? null;

                  return (
                    <tr
                      key={tx.id ?? tx._id ?? i}
                      className="border-b border-border/30 hover:bg-muted/25 transition-colors"
                    >
                      {/* date */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {fmtDate(tx.createdAt)}
                      </td>

                      {/* type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TypeBadge type={tx.type} />
                      </td>

                      {/* user */}
                      <td className="px-4 py-3">
                        {userName ? (
                          <span className="font-medium text-foreground">{userName}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* estate */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {estateName ?? "—"}
                      </td>

                      {/* description */}
                      <td className="px-4 py-3 text-muted-foreground max-w-[160px]">
                        <span className="truncate block" title={tx.description ?? ""}>
                          {tx.description || "—"}
                        </span>
                      </td>

                      {/* reference */}
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {tx.reference ? tx.reference.slice(0, 12) + (tx.reference.length > 12 ? "…" : "") : "—"}
                      </td>

                      {/* status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={tx.status} />
                      </td>

                      {/* amount */}
                      <td className="px-4 py-3 text-right whitespace-nowrap font-semibold">
                        <span className={credit ? "text-emerald-500" : "text-red-400"}>
                          {credit ? "+" : "−"}{fmt(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of{" "}
              <span className="font-medium text-foreground">{total.toLocaleString()}</span> transactions
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* page pills */}
              {(() => {
                const pages = [];
                const start = Math.max(1, page - 2);
                const end   = Math.min(totalPages, page + 2);
                if (start > 1) pages.push(<span key="s" className="px-1 text-muted-foreground text-xs">…</span>);
                for (let p = start; p <= end; p++) {
                  pages.push(
                    <Button
                      key={p} variant={p === page ? "default" : "outline"} size="sm"
                      onClick={() => setPage(p)}
                      className="h-8 w-8 p-0 text-xs"
                      disabled={isFetching}
                    >
                      {p}
                    </Button>
                  );
                }
                if (end < totalPages) pages.push(<span key="e" className="px-1 text-muted-foreground text-xs">…</span>);
                return pages;
              })()}

              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isFetching}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
