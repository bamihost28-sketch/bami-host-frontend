import { useState } from "react";
import { Megaphone, TrendingUp, Users, Target, Plus, Edit2, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetMarketingOverviewQuery,
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from "@/services/skillsApi";

const CHANNELS = ["facebook", "instagram", "google", "twitter", "whatsapp", "email", "sms", "other"];
const STATUS_COLOR: Record<string, string> = { active: "bg-green-100 text-green-800", paused: "bg-yellow-100 text-yellow-800", draft: "bg-slate-100 text-slate-600", completed: "bg-blue-100 text-blue-800" };

function formatN(n: number) { return `₦${(n ?? 0).toLocaleString()}`; }

const TIPS = [
  { icon: "📱", title: "Instagram Reels > Photos", body: "Property tour videos get 5× more reach. Film a 30-second walkthrough and post consistently." },
  { icon: "📍", title: "Location Is Everything", body: "Always mention the nearest landmark, BRT stop, or school. 'Yaba, 5 mins from UNILAG BRT' converts better than just 'Yaba'." },
  { icon: "💬", title: "WhatsApp Broadcast Lists", body: "Your warm leads are gold. Build a broadcast list of 250 enquiries and send 1 update per week. Costs you nothing." },
  { icon: "🎯", title: "CPL Target: ₦500–₦2,000", body: "Cost per lead for Nigerian property should be under ₦2,000. If you're paying more, adjust your targeting." },
  { icon: "📊", title: "Track Everything", body: "If you can't measure it, you can't improve it. Log every campaign spend and lead in BamiHost." },
];

export function MarketingDashboard() {
  const { toast } = useToast();
  const [addDialog, setAddDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState<any>(null);
  const [form, setForm] = useState({ name: "", channel: "instagram", budget: "", goal: "", description: "" });
  const [kpiForm, setKpiForm] = useState({ spend: "", impressions: "", clicks: "", leads: "", conversions: "", status: "" });

  const { data: overview, isLoading: ovLoading } = useGetMarketingOverviewQuery();
  const { data: campaignsData, isLoading: camLoading } = useGetCampaignsQuery();
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();

  const campaigns = campaignsData?.data ?? [];

  const handleCreate = async () => {
    if (!form.name) { toast({ title: "Error", description: "Campaign name required" }); return; }
    try {
      await createCampaign({ ...form, budget: parseFloat(form.budget) || 0 }).unwrap();
      toast({ title: "Campaign Created", description: form.name });
      setAddDialog(false);
      setForm({ name: "", channel: "instagram", budget: "", goal: "", description: "" });
    } catch { toast({ title: "Error", description: "Could not create campaign", variant: "destructive" }); }
  };

  const handleUpdateKPIs = async () => {
    if (!updateDialog) return;
    const body: any = {};
    if (kpiForm.spend) body.spend = parseFloat(kpiForm.spend);
    if (kpiForm.impressions) body.impressions = parseInt(kpiForm.impressions);
    if (kpiForm.clicks) body.clicks = parseInt(kpiForm.clicks);
    if (kpiForm.leads) body.leads = parseInt(kpiForm.leads);
    if (kpiForm.conversions) body.conversions = parseInt(kpiForm.conversions);
    if (kpiForm.status) body.status = kpiForm.status;
    try {
      await updateCampaign({ id: updateDialog.id, body }).unwrap();
      toast({ title: "Campaign Updated" });
      setUpdateDialog(null);
    } catch { toast({ title: "Error", description: "Could not update", variant: "destructive" }); }
  };

  const ovData = overview ?? {};
  const camps = ovData.campaigns ?? {};
  const enqs = ovData.enquiries ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-orange-600" /> Marketer Skill
          </h1>
          <p className="text-slate-500 mt-1">Campaigns, leads, and conversion tracking for your business</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ovLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-600">{camps.active ?? 0}</p><p className="text-sm text-slate-500">Active Campaigns</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-blue-600">{camps.total_leads ?? 0}</p><p className="text-sm text-slate-500">Total Leads</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{camps.conversion_rate ?? 0}%</p><p className="text-sm text-slate-500">Conversion Rate</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-purple-600">{enqs.conversion_rate ?? 0}%</p><p className="text-sm text-slate-500">Enquiry → Tenant</p></CardContent></Card>
          </>
        )}
      </div>

      {!ovLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Campaign Spend</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatN(camps.total_spend ?? 0)}</p>
              <p className="text-sm text-slate-500">of {formatN(camps.total_budget ?? 0)} budget</p>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${camps.total_budget ? Math.min(100, (camps.total_spend / camps.total_budget) * 100) : 0}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Enquiry Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span>Total: <strong>{enqs.total ?? 0}</strong></span>
                <span>Converted: <strong className="text-green-600">{enqs.converted ?? 0}</strong></span>
                <span>Pending: <strong className="text-yellow-600">{enqs.pending ?? 0}</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="tips">Marketing Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4 space-y-4">
          {camLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
          campaigns.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-orange-300 mb-3" />
              <p className="text-slate-500">No campaigns yet. Launch your first campaign to start tracking leads.</p>
              <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" /> Create Campaign</Button>
            </CardContent></Card>
          ) : (
            campaigns.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                        <Badge className={STATUS_COLOR[c.status] ?? "bg-slate-100 text-slate-600"}>{c.status}</Badge>
                        <Badge variant="outline">{c.channel}</Badge>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-sm mt-2">
                        <div><p className="text-slate-400">Budget</p><p className="font-medium">{formatN(c.budget)}</p></div>
                        <div><p className="text-slate-400">Spent</p><p className="font-medium">{formatN(c.spend)}</p></div>
                        <div><p className="text-slate-400">Leads</p><p className="font-medium text-blue-600">{c.leads}</p></div>
                        <div><p className="text-slate-400">Converted</p><p className="font-medium text-green-600">{c.conversions}</p></div>
                        <div><p className="text-slate-400">CTR</p><p className="font-medium">{c.ctr}%</p></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setUpdateDialog(c); setKpiForm({ spend: String(c.spend), impressions: String(c.impressions), clicks: String(c.clicks), leads: String(c.leads), conversions: String(c.conversions), status: c.status }); }}>
                        <Edit2 className="h-3 w-3 mr-1" /> Update
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCampaign(c.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map((t) => (
              <Card key={t.title} className="border-orange-100">
                <CardContent className="p-5">
                  <p className="font-semibold text-orange-700 mb-2">{t.icon} {t.title}</p>
                  <p className="text-sm text-slate-600">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Campaign</DialogTitle><DialogDescription>Track a new marketing campaign</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Campaign Name</Label><Input placeholder="e.g. June Instagram Promo" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Channel</Label>
              <Select value={form.channel} onValueChange={v => setForm(p => ({ ...p, channel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNELS.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Budget (₦)</Label><Input type="number" placeholder="0" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} /></div>
            <div><Label>Goal</Label><Input placeholder="e.g. 50 leads, awareness, conversions" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button className="bg-orange-600 text-white hover:bg-orange-700" onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> Launch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update KPIs Dialog */}
      <Dialog open={!!updateDialog} onOpenChange={() => setUpdateDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Campaign — {updateDialog?.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Status</Label>
              <Select value={kpiForm.status} onValueChange={v => setKpiForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["draft", "active", "paused", "completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Spend (₦)</Label><Input type="number" value={kpiForm.spend} onChange={e => setKpiForm(p => ({ ...p, spend: e.target.value }))} /></div>
            <div><Label>Impressions</Label><Input type="number" value={kpiForm.impressions} onChange={e => setKpiForm(p => ({ ...p, impressions: e.target.value }))} /></div>
            <div><Label>Clicks</Label><Input type="number" value={kpiForm.clicks} onChange={e => setKpiForm(p => ({ ...p, clicks: e.target.value }))} /></div>
            <div><Label>Leads</Label><Input type="number" value={kpiForm.leads} onChange={e => setKpiForm(p => ({ ...p, leads: e.target.value }))} /></div>
            <div><Label>Conversions</Label><Input type="number" value={kpiForm.conversions} onChange={e => setKpiForm(p => ({ ...p, conversions: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog(null)}>Cancel</Button>
            <Button className="bg-orange-600 text-white hover:bg-orange-700" onClick={handleUpdateKPIs}><CheckCircle className="h-4 w-4 mr-2" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
