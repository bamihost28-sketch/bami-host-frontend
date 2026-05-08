import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "./utils";

interface Document {
  id: string;
  name: string;
  date: string;
}

interface DocumentListProps {
  documents: Document[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  if (documents.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No documents available.</p>;
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium">{doc.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(doc.date)}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      ))}
    </div>
  );
};
