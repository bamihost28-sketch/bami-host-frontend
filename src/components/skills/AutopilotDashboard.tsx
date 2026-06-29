import { useState } from "react";
import {
  Bot, Zap, Play, X, Copy, CheckCircle, Loader2, RefreshCw,
  Megaphone, DollarSign, Settings2, TrendingUp, Users, Palette,
  MessageCircle, Instagram, Facebook, Mail, Smartphone, FileText,
  ChevronDown, ChevronUp, Send, Clock, BarChart3, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetQueueQuery,
  useGetStatsQuery,
  useGenerateActionsMutation,
  useExecuteActionMutation,
  useDismissActionMutation,
  useGenerateContentMutation,
  type AutopilotAction,
} from "@/services/autopilotApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILL_ICON: Record<string, React.ElementType> = {
  marketer: Megaphone,
  finance: DollarSign,
  operations: Settings2,
  sales: TrendingUp,
  hr: Users,
  designer: Palette,
};

const SKILL_COLOR: Record<string, string> = {
  marketer:   "bg-orange-100 text-orange-700 border-orange-200",
  finance:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  operations: "bg-slate-100 text-slate-700 border-slate-200",
  sales:      "bg-green-100 text-green-700 border-green-200",
  hr:         "bg-indigo-100 text-indigo-700 border-indigo-200",
  designer:   "bg-purple-100 text-purple-700 border-purple-200",
};

const PRIORITY_COLOR: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-slate-100 text-slate-600",
};

const PLATFORM_ICON: Record<string, React.ElementType> = {
  whatsapp:  MessageCircle,
  instagram: Instagram,
  facebook:  Facebook,
  email:     Mail,
  sms:       Smartphone,
  twitter:   FileText,
  internal:  FileText,
};

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp:  "WhatsApp",
  instagram: "Instagram",
  facebook:  "Facebook",
  email:     "Email",
  sms:       "SMS",
  twitter:   "Twitter / X",
  internal:  "Internal",
};

