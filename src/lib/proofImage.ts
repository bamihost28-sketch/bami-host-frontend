// Proof photos for the operator's pre-start checks.
//
// Goal: each check (water, oil, walk-round) must be backed by a photo taken NOW, not an old one.
//  - The in-app camera is the main path: no gallery picker, so an old photo cannot be chosen.
//  - Every proof is stamped on the image with machine, check, operator and date/time.
//  - Every proof gets a SHA-256 of its pixels/bytes and a small perceptual fingerprint (dHash), so a
//    photo that was already used (same file, or a re-saved copy) is rejected.
//  - Fallback when no camera is available: a phone-camera file input, accepted only if the file was
//    modified in the last few minutes. This is weaker and is flagged to the owner.
//
// All of this runs on the device's clock and can be defeated by a determined person. Real
// verification needs the server to stamp the upload time. See the note in the equipment docs.

export type ProofSource = "camera" | "upload";

export interface ProofResult {
  blob: Blob;
  hash: string;
  dhash: string;
  source: ProofSource;
  capturedAt: string; // ISO
}

const MAX_WIDTH = 800;
export const UPLOAD_MAX_AGE_MS = 5 * 60 * 1000;
/** Uploaded photos whose fingerprint is this close (out of 64 bits) to an earlier proof count as the same picture. */
export const DHASH_DUPLICATE_DISTANCE = 2;

export const sha256Hex = async (buf: ArrayBuffer): Promise<string> => {
  if (!globalThis.crypto?.subtle) return "";
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const dHashOf = (source: CanvasImageSource): string => {
  const c = document.createElement("canvas");
  c.width = 9;
  c.height = 8;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(source, 0, 0, 9, 8);
  const px = ctx.getImageData(0, 0, 9, 8).data;
  const gray = (x: number, y: number) => {
    const i = (y * 9 + x) * 4;
    return px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
  };
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += gray(x, y) > gray(x + 1, y) ? "1" : "0";
  return bits;
};

export const hamming = (a: string, b: string): number => {
  if (!a || !b || a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
};

const toBlob = (canvas: HTMLCanvasElement, quality = 0.7) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create the image"))), "image/jpeg", quality)
  );

/** Scale the frame, fingerprint it, then burn the stamp text into a copy that is kept as the proof. */
export const buildProof = async (
  source: CanvasImageSource,
  width: number,
  height: number,
  stampLines: string[],
  kind: ProofSource,
  fileBytes?: ArrayBuffer
): Promise<ProofResult> => {
  const scale = Math.min(1, MAX_WIDTH / width);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const raw = document.createElement("canvas");
  raw.width = w;
  raw.height = h;
  const rctx = raw.getContext("2d");
  if (!rctx) throw new Error("Canvas is not available on this device");
  rctx.drawImage(source, 0, 0, w, h);

  const dhash = dHashOf(raw);
  const hash = await sha256Hex(fileBytes ?? (await (await toBlob(raw, 0.9)).arrayBuffer()));

  const stamped = document.createElement("canvas");
  stamped.width = w;
  stamped.height = h;
  const sctx = stamped.getContext("2d")!;
  sctx.drawImage(raw, 0, 0);
  const lineH = Math.max(14, Math.round(w / 40));
  const barH = lineH * stampLines.length + 10;
  sctx.fillStyle = "rgba(0,0,0,0.65)";
  sctx.fillRect(0, h - barH, w, barH);
  sctx.fillStyle = "#fff";
  sctx.font = `${lineH - 2}px sans-serif`;
  stampLines.forEach((line, i) => sctx.fillText(line, 8, h - barH + 6 + lineH * (i + 1) - 4));

  return { blob: await toBlob(stamped), hash, dhash, source: kind, capturedAt: new Date().toISOString() };
};

export const proofFromFile = async (file: File, stampLines: string[]): Promise<ProofResult> => {
  const age = Date.now() - file.lastModified;
  if (age > UPLOAD_MAX_AGE_MS || age < -60_000) {
    throw new Error("That photo was not taken just now. Take a new photo with the camera.");
  }
  const bytes = await file.arrayBuffer();
  const bitmap = await createImageBitmap(new Blob([bytes], { type: file.type || "image/jpeg" }));
  try {
    return await buildProof(bitmap, bitmap.width, bitmap.height, stampLines, "upload", bytes);
  } finally {
    bitmap.close();
  }
};
