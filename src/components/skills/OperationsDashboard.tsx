import { useState } from "react";
import { Settings, Users, Wrench, Star, Plus, Edit2, Trash2, Phone } from "lucide-react";
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
  useGetOpsOverviewQuery,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} from "@/services/skillsApi";

const CATEGORIES = ["plumber", "electrician", "cleaner", "security", "landscaper", "supplier", "contractor", "it", "other"];
const STATUS_COLOR: Record<string, string> = { active: "bg-green-100 text-green-700", inactive: "bg-slate-100 text-slate-600", blacklisted: "bg-red-100 text-red-700" };

const TIPS = [
  { icon: "📋", title: "2 Vendors Per Category", body: "Always have a backup. If your plumber is unavailable, you have 24 hours before a tenant emergency becomes a crisis." },
  { icon: "⭐", title: "Rate Every Job", body: "Score vendors 1–5 after every job. Pattern of 3s = warning. Pattern of 2s = replace. Document it in BamiHustle." },
  { icon: "⚡", title: "Response SLA: 4 Hours", body: "Vendors should acknowledge issues within 4 hours. Resolution within 72 hours. Set this expectation upfront." },
  { icon: "💰", title: "Track Vendor Spend", body: "Log every payment to vendors. Your top spender by category tells you where to negotiate bulk discounts." },
  { icon: "📄", title: "SOPs Save You", body: "Write the checklist for every recurring job: inspection, cleaning, maintenance. A team follows processes, not vibes." },
];

export function OperationsDashboard() {
  const { toast } = useToast();
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<any>(null);
  const [form, setForm] = useState({ name: "", contact_name: "", phone: "", email: "", category: "plumber", services: "", notes: "" });

  const { data: overview, isLoading: ovLoading } = useGetOpsOverviewQuery();
  const { data: vendorsData, isLoading: vendLoading } = useGetVendorsQuery({});
  const [createVendor] = useCreateVendorMutation();
  const [updateVendor] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const vendors = vendorsData?.data ?? [];
  const ov = overview ?? {};

  const handleCreate = async () => {
    if (!form.name) { toast({ title: "Error", description: "Vendor name required" }); return; }
    const services = form.services.split(",").map(s => s.trim()).filter(Boolean);
    try {
      await createVendor({ ...form, services }).unwrap();
      toast({ title: "Vendor Added", description: form.name });
      setAddDialog(false);
      setForm({ name: "", contact_name: "", phone: "", email: "", category: "plumber", services: "", notes: "" });
    } catch { toast({ title: "Error", description: "Could not add vendor", variant: "destructive" }); }
  };

  const handleRate = async (id: string, rating: number) => {
    try {
      await updateVendor({ id, body: { rating } }).unwrap();
      toast({ title: "Rating Saved" });
    } catch { toast({ title: "Error", description: "Could not save rating", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="h-8 w-8 text-slate-600" /> Operations Skill
          </h1>
          <p className="text-slate-500 mt-1">Vendors, service requests, maintenance, and operational systems</p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-900 text-white" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Vendor
        </Button>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ovLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-slate-700">{ov.vendors?.active ?? 0}</p><p className="text-sm text-slate-500">Active Vendors</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{ov.service_requests?.open ?? 0}</p><p className="text-sm text-slate-500">Open Requests</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{ov.service_requests?.in_progress ?? 0}</p><p className="text-sm text-slate-500">In Progress</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{ov.maintenance_issues ?? 0}</p><p className="text-sm text-slate-500">Open Issues</p></CardContent></Card>
          </>
        )}
      </div>

      <Tabs defaultValue="vendors">
        <TabsList>
          <TabsTrigger value="vendors">Vendor Directory</TabsTrigger>
          <TabsTrigger value="tips">Operations Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="mt-4 space-y-4">
          {vendLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
          vendors.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No vendors yet. Start building your reliable vendor network.</p>
              <Button className="mt-4 bg-slate-800 hover:bg-slate-900 text-white" onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" /> Add First Vendor</Button>
            </CardContent></Card>
          ) : (
            vendors.map((v: any) => (
              <Card key={v.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{v.name}</p>
                        <Badge className={STATUS_COLOR[v.status] ?? ""}>{v.status}</Badge>
                        <Badge variant="outline">{v.category}</Badge>
                      </div>
                      {v.contact_name && <p className="text-sm text-slate-500">Contact: {v.contact_name}</p>}
                      {v.services?.length > 0 && <p className="text-sm text-slate-500">{v.services.join(", ")}</p>}
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span>Jobs: <strong>{v.jobs_completed}</strong></span>
                        <span>Paid: <strong className="text-green-600">₦{(v.total_paid ?? 0).toLocaleString()}</strong></span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => handleRate(v.id, n)} className={`text-lg ${n <= (v.rating ?? 0) ? "text-yellow-400" : "text-slate-200"}`}>★</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {v.phone && <a href={`tel:${v.phone}`}><Button size="sm" variant="outline"><Phone className="h-4 w-4" /></Button></a>}
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteVendor(v.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map(t => (
              <Card key={t.title} className="border-slate-200">
                <CardContent className="p-5">
                  <p className="font-semibold text-slate-700 mb-2">{t.icon} {t.title}</p>
                  <p className="text-sm text-slate-600">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vendor</DialogTitle><DialogDescription>Add a supplier or contractor to your vendor network</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Company / Name</Label><Input placeholder="e.g. Lagos Plumbing Co." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Name</Label><Input placeholder="John" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input placeholder="+234..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div><Label>Services (comma-separated)</Label><Input placeholder="plumbing, pipe repair, drainage" value={form.services} onChange={e => setForm(p => ({ ...p, services: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea placeholder="Any notes about this vendor..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button className="bg-slate-800 text-white hover:bg-slate-900" onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> Add Vendor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
