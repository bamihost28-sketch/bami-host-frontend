import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useUpdateTenantMutation, useUpdateEstateUnitMutation, useResendTenantCredentialsMutation, useRenewTenantMutation, useSetTenantAccountStatusMutation } from '@/services/estatesApi';
import { Textarea } from '@/components/ui/textarea';
import { useGetTenantAgreementQuery } from '@/services/agreementApi';
import { formatDate, formatDateToDDMMYYYY, toDateInput } from '@/utils/propertyUtils';

interface TenantDetailHeaderProps {
  tenantId?: string;
  tenant: any;
  overview: any;
  onStartTour?: () => void;
  tourSeen?: boolean;
}

export const TenantDetailHeader = ({ tenantId, tenant, overview, onStartTour, tourSeen }: TenantDetailHeaderProps) => {
  const navigate = useNavigate();
  const [updateTenant, { isLoading: updatingTenant }] = useUpdateTenantMutation();
  const [updateUnit, { isLoading: updatingUnit }] = useUpdateEstateUnitMutation();
  const [resendCredentials, { isLoading: resendingCredentials }] = useResendTenantCredentialsMutation();
  const [renewTenantLease, { isLoading: renewingLease }] = useRenewTenantMutation();
  const [setAccountStatus, { isLoading: settingAccountStatus }] = useSetTenantAccountStatusMutation();
  const { data: agreementData } = useGetTenantAgreementQuery(tenantId as string, { skip: !tenantId });

  // Resend login credentials state
  const [resendOpen, setResendOpen] = useState(false);
  const tenantEmail = tenant?.email || overview?.email || tenant?.tenantEmail || '';

  // Suspend/reactivate account state — locks the login only, independent of
  // occupancy, lease, and billing. For a dispute/issue to resolve, not a move-out.
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const accountActive = overview?.accountActive;

  const handleAccountStatus = async (nextActive: boolean) => {
    if (!tenantId) return;
    try {
      const res = await setAccountStatus({ tenantId, isActive: nextActive, reason: suspendReason.trim() || undefined }).unwrap();
      toast({ title: res?.message || (nextActive ? 'Account access restored' : 'Account access suspended') });
      setSuspendOpen(false);
      setSuspendReason('');
    } catch (e: any) {
      toast({ title: e?.data?.detail || 'Failed to update account access', variant: 'destructive' });
    }
  };

  const handleResendCredentials = async () => {
    if (!tenantId) return;
    try {
      const res = await resendCredentials(tenantId).unwrap();
      toast({ title: res?.message || `Login credentials sent to ${tenantEmail}` });
      setResendOpen(false);
    } catch (e: any) {
      toast({
        title: e?.data?.detail || 'Failed to resend credentials',
        variant: 'destructive',
      });
    }
  };

  // Tenant edit state
  const [editTenantOpen, setEditTenantOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editType, setEditType] = useState<'new' | 'existing' | 'transfer'>('new');
  const [editEntryDate, setEditEntryDate] = useState('');
  const [editNextDueDate, setEditNextDueDate] = useState('');
  const [editIncreaseStart, setEditIncreaseStart] = useState('');

  // Renew Lease state
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewDuration, setRenewDuration] = useState<'6' | '12'>('12');
  const currentDueRaw = (tenant as any)?.nextDueDate;
  const previewNewDue = (() => {
    if (!currentDueRaw) return null;
    const d = new Date(currentDueRaw);
    if (Number.isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + Number(renewDuration));
    return d.toISOString();
  })();

  const handleRenew = async () => {
    if (!tenantId) return;
    try {
      await renewTenantLease({ tenantId, durationMonths: Number(renewDuration) as 6 | 12 }).unwrap();
      toast({ title: 'Lease renewed' });
      setRenewOpen(false);
    } catch (e: any) {
      toast({ title: e?.data?.detail || 'Failed to renew lease', variant: 'destructive' });
    }
  };

  // Edit Fees state
  const [editFeesOpen, setEditFeesOpen] = useState(false);
  const [editMonthlyPrice, setEditMonthlyPrice] = useState('');
  const [editServiceCharge, setEditServiceCharge] = useState('');
  const [editCautionFee, setEditCautionFee] = useState('');
  const [editLegalFee, setEditLegalFee] = useState('');



  const handleEditTenantOpen = () => {
    if (tenant) {
      setEditName(overview?.name || tenant.tenantName || '');
      setEditEmail(tenant.email || overview?.email || tenant.tenantEmail || '');
      setEditPhone(tenant.whatsapp || tenant.whatsappNumber || overview?.phone || tenant.tenantPhone || '');
      setEditType((tenant.tenantType as any) || 'new');
      // Time-zone-safe: read the calendar date directly, no UTC round-trip
      // (otherwise WAT/UTC+1 shifts the day back by one).
      setEditEntryDate(toDateInput((tenant as any).entryDate));
      setEditNextDueDate(toDateInput((tenant as any).nextDueDate));
      setEditIncreaseStart(toDateInput((tenant as any).rentIncreaseStart));
    }
  };

  const handleEditFeesOpen = () => {
    // Pre-fill from the unit's actual stored fees so the owner edits the real
    // current values rather than a blank form.
    const u = overview?.unitFees || {};
    setEditMonthlyPrice(u.monthlyPrice != null ? String(u.monthlyPrice) : '');
    setEditServiceCharge(u.serviceChargeMonthly != null ? String(u.serviceChargeMonthly) : '');
    setEditCautionFee(u.cautionFee != null ? String(u.cautionFee) : '');
    setEditLegalFee(u.legalFee != null ? String(u.legalFee) : '');
  };

  const submitEditFees = async () => {
    // tenant.unit comes back as an id string; overview.unitFees.id is the reliable source.
    const rawUnit = (tenant as any)?.unit;
    const unitId = overview?.unitFees?.id || (typeof rawUnit === 'string' ? rawUnit : rawUnit?._id);
    if (!unitId) {
      toast({ title: 'No unit found for this tenant', variant: 'destructive' });
      return;
    }
    try {
      const price = Number(editMonthlyPrice);
      const svc = Number(editServiceCharge);
      const caution = Number(editCautionFee);
      const legal = Number(editLegalFee);
      await updateUnit({
        unitId,
        body: {
          monthlyPrice: Number.isFinite(price) && price > 0 ? price : undefined,
          serviceChargeMonthly: Number.isFinite(svc) && svc >= 0 ? svc : undefined,
          cautionFee: Number.isFinite(caution) && caution >= 0 ? caution : undefined,
          legalFee: Number.isFinite(legal) && legal >= 0 ? legal : undefined,
        },
      }).unwrap();
      toast({ title: 'Unit fees updated successfully' });
      setEditFeesOpen(false);
    } catch (e) {
      toast({ title: 'Failed to update fees', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold">Tenant Overview</h1>
        <p className="text-muted-foreground text-sm">Profile, history, and transactions</p>
        {agreementData && (
          <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
            agreementData.signed
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}>
            {agreementData.signed
              ? `Tenancy agreement signed${agreementData.data?.signedAt ? ' on ' + new Date(agreementData.data.signedAt).toLocaleDateString() : ''}`
              : 'Tenancy agreement not yet signed'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {onStartTour && !tourSeen && (
          <Button variant="ghost" size="sm" onClick={onStartTour}>
            <HelpCircle className="h-4 w-4 mr-1.5" />
            Take a tour
          </Button>
        )}
        <Dialog open={editTenantOpen} onOpenChange={(open) => {
          setEditTenantOpen(open);
          if (open) handleEditTenantOpen();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Edit Tenant</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tenant</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 py-2 text-sm max-h-[70dvh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name"
                  disabled={false}
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email"
                  type="email" 
                  disabled={false}
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone / WhatsApp</Label>
                <Input 
                  id="edit-phone"
                  disabled={false}
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-entry-date">Original move-in date</Label>
                <Input
                  id="edit-entry-date"
                  type="date"
                  value={editEntryDate}
                  onChange={(e) => setEditEntryDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-next-due-date">Next due date</Label>
                <Input
                  id="edit-next-due-date"
                  type="date"
                  value={editNextDueDate}
                  onChange={(e) => setEditNextDueDate(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground -mt-1">The date the tenant's next rent payment is due. Correcting this fixes the Current/Renewal Year cards.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-increase-start">Rent increase start (optional)</Label>
                <Input
                  id="edit-increase-start"
                  type="date"
                  value={editIncreaseStart}
                  onChange={(e) => setEditIncreaseStart(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground -mt-1">Anchors when this tenant's increases begin (the estate's % and cycle still apply). Leave blank to use the estate default / entry date.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setEditTenantOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!tenantId) return;
                  try {
                    const payload: any = {
                      tenantId: tenantId as string,
                      tenantName: editName || undefined,
                      tenantEmail: editEmail || undefined,
                      tenantPhone: editPhone || undefined,
                      tenantType: editType,
                    };
                    
                    if (editEntryDate) {
                      payload.entryDate = formatDateToDDMMYYYY(editEntryDate);
                    }
                    if (editNextDueDate) {
                      payload.nextDueDate = formatDateToDDMMYYYY(editNextDueDate);
                    }
                    // Sent unconditionally so clearing the field removes the override.
                    payload.rentIncreaseStart = editIncreaseStart ? formatDateToDDMMYYYY(editIncreaseStart) : '';

                    await updateTenant(payload).unwrap();
                    toast({ title: 'Tenant updated' });
                    setEditTenantOpen(false);
                  } catch (e) {
                    toast({ title: 'Failed to update tenant', variant: 'destructive' });
                  }
                }}
                disabled={updatingTenant}
              >
                {updatingTenant ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Renew Lease</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Renew lease</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm space-y-4">
              <p className="text-muted-foreground">
                Extends this tenant's lease on their existing unit — no new tenant or unit
                record is created, and their payment history stays intact.
              </p>
              <div className="grid gap-2">
                <Label htmlFor="renew-duration">Renewal duration</Label>
                <Select value={renewDuration} onValueChange={(v) => setRenewDuration(v as '6' | '12')}>
                  <SelectTrigger id="renew-duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border p-3 space-y-1.5 bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current due date</span>
                  <span className="font-medium">{formatDate(currentDueRaw)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New due date</span>
                  <span className="font-medium">{previewNewDue ? formatDate(previewNewDue) : '—'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setRenewOpen(false)}>Cancel</Button>
              <Button onClick={handleRenew} disabled={renewingLease}>
                {renewingLease ? 'Renewing...' : 'Renew lease'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editFeesOpen} onOpenChange={(open) => {
          setEditFeesOpen(open);
          if (open) handleEditFeesOpen();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Edit Fees</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Unit Fees</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="header-monthly-price">Monthly Price (Rent)</Label>
                <Input
                  id="header-monthly-price"
                  type="number"
                  value={editMonthlyPrice}
                  onChange={(e) => setEditMonthlyPrice(e.target.value)}
                  placeholder="e.g., 250000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="header-service-charge">Monthly Service Charge</Label>
                <Input
                  id="header-service-charge"
                  type="number"
                  value={editServiceCharge}
                  onChange={(e) => setEditServiceCharge(e.target.value)}
                  placeholder="e.g., 12600"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="header-caution-fee">Caution Fee (One-time)</Label>
                <Input
                  id="header-caution-fee"
                  type="number"
                  value={editCautionFee}
                  onChange={(e) => setEditCautionFee(e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="header-legal-fee">Legal Fee (One-time)</Label>
                <Input
                  id="header-legal-fee"
                  type="number"
                  value={editLegalFee}
                  onChange={(e) => setEditLegalFee(e.target.value)}
                  placeholder="e.g., 30000"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditFeesOpen(false)}>Cancel</Button>
              <Button onClick={submitEditFees} disabled={updatingUnit}>
                {updatingUnit ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={resendOpen} onOpenChange={setResendOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Resend Login Details</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Resend login credentials</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm space-y-3">
              <p>
                A new temporary password will be generated and emailed to this tenant's
                current email address:
              </p>
              {tenantEmail ? (
                <p className="font-medium break-all">{tenantEmail}</p>
              ) : (
                <p className="text-destructive">
                  This tenant has no email address. Add one under “Edit Tenant” first.
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Their existing password will stop working once the new one is sent.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setResendOpen(false)}>Cancel</Button>
              <Button
                onClick={handleResendCredentials}
                disabled={resendingCredentials || !tenantEmail}
              >
                {resendingCredentials ? 'Sending...' : 'Send credentials'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {typeof accountActive === 'boolean' && (
          accountActive ? (
            <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  Suspend Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Suspend this tenant's account?</DialogTitle>
                </DialogHeader>
                <div className="py-2 text-sm space-y-3">
                  <p className="text-muted-foreground">
                    They'll be logged out immediately and unable to sign back in until you
                    reactivate their account. Their lease, billing, and occupancy status are
                    not affected — use this for a dispute or issue to resolve, not a move-out.
                  </p>
                  <div className="grid gap-2">
                    <Label htmlFor="suspend-reason">Reason (optional, kept on record)</Label>
                    <Textarea
                      id="suspend-reason"
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="e.g. Payment dispute under review"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="ghost" onClick={() => setSuspendOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => handleAccountStatus(false)} disabled={settingAccountStatus}>
                    {settingAccountStatus ? 'Suspending...' : 'Suspend account'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" size="sm" onClick={() => handleAccountStatus(true)} disabled={settingAccountStatus}>
              {settingAccountStatus ? 'Restoring...' : 'Reactivate Account'}
            </Button>
          )
        )}

        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
      </div>
    </div>
  );
};
