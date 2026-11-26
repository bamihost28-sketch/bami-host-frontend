import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BUSINESSES } from "@/data/consolidatedDemoData";
import { EXCAVATOR_PROFILES } from "@/data/excavatorData";
import {
  beginShift,
  confirmChecks,
  endRest,
  finishWork,
  openShiftFor,
  attachProof,
  clearProof,
  setCheckNotes,
  startRest,
  startWork,
  useEquipmentStore,
  workedHours,
} from "@/lib/equipmentStore";
import { PRE_START_CHECKS, today, type PreStartKey } from "@/lib/equipmentRules";
import { saveProofBlob } from "@/lib/proofStorage";
import type { ProofResult } from "@/lib/proofImage";
import { ProofCapture, ProofThumb } from "./ProofCapture";
import { PageHeader } from "@/components/dashboard/DashboardPrimitives";
import { AlertTriangle, HardHat } from "lucide-react";

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

/** Operator-facing: pre-start checks, then clock work and rest, then close the day with fuel. */
export const OperatorShift = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const store = useEquipmentStore();
  const operatorName = user?.name || user?.email || "Operator";

  const excavators = (BUSINESSES.find((b) => b.id === "equipment")?.assets ?? []).filter((a) => a.type === "excavator");
  const todayISO = today();

  // Default to the machine that has a booking running today, else the first excavator.
  const assigned = excavators.find((a) =>
    store.bookings.some((b) => b.assetId === a.id && b.status !== "cancelled" && b.start <= todayISO && todayISO <= b.end)
  );
  const [assetId, setAssetId] = useState<string>(assigned?.id ?? excavators[0]?.id ?? "");
  const booking = store.bookings.find(
    (b) => b.assetId === assetId && b.status !== "cancelled" && b.start <= todayISO && todayISO <= b.end
  );
  const profile = EXCAVATOR_PROFILES.find((p) => p.assetId === assetId);
  const shift = openShiftFor(store, assetId);

  const [capturing, setCapturing] = useState<PreStartKey | null>(null);
  const [site, setSite] = useState("");
  const [fuel, setFuel] = useState("");
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const onRest = !!shift?.breaks.some((b) => !b.end);
  const allTicked = !!shift && PRE_START_CHECKS.every((c) => shift.checks[c.key]);
  const todaysFinished = store.shifts.filter((s) => s.assetId === assetId && s.finishedAt && s.date === todayISO);

  const begin = () => {
    const where = (booking?.site ?? site).trim();
    if (!where) {
      toast({ title: "Enter the site you are working at", variant: "destructive" });
      return;
    }
    beginShift(assetId, operatorName, where, todayISO);
  };

  const onProof = async (proof: ProofResult) => {
    if (!shift || !capturing) return;
    const id = `pf_${Date.now()}`;
    const error = attachProof(shift.id, capturing, {
      id,
      capturedAt: proof.capturedAt,
      source: proof.source,
      hash: proof.hash,
      dhash: proof.dhash,
    });
    if (error) {
      toast({ title: "Photo not accepted", description: error, variant: "destructive" });
      return;
    }
    await saveProofBlob(id, proof.blob);
    setCapturing(null);
  };

  const finish = () => {
    const litres = Number(fuel);
    if (fuel === "" || !(litres >= 0)) {
      toast({ title: "Enter the fuel used today in litres", variant: "destructive" });
      return;
    }
    if (shift) finishWork(shift.id, litres);
    setFuel("");
    toast({ title: "Day closed", description: "Hours and fuel were added to the machine log." });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My shift" description="Check the machine, clock in, clock your rest, and finish the day." icon={HardHat} />

      <Card>
        <CardContent className="pt-6 space-y-2">
          <Label>Machine</Label>
          <select
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={!!shift}
          >
            {excavators.map((a) => {
              const p = EXCAVATOR_PROFILES.find((x) => x.assetId === a.id);
              return <option key={a.id} value={a.id}>{a.model}{p ? ` · ${p.plateOrFleetNo}` : ""}</option>;
            })}
          </select>
          {booking ? (
            <p className="text-sm text-muted-foreground">Booked today by {booking.client} at {booking.site} ({booking.start} to {booking.end}).</p>
          ) : (
            <p className="text-sm text-muted-foreground">No customer booking covers today for this machine.</p>
          )}
        </CardContent>
      </Card>

      {!shift && todaysFinished.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Before you start work</AlertTitle>
          <AlertDescription>
            Check the water, gauge the oil and walk around the machine. Take a new photo of each, right now, as proof. You can only start work once all three photos are in.
          </AlertDescription>
        </Alert>
      )}

      {!shift && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            {!booking && (
              <div>
                <Label>Site</Label>
                <Input value={site} onChange={(e) => setSite(e.target.value)} />
              </div>
            )}
            <Button className="w-full" onClick={begin} disabled={!profile}>Start pre-start checks</Button>
          </CardContent>
        </Card>
      )}

      {shift && !shift.startedAt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pre-start checks</CardTitle>
            <CardDescription>Do each check, then take a photo of it now. Old photos cannot be reused.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRE_START_CHECKS.map((c) => {
              const proof = shift.checks[c.key];
              return (
                <div key={c.key} className="flex items-center justify-between gap-3 rounded border p-3">
                  <div className="min-w-0">
                    <div className="font-medium">{c.label}</div>
                    <div className="text-sm text-muted-foreground">{c.hint}</div>
                    {proof && (
                      <div className="text-xs text-green-700 mt-1">
                        Photo taken {fmtTime(proof.capturedAt)}{proof.source === "upload" ? " (uploaded)" : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {proof && <ProofThumb proofId={proof.id} />}
                    <Button size="sm" variant={proof ? "outline" : "default"} onClick={() => setCapturing(c.key)}>
                      {proof ? "Retake" : "Take photo"}
                    </Button>
                    {proof && (
                      <Button size="sm" variant="ghost" onClick={() => clearProof(shift.id, c.key)}>Remove</Button>
                    )}
                  </div>
                </div>
              );
            })}
            <div>
              <Label>Anything wrong? (optional)</Label>
              <Textarea rows={2} value={shift.checkNotes} onChange={(e) => setCheckNotes(shift.id, e.target.value)} />
            </div>
            {!shift.checksDoneAt ? (
              <Button className="w-full" disabled={!allTicked} onClick={() => confirmChecks(shift.id)}>
                Confirm checks
              </Button>
            ) : (
              <Button className="w-full" onClick={() => startWork(shift.id)}>Start work</Button>
            )}
          </CardContent>
        </Card>
      )}

      {shift?.startedAt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{onRest ? "On rest" : "Working"}</CardTitle>
              <Badge variant={onRest ? "secondary" : "default"}>{onRest ? "Rest" : "On site"}</Badge>
            </div>
            <CardDescription>
              Started {fmtTime(shift.startedAt)} · {workedHours(shift).toFixed(1)} h worked so far
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shift.breaks.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Rest: {shift.breaks.map((b) => `${fmtTime(b.start)}–${b.end ? fmtTime(b.end) : "now"}`).join(", ")}
              </div>
            )}
            {onRest ? (
              <Button className="w-full" onClick={() => endRest(shift.id)}>Back to work</Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={() => startRest(shift.id)}>Start rest</Button>
            )}
            <div className="border-t pt-4 space-y-2">
              <Label>Fuel used today (litres)</Label>
              <Input type="number" min="0" value={fuel} onChange={(e) => setFuel(e.target.value)} />
              <Button className="w-full" variant="destructive" onClick={finish} disabled={onRest}>
                Finish work for the day
              </Button>
              {onRest && <p className="text-xs text-muted-foreground">End your rest before finishing.</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {shift && capturing && profile && (
        <ProofCapture
          open
          title={`Photo: ${PRE_START_CHECKS.find((c) => c.key === capturing)?.label}`}
          stampLines={[
            `${profile.plateOrFleetNo} · ${PRE_START_CHECKS.find((c) => c.key === capturing)?.label}`,
            `Operator: ${operatorName}`,
          ]}
          onClose={() => setCapturing(null)}
          onCaptured={onProof}
        />
      )}

      {todaysFinished.map((s) => (
        <Card key={s.id}>
          <CardContent className="pt-6 text-sm">
            Finished {fmtTime(s.finishedAt)} · {s.hoursWorked} h worked · {s.fuelLitres} L fuel
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
