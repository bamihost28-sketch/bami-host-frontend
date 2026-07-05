import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatCurrency, formatDate } from "./utils";

type PaymentReceipt = NonNullable<
  ReturnType<typeof useGetPaymentReceiptsQuery>["data"]
>["receipts"][number];

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
    <span class="date">DATE: ${formatDate(r.paymentDate)}</span>
  </div>
  <table>
    ${row("TENANT FULL NAME:", r.tenantName)}
    ${row("PHONE NUMBER:", r.phone)}
    ${row("Meter No:", r.meterNo || "—")}
    ${r.bedroomType ? row("BEDROOM TYPE:", r.bedroomType.toUpperCase()) : ""}
    ${row("FLAT TYPE:", (r.flatType || "").toUpperCase())}
    ${row("MOVE IN DATE:", formatDate(r.moveInDate).toUpperCase())}
    ${row("EXPIRY DATE:", formatDate(r.expiryDate).toUpperCase())}
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
    ${row(`NEXT RENTAL INCREASE BY (${r.increasePercent}%) ON ${formatDate(r.nextIncreaseDate).toUpperCase()}:`, naira(r.nextRentIncrease), "#ff0000")}
    ${row(`NEXT SERVICE CHARGE INCREASE BY (${r.increasePercent}%) ON ${formatDate(r.nextIncreaseDate).toUpperCase()}:`, naira(r.nextServiceChargeIncrease), "#ff0000")}
    ${row(`TOTAL TENANCY RATE INCREASE BY (${r.increasePercent}%) ON ${formatDate(r.nextIncreaseDate).toUpperCase()}:`, naira(r.totalTenancyRateIncrease), "#ff0000")}` : ""}
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
                            {formatDate(r.paymentDate)}
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
              {/* ── Classic paper receipt preview (same design as print + PDF) ── */}
              <div className="bg-white text-slate-900 px-5 pt-5 pb-4">
                {/* Letterhead */}
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 pr-3">
                    <p className="text-xl font-bold leading-tight" style={{ color: "#4472c4" }}>
                      {(selectedReceipt.estateName || "BamiHost").toUpperCase()}
                    </p>
                    {selectedReceipt.estateAddress && (
                      <p className="text-[11px] mt-0.5">{selectedReceipt.estateAddress.toUpperCase()}</p>
                    )}
                    {selectedReceipt.estatePhone && (
                      <p className="text-[11px]">Tel: {selectedReceipt.estatePhone}</p>
                    )}
                  </div>
                  <div
                    className="w-14 h-14 shrink-0 flex items-center justify-center font-bold text-white text-base"
                    style={{ background: "#0056b3", border: "2px solid #2c5aa0" }}
                  >
                    {(selectedReceipt.estateName || "BamiHost").split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                  </div>
                </div>

                {/* RECEIPT bar + date */}
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm px-2.5 py-1" style={{ background: "#e7e6e6" }}>RECEIPT</span>
                  <span className="font-bold text-xs">DATE: {formatDate(selectedReceipt.paymentDate)}</span>
                </div>

                {/* Classic table */}
                <table className="w-full border-collapse text-[11px]">
                  <tbody>
                    {([
                      ["TENANT FULL NAME:", selectedReceipt.tenantName, "#4472c4"],
                      ["PHONE NUMBER:", selectedReceipt.phone, "#4472c4"],
                      ["Meter No:", selectedReceipt.meterNo || "—", "#4472c4"],
                      ...(selectedReceipt.bedroomType ? [["BEDROOM TYPE:", selectedReceipt.bedroomType.toUpperCase(), "#4472c4"]] : []),
                      ["FLAT TYPE:", (selectedReceipt.flatType || "").toUpperCase(), "#4472c4"],
                      ["MOVE IN DATE:", formatDate(selectedReceipt.moveInDate).toUpperCase(), "#4472c4"],
                      ["EXPIRY DATE:", formatDate(selectedReceipt.expiryDate).toUpperCase(), "#4472c4"],
                      ["AMOUNT PAID:", formatCurrency(selectedReceipt.amountPaid), "#70ad47"],
                      ["RENT:", formatCurrency(selectedReceipt.rent), "#4472c4"],
                      ["RENT OUTSTANDING:", formatCurrency(selectedReceipt.rentOutstanding), "#ff0000"],
                      ["SERVICE CHARGE:", formatCurrency(selectedReceipt.serviceCharge), "#4472c4"],
                      ["SERVICE CHARGE OUTSTANDING:", formatCurrency(selectedReceipt.serviceChargeOutstanding), "#ff0000"],
                      ["1 TIME CAUTION FEE:", formatCurrency(selectedReceipt.cautionFee), "#4472c4"],
                      ["1 TIME LEGAL FEE:", formatCurrency(selectedReceipt.legalFee), "#4472c4"],
                      ["OUTSTANDING BALANCE:", formatCurrency(selectedReceipt.outstandingBalance), "#ff0000"],
                      [`CURRENT TOTAL TENANCY RATE: ${selectedReceipt.currentYear}`, formatCurrency(selectedReceipt.currentTotalTenancyRate), "#70ad47"],
                      [`NEXT TOTAL TENANCY RATE ${selectedReceipt.nextYear}:`, formatCurrency(selectedReceipt.nextTotalTenancyRate), "#bf9000"],
                      ["TENANCY DURATION:", selectedReceipt.tenancyDuration, "#4472c4"],
                      ["TENANT TOTAL STAY:", selectedReceipt.tenantTotalStay, "#4472c4"],
                      ["YEAR DURATION:", selectedReceipt.yearDuration, "#4472c4"],
                      ...(selectedReceipt.increaseCycleYears > 0 && selectedReceipt.increasePercent > 0 && selectedReceipt.nextIncreaseDate &&
                          (selectedReceipt.nextRentIncrease > 0 || selectedReceipt.nextServiceChargeIncrease > 0)
                        ? [
                            [`NEXT RENTAL INCREASE BY (${selectedReceipt.increasePercent}%) ON ${formatDate(selectedReceipt.nextIncreaseDate).toUpperCase()}:`, formatCurrency(selectedReceipt.nextRentIncrease), "#ff0000"],
                            [`NEXT SERVICE CHARGE INCREASE BY (${selectedReceipt.increasePercent}%) ON ${formatDate(selectedReceipt.nextIncreaseDate).toUpperCase()}:`, formatCurrency(selectedReceipt.nextServiceChargeIncrease), "#ff0000"],
                            [`TOTAL TENANCY RATE INCREASE BY (${selectedReceipt.increasePercent}%) ON ${formatDate(selectedReceipt.nextIncreaseDate).toUpperCase()}:`, formatCurrency(selectedReceipt.totalTenancyRateIncrease), "#ff0000"],
                          ]
                        : []),
                    ] as [string, string, string][]).map(([label, value, color], i) => (
                      <tr key={i} style={{ color }}>
                        <td className="border border-slate-800 px-2 py-1.5 font-bold w-1/2">{label}</td>
                        <td className="border border-slate-800 px-2 py-1.5">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Red adjustment notice */}
                {selectedReceipt.increaseCycleYears > 0 && selectedReceipt.increasePercent > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-bold" style={{ color: "#ff0000" }}>
                      Important Notice Regarding Rent Adjustment
                    </p>
                    <p className="text-[10px] leading-relaxed" style={{ color: "#ff0000" }}>
                      Please be advised that there will be a <strong>{selectedReceipt.increasePercent}% increase in the combined
                      Rent and Service Charge</strong> applicable <strong>every {selectedReceipt.increaseCycleYears === 2 ? "two (2)" : selectedReceipt.increaseCycleYears} year{selectedReceipt.increaseCycleYears !== 1 ? "s" : ""}</strong> of
                      continuous tenancy. We appreciate your understanding and continued residency.
                    </p>
                  </div>
                )}

                <p className="text-[9px] text-slate-400 text-center mt-3">
                  BamiHost Property Management System &bull; Ref: {selectedReceipt.reference}
                </p>
              </div>

              <div className="px-5 pb-5 pt-3 space-y-4 border-t border-slate-200 dark:border-slate-700">
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
