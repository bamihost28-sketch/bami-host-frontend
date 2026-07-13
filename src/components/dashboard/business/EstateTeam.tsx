import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Trash2, UserPlus, Shield } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useGetEstateMembersQuery,
  useAssignEstateMemberMutation,
  useUpdateEstateMemberRoleMutation,
  useRemoveEstateMemberMutation,
  type PropertyRole,
} from '@/services/estatesApi';

const ROLE_LABEL: Record<PropertyRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};
const ROLE_HINT: Record<PropertyRole, string> = {
  admin: 'Edit everything in this property',
  manager: 'Day-to-day: tenants, units, payments, issues',
  viewer: 'Read-only',
};
const ROLE_BADGE: Record<PropertyRole, string> = {
  admin: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export const EstateTeam = ({ estateId }: { estateId: string }) => {
  const { isOwner } = usePermissions();               // super_admin manages the team
  const { data, isLoading } = useGetEstateMembersQuery(estateId, { skip: !estateId });
  const [assign, { isLoading: assigning }] = useAssignEstateMemberMutation();
  const [updateRole] = useUpdateEstateMemberRoleMutation();
  const [remove] = useRemoveEstateMemberMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PropertyRole>('manager');

  const handleAdd = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }
    try {
      const res = await assign({ estateId, name: name.trim(), email: email.trim(), role }).unwrap();
      toast({
        title: 'Member assigned',
        description: res?.data?.accountCreated
          ? 'A login account was created and credentials emailed.'
          : 'Existing account attached to this property.',
      });
      setName(''); setEmail(''); setRole('manager');
    } catch (e: any) {
      toast({ title: 'Failed to assign member', description: e?.data?.detail, variant: 'destructive' });
    }
  };

  const handleRole = async (userId: string, newRole: PropertyRole) => {
    try {
      await updateRole({ estateId, userId, role: newRole }).unwrap();
      toast({ title: `Role updated to ${ROLE_LABEL[newRole]}` });
    } catch {
      toast({ title: 'Failed to update role', variant: 'destructive' });
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await remove({ estateId, userId }).unwrap();
      toast({ title: 'Member removed' });
    } catch {
      toast({ title: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const owner = data?.owner;
  const members = data?.members ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-4 h-4 text-emerald-600" /> Team &amp; Roles
        </CardTitle>
        <CardDescription>
          Who can access this property and what they can do.
          {isOwner ? ' Only the property admin can edit the property.' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading team…</div>
        ) : (
          <>
            {owner && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{owner.name || owner.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{owner.email}</p>
                </div>
                <Badge className={ROLE_BADGE.admin}>Admin · Owner</Badge>
              </div>
            )}

            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">No additional team members yet.</p>
            )}

            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.name || m.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email} · {ROLE_HINT[m.role]}</p>
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Select value={m.role} onValueChange={(v) => handleRole(m.userId, v as PropertyRole)}>
                      <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['admin', 'manager', 'viewer'] as PropertyRole[]).map((r) => (
                          <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(m.userId)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Badge className={ROLE_BADGE[m.role]}>{ROLE_LABEL[m.role]}</Badge>
                )}
              </div>
            ))}

            {isOwner && (
              <div className="rounded-lg border border-dashed p-3 space-y-3">
                <p className="text-sm font-medium flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Assign someone to this property</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="mbr-name" className="text-xs">Name</Label>
                    <Input id="mbr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="mbr-email" className="text-xs">Email</Label>
                    <Input id="mbr-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs">Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as PropertyRole)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['admin', 'manager', 'viewer'] as PropertyRole[]).map((r) => (
                          <SelectItem key={r} value={r}>{ROLE_LABEL[r]} — {ROLE_HINT[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAdd} disabled={assigning} className="gap-2">
                    {assigning && <Loader2 className="w-4 h-4 animate-spin" />} Assign
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  New emails get a login account with credentials emailed automatically.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
