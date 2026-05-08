import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "./utils";

interface Complaint {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  status: string;
  response?: string;
}

interface ComplaintListProps {
  complaints: Complaint[];
}

export const ComplaintList: React.FC<ComplaintListProps> = ({ complaints }) => {
  if (complaints.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No complaints submitted yet.</p>;
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div key={complaint.id} className="p-4 border rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{complaint.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {complaint.category} • Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={`${getStatusColor(complaint.status)}`}>{complaint.status}</Badge>
          </div>
          {complaint.response && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm">
                <span className="text-slate-500 dark:text-slate-400">Response: </span>
                {complaint.response}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
