import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import {
  useCreateEstateMutation,
  useCreateEstateUnitMutation,
  useUploadUnitImagesMutation,
  useUploadUnitVideoMutation,
  useAddUnitConditionReportMutation,
  useCreateEstateTenantMutation,
  type ConditionRating,
} from '@/services/estatesApi';
import {
  Building2,
  Home,
  Image,
  ClipboardList,
  User,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Video,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatedUnit {
  id: string;
  label: string;
  monthlyPrice: number;
}

interface UnitDraft {
  label: string;
  monthlyPrice: string;
  serviceChargeMonthly: string;
  cautionFee: string;
  legalFee: string;
  meterNumber: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  category: string;
  listingType: string;
  streetAddress: string;
  amenities: {
    wifi: boolean; pool: boolean; gym: boolean;
    parking: boolean; ac: boolean; security: boolean;
    petFriendly: boolean; balcony: boolean; laundry: boolean;
  };
  features: { name: string; value: string }[];
}

interface MediaState {
  images: File[];
  imagePreviews: string[];
  video: File | null;
  videoPreview: string | null;
  uploading: boolean;
  done: boolean;
}

interface ConditionState {
  overallCondition: ConditionRating | '';
  notes: string;
  date: string;
  images: File[];
  imagePreviews: string[];
  video: File | null;
  videoPreview: string | null;
  submitting: boolean;
  done: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [
  { icon: Building2, label: 'Estate' },
  { icon: Home,      label: 'Units' },
  { icon: Image,     label: 'Media' },
  { icon: ClipboardList, label: 'Condition' },
  { icon: User,      label: 'Tenant' },
  { icon: CheckCircle2, label: 'Done' },
];

const BLANK_UNIT_DRAFT: UnitDraft = {
  label: '', monthlyPrice: '', serviceChargeMonthly: '', cautionFee: '',
  legalFee: '', meterNumber: '', description: '', bedrooms: '', bathrooms: '',
  area: '', category: 'Apartment', listingType: 'Rent', streetAddress: '',
  amenities: { wifi: false, pool: false, gym: false, parking: false, ac: false, security: false, petFriendly: false, balcony: false, laundry: false },
  features: [],
};

const blankMedia = (): MediaState => ({
  images: [], imagePreviews: [], video: null, videoPreview: null, uploading: false, done: false,
});

const blankCondition = (): ConditionState => ({
  overallCondition: '', notes: '', date: new Date().toISOString().slice(0, 10),
  images: [], imagePreviews: [], video: null, videoPreview: null, submitting: false, done: false,
});

function extractId(result: any): string {
  return result?._id ?? result?.id ?? result?.data?._id ?? result?.data?.id ?? '';
}

// ─── Component ────────────────────────────────────────────────────────────────

interface EstateSetupWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const EstateSetupWizard = ({ open, onOpenChange }: EstateSetupWizardProps) => {
  const navigate = useNavigate();

  // Navigation
  const [step, setStep] = useState(0);
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);

  // Step 0 — Estate
  const [estateForm, setEstateForm] = useState({ name: '', description: '', totalUnits: '' });
  const [createdEstateId, setCreatedEstateId] = useState('');
  const [createdEstateName, setCreatedEstateName] = useState('');

  // Step 1 — Units
  const [unitDraft, setUnitDraft] = useState<UnitDraft>(BLANK_UNIT_DRAFT);
  const [showMoreUnit, setShowMoreUnit] = useState(false);
  const [createdUnits, setCreatedUnits] = useState<CreatedUnit[]>([]);
  const [addingUnit, setAddingUnit] = useState(false);

  // Step 2 — Media (keyed by unit id)
  const [mediaState, setMediaState] = useState<Record<string, MediaState>>({});
  const mediaImageInputRef = useRef<HTMLInputElement>(null);
  const mediaVideoInputRef = useRef<HTMLInputElement>(null);

  // Step 3 — Condition (keyed by unit id)
  const [conditionState, setConditionState] = useState<Record<string, ConditionState>>({});
  const condImageInputRef = useRef<HTMLInputElement>(null);
  const condVideoInputRef = useRef<HTMLInputElement>(null);

  // Step 4 — Tenant
  const [tenantForm, setTenantForm] = useState({
    unitId: '', tenantName: '', tenantEmail: '', tenantPhone: '',
    entryDate: '', durationMonths: '12', tenantType: 'new' as const,
  });
  const [tenantDone, setTenantDone] = useState(false);

  // Mutations
  const [createEstate, { isLoading: creatingEstate }] = useCreateEstateMutation();
  const [createUnit] = useCreateEstateUnitMutation();
  const [uploadImages] = useUploadUnitImagesMutation();
  const [uploadVideo] = useUploadUnitVideoMutation();
  const [addConditionReport] = useAddUnitConditionReportMutation();
  const [createTenant, { isLoading: addingTenant }] = useCreateEstateTenantMutation();

  // ─── Reset ────────────────────────────────────────────────────────────────

  const resetAll = () => {
    setStep(0);
    setSelectedUnitIdx(0);
    setEstateForm({ name: '', description: '', totalUnits: '' });
    setCreatedEstateId('');
    setCreatedEstateName('');
    setUnitDraft(BLANK_UNIT_DRAFT);
    setShowMoreUnit(false);
    setCreatedUnits([]);
    setAddingUnit(false);
    setMediaState({});
    setConditionState({});
    setTenantForm({ unitId: '', tenantName: '', tenantEmail: '', tenantPhone: '', entryDate: '', durationMonths: '12', tenantType: 'new' });
    setTenantDone(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetAll, 300);
  };

  // ─── Step 0 helpers ──────────────────────────────────────────────────────

  const handleCreateEstate = async () => {
    const name = estateForm.name.trim();
    const totalUnits = Number(estateForm.totalUnits);
    if (!name || !totalUnits || totalUnits <= 0) {
      toast({ title: 'Required', description: 'Name and total units are required.', variant: 'destructive' });
      return;
    }
    try {
      const result = await createEstate({ name, description: estateForm.description || undefined, totalUnits }).unwrap();
      const id = extractId(result);
      // Creating the estate closes the wizard and routes the admin to the new estate,
      // instead of continuing into the multi-step setup.
      toast({ title: 'Estate created', description: `${name} has been created.` });
      handleClose();
      navigate(`/dashboard/estate/${id}`);
    } catch {
      toast({ title: 'Failed to create estate', variant: 'destructive' });
    }
  };

  // ─── Step 1 helpers ──────────────────────────────────────────────────────

  const handleAddUnit = async () => {
    const label = unitDraft.label.trim();
    const price = Number(unitDraft.monthlyPrice);
    if (!label || !price || price <= 0) {
      toast({ title: 'Required', description: 'Label and monthly price are required.', variant: 'destructive' });
      return;
    }
    setAddingUnit(true);
    try {
      const body: any = {
        label,
        monthlyPrice: price,
        ...(unitDraft.serviceChargeMonthly ? { serviceChargeMonthly: Number(unitDraft.serviceChargeMonthly) } : {}),
        ...(unitDraft.cautionFee ? { cautionFee: Number(unitDraft.cautionFee) } : {}),
        ...(unitDraft.legalFee ? { legalFee: Number(unitDraft.legalFee) } : {}),
        ...(unitDraft.meterNumber ? { meterNumber: unitDraft.meterNumber } : {}),
        ...(unitDraft.description ? { description: unitDraft.description } : {}),
        ...(unitDraft.bedrooms ? { bedrooms: Number(unitDraft.bedrooms) } : {}),
        ...(unitDraft.bathrooms ? { bathrooms: Number(unitDraft.bathrooms) } : {}),
        ...(unitDraft.area ? { area: Number(unitDraft.area) } : {}),
        category: unitDraft.category,
        listingType: unitDraft.listingType,
        ...(unitDraft.streetAddress ? { streetAddress: unitDraft.streetAddress } : {}),
        amenities: unitDraft.amenities,
        ...(unitDraft.features.length > 0 ? { features: unitDraft.features } : {}),
      };
      const result = await createUnit({ estateId: createdEstateId, body }).unwrap();
      const id = extractId(result);
      const newUnit: CreatedUnit = { id, label, monthlyPrice: price };
      setCreatedUnits((prev) => [...prev, newUnit]);
      setMediaState((prev) => ({ ...prev, [id]: blankMedia() }));
      setConditionState((prev) => ({ ...prev, [id]: blankCondition() }));
      setUnitDraft(BLANK_UNIT_DRAFT);
      setShowMoreUnit(false);
      toast({ title: `Unit "${label}" created` });
    } catch {
      toast({ title: 'Failed to create unit', variant: 'destructive' });
    } finally {
      setAddingUnit(false);
    }
  };

  const updateAmenity = (key: keyof UnitDraft['amenities'], val: boolean) =>
    setUnitDraft((d) => ({ ...d, amenities: { ...d.amenities, [key]: val } }));

  const addFeatureRow = () =>
    setUnitDraft((d) => ({ ...d, features: [...d.features, { name: '', value: '' }] }));

  const updateFeature = (i: number, field: 'name' | 'value', val: string) =>
    setUnitDraft((d) => {
      const features = [...d.features];
      features[i] = { ...features[i], [field]: val };
      return { ...d, features };
    });

  const removeFeature = (i: number) =>
    setUnitDraft((d) => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }));

  // ─── Step 2 helpers ──────────────────────────────────────────────────────

  const currentUnit = createdUnits[selectedUnitIdx];

  const updateMedia = (unitId: string, patch: Partial<MediaState>) =>
    setMediaState((prev) => ({ ...prev, [unitId]: { ...prev[unitId], ...patch } }));

  const handleMediaImages = (unitId: string, files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 10 - (mediaState[unitId]?.images.length ?? 0));
    const previews: string[] = [];
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === arr.length) {
          updateMedia(unitId, {
            images: [...(mediaState[unitId]?.images ?? []), ...arr],
            imagePreviews: [...(mediaState[unitId]?.imagePreviews ?? []), ...previews],
          });
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleMediaVideo = (unitId: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => updateMedia(unitId, { video: file, videoPreview: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleUploadMedia = async (unitId: string) => {
    const m = mediaState[unitId];
    if (!m || (m.images.length === 0 && !m.video)) return;
    updateMedia(unitId, { uploading: true });
    try {
      if (m.images.length > 0) await uploadImages({ unitId, files: m.images }).unwrap();
      if (m.video) await uploadVideo({ unitId, file: m.video }).unwrap();
      updateMedia(unitId, { uploading: false, done: true });
      toast({ title: 'Media uploaded', description: `Listing media saved for unit.` });
    } catch {
      updateMedia(unitId, { uploading: false });
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
  };

  // ─── Step 3 helpers ──────────────────────────────────────────────────────

  const updateCond = (unitId: string, patch: Partial<ConditionState>) =>
    setConditionState((prev) => ({ ...prev, [unitId]: { ...prev[unitId], ...patch } }));

  const handleCondImages = (unitId: string, files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 20 - (conditionState[unitId]?.images.length ?? 0));
    const previews: string[] = [];
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === arr.length) {
          updateCond(unitId, {
            images: [...(conditionState[unitId]?.images ?? []), ...arr],
            imagePreviews: [...(conditionState[unitId]?.imagePreviews ?? []), ...previews],
          });
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleCondVideo = (unitId: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => updateCond(unitId, { video: file, videoPreview: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleSaveCondition = async (unitId: string) => {
    const c = conditionState[unitId];
    if (!c?.overallCondition) {
      toast({ title: 'Overall condition required', variant: 'destructive' });
      return;
    }
    updateCond(unitId, { submitting: true });
    const formData = new FormData();
    formData.append('type', 'pre_listing');
    formData.append('overallCondition', c.overallCondition);
    if (c.notes) formData.append('notes', c.notes);
    if (c.date) formData.append('date', c.date);
    c.images.forEach((f) => formData.append('images', f));
    if (c.video) formData.append('video', c.video);
    try {
      await addConditionReport({ unitId, formData }).unwrap();
      updateCond(unitId, { submitting: false, done: true });
      toast({ title: 'Condition report saved' });
    } catch {
      updateCond(unitId, { submitting: false });
      toast({ title: 'Failed to save condition report', variant: 'destructive' });
    }
  };

  // ─── Step 4 helpers ──────────────────────────────────────────────────────

  const handleAddTenant = async () => {
    if (!tenantForm.unitId || !tenantForm.tenantName.trim()) {
      toast({ title: 'Unit and tenant name required', variant: 'destructive' });
      return;
    }
    try {
      await createTenant({
        estateId: createdEstateId,
        body: {
          unitId: tenantForm.unitId,
          tenantName: tenantForm.tenantName.trim(),
          tenantEmail: tenantForm.tenantEmail || undefined,
          tenantPhone: tenantForm.tenantPhone || undefined,
          entryDate: tenantForm.entryDate || undefined,
          durationMonths: Number(tenantForm.durationMonths) || 12,
          tenantType: tenantForm.tenantType,
        },
      }).unwrap();
      setTenantDone(true);
      toast({ title: 'Tenant added', description: 'Welcome email and wallet created.' });
    } catch {
      toast({ title: 'Failed to add tenant', variant: 'destructive' });
    }
  };

  // ─── Renderers ───────────────────────────────────────────────────────────

  const renderEstateStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Start by creating the estate (complex or building). You'll add individual units next.</p>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1.5">Estate name <span className="text-destructive">*</span></p>
          <Input placeholder="e.g. Sunrise Court" value={estateForm.name} onChange={(e) => setEstateForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <p className="text-sm font-medium mb-1.5">Description</p>
          <Textarea placeholder="Brief description of the estate..." rows={2} value={estateForm.description} onChange={(e) => setEstateForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <p className="text-sm font-medium mb-1.5">Total units <span className="text-destructive">*</span></p>
          <Input type="number" min={1} placeholder="e.g. 12" value={estateForm.totalUnits} onChange={(e) => setEstateForm((f) => ({ ...f, totalUnits: e.target.value }))} />
          <p className="text-xs text-muted-foreground mt-1">Total number of apartments in this estate.</p>
        </div>
      </div>
    </div>
  );

  const renderUnitsStep = () => (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Add each apartment. You can add as many as you need — click <strong>Add Unit</strong> to save each one.</p>

      {/* Unit form */}
      <div className="rounded-lg border p-4 space-y-4 bg-slate-50 dark:bg-slate-800/40">
        <p className="text-sm font-semibold">New unit</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium mb-1">Label <span className="text-destructive">*</span></p>
            <Input placeholder="Flat 1" value={unitDraft.label} onChange={(e) => setUnitDraft((d) => ({ ...d, label: e.target.value }))} />
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Monthly rent (₦) <span className="text-destructive">*</span></p>
            <Input type="number" min={0} placeholder="75000" value={unitDraft.monthlyPrice} onChange={(e) => setUnitDraft((d) => ({ ...d, monthlyPrice: e.target.value }))} />
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Service charge (₦/mo)</p>
            <Input type="number" min={0} placeholder="10000" value={unitDraft.serviceChargeMonthly} onChange={(e) => setUnitDraft((d) => ({ ...d, serviceChargeMonthly: e.target.value }))} />
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Caution fee (₦)</p>
            <Input type="number" min={0} placeholder="75000" value={unitDraft.cautionFee} onChange={(e) => setUnitDraft((d) => ({ ...d, cautionFee: e.target.value }))} />
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Legal fee (₦)</p>
            <Input type="number" min={0} placeholder="25000" value={unitDraft.legalFee} onChange={(e) => setUnitDraft((d) => ({ ...d, legalFee: e.target.value }))} />
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Meter number</p>
            <Input placeholder="E001" value={unitDraft.meterNumber} onChange={(e) => setUnitDraft((d) => ({ ...d, meterNumber: e.target.value }))} />
          </div>
        </div>

        <button className="text-xs text-blue-600 dark:text-blue-400 underline-offset-2 hover:underline" onClick={() => setShowMoreUnit((v) => !v)}>
          {showMoreUnit ? 'Show fewer fields' : 'Show more fields (bedrooms, amenities, etc.)'}
        </button>

        {showMoreUnit && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-medium mb-1">Bedrooms</p>
                <Input type="number" min={0} placeholder="2" value={unitDraft.bedrooms} onChange={(e) => setUnitDraft((d) => ({ ...d, bedrooms: e.target.value }))} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Bathrooms</p>
                <Input type="number" min={0} placeholder="2" value={unitDraft.bathrooms} onChange={(e) => setUnitDraft((d) => ({ ...d, bathrooms: e.target.value }))} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Area (m²)</p>
                <Input type="number" min={0} placeholder="85" value={unitDraft.area} onChange={(e) => setUnitDraft((d) => ({ ...d, area: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-1">Category</p>
                <Select value={unitDraft.category} onValueChange={(v) => setUnitDraft((d) => ({ ...d, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Apartment','House','Villa','Office','Studio','Penthouse','Other'].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Listing type</p>
                <Select value={unitDraft.listingType} onValueChange={(v) => setUnitDraft((d) => ({ ...d, listingType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Street address</p>
              <Input placeholder="12 Sunrise Close, Lekki" value={unitDraft.streetAddress} onChange={(e) => setUnitDraft((d) => ({ ...d, streetAddress: e.target.value }))} />
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Description</p>
              <Textarea rows={2} placeholder="2-bedroom flat on the ground floor..." value={unitDraft.description} onChange={(e) => setUnitDraft((d) => ({ ...d, description: e.target.value }))} />
            </div>
            {/* Amenities */}
            <div>
              <p className="text-xs font-medium mb-2">Amenities</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(unitDraft.amenities) as (keyof typeof unitDraft.amenities)[]).map((key) => (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={unitDraft.amenities[key]} onCheckedChange={(v) => updateAmenity(key, !!v)} />
                    <span className="capitalize">{key === 'petFriendly' ? 'Pet-friendly' : key === 'ac' ? 'A/C' : key}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Custom features */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">Custom features</p>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addFeatureRow}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              {unitDraft.features.map((feat, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input className="text-xs h-8" placeholder="Name (e.g. Floor)" value={feat.name} onChange={(e) => updateFeature(i, 'name', e.target.value)} />
                  <Input className="text-xs h-8" placeholder="Value (e.g. Ground floor)" value={feat.value} onChange={(e) => updateFeature(i, 'value', e.target.value)} />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => removeFeature(i)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button size="sm" onClick={handleAddUnit} disabled={addingUnit}>
          {addingUnit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Add Unit
        </Button>
      </div>

      {/* Created units list */}
      {createdUnits.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Added units ({createdUnits.length})</p>
          <div className="space-y-2">
            {createdUnits.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{u.label}</p>
                    <p className="text-xs text-muted-foreground">₦{u.monthlyPrice.toLocaleString()}/mo</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Created</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMediaStep = () => {
    if (createdUnits.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">No units created yet.</p>;
    const uid = currentUnit?.id ?? '';
    const m = mediaState[uid] ?? blankMedia();
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">Upload marketing photos and a walkthrough video for each unit. These appear in the public listing.</p>
        {/* Unit tabs */}
        <div className="flex gap-2 flex-wrap">
          {createdUnits.map((u, i) => (
            <button
              key={u.id}
              onClick={() => setSelectedUnitIdx(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedUnitIdx === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:border-foreground'}`}
            >
              {u.label}
              {mediaState[u.id]?.done && <CheckCircle2 className="h-3 w-3 ml-1 inline text-green-500" />}
            </button>
          ))}
        </div>

        {/* Images */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2"><Image className="h-4 w-4" /> Images ({m.images.length}/10)</p>
            <Button variant="outline" size="sm" disabled={m.images.length >= 10 || m.uploading || m.done} onClick={() => mediaImageInputRef.current?.click()}>
              Choose images
            </Button>
          </div>
          <input ref={mediaImageInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => handleMediaImages(uid, e.target.files)} />
          {m.imagePreviews.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {m.imagePreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full h-14 object-cover rounded border" />
                  {!m.done && (
                    <button onClick={() => updateMedia(uid, { images: m.images.filter((_, idx) => idx !== i), imagePreviews: m.imagePreviews.filter((_, idx) => idx !== i) })}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2"><Video className="h-4 w-4" /> Video (1 max)</p>
            <Button variant="outline" size="sm" disabled={!!m.video || m.uploading || m.done} onClick={() => mediaVideoInputRef.current?.click()}>
              Choose video
            </Button>
          </div>
          <input ref={mediaVideoInputRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => handleMediaVideo(uid, e.target.files?.[0] ?? null)} />
          {m.videoPreview && (
            <div className="relative">
              <video src={m.videoPreview} className="w-full h-28 object-cover rounded border" muted />
              {!m.done && (
                <button onClick={() => updateMedia(uid, { video: null, videoPreview: null })}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {m.done ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> Media uploaded for {currentUnit?.label}
          </div>
        ) : (
          <Button size="sm" onClick={() => handleUploadMedia(uid)} disabled={m.uploading || (m.images.length === 0 && !m.video)}>
            {m.uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {m.uploading ? 'Uploading…' : `Upload for ${currentUnit?.label}`}
          </Button>
        )}
      </div>
    );
  };

  const renderConditionStep = () => {
    if (createdUnits.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">No units created yet.</p>;
    const uid = currentUnit?.id ?? '';
    const c = conditionState[uid] ?? blankCondition();
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">Document the current physical state before the first tenant moves in. This becomes the baseline for future move-in/move-out comparisons.</p>
        {/* Unit tabs */}
        <div className="flex gap-2 flex-wrap">
          {createdUnits.map((u, i) => (
            <button key={u.id} onClick={() => setSelectedUnitIdx(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedUnitIdx === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:border-foreground'}`}>
              {u.label}
              {conditionState[u.id]?.done && <CheckCircle2 className="h-3 w-3 ml-1 inline text-green-500" />}
            </button>
          ))}
        </div>

        {c.done ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> Condition report saved for {currentUnit?.label}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium mb-1.5">Report type</p>
                <div className="px-3 py-2 rounded-md border bg-slate-100 dark:bg-slate-800 text-sm text-muted-foreground">Pre-listing</div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1.5">Overall condition <span className="text-destructive">*</span></p>
                <Select value={c.overallCondition} onValueChange={(v) => updateCond(uid, { overallCondition: v as ConditionRating })}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Date</p>
              <Input type="date" value={c.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => updateCond(uid, { date: e.target.value })} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Notes</p>
              <Textarea rows={3} placeholder="All walls freshly painted, tiles intact, no scratches, all fittings working..." value={c.notes} onChange={(e) => updateCond(uid, { notes: e.target.value })} />
            </div>
            {/* Condition images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2"><Image className="h-4 w-4" /> Photos ({c.images.length}/20)</p>
                <Button variant="outline" size="sm" disabled={c.images.length >= 20} onClick={() => condImageInputRef.current?.click()}>Choose photos</Button>
              </div>
              <input ref={condImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleCondImages(uid, e.target.files)} />
              {c.imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {c.imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-14 object-cover rounded border" />
                      <button onClick={() => updateCond(uid, { images: c.images.filter((_, idx) => idx !== i), imagePreviews: c.imagePreviews.filter((_, idx) => idx !== i) })}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Condition video */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2"><Video className="h-4 w-4" /> Walkthrough video</p>
                <Button variant="outline" size="sm" disabled={!!c.video} onClick={() => condVideoInputRef.current?.click()}>Choose video</Button>
              </div>
              <input ref={condVideoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleCondVideo(uid, e.target.files?.[0] ?? null)} />
              {c.videoPreview && (
                <div className="relative">
                  <video src={c.videoPreview} className="w-full h-28 object-cover rounded border" muted />
                  <button onClick={() => updateCond(uid, { video: null, videoPreview: null })}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <Button size="sm" onClick={() => handleSaveCondition(uid)} disabled={c.submitting || !c.overallCondition}>
              {c.submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ClipboardList className="h-4 w-4 mr-2" />}
              {c.submitting ? 'Saving…' : `Save Report for ${currentUnit?.label}`}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderTenantStep = () => (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Optionally add the first tenant now. A user account, welcome email, and wallet will be created automatically.</p>
      {tenantDone ? (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" /> Tenant added successfully.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1.5">Unit <span className="text-destructive">*</span></p>
            <Select value={tenantForm.unitId} onValueChange={(v) => setTenantForm((f) => ({ ...f, unitId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
              <SelectContent>
                {createdUnits.map((u) => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-medium mb-1.5">Full name <span className="text-destructive">*</span></p>
              <Input placeholder="John Doe" value={tenantForm.tenantName} onChange={(e) => setTenantForm((f) => ({ ...f, tenantName: e.target.value }))} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Phone</p>
              <Input placeholder="08012345678" value={tenantForm.tenantPhone} onChange={(e) => setTenantForm((f) => ({ ...f, tenantPhone: e.target.value }))} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Email</p>
              <Input type="email" placeholder="john@example.com" value={tenantForm.tenantEmail} onChange={(e) => setTenantForm((f) => ({ ...f, tenantEmail: e.target.value }))} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Tenant type</p>
              <Select value={tenantForm.tenantType} onValueChange={(v) => setTenantForm((f) => ({ ...f, tenantType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="existing">Existing</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Entry date</p>
              <Input type="date" value={tenantForm.entryDate} onChange={(e) => setTenantForm((f) => ({ ...f, entryDate: e.target.value }))} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Duration (months)</p>
              <Input type="number" min={1} max={24} value={tenantForm.durationMonths} onChange={(e) => setTenantForm((f) => ({ ...f, durationMonths: e.target.value }))} />
            </div>
          </div>
          <Button size="sm" onClick={handleAddTenant} disabled={addingTenant}>
            {addingTenant ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
            {addingTenant ? 'Adding…' : 'Add Tenant'}
          </Button>
        </div>
      )}
    </div>
  );

  const renderDoneStep = () => (
    <div className="space-y-6 py-4 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
      <div>
        <h3 className="text-xl font-semibold">{createdEstateName} is ready</h3>
        <p className="text-sm text-muted-foreground mt-1">{createdUnits.length} unit{createdUnits.length !== 1 ? 's' : ''} created</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        {[
          { label: 'Estate', done: true },
          { label: 'Units', done: createdUnits.length > 0 },
          { label: 'Listing media', done: Object.values(mediaState).some((m) => m.done) },
          { label: 'Condition reports', done: Object.values(conditionState).some((c) => c.done) },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg border p-3 ${item.done ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-border bg-slate-50 dark:bg-slate-800/40'}`}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className={`h-3.5 w-3.5 ${item.done ? 'text-green-500' : 'text-muted-foreground/30'}`} />
              <p className="text-xs font-medium">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" onClick={handleClose}>Close</Button>
        <Button onClick={() => { handleClose(); navigate(`/dashboard/estates/${createdEstateId}`); }}>
          Go to Estate
        </Button>
      </div>
    </div>
  );

  const stepContent = [renderEstateStep, renderUnitsStep, renderMediaStep, renderConditionStep, renderTenantStep, renderDoneStep];

  // ─── Footer nav ──────────────────────────────────────────────────────────

  const canGoBack = step > 0 && step < 5;
  const isLastBeforeDone = step === 4;
  const isOptionalStep = step >= 2;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Set Up New Estate</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.label} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-1.5 shrink-0 ${active ? 'text-primary' : done ? 'text-green-500' : 'text-muted-foreground/40'}`}>
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-green-400' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="pb-6">
            {stepContent[step]?.()}
          </div>
        </ScrollArea>

        {/* Footer */}
        {step < 5 && (
          <div className="px-6 py-4 border-t flex items-center justify-between shrink-0">
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={!canGoBack}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex gap-2">
              {isOptionalStep && (
                <Button variant="outline" onClick={() => setStep((s) => s + 1)}>
                  Skip
                </Button>
              )}
              {step === 0 ? (
                <Button onClick={handleCreateEstate} disabled={creatingEstate}>
                  {creatingEstate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {creatingEstate ? 'Creating…' : 'Create & Continue'}
                  {!creatingEstate && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              ) : step === 1 ? (
                <Button onClick={() => setStep(2)} disabled={createdUnits.length === 0}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : isLastBeforeDone ? (
                <Button onClick={() => setStep(5)}>
                  Finish <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
