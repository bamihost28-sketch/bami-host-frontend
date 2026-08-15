import { useMemo, useRef, useState } from "react";
import {
  Search, RefreshCw, FileSignature, ChevronLeft, ChevronRight, Eye, Download, PenLine, Loader2, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useGetLawyerAgreementsQuery, useSignAgreementAsLawyerMutation,
  type AgreementListItem,
} from "@/services/estatesApi";
import { BASE_API_URL } from "@/services/api";
import { TenancyRegistrationForm } from "./tenant/TenancyRegistrationForm";
import { SignatureField, type SignaturePadHandle } from "./shared/SignaturePad";
import { useToast } from "@/components/providers/ToastProvider";

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const LIMIT = 15;

const RowSkeleton = () => (
  <tr className="border-b border-border/40">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full rounded" />
      </td>
    ))}
  </tr>
);

export default function LawyerAgreementsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [signedFilter, setSignedFilter] = useState<"all" | "signed" | "unsigned">("all");
  const [activeAgreement, setActiveAgreement] = useState<AgreementListItem | null>(null);
  const [typedName, setTypedName] = useState("");
  const sigRef = useRef<SignaturePadHandle>(null);

  const params = useMemo(() => ({
    page,
    limit: LIMIT,
    ...(search && { search }),
    ...(signedFilter !== "all" && { signed: signedFilter === "signed" }),
  }), [page, search, signedFilter]);

  const { data, isLoading, isFetching, refetch } = useGetLawyerAgreementsQuery(params);
  const [signAgreement, { isLoading: isSigning }] = useSignAgreementAsLawyerMutation();

  const rows = data?.data ?? [];
  const total = data?.pagination?.totalItems ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const openAgreement = (a: AgreementListItem) => {
    setActiveAgreement(a);
    setTypedName("");
  };

  const handleSign = async () => {
    if (!activeAgreement) return;
    if (!typedName.trim() || !sigRef.current?.hasSignature()) return;
    try {
      await signAgreement({
        agreementId: activeAgreement.id,
        typedName: typedName.trim(),
        signatureImage: sigRef.current.dataUrl(),
      }).unwrap();
      toast({ title: "Agreement signed" });
      setActiveAgreement(null);
    } catch {
      toast({ title: "Couldn't sign", description: "Try again in a moment.", variant: "destructive" });
    }
  };

  const downloadPdf = async (a: AgreementListItem) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/api/tenancy-agreements/lawyer/${a.id}/pdf`, {
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
            Every tenant-signed agreement, platform-wide — review and add your countersignature
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
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Agreements</p>
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

            <Select value={signedFilter} onValueChange={v => { setSignedFilter(v as typeof signedFilter); setPage(1); }}>
              <SelectTrigger className="h-9 w-[200px] text-sm">
                <SelectValue placeholder="Signature status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agreements</SelectItem>
                <SelectItem value="unsigned">Awaiting My Signature</SelectItem>
                <SelectItem value="signed">Signed By Me</SelectItem>
              </SelectContent>
            </Select>

            {(search || signedFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSignedFilter("all"); setPage(1); }} className="h-9 text-muted-foreground">
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
                {["Signed", "Tenant", "Estate", "Unit", "Counsel Signature", "Actions"].map(h => (
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
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <FileSignature className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No agreements found</p>
                  </td>
                </tr>
              ) : (
                rows.map(a => (
                  <tr key={a.id} className="border-b border-border/30 hover:bg-muted/25 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {fmtDate(a.signedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{a.tenantName || a.typedName || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.estateName || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.unitLabel || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.lawyerSignedAt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Signed {fmtDate(a.lawyerSignedAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-yellow-500/15 text-yellow-500 border-yellow-500/30">
                          Awaiting Signature
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => openAgreement(a)}>
                          {a.lawyerSignedAt ? <Eye className="h-3.5 w-3.5 mr-1" /> : <PenLine className="h-3.5 w-3.5 mr-1" />}
                          {a.lawyerSignedAt ? "View" : "Review & Sign"}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => downloadPdf(a)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* ── review + sign ── */}
      <Dialog open={!!activeAgreement} onOpenChange={(open) => !open && setActiveAgreement(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Tenancy Agreement — {activeAgreement?.tenantName || "Tenant"}</DialogTitle>
            <DialogDescription>
              Signed {fmtDate(activeAgreement?.signedAt)} · {activeAgreement?.estateName} {activeAgreement?.unitLabel ? `· ${activeAgreement.unitLabel}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {activeAgreement && <TenancyRegistrationForm tenantId={activeAgreement.tenantId} />}

            <div className="px-4 pb-4">
              <div className="border-t border-border/50 pt-4 mt-2">
                <h3 className="text-sm font-semibold mb-3">Counsel's Signature</h3>
                {activeAgreement?.lawyerSignedAt ? (
                  <SignatureField
                    padRef={sigRef}
                    label={`Signed by ${activeAgreement.lawyerTypedName} on ${fmtDate(activeAgreement.lawyerSignedAt)}`}
                    signed viewOnly
                    imageSrc={activeAgreement.lawyerSignatureImage}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2 max-w-sm">
                      <Label htmlFor="lawyerSignName">Type your full name to sign</Label>
                      <Input
                        id="lawyerSignName"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <SignatureField padRef={sigRef} label="Draw your signature" required signed={false} />
                    <Button onClick={handleSign} disabled={isSigning || !typedName.trim()}>
                      {isSigning ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
                      Sign Agreement
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
