import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/skeletons';

import { formatDate } from '@/utils/propertyUtils';

interface TenancyHistoryCardProps {
  history: any[];
  isLoading: boolean;
}

export const TenancyHistoryCard = ({ history, isLoading }: TenancyHistoryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenancy History</CardTitle>
        <CardDescription>Lifecycle events for this tenant</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton
            rows={3}
            columns={3}
            headers={["Date", "Action", "Notes"]}
          />
        ) : history && history.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{formatDate(h.date)}</TableCell>
                    <TableCell className="font-medium">{h.action}</TableCell>
                    <TableCell>{h.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No history.</div>
        )}
      </CardContent>
    </Card>
  );
};
