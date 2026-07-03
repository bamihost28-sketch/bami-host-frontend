import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useUpdateTenantMutation, useUpdateEstateUnitMutation } from '@/services/estatesApi';
import { formatDate, formatDateToDDMMYYYY } from '@/utils/propertyUtils';

interface TenantDetailHeaderProps {
  tenantId?: string;
  tenant: any;
  overview: any;
}

export const TenantDetailHeader = ({ tenantId, tenant, overview }: TenantDetailHeaderProps) => {
  const navigate = useNavigate();
  const [updateTenant, { isLoading: updatingTenant }] = useUpdateTenantMutation();
  const [updateUnit, { isLoading: updatingUnit }] = useUpdateEstateUnitMutation();

  // Tenant edit state
  const [editTenantOpen, setEditTenantOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editType, setEditType] = useState<'new' | 'existing' | 'transfer'>('new');
  const [editEntryDate, setEditEntryDate] = useState('');
  const [editNextDueDate, setEditNextDueDate] = useState('');

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
      // Format entry date for input field (ISO format: YYYY-MM-DD)
      const entryDate = (tenant as any).entryDate || '';
      if (entryDate) {
        const dateObj = new Date(entryDate);
        if (!Number.isNaN(dateObj.getTime())) {
          setEditEntryDate(dateObj.toISOString().split('T')[0]);
        } else {
          setEditEntryDate(entryDate);
        }
      } else {
        setEditEntryDate('');
      }
      const nextDueDate = (tenant as any).nextDueDate || '';
      if (nextDueDate) {
        const dateObj = new Date(nextDueDate);
        if (!Number.isNaN(dateObj.getTime())) {
          setEditNextDueDate(dateObj.toISOString().split('T')[0]);
        } else {
          setEditNextDueDate(nextDueDate);
        }
      } else {
        setEditNextDueDate('');
      }
    }
  };

  const handleEditFeesOpen = () => {
    // Pre-fill from the unit's actual stored fees so the owner edits the real
    // current values rather than a blank form.
    const u = overview?.unit || {};
    setEditMonthlyPrice(u.monthlyPrice != null ? String(u.monthlyPrice) : '');
    setEditServiceCharge(u.serviceChargeMonthly != null ? String(u.serviceChargeMonthly) : '');
    setEditCautionFee(u.cautionFee != null ? String(u.cautionFee) : '');
    setEditLegalFee(u.legalFee != null ? String(u.legalFee) : '');
  };

  const submitEditFees = async () => {
    // tenant.unit comes back as an id string; overview.unit.id is the reliable source.
    const rawUnit = (tenant as any)?.unit;
    const unitId = overview?.unit?.id || (typeof rawUnit === 'string' ? rawUnit : rawUnit?._id);
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
      </div>
      <div className="flex items-center gap-2 flex-wrap">
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

        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
      </div>
    </div>
  );
};
