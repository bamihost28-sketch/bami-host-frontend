import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  useGetUnitConditionReportsQuery,
  useAddUnitConditionReportMutation,
  useDeleteUnitConditionReportMutation,
  type ConditionReportType,
  type ConditionRating,
} from '@/services/estatesApi';
import {
  ClipboardList,
  Plus,
  Trash2,
  ZoomIn,
  Image,
  Video,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';

const TYPE_LABELS: Record<ConditionReportType, string> = {
  move_in: 'Move-in',
  move_out: 'Move-out',
  routine: 'Routine',
  maintenance: 'Maintenance',
  pre_listing: 'Pre-listing',
};

const TYPE_COLORS: Record<ConditionReportType, string> = {
  move_in: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  move_out: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  routine: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  pre_listing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const CONDITION_COLORS: Record<ConditionRating, string> = {
  excellent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  good: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

interface ConditionReportsCardProps {
  unitId?: string;
  tenantId?: string;
}

export const ConditionReportsCard = ({ unitId, tenantId }: ConditionReportsCardProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ConditionReportType | 'all'>('all');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    type: '' as ConditionReportType | '',
    overallCondition: '' as ConditionRating | '',
    notes: '',
    date: '',
  });
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [stagedVideo, setStagedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isFetching } = useGetUnitConditionReportsQuery(
    { unitId: unitId as string, type: typeFilter === 'all' ? undefined : typeFilter },
    { skip: !unitId }
  );
  const [addReport, { isLoading: submitting }] = useAddUnitConditionReportMutation();
  const [deleteReport] = useDeleteUnitConditionReportMutation();

  const reports = data?.data ?? [];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (stagedImages.length + files.length > 20) {
      toast({ title: 'Too many images', description: 'Maximum 20 images per report.', variant: 'destructive' });
      return;
    }
    setStagedImages((p) => [...p, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((p) => [...p, ev.target?.result as string]);
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

  const removeStagedImage = (i: number) => {
    setStagedImages((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const resetForm = () => {
    setForm({ type: '', overallCondition: '', notes: '', date: '' });
    setStagedImages([]);
    setImagePreviews([]);
    setStagedVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = async () => {
    if (!unitId || !form.type || !form.overallCondition) {
      toast({ title: 'Missing fields', description: 'Type and overall condition are required.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('type', form.type);
    formData.append('overallCondition', form.overallCondition);
    if (form.notes) formData.append('notes', form.notes);
    if (form.date) formData.append('date', form.date);
    if (tenantId) formData.append('tenantId', tenantId);
    stagedImages.forEach((f) => formData.append('images', f));
    if (stagedVideo) formData.append('video', stagedVideo);

    try {
      await addReport({ unitId, formData }).unwrap();
      toast({ title: 'Report saved', description: 'Condition report added successfully.' });
      resetForm();
      setAddOpen(false);
    } catch {
      toast({ title: 'Failed to save', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!unitId) return;
    setDeletingId(reportId);
    try {
      await deleteReport({ unitId, reportId }).unwrap();
      toast({ title: 'Deleted', description: 'Condition report removed.' });
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Condition Reports
              </CardTitle>
              <CardDescription>Inspection snapshots — move-in, move-out, routine checks</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Type filter */}
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ConditionReportType | 'all')}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {(Object.keys(TYPE_LABELS) as ConditionReportType[]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unitId && (
                <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Report
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto opacity-40 mb-2" />
              <p className="text-sm">No condition reports yet.</p>
            </div>
          ) : (
            <div className={`space-y-3 ${isFetching ? 'opacity-60' : ''}`}>
              {reports.map((report) => {
                const id = report._id ?? report.id ?? '';
                const isExpanded = expandedId === id;
                return (
                  <div key={id} className="rounded-lg border bg-slate-50 dark:bg-slate-800/50">
                    {/* Report header row */}
                    <div className="flex items-center justify-between p-4 gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap min-w-0">
                        <Badge className={`text-xs shrink-0 ${TYPE_COLORS[report.type]}`}>
                          {TYPE_LABELS[report.type]}
                        </Badge>
                        <Badge className={`text-xs shrink-0 ${CONDITION_COLORS[report.overallCondition]}`}>
                          {report.overallCondition.charAt(0).toUpperCase() + report.overallCondition.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatDate(report.date)}</span>
                        {report.images.length > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Image className="h-3 w-3" /> {report.images.length}
                          </span>
                        )}
                        {report.videos.length > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Video className="h-3 w-3" /> {report.videos.length}
                          </span>
                        )}
                        {report.notes && (
                          <span className="text-xs text-muted-foreground truncate max-w-xs hidden sm:block">
                            {report.notes.length > 60 ? report.notes.slice(0, 60) + '…' : report.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setExpandedId(isExpanded ? null : id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                        >
                          {deletingId === id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t px-4 pb-4 pt-3 space-y-4">
                        {report.notes && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
                          </div>
                        )}

                        {report.recordedBy && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>
                              Recorded by{' '}
                              {typeof report.recordedBy === 'string'
                                ? report.recordedBy
                                : report.recordedBy.name ?? report.recordedBy.email ?? 'Unknown'}
                            </span>
                          </div>
                        )}

                        {report.images.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Images ({report.images.length})
                            </p>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                              {report.images.map((img, i) => (
                                <div key={img.publicId ?? i} className="relative group cursor-pointer">
                                  <img
                                    src={img.url}
                                    alt={img.caption || 'Condition'}
                                    className="w-full h-16 object-cover rounded border hover:border-primary transition-colors"
                                    onClick={() => setLightboxUrl(img.url)}
                                  />
                                  <div className="absolute inset-0 bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {report.videos.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Videos ({report.videos.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {report.videos.map((vid, i) => (
                                <video
                                  key={vid.publicId ?? i}
                                  src={vid.url}
                                  poster={vid.thumbnail}
                                  className="w-full h-36 object-cover rounded border"
                                  controls
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add report dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => { if (!submitting) { setAddOpen(v); if (!v) resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Condition Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Type + Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Report type <span className="text-destructive">*</span></p>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ConditionReportType }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as ConditionReportType[]).map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Overall condition <span className="text-destructive">*</span></p>
                <Select value={form.overallCondition} onValueChange={(v) => setForm((f) => ({ ...f, overallCondition: v as ConditionRating }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Date <span className="text-xs text-muted-foreground">(optional, defaults to today)</span></p>
              <Input
                type="date"
                value={form.date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Notes</p>
              <Textarea
                placeholder="Describe the condition — damage, cleanliness, appliances, fixtures…"
                rows={4}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Image className="h-4 w-4" /> Photos ({stagedImages.length}/20)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={stagedImages.length >= 20 || submitting}
                  onClick={() => imageInputRef.current?.click()}
                >
                  Choose photos
                </Button>
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-14 object-cover rounded border" />
                      <button
                        onClick={() => removeStagedImage(i)}
                        disabled={submitting}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Video className="h-4 w-4" /> Walkthrough video (optional, up to 200 MB)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!stagedVideo || submitting}
                  onClick={() => videoInputRef.current?.click()}
                >
                  Choose video
                </Button>
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              {videoPreview && (
                <div className="relative w-full">
                  <video src={videoPreview} className="w-full h-28 object-cover rounded border" muted />
                  <p className="text-xs text-muted-foreground mt-1 truncate">{stagedVideo?.name}</p>
                  <button
                    onClick={() => { setStagedVideo(null); setVideoPreview(null); }}
                    disabled={submitting}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" onClick={() => { setAddOpen(false); resetForm(); }} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !form.type || !form.overallCondition}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitting ? 'Saving…' : 'Save Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Condition Photo</DialogTitle></DialogHeader>
          {lightboxUrl && (
            <div className="flex justify-center">
              <img src={lightboxUrl} alt="Condition" className="max-h-[70vh] object-contain rounded" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
