/**
 * Google Workspace — the admin's window into the system Google account.
 * Read the inbox and send email, browse/upload Drive files, create Docs/Sheets
 * and folders, and see/create Calendar events. Uses the same Google connection
 * that powers the AI knowledge index; write actions need the upgraded
 * read/write consent (the banner prompts a reconnect when it's missing).
 */
import { useMemo, useRef, useState } from "react";
import {
  Mail, HardDrive, Calendar as CalendarIcon, Send, Loader2, RefreshCw,
  Folder, FileText, Upload, FolderPlus, Download, ExternalLink, Search,
  Plus, Link2, AlertTriangle, ChevronRight, Sheet as SheetIcon, Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/DashboardPrimitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";
import { BASE_API_URL } from "@/services/api";
import {
  useGetGoogleStatusQuery, useListGmailQuery, useGetGmailMessageQuery,
  useSendGmailMutation, useListDriveQuery, useUploadDriveFileMutation,
  useCreateDriveFolderMutation, useCreateDriveDocMutation,
  useListCalendarQuery, useCreateCalendarEventMutation, downloadDriveFile,
} from "@/services/googleWorkspaceApi";

const FOLDER_MIME = "application/vnd.google-apps.folder";

function apiError(e: unknown): string {
  const detail = (e as { data?: { detail?: unknown } })?.data?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in (detail as object)) {
    return String((detail as { message: string }).message);
  }
  return "Something went wrong — please try again.";
}

