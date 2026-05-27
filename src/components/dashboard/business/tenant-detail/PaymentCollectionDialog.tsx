import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import { Building2, Copy, CheckCircle2 } from 'lucide-react';
import { useManualRecordPaymentMutation } from '@/services/estatesApi';

// UBA account details — kept in sync with backend bankConfig.js
const UBA_ACCOUNT = {
  bankName: 'UBA',
  accountNumber: '1027525073',
  accountName: 'UNITED TRADING INTEGRATED VENTURES ACC 1',
};

function generateReference(type: string) {
  const tag = type.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `BT-${tag}-${suffix}`;
}

interface PaymentCollectionDialogProps {
  tenantId?: string;
  overview: any;
  tenant: any;
  billingData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentCollectionDialog = ({
  tenantId,
  overview,
  tenant,
  billingData,
  open,
  onOpenChange,
}: PaymentCollectionDialogProps) => {
  const [recordManualPayment, { isLoading: recordingManual }] = useManualRecordPaymentMutation();

  // Bank transfer tab state
  const [payType, setPayType] = useState<'deposit' | 'rent' | 'service-charge' | 'caution-fee' | 'legal-fee' | 'initial'>('rent');
  const [payMonths, setPayMonths] = useState('12');
  const [btReference, setBtReference] = useState(() => generateReference('RENT'));
  const [copied, setCopied] = useState<string | null>(null);

  // Manual record tab state
  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState<'bank_transfer' | 'cash' | 'check'>('bank_transfer');
  const [manualType, setManualType] = useState('rent');
  const [manualMonths, setManualMonths] = useState('12');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualDesc, setManualDesc] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  const billingItems = billingData?.data?.items ?? [];

  const getAmount = () => {
    if (payType === 'rent') {
      const months = Number(payMonths) || 1;
      return (overview?.rent || 0) + (overview?.serviceCharge || 0) * months * months;
    }
    const codeMap: Record<string, string> = {
      'service-charge': 'service_charge',
      'caution-fee': 'caution_fee',
      'legal-fee': 'legal_fee',
      deposit: 'deposit',
      initial: 'initial',
    };
    const item = billingItems.find((i: any) => i.code === codeMap[payType]);
    return item?.amount || 0;
  };

  const calcAmount = () => {
    if (payType === 'rent') {
      const months = Number(payMonths) || 1;
      const monthly = (overview?.rent || 0) + (overview?.serviceCharge || 0);
      return monthly * months;
    }
    return getAmount();
  };

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setManualAmount('');
      setPayMonths('12');
      setManualMonths('12');
    }
  };

  const btAmount = calcAmount();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Collect Payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="bank_transfer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bank_transfer">Bank Transfer</TabsTrigger>
            <TabsTrigger value="manual">Record Payment</TabsTrigger>
          </TabsList>

          {/* ── Bank Transfer Instructions ── */}
          <TabsContent value="bank_transfer" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Payment Type</Label>
              <Select value={payType} onValueChange={(v: any) => { setPayType(v); setBtReference(generateReference(v)); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent (includes Service Charge)</SelectItem>
                  <SelectItem value="service-charge">Service Charge Only</SelectItem>
                  <SelectItem value="initial">Initial Fees (Caution, Legal…)</SelectItem>
                  <SelectItem value="deposit">Security Deposit</SelectItem>
                  <SelectItem value="caution-fee">Caution Fee</SelectItem>
                  <SelectItem value="legal-fee">Legal Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {payType === 'rent' && (
              <div className="grid gap-2">
                <Label>Duration</Label>
                <Select value={payMonths} onValueChange={(v) => setPayMonths(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {btAmount > 0 && (
              <p className="text-sm font-semibold text-center">
                Amount: <span className="text-green-600">₦{btAmount.toLocaleString()}</span>
              </p>
            )}

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300 text-sm font-semibold mb-1">
                <Building2 className="h-4 w-4" />
                Transfer to this UBA account:
              </div>
              {[
                { label: 'Bank', value: UBA_ACCOUNT.bankName },
                { label: 'Account Number', value: UBA_ACCOUNT.accountNumber },
                { label: 'Account Name', value: UBA_ACCOUNT.accountName },
                { label: 'Reference (Narration)', value: btReference },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2 bg-white dark:bg-card rounded p-2 border">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold font-mono truncate">{value}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleCopy(value, label)}>
                    {copied === label ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Once you confirm the transfer was received, record it in the "Record Payment" tab.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>Close</Button>
              <Button variant="outline" onClick={() => setBtReference(generateReference(payType))}>
                New Reference
              </Button>
            </div>
          </TabsContent>

          {/* ── Manual Record ── */}
          <TabsContent value="manual" className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Amount (₦)</Label>
                <Input type="number" placeholder="720000" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Method</Label>
                <Select value={manualMethod} onValueChange={(v: any) => setManualMethod(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={manualType} onValueChange={(v: any) => setManualType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="service_charge">Service Charge</SelectItem>
                    <SelectItem value="bundle">Rent + Service Bundle</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Duration (Months)</Label>
                <Select value={manualMonths} onValueChange={(v) => setManualMonths(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Payment Date</Label>
              <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Input placeholder="Rent + service charge for 12 months" value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea placeholder="Transfer reference confirmed..." value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} className="h-20" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!tenantId || !manualAmount) {
                    toast({ title: 'Please fill required fields', variant: 'destructive' });
                    return;
                  }
                  try {
                    await recordManualPayment({
                      tenantId,
                      paymentType: manualType,
                      amount: Number(manualAmount),
                      paymentMethod: manualMethod,
                      durationMonths: Number(manualMonths),
                      paymentDate: manualDate,
                      description: manualDesc,
                      notes: manualNotes,
                    }).unwrap();
                    toast({ title: 'Payment recorded', description: 'Due date has been updated.' });
                    handleOpenChange(false);
                  } catch {
                    toast({ title: 'Failed to record payment', variant: 'destructive' });
                  }
                }}
                disabled={recordingManual}
              >
                {recordingManual ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
