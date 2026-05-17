import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Upload, MapPin, Info, DollarSign, Bed, Bath,
  Maximize2, CheckCircle2, X, Loader2, Plus, Zap, Trash2, GripVertical,
  Wifi, ParkingCircle, Waves, Dumbbell, ShieldCheck, Dog, Wind, WashingMachine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreateEstateUnitMutation } from "@/services/estatesApi";
import { useUploadImageMutation } from "@/services/uploadApi";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const AMENITY_CONFIG = [
  { key: "wifi",       label: "Wi-Fi",       Icon: Wifi },
  { key: "pool",       label: "Pool",         Icon: Waves },
  { key: "gym",        label: "Gym",          Icon: Dumbbell },
  { key: "parking",    label: "Parking",      Icon: ParkingCircle },
  { key: "ac",         label: "AC",           Icon: Wind },
  { key: "security",   label: "Security",     Icon: ShieldCheck },
  { key: "petFriendly",label: "Pet Friendly", Icon: Dog },
  { key: "balcony",    label: "Balcony",      Icon: null },
  { key: "laundry",    label: "Laundry",      Icon: WashingMachine },
] as const;

type AmenityKey = (typeof AMENITY_CONFIG)[number]["key"];

interface CustomFeature { name: string; value: string }

const NairaInput = ({
  label, placeholder, value, onChange, required,
}: { label: string; placeholder?: string; value: string; onChange: (v: string) => void; required?: boolean }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-foreground">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </Label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm select-none">₦</span>
      <Input
        type="number"
        min={0}
        className="pl-8 h-11"
        placeholder={placeholder ?? "0"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => (
  <CardHeader className="border-b px-6 py-4">
    <div className="flex items-center gap-2.5 text-primary">
      <Icon className="w-4.5 h-4.5 shrink-0" />
      <div>
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground font-normal mt-0.5">{description}</p>}
      </div>
    </div>
  </CardHeader>
);

export const AddPropertyPage = () => {
  const { estateId } = useParams();
  const navigate = useNavigate();
  const [createUnit, { isLoading: isPublishing }] = useCreateEstateUnitMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Basic Info
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Apartment");
  const [listingType, setListingType] = useState("Rent");

  // Pricing
  const [monthlyRent, setMonthlyRent] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [cautionFee, setCautionFee] = useState("");
  const [legalFee, setLegalFee] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [availableDate, setAvailableDate] = useState("");

  // Details
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [area, setArea] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Amenities
  const [amenities, setAmenities] = useState<Set<AmenityKey>>(new Set());
  const toggleAmenity = (key: AmenityKey) =>
    setAmenities((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // Custom features
  const [features, setFeatures] = useState<CustomFeature[]>([{ name: "", value: "" }]);
  const addFeature = () => setFeatures((p) => [...p, { name: "", value: "" }]);
  const removeFeature = (i: number) => setFeatures((p) => p.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, field: "name" | "value", val: string) =>
    setFeatures((p) => p.map((f, idx) => (idx === i ? { ...f, [field]: val } : f)));

  // Media
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      try {
        const res = await uploadImage(file).unwrap();
        if (res.success) setUploadedImages((p) => [...p, res.data.secure_url]);
      } catch {
        toast({ title: "Upload failed", description: `${file.name} could not be uploaded.`, variant: "destructive" });
      }
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handlePublish = async () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      toast({ title: "Unit label required", description: 'e.g. "Flat 1" or "Apartment 4B"', variant: "destructive" });
      return;
    }
    const rent = Number(monthlyRent);
    if (!rent || rent <= 0) {
      toast({ title: "Monthly rent required", description: "Enter a rent amount greater than 0.", variant: "destructive" });
      return;
    }

    const amenitiesObj = Object.fromEntries(
      AMENITY_CONFIG.map(({ key }) => [key, amenities.has(key)])
    ) as Record<AmenityKey, boolean>;

    const validFeatures = features.filter((f) => f.name.trim() && f.value.trim());

    try {
      await createUnit({
        estateId: estateId as string,
        body: {
          label: trimmedLabel,
          monthlyPrice: rent,
          serviceChargeMonthly: Number(serviceCharge) || undefined,
          cautionFee: Number(cautionFee) || undefined,
          legalFee: Number(legalFee) || undefined,
          securityDeposit: Number(securityDeposit) || undefined,
          category,
          listingType,
          description: description.trim() || undefined,
          availableDate: availableDate || undefined,
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          area: Number(area) || undefined,
          streetAddress: streetAddress.trim() || undefined,
          meterNumber: meterNumber.trim() || undefined,
          amenities: amenitiesObj,
          features: validFeatures,
          images: uploadedImages,
        },
      }).unwrap();

      toast({ title: "Unit created!", description: `${trimmedLabel} has been added to the estate.` });
      navigate(`/dashboard/estate/${estateId}`);
    } catch {
      toast({ title: "Failed to create unit", description: "Please check the form and try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">Add Unit</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Fill in the details to add a new unit to this estate.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Discard</Button>
            <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
              {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isPublishing ? "Creating…" : "Create Unit"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl space-y-6">

        {/* Basic Information */}
        <Card>
          <SectionHeader icon={Info} title="Basic Information" />
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="label" className="text-sm font-semibold">
                Unit Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="label"
                placeholder='e.g. Flat 1, Apartment 4B, Studio A'
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Must be unique within the estate.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Listing Type</Label>
                <Select value={listingType} onValueChange={setListingType}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the unit's key features, layout, and unique selling points… (max 1000 characters)"
                maxLength={1000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Availability */}
        <Card>
          <SectionHeader icon={DollarSign} title="Pricing & Availability" />
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NairaInput label="Monthly Rent" placeholder="e.g. 75000" value={monthlyRent} onChange={setMonthlyRent} required />
              <NairaInput label="Service Charge / month" placeholder="e.g. 10000" value={serviceCharge} onChange={setServiceCharge} />
              <NairaInput label="Caution Fee (one-time)" placeholder="e.g. 75000" value={cautionFee} onChange={setCautionFee} />
              <NairaInput label="Legal Fee (one-time)" placeholder="e.g. 25000" value={legalFee} onChange={setLegalFee} />
              <NairaInput label="Security Deposit" placeholder="e.g. 75000" value={securityDeposit} onChange={setSecurityDeposit} />
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Available Date</Label>
                <Input
                  type="date"
                  className="h-11"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <SectionHeader icon={Maximize2} title="Property Details" />
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5" /> Bedrooms
                </Label>
                <Input type="number" min={0} className="h-11" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5" /> Bathrooms
                </Label>
                <Input type="number" min={0} className="h-11" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" /> Area (m²)
                </Label>
                <Input type="number" min={0} className="h-11" placeholder="e.g. 85" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Meter No.
                </Label>
                <Input className="h-11" placeholder="e.g. E001" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Street Address
              </Label>
              <Input
                className="h-11"
                placeholder="e.g. 12 Sunrise Close, Lekki"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <SectionHeader icon={CheckCircle2} title="Amenities" description="Select all that apply to this unit." />
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITY_CONFIG.map(({ key, label: name, Icon }) => {
                const checked = amenities.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAmenity(key)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left",
                      checked
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-foreground hover:border-muted-foreground/50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      checked ? "bg-primary border-primary" : "border-muted-foreground/50"
                    )}>
                      {checked && <X className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                    {name}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Features */}
        <Card>
          <SectionHeader icon={GripVertical} title="Custom Features" description='Any additional details e.g. "Floor → Ground floor", "View → Garden view".' />
          <CardContent className="p-6 space-y-3">
            {features.map((feat, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  className="h-10 flex-1"
                  placeholder="Name (e.g. Floor)"
                  value={feat.name}
                  onChange={(e) => updateFeature(i, "name", e.target.value)}
                />
                <Input
                  className="h-10 flex-1"
                  placeholder="Value (e.g. Ground floor)"
                  value={feat.value}
                  onChange={(e) => updateFeature(i, "value", e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFeature(i)}
                  disabled={features.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-1" onClick={addFeature}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Feature
            </Button>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <SectionHeader icon={Upload} title="Listing Photos" description="Upload marketing images for this unit (optional — you can add these later)." />
          <CardContent className="p-6 space-y-4">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />

            {uploadedImages.length === 0 ? (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 text-center hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer group disabled:opacity-50"
              >
                {isUploading
                  ? <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  : <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />}
                <div>
                  <p className="font-semibold text-sm">{isUploading ? "Uploading…" : "Click to upload photos"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG — up to 10 MB each</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">JPG / PNG</Badge>
                  <Badge variant="outline" className="text-[10px]">Max 10 MB</Badge>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group border">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => setUploadedImages((p) => p.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="text-white w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                  >
                    {isUploading
                      ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      : <Plus className="w-6 h-6 text-muted-foreground" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{uploadedImages.length} photo{uploadedImages.length !== 1 ? "s" : ""} added</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="px-6">
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing} className="px-8">
            {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPublishing ? "Creating unit…" : "Create Unit"}
          </Button>
        </div>

      </div>
    </div>
  );
};
