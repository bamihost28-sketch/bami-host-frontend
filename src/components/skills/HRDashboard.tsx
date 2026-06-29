import { useState } from "react";
import { Users, UserPlus, CheckCircle, Clock, Plus, Phone, Edit2, Trash2, Star } from "lucide-react";
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
  useGetHRPipelineQuery,
  useGetHROverviewQuery,
  useGetCandidatesQuery,
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useDeleteCandidateMutation,
} from "@/services/skillsApi";

const STAGES = ["sourced", "screened", "interview", "offer", "hired", "rejected", "withdrawn"];
const STAGE_COLOR: Record<string, string> = {
  sourced: "bg-slate-100 text-slate-700",
  screened: "bg-blue-100 text-blue-700",
  interview: "bg-purple-100 text-purple-700",
  offer: "bg-yellow-100 text-yellow-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-500",
};

const TIPS = [
  { icon: "🧪", title: "Skills Test First", body: "Give every candidate a real task before the interview. 30 minutes of actual work reveals more than 3 hours of talking." },
  { icon: "🤝", title: "Hire Your Weaknesses", body: "You are your company's constraint. The hire that makes you redundant in one area is always the right hire." },
  { icon: "💰", title: "The 30× Salary Rule", body: "Hire when your revenue is 30× the monthly salary of the role. Hiring before that will stretch you thin." },
  { icon: "🎯", title: "Culture Fit > Skills", body: "Skills can be taught. Attitude cannot. A 7/10 skill with 10/10 attitude beats 10/10 skill with 6/10 attitude every time." },
  { icon: "🔍", title: "Halo Research Method", body: "3-stage vetting: skills test → cultural fit conversation → reference check. Never skip the reference check." },
];

