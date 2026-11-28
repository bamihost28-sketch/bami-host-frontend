import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader, MinusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useGetEstatesQuery } from "@/services/estatesApi";
import {
  useBulkSetPrepaymentMutation,
  type BulkPrepaymentResponse, type PrepaymentRowStatus,
} from "@/services/meterApi";

type Result = BulkPrepaymentResponse["data"];

/** Count from the rows themselves: the server renames the keys of `counts` in transit
 *  (will_change -> willChange), while each row's `status` value arrives unchanged. */
const tally = (rows: Result["results"]) =>
  rows.reduce<Partial<Record<PrepaymentRowStatus, number>>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

const LABEL: Record<PrepaymentRowStatus, string> = {
  will_change: "Will switch",
  changed: "Switched",
  unchanged: "Already set",
  skipped_no_credit: "Skipped — no credit",
  unreachable: "Offline / not reached",
  unsupported: "No prepaid mode",
  failed: "Failed",
};

function RowIcon({ status }: { status: PrepaymentRowStatus }) {
  if (status === "will_change" || status === "changed") return <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />;
  if (status === "failed" || status === "unreachable") return <XCircle className="h-4 w-4 text-red-600 shrink-0" />;
  if (status === "skipped_no_credit") return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
  return <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0" />;
}

/**
 * Super-admin tool: switch the prepaid mode of every smart meter (or one
 * estate's) at once. Always previews first; applying is a separate, deliberate step.
 */
export function BulkPrepaidDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const { data: estatesData } = useGetEstatesQuery();
  const estates = estatesData?.data ?? [];
  const [run, { isLoading }] = useBulkSetPrepaymentMutation();

  const [estateId, setEstateId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [includeNoCredit, setIncludeNoCredit] = useState(false);
  const [preview, setPreview] = useState<Result | null>(null);

  const reset = () => { setPreview(null); };
  const change = (fn: () => void) => { fn(); setPreview(null); };

  const request = (dryRun: boolean) => ({
    enabled,
    estateId: estateId || undefined,
    includeNoCredit: enabled ? includeNoCredit : false,
    dryRun,
  });

  const doPreview = async () => {
    try {
      setPreview((await run(request(true)).unwrap()).data);
    } catch (e: any) {
      toast({ title: e?.data?.detail || "Could not check the meters", variant: "destructive" });
    }
  };

  const apply = async () => {
    try {
      const res = (await run(request(false)).unwrap()).data;
      const counts = tally(res.results);
      const changed = counts.changed ?? 0;
      const failed = counts.failed ?? 0;
      toast({
        title: `Prepaid ${enabled ? "turned on" : "turned off"} for ${changed} meter${changed === 1 ? "" : "s"}`,
        description: failed ? `${failed} could not be changed — check the list.` : undefined,
        variant: failed ? "destructive" : undefined,
      });
      setPreview(res);
    } catch (e: any) {
      toast({ title: e?.data?.detail || "Could not apply the change", variant: "destructive" });
    }
  };

  const willChange = preview ? tally(preview.results).will_change ?? 0 : 0;
  const cutting = preview?.results.filter((r) => r.status === "will_change" && (r.balanceKwh ?? 0) <= 0).length ?? 0;
  const applied = preview && !preview.dryRun;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prepaid mode for all meters</DialogTitle>
          <DialogDescription>
            With prepaid on, a meter cuts power by itself when its credit runs out. This only affects smart meters
            that support it. You always see what will happen before anything changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Which meters</Label>
            <select
              className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={estateId}
              onChange={(e) => change(() => setEstateId(e.target.value))}
            >
              <option value="">All estates</option>
              {estates.map((es) => <option key={es.id} value={es.id}>{es.name}</option>)}
            </select>
          </div>

          <div>
            <Label>Switch prepaid mode</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => change(() => setEnabled(v))}
                  className={`rounded-md border px-3 py-2 text-sm font-medium ${enabled === v ? "border-green-600 bg-green-50 text-green-800" : "text-muted-foreground"}`}
                >
                  {v ? "ON" : "OFF"}
                </button>
              ))}
            </div>
          </div>

          {enabled && (
            <label className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={includeNoCredit}
                onChange={(e) => change(() => setIncludeNoCredit(e.target.checked))}
              />
              <span>
                <span className="font-medium">Also switch meters with no credit.</span>{" "}
                <span className="text-amber-900">Those apartments lose power immediately. Leave this off to skip them until they have credit.</span>
              </span>
            </label>
          )}

          {preview && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 text-sm font-medium bg-muted/40">
                {applied ? "Result" : "Preview"} — {preview.total} meter{preview.total === 1 ? "" : "s"}:{" "}
                {Object.entries(tally(preview.results)).map(([k, n]) => `${n} ${LABEL[k as PrepaymentRowStatus].toLowerCase()}`).join(", ")}
              </div>
              {!applied && cutting > 0 && (
                <div className="px-3 py-2 text-sm bg-red-50 text-red-800 border-b">
                  {cutting} apartment{cutting === 1 ? "" : "s"} will lose power immediately.
                </div>
              )}
              <div className="max-h-64 overflow-y-auto divide-y text-sm">
                {preview.results.map((r) => (
                  <div key={r.meterId} className="flex items-start gap-2 px-3 py-1.5">
                    <RowIcon status={r.status} />
                    <span className="font-medium shrink-0">{r.unitLabel}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {r.balanceKwh != null ? `${r.balanceKwh} kWh` : "—"}
                    </span>
                    <span className="ml-auto text-right text-muted-foreground">{LABEL[r.status]}{r.detail && r.status !== "unchanged" ? ` · ${r.detail}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{applied ? "Close" : "Cancel"}</Button>
            <Button variant="outline" onClick={doPreview} disabled={isLoading}>
              {isLoading && !preview ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : null}Preview
            </Button>
            <Button
              onClick={apply}
              disabled={isLoading || !preview || applied || willChange === 0}
              className={enabled && cutting > 0 ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isLoading && preview ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Switch {willChange || ""} meter{willChange === 1 ? "" : "s"} {enabled ? "on" : "off"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
