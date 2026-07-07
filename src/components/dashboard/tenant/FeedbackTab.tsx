import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/providers/ToastProvider";
import { useCreateFeedbackMutation, useGetFeedbackQuery } from "@/services/feedbackApi";
import { Loader, MessageSquareHeart, Star, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "suggestion", label: "Suggestion" },
  { value: "improvement", label: "Improvement" },
  { value: "feature_request", label: "Feature Request" },
  { value: "complaint", label: "Complaint" },
  { value: "praise", label: "Praise" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  reviewed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  dismissed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  in_progress: "In Progress",
  done: "Done",
  dismissed: "Dismissed",
};

export const FeedbackTab = () => {
  const { toast } = useToast();
  const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();
  const { data, isLoading } = useGetFeedbackQuery();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("suggestion");
  const [rating, setRating] = useState<number>(0);

  const items = data?.data ?? [];

  const handleSubmit = async () => {
    if (!subject.trim()) { toast("Error: Subject is required"); return; }
    if (!message.trim()) { toast("Error: Please describe your feedback"); return; }
    try {
      await createFeedback({
        subject: subject.trim(),
        message: message.trim(),
        category,
        ...(rating ? { rating } : {}),
      }).unwrap();
      toast("Success: Thank you! Your feedback has been sent to management");
      setSubject(""); setMessage(""); setCategory("suggestion"); setRating(0);
    } catch (err: any) {
      toast(`Error: ${err?.data?.detail || err?.data?.message || "Failed to submit feedback"}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquareHeart className="h-5 w-5 text-pink-500" />
            Share Your Feedback
          </CardTitle>
          <CardDescription>
            Tell us what you want or what we can improve — management reads every submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input
                placeholder="What is this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Your feedback *</Label>
            <Textarea
              placeholder="Describe what you'd like to see, what's not working well, or any idea that would make things better..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label>How satisfied are you overall? <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n === rating ? 0 : n)}
                  className="p-0.5"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      n <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-slate-500">{rating}/5</span>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : (
                "Send Feedback"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">My Feedback</CardTitle>
          <CardDescription>Your previous submissions and management's responses</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              You haven't sent any feedback yet.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((f) => (
                <div key={f.id} className="border rounded-lg p-3 space-y-2 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{f.subject}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {f.category.replace("_", " ")} · {new Date(f.created_at).toLocaleDateString()}
                        {f.rating ? ` · ${f.rating}/5 ★` : ""}
                      </p>
                    </div>
                    <Badge className={STATUS_STYLES[f.status] || STATUS_STYLES.new}>
                      {STATUS_LABELS[f.status] || f.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{f.message}</p>
                  {f.admin_response && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2.5">
                      <p className="text-xs font-semibold text-green-800 dark:text-green-300 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Management responded
                      </p>
                      <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{f.admin_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
