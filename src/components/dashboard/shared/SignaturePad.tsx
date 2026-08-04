import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import "./signature-pad.css";

export interface SignaturePadHandle {
  clear: () => void;
  hasSignature: () => boolean;
  dataUrl: () => string;
}

export const SignaturePad = forwardRef<
  SignaturePadHandle,
  { onSignedChange?: (signed: boolean) => void }
>(({ onSignedChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#16241C";
      ctxRef.current = ctx;
    }
  }, []);

  React.useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    hasDrawn.current = true;
    onSignedChange?.(true);
    const { x, y } = pos(e);
    ctxRef.current?.beginPath();
    ctxRef.current?.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const { x, y } = pos(e);
    ctxRef.current?.lineTo(x, y);
    ctxRef.current?.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
    hasDrawn.current = false;
    onSignedChange?.(false);
  };

  useImperativeHandle(ref, () => ({
    clear,
    hasSignature: () => hasDrawn.current,
    dataUrl: () => canvasRef.current?.toDataURL("image/png") ?? "",
  }));

  return (
    <div className="sig-pad__wrap">
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
    </div>
  );
});
SignaturePad.displayName = "SignaturePad";

export function SignatureField({
  padRef,
  label,
  required,
  signed,
  optionalHint,
  viewOnly,
  imageSrc,
}: {
  padRef: React.RefObject<SignaturePadHandle>;
  label: string;
  required?: boolean;
  signed: boolean;
  optionalHint?: string;
  viewOnly?: boolean;
  imageSrc?: string | null;
}) {
  if (viewOnly) {
    return (
      <div className="sig-pad__field sig-pad__field--full">
        <label className="sig-pad__label">{label}</label>
        <div className="sig-pad__wrap">
          {imageSrc ? (
            <img src={imageSrc} alt="Signature" style={{ maxHeight: "100%", maxWidth: "100%" }} />
          ) : (
            <span className="sig-pad__note">No signature on file</span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="sig-pad__field sig-pad__field--full">
      <label className="sig-pad__label">
        {label}
        {required && <span className="sig-pad__req">*</span>}
      </label>
      <SignaturePad ref={padRef} onSignedChange={() => { /* status re-render handled by parent state */ }} />
      <div className="sig-pad__tools">
        <button type="button" onClick={() => padRef.current?.clear()}>Clear Signature</button>
        <span className="sig-pad__note">{signed ? "Signed" : "Not yet signed"}</span>
      </div>
      {optionalHint && <p className="sig-pad__note">{optionalHint}</p>}
    </div>
  );
}
