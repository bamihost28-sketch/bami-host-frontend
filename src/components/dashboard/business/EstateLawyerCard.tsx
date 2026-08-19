import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Trash2, Scale, UserPlus } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useGetEstateLawyerQuery,
  useGetLegalVendorsQuery,
  useAssignEstateLawyerMutation,
  useUnassignEstateLawyerMutation,
} from '@/services/estatesApi';

export const EstateLawyerCard = ({ estateId }: { estateId: string }) => {
  const { isOwner } = usePermissions();
  const { data: lawyer, isLoading } = useGetEstateLawyerQuery(estateId, { skip: !estateId });
  const { data: legalVendors } = useGetLegalVendorsQuery(undefined, { skip: !isOwner });
  const [assign, { isLoading: assigning }] = useAssignEstateLawyerMutation();
  const [unassign, { isLoading: unassigning }] = useUnassignEstateLawyerMutation();

  const [pickExisting, setPickExisting] = useState(true);
  const [vendorId, setVendorId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const otherLawyers = (legalVendors ?? []).filter((v) => v.id !== lawyer?.id);

  const handleAssign = async () => {
    if (pickExisting) {
      if (!vendorId) {
        toast({ title: 'Pick a lawyer to assign', variant: 'destructive' });
        return;
      }
      try {
        await assign({ estateId, vendorId }).unwrap();
        toast({ title: 'Lawyer assigned' });
        setVendorId('');
      } catch (e: any) {
        toast({ title: 'Failed to assign lawyer', description: e?.data?.detail, variant: 'destructive' });
      }
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }
    try {
      await assign({ estateId, name: name.trim(), email: email.trim(), phone: phone.trim(), businessAddress: address.trim() }).unwrap();
      toast({ title: 'Lawyer assigned', description: 'Login credentials emailed to them.' });
      setName(''); setEmail(''); setPhone(''); setAddress('');
    } catch (e: any) {
      toast({ title: 'Failed to assign lawyer', description: e?.data?.detail, variant: 'destructive' });
    }
  };

  const handleRemove = async () => {
    try {
      await unassign(estateId).unwrap();
      toast({ title: 'Lawyer unassigned' });
    } catch {
      toast({ title: 'Failed to unassign lawyer', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="w-4 h-4 text-emerald-600" /> Solicitor
        </CardTitle>
        <CardDescription>
          The lawyer named on this estate's tenancy agreements. Estates can share the same
          lawyer or each use a different one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : lawyer ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{lawyer.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {lawyer.email}{lawyer.phone ? ` · ${lawyer.phone}` : ''}
              </p>
              {lawyer.businessAddress && (
                <p className="text-xs text-muted-foreground truncate">{lawyer.businessAddress}</p>
              )}
            </div>
            {isOwner && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={handleRemove} disabled={unassigning}>
                {unassigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No solicitor assigned yet.</p>
        )}

        {isOwner && (
          <div className="rounded-lg border border-dashed p-3 space-y-3">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> {lawyer ? 'Change solicitor' : 'Assign a solicitor'}
            </p>

            <div className="flex gap-2 text-xs">
              <Button type="button" size="sm" variant={pickExisting ? 'default' : 'outline'} onClick={() => setPickExisting(true)}>
                Use existing
              </Button>
              <Button type="button" size="sm" variant={!pickExisting ? 'default' : 'outline'} onClick={() => setPickExisting(false)}>
                Add new
              </Button>
            </div>

            {pickExisting ? (
              otherLawyers.length > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs">Lawyer</Label>
                    <Select value={vendorId} onValueChange={setVendorId}>
                      <SelectTrigger><SelectValue placeholder="Select a lawyer already in the system" /></SelectTrigger>
                      <SelectContent>
                        {otherLawyers.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.name} — {v.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAssign} disabled={assigning} className="gap-2">
                    {assigning && <Loader2 className="w-4 h-4 animate-spin" />} Assign
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No other lawyers in the system yet — add a new one instead.</p>
              )
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="lwr-name" className="text-xs">Name</Label>
                    <Input id="lwr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="lwr-email" className="text-xs">Email</Label>
                    <Input id="lwr-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="lwr-phone" className="text-xs">Phone</Label>
                    <Input id="lwr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="lwr-address" className="text-xs">Office address</Label>
                    <Input id="lwr-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <Button onClick={handleAssign} disabled={assigning} className="gap-2">
                  {assigning && <Loader2 className="w-4 h-4 animate-spin" />} Assign
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Creates a new vendor login and emails them their credentials.
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
