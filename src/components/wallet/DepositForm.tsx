import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGetBankInfoQuery, useSubmitDepositMutation } from '../../services/bankDepositsApi';
import { Building2, CheckCircle2, Copy, Loader2, Upload, ImageIcon, CheckCircle } from 'lucide-react';
import { toast } from '../ui/use-toast';

type Step = 'bank-info' | 'upload' | 'done';

export const DepositForm: React.FC = () => {
  const [step, setStep] = useState<Step>('bank-info');
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: bankInfoData } = useGetBankInfoQuery();
  const bankInfo = bankInfoData?.data;

  const [submitDeposit, { isLoading: isSubmitting }] = useSubmitDepositMutation();

  const isValidAmount = amount && parseInt(amount) >= 100;

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proofFile || !isValidAmount) return;
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('proof', proofFile);
    try {
      await submitDeposit(formData).unwrap();
      setStep('done');
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.data?.message || 'Could not submit deposit. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const reset = () => {
    setStep('bank-info');
    setAmount('');
    setProofFile(null);
    setProofPreview(null);
  };

  if (step === 'done') {
    return (
      <Card className="border-l-4 border-l-green-600">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <CheckCircle className="h-14 w-14 text-green-600 mx-auto" />
          <div>
            <p className="text-lg font-semibold">Deposit Submitted</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your proof of payment has been sent. An admin will review and credit your wallet shortly.
            </p>
          </div>
          <Button variant="outline" onClick={reset}>Make Another Deposit</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-600">
      <CardHeader>
        <CardTitle>Add Funds to Wallet</CardTitle>
        <CardDescription>
          Transfer to the UBA account below, then upload your proof of payment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Step 1 — Bank account details */}
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold">
            <Building2 className="h-4 w-4" />
            <span>Transfer to this UBA account:</span>
          </div>
          {bankInfo ? (
            [
              { label: 'Bank', value: bankInfo.bankName },
              { label: 'Account Number', value: bankInfo.accountNumber },
              { label: 'Account Name', value: bankInfo.accountName },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2 bg-white dark:bg-card rounded p-2 border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold font-mono">{value}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleCopy(value, label)}
                  title={`Copy ${label}`}
                >
                  {copied === label ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ))
          ) : (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-green-100 dark:bg-green-900/30 rounded" />)}
            </div>
          )}
        </div>

        {/* Step 2 — Amount + proof upload */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount Transferred (₦)</Label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">₦</span>
              <Input
                id="deposit-amount"
                type="number"
                min="100"
                step="100"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            {amount && parseInt(amount) < 100 && (
              <p className="text-xs text-red-600">Minimum deposit is ₦100</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Proof of Payment</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            {proofPreview ? (
              <div className="relative border rounded-lg overflow-hidden">
                <img src={proofPreview} alt="Proof of payment" className="w-full max-h-48 object-contain bg-slate-50" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-green-500 transition-colors"
              >
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload screenshot</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or WEBP — max 10 MB</p>
              </button>
            )}
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!isValidAmount || !proofFile || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Submit Deposit</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your wallet will be credited once an admin confirms the transfer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
