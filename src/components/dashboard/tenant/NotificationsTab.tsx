import { Bell, CheckCheck, Trash2, CreditCard, ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
  useDeleteNotificationMutation,
  Notification,
} from "@/services/notificationsApi";

function getNotificationIcon(type?: string, message?: string) {
  const text = (type ?? "") + (message ?? "").toLowerCase();
  if (text.includes("payment") || text.includes("rent")) return <CreditCard className="h-5 w-5 text-green-600" />;
  if (text.includes("deposit") || text.includes("credit")) return <ArrowDownRight className="h-5 w-5 text-blue-500" />;
  if (text.includes("withdraw") || text.includes("debit")) return <ArrowUpRight className="h-5 w-5 text-orange-500" />;
  return <Info className="h-5 w-5 text-slate-400" />;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationRow({ notification }: { notification: Notification }) {
  const id = notification._id ?? notification.id;
  const [markRead, { isLoading: isMarking }] = useMarkReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
        notification.isRead
          ? "border-slate-200 dark:border-slate-700 bg-transparent"
          : "border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10"
      }`}
    >
      <div className="mt-0.5 shrink-0">{getNotificationIcon(notification.type, notification.message)}</div>
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className={`text-sm font-medium truncate ${notification.isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"}`}>
            {notification.title}
          </p>
        )}
        <p className={`text-sm ${notification.title ? "text-slate-500 dark:text-slate-400" : notification.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-800 dark:text-slate-200 font-medium"}`}>
          {notification.message}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!notification.isRead && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => markRead(id)}
            disabled={isMarking}
            title="Mark as read"
          >
            <CheckCheck className="h-4 w-4 text-blue-500" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 hover:text-red-500"
          onClick={() => deleteNotification(id)}
          disabled={isDeleting}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export const NotificationsTab: React.FC = () => {
  const { data, isLoading, isError } = useGetNotificationsQuery();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg text-slate-900 dark:text-white">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">{unreadCount} new</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={() => markAllRead()} disabled={isMarkingAll}>
            <CheckCheck className="h-4 w-4 mr-1.5" />
            {isMarkingAll ? "Marking..." : "Mark all read"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        )}
        {isError && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            Failed to load notifications. Please try again.
          </p>
        )}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-slate-400 dark:text-slate-500">
            <Bell className="h-10 w-10 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
        {!isLoading && !isError && notifications.map((notification) => (
          <NotificationRow key={notification._id ?? notification.id} notification={notification} />
        ))}
      </CardContent>
    </Card>
  );
};
