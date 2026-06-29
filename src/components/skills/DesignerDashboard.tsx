import { useState } from "react";
import { Palette, Image, Type, FileText, Plus, Trash2, ExternalLink, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetBrandAssetsQuery,
  useGetBrandSummaryQuery,
  useAddBrandAssetMutation,
  useDeleteBrandAssetMutation,
} from "@/services/skillsApi";

const ASSET_TYPES = [
  { value: "logo", label: "Logo", icon: Image },
  { value: "color", label: "Brand Color", icon: Palette },
  { value: "font", label: "Typography", icon: Type },
  { value: "template", label: "Template", icon: FileText },
  { value: "image", label: "Image", icon: Image },
  { value: "document", label: "Document", icon: FileText },
];

const TIPS = [
  { title: "Consistency = Trust", body: "Use the same 3 colors, 2 fonts, and 1 logo style everywhere. Inconsistency makes your brand look unfinished." },
  { title: "Property Photos Convert", body: "Listings with professional photos get 3× more enquiries. Natural light, wide-angle, clean spaces." },
  { title: "Nigerian Colour Psychology", body: "Green = growth & trust. Gold = premium. Navy = reliability. Pick 1 primary, 1 accent, 1 neutral." },
  { title: "3 Fonts Max", body: "One for headlines, one for body text, one for accents. More than 3 = chaos." },
  { title: "Logo Variations", body: "You need: full logo, icon-only, dark version, light version. Upload all 4 here." },
];

export function DesignerDashboard() {
  const { toast } = useToast();
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState({ name: "", asset_type: "logo", url: "", category: "", extra_data: {} });
  const [colorHex, setColorHex] = useState("#000000");

  const { data: assetsData, isLoading: assetsLoading } = useGetBrandAssetsQuery();
  const { data: summary, isLoading: summaryLoading } = useGetBrandSummaryQuery();
  const [addAsset] = useAddBrandAssetMutation();
  const [deleteAsset] = useDeleteBrandAssetMutation();

  const grouped = assetsData?.data ?? {};
  const totalAssets = assetsData?.total ?? 0;

  const handleAdd = async () => {
    if (!form.name || !form.asset_type) { toast({ title: "Error", description: "Name and type required" }); return; }
    const payload = { ...form, extra_data: form.asset_type === "color" ? { hex: colorHex } : {} };
    if (form.asset_type === "color") payload.name = payload.name || colorHex;
    try {
      await addAsset(payload).unwrap();
      toast({ title: "Asset Added", description: `${form.name} saved to your brand library` });
      setAddDialog(false);
      setForm({ name: "", asset_type: "logo", url: "", category: "", extra_data: {} });
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
            <Card className={summary?.has_logo ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl">{summary?.has_logo ? "✅" : "❌"}</p>
                <p className="text-sm text-slate-600">Logo</p>
              </CardContent>
            </Card>
            <Card className={summary?.has_color_palette ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl">{summary?.has_color_palette ? "✅" : "❌"}</p>
                <p className="text-sm text-slate-600">Color Palette</p>
              </CardContent>
            </Card>
            <Card className={summary?.has_typography ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl">{summary?.has_typography ? "✅" : "❌"}</p>
                <p className="text-sm text-slate-600">Typography</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Brand Assets</TabsTrigger>
          <TabsTrigger value="tips">Designer Tips</TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6 mt-4">
          {assetsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : totalAssets === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Palette className="h-12 w-12 mx-auto text-purple-300 mb-4" />
                <p className="text-lg font-medium text-slate-600">No brand assets yet</p>
                <p className="text-slate-400 text-sm mt-1">Start by uploading your logo, brand colors, and fonts</p>
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
                      <div key={asset.id} className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                        {type === "color" && asset.extra_data?.hex ? (
                          <div className="h-10 w-10 rounded-full border-2 border-white shadow flex-shrink-0" style={{ backgroundColor: asset.extra_data.hex }} />
                        ) : (
                          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Palette className="h-5 w-5 text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{asset.name}</p>
                          {asset.category && <p className="text-xs text-slate-400">{asset.category}</p>}
                          {type === "color" && asset.extra_data?.hex && (
                            <p className="text-xs font-mono text-slate-500">{asset.extra_data.hex}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {asset.url && (
                            <a href={asset.url} target="_blank" rel="noopener noreferrer">
                              <Button size="icon" variant="ghost" className="h-7 w-7">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(asset.id, asset.name)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
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
              <Select value={form.asset_type} onValueChange={(v) => setForm(p => ({ ...p, asset_type: v }))}>
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
            ) : (
              <div>
                <Label>URL (optional)</Label>
                <Input placeholder="https://..." value={form.url} onChange={(e) => setForm(p => ({ ...p, url: e.target.value }))} />
              </div>
            )}
            <div>
              <Label>Category (optional)</Label>
              <Input placeholder="e.g. primary, social, print" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" /> Save Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
