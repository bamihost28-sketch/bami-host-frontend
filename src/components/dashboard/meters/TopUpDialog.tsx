import { useState } from "react";
import { Zap, Wallet, CheckCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useTopUpMeterMutation } from "@/services/meterApi";
import { useGetWalletBalanceQuery } from "@/services/walletTransactionApi";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ratePerKwh: number;
  currentBalance: number;
}

type Step = "input" | "confirm" | "success";

export default function TopUpDialog({ open, onOpenChange, ratePerKwh, currentBalance }: Props) {
  const { toast } = useToast();
  const [step, setStep]     = useState<Step>("input");
  const [amount, setAmount] = useState("");
  const [topUp, { isLoading }] = useTopUpMeterMutation();
  const { data: walletData } = useGetWalletBalanceQuery();
  const [result, setResult] = useState<{ kwhPurchased: number; newBalance: number; newWalletBalance: number } | null>(null);

  const amountNum  = parseFloat(amount) || 0;
  const kwhUnits   = amountNum > 0 ? (amountNum / ratePerKwh).toFixed(2) : "0";
  const walletBal  = (walletData?.data as any)?.balance ?? 0;
  const canAfford  = amountNum > 0 && walletBal >= amountNum;

  const reset = () => { setStep("input"); setAmount(""); setResult(null); };

  const handleConfirm = async () => {
    try {
      const res = await topUp({ amount: amountNum }).unwrap();
      setResult({
        kwhPurchased: res.data.kwhPurchased,
        newBalance: res.data.newBalance,
        newWalletBalance: res.data.newWalletBalance,
      });
      setStep("success");
    } catch {
      toast({ title: "Top-up failed", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Buy Electricity Units
          </DialogTitle>
          <DialogDescription>
            {step === "input"   && "Choose an amount to top up your meter."}
            {step === "confirm" && "Confirm your purchase details below."}
            {step === "success" && "Your meter has been recharged successfully."}
          </DialogDescription>
        </DialogHeader>

        {/* ── step 1: input ── */}
        {step === "input" && (
          <div className="space-y-5 pt-2">
            {/* wallet balance */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Wallet balance
              </div>
              <span className="font-semibold">{fmt(walletBal)}</span>
            </div>

            {/* quick amounts */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Quick select</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {QUICK_AMOUNTS.map(q => (
                  <Button
                    key={q}
                    variant={amount === String(q) ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setAmount(String(q))}
                  >
                    ₦{(q / 1000).toFixed(0)}k
                  </Button>
                ))}
              </div>
            </div>

            {/* custom amount */}
            <div>
              <Label htmlFor="amount" className="text-xs text-muted-foreground mb-1.5 block">Or enter amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                min={100}
                placeholder="e.g. 3000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="h-11 text-lg font-semibold"
              />
            </div>

            {/* kWh preview */}
            {amountNum > 0 && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You get</span>
                  <span className="font-bold text-yellow-500">{kwhUnits} kWh</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">New balance</span>
                  <span className="font-semibold">{fmt(currentBalance + amountNum)}</span>
                </div>
                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                  <span>Tariff rate</span>
                  <span>{fmt(ratePerKwh)}/kWh</span>
                </div>
              </div>
            )}

            {!canAfford && amountNum > 0 && (
              <p className="text-xs text-red-500 text-center">
                Insufficient wallet balance. Please top up your wallet first.
              </p>
            )}

            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              disabled={!canAfford}
              onClick={() => setStep("confirm")}
            >
              Continue
            </Button>
          </div>
        )}

        {/* ── step 2: confirm ── */}
        {step === "confirm" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-border/50 divide-y divide-border/40">
              {[
                ["Amount",        fmt(amountNum)],
                ["kWh Units",     `${kwhUnits} kWh`],
                ["Tariff",        `${fmt(ratePerKwh)}/kWh`],
                ["Paid via",      "Wallet balance"],
                ["New balance",   fmt(currentBalance + amountNum)],
                ["Remaining wallet", fmt(walletBal - amountNum)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setStep("input")} disabled={isLoading}>Back</Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Processing…" : `Pay ${fmt(amountNum)}`}
              </Button>
            </div>
          </div>
        )}

        {/* ── step 3: success ── */}
        {step === "success" && result && (
          <div className="space-y-4 pt-2 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-emerald-500/15">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold">{result.kwhPurchased.toFixed(2)} kWh Added</p>
              <p className="text-sm text-muted-foreground mt-0.5">Your meter has been recharged</p>
            </div>
            <div className="rounded-lg bg-muted/30 px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New meter balance</span>
                <span className="font-semibold text-emerald-500">{fmt(result.newBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wallet balance</span>
                <span className="font-semibold">{fmt(result.newWalletBalance)}</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => { reset(); onOpenChange(false); }}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
