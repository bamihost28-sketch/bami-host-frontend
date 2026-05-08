import { Bell, AlertTriangle, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "./utils";

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
}

interface NoticeCardProps {
  notices: Notice[];
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notices }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-slate-900 dark:text-white">Estate Notices & Announcements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notices.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No notices at this time.</p>
        )}
        {notices.map((notice) => (
          <div key={notice.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {notice.type === "important" ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                ) : notice.type === "event" ? (
                  <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                ) : (
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{notice.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{notice.content}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{formatDate(notice.date)}</p>
                </div>
              </div>
              <Badge variant="outline">{notice.type}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
