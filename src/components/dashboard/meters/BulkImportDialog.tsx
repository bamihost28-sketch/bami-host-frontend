import { useRef, useState } from "react";
import { CheckCircle2, Download, Loader, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useGetEstatesQuery } from "@/services/estatesApi";
import {
  useBulkRegisterMetersMutation,
  type BulkMeterRow, type BulkMetersResponse,
} from "@/services/meterApi";

const SAMPLE = "unit,device_id,meter_number,rate_per_kwh\nFlat 1,bf1234567890abcdef,04123456789,70\nFlat 2,bf0987654321fedcba,04123456790,70\n";

/**
 * Parse pasted/uploaded rows: `unit, device id[, meter number[, rate per kWh]]`,
 * comma / tab / semicolon separated, header row optional.
 */
function parseRows(text: string): { rows: BulkMeterRow[]; problems: string[] } {
  const rows: BulkMeterRow[] = [];
  const problems: string[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, i) => {
    const cells = line.split(/[,\t;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (i === 0 && /^(unit|apartment|flat)/i.test(cells[0]) && /device/i.test(cells[1] || "")) return; // header
    const [unitLabel, deviceId, meterNumber, rate] = cells;
    if (!unitLabel || !deviceId) {
      problems.push(`Line ${i + 1}: needs a unit and a device ID`);
      return;
    }
    const ratePerKwh = rate ? Number(rate) : undefined;
    if (rate && (!Number.isFinite(ratePerKwh) || (ratePerKwh as number) <= 0)) {
      problems.push(`Line ${i + 1}: "${rate}" is not a valid rate`);
      return;
    }
    rows.push({ unitLabel, deviceId, meterNumber: meterNumber || undefined, ratePerKwh });
  });
  return { rows, problems };
}

export function BulkImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const { data: estatesData } = useGetEstatesQuery();
  const estates = estatesData?.data ?? [];
  const [bulkRegister, { isLoading }] = useBulkRegisterMetersMutation();

  const [estateId, setEstateId] = useState("");
  const [text, setText] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [result, setResult] = useState<BulkMetersResponse["data"] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setText(""); setProblems([]); setResult(null); };
  const edit = (v: string) => { setText(v); setResult(null); setProblems([]); };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) edit(await f.text());
    e.target.value = "";
  };

  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "meters-template.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const run = async (dryRun: boolean) => {
    const { rows, problems: p } = parseRows(text);
    setProblems(p);
    if (!estateId) return toast({ title: "Choose an estate first", variant: "destructive" });
    if (p.length || rows.length === 0) return;
    try {
      const res = await bulkRegister({ estateId, rows, dryRun }).unwrap();
      setResult(res.data);
      if (!dryRun) {
        toast({ title: `${res.data.created} meters registered` });
        onOpenChange(false);
        reset();
      }
    } catch (err: any) {
      toast({ title: err?.data?.detail || "Import failed", variant: "destructive" });
    }
  };

  const checked = result?.dryRun === true;
  const clean = checked && result!.errors === 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk import meters</DialogTitle>
          <DialogDescription>
            Attach a meter to each apartment of one estate. Nothing is saved until every row checks out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Estate</Label>
            <select
              className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={estateId}
              onChange={(e) => { setEstateId(e.target.value); setResult(null); }}
            >
              <option value="">Select an estate…</option>
              {estates.map((es) => <option key={es.id} value={es.id}>{es.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Meters</Label>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={downloadSample}>
                  <Download className="h-3.5 w-3.5 mr-1" />Template
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1" />Upload CSV
                </Button>
                <input ref={fileRef} type="file" accept=".csv,.txt,text/csv" className="hidden" onChange={onFile} />
              </div>
            </div>
            <Textarea
              className="mt-1 font-mono text-xs h-40"
              placeholder={"Flat 1, bf1234567890abcdef, 04123456789, 70\nFlat 2, bf0987654321fedcba"}
              value={text}
              onChange={(e) => edit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              One meter per line: apartment name, Tuya device ID, then optionally the meter number and ₦/kWh rate.
              The apartment name must match the one in the system.
            </p>
          </div>

          {problems.length > 0 && (
            <ul className="text-sm text-red-600 list-disc pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
          )}

          {result && (
            <div className="border rounded-lg overflow-hidden">
              <div className={`px-3 py-2 text-sm font-medium ${result.errors ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
                {result.errors
                  ? `${result.errors} of ${result.total} rows need fixing — nothing was saved`
                  : `All ${result.total} rows look good`}
              </div>
              <div className="max-h-56 overflow-y-auto divide-y text-sm">
                {result.results.map((r) => (
                  <div key={r.row} className="flex items-start gap-2 px-3 py-1.5">
                    {r.status === "ok"
                      ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />}
                    <span className="font-medium shrink-0">{r.unitLabel || "—"}</span>
                    <span className="font-mono text-xs text-muted-foreground truncate">{r.deviceId}</span>
                    {r.error && <span className="text-red-600 ml-auto text-right">{r.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="outline" onClick={() => run(true)} disabled={isLoading || !text.trim() || !estateId}>
              {isLoading && !clean ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : null}Check
            </Button>
            <Button onClick={() => run(false)} disabled={isLoading || !clean}>
              {isLoading && clean ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Import {clean ? result!.total : ""} meters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