const ACTION_TYPE_LABEL: Record<string, string> = {
  whatsapp_blast:   "WhatsApp Blast",
  instagram_post:   "Instagram Post",
  facebook_post:    "Facebook Post",
  payment_reminder: "Payment Reminder",
  follow_up:        "Lead Follow-up",
  maintenance_plan: "Maintenance Plan",
  daily_briefing:   "Daily Briefing",
  email_campaign:   "Email Campaign",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ action, onExecute, onDismiss }: {
  action: AutopilotAction;
  onExecute: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const SkillIcon = SKILL_ICON[action.skill] ?? Bot;
  const PlatformIcon = PLATFORM_ICON[action.platform ?? "internal"] ?? FileText;
  const isMessaging = ["whatsapp", "sms"].includes(action.platform ?? "");
  const isDone = action.status === "done";

  const copy = () => {
    if (action.content) {
      navigator.clipboard.writeText(action.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openPlatform = () => {
    if (action.platform === "instagram") window.open("https://www.instagram.com", "_blank");
    if (action.platform === "facebook")  window.open("https://www.facebook.com", "_blank");
    if (action.platform === "twitter")   window.open("https://twitter.com", "_blank");
  };

  return (
    <Card className={`border transition-all ${isDone ? "opacity-60" : ""} ${
      action.priority === "high" ? "border-l-4 border-l-red-400" :
      action.priority === "medium" ? "border-l-4 border-l-yellow-400" : ""
    }`}>
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg flex-shrink-0 ${SKILL_COLOR[action.skill] ?? "bg-slate-100"}`}>
              <SkillIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{action.title}</p>
                {action.platform && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <PlatformIcon className="h-3 w-3" />
                    {PLATFORM_LABEL[action.platform] ?? action.platform}
                  </Badge>
                )}
                <Badge className={`text-xs ${PRIORITY_COLOR[action.priority] ?? ""}`}>
                  {action.priority}
                </Badge>
                {isDone && <Badge className="text-xs bg-green-100 text-green-700">Done</Badge>}
              </div>
              <p className="text-xs text-slate-500">{action.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setExpanded(e => !e)} className="p-1 opacity-40 hover:opacity-100">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {!isDone && (
              <button onClick={() => onDismiss(action.id)} className="p-1 opacity-40 hover:opacity-100 text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && action.content && (
          <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border">
            {action.content}
          </div>
        )}

        {/* Recipients */}
        {expanded && action.recipients?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {action.recipients.slice(0, 5).map((r, i) => (
              <Badge key={i} variant="outline" className="text-xs">{r.name}</Badge>
            ))}
            {action.recipients.length > 5 && (
              <Badge variant="outline" className="text-xs">+{action.recipients.length - 5} more</Badge>
            )}
          </div>
        )}

        {/* Actions row */}
        {!isDone && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {/* Copy content */}
            {action.content && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={copy}>
                {copied ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}

            {/* Open platform */}
            {["instagram", "facebook", "twitter"].includes(action.platform ?? "") && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openPlatform}>
                <PlatformIcon className="h-3 w-3 mr-1" />
                Open {PLATFORM_LABEL[action.platform ?? ""]}
              </Button>
            )}

            {/* Execute (send) */}
            {isMessaging && action.recipients?.length > 0 && (
              <Button
                size="sm"
                className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onExecute(action.id)}
              >
                <Send className="h-3 w-3 mr-1" />
                Send Now ({action.recipients.length})
              </Button>
            )}

            {/* Mark done for non-messaging */}
            {!isMessaging && (
              <Button
                size="sm"
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onExecute(action.id)}
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Mark Done
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Content Generator ────────────────────────────────────────────────────────

function ContentGenerator() {
  const { toast } = useToast();
  const [platform, setPlatform] = useState("whatsapp");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [generateContent, { isLoading }] = useGenerateContentMutation();

  const generate = async () => {
    if (!topic.trim()) { toast({ title: "Enter a topic first" }); return; }
    try {
      const res = await generateContent({ platform, topic, context }).unwrap();
      setResult(res.content);
    } catch {
      toast({ title: "Generation failed", description: "Try again", variant: "destructive" });
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPlatform = () => {
    if (platform === "instagram") window.open("https://www.instagram.com", "_blank");
    if (platform === "facebook")  window.open("https://www.facebook.com", "_blank");
    if (platform === "twitter")   window.open("https://twitter.com", "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" /> AI Content Generator
        </CardTitle>
        <p className="text-xs text-slate-500">Generate any post, message, or caption on demand</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["whatsapp", "instagram", "facebook", "twitter", "email", "sms"].map(p => (
                  <SelectItem key={p} value={p}>{PLATFORM_LABEL[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">What do you want to post about?</Label>
            <Input
              placeholder="e.g. 2-bed flat in Lekki, ₦250k/yr, available now"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Extra context (optional)</Label>
          <Input
            placeholder="e.g. gate house, 24hr light, 10 mins from Lekki toll gate"
            value={context}
            onChange={e => setContext(e.target.value)}
            className="h-9"
          />
        </div>
        <Button onClick={generate} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Zap className="h-4 w-4 mr-2" /> Generate</>}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4 text-sm whitespace-pre-wrap border">
              {result}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              {["instagram", "facebook", "twitter"].includes(platform) && (
                <Button size="sm" variant="outline" onClick={openPlatform}>
                  Open {PLATFORM_LABEL[platform]} <Play className="h-3 w-3 ml-1" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={generate} disabled={isLoading}>
                <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AutopilotDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("queue");
  const [filterSkill, setFilterSkill] = useState("all");

  const { data: queueData, isLoading: queueLoading, refetch } = useGetQueueQuery({ status: "all" });
  const { data: stats } = useGetStatsQuery();
  const [generateActions, { isLoading: generating }] = useGenerateActionsMutation();
  const [executeAction, { isLoading: executing }] = useExecuteActionMutation();
  const [dismissAction] = useDismissActionMutation();

  const actions = queueData?.data ?? [];
  const pending  = actions.filter(a => a.status === "pending");
  const done     = actions.filter(a => a.status === "done");

  const filtered = (list: AutopilotAction[]) =>
    filterSkill === "all" ? list : list.filter(a => a.skill === filterSkill);

  const handleGenerate = async () => {
    try {
      const res = await generateActions().unwrap();
      toast({ title: `Autopilot activated`, description: `${res.generated} actions generated by AI` });
      refetch();
    } catch {
      toast({ title: "Generation failed", description: "Check your API key or try again", variant: "destructive" });
    }
  };

  const handleExecute = async (id: string) => {
    try {
      const res = await executeAction({ id }).unwrap();
      toast({
        title: res.success ? "Action executed" : "Noted",
        description: res.success ? "Done successfully" : "Marked as complete",
      });
    } catch {
      toast({ title: "Execute failed", variant: "destructive" });
    }
  };

  const handleDismiss = async (id: string) => {
    await dismissAction(id);
    toast({ title: "Action dismissed" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Bot className="h-7 w-7 text-white" />
            </div>
            Business Autopilot
          </h1>
          <p className="text-slate-500 mt-1">Your AI runs your business — posts, reminders, follow-ups, and more</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> AI is scanning your business...</>
            : <><Zap className="h-4 w-4 mr-2" /> Run Autopilot Now</>
          }
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Clock}     label="Pending Actions" value={stats?.pending ?? 0}   color="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle} label="Completed"    value={stats?.done ?? 0}       color="bg-green-100 text-green-600" />
        <StatCard icon={BarChart3} label="Total Generated" value={stats?.total ?? 0}    color="bg-purple-100 text-purple-600" />
        <StatCard icon={Zap}       label="Skills Active"  value={Object.keys(stats?.by_skill ?? {}).length} color="bg-orange-100 text-orange-600" />
      </div>

      {/* Empty state */}
      {!queueLoading && actions.length === 0 && (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
              <Bot className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Autopilot is ready</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Click <strong>Run Autopilot Now</strong> and your AI will scan your business — vacant units, overdue tenants,
              pending enquiries, open issues — and generate ready-to-execute actions with content already written.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              {generating ? "Scanning your business..." : "Run Autopilot Now"}
            </Button>
          </CardContent>
        </Card>
      )}

      {actions.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="queue">
                Pending <Badge className="ml-1 text-xs bg-blue-100 text-blue-700">{pending.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="done">
                Done <Badge className="ml-1 text-xs bg-green-100 text-green-700">{done.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="generate">Content Studio</TabsTrigger>
            </TabsList>

            {/* Skill filter */}
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All skills</SelectItem>
                {["marketer", "finance", "sales", "operations", "hr", "designer"].map(s => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="queue" className="mt-4 space-y-3">
            {queueLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
             filtered(pending).length === 0 ? (
              <Card><CardContent className="py-10 text-center">
                <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <p className="text-slate-500">No pending actions. Run Autopilot to generate new ones.</p>
              </CardContent></Card>
            ) : (
              filtered(pending).map(a => (
                <ActionCard key={a.id} action={a} onExecute={handleExecute} onDismiss={handleDismiss} />
              ))
            )}
          </TabsContent>

          <TabsContent value="done" className="mt-4 space-y-3">
            {filtered(done).length === 0 ? (
              <p className="text-center text-slate-500 py-8">No completed actions yet.</p>
            ) : (
              filtered(done).map(a => (
                <ActionCard key={a.id} action={a} onExecute={handleExecute} onDismiss={handleDismiss} />
              ))
            )}
          </TabsContent>

          <TabsContent value="generate" className="mt-4">
            <ContentGenerator />
          </TabsContent>
        </Tabs>
      )}

      {/* Content Studio always available */}
      {actions.length === 0 && (
        <ContentGenerator />
      )}
    </div>
  );
}
