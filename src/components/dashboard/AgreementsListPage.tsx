import { useMemo, useRef, useState } from "react";
import {
  Search, RefreshCw, FileSignature, ChevronLeft, ChevronRight, Eye, Download, Check, X, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useGetAgreementsQuery, useGetEstatesQuery, useReviewAgreementMutation,
  type AgreementListItem, type AgreementStatus,
} from "@/services/estatesApi";
import { BASE_API_URL } from "@/services/api";
import { TenancyRegistrationForm } from "./tenant/TenancyRegistrationForm";
import { SignatureField, type SignaturePadHandle } from "./shared/SignaturePad";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const LIMIT = 15;

const RowSkeleton = () => (
  <tr className="border-b border-border/40">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full rounded" />
      </td>
    ))}
  </tr>
);

const STATUS_META: Record<AgreementStatus, { label: string; color: string }> = {
  pending: { label: "Pending Review", color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" },
  approved: { label: "Approved", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  rejected: { label: "Rejected", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const AgreementStatusBadge = ({ status }: { status?: AgreementStatus }) => {
  const m = STATUS_META[status ?? "pending"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${m.color}`}>
      {m.label}
    </span>
  );
};

export default function AgreementsListPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [estateId, setEstateId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<AgreementStatus | "all">("all");
  const [activeTenant, setActiveTenant] = useState<AgreementListItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AgreementListItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveTarget, setApproveTarget] = useState<AgreementListItem | null>(null);
  const [lawyerTypedName, setLawyerTypedName] = useState("");
  const lawyerSigRef = useRef<SignaturePadHandle>(null);

  const { data: estatesData } = useGetEstatesQuery({ page: 1, limit: 200 });
  const estates = estatesData?.data ?? [];

  const params = useMemo(() => ({
    page,
    limit: LIMIT,
    ...(search && { search }),
    ...(estateId !== "all" && { estateId }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  }), [page, search, estateId, statusFilter]);

  const { data, isLoading, isFetching, refetch } = useGetAgreementsQuery(params);
  const [reviewAgreement, { isLoading: isReviewing }] = useReviewAgreementMutation();

  const rows = data?.data ?? [];
  const total = data?.pagination?.totalItems ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const resetFilters = () => {
    setPage(1); setSearch(""); setEstateId("all"); setStatusFilter("all");
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    if (!lawyerTypedName.trim() || !lawyerSigRef.current?.hasSignature()) return;
    try {
      await reviewAgreement({
        agreementId: approveTarget.id,
        status: "approved",
        lawyerTypedName: lawyerTypedName.trim(),
        lawyerSignatureImage: lawyerSigRef.current.dataUrl(),
      }).unwrap();
      toast({ title: "Agreement approved" });
      setApproveTarget(null);
      setLawyerTypedName("");
    } catch {
      toast({ title: "Couldn't approve", description: "Try again in a moment.", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    try {
      await reviewAgreement({ agreementId: rejectTarget.id, status: "rejected", reason: rejectReason.trim() }).unwrap();
      toast({ title: "Agreement rejected", description: "The tenant can fix and resubmit from their dashboard." });
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      toast({ title: "Couldn't reject", description: "Try again in a moment.", variant: "destructive" });
    }
  };

  const downloadPdf = async (a: AgreementListItem) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/api/tenants/${a.tenantId}/agreement/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tenancy-agreement-${(a.tenantName || a.tenantId).replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Couldn't download", description: "Try again in a moment.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenancy Agreements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Signed agreements submitted by tenants, newest first
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── summary card ── */}
      <Card className="border-border/50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Submitted</p>
              <p className="text-xl font-bold text-foreground">{total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages || 1}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileSignature className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── filter bar ── */}
      <Card className="border-border/50">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tenant, estate, unit…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 h-9 text-sm"
              />
            </div>

            <Select value={estateId} onValueChange={v => { setEstateId(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-[190px] text-sm">
                <SelectValue placeholder="Estate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Estates</SelectItem>
                {estates.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as AgreementStatus | "all"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {(search || estateId !== "all" || statusFilter !== "all") && (
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
                {["Signed", "Tenant", "Estate", "Unit", "Contact", "Status", "Actions"].map(h => (
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
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <FileSignature className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No agreements submitted yet</p>
                    <p className="text-xs mt-1">Signed tenancy agreements will show up here</p>
                  </td>
                </tr>
              ) : (
                rows.map(a => {
                  const isPending = (a.status ?? "pending") === "pending";
                  const isApproved = a.status === "approved";
                  return (
                    <tr key={a.id} className="border-b border-border/30 hover:bg-muted/25 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {fmtDate(a.signedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{a.tenantName || a.typedName || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.estateName || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.unitLabel || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-xs">{a.tenantEmail || "—"}</span>
                          <span className="text-xs">{a.tenantPhone || ""}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <AgreementStatusBadge status={a.status} />
                        {a.status === "rejected" && a.rejectionReason && (
                          <p className="text-[11px] text-muted-foreground mt-1 max-w-[160px] truncate" title={a.rejectionReason}>
                            {a.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => setActiveTenant(a)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => downloadPdf(a)}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {isPending && (
                            <Button
                              variant="outline" size="sm"
                              className="h-8 px-2 text-xs text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                              onClick={() => { setApproveTarget(a); setLawyerTypedName(user?.name || ""); }}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {(isPending || isApproved) && (
                            <Button
                              variant="outline" size="sm"
                              className="h-8 px-2 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                              onClick={() => { setRejectTarget(a); setRejectReason(""); }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
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
              <span className="font-medium text-foreground">{total.toLocaleString()}</span> agreements
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

              {(() => {
                const pages = [];
                const start = Math.max(1, page - 2);
                const end = Math.min(totalPages, page + 2);
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

      {/* ── view dialog ── */}
      <Dialog open={!!activeTenant} onOpenChange={(open) => !open && setActiveTenant(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Tenancy Agreement — {activeTenant?.tenantName || "Tenant"}</DialogTitle>
            <DialogDescription>
              Signed {fmtDate(activeTenant?.signedAt)} · {activeTenant?.estateName} {activeTenant?.unitLabel ? `· ${activeTenant.unitLabel}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {activeTenant && <TenancyRegistrationForm tenantId={activeTenant.tenantId} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── approve + sign ── */}
      <Dialog open={!!approveTarget} onOpenChange={(open) => { if (!open) { setApproveTarget(null); setLawyerTypedName(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve this agreement</DialogTitle>
            <DialogDescription>
              {approveTarget?.tenantName || "This tenant"}'s signed tenancy agreement
              {approveTarget?.estateName ? ` for ${approveTarget.estateName}` : ""}
              {approveTarget?.unitLabel ? ` (${approveTarget.unitLabel})` : ""} will be marked approved.
              Sign below to confirm your review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="lawyerTypedName">Type your full name to sign</Label>
              <Input
                id="lawyerTypedName"
                value={lawyerTypedName}
                onChange={(e) => setLawyerTypedName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <SignatureField padRef={lawyerSigRef} label="Draw your signature" required signed={false} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setApproveTarget(null); setLawyerTypedName(""); }} disabled={isReviewing}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isReviewing || !lawyerTypedName.trim()}>
              {isReviewing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Sign and Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── reject reason ── */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this agreement</DialogTitle>
            <DialogDescription>
              Tell {rejectTarget?.tenantName || "the tenant"} what needs to be fixed — they'll see this reason
              and can correct and resubmit from their dashboard.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. ID document is blurry, please re-upload a clearer photo."
            className="min-h-[100px] text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={isReviewing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isReviewing || !rejectReason.trim()}
            >
              {isReviewing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
