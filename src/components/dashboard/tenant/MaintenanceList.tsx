import { Badge } from "@/components/ui/badge";
import { Droplets, Zap, AirVent, Shield, SprayCan, Wrench } from "lucide-react";
import { getStatusColor } from "./utils";

interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  status: string;
  assignedTo?: string;
  estimatedCompletion?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "plumbing":
      return Droplets;
    case "electrical":
      return Zap;
    case "ac_repair":
      return AirVent;
    case "security":
      return Shield;
    case "cleaning":
      return SprayCan;
    default:
      return Wrench;
  }
};

interface MaintenanceListProps {
  requests: MaintenanceRequest[];
}

export const MaintenanceList: React.FC<MaintenanceListProps> = ({ requests }) => {
  if (requests.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No maintenance requests yet.</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const Icon = getCategoryIcon(request.category);
        return (
          <div key={request.id} className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Icon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Category: {request.category.replace("_", " ")} •{" "}
                      Submitted: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(request.status)}`}>
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
                {request.assignedTo && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Assigned Technician: </span>
                      <span className="font-medium">{request.assignedTo}</span>
                    </p>
                    {request.estimatedCompletion && (
                      <p className="text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Est. Completion: </span>
                        <span className="font-medium">{new Date(request.estimatedCompletion).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
