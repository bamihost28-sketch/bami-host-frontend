import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useSubmitRentalApplicationMutation, type RentalApplicationPayload } from '@/services/estatesApi';

interface RentalApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estateId: string;
  unitId?: string;
  propertyLabel?: string;
}

export const RentalApplicationDialog = ({
  open,
  onOpenChange,
  estateId,
  unitId,
  propertyLabel,
}: RentalApplicationDialogProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    employmentStatus: 'employed' as RentalApplicationPayload['employmentStatus'],
  });

  const [submit, { isLoading }] = useSubmitRentalApplicationMutation();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleClose = (v: boolean) => {
    if (!v) {
      setSubmitted(false);
      setForm({ fullName: '', email: '', phone: '', employmentStatus: 'employed' });
    }
    onOpenChange(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submit({
        estateId,
        ...(unitId ? { unitId } : {}),
        ...form,
      }).unwrap();
      setSubmitted(true);
    } catch {
      toast({ title: 'Submission failed', description: 'Please check your details and try again.', variant: 'destructive' });
    }
  };

  const canSubmit = form.fullName && form.email && form.phone && form.employmentStatus;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Apply for {propertyLabel ?? 'this property'}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-10 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Thank you! Your rental application has been received. The property owner will be in touch with you shortly.
            </p>
            <Button onClick={() => handleClose(false)}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Full Name *</Label>
              <Input
                required
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl h-10 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Email *</Label>
              <Input
                required
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl h-10 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Phone *</Label>
              <Input
                required
                type="tel"
                placeholder="0801 234 5678"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl h-10 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Employment Status *</Label>
              <Select value={form.employmentStatus} onValueChange={(v) => set('employmentStatus', v as typeof form.employmentStatus)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-10 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self_employed">Self-employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              disabled={isLoading || !canSubmit}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Submit Application
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
