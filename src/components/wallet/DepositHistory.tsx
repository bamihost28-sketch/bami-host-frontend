import React, { useState } from 'react';
import { useGetMyDepositsQuery, BankDeposit } from '../../services/bankDepositsApi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, ExternalLink } from 'lucide-react';

const STATUS_STYLES: Record<BankDeposit['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const DepositHistory: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetMyDepositsQuery({ page, limit: 10 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const deposits = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">My Deposit Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {deposits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No deposit requests yet.</p>
        ) : (
          <div className="divide-y">
            {deposits.map((dep) => (
              <div key={dep._id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">₦{dep.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(dep.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  {dep.adminNote && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">"{dep.adminNote}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[dep.status]}`}>
                    {dep.status}
                  </span>
                  <a href={dep.proofImageUrl} target="_blank" rel="noopener noreferrer" title="View proof image">
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {(data?.pages ?? 1) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">Page {page} of {data?.pages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button size="sm" variant="outline" disabled={page >= (data?.pages ?? 1) || isFetching} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
