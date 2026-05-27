import React, { useState } from 'react';
import {
  useGetAllDepositsQuery,
  useApproveDepositMutation,
  useRejectDepositMutation,
  BankDeposit,
} from '../../../services/bankDepositsApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from '../../ui/use-toast';
import { CheckCircle2, XCircle, Eye, Loader2, Search } from 'lucide-react';

const STATUS_BADGE: Record<BankDeposit['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function userName(user: BankDeposit['user']): string {
  if (!user) return '—';
  if (typeof user === 'string') return user;
  return user.name || user.email || '—';
}

export const BankDepositsPanel: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selected, setSelected] = useState<BankDeposit | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const { data, isLoading, isFetching } = useGetAllDepositsQuery({
    page,
    limit: 15,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const [approveDeposit, { isLoading: approving }] = useApproveDepositMutation();
  const [rejectDeposit, { isLoading: rejecting }] = useRejectDepositMutation();

  const deposits = data?.data ?? [];

  const openAction = (dep: BankDeposit, type: 'approve' | 'reject') => {
    setSelected(dep);
    setActionType(type);
    setAdminNote('');
  };

  const closeAction = () => {
    setSelected(null);
    setActionType(null);
    setAdminNote('');
  };

  const handleConfirm = async () => {
    if (!selected || !actionType) return;
    try {
      if (actionType === 'approve') {
        const res = await approveDeposit({ id: selected._id, adminNote: adminNote || undefined }).unwrap();
        toast({ title: 'Deposit approved', description: res.message });
      } else {
        const res = await rejectDeposit({ id: selected._id, adminNote: adminNote || undefined }).unwrap();
        toast({ title: 'Deposit rejected', description: res.message });
      }
      closeAction();
    } catch (err: any) {
      toast({ title: 'Action failed', description: err?.data?.message || 'An error occurred', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <CardTitle>Bank Deposit Requests</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8 w-40 text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : deposits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No deposit requests found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2 font-medium">User</th>
                    <th className="text-left px-4 py-2 font-medium">Amount</th>
                    <th className="text-left px-4 py-2 font-medium">Date</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-right px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deposits.map((dep) => (
                    <tr key={dep._id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="font-medium">{userName(dep.user)}</p>
                        {dep.tenant && typeof dep.tenant !== 'string' && (
                          <p className="text-xs text-muted-foreground">{dep.tenant.tenantName} · {dep.tenant.unitLabel}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">₦{dep.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(dep.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[dep.status]}`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a href={dep.proofImageUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="View proof">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                          {dep.status === 'pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approve"
                                onClick={() => openAction(dep, 'approve')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Reject"
                                onClick={() => openAction(dep, 'reject')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(data?.pages ?? 1) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {data?.total} total · Page {page} of {data?.pages}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                  <Button size="sm" variant="outline" disabled={page >= (data?.pages ?? 1) || isFetching} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Approve / Reject confirmation dialog */}
      <Dialog open={!!selected && !!actionType} onOpenChange={(open) => { if (!open) closeAction(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">User:</span> <strong>{userName(selected.user)}</strong></p>
                <p><span className="text-muted-foreground">Amount:</span> <strong>₦{selected.amount.toLocaleString()}</strong></p>
                <p><span className="text-muted-foreground">Submitted:</span> {new Date(selected.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <a
                href={selected.proofImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <Eye className="h-4 w-4" /> View proof image
              </a>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Admin note (optional)</label>
                <Textarea
                  placeholder={actionType === 'approve' ? 'Transfer confirmed. Wallet credited.' : 'Could not verify transfer. Please contact support.'}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={closeAction} disabled={approving || rejecting}>Cancel</Button>
                <Button
                  onClick={handleConfirm}
                  disabled={approving || rejecting}
                  className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {(approving || rejecting) ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                  ) : actionType === 'approve' ? (
                    <><CheckCircle2 className="mr-2 h-4 w-4" />Approve & Credit Wallet</>
                  ) : (
                    <><XCircle className="mr-2 h-4 w-4" />Reject Deposit</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
