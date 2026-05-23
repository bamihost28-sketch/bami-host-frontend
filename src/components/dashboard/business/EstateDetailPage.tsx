import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Loader2, ArrowLeft, Home, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useGetEstateQuery,
  useGetEstateTenantsQuery,
  useCreateEstateTenantMutation,
  useGetEstateOverviewQuery,
  useCreateEstateUnitMutation,
  useGetEstateVacantUnitsQuery,
  useDeleteTenantMutation,
  useClearEstateUnitTenantMutation,
  useDeleteEstateUnitMutation,
  useUpdateEstateUnitMutation
} from '@/services/estatesApi';
import { toast } from '@/components/ui/use-toast';
import { EstateDetailSkeleton, TableSkeleton } from '@/components/ui/skeletons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from '@/utils/propertyUtils';

export const EstateDetailPage = () => {
  const { estateId } = useParams();
  const navigate = useNavigate();

  // All useState hooks must be called before any conditional returns
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tenantSearch, setTenantSearch] = useState('');
  // Add Tenant form state
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantType, setTenantType] = useState<'new' | 'existing' | 'renewal' | 'transfer'>('new');
  const [entryDate, setEntryDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');

  // Quarterly rent filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const initialQuarter = currentMonth <= 3 ? 'Q1' : currentMonth <= 6 ? 'Q2' : currentMonth <= 9 ? 'Q3' : 'Q4';
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState('all');

  // Edit Unit Fees state
  const [editFeesOpen, setEditFeesOpen] = useState(false);
  const [selectedUnitForFeesEdit, setSelectedUnitForFeesEdit] = useState<any>(null);
  const [editMonthlyPrice, setEditMonthlyPrice] = useState('');
  const [editServiceCharge, setEditServiceCharge] = useState('');
  const [editCautionFee, setEditCautionFee] = useState('');
  const [editLegalFee, setEditLegalFee] = useState('');

  // API hooks
  const { data: estate, isLoading, isError: estateError, error: estateErrObj, refetch: refetchEstate } = useGetEstateQuery(estateId as string, { skip: !estateId });
  const { data: overviewData, isLoading: overviewLoading, isError: overviewError } = useGetEstateOverviewQuery(estateId as string, { skip: !estateId });
  // Consolidated hook call for both summary and list
  const { data: tenantsData, isLoading: tenantsLoading, isError: tenantsError } = useGetEstateTenantsQuery(
    {
      estateId: estateId as string,
      quarter: selectedQuarter === 'all' ? undefined : selectedQuarter,
      year: selectedYear,
      page,
      limit,
      search: tenantSearch || undefined
    },
    { skip: !estateId },
  );
  const { data: vacantUnits, isLoading: vacantLoading, refetch: refetchVacant } = useGetEstateVacantUnitsQuery(estateId as string, { skip: !estateId });
  const [createTenant, { isLoading: creating }] = useCreateEstateTenantMutation();
  const [deleteTenant, { isLoading: deletingTenant }] = useDeleteTenantMutation();
  const [clearUnitTenant, { isLoading: clearingUnit }] = useClearEstateUnitTenantMutation();
  const [deleteUnit, { isLoading: deletingUnit }] = useDeleteEstateUnitMutation();
  const [updateUnit, { isLoading: updatingUnit }] = useUpdateEstateUnitMutation();

  // Show full page skeleton while main estate data is loading
  if (isLoading) {
    return <EstateDetailSkeleton />;
  }
  // If estate failed to load, show a friendly error with retry
  if (estateError || !estate) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold mb-2">Failed to load estate</h1>
        <p className="text-muted-foreground mb-4">Please check the estate ID or try again.</p>
        <Button onClick={() => refetchEstate()}>Retry</Button>
      </div>
    );
  }

  const submitTenant = async () => {
    if (!estateId || !tenantName.trim() || !selectedUnitId) return;
    try {
      const duration = Number(durationMonths);
      await createTenant({
        estateId, body: {
          unitId: selectedUnitId,
          tenantName: tenantName.trim(),
          tenantEmail: tenantEmail || undefined,
          tenantPhone: tenantPhone || undefined,
          tenantType,
          entryDate: entryDate || undefined,
          durationMonths: Number.isFinite(duration) && duration > 0 ? duration : undefined,
          // nextDueDate will be computed by the backend when durationMonths is provided
        }
      }).unwrap();
      toast({ title: 'Tenant added' });
      setAddOpen(false);
      setSelectedUnitId(''); setTenantName(''); setTenantEmail(''); setTenantPhone(''); setTenantType('new'); setEntryDate(''); setDurationMonths('');
    } catch (e) {
      toast({ title: 'Failed to add tenant', variant: 'destructive' });
    }
  };

  const handleEditFeesOpen = (unit: any) => {
    setSelectedUnitForFeesEdit(unit);
    setEditMonthlyPrice(String(unit.monthlyPrice || ''));
    setEditServiceCharge(String(unit.serviceChargeMonthly || ''));
    setEditCautionFee(String(unit.cautionFee || ''));
    setEditLegalFee(String(unit.legalFee || ''));
    setEditFeesOpen(true);
  };

  const submitEditFees = async () => {
    if (!selectedUnitForFeesEdit?.unitId) return;
    try {
      const payload: any = {};
      if (editMonthlyPrice) payload.monthlyPrice = Number(editMonthlyPrice);
      if (editServiceCharge) payload.serviceChargeMonthly = Number(editServiceCharge);
      if (editCautionFee) payload.cautionFee = Number(editCautionFee);
      if (editLegalFee) payload.legalFee = Number(editLegalFee);

      await updateUnit({
        unitId: selectedUnitForFeesEdit.unitId,
        body: payload
      }).unwrap();
      toast({ title: 'Unit fees updated successfully' });
      setEditFeesOpen(false);
      refetchVacant();
      refetchEstate();
    } catch (e) {
      toast({ title: 'Failed to update unit fees', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estate Overview</h1>
          <p className="text-muted-foreground">Details and tenants</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/estate')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{overviewData?.data?.estate?.name || estate?.name || 'c7'}</span>
            {typeof (overviewData?.data?.estate?.totalUnits ?? estate?.totalUnits) === 'number' && (
              <Badge variant="secondary">{(overviewData?.data?.estate?.totalUnits ?? estate?.totalUnits) as number} units</Badge>
            )}
          </CardTitle>
          {overviewData?.data?.estate?.createdAt && (
            <CardDescription>Created: {formatDate(overviewData.data.estate.createdAt)}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!overviewData ? (
            <div className="text-sm text-muted-foreground">{overviewError ? 'Failed to load overview.' : 'No overview.'}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Occupancy</CardTitle>
                  <CardDescription>Total vs. occupied</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {(() => {
                      const r = overviewData?.data?.occupancy?.occupancyRate;
                      if (typeof r !== 'number' || Number.isNaN(r)) return '—';
                      const pct = r <= 1 ? Math.round(r * 100) : Math.round(r);
                      return `${pct}%`;
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {overviewData?.data?.occupancy?.occupiedUnits ?? 0}/{overviewData?.data?.occupancy?.totalUnits ?? 0} occupied, {overviewData?.data?.occupancy?.vacantUnits ?? 0} vacant
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Upcoming Billing</CardTitle>
                  <CardDescription>Due soon</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{overviewData?.data?.billing?.upcomingDueCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">tenants with upcoming due</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Last 30 days</CardTitle>
                  <CardDescription>Revenue & transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold"> {overviewData?.data?.billing?.last30d?.revenue?.toLocaleString() ?? '0'}</div>
                  <div className="text-xs text-muted-foreground">{overviewData?.data?.billing?.last30d?.transactions ?? 0} transactions</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Projections</CardTitle>
                  <CardDescription>Estimated revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {(overviewData.data as any).projections?.currency} {(overviewData.data as any).projections?.monthly?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Monthly | Yearly: {(overviewData.data as any).projections?.yearly?.toLocaleString() || '0'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Wallets</CardTitle>
                  <CardDescription>Available balances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {(overviewData.data as any).projections?.currency} {(overviewData.data as any).wallets?.totalAvailable?.toLocaleString() || '0'}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2">
                    <span>Mkt: {(overviewData.data as any).wallets?.marketing?.toLocaleString() || '0'}</span>
                    <span>Ops: {(overviewData.data as any).wallets?.operations?.toLocaleString() || '0'}</span>
                    <span>Own: {(overviewData.data as any).wallets?.owner?.toLocaleString() || '0'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quarterly rent summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-sm">Financial Summary</CardTitle>
              <CardDescription>
                Summary of total projected revenue and tenant count for the selected period.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span>Year</span>
                <Input
                  type="number"
                  className="h-8 w-20"
                  value={selectedYear}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || String(currentYear), 10);
                    setSelectedYear(Number.isNaN(v) ? currentYear : v);
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <span>Quarter</span>
                <Select
                  value={selectedQuarter}
                  onValueChange={(v) => setSelectedQuarter(v)}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Q1">Q1 (Jan – Mar)</SelectItem>
                    <SelectItem value="Q2">Q2 (Apr – Jun)</SelectItem>
                    <SelectItem value="Q3">Q3 (Jul – Sep)</SelectItem>
                    <SelectItem value="Q4">Q4 (Oct – Dec)</SelectItem>
                    <SelectItem value="6_months">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tenantsLoading ? (
            <div className="text-xs text-muted-foreground">Loading summary…</div>
          ) : tenantsError || !tenantsData || !('summary' in tenantsData) || !tenantsData.summary ? (
            <div className="text-xs text-muted-foreground">
              No summary data available for this period.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Period</div>
                <div className="font-semibold">
                  {selectedQuarter === 'all' ? 'All Year' : 
                   selectedQuarter === '6_months' ? '6 Months' :
                   selectedQuarter} {selectedYear}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tenant Count</div>
                <div className="font-semibold">{(tenantsData as any).summary.totalItems || (tenantsData as any).summary.tenantCount || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Monthly Rent Total</div>
                <div className="font-semibold">
                  {(tenantsData as any).summary.currency} {(tenantsData as any).summary.totalMonthlyRent?.toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {selectedQuarter === 'all' ? 'Yearly Rent Total' : 
                   selectedQuarter === '6_months' ? '6 Months Total' :
                   'Quarterly Rent Total'}
                </div>
                <div className="font-semibold text-primary">
                  {(tenantsData as any).summary.currency} {((tenantsData as any).summary.totalYearlyRent || (tenantsData as any).summary.totalQuarterRent)?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>All tenants in this estate</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Search tenants..."
                value={tenantSearch}
                onChange={(e) => { setTenantSearch(e.target.value); setPage(1); }}
                className="w-44 h-9"
              />
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Tenant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Tenant</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                    <div className="grid gap-2">
                      <Label>Unit</Label>
                      <Select value={selectedUnitId} onValueChange={(v) => setSelectedUnitId(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={vacantUnits?.data?.length ? 'Select unit' : 'No vacant units'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(vacantUnits?.data ?? []).map((u) => (
                            <SelectItem key={u.unitId} value={u.unitId}>{u.label} — ₦{u.monthlyPrice.toLocaleString()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Tenant name</Label>
                      <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tenant email</Label>
                      <Input type="email" value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tenant phone</Label>
                      <Input type="tel" value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tenant type</Label>
                      <Select value={tenantType} onValueChange={(v: 'new' | 'existing' | 'renewal' | 'transfer') => setTenantType(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="existing">Existing</SelectItem>
                          <SelectItem value="renewal">Renewal</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Entry date</Label>
                      <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Duration (months)</Label>
                      <Select value={durationMonths} onValueChange={(v) => setDurationMonths(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button onClick={submitTenant} disabled={creating}>
                      {creating ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {tenantsLoading ? (
            <div className="px-6 pb-6">
              <TableSkeleton
                rows={5}
                columns={6}
                headers={["Tenant", "Unit", "Monthly Fees", "Status", "Next Due", "Actions"]}
              />
            </div>
          ) : tenantsError ? (
            <div className="px-6 pb-6 text-sm text-destructive">Failed to load tenants.</div>
          ) : tenantsData && ((Array.isArray(tenantsData.data) ? tenantsData.data.length : Object.values(tenantsData.data).flat().length) > 0) ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6">Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Monthly Fees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(tenantsData.data) ? tenantsData.data : Object.values(tenantsData.data).flat()).map((t: any) => {
                      const id = (t.id || t._id) as string;
                      const name = t.tenantName || `${t.firstName || ''} ${t.otherNames || ''} ${t.surname || ''}`.trim() || '—';
                      const initials = name !== '—' ? name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() : '?';
                      const phone = t.whatsapp || t.whatsappNumber || t.tenantPhone;
                      const status = (t.status || '').toLowerCase();
                      const total = t.totalMonthlyFees || 0;
                      const unitId = (t.unit && t.unit._id) || t.unitId;

                      const statusBadge = status === 'occupied'
                        ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 font-medium">Occupied</Badge>
                        : status === 'maintenance'
                        ? <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 font-medium">Maintenance</Badge>
                        : <Badge variant="secondary">{status || '—'}</Badge>;

                      const dueDate = t.nextDueDate ? new Date(t.nextDueDate) : null;
                      const isOverdue = dueDate && dueDate < new Date();

                      return (
                        <TableRow key={id} className="group">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <button
                                  className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block max-w-[160px]"
                                  onClick={() => navigate(`/dashboard/tenant/${id}`)}
                                >
                                  {name}
                                </button>
                                {phone && (
                                  <a
                                    href={`tel:${phone}`}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {phone}
                                  </a>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{t.unitLabel || '—'}</div>
                            {t.electricMeterNumber && (
                              <div className="text-xs text-muted-foreground font-mono">{t.electricMeterNumber}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold">
                              {total > 0 ? `₦${total.toLocaleString()}` : '—'}
                            </span>
                          </TableCell>
                          <TableCell>{statusBadge}</TableCell>
                          <TableCell>
                            {dueDate ? (
                              <div className={isOverdue ? 'text-destructive' : 'text-foreground'}>
                                <div className="text-sm font-medium">{formatDate(t.nextDueDate)}</div>
                                {isOverdue && <div className="text-xs font-medium">Overdue</div>}
                              </div>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex justify-end items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => navigate(`/dashboard/tenant/${id}`)}
                              >
                                View
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    disabled={clearingUnit || !estateId || !unitId}
                                  >
                                    Vacate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Vacate this unit?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove <strong>{name}</strong> from <strong>{t.unitLabel || 'this unit'}</strong> and mark it as vacant. The tenant record will be cleared but not deleted.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={async () => {
                                        if (!estateId || !unitId) return;
                                        try {
                                          await clearUnitTenant({ estateId: estateId as string, unitId }).unwrap();
                                          toast({ title: 'Unit vacated', description: `${name} has been removed from ${t.unitLabel || 'the unit'}.` });
                                        } catch {
                                          toast({ title: 'Failed to vacate unit', variant: 'destructive' });
                                        }
                                      }}
                                    >
                                      {clearingUnit ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Vacate'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center px-6 py-3 border-t">
                <div className="text-xs text-muted-foreground">
                  Page {tenantsData && 'page' in tenantsData ? tenantsData.page : page} of {tenantsData && 'total' in tenantsData && tenantsData.limit ? Math.ceil(tenantsData.total / tenantsData.limit) : '-'}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={tenantsData && 'total' in tenantsData ? page * (tenantsData.limit ?? limit) >= tenantsData.total : false}>Next</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Home className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No tenants yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-5">
                {tenantSearch ? `No tenants match "${tenantSearch}".` : 'Add a tenant to get started tracking occupancy and payments.'}
              </p>
              {!tenantSearch && (
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first tenant
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vacant Units Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vacant Units</CardTitle>
              <CardDescription>Available spaces ready for new tenants</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/dashboard/estate/${estateId}/add-unit`)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Unit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vacantLoading ? (
            <TableSkeleton
              rows={3}
              columns={4}
              headers={["Label", "Monthly Price", "Meter Number", "Actions"]}
            />
          ) : vacantUnits && vacantUnits.data?.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Meter Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacantUnits.data.map((u) => (
                    <TableRow key={u.unitId}>
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100">{u.label}</TableCell>
                      <TableCell>₦{u.monthlyPrice.toLocaleString()}</TableCell>
                      <TableCell>{u.meterNumber || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditFeesOpen(u)}
                          >
                            Edit Fees
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete unit <strong>{u.label}</strong>. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    await deleteUnit(u.unitId).unwrap();
                                    toast({ title: 'Unit deleted successfully' });
                                    refetchVacant();
                                    refetchEstate();
                                  } catch (err) {
                                    toast({
                                      title: 'Failed to delete unit',
                                      variant: 'destructive'
                                    });
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deletingUnit ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Delete Unit'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No vacant units yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-5">
                Add units to this estate so you can start assigning tenants and tracking occupancy.
              </p>
              <Button
                onClick={() => navigate(`/dashboard/estate/${estateId}/add-unit`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first unit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Unit Fees Modal */}
      <Dialog open={editFeesOpen} onOpenChange={setEditFeesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Unit Fees — {selectedUnitForFeesEdit?.label}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-monthly-price">Monthly Price (Rent)</Label>
              <Input
                id="edit-monthly-price"
                type="number"
                value={editMonthlyPrice}
                onChange={(e) => setEditMonthlyPrice(e.target.value)}
                placeholder="e.g., 250000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-service-charge">Monthly Service Charge</Label>
              <Input
                id="edit-service-charge"
                type="number"
                value={editServiceCharge}
                onChange={(e) => setEditServiceCharge(e.target.value)}
                placeholder="e.g., 12600"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-caution-fee">Caution Fee (One-time)</Label>
              <Input
                id="edit-caution-fee"
                type="number"
                value={editCautionFee}
                onChange={(e) => setEditCautionFee(e.target.value)}
                placeholder="e.g., 50000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-legal-fee">Legal Fee (One-time)</Label>
              <Input
                id="edit-legal-fee"
                type="number"
                value={editLegalFee}
                onChange={(e) => setEditLegalFee(e.target.value)}
                placeholder="e.g., 30000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditFeesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditFees} disabled={updatingUnit}>
              {updatingUnit ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
