import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PropertyMediaSkeleton } from '@/components/ui/skeletons';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import {
  useGetUnitQuery,
  useUploadUnitImagesMutation,
  useUploadUnitVideoMutation,
  useDeleteUnitMediaMutation,
  usePatchUnitMediaMutation,
} from '@/services/estatesApi';
import { useUploadImageMutation, useUploadVideoMutation } from '@/services/uploadApi';
import {
  Image,
  Video,
  Upload,
  RefreshCw,
  Trash2,
  ZoomIn,
  Loader2,
  X,
  AlertCircle,
  BedDouble,
  Bath,
  MapPin,
  Zap,
  Building2,
  Maximize2,
} from 'lucide-react';

interface PropertyMediaCardProps {
  unitId?: string;
  history: any[];
}

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Wi-Fi',
  pool: 'Pool',
  gym: 'Gym',
  parking: 'Parking',
  ac: 'A/C',
  security: 'Security',
  petFriendly: 'Pet Friendly',
  balcony: 'Balcony',
  laundry: 'Laundry',
};

const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const PropertyMediaCard = ({ unitId, history }: PropertyMediaCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'upload' | 'update'>('upload');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [stagedVideo, setStagedVideo] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: unitData, isLoading: unitLoading } = useGetUnitQuery(unitId as string, {
    skip: !unitId,
  });
  const [uploadImages, { isLoading: uploadingImages }] = useUploadUnitImagesMutation();
  const [uploadVideo, { isLoading: uploadingVideo }] = useUploadUnitVideoMutation();
  const [deleteMedia] = useDeleteUnitMediaMutation();
  const [patchMedia, { isLoading: patching }] = usePatchUnitMediaMutation();
  const [uploadGenericImage] = useUploadImageMutation();
  const [uploadGenericVideo] = useUploadVideoMutation();

  const uploading = uploadingImages || uploadingVideo || patching;

  const openDialog = (mode: 'upload' | 'update') => {
    clearStaged();
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const unit = unitData?.data;
  // API returns images/videos directly on data, with media as fallback for upload response
  const images = unit?.media?.images ?? unit?.images ?? [];
  const videos = unit?.media?.videos ?? unit?.videos ?? [];

  const activeAmenities = Object.entries(unit?.amenities ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => AMENITY_LABELS[k] ?? k);

  // History media (move-in documentation)
  const historyPhotos: { url: string; publicId: string }[] = [];
  const historyVideos: { url: string; publicId: string }[] = [];
  history.forEach((h) => {
    const meta = (h as any).meta;
    if (meta?.photos) historyPhotos.push(...meta.photos);
    if (meta?.videos) historyVideos.push(...meta.videos);
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (stagedImages.length + files.length > 10) {
      toast({ title: 'Too many images', description: 'Maximum 10 images allowed.', variant: 'destructive' });
      return;
    }
    setStagedImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStagedVideo(file);
    const reader = new FileReader();
    reader.onload = (ev) => setVideoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeStagedImage = (index: number) => {
    setStagedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearStaged = () => {
    setStagedImages([]);
    setStagedVideo(null);
    setImagePreviews([]);
    setVideoPreview(null);
  };

  const handleUpload = async () => {
    if (!unitId) return;
    if (stagedImages.length === 0 && !stagedVideo) {
      toast({ title: 'Nothing to upload', description: 'Select at least one image or video.', variant: 'destructive' });
      return;
    }
    try {
      if (stagedImages.length > 0) await uploadImages({ unitId, files: stagedImages }).unwrap();
      if (stagedVideo) await uploadVideo({ unitId, file: stagedVideo }).unwrap();
      toast({ title: 'Uploaded', description: 'Media saved to unit.' });
      clearStaged();
      setDialogOpen(false);
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!unitId) return;
    if (stagedImages.length === 0 && !stagedVideo) {
      toast({ title: 'Nothing selected', description: 'Pick at least one file to replace existing media.', variant: 'destructive' });
      return;
    }
    try {
      const imagePayload: { url: string; publicId: string }[] = [];
      const videoPayload: { url: string; publicId: string }[] = [];
      for (const file of stagedImages) {
        const res = await uploadGenericImage(file).unwrap();
        imagePayload.push({ url: res.data.secure_url, publicId: res.data.public_id });
      }
      if (stagedVideo) {
        const res = await uploadGenericVideo(stagedVideo).unwrap();
        videoPayload.push({ url: res.data.secure_url, publicId: res.data.public_id });
      }
      await patchMedia({ unitId, images: imagePayload, videos: videoPayload, replace: true }).unwrap();
      toast({ title: 'Updated', description: 'Unit media replaced successfully.' });
      clearStaged();
      setDialogOpen(false);
    } catch {
      toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleDeleteImage = async (publicId: string) => {
    if (!unitId) return;
    setDeletingId(publicId);
    try {
      await deleteMedia({ unitId, imageIds: [publicId] }).unwrap();
      toast({ title: 'Deleted', description: 'Image removed.' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteVideo = async (publicId: string) => {
    if (!unitId) return;
    setDeletingId(publicId);
    try {
      await deleteMedia({ unitId, videoIds: [publicId] }).unwrap();
      toast({ title: 'Deleted', description: 'Video removed.' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Details
              </CardTitle>
              <CardDescription>Unit information, specifications and listing media</CardDescription>
            </div>
            {unitId && (
              <div className="flex items-center gap-2 shrink-0">
                {(images.length > 0 || videos.length > 0) && (
                  <Button variant="outline" size="sm" onClick={() => openDialog('update')}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Media
                  </Button>
                )}
                <Button size="sm" onClick={() => openDialog('upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {unitLoading ? (
            <PropertyMediaSkeleton />
          ) : unit ? (
            <>
              {/* ── Unit overview ─────────────────────────────── */}
              <div className="space-y-5">

                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {unit.category && (
                    <Badge variant="outline" className="text-xs font-medium">{unit.category}</Badge>
                  )}
                  {unit.listingType && (
                    <Badge variant="outline" className="text-xs font-medium">{unit.listingType}</Badge>
                  )}
                  {unit.status === 'occupied' && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs font-medium">Occupied</Badge>
                  )}
                  {unit.status === 'vacant' && (
                    <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-0 text-xs font-medium">Vacant</Badge>
                  )}
                  {unit.status === 'maintenance' && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-xs font-medium">Maintenance</Badge>
                  )}
                </div>

                {/* Specs row */}
                {((unit.bedrooms ?? 0) > 0 || (unit.bathrooms ?? 0) > 0 || (unit.area ?? 0) > 0) && (
                  <div className="flex items-center gap-5 flex-wrap text-sm">
                    {(unit.bedrooms ?? 0) > 0 && (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{unit.bedrooms}</span>
                        <span className="text-muted-foreground">{unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                      </span>
                    )}
                    {(unit.bathrooms ?? 0) > 0 && (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{unit.bathrooms}</span>
                        <span className="text-muted-foreground">{unit.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                      </span>
                    )}
                    {(unit.area ?? 0) > 0 && (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Maximize2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{unit.area}</span>
                        <span className="text-muted-foreground">m²</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Address & meter */}
                <div className="space-y-2">
                  {unit.streetAddress && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-foreground">{unit.streetAddress}</span>
                    </div>
                  )}
                  {unit.meterNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Meter:</span>
                      <span className="font-mono text-foreground">{unit.meterNumber}</span>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {activeAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {activeAmenities.map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs font-normal">{a}</Badge>
                    ))}
                  </div>
                )}

                {/* Description */}
                {unit.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {unit.description}
                  </p>
                )}
              </div>

              {/* ── Media section ──────────────────────────────── */}
              <Separator />

              <div className="space-y-1 mb-3">
                <p className="text-sm font-semibold text-foreground">Listing Media</p>
                <p className="text-xs text-muted-foreground">Marketing images and video for this unit</p>
              </div>

              <div className="space-y-6">
                {images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Image className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Images ({images.length})</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {images.map((img) => (
                        <div key={img.publicId} className="relative group">
                          <img
                            src={img.url}
                            alt={img.caption || 'Property'}
                            className="w-full h-20 object-cover rounded-lg border hover:border-primary transition-colors cursor-pointer"
                            onClick={() => setLightboxUrl(img.url)}
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button onClick={() => setLightboxUrl(img.url)} className="p-1 bg-black/40 rounded text-white">
                              <ZoomIn className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(img.publicId)}
                              disabled={deletingId === img.publicId}
                              className="p-1 bg-red-600/80 rounded text-white"
                            >
                              {deletingId === img.publicId
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Trash2 className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {videos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Videos ({videos.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {videos.map((vid) => (
                        <div key={vid.publicId} className="relative group">
                          <video
                            src={vid.url}
                            poster={vid.thumbnail}
                            className="w-full h-40 object-cover rounded-lg border"
                            controls
                          />
                          <button
                            onClick={() => handleDeleteVideo(vid.publicId)}
                            disabled={deletingId === vid.publicId}
                            className="absolute top-2 right-2 p-1 bg-red-600/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {deletingId === vid.publicId
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* History / move-in media */}
                {(historyPhotos.length > 0 || historyVideos.length > 0) && (
                  <div className={images.length > 0 || videos.length > 0 ? 'border-t pt-5' : ''}>
                    <Badge variant="outline" className="text-xs mb-3">Move-in Documentation</Badge>
                    {historyPhotos.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
                        {historyPhotos.map((p) => (
                          <div key={(p as any).public_id ?? p.publicId} className="relative group cursor-pointer">
                            <img
                              src={p.url}
                              alt="Move-in"
                              className="w-full h-20 object-cover rounded-lg border hover:border-primary transition-colors"
                              onClick={() => setLightboxUrl(p.url)}
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {historyVideos.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {historyVideos.map((v) => (
                          <video key={(v as any).public_id ?? v.publicId} src={v.url} className="w-full h-40 object-cover rounded-lg border" controls />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {images.length === 0 && videos.length === 0 && historyPhotos.length === 0 && historyVideos.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border-2 border-dashed border-border">
                    <Image className="h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No listing media uploaded yet.</p>
                    {unitId && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => openDialog('upload')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload first photo
                      </Button>
                    )}
                  </div>
                )}

                {(images.length > 0 || videos.length > 0) && (
                  <p className="text-xs text-muted-foreground">
                    {images.length} image{images.length !== 1 ? 's' : ''} · {videos.length} video{videos.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm">Unit details unavailable.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload / Update dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!uploading) { setDialogOpen(v); if (!v) clearStaged(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'update' ? 'Replace Unit Media' : 'Upload Property Media'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {dialogMode === 'update' && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This will <strong>replace all existing media</strong>. Current images and videos will be permanently removed from Cloudinary.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Image className="h-4 w-4" /> Images ({stagedImages.length}/10)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={stagedImages.length >= 10 || uploading}
                  onClick={() => imageInputRef.current?.click()}
                >
                  Choose images
                </Button>
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-16 object-cover rounded-lg border" />
                      <button
                        onClick={() => removeStagedImage(i)}
                        disabled={uploading}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Video className="h-4 w-4" /> Video (1 max, up to 200 MB)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!stagedVideo || uploading}
                  onClick={() => videoInputRef.current?.click()}
                >
                  Choose video
                </Button>
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              {videoPreview && (
                <div className="relative group w-full">
                  <video src={videoPreview} className="w-full h-32 object-cover rounded-lg border" muted />
                  <p className="text-xs text-muted-foreground mt-1 truncate">{stagedVideo?.name}</p>
                  <button
                    onClick={() => { setStagedVideo(null); setVideoPreview(null); }}
                    disabled={uploading}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" onClick={() => { setDialogOpen(false); clearStaged(); }} disabled={uploading}>
                Cancel
              </Button>
              <Button
                onClick={dialogMode === 'update' ? handleUpdate : handleUpload}
                disabled={uploading || (stagedImages.length === 0 && !stagedVideo)}
                variant={dialogMode === 'update' ? 'destructive' : 'default'}
              >
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {uploading
                  ? patching ? 'Saving…' : `Uploading ${stagedImages.length + (stagedVideo ? 1 : 0)} file(s)…`
                  : dialogMode === 'update'
                  ? `Replace with ${stagedImages.length + (stagedVideo ? 1 : 0)} file(s)`
                  : `Upload ${stagedImages.length + (stagedVideo ? 1 : 0)} file(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Property Image</DialogTitle></DialogHeader>
          {lightboxUrl && (
            <div className="flex justify-center">
              <img src={lightboxUrl} alt="Property" className="max-h-[70vh] object-contain rounded" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
