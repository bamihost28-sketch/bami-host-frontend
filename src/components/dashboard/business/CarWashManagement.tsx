import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Droplets, TrendingUp, Users, Ticket, Loader2, Plus } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetCarWashStationsQuery, useCreateCarWashStationMutation,
  useGetCarWashStationOverviewQuery, useGetCarWashStationOrdersQuery,
  useUpdateCarWashOrderStatusMutation, useGetCarWashServicesQuery,
  useCreateCarWashServiceMutation, useGetCarWashStationTicketsQuery,
  useResolveCarWashTicketMutation, useGetCarWashStaffQuery,
  useAddCarWashStaffMutation, type CarWashOrderStatus,
} from "@/services/carWashApi";

const STATUS_LABEL: Record<CarWashOrderStatus, string> = {
  scheduled: "Scheduled", queued: "Queued", in_wash: "In Wash", drying: "Drying",
  ready: "Ready", completed: "Completed", cancelled: "Cancelled",
};

const NEXT_STATUS: Partial<Record<CarWashOrderStatus, CarWashOrderStatus>> = {
  scheduled: "queued", queued: "in_wash", in_wash: "drying", drying: "ready", ready: "completed",
};

const fmtNaira = (n: number) => `₦${n.toLocaleString()}`;

export function CarWashManagement() {
  const { data: stationsData, isLoading: loadingStations } = useGetCarWashStationsQuery();
  const stations = stationsData?.data ?? [];
  const station = stations[0];

  const [createOpen, setCreateOpen] = useState(false);

  if (loadingStations) {
    return <div className="p-6 text-sm text-muted-foreground">Loading Bami-Wash…</div>;
  }

  if (!station) {
    return <CreateStationCard open={createOpen} onOpenChange={setCreateOpen} />;
  }

  return <StationDashboard stationId={station.id} stationName={station.name} />;
}

function CreateStationCard({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [createStation, { isLoading }] = useCreateCarWashStationMutation();
  const [name, setName] = useState("Bami-Wash");
  const [address, setAddress] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createStation({ name: name.trim(), address: address.trim() || undefined }).unwrap();
      toast({ title: "Station created" });
      onOpenChange(false);
    } catch {
      toast({ title: "Couldn't create station", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <Droplets className="h-10 w-10 text-primary" />
      <div>
        <h2 className="text-xl font-semibold">Set up Bami-Wash</h2>
        <p className="text-sm text-muted-foreground mt-1">No station yet — create one to start tracking orders and revenue.</p>
      </div>
      <Button onClick={() => onOpenChange(true)}>Create Station</Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Bami-Wash Station</DialogTitle>
            <DialogDescription>Single location for now — more can be added later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="station-name">Name</Label>
              <Input id="station-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="station-address">Address</Label>
              <Input id="station-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isLoading || !name.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StationDashboard({ stationId, stationName }: { stationId: string; stationName: string }) {
  const { data: overviewData } = useGetCarWashStationOverviewQuery(stationId, { pollingInterval: 30000 });
  const overview = overviewData?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{stationName}</h1>
        <p className="text-muted-foreground">Car wash operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtNaira(overview?.revenueToday ?? 0)}</div>
            <div className="text-xs text-muted-foreground">{fmtNaira(overview?.revenue30D ?? 0)} last 30d</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.ordersToday ?? 0}</div>
            <div className="text-xs text-muted-foreground">{overview?.completedToday ?? 0} completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Length</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.queueLength ?? 0}</div>
            <div className="text-xs text-muted-foreground">cars in progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.openTickets ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Live Queue</TabsTrigger>
          <TabsTrigger value="services">Services & Pricing</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="queue"><QueueTab stationId={stationId} /></TabsContent>
        <TabsContent value="services"><ServicesTab stationId={stationId} /></TabsContent>
        <TabsContent value="tickets"><TicketsTab stationId={stationId} /></TabsContent>
        <TabsContent value="staff"><StaffTab stationId={stationId} /></TabsContent>
      </Tabs>
    </div>
  );
}

