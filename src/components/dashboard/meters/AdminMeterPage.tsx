import { useState } from "react";
import {
  Zap, ZapOff, Plus, Search, RefreshCw, Wifi, WifiOff,
  Power, PowerOff, RotateCcw, Settings, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  useListMetersQuery, useRegisterMeterMutation, useDisconnectMeterMutation,
  useReconnectMeterMutation, useResetBaselineMutation, useDeleteMeterMutation,
  type MeterDevice,
} from "@/services/meterApi";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

// ── Register dialog ───────────────────────────────────────────────────────────

function RegisterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [register, { isLoading }] = useRegisterMeterMutation();
  const [form, setForm] = useState({
    deviceId: "", unitId: "", deviceName: "", meterNumber: "",
    ratePerKwh: "70", lowBalanceThreshold: "500", prepaidMode: true,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.deviceId || !form.unitId) {
      toast({ title: "Device ID and Unit ID are required", variant: "destructive" }); return;
    }
    try {
      await register({
        deviceId: form.deviceId, unitId: form.unitId,
        deviceName: form.deviceName || undefined,
        meterNumber: form.meterNumber || undefined,
        ratePerKwh: parseFloat(form.ratePerKwh) || 70,
        lowBalanceThreshold: parseFloat(form.lowBalanceThreshold) || 500,
        prepaidMode: form.prepaidMode,
      }).unwrap();
      toast({ title: "Meter registered successfully" });
      onOpenChange(false);
      setForm({ deviceId: "", unitId: "", deviceName: "", meterNumber: "", ratePerKwh: "70", lowBalanceThreshold: "500", prepaidMode: true });
    } catch (e: any) {
      toast({ title: "Registration failed", description: e?.data?.detail ?? "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register Smart Meter</DialogTitle>
          <DialogDescription>Link a Tuya device to a unit in your estate.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Tuya Device ID *</Label>
              <Input placeholder="e.g. bf5a3b..." value={form.deviceId} onChange={e => set("deviceId", e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Unit ID *</Label>
              <Input placeholder="UUID of the unit" value={form.unitId} onChange={e => set("unitId", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Device Name</Label>
              <Input placeholder="e.g. Unit 4B Meter" value={form.deviceName} onChange={e => set("deviceName", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Meter Number</Label>
              <Input placeholder="Physical meter no." value={form.meterNumber} onChange={e => set("meterNumber", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Rate (₦/kWh)</Label>
              <Input type="number" value={form.ratePerKwh} onChange={e => set("ratePerKwh", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Low Balance Alert (₦)</Label>
              <Input type="number" value={form.lowBalanceThreshold} onChange={e => set("lowBalanceThreshold", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="prepaid" checked={form.prepaidMode}
              onChange={e => set("prepaidMode", e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="prepaid" className="text-sm cursor-pointer">
              Prepaid mode (auto-disconnect at zero balance)
            </Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Registering…" : "Register Meter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Meter row card ────────────────────────────────────────────────────────────

function MeterCard({ meter }: { meter: MeterDevice }) {
  const { toast } = useToast();
  const [disconnect] = useDisconnectMeterMutation();
  const [reconnect]  = useReconnectMeterMutation();
  const [resetBL]    = useResetBaselineMutation();
  const [remove]     = useDeleteMeterMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const action = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); toast({ title: msg }); }
    catch { toast({ title: "Action failed", variant: "destructive" }); }
  };

  const isLow   = meter.creditBalance <= meter.lowBalanceThreshold && meter.creditBalance > 0;
  const isEmpty = meter.creditBalance <= 0;

  return (
    <>
      <Card className="border-border/50 hover:border-border transition-colors">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{meter.deviceName || "Unnamed Meter"}</p>
                <span className={`flex items-center gap-0.5 text-xs ${meter.isOnline ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {meter.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {meter.unitLabel ? `Unit ${meter.unitLabel}` : "Unassigned"} ·{" "}
                {meter.meterNumber || meter.deviceId.slice(0, 12) + "…"}
              </p>
            </div>
            <Badge variant="outline" className={
              !meter.isConnected ? "border-red-500/40 text-red-400"
              : isEmpty ? "border-red-500/40 text-red-400"
              : isLow ? "border-yellow-500/40 text-yellow-400"
              : "border-emerald-500/40 text-emerald-400"
            }>
              {!meter.isConnected ? "OFF" : isEmpty ? "EMPTY" : isLow ? "LOW" : "ON"}
            </Badge>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center bg-muted/30 rounded px-2 py-1.5">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className={`text-sm font-semibold ${isEmpty ? "text-red-500" : isLow ? "text-yellow-500" : ""}`}>
                {fmt(meter.creditBalance)}
              </p>
            </div>
            <div className="text-center bg-muted/30 rounded px-2 py-1.5">
              <p className="text-xs text-muted-foreground">Power</p>
              <p className="text-sm font-semibold">{meter.lastPower.toFixed(0)} W</p>
            </div>
            <div className="text-center bg-muted/30 rounded px-2 py-1.5">
              <p className="text-xs text-muted-foreground">Rate</p>
              <p className="text-sm font-semibold">₦{meter.ratePerKwh}/kWh</p>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-1.5 flex-wrap">
            {meter.isConnected ? (
              <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 border-red-500/30"
                onClick={() => action(() => disconnect(meter.id).unwrap(), "Meter disconnected")}>
                <PowerOff className="h-3 w-3 mr-1" /> Disconnect
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-7 text-xs text-emerald-500 border-emerald-500/30"
                onClick={() => action(() => reconnect(meter.id).unwrap(), "Meter reconnected")}>
                <Power className="h-3 w-3 mr-1" /> Reconnect
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => action(() => resetBL(meter.id).unwrap(), "Baseline reset")}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset Baseline
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 ml-auto"
              onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {meter.lastSyncedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Last sync: {new Date(meter.lastSyncedAt).toLocaleString("en-GB")}
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign this meter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the meter from the unit. Historical data is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600"
              onClick={() => action(() => remove(meter.id).unwrap(), "Meter removed")}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminMeterPage() {
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [registerOpen, setReg]  = useState(false);
  const LIMIT = 12;

  const { data, isLoading, isFetching, refetch } = useListMetersQuery({ page, limit: LIMIT });

  const meters     = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const filtered = search
    ? meters.filter(m =>
        m.deviceName?.toLowerCase().includes(search.toLowerCase()) ||
        m.meterNumber?.includes(search) ||
        m.deviceId.includes(search) ||
        m.unitLabel?.toLowerCase().includes(search.toLowerCase()))
    : meters;

  const online   = meters.filter(m => m.isOnline).length;
  const lowBal   = meters.filter(m => m.creditBalance <= m.lowBalanceThreshold && m.creditBalance > 0).length;
  const offMeters = meters.filter(m => !m.isConnected).length;

  return (
    <div className="space-y-5">

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Meters</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all Tuya electric meters across estates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setReg(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Register Meter
          </Button>
        </div>
      </div>

      {/* summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Meters", value: total, color: "text-foreground" },
          { label: "Online",       value: online, color: "text-emerald-500" },
          { label: "Low Balance",  value: lowBal, color: "text-yellow-500" },
          { label: "Disconnected", value: offMeters, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search by name, unit, or device ID…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm" />
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Zap className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">{search ? "No meters match your search" : "No meters registered yet"}</p>
            {!search && (
              <Button size="sm" className="mt-4" onClick={() => setReg(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Register First Meter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => <MeterCard key={m.id} meter={m} />)}
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0"
              disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0"
              disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <RegisterDialog open={registerOpen} onOpenChange={setReg} />
    </div>
  );
}
