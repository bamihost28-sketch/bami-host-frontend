import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BUSINESSES } from "@/data/consolidatedDemoData";
import { EXCAVATOR_PROFILES, type ExcavatorProfile } from "@/data/excavatorData";
import { addBooking, cancelBooking, useEquipmentStore } from "@/lib/equipmentStore";
import {
  availabilityWindows,
  earliestBookableStart,
  quoteBooking,
  TURNAROUND_DAYS,
  validateBooking,
} from "@/lib/equipmentRules";
import { PageHeader } from "@/components/dashboard/DashboardPrimitives";
import { Truck } from "lucide-react";

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;

/** Customer-facing: see which excavators are free and when, and book the exact dates needed. */
export const EquipmentRentals = () => {
  const { user } = useAuth();
  const store = useEquipmentStore();
  const customerName = user?.name || user?.email || "Customer";

  const excavators = (BUSINESSES.find((b) => b.id === "equipment")?.assets ?? [])
    .filter((a) => a.type === "excavator")
    .map((a) => ({ asset: a, profile: EXCAVATOR_PROFILES.find((p) => p.assetId === a.id) }))
    .filter((x): x is { asset: any; profile: ExcavatorProfile } => !!x.profile);

  const mine = store.bookings
    .filter((b) => b.customer === customerName)
    .sort((a, b) => b.start.localeCompare(a.start));

  const [prefill, setPrefill] = useState<{ assetId: string; site: string; withOperator: boolean } | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rent an excavator"
        description="Pick a machine, see when it is free, and book the exact dates you need."
        icon={Truck}
      />

      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground space-y-1">
          <p>Bookings start from tomorrow. You cannot book today.</p>
          <p>
            Each booking is followed by a {TURNAROUND_DAYS}-day break so we can return the machine, service it and
            deliver it to the next customer. That is why some dates show as unavailable.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {excavators.map(({ asset, profile }) => (
          <ExcavatorCard
            key={asset.id}
            title={`${asset.model} · ${profile.plateOrFleetNo}`}
            profile={profile}
            customerName={customerName}
            prefill={prefill?.assetId === asset.id ? prefill : null}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My bookings</CardTitle>
          <CardDescription>Book the same machine again in one click.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mine.length === 0 && <p className="text-sm text-muted-foreground">You have no bookings yet.</p>}
          {mine.map((b) => {
            const label = excavators.find((e) => e.asset.id === b.assetId)?.profile.plateOrFleetNo ?? b.assetId;
            return (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm">
                <div>
                  <div className="font-medium">{label} · {b.site}</div>
                  <div className="text-muted-foreground">{b.start} to {b.end}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{b.status}</Badge>
                  {b.status === "confirmed" && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(b.id)}>Cancel</Button>
                  )}
                  {(b.status === "completed" || b.status === "cancelled") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPrefill({ assetId: b.assetId, site: b.site, withOperator: b.withOperator });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Rebook
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

const ExcavatorCard = ({
  title,
  profile,
  customerName,
  prefill,
}: {
  title: string;
  profile: ExcavatorProfile;
  customerName: string;
  prefill: { site: string; withOperator: boolean } | null;
}) => {
  const { toast } = useToast();
  const store = useEquipmentStore();
  const bookings = store.bookings.filter((b) => b.assetId === profile.assetId);
  const windows = availabilityWindows(bookings);

  const [form, setForm] = useState({ site: "", start: "", end: "", withOperator: true });
  const [appliedPrefill, setAppliedPrefill] = useState<typeof prefill>(null);
  if (prefill && prefill !== appliedPrefill) {
    setAppliedPrefill(prefill);
    setForm((p) => ({ ...p, site: prefill.site, withOperator: prefill.withOperator }));
  }

  const quote = quoteBooking(profile, form.start, form.end, form.withOperator);

  const submit = () => {
    if (!form.site.trim()) {
      toast({ title: "Enter the site where the machine will work", variant: "destructive" });
      return;
    }
    const check = validateBooking(bookings, form.start, form.end);
    if (check.ok === false) {
      toast({ title: "Cannot book these dates", description: check.reason, variant: "destructive" });
      return;
    }
    addBooking({
      assetId: profile.assetId,
      client: customerName,
      customer: customerName,
      site: form.site.trim(),
      start: form.start,
      end: form.end,
      withOperator: form.withOperator,
    });
    setForm({ site: "", start: "", end: "", withOperator: true });
    toast({ title: "Booking confirmed", description: `${form.start} to ${form.end}. Demo data only, not saved to the server.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {naira(profile.dailyRate)} per day · operator {naira(profile.operatorRate)} per day · mobilisation {naira(profile.mobilisationFee)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-1">Available dates</div>
          <div className="flex flex-wrap gap-2">
            {windows.length === 0 && <span className="text-sm text-muted-foreground">No free dates in the next 4 months.</span>}
            {windows.map((w) => (
              <Badge key={w.start} variant="outline">
                {w.end ? `${w.start} to ${w.end}` : `From ${w.start}`}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>Site / location</Label>
            <Input value={form.site} onChange={(e) => setForm((p) => ({ ...p, site: e.target.value }))} />
          </div>
          <div>
            <Label>From</Label>
            <Input type="date" min={earliestBookableStart()} value={form.start} onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))} />
          </div>
          <div>
            <Label>Until</Label>
            <Input type="date" min={form.start || earliestBookableStart()} value={form.end} onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.withOperator} onCheckedChange={(v) => setForm((p) => ({ ...p, withOperator: v }))} />
          <Label>With operator</Label>
        </div>

        {quote && (
          <div className="rounded border p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Machine ({quote.days} days)</span><span>{naira(quote.machine)}</span></div>
            {form.withOperator && <div className="flex justify-between"><span>Operator</span><span>{naira(quote.operator)}</span></div>}
            <div className="flex justify-between"><span>Mobilisation</span><span>{naira(quote.mobilisation)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-1"><span>Total</span><span>{naira(quote.total)}</span></div>
          </div>
        )}
        <Button onClick={submit} className="w-full">Book these dates</Button>
      </CardContent>
    </Card>
  );
};
