import { useState, useRef } from "react";
import {
  Palette, Image as ImageIcon, Type, FileText, Plus, Trash2, ExternalLink,
  Upload, Sparkles, Copy, Check, Loader2, Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import { BASE_API_URL } from "@/services/api";
import {
  useGetBrandAssetsQuery,
  useGetBrandSummaryQuery,
  useAddBrandAssetMutation,
  useDeleteBrandAssetMutation,
  useGenerateBrandIdentityMutation,
  useSaveBrandIdentityMutation,
  useGenerateLogoMutation,
  type BrandIdentity,
} from "@/services/skillsApi";

const ASSET_TYPES = [
  { value: "logo", label: "Logo", icon: ImageIcon },
  { value: "color", label: "Brand Color", icon: Palette },
  { value: "font", label: "Typography", icon: Type },
  { value: "template", label: "Template", icon: FileText },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "document", label: "Document", icon: FileText },
];

const UPLOADABLE = new Set(["logo", "image", "document", "template"]);

const TIPS = [
  { title: "Consistency = Trust", body: "Use the same 3 colors, 2 fonts, and 1 logo style everywhere. Inconsistency makes your brand look unfinished." },
  { title: "Property Photos Convert", body: "Listings with professional photos get 3× more enquiries. Natural light, wide-angle, clean spaces." },
  { title: "Nigerian Colour Psychology", body: "Green = growth & trust. Gold = premium. Navy = reliability. Pick 1 primary, 1 accent, 1 neutral." },
  { title: "3 Fonts Max", body: "One for headlines, one for body text, one for accents. More than 3 = chaos." },
  { title: "Logo Variations", body: "You need: full logo, icon-only, dark version, light version. Upload all 4 here." },
];

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

