import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/providers/ToastProvider";
import { useReportIssueMutation } from "@/services/estatesApi";
import { ImageIcon, Video, X, Loader, Upload } from "lucide-react";

interface ReportIssueDialogProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "structural", label: "Structural" },
  { value: "water", label: "Water" },
  { value: "security", label: "Security" },
  { value: "cleaning", label: "Cleaning" },
  { value: "internet", label: "Internet" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const ReportIssueDialog: React.FC<ReportIssueDialogProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const [reportIssue, { isLoading }] = useReportIssueMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...images, ...files].slice(0, 5);
    setImages(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVideos([...videos, ...files].slice(0, 2));
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    const next = images.filter((_, idx) => idx !== i);
    setImages(next);
    setImagePreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeVideo = (i: number) => setVideos(videos.filter((_, idx) => idx !== i));

  const reset = () => {
    setTitle(""); setDescription(""); setCategory(""); setPriority("medium");
    setImages([]); setVideos([]); setImagePreviews([]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast("Error: Title is required"); return; }
    if (!description.trim()) { toast("Error: Description is required"); return; }
    if (!category) { toast("Error: Please select a category"); return; }

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    fd.append("category", category);
    fd.append("priority", priority);
    images.forEach((f) => fd.append("images", f));
    videos.forEach((f) => fd.append("videos", f));

    try {
      await reportIssue(fd).unwrap();
      toast("Success: Issue reported successfully");
      reset();
      onClose();
    } catch (err: any) {
      toast(`Error: ${err?.data?.message || "Failed to submit issue"}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              Photos <span className="text-slate-400 font-normal text-xs">({images.length}/5)</span>
            </Label>
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="h-16 w-16 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 5 && (
              <>
                <input
                  ref={imageRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => imageRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Add Photos
                </Button>
              </>
            )}
          </div>

          {/* Videos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Video className="h-4 w-4" />
              Videos <span className="text-slate-400 font-normal text-xs">({videos.length}/2)</span>
            </Label>
            {videos.length > 0 && (
              <div className="space-y-1">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded px-3 py-1.5 text-sm">
                    <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300">{v.name}</span>
                    <button type="button" onClick={() => removeVideo(i)} className="text-red-500 ml-2">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {videos.length < 2 && (
              <>
                <input
                  ref={videoRef}
                  type="file"
                  multiple
                  accept="video/mp4,video/mov,video/webm,video/avi"
                  className="hidden"
                  onChange={handleVideoChange}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => videoRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Add Videos
                </Button>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <><Loader className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
            ) : (
              "Submit Issue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
