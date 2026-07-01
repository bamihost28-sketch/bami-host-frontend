import { useState } from "react";
import {
  Bot, Zap, Play, X, Copy, CheckCircle, Loader2, RefreshCw,
  Megaphone, DollarSign, Settings2, TrendingUp, Users, Palette,
  MessageCircle, Instagram, Facebook, Mail, Smartphone, FileText,
  ChevronDown, ChevronUp, Send, Clock, BarChart3, Plus, SlidersHorizontal, Sparkles
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
  useGetAgentsQuery,
  useGenerateActionsMutation,
  useExecuteActionMutation,
  useDismissActionMutation,
  useGenerateContentMutation,
  useGetEmailProspectsQuery,
  useSendEmailCampaignMutation,
  useGetAutopilotSettingsQuery,
  useUpdateAutopilotSettingsMutation,
  useRunAutoExecuteMutation,
  useSendTenantBroadcastMutation,
  useSendPaymentLinksMutation,
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
  retention: RefreshCw,
  collections: Clock,
  analyst: BarChart3,
  compliance: FileText,
};

const SKILL_COLOR: Record<string, string> = {
  marketer:   "bg-orange-100 text-orange-700 border-orange-200",
  finance:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  operations: "bg-slate-100 text-slate-700 border-slate-200",
  sales:      "bg-green-100 text-green-700 border-green-200",
  hr:         "bg-indigo-100 text-indigo-700 border-indigo-200",
  designer:   "bg-purple-100 text-purple-700 border-purple-200",
  retention:  "bg-teal-100 text-teal-700 border-teal-200",
  collections:"bg-red-100 text-red-700 border-red-200",
  analyst:    "bg-blue-100 text-blue-700 border-blue-200",
  compliance: "bg-amber-100 text-amber-700 border-amber-200",
};

const PRIORITY_COLOR: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-slate-100 text-slate-600",
};

const PLATFORM_ICON: Record<string, React.ElementType> = {
  telegram:  MessageCircle,
  whatsapp:  MessageCircle,   // legacy compat
  instagram: Instagram,
  facebook:  Facebook,
  email:     Mail,
  sms:       Smartphone,
  twitter:   FileText,
  internal:  FileText,
};

const PLATFORM_LABEL: Record<string, string> = {
  telegram:  "Telegram",
  whatsapp:  "Telegram",     // legacy compat
  instagram: "Instagram",
  facebook:  "Facebook",
  email:     "Email",
  sms:       "SMS",
  twitter:   "Twitter / X",
  internal:  "Internal",
};

