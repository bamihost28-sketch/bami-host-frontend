import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { EXCAVATOR_PROFILES, EXCAVATOR_SERVICES } from "@/data/excavatorData";
import {
  addBooking as storeAddBooking,
  addLog as storeAddLog,
  cancelBooking,
  openShiftFor,
  SEEDED_LOG_IDS,
  useEquipmentStore,
  workedHours,
} from "@/lib/equipmentStore";
import {
  availabilityWindows,
  earliestBookableStart,
  quoteBooking,
  TURNAROUND_DAYS,
  validateBooking,
} from "@/lib/equipmentRules";

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;
const DAY = 86_400_000;
const toDate = (s: string) => new Date(`${s}T00:00:00`);

interface Props {
  assetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExcavatorOperations = ({ assetId, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const profile = EXCAVATOR_PROFILES.find((p) => p.assetId === assetId);

  const store = useEquipmentStore();
  const bookings = store.bookings.filter((b) => b.assetId === assetId);
  const logs = store.logs.filter((l) => l.assetId === assetId);
  const openShift = openShiftFor(store, assetId);
  const services = EXCAVATOR_SERVICES.filter((s) => s.assetId === assetId);

  const [bookingForm, setBookingForm] = useState({ client: "", site: "", start: "", end: "", withOperator: true });
  const [logForm, setLogForm] = useState({ date: "", operator: "", site: "", hoursWorked: "", fuelLitres: "" });

  const totalLoggedHours = useMemo(() => logs.reduce((s, l) => s + l.hoursWorked, 0), [logs]);
  const loggedSinceBaseline = useMemo(
    () => logs.filter((l) => !SEEDED_LOG_IDS.has(l.id)).reduce((s, l) => s + l.hoursWorked, 0),
    [logs]
  );

  if (!profile) return null;

  const hoursMeter = profile.hoursMeter + loggedSinceBaseline;
  const hoursSinceService = hoursMeter - profile.lastServiceHours;
  const hoursToService = profile.serviceIntervalHours - hoursSinceService;
  const serviceProgress = Math.min(100, Math.max(0, (hoursSinceService / profile.serviceIntervalHours) * 100));
  const serviceOverdue = hoursToService < 0;
  const serviceSoon = !serviceOverdue && hoursToService <= 30;

  const totalFuel = logs.reduce((s, l) => s + l.fuelLitres, 0);
  const fuelPerHour = totalLoggedHours > 0 ? totalFuel / totalLoggedHours : 0;

  const insuranceDaysLeft = Math.round((toDate(profile.insuranceExpiry).getTime() - Date.now()) / DAY);

  const quote = quoteBooking(profile, bookingForm.start, bookingForm.end, bookingForm.withOperator);
  const windows = availabilityWindows(bookings);

  const addBooking = () => {
    const { client, site, start, end, withOperator } = bookingForm;
    if (!client || !site) {
      toast({ title: "Fill in client and site", variant: "destructive" });
      return;
    }
    const check = validateBooking(bookings, start, end);
    if (check.ok === false) {
      toast({ title: "Cannot book these dates", description: check.reason, variant: "destructive" });
      return;
    }
    storeAddBooking({ assetId, client, customer: client, site, start, end, withOperator });
    setBookingForm({ client: "", site: "", start: "", end: "", withOperator: true });
    toast({ title: "Booking added", description: "Demo data only, not saved to the server." });
  };

  const addLog = () => {
    const { date, operator, site, hoursWorked, fuelLitres } = logForm;
    const hours = Number(hoursWorked);
    const fuel = Number(fuelLitres);
    if (!date || !operator || !site || !(hours > 0) || !(fuel >= 0) || fuelLitres === "") {
      toast({ title: "Fill in every field with valid numbers", variant: "destructive" });
      return;
    }
    if (hours > 24) {
      toast({ title: "Hours worked cannot exceed 24 in a day", variant: "destructive" });
      return;
    }
    storeAddLog({ assetId, date, operator, site, hoursWorked: hours, fuelLitres: fuel });
    setLogForm({ date: "", operator: "", site: "", hoursWorked: "", fuelLitres: "" });
    toast({ title: "Daily log added", description: "Hours meter updated. Demo data only." });
  };

  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {profile.make} {profile.model} · {profile.plateOrFleetNo}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="logs">Daily logs</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Hours meter" value={`${hoursMeter.toLocaleString()} h`} />
              <Stat label="Fuel use" value={totalLoggedHours ? `${fuelPerHour.toFixed(1)} L/h` : "—"} />
              <Stat label="Daily rate" value={naira(profile.dailyRate)} />
              <Stat label="Operator / day" value={naira(profile.operatorRate)} />
            </div>
            <Card>
              <CardContent className="pt-6 text-sm">
                <Row
                  k="Operator today"
                  v={
                    !openShift ? "No shift started" :
                    !openShift.checksDoneAt ? `${openShift.operator}: pre-start checks pending` :
                    !openShift.startedAt ? `${openShift.operator}: checks done, not started` :
                    openShift.breaks.some((b) => !b.end) ? `${openShift.operator}: on rest` :
                    `${openShift.operator}: working (${workedHours(openShift).toFixed(1)} h)`
                  }
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <Row k="Make / model" v={`${profile.make} ${profile.model}`} />
                <Row k="Serial number" v={profile.serialNumber} />
                <Row k="Year" v={String(profile.yearOfManufacture)} />
                <Row k="Bucket" v={`${profile.bucketCapacityM3} m³`} />
                <Row k="Operating weight" v={`${profile.operatingWeightTons} t`} />
                <Row k="Mobilisation fee" v={naira(profile.mobilisationFee)} />
                <Row
                  k="Insurance expiry"
                  v={
                    <span className={insuranceDaysLeft < 0 ? "text-red-600" : insuranceDaysLeft <= 30 ? "text-yellow-600" : ""}>
                      {profile.insuranceExpiry}
                      {insuranceDaysLeft < 0 ? " (expired)" : ` (${insuranceDaysLeft} days)`}
                    </span>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">New booking</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Client</Label><Input value={bookingForm.client} onChange={(e) => setBookingForm((p) => ({ ...p, client: e.target.value }))} /></div>
                  <div><Label>Site</Label><Input value={bookingForm.site} onChange={(e) => setBookingForm((p) => ({ ...p, site: e.target.value }))} /></div>
                  <div><Label>Start</Label><Input type="date" min={earliestBookableStart()} value={bookingForm.start} onChange={(e) => setBookingForm((p) => ({ ...p, start: e.target.value }))} /></div>
                  <div><Label>End</Label><Input type="date" min={bookingForm.start || earliestBookableStart()} value={bookingForm.end} onChange={(e) => setBookingForm((p) => ({ ...p, end: e.target.value }))} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={bookingForm.withOperator} onCheckedChange={(v) => setBookingForm((p) => ({ ...p, withOperator: v }))} />
                  <Label>Include operator</Label>
                </div>
                {quote && (
                  <div className="rounded border p-3 text-sm space-y-1">
                    <Row k={`Machine (${quote.days} days)`} v={naira(quote.machine)} />
                    {bookingForm.withOperator && <Row k="Operator" v={naira(quote.operator)} />}
                    <Row k="Mobilisation" v={naira(quote.mobilisation)} />
                    <div className="flex justify-between font-semibold pt-1 border-t"><span>Total quote</span><span>{naira(quote.total)}</span></div>
                  </div>
                )}
                <Button onClick={addBooking}>Add booking</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Open dates</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                {windows.map((w) => (
                  <div key={w.start}>{w.end ? `${w.start} to ${w.end}` : `From ${w.start} onward`}</div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  Earliest start is tomorrow. Each booking keeps a {TURNAROUND_DAYS}-day break either side for delivery and servicing.
                </p>
              </CardContent>
            </Card>

            <Table>
              <TableHeader>
                <TableRow><TableHead>Client</TableHead><TableHead>Site</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {[...bookings].sort((a, b) => b.start.localeCompare(a.start)).map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.client}</TableCell>
                    <TableCell>{b.site}</TableCell>
                    <TableCell>{b.start} → {b.end}</TableCell>
                    <TableCell><Badge variant={b.status === "active" ? "default" : "secondary"}>{b.status}</Badge></TableCell>
                    <TableCell>
                      {b.status === "confirmed" && (
                        <Button variant="ghost" size="sm" onClick={() => cancelBooking(b.id)}>Cancel</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Log a work day</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><Label>Date</Label><Input type="date" value={logForm.date} onChange={(e) => setLogForm((p) => ({ ...p, date: e.target.value }))} /></div>
                  <div><Label>Operator</Label><Input value={logForm.operator} onChange={(e) => setLogForm((p) => ({ ...p, operator: e.target.value }))} /></div>
                  <div><Label>Site</Label><Input value={logForm.site} onChange={(e) => setLogForm((p) => ({ ...p, site: e.target.value }))} /></div>
                  <div><Label>Hours worked</Label><Input type="number" min="0" max="24" value={logForm.hoursWorked} onChange={(e) => setLogForm((p) => ({ ...p, hoursWorked: e.target.value }))} /></div>
                  <div><Label>Fuel (litres)</Label><Input type="number" min="0" value={logForm.fuelLitres} onChange={(e) => setLogForm((p) => ({ ...p, fuelLitres: e.target.value }))} /></div>
                </div>
                <Button onClick={addLog}>Add log</Button>
              </CardContent>
            </Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Date</TableHead><TableHead>Operator</TableHead><TableHead>Site</TableHead><TableHead className="text-right">Hours</TableHead><TableHead className="text-right">Fuel (L)</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.date}</TableCell>
                    <TableCell>{l.operator}</TableCell>
                    <TableCell>{l.site}{l.notes ? ` · ${l.notes}` : ""}</TableCell>
                    <TableCell className="text-right">{l.hoursWorked}</TableCell>
                    <TableCell className="text-right">{l.fuelLitres}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Next service</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{hoursSinceService} of {profile.serviceIntervalHours} h since last service</span>
                  <span className={serviceOverdue ? "text-red-600 font-semibold" : serviceSoon ? "text-yellow-600 font-semibold" : ""}>
                    {serviceOverdue ? `Overdue by ${-hoursToService} h` : `${hoursToService} h to go`}
                  </span>
                </div>
                <Progress value={serviceProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">Due at {profile.lastServiceHours + profile.serviceIntervalHours} h on the meter.</p>
              </CardContent>
            </Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Date</TableHead><TableHead>At hours</TableHead><TableHead>Work done</TableHead><TableHead className="text-right">Cost</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.atHours.toLocaleString()}</TableCell>
                    <TableCell>{s.description}</TableCell>
                    <TableCell className="text-right">{naira(s.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-sm text-muted-foreground">Total spent on servicing: {naira(services.reduce((s, r) => s + r.cost, 0))}</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-lg font-bold">{value}</div></CardContent></Card>
);

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between gap-4"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>
);