export function HRDashboard() {
  const { toast } = useToast();
  const [addDialog, setAddDialog] = useState(false);
  const [moveDialog, setMoveDialog] = useState<any>(null);
  const [form, setForm] = useState({ name: "", role: "", department: "", phone: "", email: "", source: "referral", stage: "sourced", notes: "", salary_expectation: "" });
  const [newStage, setNewStage] = useState("screened");

  const { data: pipelineData, isLoading: pipelineLoading } = useGetHRPipelineQuery();
  const { data: overview } = useGetHROverviewQuery();
  const { data: candidatesData, isLoading: candLoading } = useGetCandidatesQuery({});
  const [createCandidate] = useCreateCandidateMutation();
  const [updateCandidate] = useUpdateCandidateMutation();
  const [deleteCandidate] = useDeleteCandidateMutation();

  const pipeline = pipelineData?.pipeline ?? {};
  const summary = pipelineData?.summary ?? {};
  const candidates = candidatesData?.data ?? [];

  const handleCreate = async () => {
    if (!form.name || !form.role) { toast({ title: "Error", description: "Name and role required" }); return; }
    try {
      await createCandidate({ ...form, salary_expectation: parseFloat(form.salary_expectation) || undefined }).unwrap();
      toast({ title: "Candidate Added", description: form.name });
      setAddDialog(false);
      setForm({ name: "", role: "", department: "", phone: "", email: "", source: "referral", stage: "sourced", notes: "", salary_expectation: "" });
    } catch { toast({ title: "Error", description: "Could not add candidate", variant: "destructive" }); }
  };

  const handleMove = async () => {
    if (!moveDialog) return;
    try {
      await updateCandidate({ id: moveDialog.id, body: { stage: newStage } }).unwrap();
      toast({ title: "Candidate Updated", description: `${moveDialog.name} → ${newStage}` });
      setMoveDialog(null);
    } catch { toast({ title: "Error", description: "Could not update", variant: "destructive" }); }
  };

  const scoreBar = (score: number | null) => {
    if (!score) return null;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={`h-2 w-4 rounded-sm ${n <= Math.round(score) ? "bg-green-500" : "bg-slate-200"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-indigo-600" /> HR Director Skill
          </h1>
          <p className="text-slate-500 mt-1">Candidate pipeline, hiring decisions, and team building</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setAddDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Candidate
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pipelineLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-indigo-600">{summary.total_candidates ?? 0}</p><p className="text-sm text-slate-500">Total Candidates</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-blue-600">{summary.active_pipeline ?? 0}</p><p className="text-sm text-slate-500">In Pipeline</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-purple-600">{summary.upcoming_interviews ?? 0}</p><p className="text-sm text-slate-500">Upcoming Interviews</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{summary.hired_count ?? 0}</p><p className="text-sm text-slate-500">Hired</p></CardContent></Card>
          </>
        )}
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="all">All Candidates</TabsTrigger>
          <TabsTrigger value="tips">HR Tips</TabsTrigger>
        </TabsList>

        {/* Pipeline View */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAGES.filter(s => !["rejected", "withdrawn"].includes(s)).map(stage => {
              const stageData = pipeline[stage] ?? { count: 0, candidates: [] };
              return (
                <Card key={stage}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge className={STAGE_COLOR[stage]}>{stage}</Badge>
                      <span className="text-xs text-slate-500">{stageData.count}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(stageData.candidates ?? []).slice(0, 3).map((c: any) => (
                      <div key={c.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="text-slate-400 truncate text-xs">{c.role}</p>
                      </div>
                    ))}
                    {stageData.count > 3 && <p className="text-xs text-center text-slate-400">+{stageData.count - 3} more</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* All Candidates */}
        <TabsContent value="all" className="mt-4 space-y-3">
          {candLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />) :
          candidates.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-indigo-300 mb-3" />
              <p className="text-slate-500">No candidates yet. Start building your hiring pipeline.</p>
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setAddDialog(true)}><UserPlus className="h-4 w-4 mr-2" /> Add First Candidate</Button>
            </CardContent></Card>
          ) : (
            candidates.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{c.name}</p>
                        <Badge className={STAGE_COLOR[c.stage] ?? ""}>{c.stage}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{c.role} {c.department ? `· ${c.department}` : ""}</p>
                      {c.source && <p className="text-xs text-slate-400">Source: {c.source}</p>}
                      {c.halo_score && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">Halo Score:</span>
                          {scoreBar(c.halo_score)}
                        </div>
                      )}
                      {c.salary_expectation && <p className="text-xs text-slate-500 mt-1">Expects: ₦{c.salary_expectation?.toLocaleString()}/mo</p>}
                    </div>
                    <div className="flex gap-2">
                      {c.phone && <a href={`tel:${c.phone}`}><Button size="sm" variant="outline"><Phone className="h-4 w-4" /></Button></a>}
                      <Button size="sm" variant="outline" onClick={() => { setMoveDialog(c); setNewStage(c.stage); }}>
                        <Edit2 className="h-3 w-3 mr-1" /> Move
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCandidate(c.id)}><Trash2 className="h-3 w-3" /></Button>
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
              <Card key={t.title} className="border-indigo-100">
                <CardContent className="p-5">
                  <p className="font-semibold text-indigo-700 mb-2">{t.icon} {t.title}</p>
                  <p className="text-sm text-slate-600">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Candidate Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Candidate</DialogTitle><DialogDescription>Add someone to your hiring pipeline</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name</Label><Input placeholder="Adaeze Okafor" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Role</Label><Input placeholder="Property Manager" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department</Label><Input placeholder="Operations" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} /></div>
              <div><Label>Stage</Label>
                <Select value={form.stage} onValueChange={v => setForm(p => ({ ...p, stage: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input placeholder="+234..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><Label>Salary Expectation (₦/mo)</Label><Input type="number" placeholder="0" value={form.salary_expectation} onChange={e => setForm(p => ({ ...p, salary_expectation: e.target.value }))} /></div>
            </div>
            <div><Label>Source</Label>
              <Select value={form.source} onValueChange={v => setForm(p => ({ ...p, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["referral", "linkedin", "direct", "job_board", "walk-in", "other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea placeholder="Initial impression, how you met them..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleCreate}><UserPlus className="h-4 w-4 mr-2" /> Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Stage Dialog */}
      <Dialog open={!!moveDialog} onOpenChange={() => setMoveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Stage — {moveDialog?.name}</DialogTitle></DialogHeader>
          <div><Label>New Stage</Label>
            <Select value={newStage} onValueChange={setNewStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialog(null)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleMove}><CheckCircle className="h-4 w-4 mr-2" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