const ACTION_TYPE_LABEL: Record<string, string> = {
  telegram_blast:   "Telegram Blast",
  whatsapp_blast:   "Telegram Blast",   // legacy compat
  instagram_post:   "Instagram Post",
  facebook_post:    "Facebook Post",
  payment_reminder: "Payment Reminder",
  follow_up:        "Lead Follow-up",
  maintenance_plan: "Maintenance Plan",
  daily_briefing:   "Daily Briefing",
  email_campaign:   "Email Campaign",
  renewal_offer:    "Renewal Offer",
  collections_notice: "Collections Notice",
  weekly_report:    "Weekly Report",
  compliance_alert: "Compliance Alert",
  hiring_recommendation: "Hiring Recommendation",
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
  const isMessaging = ["telegram", "whatsapp", "sms"].includes(action.platform ?? "");
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

        {/* AI-designed marketing graphic (from the background Designer agent) */}
        {action.image_url && (
          <div className="mt-3">
            <img
              src={action.image_url}
              alt="AI-designed marketing graphic"
              className="rounded-lg border max-h-64 w-auto object-contain bg-white"
            />
            <p className="mt-1 text-xs text-purple-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Designed automatically by your AI Designer
            </p>
          </div>
        )}

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
  const [platform, setPlatform] = useState("telegram");
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
                {["telegram", "instagram", "facebook", "twitter", "email", "sms"].map(p => (
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

function BroadcastTab() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sendBroadcast, { isLoading: broadcasting }] = useSendTenantBroadcastMutation();
  const [sendPaymentLinks, { isLoading: sendingLinks }] = useSendPaymentLinksMutation();

  const handleBroadcast = async () => {
    if (!message.trim()) { toast({ title: "Enter a message", variant: "destructive" }); return; }
    try {
      const res = await sendBroadcast({ message }).unwrap();
      toast({ title: `Sent to ${res.sent} tenants via Telegram` });
      setMessage("");
    } catch {
      toast({ title: "Broadcast failed", variant: "destructive" });
    }
  };

  const handlePaymentLinks = async () => {
    try {
      const res = await sendPaymentLinks().unwrap();
      toast({ title: `Payment links sent to ${res.telegram_sent} overdue tenants` });
    } catch {
      toast({ title: "Failed to send payment links", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      {/* Telegram blast */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-600" /> Telegram Broadcast to All Tenants
          </CardTitle>
          <p className="text-xs text-slate-500">Sends to all tenants who have connected the Telegram bot (/tenant)</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            placeholder="Type your message here. Supports *bold* and _italic_ Markdown.&#10;&#10;Example: 🏠 Dear tenants, our office will be closed on 25 Dec. Happy holidays!"
          />
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            onClick={handleBroadcast} disabled={broadcasting || !message.trim()}>
            {broadcasting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Telegram Broadcast
          </Button>
        </CardContent>
      </Card>

      {/* Payment links */}
      <Card className="border-amber-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-600" /> Send Payment Links to Overdue Tenants
          </CardTitle>
          <p className="text-xs text-slate-500">
            Generates a Paystack payment link for each overdue tenant and sends it via Telegram.
            Requires PAYSTACK_SECRET_KEY in environment.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 w-full"
            onClick={handlePaymentLinks} disabled={sendingLinks}>
            {sendingLinks ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}
            Send Payment Links Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


const AUTO_EXECUTE_OPTIONS = [
  { type: "follow_up",          label: "Sales Follow-Up (Telegram)",     desc: "Auto-send follow-up messages to new enquiries via Telegram" },
  { type: "rent_reminder",      label: "Rent Reminder (Telegram)",       desc: "Auto-send rent reminders to overdue tenants via Telegram" },
  { type: "vacancy_blast",      label: "Vacancy Telegram Blast",         desc: "Auto-blast vacancies to prospects when a unit becomes vacant" },
  { type: "vendor_notification",label: "Vendor Notifications",           desc: "Auto-notify vendors when a matching issue is reported" },
  { type: "welcome_message",    label: "Tenant Welcome (Telegram)",      desc: "Auto-send welcome Telegram message when a new tenant is added" },
  { type: "lease_renewal",      label: "Lease Renewal Reminder",         desc: "Auto-send renewal offer when lease expires within 30 days" },
];

function AutopilotSettingsTab() {
  const { toast } = useToast();
  const { data: settingsData, isLoading } = useGetAutopilotSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateAutopilotSettingsMutation();
  const [runAutoExecute, { isLoading: running }] = useRunAutoExecuteMutation();

  const currentTypes: string[] = settingsData?.auto_execute_types ?? [];

  const toggle = async (type: string) => {
    const next = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    await updateSettings({ auto_execute_types: next });
  };

  const handleRun = async () => {
    try {
      const res = await runAutoExecute().unwrap();
      toast({ title: `Auto-executed ${res.executed} of ${res.total_eligible} eligible actions` });
    } catch {
      toast({ title: "Auto-run failed", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="py-10 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6">
      {/* Master toggle */}
      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">Autopilot Enabled</p>
            <p className="text-xs text-slate-500">Turns on/off all AI action generation</p>
          </div>
          <button
            onClick={() => updateSettings({ enabled: !settingsData?.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settingsData?.enabled ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsData?.enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </CardContent>
      </Card>

      {/* Auto-execute types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" /> Auto-Execute Without Approval
          </CardTitle>
          <p className="text-xs text-slate-500">These actions will execute automatically when triggered — no human review needed.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {AUTO_EXECUTE_OPTIONS.map(opt => (
            <div key={opt.type} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => toggle(opt.type)}>
              <button
                className={`mt-0.5 relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${currentTypes.includes(opt.type) ? "bg-blue-600" : "bg-slate-300"}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentTypes.includes(opt.type) ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "notify_high_priority" as const, label: "Notify me for high-priority actions", desc: "Get in-app alerts for urgent items" },
            { key: "notify_all" as const, label: "Notify me for all actions", desc: "Get alerts for every AI action generated" },
            { key: "daily_scan_enabled" as const, label: "Daily 7am scan", desc: "AI scans your business every morning and generates fresh actions" },
          ].map(item => (
            <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => updateSettings({ [item.key]: !settingsData?.[item.key] })}>
              <button className={`mt-0.5 relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${settingsData?.[item.key] ? "bg-blue-600" : "bg-slate-300"}`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settingsData?.[item.key] ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Manual run */}
      <div className="flex gap-3">
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white" onClick={handleRun} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Run Auto-Execute Now
        </Button>
        <Button variant="outline" onClick={() => updateSettings({ auto_execute_types: currentTypes })} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Settings
        </Button>
      </div>
    </div>
  );
}


function EmailCampaignTab() {
  const { toast } = useToast();
  const { data: prospectsData } = useGetEmailProspectsQuery();
  const [sendCampaign, { isLoading: sending }] = useSendEmailCampaignMutation();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiPersonalize, setAiPersonalize] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{sent:number;failed:number;total:number} | null>(null);

  const prospects = prospectsData?.prospects ?? [];

  const toggleAll = () => {
    if (selectedEmails.size === prospects.length) setSelectedEmails(new Set());
    else setSelectedEmails(new Set(prospects.map(p => p.email)));
  };

  const handleSend = async () => {
    if (!subject || !body || selectedEmails.size === 0) {
      toast({ title: "Fill in subject, body, and select recipients", variant: "destructive" });
      return;
    }
    const recipients = prospects
      .filter(p => selectedEmails.has(p.email))
      .map(p => ({ name: p.name, email: p.email }));

    try {
      const res = await sendCampaign({ subject, body, recipients, ai_personalize: aiPersonalize }).unwrap();
      setResult(res);
      toast({ title: `Campaign sent! ${res.sent} delivered, ${res.failed} failed.` });
    } catch {
      toast({ title: "Campaign failed. Check email configuration.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      {result && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex gap-4">
          <div className="text-center"><p className="text-2xl font-bold text-green-700">{result.sent}</p><p className="text-xs text-green-600">Delivered</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-red-600">{result.failed}</p><p className="text-xs text-slate-500">Failed</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-slate-700">{result.total}</p><p className="text-xs text-slate-500">Total</p></div>
          <button onClick={() => setResult(null)} className="ml-auto text-slate-400 text-xs">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Compose */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Compose Campaign</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Available 3-bedroom apartment in Lekki" />
            </div>
            <div>
              <Label className="text-xs">Message</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
                placeholder="Write your message. AI will personalize it per recipient if enabled." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ai-personalize" checked={aiPersonalize}
                onChange={e => setAiPersonalize(e.target.checked)} className="rounded" />
              <label htmlFor="ai-personalize" className="text-xs text-slate-600">
                AI personalize each email (slower but higher open rate)
              </label>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : `Send to ${selectedEmails.size} recipients`}
            </Button>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Prospects ({prospects.length})</CardTitle>
              <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline">
                {selectedEmails.size === prospects.length ? "Deselect all" : "Select all"}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {prospects.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">No prospects yet. Enquiries with emails appear here.</p>
              )}
              {prospects.map((p: any) => (
                <div key={p.email} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    const s = new Set(selectedEmails);
                    s.has(p.email) ? s.delete(p.email) : s.add(p.email);
                    setSelectedEmails(s);
                  }}>
                  <input type="checkbox" readOnly checked={selectedEmails.has(p.email)} className="rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.email}</p>
                  </div>
                  {p.lead_score != null && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.lead_score >= 7 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.lead_score}/10
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function AgentRoster() {
  const { data, isLoading } = useGetAgentsQuery();
  const agents = data?.agents ?? [];

  if (isLoading || agents.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-2">Your AI Agent Team</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {agents.map((a) => (
          <Card key={a.key} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-3 text-center">
              <div className="text-2xl">{a.emoji}</div>
              <p className="font-semibold text-sm mt-1 text-slate-900 dark:text-white">{a.name}</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{a.description}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px]">
                {a.pending > 0 && <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{a.pending} pending</span>}
                {a.done > 0 && <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">{a.done} done</span>}
                {a.total === 0 && <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">idle</span>}
              </div>
              {a.auto_safe.length > 0 && (
                <p className="mt-1 text-[10px] text-purple-500 flex items-center justify-center gap-0.5">
                  <Zap className="h-2.5 w-2.5" /> auto
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

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
            AI Agents
          </h1>
          <p className="text-slate-500 mt-1">Your team of AI agents runs your business in the background — designing, posting, following up, collecting & more</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Agents are scanning your business...</>
            : <><Zap className="h-4 w-4 mr-2" /> Run Agents Now</>
          }
        </Button>
      </div>

      {/* The agent team */}
      <AgentRoster />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Clock}     label="Pending Actions" value={stats?.pending ?? 0}   color="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle} label="Completed"    value={stats?.done ?? 0}       color="bg-green-100 text-green-600" />
        <StatCard icon={BarChart3} label="Total Generated" value={stats?.total ?? 0}    color="bg-purple-100 text-purple-600" />
        <StatCard icon={Zap}       label="Agents Active"  value={Object.keys(stats?.by_skill ?? {}).length} color="bg-orange-100 text-orange-600" />
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
              <TabsTrigger value="email">Email Campaigns</TabsTrigger>
              <TabsTrigger value="broadcast">
                <MessageCircle className="h-3 w-3 mr-1" />Broadcast
              </TabsTrigger>
              <TabsTrigger value="settings">
                <SlidersHorizontal className="h-3 w-3 mr-1" />Settings
              </TabsTrigger>
            </TabsList>

            {/* Skill filter */}
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All skills</SelectItem>
                {["marketer", "finance", "sales", "operations", "hr", "designer", "retention", "collections", "analyst", "compliance"].map(s => (
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
          <TabsContent value="email" className="mt-4">
            <EmailCampaignTab />
          </TabsContent>
          <TabsContent value="broadcast" className="mt-4">
            <BroadcastTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <AutopilotSettingsTab />
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
