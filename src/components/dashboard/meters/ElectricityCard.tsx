import { useState } from "react";
import {
  Zap, ZapOff, TrendingUp, RefreshCw, History,
  AlertTriangle, CheckCircle, Wifi, WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useGetMyMeterQuery } from "@/services/meterApi";
import TopUpDialog from "./TopUpDialog";
import MeterHistory from "./MeterHistory";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);

export default function ElectricityCard() {
  const [topUpOpen, setTopUpOpen]     = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data, isLoading, isFetching, refetch, isError } = useGetMyMeterQuery(undefined, {
    pollingInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  if (isError) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-10 text-center text-muted-foreground">
          <ZapOff className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No electricity meter linked to your unit yet.</p>
          <p className="text-xs mt-1 opacity-60">Contact your estate manager to set it up.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  const meter   = data?.data;
  const live    = data?.data?.live;
  const balance = meter?.creditBalance ?? 0;
  const threshold = meter?.lowBalanceThreshold ?? 500;
  const balancePct = Math.min(100, (balance / (threshold * 4)) * 100);
  const isLow  = balance <= threshold && balance > 0;
  const isEmpty = balance <= 0;
  const isConnected = meter?.isConnected ?? true;
  const isOnline    = meter?.isOnline ?? false;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-yellow-500" />
              Electricity
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* online indicator */}
              <span className={`flex items-center gap-1 text-xs ${isOnline ? "text-emerald-500" : "text-muted-foreground"}`}>
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? "Live" : "Offline"}
              </span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => refetch()}
                disabled={isFetching}>
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* ── power status ── */}
          <div className={`rounded-lg px-4 py-3 flex items-center justify-between
            ${isEmpty ? "bg-red-500/10 border border-red-500/30"
              : isLow  ? "bg-yellow-500/10 border border-yellow-500/30"
              : "bg-emerald-500/10 border border-emerald-500/30"}`}>
            <div className="flex items-center gap-2">
              {isEmpty || !isConnected ? (
                <ZapOff className="h-5 w-5 text-red-500" />
              ) : isLow ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {!isConnected
                    ? "Power Disconnected"
                    : isEmpty ? "Balance Empty"
                    : isLow ? "Low Balance"
                    : "Power Active"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {meter?.deviceName || meter?.meterNumber || "Smart Meter"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={
              isEmpty || !isConnected ? "border-red-500/40 text-red-400"
              : isLow ? "border-yellow-500/40 text-yellow-400"
              : "border-emerald-500/40 text-emerald-400"
            }>
              {!isConnected ? "OFF" : isEmpty ? "EMPTY" : isLow ? "LOW" : "ON"}
            </Badge>
          </div>

          {/* ── credit balance ── */}
          <div>
            <div className="flex items-end justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Credit Balance</span>
              <span className={`text-2xl font-bold ${isEmpty ? "text-red-500" : isLow ? "text-yellow-500" : "text-foreground"}`}>
                {fmt(balance)}
              </span>
            </div>
            <Progress value={balancePct} className="h-2"
              style={{ "--tw-bg": isEmpty ? "#ef4444" : isLow ? "#eab308" : "#10b981" } as React.CSSProperties}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Alert threshold: {fmt(threshold)}
            </p>
          </div>

          {/* ── live readings grid ── */}
          {live && !live.error && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Live Power",   value: `${live.power?.toFixed(1) ?? "—"} W`,   icon: "⚡" },
                { label: "Voltage",      value: `${live.voltage?.toFixed(1) ?? "—"} V`,  icon: "🔌" },
                { label: "Current",      value: `${live.current?.toFixed(2) ?? "—"} A`,  icon: "〰" },
                { label: "This Month",   value: `${data?.data?.kwhThisMonth?.toFixed(2) ?? "—"} kWh`, icon: "📊" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-muted/30 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">{icon} {label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── monthly cost ── */}
          {(data?.data?.costThisMonth ?? 0) > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                This month's cost
              </div>
              <span className="text-sm font-semibold">{fmt(data?.data?.costThisMonth ?? 0)}</span>
            </div>
          )}

          {/* ── tariff info ── */}
          <p className="text-xs text-muted-foreground text-center">
            Tariff: {fmt(meter?.ratePerKwh ?? 70)}/kWh
            {meter?.lastSyncedAt && (
              <> · Synced {new Date(meter.lastSyncedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</>
            )}
          </p>

          {/* ── actions ── */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setTopUpOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <Zap className="h-4 w-4 mr-1.5" />
              Buy Units
            </Button>
            <Button variant="outline" onClick={() => setHistoryOpen(true)}>
              <History className="h-4 w-4 mr-1.5" />
              History
            </Button>
          </div>
        </CardContent>
      </Card>

      <TopUpDialog
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        ratePerKwh={meter?.ratePerKwh ?? 70}
        currentBalance={balance}
      />
      <MeterHistory open={historyOpen} onOpenChange={setHistoryOpen} />
    </>
  );
}
