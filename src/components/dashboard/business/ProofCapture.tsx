import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildProof, proofFromFile, type ProofResult } from "@/lib/proofImage";
import { useProofUrl } from "@/lib/proofStorage";

interface Props {
  open: boolean;
  title: string;
  /** Lines burned into the photo, e.g. machine, check, operator. The time is added at capture. */
  stampLines: string[];
  onClose: () => void;
  onCaptured: (proof: ProofResult) => void;
}

/** Live camera capture. There is no gallery picker, so an old photo cannot be chosen. */
export const ProofCapture = ({ open, title, stampLines, onClose, onCaptured }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stamp = () => [...stampLines, new Date().toLocaleString()];

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setReady(false);
    setError(null);
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This device or connection does not allow camera access.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => undefined);
        }
        setReady(true);
      } catch {
        setError("Camera permission was denied or no camera was found.");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const snap = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    setBusy(true);
    try {
      onCaptured(await buildProof(v, v.videoWidth, v.videoHeight, stamp(), "camera"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not take the photo.");
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onCaptured(await proofFromFile(file, stamp()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not use that photo.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <video ref={videoRef} playsInline muted className="w-full rounded bg-black aspect-video object-cover" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" onClick={snap} disabled={!ready || busy}>
            {busy ? "Saving…" : "Take photo"}
          </Button>
          {error && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                No camera here? Take a photo with your phone camera and choose it now. Photos older than 5 minutes are rejected, and the owner is told it was uploaded.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="text-sm"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ProofThumb = ({ proofId, className }: { proofId?: string; className?: string }) => {
  const url = useProofUrl(proofId);
  if (!proofId) return null;
  return url ? (
    <a href={url} target="_blank" rel="noreferrer">
      <img src={url} alt="Proof" className={className ?? "h-16 w-24 rounded object-cover border"} />
    </a>
  ) : (
    <div className={className ?? "h-16 w-24 rounded border bg-muted"} />
  );
};
