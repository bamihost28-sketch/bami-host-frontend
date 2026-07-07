import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Feedback,
  useGetFeedbackQuery,
  useGetFeedbackStatsQuery,
  useRespondFeedbackMutation,
} from "@/services/feedbackApi";
import { Loader, MessageSquareHeart, Reply, Star } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "dismissed", label: "Dismissed" },
];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  reviewed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  dismissed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const CATEGORY_STYLES: Record<string, string> = {
  suggestion: "border-blue-300 text-blue-700 dark:text-blue-400",
  improvement: "border-teal-300 text-teal-700 dark:text-teal-400",
  feature_request: "border-purple-300 text-purple-700 dark:text-purple-400",
  complaint: "border-red-300 text-red-700 dark:text-red-400",
  praise: "border-green-300 text-green-700 dark:text-green-400",
  other: "border-slate-300 text-slate-600 dark:text-slate-400",
};

export const AdminFeedbackPanel = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading } = useGetFeedbackQuery(
    statusFilter === "all" ? { limit: 50 } : { status: statusFilter, limit: 50 }
  );
  const { data: statsData } = useGetFeedbackStatsQuery();
  const [respondFeedback, { isLoading: isResponding }] = useRespondFeedbackMutation();

  const [selected, setSelected] = useState<Feedback | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("reviewed");

  const items = data?.data ?? [];
  const stats = statsData?.data;

  const openRespond = (f: Feedback) => {
    setSelected(f);
    setResponse(f.admin_response || "");
    setNewStatus(f.status === "new" ? "reviewed" : f.status);
  };

  const handleRespond = async () => {
    if (!selected) return;
    try {
      await respondFeedback({
        id: selected.id,
        status: newStatus,
        ...(response.trim() ? { admin_response: response.trim() } : {}),
      }).unwrap();
      toast("Success: Response sent — the tenant has been notified");
      setSelected(null);
      setResponse("");
    } catch (err: any) {
      toast(`Error: ${err?.data?.detail || "Failed to update feedback"}`);
    }
  };

  const quickStatus = async (f: Feedback, status: string) => {
    try {
      await respondFeedback({ id: f.id, status }).unwrap();
      toast(`Success: Marked as ${status.replace("_", " ")}`);
    } catch (err: any) {
      toast(`Error: ${err?.data?.detail || "Failed to update status"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareHeart className="h-6 w-6 text-pink-500" /> Tenant Feedback
          </h2>
          <p className="text-slate-500">
            {stats ? `${stats.new ?? 0} new · ${stats.in_progress ?? 0} in progress · ${stats.total ?? 0} total` : "What tenants want and how the system can improve"}
          </p>
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {statusFilter === "all" ? "No feedback yet." : `No ${statusFilter.replace("_", " ")} feedback.`}
            </p>
          ) : (
            items.map((f) => (
              <div key={f.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-slate-900 dark:text-white">{f.subject}</p>
                      <Badge variant="outline" className={`capitalize ${CATEGORY_STYLES[f.category] || CATEGORY_STYLES.other}`}>
                        {f.category.replace("_", " ")}
                      </Badge>
                      {f.rating ? (
                        <span className="inline-flex items-center gap-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {f.rating}/5
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{f.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(f.created_at).toLocaleString()}
                      {f.submitted_by_role ? ` · from ${f.submitted_by_role}` : ""}
                    </p>
                    {f.admin_response && (
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1 whitespace-pre-wrap">
                        ↳ Response: {f.admin_response}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Badge className={`capitalize ${STATUS_STYLES[f.status] || STATUS_STYLES.new}`}>
                      {f.status.replace("_", " ")}
                    </Badge>
                    {f.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => quickStatus(f, "reviewed")} disabled={isResponding}>
                        Mark Reviewed
                      </Button>
                    )}
                    {(f.status === "reviewed" || f.status === "in_progress") && (
                      <Button size="sm" className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() => quickStatus(f, "done")} disabled={isResponding}>
                        Mark Done
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openRespond(f)}>
                      <Reply className="h-3.5 w-3.5 mr-1" /> Respond
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="font-medium text-sm text-slate-900 dark:text-white">{selected.subject}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTERS.filter((s) => s.value !== "all").map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Response to tenant</Label>
                <Textarea
                  placeholder="Thank them, explain what will happen next, or ask a follow-up question..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-slate-400">The tenant receives this as a notification.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={isResponding}>Cancel</Button>
            <Button onClick={handleRespond} disabled={isResponding}>
              {isResponding ? (<><Loader className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
