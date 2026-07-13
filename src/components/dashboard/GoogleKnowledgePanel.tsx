/**
 * Google Knowledge — connect the owner's Google Drive + Gmail so the AI team can
 * read and answer against them (RAG). Shows connection + index status, and lets
 * the owner connect, re-sync, or disconnect.
 */
import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, Link2, Unlink, FileText, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BASE_API_URL } from "@/services/api";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}
function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

interface Status {
  configured: boolean;
  connected: boolean;
  email: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  lastError: string | null;
  driveSynced: number;
  gmailSynced: number;
  indexedChunks: number;
}

export default function GoogleKnowledgePanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE_API_URL}/api/google/status`, { headers: authHeaders() });
      if (r.ok) setStatus(await r.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll while a sync is running so counts update live.
  useEffect(() => {
    if (status?.lastSyncStatus !== "running") return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [status?.lastSyncStatus, load]);

  // If Google bounced us back (?google=connected), refresh + clean the URL.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("google")) {
      load();
      p.delete("google");
      const q = p.toString();
      window.history.replaceState({}, "", window.location.pathname + (q ? `?${q}` : ""));
    }
  }, [load]);

  const connect = async () => {
    setBusy(true);
    try {
      const r = await fetch(`${BASE_API_URL}/api/google/connect`, { headers: authHeaders() });
      const data = await r.json();
      if (data.authUrl) window.location.href = data.authUrl;
      else alert(data.detail || "Google is not configured on the server yet.");
    } catch { alert("Couldn't start Google connect."); }
    finally { setBusy(false); }
  };

  const sync = async () => {
    setBusy(true);
    try {
      await fetch(`${BASE_API_URL}/api/google/sync`, { method: "POST", headers: authHeaders() });
      await load();
    } finally { setBusy(false); }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Google and delete the AI's index of your Drive & Gmail?")) return;
    setBusy(true);
    try {
      await fetch(`${BASE_API_URL}/api/google/disconnect`, { method: "POST", headers: authHeaders() });
      await load();
    } finally { setBusy(false); }
  };

  if (loading) {
    return <div className="rounded-xl border p-4 flex items-center gap-2 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" /> Checking Google connection…
    </div>;
  }
  if (!status) return null;

  const running = status.lastSyncStatus === "running";

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" /> Google Drive & Gmail knowledge
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md">
            Let your AI team read your Drive files and emails, so they answer with your real documents —
            leases, vendor quotes, receipts and more.
          </p>
        </div>
        {status.connected
          ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium whitespace-nowrap">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          : null}
      </div>

      {!status.configured && (
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          Google isn't configured on the server yet. An admin needs to set the Google OAuth client
          (GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI).
        </div>
      )}

      {status.connected && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold"><FileText className="h-3.5 w-3.5" />{status.driveSynced}</div>
            <div className="text-[11px] text-slate-500">Drive files</div>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold"><Mail className="h-3.5 w-3.5" />{status.gmailSynced}</div>
            <div className="text-[11px] text-slate-500">Emails</div>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
            <div className="text-sm font-semibold">{status.indexedChunks}</div>
            <div className="text-[11px] text-slate-500">Indexed passages</div>
          </div>
        </div>
      )}

      {status.connected && status.email && (
        <p className="mt-2 text-[11px] text-slate-400">{status.email}
          {running && <span className="ml-2 text-blue-500">• indexing…</span>}
          {!running && status.lastSyncStatus === "error" && <span className="ml-2 text-red-500">• last sync failed</span>}
        </p>
      )}
      {status.lastError && !running && (
        <p className="mt-1 text-[11px] text-red-500 truncate" title={status.lastError}>{status.lastError}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!status.connected ? (
          <Button size="sm" onClick={connect} disabled={busy || !status.configured}
            className="gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} Connect Google
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={sync} disabled={busy || running} className="gap-1.5">
              {(busy || running) ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {running ? "Indexing…" : "Re-sync now"}
            </Button>
            <Button size="sm" variant="ghost" onClick={disconnect} disabled={busy}
              className="gap-1.5 text-red-500 hover:text-red-600">
              <Unlink className="h-4 w-4" /> Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
