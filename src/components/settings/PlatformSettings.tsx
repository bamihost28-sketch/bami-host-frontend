import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Zap } from "lucide-react";
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from "@/services/bankDepositsApi";
import { toast } from "@/components/ui/use-toast";

export const PlatformSettings = () => {
  const { data, isLoading } = useGetPlatformSettingsQuery();
  const [updateSettings, { isLoading: savingBank }] = useUpdatePlatformSettingsMutation();

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    if (!data?.data) return;
    setBankName(data.data.bankInfo.bankName);
    setAccountNumber(data.data.bankInfo.accountNumber);
    setAccountName(data.data.bankInfo.accountName);
    setUnitPrice(String(data.data.electricityUnitPrice ?? 0.7));
  }, [data]);

  const saveBankInfo = async () => {
    try {
      await updateSettings({ bankInfo: { bankName, accountNumber, accountName } }).unwrap();
      toast({ title: "Bank details updated" });
    } catch (e: any) {
      toast({ title: e?.data?.detail || "Failed to update bank details", variant: "destructive" });
    }
  };

  const price = Number(unitPrice);
  const priceValid = Number.isFinite(price) && price > 0 && price <= 1000;

  const savePrice = async () => {
    if (!priceValid) return;
    setSavingPrice(true);
    try {
      const res = await updateSettings({ electricityUnitPrice: price }).unwrap();
      toast({
        title: "Electricity price updated",
        description: `₦${price} per 0.01 kWh — applied to ${res.data.metersRepriced ?? 0} meter(s).`,
      });
    } catch (e: any) {
      toast({ title: e?.data?.detail || "Failed to update the price", variant: "destructive" });
    } finally {
      setSavingPrice(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="bg-white/90 dark:bg-slate-900 shadow-lg border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" /> Deposit Bank Account
          </CardTitle>
          <CardDescription>
            Shown to every tenant across every estate when they fund their wallet by bank transfer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ps-bank-name">Bank name</Label>
            <Input id="ps-bank-name" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. UBA" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ps-account-number">Account number</Label>
            <Input id="ps-account-number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g. 1234567890" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ps-account-name">Account name</Label>
            <Input id="ps-account-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. BamiHost Properties Ltd" />
          </div>
          <Button onClick={saveBankInfo} disabled={savingBank}>
            {savingBank ? "Saving..." : "Save bank details"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/90 dark:bg-slate-900 shadow-lg border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Electricity Price
          </CardTitle>
          <CardDescription>
            What tenants pay for prepaid electricity. Prepaid meters count in steps of 0.01 kWh, so the price is set per step.
            Changing it applies to every meter; credit already on a meter keeps its kWh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ps-unit-price">Price per 0.01 kWh (₦)</Label>
            <Input
              id="ps-unit-price"
              type="number"
              min="0.01"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.70"
            />
            <p className="text-xs text-muted-foreground">
              {priceValid
                ? `= ₦${(price * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} per kWh · ₦1,000 buys ${(1000 / (price * 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh`
                : "Enter a price above ₦0 (max ₦1,000)."}
            </p>
          </div>
          <Button onClick={savePrice} disabled={savingPrice || !priceValid}>
            {savingPrice ? "Saving..." : "Save price"}
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Looking for the tenancy-agreement solicitor? That's now assigned per estate —
        open an estate's page and use "Assign Lawyer" there.
      </p>
    </div>
  );
};
