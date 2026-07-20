import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetMyAgreementQuery,
  useSignMyAgreementMutation,
  useLazyDownloadMyAgreementQuery,
} from "@/services/agreementApi";
import { FileSignature, CheckCircle2, Loader, Download, Eraser } from "lucide-react";

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#1e293b";
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = pos(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = pos(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
    hasDrawn.current = true;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasDrawn.current && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-md bg-white dark:bg-slate-900">
        <canvas
          ref={canvasRef}
          className="w-full h-32 touch-none cursor-crosshair rounded-md"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={clear}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" /> Clear signature
      </Button>
    </div>
  );
}

export const TenancyAgreementTab = () => {
  const { toast } = useToast();
  const { data, isLoading } = useGetMyAgreementQuery();
  const [signAgreement, { isLoading: signing }] = useSignMyAgreementMutation();
  const [triggerDownload, { isFetching: downloading }] = useLazyDownloadMyAgreementQuery();

  const [typedName, setTypedName] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const agreement = data?.data;
  if (!agreement) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No tenancy agreement is available yet.
        </CardContent>
      </Card>
    );
  }

  const { parties, terms } = agreement;

  const handleDownload = async () => {
    try {
      const result = await triggerDownload().unwrap();
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Couldn't download", description: "Try again in a moment.", variant: "destructive" });
    }
  };

  if (data?.signed) {
    return (
      <div className="space-y-6">
        <Card className="border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="p-5 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 dark:text-green-300">Agreement signed</p>
              <p className="text-sm text-green-700 dark:text-green-400">
                Signed by {agreement.typedName} on{" "}
                {agreement.signedAt ? new Date(agreement.signedAt).toLocaleDateString() : ""}
              </p>
            </div>
            <Button size="sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Tenancy Agreement</CardTitle>
            <CardDescription>{parties.unit_label} · {parties.estate_name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {terms.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
            {agreement.signatureImage && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Signature on file</p>
                <img src={agreement.signatureImage} alt="Signature" className="h-16 border rounded bg-white" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const canSubmit = agreed && typedName.trim().length > 0;

  const handleSign = async () => {
    if (!canSubmit) return;
    try {
      await signAgreement({ typedName: typedName.trim(), signatureImage }).unwrap();
      toast({ title: "Agreement signed", description: "Thank you — your signed copy is ready to download." });
    } catch (e: any) {
      toast({ title: "Couldn't sign", description: e?.data?.detail || "Try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-blue-600" />
            Tenancy Agreement
          </CardTitle>
          <CardDescription>
            {parties.tenant_name} · {parties.unit_label}, {parties.estate_name} · Rent: {parties.rent_display}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This tenancy is between <strong>{parties.landlord_name}</strong> (Landlord) and{" "}
            <strong>{parties.tenant_name}</strong> (Tenant) for the {parties.unit_label} at{" "}
            {parties.estate_name}
            {parties.estate_address ? `, ${parties.estate_address}` : ""}, starting{" "}
            {parties.start_date_display}. Please read the terms below before signing.
          </p>
          <div className="max-h-72 overflow-y-auto border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {terms.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white text-base">Sign to accept</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2">
            <Checkbox id="agreeTerms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
            <Label htmlFor="agreeTerms" className="text-sm font-normal leading-snug">
              I confirm I have read, understood, and agree to be bound by the terms of this Tenancy Agreement.
            </Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="typedName">Type your full name as signature</Label>
            <Input
              id="typedName"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={parties.tenant_name}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Or draw your signature (optional)</Label>
            <SignaturePad onChange={setSignatureImage} />
          </div>
          <Button onClick={handleSign} disabled={!canSubmit || signing} className="w-full sm:w-auto">
            {signing ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : <FileSignature className="h-4 w-4 mr-1.5" />}
            Sign Agreement
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
