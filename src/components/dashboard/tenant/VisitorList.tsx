import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "./utils";
import { Button } from "@/components/ui/button";

interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  status: string;
  expectedArrival: string;
  accessCode?: string;
}

interface VisitorListProps {
  visitors: Visitor[];
  showPendingActions?: boolean;
}

export const VisitorList: React.FC<VisitorListProps> = ({ visitors, showPendingActions = false }) => {
  const filteredVisitors = showPendingActions 
    ? visitors.filter(v => v.status === "pending")
    : visitors;

  if (filteredVisitors.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No visitors found.</p>;
  }

  return (
    <div className="space-y-3">
      {filteredVisitors.map((visitor) => (
        <div key={visitor.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{visitor.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {visitor.phone} • {visitor.purpose}
            </p>
          </div>
          {showPendingActions ? (
            <div className="flex gap-2">
              <Button size="sm">Approve</Button>
              <Button size="sm" variant="outline">Reject</Button>
            </div>
          ) : (
            <div className="text-right">
              <Badge className={`${getStatusColor(visitor.status)}`}>
                {visitor.status}
              </Badge>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{visitor.accessCode}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
