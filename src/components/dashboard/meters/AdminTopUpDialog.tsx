import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAdminTopUpMeterMutation, type MeterDevice } from "@/services/meterApi";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(n);

/** kWh an amount buys — whole 0.01 kWh steps, rounded down, same rule as the server. */
const kwhFor = (amount: number, ratePerKwh: number) =>
  amount > 0 && ratePerKwh > 0 ? Math.floor((amount / ratePerKwh) * 100 + 1e-9) / 100 : 0;

/**
 * Credit a tenant's meter for them — e.g. they paid cash at the office. The
 * wallet isn't touched; the credit is recorded against the tenant with the
 * reason and the admin's name, and the tenant is notified.
 */
export function AdminTopUpDialog({ meter, open, onOpenChange }: { meter: MeterDevice; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [topUp, { isLoading }] = useAdminTopUpMeterMutation();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const value = Number(amount);
  const kwh = kwhFor(value, meter.ratePerKwh);
  const valid = Number.isFinite(value) && kwh >= 0.01 && reason.trim().length >= 3;

  const close = (v: boolean) => { onOpenChange(v); if (!v) { setAmount(""); setReason(""); } };

  const submit = async () => {
    if (!valid) return;
    try {
      const res = await topUp({ id: meter.id, amount: value, reason: reason.trim() }).unwrap();
      toast({
        title: res.data.status === "completed" ? "Meter credited" : "Credit sent",
        description: res.data.status === "completed"
          ? `${res.data.kwhCredited} kWh added for ${res.data.tenant}.`
          : `${res.data.kwhCredited} kWh sent to ${res.data.tenant}'s meter — waiting for it to confirm.`,
      });
      close(false);
    } catch (e: any) {
      toast({ title: e?.data?.detail || "Could not credit the meter", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top up {meter.unitLabel ? `Unit ${meter.unitLabel}` : "meter"}</DialogTitle>
          <DialogDescription>
            Adds electricity to the tenant's meter. Their wallet isn't charged — use this when they've paid you directly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="at-amount">Amount (₦)</Label>
            <Input id="at-amount" type="number" min="1" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 2000" />
            <p className="text-xs text-muted-foreground">
              {kwh >= 0.01
                ? `= ${kwh} kWh at ${fmt(meter.ratePerKwh)}/kWh`
                : `Price: ${fmt(meter.ratePerKwh)} per kWh. Enter an amount worth at least 0.01 kWh.`}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="at-reason">Reason</Label>
            <Input id="at-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Cash paid at the office, 20 Oct" maxLength={200} />
            <p className="text-xs text-muted-foreground">Recorded with your name against the tenant.</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => close(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={submit} disabled={!valid || isLoading}>
              {isLoading ? <><Loader className="h-4 w-4 mr-1.5 animate-spin" />Sending to the meter…</> : `Credit ${kwh >= 0.01 ? kwh + " kWh" : "meter"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
