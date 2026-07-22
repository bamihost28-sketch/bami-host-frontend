import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useGetMyAgreementQuery,
  useSignMyAgreementMutation,
  useUploadAgreementIdMutation,
  useLazyDownloadMyAgreementQuery,
} from "@/services/agreementApi";
import { FileSignature, CheckCircle2, Loader, Download, Eraser, Upload } from "lucide-react";
import "./tenancy-agreement.css";

const ID_TYPES = [
  "Permanent Voter's Card (PVC)",
  "Driver's License",
  "National ID Card (NIN Slip)",
  "International Passport",
  "National ID Number (NIN) only",
];

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
        ctx.strokeStyle = "#16241C";
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
      <div className="tenancy-doc__sigwrap">
        <canvas
          ref={canvasRef}
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

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="tenancy-doc__section-head">
      <span className="tenancy-doc__section-num">{num}</span>
      <h2>{title}</h2>
    </div>
  );
}

export const TenancyAgreementTab = () => {
  const { toast } = useToast();
  const { data, isLoading } = useGetMyAgreementQuery();
  const [signAgreement, { isLoading: signing }] = useSignMyAgreementMutation();
  const [uploadId, { isLoading: uploadingId }] = useUploadAgreementIdMutation();
  const [triggerDownload, { isFetching: downloading }] = useLazyDownloadMyAgreementQuery();

  // Section 1: tenant particulars
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [employer, setEmployer] = useState("");

  // Section 3: ID verification
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const idFileRef = useRef<HTMLInputElement>(null);

  // Section 4: next of kin
  const [kinName, setKinName] = useState("");
  const [kinRelationship, setKinRelationship] = useState("");
  const [kinPhone, setKinPhone] = useState("");

  // Section 6: execution
  const [typedName, setTypedName] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [witnessName, setWitnessName] = useState("");
  const [witnessAddress, setWitnessAddress] = useState("");
  const [witnessOccupation, setWitnessOccupation] = useState("");
  const [witnessPhone, setWitnessPhone] = useState("");
  const [witnessRelationship, setWitnessRelationship] = useState("");
  const [witnessTypedName, setWitnessTypedName] = useState("");
  const [witnessSignatureImage, setWitnessSignatureImage] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  if (isLoading) {
    return (
      <div className="tenancy-doc__desk">
        <div className="tenancy-doc__paper p-8 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const agreement = data?.data;
  if (!agreement) {
    return (
      <div className="tenancy-doc tenancy-doc__desk">
        <div className="tenancy-doc__paper p-6 text-sm text-muted-foreground">
          No tenancy agreement is available yet.
        </div>
      </div>
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileName(file.name);
    try {
      const result = await uploadId(file).unwrap();
      setIdDocumentUrl(result.data.url);
    } catch {
      toast({ title: "Upload failed", description: "Couldn't upload your ID. Try again.", variant: "destructive" });
      setIdFileName(null);
    }
  };

  const canSubmit =
    agreed &&
    typedName.trim().length > 0 &&
    address.trim().length > 0 &&
    occupation.trim().length > 0 &&
    idType.trim().length > 0 &&
    idNumber.trim().length > 0 &&
    !!idDocumentUrl &&
    kinName.trim().length > 0 &&
    kinRelationship.trim().length > 0 &&
    kinPhone.trim().length > 0 &&
    witnessName.trim().length > 0 &&
    witnessAddress.trim().length > 0 &&
    witnessOccupation.trim().length > 0 &&
    witnessRelationship.trim().length > 0 &&
    witnessTypedName.trim().length > 0;

  const handleSign = async () => {
    if (!canSubmit || !idDocumentUrl) return;
    try {
      await signAgreement({
        typedName: typedName.trim(),
        signatureImage,
        address: address.trim(),
        occupation: occupation.trim(),
        employer: employer.trim() || undefined,
        idType,
        idNumber: idNumber.trim(),
        idDocumentUrl,
        kinName: kinName.trim(),
        kinRelationship: kinRelationship.trim(),
        kinPhone: kinPhone.trim(),
        witnessName: witnessName.trim(),
        witnessAddress: witnessAddress.trim(),
        witnessOccupation: witnessOccupation.trim(),
        witnessPhone: witnessPhone.trim() || undefined,
        witnessRelationship: witnessRelationship.trim(),
        witnessTypedName: witnessTypedName.trim(),
        witnessSignatureImage,
      }).unwrap();
      toast({ title: "Registration submitted", description: "Downloading your signed copy…" });
      await handleDownload();
    } catch (e: any) {
      toast({ title: "Couldn't sign", description: e?.data?.detail || "Try again.", variant: "destructive" });
    }
  };

  return (
    <div className="tenancy-doc tenancy-doc__desk">
      <div className="tenancy-doc__desk-label">{parties.estateName} · Digital Tenancy Registry</div>

      <div className="tenancy-doc__paper">
        <div className="tenancy-doc__letterhead">
          <span className="tenancy-doc__ribbon">
            {data?.signed ? "Signed & On File" : "Prepared for your review"}
          </span>
          <h1>Tenancy Agreement</h1>
          <p>Between {parties.landlordName} and {parties.tenantName}</p>
          <div className="tenancy-doc__refnum">
            {parties.unitLabel} · {parties.estateName} · Rent {parties.rentDisplay}
          </div>
        </div>

        <div className="tenancy-doc__recitals">
          <p>
            This TENANCY AGREEMENT is made this{" "}
            {(data?.signed && agreement.signedAt ? new Date(agreement.signedAt) : new Date())
              .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            , between <strong>{parties.landlordName}</strong> ("the Landlord") and{" "}
            <strong>{parties.tenantName}</strong> ("the Tenant"), for the renting of a{" "}
            {parties.bedroomCount} {parties.unitLabel} at {parties.estateName}
            {parties.estateAddress ? `, ${parties.estateAddress}` : ""}, commencing{" "}
            {parties.startDateDisplay}, at a rent of {parties.rentDisplay}.
          </p>
        </div>

        <div className="tenancy-doc__body">
          {data?.signed ? (
            <SignedView agreement={agreement} onDownload={handleDownload} downloading={downloading} />
          ) : (
            <>
              <div className="tenancy-doc__section" style={{ marginTop: 0 }}>
                <SectionHead num="01" title="Parties to the Agreement" />
                <dl className="tenancy-doc__summary-grid mb-4">
                  <dt>Landlord</dt><dd>{parties.landlordName}</dd>
                  <dt>Tenant</dt><dd>{parties.tenantName}</dd>
                  <dt>Phone</dt><dd>{parties.tenantPhone || "—"}</dd>
                  <dt>Email</dt><dd>{parties.tenantEmail || "—"}</dd>
                </dl>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="tenancy-doc__label">Current Residential Address *</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, city" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="tenancy-doc__label">Occupation *</Label>
                    <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="tenancy-doc__label">Employer / Business Name</Label>
                    <Input value={employer} onChange={(e) => setEmployer(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="tenancy-doc__section">
                <SectionHead num="02" title="Premises & Rent" />
                <dl className="tenancy-doc__summary-grid">
                  <dt>Unit</dt><dd>{parties.unitLabel}</dd>
                  <dt>Estate</dt><dd>{parties.estateName}{parties.estateAddress ? `, ${parties.estateAddress}` : ""}</dd>
                  <dt>Rent</dt><dd>{parties.rentDisplay}</dd>
                  {!!parties.cautionFee && <><dt>Caution Fee</dt><dd>{parties.cautionFeeDisplay}</dd></>}
                  {!!parties.legalFee && <><dt>Legal Fee</dt><dd>{parties.legalFeeDisplay}</dd></>}
                  <dt>Tenancy Start</dt><dd>{parties.startDateDisplay}</dd>
                </dl>
              </div>

              <div className="tenancy-doc__section">
                <SectionHead num="03" title="Identity Verification" />
                <div className="tenancy-doc__idblock space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="tenancy-doc__label">ID Type *</Label>
                      <Select value={idType} onValueChange={setIdType}>
                        <SelectTrigger><SelectValue placeholder="Select an ID type" /></SelectTrigger>
                        <SelectContent>
                          {ID_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="tenancy-doc__label">ID Number *</Label>
                      <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="As shown on the document" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="tenancy-doc__label">Upload Clear Photo / Scan of ID *</Label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={idFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button type="button" variant="outline" size="sm" disabled={uploadingId} onClick={() => idFileRef.current?.click()}>
                        {uploadingId ? <Loader className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                        Choose File
                      </Button>
                      {idFileName && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {idDocumentUrl ? "✓ " : "Uploading… "}{idFileName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs italic" style={{ color: "var(--muted)" }}>
                      Used only to verify the details you've entered above.
                    </p>
                  </div>
                </div>
              </div>

              <div className="tenancy-doc__section">
                <SectionHead num="04" title="Emergency Contact / Next of Kin" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="tenancy-doc__label">Full Name *</Label>
                    <Input value={kinName} onChange={(e) => setKinName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="tenancy-doc__label">Relationship *</Label>
                    <Input value={kinRelationship} onChange={(e) => setKinRelationship(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="tenancy-doc__label">Phone Number *</Label>
                    <Input value={kinPhone} onChange={(e) => setKinPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="tenancy-doc__section">
                <SectionHead num="05" title="Terms of Tenancy" />
                <div className="tenancy-doc__clauses">
                  <ol>{terms.map((t, i) => <li key={i}>{t}</li>)}</ol>
                </div>
              </div>

              <div className="tenancy-doc__section">
                <SectionHead num="06" title="Execution & Witnessing" />
                <div className="space-y-5">
                  <div className="tenancy-doc__agree-row">
                    <Checkbox id="agreeTerms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
                    <Label htmlFor="agreeTerms" className="text-sm font-normal leading-snug" style={{ fontFamily: "'Source Serif 4', serif" }}>
                      I confirm I have read, understood, and agree to be bound by the terms of this Tenancy Agreement.
                    </Label>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'Zilla Slab', serif" }}>Your signature</p>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Type your full name as signature *</Label>
                        <Input className="tenancy-doc__typed-sig" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder={parties.tenantName} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Or sign below with mouse or finger (optional)</Label>
                        <SignaturePad onChange={setSignatureImage} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2" style={{ borderTop: "1px dashed #c9bd9a" }}>
                    <p className="text-sm font-semibold mb-3 mt-4" style={{ fontFamily: "'Zilla Slab', serif" }}>Witness — in your presence</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Witness Name *</Label>
                        <Input value={witnessName} onChange={(e) => setWitnessName(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Witness Address *</Label>
                        <Input value={witnessAddress} onChange={(e) => setWitnessAddress(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Witness Occupation *</Label>
                        <Input value={witnessOccupation} onChange={(e) => setWitnessOccupation(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Witness Phone Number</Label>
                        <Input value={witnessPhone} onChange={(e) => setWitnessPhone(e.target.value)} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="tenancy-doc__label">Relationship to Tenant *</Label>
                        <Input value={witnessRelationship} onChange={(e) => setWitnessRelationship(e.target.value)} placeholder="e.g. Family member, Friend, Colleague" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Witness's Typed Name as Signature *</Label>
                        <Input className="tenancy-doc__typed-sig" value={witnessTypedName} onChange={(e) => setWitnessTypedName(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="tenancy-doc__label">Witness to sign below with mouse or finger (optional)</Label>
                        <SignaturePad onChange={setWitnessSignatureImage} />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSign} disabled={!canSubmit || signing} className="tenancy-doc__btn-primary w-full sm:w-auto">
                    {signing ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : <FileSignature className="h-4 w-4 mr-1.5" />}
                    Sign & Submit Registration
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="tenancy-doc__prepared-by">
        <div>
          <div className="tenancy-doc__prepared-by-line" />
          <p className="tenancy-doc__prepared-by-label">Prepared By:</p>
          <p>
            <strong>{parties.preparedByName}</strong><br />
            {parties.preparedByAddress}<br />
            G.S.M: {parties.preparedByPhone}<br />
            E-mail: {parties.preparedByEmail}
          </p>
        </div>
      </div>
    </div>
  );
};

function SignedView({ agreement, onDownload, downloading }: {
  agreement: NonNullable<ReturnType<typeof useGetMyAgreementQuery>["data"]>["data"];
  onDownload: () => void;
  downloading: boolean;
}) {
  if (!agreement) return null;
  const { terms, registration } = agreement;
  return (
    <>
      <div className="tenancy-doc__signed-banner">
        <div className="tenancy-doc__seal"><CheckCircle2 className="h-6 w-6" /></div>
        <div className="flex-1">
          <p className="font-semibold" style={{ fontFamily: "'Zilla Slab', serif" }}>Registration signed</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Signed by {agreement.typedName} on{" "}
            {agreement.signedAt ? new Date(agreement.signedAt).toLocaleDateString() : ""}
          </p>
        </div>
        <Button size="sm" className="tenancy-doc__btn-seal" onClick={onDownload} disabled={downloading}>
          {downloading ? <Loader className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
          Download PDF
        </Button>
      </div>

      <div className="tenancy-doc__section">
        <SectionHead num="01" title="Tenant Particulars" />
        <dl className="tenancy-doc__summary-grid">
          <dt>Address</dt><dd>{registration.address}</dd>
          <dt>Occupation</dt><dd>{registration.occupation}</dd>
          {registration.employer && <><dt>Employer</dt><dd>{registration.employer}</dd></>}
          <dt>ID Type</dt><dd>{registration.idType}</dd>
          <dt>ID Number</dt><dd>{registration.idNumber}</dd>
        </dl>
      </div>

      <div className="tenancy-doc__section">
        <SectionHead num="02" title="Next of Kin" />
        <dl className="tenancy-doc__summary-grid">
          <dt>Name</dt><dd>{registration.kinName}</dd>
          <dt>Relationship</dt><dd>{registration.kinRelationship}</dd>
          <dt>Phone</dt><dd>{registration.kinPhone}</dd>
        </dl>
      </div>

      <div className="tenancy-doc__section">
        <SectionHead num="03" title="Terms of Tenancy" />
        <div className="tenancy-doc__clauses">
          <ol>{terms.map((t, i) => <li key={i}>{t}</li>)}</ol>
        </div>
      </div>

      <div className="tenancy-doc__section">
        <SectionHead num="04" title="Signatures" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>Tenant</p>
            {agreement.signatureImage && (
              <img src={agreement.signatureImage} alt="Tenant signature" className="h-14 border rounded bg-white mb-1" />
            )}
            <p className="text-sm italic" style={{ fontFamily: "'Zilla Slab', serif" }}>{agreement.typedName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>Witness</p>
            {registration.witnessSignatureImage && (
              <img src={registration.witnessSignatureImage} alt="Witness signature" className="h-14 border rounded bg-white mb-1" />
            )}
            <p className="text-sm italic" style={{ fontFamily: "'Zilla Slab', serif" }}>{registration.witnessTypedName || registration.witnessName}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {registration.witnessOccupation}, {registration.witnessAddress} ({registration.witnessRelationship} of the Tenant)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
