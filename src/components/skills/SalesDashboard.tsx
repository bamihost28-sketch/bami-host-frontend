import { useState } from "react";
import { DollarSign, TrendingUp, Target, Users, Plus, Edit2, Trash2, CheckCircle, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetSalesPipelineQuery,
  useGetDealsQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
} from "@/services/skillsApi";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
const STAGE_COLOR: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  proposal: "bg-purple-100 text-purple-700",
  negotiation: "bg-yellow-100 text-yellow-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

function fmtN(n: number) { return `₦${(n ?? 0).toLocaleString()}`; }

const TIPS = [
  { icon: "🤝", title: "Referrals Trump Cold Outreach", body: "In Nigeria, a warm intro closes 10× faster. Ask every closed client for 1 referral." },
  { icon: "📞", title: "The 5-Touch Rule", body: "80% of deals happen after the 5th follow-up. Most salespeople quit after 2. Stay persistent." },
  { icon: "💰", title: "Qualify on Value, Not Price", body: "Never lead with price. Lead with what they get. Price resistance drops when value is clear." },
  { icon: "📅", title: "Always Book the Next Step", body: "Every call ends with a booked next action. 'I'll send you details' means they're gone." },
  { icon: "🎯", title: "Win Rate Target: 30%+", body: "If you close less than 30% of qualified leads, your pitch or follow-up process needs work." },
];

export function SalesDashboard() {
  const { toast } = useToast();
  const [addDialog, setAddDialog] = useState(false);
  const [moveDialog, setMoveDialog] = useState<any>(null);
  const [form, setForm] = useState({ client_name: "", title: "", value: "", source: "referral", stage: "lead", client_phone: "", client_email: "" });
  const [newStage, setNewStage] = useState("qualified");

  const { data: pipelineData, isLoading: pipelineLoading } = useGetSalesPipelineQuery();
  const { data: dealsData, isLoading: dealsLoading } = useGetDealsQuery({});
  const [createDeal] = useCreateDealMutation();
  const [updateDeal] = useUpdateDealMutation();
  const [deleteDeal] = useDeleteDealMutation();

  const pipeline = pipelineData?.pipeline ?? {};
  const summary = pipelineData?.summary ?? {};
  const deals = dealsData?.data ?? [];

  const handleCreate = async () => {
    if (!form.client_name || !form.title) { toast({ title: "Error", description: "Client name and deal title required" }); return; }
    try {
      await createDeal({ ...form, value: parseFloat(form.value) || 0 }).unwrap();
      toast({ title: "Deal Added", description: form.title });
      setAddDialog(false);
      setForm({ client_name: "", title: "", value: "", source: "referral", stage: "lead", client_phone: "", client_email: "" });
    } catch { toast({ title: "Error", description: "Could not create deal", variant: "destructive" }); }
  };

  const handleMove = async () => {
    if (!moveDialog) return;
    try {
      await updateDeal({ id: moveDialog.id, body: { stage: newStage } }).unwrap();
      toast({ title: "Deal Updated", description: `Moved to ${newStage}` });
      setMoveDialog(null);
    } catch { toast({ title: "Error", description: "Could not update", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" /> Sales Skill
          </h1>
          <p className="text-slate-500 mt-1">Deal pipeline, client tracking, and revenue forecasting</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Deal
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pipelineLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{summary.active_deals ?? 0}</p><p className="text-sm text-slate-500">Active Deals</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{fmtN(summary.total_pipeline_value ?? 0)}</p><p className="text-sm text-slate-500">Pipeline Value</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">{fmtN(summary.total_won_value ?? 0)}</p><p className="text-sm text-slate-500">Won Revenue</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-600">{summary.win_rate ?? 0}%</p><p className="text-sm text-slate-500">Win Rate</p></CardContent></Card>
          </>
        )}
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="all">All Deals</TabsTrigger>
          <TabsTrigger value="tips">Sales Tips</TabsTrigger>
        </TabsList>

        {/* Pipeline View */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STAGES.filter(s => s !== "lost").map(stage => {
              const stageData = pipeline[stage] ?? { count: 0, value: 0, deals: [] };
              return (
                <Card key={stage}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <Badge className={STAGE_COLOR[stage]}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</Badge>
                      <span className="text-xs text-slate-500">{stageData.count} deals</span>
                    </div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{fmtN(stageData.value)}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(stageData.deals ?? []).slice(0, 3).map((d: any) => (
                      <div key={d.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                        <p className="font-medium truncate">{d.title}</p>
                        <p className="text-slate-400 truncate">{d.client_name}</p>
                        <p className="text-green-600 font-medium">{fmtN(d.value)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* All Deals */}
        <TabsContent value="all" className="mt-4 space-y-3">
          {dealsLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />) :
          deals.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-green-300 mb-3" />
              <p className="text-slate-500">No deals in your pipeline yet.</p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" /> Add First Deal</Button>
            </CardContent></Card>
          ) : (
            deals.map((d: any) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{d.title}</p>
                        <Badge className={STAGE_COLOR[d.stage] ?? ""}>{d.stage}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{d.client_name} {d.client_company ? `· ${d.client_company}` : ""}</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{fmtN(d.value)}</p>
                      {d.next_action && <p className="text-xs text-slate-400 mt-1">Next: {d.next_action}</p>}
                    </div>
                    <div className="flex gap-2">
                      {d.client_phone && <a href={`tel:${d.client_phone}`}><Button size="sm" variant="outline"><Phone className="h-4 w-4" /></Button></a>}
                      <Button size="sm" variant="outline" onClick={() => { setMoveDialog(d); setNewStage(d.stage); }}>
                        <Edit2 className="h-3 w-3 mr-1" /> Move
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteDeal(d.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tips */}
        <TabsContent value="tips" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map(t => (
              <Card key={t.title} className="border-green-100">
                <CardContent className="p-5">
                  <p className="font-semibold text-green-700 mb-2">{t.icon} {t.title}</p>
                  <p className="text-sm text-slate-600">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Deal Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Deal</DialogTitle><DialogDescription>Add a new deal to your sales pipeline</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Client Name</Label><Input placeholder="John Adekunle" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} /></div>
            <div><Label>Deal Title</Label><Input placeholder="e.g. 3-Bed Apartment — Lagos" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Value (₦)</Label><Input type="number" placeholder="0" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} /></div>
              <div><Label>Stage</Label>
                <Select value={form.stage} onValueChange={v => setForm(p => ({ ...p, stage: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Phone</Label><Input placeholder="+234..." value={form.client_phone} onChange={e => setForm(p => ({ ...p, client_phone: e.target.value }))} /></div>
            <div><Label>Source</Label>
              <Select value={form.source} onValueChange={v => setForm(p => ({ ...p, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["referral", "social", "walk-in", "campaign", "website", "other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> Add Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Stage Dialog */}
      <Dialog open={!!moveDialog} onOpenChange={() => setMoveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move Deal — {moveDialog?.title}</DialogTitle></DialogHeader>
          <div><Label>New Stage</Label>
            <Select value={newStage} onValueChange={setNewStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialog(null)}>Cancel</Button>
            <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handleMove}><CheckCircle className="h-4 w-4 mr-2" /> Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
