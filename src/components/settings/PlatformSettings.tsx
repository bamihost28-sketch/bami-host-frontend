import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from "lucide-react";
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from "@/services/bankDepositsApi";
import { toast } from "@/components/ui/use-toast";

export const PlatformSettings = () => {
  const { data, isLoading } = useGetPlatformSettingsQuery();
  const [updateSettings, { isLoading: savingBank }] = useUpdatePlatformSettingsMutation();

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (!data?.data) return;
    setBankName(data.data.bankInfo.bankName);
    setAccountNumber(data.data.bankInfo.accountNumber);
    setAccountName(data.data.bankInfo.accountName);
  }, [data]);

  const saveBankInfo = async () => {
    try {
      await updateSettings({ bankInfo: { bankName, accountNumber, accountName } }).unwrap();
      toast({ title: "Bank details updated" });
    } catch (e: any) {
      toast({ title: e?.data?.detail || "Failed to update bank details", variant: "destructive" });
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

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Looking for the tenancy-agreement solicitor? That's now assigned per estate —
        open an estate's page and use "Assign Lawyer" there.
      </p>
    </div>
  );
};
