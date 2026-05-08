import { Wrench, Phone, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onReportMaintenance: () => void;
  onGenerateVisitorPass: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onReportMaintenance,
  onGenerateVisitorPass,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button onClick={onReportMaintenance} variant="outline" className="h-16 flex flex-col items-center gap-1">
        <Wrench className="h-5 w-5" />
        <span className="text-xs">Report Issue</span>
      </Button>
      <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
        <Phone className="h-5 w-5" />
        <span className="text-xs">Contact Landlord</span>
      </Button>
      <Button onClick={onGenerateVisitorPass} variant="outline" className="h-16 flex flex-col items-center gap-1">
        <UserPlus className="h-5 w-5" />
        <span className="text-xs">Visitor Pass</span>
      </Button>
    </div>
  );
};