function QueueTab({ stationId }: { stationId: string }) {
  const { toast } = useToast();
  const { data, isFetching } = useGetCarWashStationOrdersQuery(
    { stationId, status: "scheduled,queued,in_wash,drying,ready" },
    { pollingInterval: 15000 },
  );
  const [updateStatus, { isLoading: updating }] = useUpdateCarWashOrderStatusMutation();
  const orders = data?.data ?? [];

  const advance = async (id: string, next: CarWashOrderStatus) => {
    try {
      await updateStatus({ id, stationId, status: next }).unwrap();
    } catch {
      toast({ title: "Couldn't update order", variant: "destructive" });
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        {isFetching && orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading queue…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No active orders right now.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const next = NEXT_STATUS[o.status];
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant="outline">{STATUS_LABEL[o.status]}</Badge></TableCell>
                    <TableCell>{fmtNaira(o.total)}</TableCell>
                    <TableCell className="text-right">
                      {next && (
                        <Button size="sm" variant="outline" disabled={updating} onClick={() => advance(o.id, next)}>
                          Move to {STATUS_LABEL[next]}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ServicesTab({ stationId }: { stationId: string }) {
  const { toast } = useToast();
  const { data, isFetching } = useGetCarWashServicesQuery(stationId);
  const [createService, { isLoading: creating }] = useCreateCarWashServiceMutation();
  const services = data?.data ?? [];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("20");
  const [kind, setKind] = useState<"queue" | "slot">("queue");

  const handleCreate = async () => {
    if (!name.trim() || !price) return;
    try {
      await createService({ stationId, data: { name: name.trim(), basePrice: Number(price), durationMin: Number(duration), kind } }).unwrap();
      toast({ title: "Service added" });
      setOpen(false); setName(""); setPrice(""); setDuration("20");
    } catch {
      toast({ title: "Couldn't add service", variant: "destructive" });
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" />Add Service</Button>
        </div>
        {isFetching && services.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No services yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="capitalize">{s.kind}</TableCell>
                  <TableCell>{s.durationMin} min</TableCell>
                  <TableCell>{fmtNaira(s.basePrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Exterior Quick Wash" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Price (₦)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !name.trim() || !price}>
              {creating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function TicketsTab({ stationId }: { stationId: string }) {
  const { toast } = useToast();
  const { data, isFetching } = useGetCarWashStationTicketsQuery({ stationId });
  const [resolveTicket, { isLoading: resolving }] = useResolveCarWashTicketMutation();
  const tickets = data?.data ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [refund, setRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");

  const active = tickets.find((t) => t.id === activeId);

  const handleResolve = async () => {
    if (!active) return;
    try {
      await resolveTicket({
        id: active.id, stationId,
        data: { resolutionNote: note || undefined, refund, refundAmount: refund ? Number(refundAmount) : undefined },
      }).unwrap();
      toast({ title: refund ? "Ticket refunded" : "Ticket resolved" });
      setActiveId(null); setNote(""); setRefund(false); setRefundAmount("");
    } catch (e: any) {
      toast({ title: "Couldn't resolve ticket", description: e?.data?.detail, variant: "destructive" });
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        {isFetching && tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No support tickets.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{t.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {t.status === "open" && (
                      <Button size="sm" variant="outline" onClick={() => setActiveId(t.id)}>Resolve</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!activeId} onOpenChange={(o) => !o && setActiveId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>{active?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="Resolution note" value={note} onChange={(e) => setNote(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={refund} onChange={(e) => setRefund(e.target.checked)} />
              Issue a refund to the customer's wallet
            </label>
            {refund && (
              <Input type="number" placeholder="Refund amount (₦)" value={refundAmount}
                     onChange={(e) => setRefundAmount(e.target.value)} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveId(null)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={resolving || (refund && !refundAmount)}>
              {resolving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {refund ? "Resolve & Refund" : "Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function StaffTab({ stationId }: { stationId: string }) {
  const { toast } = useToast();
  const { data, isFetching } = useGetCarWashStaffQuery(stationId);
  const [addStaff, { isLoading: adding }] = useAddCarWashStaffMutation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !email.trim()) return;
    try {
      const result = await addStaff({ stationId, data: { name: name.trim(), email: email.trim() } }).unwrap();
      toast({ title: "Staff added", description: result.data?.credentialsSent ? "Login credentials emailed." : undefined });
      setOpen(false); setName(""); setEmail("");
    } catch {
      toast({ title: "Couldn't add staff", variant: "destructive" });
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" />Add Staff</Button>
        </div>
        {isFetching ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.owner && (
                <TableRow>
                  <TableCell>{data.owner.name}</TableCell>
                  <TableCell>{data.owner.email}</TableCell>
                  <TableCell><Badge>Admin (Owner)</Badge></TableCell>
                </TableRow>
              )}
              {(data?.members ?? []).map((m) => (
                <TableRow key={m.userId}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell className="capitalize">{m.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Staff</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding || !name.trim() || !email.trim()}>
              {adding ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