export function DesignerDashboard() {
  const { toast } = useToast();
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState({ name: "", asset_type: "logo", url: "", category: "", public_id: "", file_type: "" });
  const [colorHex, setColorHex] = useState("#0B3D2E");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: assetsData, isLoading: assetsLoading } = useGetBrandAssetsQuery();
  const { data: summary, isLoading: summaryLoading } = useGetBrandSummaryQuery();
  const [addAsset] = useAddBrandAssetMutation();
  const [deleteAsset] = useDeleteBrandAssetMutation();

  const grouped = assetsData?.data ?? {};
  const totalAssets = assetsData?.total ?? 0;

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE_API_URL}/api/brand/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      setForm((p) => ({
        ...p,
        url: data.url,
        public_id: data.public_id ?? "",
        file_type: data.file_type ?? "",
        name: p.name || file.name.replace(/\.[^.]+$/, ""),
      }));
      toast({ title: "Uploaded", description: "File uploaded — now save it to your library." });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload the file.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name && form.asset_type !== "color") {
      toast({ title: "Name required", description: "Give this asset a name." });
      return;
    }
    const payload: any = {
      asset_type: form.asset_type,
      name: form.asset_type === "color" ? (form.name || colorHex) : form.name,
      url: form.url || undefined,
      public_id: form.public_id || undefined,
      file_type: form.file_type || undefined,
      category: form.category || undefined,
      extra_data: form.asset_type === "color" ? { hex: colorHex } : {},
    };
    try {
      await addAsset(payload).unwrap();
      toast({ title: "Asset Added", description: `${payload.name} saved to your brand library` });
      setAddDialog(false);
      setForm({ name: "", asset_type: "logo", url: "", category: "", public_id: "", file_type: "" });
    } catch {
      toast({ title: "Error", description: "Could not save asset", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteAsset(id).unwrap();
      toast({ title: "Deleted", description: `${name} removed` });
    } catch {
      toast({ title: "Error", description: "Could not delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="h-8 w-8 text-purple-600" /> Designer Skill
          </h1>
          <p className="text-slate-500 mt-1">Brand identity, visual assets, and design system for your business</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Asset
        </Button>
      </div>

      {/* Brand health summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          <>
            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-700">{summary?.total_assets ?? 0}</p>
                <p className="text-sm text-purple-600">Total Assets</p>
              </CardContent>
            </Card>
            <HealthCard ok={summary?.has_logo} label="Logo" />
            <HealthCard ok={summary?.has_color_palette} label="Color Palette" />
            <HealthCard ok={summary?.has_typography} label="Typography" />
          </>
        )}
      </div>

      <Tabs defaultValue="studio">
        <TabsList>
          <TabsTrigger value="studio" className="gap-1"><Sparkles className="h-4 w-4" /> AI Brand Studio</TabsTrigger>
          <TabsTrigger value="assets">Brand Assets</TabsTrigger>
          <TabsTrigger value="tips">Designer Tips</TabsTrigger>
        </TabsList>

        {/* AI Brand Studio */}
        <TabsContent value="studio" className="mt-4">
          <BrandStudio />
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6 mt-4">
          {assetsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : totalAssets === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Palette className="h-12 w-12 mx-auto text-purple-300 mb-4" />
                <p className="text-lg font-medium text-slate-600">No brand assets yet</p>
                <p className="text-slate-400 text-sm mt-1">Generate a brand in the AI Studio, or upload your logo and colors</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add First Asset
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(grouped).map(([type, assets]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize text-lg">{type === "color" ? "Brand Colors" : type + "s"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(assets as any[]).map((asset) => (
                      <AssetCard key={asset.id} asset={asset} type={type} onDelete={handleDelete} onCopy={(t) => toast({ title: "Copied", description: t })} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPS.map((tip) => (
              <Card key={tip.title} className="border-purple-100">
                <CardContent className="p-5">
                  <p className="font-semibold text-purple-700 mb-2">💡 {tip.title}</p>
                  <p className="text-sm text-slate-600">{tip.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Asset Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Brand Asset</DialogTitle>
            <DialogDescription>Add a logo, color, font, or any brand asset to your library</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Asset Type</Label>
              <Select value={form.asset_type} onValueChange={(v) => setForm(p => ({ ...p, asset_type: v, url: "", public_id: "" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input placeholder="e.g. Primary Logo, Brand Green" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>

            {form.asset_type === "color" ? (
              <div>
                <Label>Color</Label>
                <div className="flex gap-3 items-center">
                  <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="h-10 w-16 rounded cursor-pointer border" />
                  <Input value={colorHex} onChange={(e) => setColorHex(e.target.value)} placeholder="#000000" className="font-mono" />
                </div>
              </div>
            ) : UPLOADABLE.has(form.asset_type) ? (
              <div>
                <Label>File</Label>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept={form.asset_type === "document" ? ".pdf,.doc,.docx" : "image/*"}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                />
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2 text-purple-600"><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</span>
                  ) : form.url ? (
                    <div className="space-y-2">
                      {/\.(png|jpe?g|gif|webp|svg)$/i.test(form.url) && <img src={form.url} alt="preview" className="h-20 mx-auto object-contain" />}
                      <span className="flex items-center justify-center gap-2 text-green-600 text-sm"><Check className="h-4 w-4" /> Uploaded — click to replace</span>
                    </div>
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-slate-500 text-sm"><Upload className="h-6 w-6" /> Click to upload {form.asset_type}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Or paste a URL below</p>
                <Input className="mt-1" placeholder="https://..." value={form.url} onChange={(e) => setForm(p => ({ ...p, url: e.target.value }))} />
              </div>
            ) : (
              <div>
                <Label>{form.asset_type === "font" ? "Font name / source" : "URL (optional)"}</Label>
                <Input placeholder={form.asset_type === "font" ? "e.g. Inter, Playfair Display" : "https://..."} value={form.url} onChange={(e) => setForm(p => ({ ...p, url: e.target.value }))} />
              </div>
            )}

            <div>
              <Label>Category (optional)</Label>
              <Input placeholder="e.g. primary, social, print" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" disabled={uploading} onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" /> Save Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HealthCard({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <Card className={ok ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}>
      <CardContent className="p-4 text-center">
        <p className="text-3xl">{ok ? "✅" : "❌"}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
      </CardContent>
    </Card>
  );
}

function AssetCard({ asset, type, onDelete, onCopy }: { asset: any; type: string; onDelete: (id: string, name: string) => void; onCopy: (t: string) => void }) {
  const [copied, setCopied] = useState(false);
  const hex = asset.extra_data?.hex;
  const isImg = asset.url && /\.(png|jpe?g|gif|webp|svg)$/i.test(asset.url);

  const copy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    onCopy(hex);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
      {type === "color" && hex ? (
        <button onClick={copy} className="h-10 w-10 rounded-full border-2 border-white shadow flex-shrink-0" style={{ backgroundColor: hex }} title="Copy hex" />
      ) : isImg ? (
        <img src={asset.url} alt={asset.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0 bg-white border" />
      ) : (
        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Palette className="h-5 w-5 text-purple-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{asset.name}</p>
        {asset.category && <p className="text-xs text-slate-400">{asset.category}</p>}
        {type === "color" && hex && (
          <button onClick={copy} className="text-xs font-mono text-slate-500 hover:text-purple-600 flex items-center gap-1">
            {hex} {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {asset.url && (
          <a href={asset.url} target="_blank" rel="noopener noreferrer">
            <Button size="icon" variant="ghost" className="h-7 w-7"><ExternalLink className="h-3 w-3" /></Button>
          </a>
        )}
        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => onDelete(asset.id, asset.name)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function BrandStudio() {
  const { toast } = useToast();
  const [desc, setDesc] = useState("");
  const [vibe, setVibe] = useState("premium");
  const [identity, setIdentity] = useState<BrandIdentity | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [generate, { isLoading }] = useGenerateBrandIdentityMutation();
  const [save, { isLoading: saving }] = useSaveBrandIdentityMutation();
  const [genLogo, { isLoading: logoLoading }] = useGenerateLogoMutation();
  const [addAsset, { isLoading: savingLogo }] = useAddBrandAssetMutation();

  const onGenerate = async () => {
    if (desc.trim().length < 8) {
      toast({ title: "Tell me more", description: "Describe your business in a sentence or two." });
      return;
    }
    try {
      const res = await generate({ business_description: desc, vibe }).unwrap();
      setIdentity(res.identity);
      setLogoUrl(null);
    } catch {
      toast({ title: "Generation failed", description: "The AI couldn't generate a brand. Try again.", variant: "destructive" });
    }
  };

  const onGenerateLogo = async () => {
    if (!identity) return;
    try {
      const res = await genLogo({
        business_description: desc,
        brand_name: identity.brand_name_ideas?.[0],
        vibe,
        colors: identity.colors,
      }).unwrap();
      setLogoUrl(res.url);
    } catch (e: any) {
      const msg = e?.data?.detail?.includes("not configured")
        ? "Add a GEMINI_API_KEY to enable logo generation."
        : "Could not generate the logo. Try again.";
      toast({ title: "Logo generation failed", description: msg, variant: "destructive" });
    }
  };

  const onSaveLogo = async () => {
    if (!logoUrl) return;
    try {
      await addAsset({
        asset_type: "logo",
        name: `${identity?.brand_name_ideas?.[0] || "Brand"} Logo`,
        url: logoUrl,
        category: "ai-generated",
        extra_data: {},
      }).unwrap();
      toast({ title: "Logo saved", description: "Added to your brand library." });
    } catch {
      toast({ title: "Error", description: "Could not save the logo.", variant: "destructive" });
    }
  };

  const onSave = async () => {
    if (!identity) return;
    try {
      const res = await save({
        tagline: identity.tagline,
        colors: identity.colors,
        fonts: identity.fonts,
        voice: identity.voice,
      }).unwrap();
      toast({ title: "Saved to library", description: `${res.created} brand assets added.` });
    } catch {
      toast({ title: "Error", description: "Could not save the brand.", variant: "destructive" });
    }
  };

  const copyHex = (hex: string) => { navigator.clipboard.writeText(hex); toast({ title: "Copied", description: hex }); };

  return (
    <div className="space-y-5">
      <Card className="border-purple-200">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Wand2 className="h-5 w-5" />
            <p className="font-semibold">Generate a complete brand identity with AI</p>
          </div>
          <div>
            <Label>Describe your business</Label>
            <Textarea
              rows={3}
              placeholder="e.g. Premium serviced shortlet apartments in Lekki, Lagos — for busy professionals and visitors who want hotel comfort with home privacy."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Label>Vibe</Label>
              <Select value={vibe} onValueChange={setVibe}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["premium", "modern", "friendly", "luxury", "trustworthy", "bold", "minimal"].map(v => (
                    <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={onGenerate} disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Designing…</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Brand</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {identity && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your AI Brand Identity</CardTitle>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={onSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : <><Check className="h-4 w-4 mr-2" /> Save all to library</>}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Names + tagline */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Tagline</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-white">"{identity.tagline}"</p>
              {identity.brand_name_ideas?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {identity.brand_name_ideas.map((n) => (
                    <span key={n} className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs">{n}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Palette</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {identity.colors?.map((c) => (
                  <button key={c.hex} onClick={() => copyHex(c.hex)} className="text-left rounded-lg border overflow-hidden hover:shadow transition-shadow">
                    <div className="h-16" style={{ backgroundColor: c.hex }} />
                    <div className="p-2">
                      <p className="text-sm font-medium flex items-center justify-between">{c.name} <Copy className="h-3 w-3 text-slate-400" /></p>
                      <p className="text-xs font-mono text-slate-500">{c.hex}</p>
                      {c.use && <p className="text-xs text-slate-400 mt-0.5">{c.use}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fonts */}
            {identity.fonts && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Typography</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-400">Heading</p>
                    <p className="text-lg font-bold" style={{ fontFamily: identity.fonts.heading }}>{identity.fonts.heading}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-400">Body</p>
                    <p className="text-lg" style={{ fontFamily: identity.fonts.body }}>{identity.fonts.body}</p>
                  </div>
                </div>
                {identity.fonts.note && <p className="text-xs text-slate-400 mt-1">{identity.fonts.note}</p>}
              </div>
            )}

            {/* Voice */}
            {identity.voice?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Brand Voice</p>
                <div className="flex flex-wrap gap-2">
                  {identity.voice.map((v) => <span key={v} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm capitalize">{v}</span>)}
                </div>
              </div>
            )}

            {/* Logo — concepts + AI image generation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">Logo</p>
                <Button size="sm" variant="outline" onClick={onGenerateLogo} disabled={logoLoading}>
                  {logoLoading
                    ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating…</>
                    : <><ImageIcon className="h-4 w-4 mr-1" /> {logoUrl ? "Regenerate logo" : "Generate logo"}</>}
                </Button>
              </div>

              {logoUrl ? (
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <img src={logoUrl} alt="Generated logo" className="h-40 w-40 object-contain rounded-lg border bg-white" />
                  <div className="space-y-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onSaveLogo} disabled={savingLogo}>
                      {savingLogo ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving…</> : <><Check className="h-4 w-4 mr-1" /> Save logo to library</>}
                    </Button>
                    <p className="text-xs text-slate-400 max-w-xs">AI logos work best as an icon/mark. Regenerate for variations; refine the wording in any design tool.</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-2">Generate an AI logo from your palette, or use these concept directions:</p>
              )}

              {identity.logo_concepts?.length > 0 && !logoUrl && (
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1 mt-1">
                  {identity.logo_concepts.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
