import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Receipt,
  Download,
  Printer,
  Loader,
  Eye,
  CalendarDays,
  CreditCard,
} from "lucide-react";
import {
  useGetPaymentReceiptsQuery,
  useLazyDownloadPaymentReceiptQuery,
} from "@/services/estatesApi";
import { formatCurrency } from "./utils";

type PaymentReceipt = NonNullable<
  ReturnType<typeof useGetPaymentReceiptsQuery>["data"]
>["receipts"][number];

// ── Shared receipt table row ──────────────────────────────────────────────────
function ReceiptRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "red" | "green" | "amber";
}) {
  const valClass =
    color === "red"
      ? "text-red-600 dark:text-red-400 font-semibold"
      : color === "green"
      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
      : color === "amber"
      ? "text-amber-700 dark:text-amber-300 font-semibold"
      : "text-slate-800 dark:text-slate-200";
  return (
    <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">
        {label}
      </div>
      <div className={`px-4 py-2.5 text-[11px] leading-tight ${valClass}`}>{value}</div>
    </div>
  );
}

// ── Print / PDF generation ────────────────────────────────────────────────────
function generatePrintHTML(r: PaymentReceipt): string {
  // Classic letterhead-table receipt (matches the backend PDF design):
  // blue labels/values, red outstanding rows, green current rate, gold next rate.
  const row = (label: string, value: string, color = "#4472c4") =>
    `<tr style="color:${color}"><td>${label}</td><td>${value}</td></tr>`;
  const naira = (n: number) => `&#8358; ${(n || 0).toLocaleString()}`;
  const name = (r.estateName || "BamiHost").toUpperCase();
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]).join("");
  const hasIncrease =
    r.increaseCycleYears > 0 && r.increasePercent > 0 && !!r.nextIncreaseDate &&
    (r.nextRentIncrease > 0 || r.nextServiceChargeIncrease > 0);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt – ${r.flatType}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;color:#1e293b;padding:32px;font-size:12px}
    .head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
    .co{font-size:24px;font-weight:bold;color:#4472c4}
    .sub{font-size:12px;color:#1e293b;margin-top:3px}
    .logo{width:72px;height:72px;background:#0056b3;border:2px solid #2c5aa0;color:white;
          display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px}
    .titlebar{display:flex;justify-content:space-between;align-items:center;margin-bottom:0}
    .title{font-size:15px;font-weight:bold;background:#e7e6e6;padding:5px 10px}
    .date{font-size:13px;font-weight:bold}
    table{width:100%;border-collapse:collapse;margin-top:6px}
    td{padding:6px 8px;font-size:12px;border:1px solid #1e293b}
    td:first-child{font-weight:bold;width:50%}
    .notice-t{margin-top:14px;font-weight:bold;color:#ff0000;font-size:12px}
    .notice-b{color:#ff0000;font-size:11px;line-height:1.5;margin-top:3px}
    .footer{margin-top:14px;text-align:center;color:#94a3b8;font-size:9px}
    @media print{body{padding:16px}}
  </style>
</head>
<body>
  <div class="head">
    <div>
      <div class="co">${name}</div>
      ${r.estateAddress ? `<div class="sub">${r.estateAddress.toUpperCase()}</div>` : ""}
      ${r.estatePhone ? `<div class="sub">Tel: ${r.estatePhone}</div>` : ""}
    </div>
    <div class="logo">${initials}</div>
  </div>
  <div class="titlebar">
    <span class="title">RECEIPT</span>
    <span class="date">DATE: ${r.paymentDate}</span>
  </div>
  <table>
    ${row("TENANT FULL NAME:", r.tenantName)}
    ${row("PHONE NUMBER:", r.phone)}
    ${row("Meter No:", r.meterNo || "—")}
    ${r.bedroomType ? row("BEDROOM TYPE:", r.bedroomType.toUpperCase()) : ""}
    ${row("FLAT TYPE:", (r.flatType || "").toUpperCase())}
    ${row("MOVE IN DATE:", (r.moveInDate || "").toUpperCase())}
    ${row("EXPIRY DATE:", (r.expiryDate || "").toUpperCase())}
    ${row("AMOUNT PAID:", naira(r.amountPaid), "#70ad47")}
    ${row("RENT:", naira(r.rent))}
    ${row("RENT OUTSTANDING:", naira(r.rentOutstanding), "#ff0000")}
    ${row("SERVICE CHARGE:", naira(r.serviceCharge))}
    ${row("SERVICE CHARGE OUTSTANDING:", naira(r.serviceChargeOutstanding), "#ff0000")}
    ${row("1 TIME CAUTION FEE:", naira(r.cautionFee))}
    ${row("1 TIME LEGAL FEE:", naira(r.legalFee))}
    ${row("OUTSTANDING BALANCE:", naira(r.outstandingBalance), "#ff0000")}
    ${row(`CURRENT TOTAL TENANCY RATE: ${r.currentYear}`, naira(r.currentTotalTenancyRate), "#70ad47")}
    ${row(`NEXT TOTAL TENANCY RATE ${r.nextYear}:`, naira(r.nextTotalTenancyRate), "#bf9000")}
    ${row("TENANCY DURATION:", r.tenancyDuration)}
    ${row("TENANT TOTAL STAY:", r.tenantTotalStay)}
    ${row("YEAR DURATION:", r.yearDuration)}
    ${hasIncrease ? `
    ${row(`NEXT RENTAL INCREASE BY (${r.increasePercent}%) ON ${r.nextIncreaseDate}:`, naira(r.nextRentIncrease), "#ff0000")}
    ${row(`NEXT SERVICE CHARGE INCREASE BY (${r.increasePercent}%) ON ${r.nextIncreaseDate}:`, naira(r.nextServiceChargeIncrease), "#ff0000")}
    ${row(`TOTAL TENANCY RATE INCREASE BY (${r.increasePercent}%) ON ${r.nextIncreaseDate}:`, naira(r.totalTenancyRateIncrease), "#ff0000")}` : ""}
  </table>

  ${r.increaseCycleYears > 0 && r.increasePercent > 0 ? `
  <div class="notice-t">Important Notice Regarding Rent Adjustment</div>
  <div class="notice-b">Please be advised that there will be a <strong>${r.increasePercent}% increase in the combined Rent and Service Charge</strong> applicable <strong>every ${r.increaseCycleYears === 2 ? "two (2)" : r.increaseCycleYears} year${r.increaseCycleYears !== 1 ? "s" : ""}</strong> of continuous tenancy. We appreciate your understanding and continued residency.</div>` : ""}

  <div class="footer">BamiHost Property Management System &bull; Ref: ${r.reference}</div>
  <script>window.onload=function(){window.print()}</script>
</body>
</html>`;
}

function openPrint(r: PaymentReceipt) {
  const w = window.open("", "_blank", "width=820,height=960");
  if (w) {
    w.document.write(generatePrintHTML(r));
    w.document.close();
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export const ReceiptsTab: React.FC = () => {
  const { data, isLoading } = useGetPaymentReceiptsQuery();
  const [triggerDownload] = useLazyDownloadPaymentReceiptQuery();
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const receipts = data?.receipts ?? [];

  const handleDownload = async (r: PaymentReceipt) => {
    setDownloadingId(r.receiptId);
    try {
      const result = await triggerDownload(r.receiptId).unwrap();
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Backend PDF unavailable — fall back to browser print-to-PDF
      openPrint(r);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader className="h-5 w-5 animate-spin mr-2" />
        Loading receipts…
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Receipt className="h-7 w-7 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-300">No receipts yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Your payment receipts will appear here once payments are made.
        </p>
      </div>
    );
  }

  const typeConfig: Record<string, { label: string; badge: string; strip: string }> = {
    initial: {
      label: "Initial Payment",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      strip: "bg-amber-400",
    },
    renewal: {
      label: "Renewal",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      strip: "bg-blue-500",
    },
    partial: {
      label: "Partial Payment",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      strip: "bg-purple-500",
    },
  };

  return (
    <>
      {/* ── Receipt list ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        {receipts.map((r) => {
          const cfg = typeConfig[r.paymentType] ?? {
            label: r.paymentType,
            badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            strip: "bg-green-500",
          };
          const isThisDownloading = downloadingId === r.receiptId;

          return (
            <Card
              key={r.receiptId}
              className="overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-150"
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Coloured left strip */}
                  <div className={`w-1 shrink-0 ${cfg.strip}`} />

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-4">
                    {/* Left: metadata */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Receipt className="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {r.flatType} — {r.bedroomType}
                          </p>
                          <Badge className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {r.paymentDate}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <CreditCard className="h-3 w-3" />
                            {r.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                          {r.reference}
                        </p>
                      </div>
                    </div>

                    {/* Right: amount + actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                      <div className="sm:text-right">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(r.amountPaid)}
                        </p>
                        {r.outstandingBalance > 0 && (
                          <p className="text-[11px] text-red-500 dark:text-red-400">
                            Bal: {formatCurrency(r.outstandingBalance)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs gap-1.5 border-slate-300 dark:border-slate-600"
                          onClick={() => setSelectedReceipt(r)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleDownload(r)}
                          disabled={isThisDownloading}
                        >
                          {isThisDownloading ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          {isThisDownloading ? "…" : "Download"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Full receipt dialog ───────────────────────────────────────── */}
      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(open) => !open && setSelectedReceipt(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          {/* sr-only title for a11y */}
          <DialogHeader className="sr-only">
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>

          {selectedReceipt && (
            <div>
              {/* ── Blue header ── */}
              <div className="bg-blue-700 dark:bg-blue-900 text-white text-center px-6 py-5">
                <p className="text-[11px] font-bold tracking-[0.2em] text-blue-200 uppercase mb-0.5">
                  {selectedReceipt.estateName || "BamiHost"}
                </p>
                {selectedReceipt.estateAddress && (
                  <p className="text-[10px] text-blue-300">{selectedReceipt.estateAddress}</p>
                )}
                <Separator className="my-3 bg-blue-500/50" />
                <p className="text-xl font-extrabold tracking-[0.3em] uppercase">Receipt</p>
                <p className="text-blue-300 text-[11px] mt-1">{selectedReceipt.paymentDate}</p>
              </div>

              {/* ── Amount paid hero ── */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 px-6 py-5 text-center">
                <p className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                  Amount Paid
                </p>
                <p className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(selectedReceipt.amountPaid)}
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">{selectedReceipt.reference}</p>
              </div>

              {/* ── Sections ── */}
              <div className="px-5 pt-5 space-y-5">

                {/* Tenant Info */}
                <div>
                  <SectionLabel>Tenant Information</SectionLabel>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <ReceiptRow label="Tenant Full Name" value={selectedReceipt.tenantName} />
                    <ReceiptRow label="Phone Number" value={selectedReceipt.phone} />
                    <ReceiptRow label="Meter No" value={selectedReceipt.meterNo || "—"} />
                    <ReceiptRow label="Bedroom Type" value={selectedReceipt.bedroomType} />
                    <ReceiptRow label="Flat Type" value={selectedReceipt.flatType} />
                    <ReceiptRow label="Move In Date" value={selectedReceipt.moveInDate} />
                    <ReceiptRow label="Expiry Date" value={selectedReceipt.expiryDate} />
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div>
                  <SectionLabel>Payment Breakdown</SectionLabel>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {selectedReceipt.rent > 0 && (
                      <ReceiptRow label="Rent" value={formatCurrency(selectedReceipt.rent)} />
                    )}
                    {selectedReceipt.serviceCharge > 0 && (
                      <ReceiptRow label="Service Charge" value={formatCurrency(selectedReceipt.serviceCharge)} />
                    )}
                    {selectedReceipt.cautionFee > 0 && (
                      <ReceiptRow label="1 Time Caution Fee" value={formatCurrency(selectedReceipt.cautionFee)} />
                    )}
                    {selectedReceipt.legalFee > 0 && (
                      <ReceiptRow label="Legal Fee" value={formatCurrency(selectedReceipt.legalFee)} />
                    )}
                    {selectedReceipt.rentOutstanding > 0 && (
                      <ReceiptRow
                        label="Rent Outstanding"
                        value={formatCurrency(selectedReceipt.rentOutstanding)}
                        color="red"
                      />
                    )}
                    {selectedReceipt.serviceChargeOutstanding > 0 && (
                      <ReceiptRow
                        label="Service Charge Outstanding"
                        value={formatCurrency(selectedReceipt.serviceChargeOutstanding)}
                        color="red"
                      />
                    )}
                    <ReceiptRow
                      label="Outstanding Balance"
                      value={formatCurrency(selectedReceipt.outstandingBalance)}
                      color={selectedReceipt.outstandingBalance > 0 ? "red" : "green"}
                    />
                  </div>
                </div>

                {/* Tenancy Summary */}
                <div>
                  <SectionLabel>Tenancy Summary</SectionLabel>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <ReceiptRow
                      label={`Current Total Tenancy Rate: ${selectedReceipt.currentYear}`}
                      value={formatCurrency(selectedReceipt.currentTotalTenancyRate)}
                    />
                    <ReceiptRow
                      label={`Next Total Tenancy Rate: ${selectedReceipt.nextYear}`}
                      value={formatCurrency(selectedReceipt.nextTotalTenancyRate)}
                    />
                    <ReceiptRow label="Tenancy Duration" value={selectedReceipt.tenancyDuration} />
                    <ReceiptRow label="Tenant Total Stay" value={selectedReceipt.tenantTotalStay} />
                    <ReceiptRow label="Year Duration" value={selectedReceipt.yearDuration} />
                  </div>
                </div>

                {/* Upcoming Adjustment — only when the estate has an increase policy */}
                {selectedReceipt.increaseCycleYears > 0 && selectedReceipt.increasePercent > 0 && (
                  <>
                    {(selectedReceipt.nextRentIncrease > 0 || selectedReceipt.nextServiceChargeIncrease > 0) && (
                      <div>
                        <SectionLabel>Upcoming Adjustment ({selectedReceipt.increasePercent}%)</SectionLabel>
                        <div className="rounded-lg border border-amber-200 dark:border-amber-700 overflow-hidden">
                          <ReceiptRow
                            label={`Rent Increase — ${selectedReceipt.nextIncreaseDate}`}
                            value={formatCurrency(selectedReceipt.nextRentIncrease)}
                            color="amber"
                          />
                          <ReceiptRow
                            label={`Service Charge Increase — ${selectedReceipt.nextIncreaseDate}`}
                            value={formatCurrency(selectedReceipt.nextServiceChargeIncrease)}
                            color="amber"
                          />
                          <ReceiptRow
                            label={`Total Rate Increase — ${selectedReceipt.nextIncreaseDate}`}
                            value={formatCurrency(selectedReceipt.totalTenancyRateIncrease)}
                            color="amber"
                          />
                        </div>
                      </div>
                    )}

                    {/* Legal notice */}
                    <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
                      <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                        Important Notice Regarding Rent Adjustment
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                        There is a{" "}
                        <strong>{selectedReceipt.increasePercent}% increase in the combined Rent and Service Charge</strong> applicable{" "}
                        <strong>every {selectedReceipt.increaseCycleYears} year{selectedReceipt.increaseCycleYears !== 1 ? "s" : ""}</strong> of continuous tenancy. We appreciate your
                        understanding and continued residency.
                      </p>
                    </div>
                  </>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pb-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-slate-300 dark:border-slate-600"
                    onClick={() => openPrint(selectedReceipt)}
                  >
                    <Printer className="h-4 w-4" />
                    Print / Save PDF
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleDownload(selectedReceipt)}
                    disabled={downloadingId === selectedReceipt.receiptId}
                  >
                    {downloadingId === selectedReceipt.receiptId ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// ── Small helpers ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2">
      {children}
    </p>
  );
}
