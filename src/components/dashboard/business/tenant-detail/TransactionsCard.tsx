import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Download, Mail, Loader2, Filter, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  useLazyDownloadPaymentReceiptQuery,
  useResendPaymentReceiptMutation,
  useGetAdminPaymentsQuery,
} from '@/services/estatesApi';
import { TableSkeleton } from '@/components/ui/skeletons';
import { PaymentCollectionDialog } from './PaymentCollectionDialog';
import { formatDate, formatCurrency, STATUS_COLORS } from '@/utils/propertyUtils';

interface TransactionsCardProps {
  tenantId?: string;
  overview: any;
  tenant: any;
  billingData: any;
}

export const TransactionsCard = ({ tenantId, overview, tenant, billingData }: TransactionsCardProps) => {
  const navigate = useNavigate();
  const [payOpen, setPayOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    paymentMethod: '',
    from: '',
    to: '',
  });

  const [triggerDownload, { isFetching: isDownloading }] = useLazyDownloadPaymentReceiptQuery();
  const [resendEmail, { isLoading: isEmailing }] = useResendPaymentReceiptMutation();

  const limit = 20;
  const queryParams = {
    page,
    limit,
    ...(tenantId ? { tenantId } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
  };

  const { data, isLoading, isFetching } = useGetAdminPaymentsQuery(queryParams);

  const transactions = data?.data ?? [];
  const summary = data?.summary;
  const totalPages = data?.pagination?.totalPages ?? 1;
  const total = data?.pagination?.totalItems ?? 0;

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', type: '', status: '', paymentMethod: '', from: '', to: '' });
    setPage(1);
  };

  const handleDownload = async (paymentId: string) => {
    try {
      const result = await triggerDownload(paymentId).unwrap();
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', result.filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: 'Success', description: 'Receipt download started.' });
    } catch {
      toast({ title: 'Download Failed', description: 'Could not generate PDF receipt.', variant: 'destructive' });
    }
  };

  const handleEmail = async (paymentId: string) => {
    try {
      await resendEmail(paymentId).unwrap();
      toast({ title: 'Email Sent', description: 'Receipt has been resent to tenant email.' });
    } catch {
      toast({ title: 'Email Failed', description: 'Could not resend email receipt.', variant: 'destructive' });
    }
  };

  const isCompleted = (status: string) =>
    status === 'completed' || status === 'success';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Payments and charges</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full inline-block" />}
            </Button>
            <PaymentCollectionDialog
              tenantId={tenantId}
              overview={overview}
              tenant={tenant}
              billingData={billingData}
              open={payOpen}
              onOpenChange={setPayOpen}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary strip */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 border">
              <p className="text-xs text-muted-foreground">Total collected</p>
              <p className="text-lg font-semibold">{formatCurrency(summary.completedAmount)}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">{formatCurrency(summary.pendingAmount)}</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-lg font-semibold text-red-700 dark:text-red-400">{summary.failedCount} transactions</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 border">
              <p className="text-xs text-muted-foreground">Total records</p>
              <p className="text-lg font-semibold">{summary.totalCount}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenant, unit, email, or reference..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <Select value={filters.type} onValueChange={(v) => setFilter('type', v)}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="service_charge">Service charge</SelectItem>
                  <SelectItem value="caution_fee">Caution fee</SelectItem>
                  <SelectItem value="legal_fee">Legal fee</SelectItem>
                  <SelectItem value="initial">Initial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Select value={filters.status} onValueChange={(v) => setFilter('status', v)}>
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Payment method</p>
              <Select value={filters.paymentMethod} onValueChange={(v) => setFilter('paymentMethod', v)}>
                <SelectTrigger><SelectValue placeholder="All methods" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All methods</SelectItem>
                  <SelectItem value="paystack">Paystack</SelectItem>
                  <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <Input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <Input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <TableSkeleton
            rows={4}
            columns={6}
            headers={['Date', 'Tenant', 'Type', 'Method', 'Status', 'Amount']}
          />
        ) : transactions.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tenant / Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id ?? t.reference} className={isFetching ? 'opacity-60' : ''}>
                    <TableCell className="whitespace-nowrap">{formatDate(t.paymentDate || t.createdAt)}</TableCell>
                    <TableCell>
                      <p className="font-medium leading-tight">{t.tenant?.name || '—'}</p>
                      {(t.tenant?.unit || t.estate?.name) && (
                        <p className="text-xs text-muted-foreground">{[t.tenant?.unit, t.estate?.name].filter(Boolean).join(' · ')}</p>
                      )}
                    </TableCell>
                    <TableCell className="font-medium capitalize">{t.paymentType?.replace(/_/g, ' ') || '—'}</TableCell>
                    <TableCell className="capitalize text-sm">{t.paymentMethod?.replace(/_/g, ' ') || '—'}</TableCell>
                    <TableCell>
                      {t.paymentStatus ? (
                        <Badge className={`text-xs ${STATUS_COLORS[t.paymentStatus] ?? 'bg-slate-100 text-slate-700'}`}>
                          {t.paymentStatus}
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">
                      {formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => navigate(`/dashboard/payment/success?reference=${t.reference}`)}
                          title="View Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        {isCompleted(t.paymentStatus) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDownload(t.reference || t.id)}
                              disabled={isDownloading}
                              title="Download PDF"
                            >
                              {isDownloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEmail(t.reference || t.id)}
                              disabled={isEmailing}
                              title="Resend Email"
                            >
                              {isEmailing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">No transactions found.</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              {total > 0
                ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`
                : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || isFetching} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