export default function GoogleWorkspacePage() {
  const { data: status, isLoading, refetch } = useGetGoogleStatusQuery();
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const r = await fetch(`${BASE_API_URL}/api/google/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Google Workspace"
        description="Read and act on the system Google account — email, files and calendar in one place"
        icon={Mail}
      >
        {status?.connected && (
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !status?.configured ? (
        <Card className="border-warning/40">
          <CardContent className="p-5 flex items-start gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Google isn't configured on the server yet.</p>
              <p className="text-muted-foreground mt-1">
                Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI in the backend
                environment, then come back here to connect.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !status.connected ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Mail className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Connect the system Google account to read email, browse Drive and manage the
              calendar from here. The AI team uses the same connection for its knowledge index.
            </p>
            <Button onClick={connect} disabled={connecting} className="gap-1.5">
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Connect Google
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {!status.hasWriteScopes && (
            <div className="rounded-lg border border-warning/30 bg-warning-light/50 p-3 flex flex-wrap items-center gap-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
              <span className="text-foreground">
                This connection is <strong>read-only</strong> — sending email, uploading files and
                creating events need write access.
              </span>
              <Button size="sm" variant="outline" onClick={connect} disabled={connecting} className="ml-auto gap-1.5">
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Reconnect for full access
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground -mt-2">
            Connected as <span className="font-medium text-foreground">{status.email}</span>
          </p>

          <Tabs defaultValue="mail">
            <TabsList className="flex w-full gap-1 overflow-x-auto no-scrollbar justify-start">
              <TabsTrigger value="mail" className="gap-1.5 flex-shrink-0"><Mail className="h-4 w-4" /> Mail</TabsTrigger>
              <TabsTrigger value="drive" className="gap-1.5 flex-shrink-0"><HardDrive className="h-4 w-4" /> Drive</TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1.5 flex-shrink-0"><CalendarIcon className="h-4 w-4" /> Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="mail" className="mt-4"><MailTab /></TabsContent>
            <TabsContent value="drive" className="mt-4"><DriveTab /></TabsContent>
            <TabsContent value="calendar" className="mt-4"><CalendarTab /></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// ── Mail ─────────────────────────────────────────────────────────────────────

function MailTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading, isFetching, refetch } = useListGmailQuery({ q: query || undefined });
  const [sendGmail, { isLoading: sending }] = useSendGmailMutation();
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({ to: "", subject: "", body: "" });

  const send = async () => {
    if (!compose.to.trim() || !compose.body.trim()) {
      toast({ title: "Add a recipient and a message", variant: "destructive" });
      return;
    }
    try {
      await sendGmail(compose).unwrap();
      toast({ title: "Email sent", description: `To ${compose.to}` });
      setComposeOpen(false);
      setCompose({ to: "", subject: "", body: "" });
    } catch (e) {
      toast({ title: "Couldn't send", description: apiError(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search mail (e.g. from:tenant is:unread)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
          />
        </div>
        <Button variant="outline" onClick={() => setQuery(search)} className="gap-1.5">
          <Search className="h-4 w-4" /> Search
        </Button>
        <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh inbox">
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Send className="h-4 w-4" /> Compose</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New email</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>To</Label><Input placeholder="someone@example.com" value={compose.to} onChange={(e) => setCompose(p => ({ ...p, to: e.target.value }))} /></div>
              <div><Label>Subject</Label><Input value={compose.subject} onChange={(e) => setCompose(p => ({ ...p, subject: e.target.value }))} /></div>
              <div><Label>Message</Label><Textarea rows={8} value={compose.body} onChange={(e) => setCompose(p => ({ ...p, body: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button onClick={send} disabled={sending} className="gap-1.5">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.messages.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          {query ? "No messages match that search." : "The inbox is empty."}
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {data.messages.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOpenId(m.id)}
                className="w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className={cn("text-sm truncate", m.unread ? "font-semibold text-foreground" : "text-foreground/80")}>
                    {m.from?.replace(/<.*>/, "").trim() || m.from}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {m.date ? new Date(m.date).toLocaleString() : ""}
                  </span>
                </div>
                <p className={cn("text-sm truncate mt-0.5", m.unread ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {m.subject}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{m.snippet}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <MessageDialog id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function MessageDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useGetGmailMessageQuery(id ?? "", { skip: !id });
  const m = data?.message;
  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {isLoading || !m ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <DialogHeader><DialogTitle className="pr-6">{m.subject}</DialogTitle></DialogHeader>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p><span className="font-medium text-foreground">From:</span> {m.from}</p>
              {m.to && <p><span className="font-medium text-foreground">To:</span> {m.to}</p>}
              {m.date && <p>{new Date(m.date).toLocaleString()}</p>}
            </div>
            {m.bodyHtml ? (
              <iframe
                sandbox=""
                srcDoc={m.bodyHtml}
                title={m.subject}
                className="w-full h-[50vh] rounded-lg border border-border bg-white"
              />
            ) : (
              <pre className="text-sm text-foreground whitespace-pre-wrap font-body">{m.bodyText || m.snippet}</pre>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Drive ────────────────────────────────────────────────────────────────────

function DriveTab() {
  const { toast } = useToast();
  const [crumbs, setCrumbs] = useState<{ id: string; name: string }[]>([{ id: "root", name: "My Drive" }]);
  const folderId = crumbs[crumbs.length - 1].id;
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { data, isLoading, isFetching, refetch } = useListDriveQuery(
    query ? { q: query } : { folderId },
  );
  const [uploadFile, { isLoading: uploading }] = useUploadDriveFileMutation();
  const [createFolder] = useCreateDriveFolderMutation();
  const [createDoc] = useCreateDriveDocMutation();
  const fileInput = useRef<HTMLInputElement>(null);
  const [newDialog, setNewDialog] = useState<null | "folder" | "doc" | "sheet">(null);
  const [newName, setNewName] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const onUpload = async (f: File) => {
    try {
      const res = await uploadFile({ file: f, folderId }).unwrap();
      toast({ title: "Uploaded", description: res.message });
    } catch (e) {
      toast({ title: "Upload failed", description: apiError(e), variant: "destructive" });
    }
  };

  const onCreate = async () => {
    if (!newName.trim() || !newDialog) return;
    try {
      if (newDialog === "folder") {
        const res = await createFolder({ name: newName, parentId: folderId }).unwrap();
        toast({ title: "Folder created", description: res.message });
      } else {
        const res = await createDoc({ type: newDialog, name: newName, parentId: folderId }).unwrap();
        toast({ title: "Created", description: res.message });
        if (res.file.webViewLink) window.open(res.file.webViewLink, "_blank", "noopener");
      }
      setNewDialog(null);
      setNewName("");
    } catch (e) {
      toast({ title: "Couldn't create", description: apiError(e), variant: "destructive" });
    }
  };

  const onDownload = async (id: string, name: string) => {
    setDownloading(id);
    try {
      await downloadDriveFile(id, name);
    } catch (e) {
      toast({ title: "Download failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  const files = data?.files ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search all of Drive by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
          />
        </div>
        <Button variant="outline" onClick={() => setQuery(search)} className="gap-1.5"><Search className="h-4 w-4" /> Search</Button>
        <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
        />
        <Button onClick={() => fileInput.current?.click()} disabled={uploading} className="gap-1.5">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
        </Button>
        <Button variant="outline" onClick={() => { setNewDialog("folder"); setNewName(""); }} className="gap-1.5">
          <FolderPlus className="h-4 w-4" /> Folder
        </Button>
        <Button variant="outline" onClick={() => { setNewDialog("doc"); setNewName(""); }} className="gap-1.5">
          <FileText className="h-4 w-4" /> Doc
        </Button>
        <Button variant="outline" onClick={() => { setNewDialog("sheet"); setNewName(""); }} className="gap-1.5">
          <SheetIcon className="h-4 w-4" /> Sheet
        </Button>
      </div>

      {/* Breadcrumbs (hidden while a search is active) */}
      {!query ? (
        <div className="flex items-center gap-1 text-sm flex-wrap">
          {crumbs.map((c, i) => (
            <span key={c.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
              <button
                type="button"
                onClick={() => setCrumbs(crumbs.slice(0, i + 1))}
                className={cn(
                  "hover:text-primary transition-colors",
                  i === crumbs.length - 1 ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {c.name}
              </button>
            </span>
          ))}
        </div>
      ) : (
        <button type="button" className="text-sm text-primary underline" onClick={() => { setQuery(""); setSearch(""); }}>
          ← Back to folder view
        </button>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : files.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Folder className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          {query ? "Nothing matches that search." : "This folder is empty."}
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {files.map((f) => {
              const isFolder = f.mimeType === FOLDER_MIME;
              return (
                <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  {isFolder
                    ? <Folder className="h-4 w-4 text-primary flex-shrink-0" />
                    : <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  {isFolder ? (
                    <button
                      type="button"
                      className="text-sm font-medium text-foreground hover:text-primary text-left flex-1 min-w-0 truncate transition-colors"
                      onClick={() => { setCrumbs([...crumbs, { id: f.id, name: f.name }]); setQuery(""); setSearch(""); }}
                    >
                      {f.name}
                    </button>
                  ) : (
                    <span className="text-sm text-foreground flex-1 min-w-0 truncate">{f.name}</span>
                  )}
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 hidden sm:block">
                    {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : ""}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    {f.webViewLink && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Open in Google"
                        onClick={() => window.open(f.webViewLink, "_blank", "noopener")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {!isFolder && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Download"
                        disabled={downloading === f.id} onClick={() => onDownload(f.id, f.name)}>
                        {downloading === f.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Download className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!newDialog} onOpenChange={(o) => !o && setNewDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {newDialog === "folder" ? "New folder" : newDialog === "doc" ? "New Google Doc" : "New Google Sheet"}
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreate()} />
            <p className="text-xs text-muted-foreground mt-1.5">
              Created inside <strong>{crumbs[crumbs.length - 1].name}</strong>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialog(null)}>Cancel</Button>
            <Button onClick={onCreate} disabled={!newName.trim()} className="gap-1.5">
              <Plus className="h-4 w-4" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Calendar ─────────────────────────────────────────────────────────────────

function CalendarTab() {
  const { toast } = useToast();
  const { data, isLoading, isFetching, refetch } = useListCalendarQuery({ days: 60 });
  const [createEvent, { isLoading: creating }] = useCreateCalendarEventMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ summary: "", description: "", location: "", start: "", end: "", allDay: false });

  const grouped = useMemo(() => {
    const by: Record<string, NonNullable<typeof data>["events"]> = {};
    for (const e of data?.events ?? []) {
      const day = (e.start || "").slice(0, 10);
      (by[day] ||= []).push(e);
    }
    return Object.entries(by).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  const save = async () => {
    if (!form.summary.trim() || !form.start || !form.end) {
      toast({ title: "Add a title, start and end", variant: "destructive" });
      return;
    }
    try {
      await createEvent({
        summary: form.summary,
        description: form.description || undefined,
        location: form.location || undefined,
        start: form.start,
        end: form.end,
        allDay: form.allDay,
      }).unwrap();
      toast({ title: "Event created", description: form.summary });
      setOpen(false);
      setForm({ summary: "", description: "", location: "", start: "", end: "", allDay: false });
    } catch (e) {
      toast({ title: "Couldn't create event", description: apiError(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Next 60 days on the system calendar.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5"><Plus className="h-4 w-4" /> New event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New calendar event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.summary} onChange={(e) => setForm(p => ({ ...p, summary: e.target.value }))} placeholder="e.g. Estate inspection — Ikoyi" /></div>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" className="rounded" checked={form.allDay}
                    onChange={(e) => setForm(p => ({ ...p, allDay: e.target.checked, start: "", end: "" }))} />
                  All-day event
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start</Label>
                    <Input type={form.allDay ? "date" : "datetime-local"} value={form.start}
                      onChange={(e) => setForm(p => ({ ...p, start: e.target.value }))} />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input type={form.allDay ? "date" : "datetime-local"} value={form.end}
                      onChange={(e) => setForm(p => ({ ...p, end: e.target.value }))} />
                  </div>
                </div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="optional" /></div>
                <div><Label>Details</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="optional" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} disabled={creating} className="gap-1.5">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : grouped.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          Nothing scheduled in the next 60 days. Create the first event above.
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(([day, events]) => (
            <div key={day}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {new Date(day + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <Card>
                <CardContent className="p-0">
                  {events.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground w-24 flex-shrink-0">
                        {e.allDay ? "All day" : new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{e.summary}</p>
                        {e.location && <p className="text-xs text-muted-foreground truncate">{e.location}</p>}
                      </div>
                      {e.htmlLink && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" title="Open in Google Calendar"
                          onClick={() => window.open(e.htmlLink, "_blank", "noopener")}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
