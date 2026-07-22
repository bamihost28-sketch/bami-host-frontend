import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { jsPDF } from "jspdf";
import { FileSignature, Loader, Printer } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { NBA_SEAL_DATA } from "./nbaSealData";
import "./tenancy-registration-form.css";

const TITLE_OPTIONS = ["Mr.", "Mrs.", "Miss", "Ms.", "Dr."];
const BEDROOM_OPTIONS = ["Self-Contain", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4+ Bedroom"];
const ID_TYPES = [
  "Permanent Voter's Card (PVC)",
  "Driver's License",
  "National ID Card (NIN Slip)",
  "International Passport",
  "National ID Number (NIN) only",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const LANDLORD_NAME = "MR. ALFRED EBAMI";
const SOLICITOR_NAME = "G. Anukun Esq., LL.M, AICMC.";
const SOLICITOR_ADDRESS_LINES = [
  "No. 12 Deco Road, by Efejuku Street Junction",
  "Warri, Delta State.",
  "G.S.M: 08050696537, 08068202655",
  "E-mail: godfreyanukun@gmail.com",
];
const DEFAULT_LANDLORD_PARAGRAPH =
  'MR. ALFRED EBAMI of No. 5, Oke Street, Egbokodo Itsekiri in Warri South Local Government Area of Delta State, Nigeria, (hereinafter referred to as “THE LANDLORD”, which expression shall where the context so admits include his Heirs, Assigns, Agents, Successors-in-title and Legal Representatives, of the ONE PART.';

type TermItem = {
  id: string;
  kind: "rent" | "start" | "text";
  text: string;
  removable: boolean;
};

const DEFAULT_TERMS: TermItem[] = [
  { id: "term-0", kind: "rent", text: "", removable: false },
  { id: "term-1", kind: "text", removable: false, text: "That the Tenant shall one day before the expiration of the above sum in the Recitals paid renewable and/or upon any term agreeable by the Parties, pay his rent either reviewable or renewable." },
  { id: "term-2", kind: "start", text: "", removable: false },
  { id: "term-3", kind: "text", removable: false, text: "The Tenant agrees that he has examined the Apartment and its appurtenances and that it was, at the time of the execution of these present, in good order and in tenantable condition." },
  { id: "term-4", kind: "text", removable: false, text: 'The Tenant shall not assign, underlet, sublet, transfer or part with possession of the "Apartment" and its appurtenances or any part thereof without the prior written consent of the Landlord, first had and obtained. Upon the tenant committing the act thereof, the tenancy shall automatically determine.' },
  { id: "term-5", kind: "text", removable: false, text: "The Tenant shall apply the Apartment in the Demised Premises in a fair and tenantable manner and shall not do or permit or suffer to be done on the Demised Premises/Apartment anything, which may be a nuisance to the Landlord or the other Residents and/or neighbours and shall apply the Apartment/Demised Premises strictly for residential purposes, devoid of any taint of commercial purposes." },
  { id: "term-6", kind: "text", removable: false, text: "The Tenant hereby causes to admit that the Landlord shall not provide insurance coverage for Tenant's property, nor shall the Landlord be responsible for any loss of Tenant's property, whether by theft, fire, acts of God, force, third party intervention or otherwise." },
  { id: "term-7", kind: "text", removable: false, text: "The Tenant shall comply with all the health and sanitary laws, ordinances, rules and orders of appropriate governmental authorities and homes associations, if any, with respect to the Apartment and the Demised Premises." },
  { id: "term-8", kind: "text", removable: false, text: "The Tenant before giving up possession shall cause to invite the Landlord in writing for the purpose of carrying out a joint inspection of the Apartment and the tenant shall repair or replace anything that is damaged in the apartment during the tenancy and shall put the Apartment in a tenantable condition." },
  { id: "term-9", kind: "text", removable: false, text: "The Tenant shall drive no nails or other objects whatsoever into the wall of the Apartment/Demised Premises without the express written consent of the Landlord, first had and obtained." },
  { id: "term-10", kind: "text", removable: false, text: "The Tenant shall make no alterations to the Apartment or construct any building or make other improvements without the prior written consent of the Landlord. Upon the said breach, the Tenancy shall determined and/or the Tenant shall forfeit such fixtures to the Landlord, without any lien." },
  { id: "term-11", kind: "text", removable: false, text: "The Tenant shall not be involved in fighting, stealing, trafficking of drugs and any criminal or illegal activities whatsoever. If the tenant is involved in any or all of the above vices, the consequences shall be immediate determination of the tenancy without refund of rent and forfeiture of caution fee." },
  { id: "term-12", kind: "text", removable: false, text: "The Tenant must ensure that all electrical appliances, sockets are switched off and water taps turned off before leaving the Apartment/Demised Premises at all times." },
  { id: "term-13", kind: "text", removable: false, text: "The Tenant shall not be involved in indiscriminate use of candle light, storage of fuel (petrol) in the Apartment/Demised Premises." },
  { id: "term-14", kind: "text", removable: false, text: "During the Tenancy, the Tenant shall keep the Apartment in tenantable condition and repair all the fixtures and fittings and shall also ensure that outside security lights are always lighted in the evening/night, either with generating set or BEDC." },
  { id: "term-15", kind: "text", removable: false, text: "The Tenant hereby confirm that all fittings in the accommodation are in good and perfect order and upon any demarcation and/or alteration on the Apartment, the Tenant shall restore the Apartment to its original and tenantable state upon determination of the tenancy." },
  { id: "term-16", kind: "text", removable: false, text: "The Tenant shall not cause or constitute nuisance in the Apartment/Demised Premises, neither shall he/she disturb the neighbours of the quiet enjoyment of their Apartment/Residence and upon such act, the Landlord is at liberty to determine the tenancy sooner or later and the balance rent returned thereto to the tenant." },
  { id: "term-17", kind: "text", removable: false, text: "That the Tenant not willing to continue with his tenancy shall vacate the Apartment at the end of the month in which the tenancy expires and shall submit the keys to the Landlord." },
  { id: "term-18", kind: "text", removable: false, text: "The Tenant shall participate in the monthly environmental sanitation on the Apartment/Demised Premises every last Saturday of the month to be held by the tenants and the tenant must possess his private/personal refuse bin." },
  { id: "term-19", kind: "text", removable: false, text: "The Tenant shall not under any circumstances use fire or any combustile equipment, gadget or apparatus in the Apartment/Demised Premises hereby let to him. Such an act shall automatically lead to the determination of the tenancy." },
  { id: "term-20", kind: "text", removable: false, text: "The tenant who causes any fire incident occasioning damage to the Apartment/Demised Premises shall undertake the repair or cost of same." },
  { id: "term-21", kind: "text", removable: false, text: "The Tenant who is at liberty to make use of generating set shall put off same at 12:00am (midnight) in accordance with the local security procedures put in place therein." },
  { id: "term-22", kind: "text", removable: false, text: "The Tenant shall not gain entrance into the Apartment/Demised Premises as from 12:00am (midnight)." },
  { id: "term-23", kind: "text", removable: false, text: "The Tenant shall pay security, cleaning of the Demised Premises and other levies that shall be approved from time to time in the area where the Apartment/Demised Premises is situate. The Tenants shall also make provision for waste disposal bin and also make arrangement for its evacuation." },
  { id: "term-24", kind: "text", removable: false, text: "The Tenant shall be responsible for the security of his Apartment/Demised Premises and/or properties. The Owner/Landlord admits no liability for theft, burglary and incidental matters thereto." },
  { id: "term-25", kind: "text", removable: false, text: "The Tenant hereby agrees further with the Landlord that any criminality (including fighting) shall automatically lead to the determination of the tenancy hereby created. The Tenant shall also maintain orderliness in parking and removal of his cars and vehicles and also ensure peaceful co-existence with his neighbours thereof." },
  { id: "term-26", kind: "text", removable: false, text: "The Tenant shall pay his electricity bills monthly and hand over photocopies of the receipt of payment to the Landlord, whilst keeping the original copy with him for the records and for the purpose of verification of payment by BEDC officials. The Tenant shall also ensure that a minimum of 30kw/h is always maintained in its prepaid meter and for no reason whatsoever make any by-pass thereof." },
  { id: "term-27", kind: "text", removable: false, text: "The Landlord and Landlord's agents shall have the right at all reasonable times during the pendency of the terms herein created and any renewal thereto to enter the Apartment/Demised Premises for the purpose of inspecting the Apartment and/or examine the state and condition thereof." },
  { id: "term-28", kind: "text", removable: false, text: "The Tenant undertake to promptly drain the soak-away pit/septic tank which is the responsibility of the tenant whenever same is filled to capacity." },
  { id: "term-29", kind: "text", removable: false, text: "The Tenant before giving up possession, shall paint the interior of the Apartment and replace all Damaged fixtures and fittings after a joint inspection by the parties herein to ascertain the state of things as it is." },
  { id: "term-30", kind: "text", removable: false, text: "For security reasons and for the avoidance of any embarassment, the Tenant shall promptly disclose the identity/introduce to the Landlord any person coming to spend a reasonable length of time with him in the Apartment/Demised premises." },
  { id: "term-31", kind: "text", removable: false, text: "The Tenant paying the rent and observing and performing all these obligations under this agreement, shall quietly enjoy his tenancy without any interruption by the Landlord, or any person claiming through, under or in trust for the Landlord." },
  { id: "term-32", kind: "text", removable: false, text: "These terms herein created regulate the parties to the tilt, and any previous understanding and/or representation is hereby extinguished upon the execution of these Present." },
];

interface SubmissionData {
  ref: string;
  landlord: string;
  tenant: string;
  phone: string;
  email: string;
  homeAddress: string;
  occupation: string;
  employer: string;
  apartment: string;
  bedrooms: string;
  lga: string;
  rentDay: string;
  rentMonth: string;
  rentYear: string;
  startDate: string;
  caution: string;
  legalFee: string;
  idType: string;
  idNumber: string;
  kinName: string;
  kinRelation: string;
  kinPhone: string;
  landlordWitnessName: string;
  landlordWitnessAddress: string;
  landlordWitnessOccupation: string;
  landlordWitnessRelationship: string;
  tenantWitnessName: string;
  tenantWitnessAddress: string;
  tenantWitnessOccupation: string;
  tenantWitnessPhone: string;
  tenantWitnessRelationship: string;
  typedSig: string;
  sigDate: string;
  sigImage: string;
  landlordTypedSig: string;
  landlordSigDate: string;
  landlordSigImage: string | null;
  landlordWitnessSigImage: string | null;
  tenantWitnessSigImage: string;
  solicitorSigImage: string | null;
  solicitorSigImage2: string | null;
  terms: string[];
  landlordParagraph: string;
  submittedAt: string;
}

function dateParts(iso: string | undefined | null) {
  if (!iso) return { day: "", month: "", year2: "" };
  const [yy, mm, dd] = iso.split("-");
  const day = parseInt(dd, 10);
  const monthIdx = parseInt(mm, 10) - 1;
  return {
    day: Number.isFinite(day) ? String(day) : "",
    month: MONTH_NAMES[monthIdx] || "",
    year2: yy ? yy.slice(2) : "",
  };
}

function Blank({ value, placeholder }: { value: string; placeholder: string }) {
  const filled = value.trim().length > 0;
  return (
    <span className={`tenancy-reg-form__blank${filled ? " tenancy-reg-form__blank--filled" : ""}`}>
      {filled ? value : placeholder}
    </span>
  );
}

export interface SignaturePadHandle {
  clear: () => void;
  hasSignature: () => boolean;
  dataUrl: () => string;
}

const SignaturePad = forwardRef<
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
    <div className="tenancy-reg-form__sigwrap">
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

function SignatureField({
  padRef,
  label,
  required,
  signed,
  optionalHint,
}: {
  padRef: React.RefObject<SignaturePadHandle>;
  label: string;
  required?: boolean;
  signed: boolean;
  optionalHint?: string;
}) {
  return (
    <div className="tenancy-reg-form__field tenancy-reg-form__field--full">
      <label className="tenancy-reg-form__label">
        {label}
        {required && <span className="tenancy-reg-form__req">*</span>}
      </label>
      <SignaturePad ref={padRef} onSignedChange={() => { /* status re-render handled by parent state */ }} />
      <div className="tenancy-reg-form__sig-tools">
        <button type="button" onClick={() => padRef.current?.clear()}>Clear Signature</button>
        <span className="tenancy-reg-form__note">{signed ? "Signed" : "Not yet signed"}</span>
      </div>
      {optionalHint && <p className="tenancy-reg-form__note">{optionalHint}</p>}
    </div>
  );
}

const EditableTermLI = React.memo(function EditableTermLI({
  initialText,
  removable,
  onRemove,
}: {
  id: string;
  initialText: string;
  removable: boolean;
  onRemove: () => void;
}) {
  return (
    <li className={removable ? "tenancy-reg-form__clause-added" : undefined}>
      <span
        className="tenancy-reg-form__term-text"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
      >
        {initialText}
      </span>
      {removable && (
        <span className="tenancy-reg-form__remove-clause" onClick={onRemove}>
          Remove
        </span>
      )}
    </li>
  );
});

const LandlordParagraph = React.memo(function LandlordParagraph({
  paragraphRef,
}: {
  paragraphRef: React.RefObject<HTMLParagraphElement>;
}) {
  return (
    <p ref={paragraphRef} contentEditable suppressContentEditableWarning spellCheck={false}>
      {DEFAULT_LANDLORD_PARAGRAPH}
    </p>
  );
});

function buildPdf(d: SubmissionData, copyLabel: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 56;

  const checkPage = (extra: number) => {
    if (y + extra > 780) {
      doc.addPage();
      y = 56;
    }
  };
  const heading = (text: string) => {
    checkPage(26);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 56, 35);
    doc.text(text.toUpperCase(), margin, y);
    doc.setDrawColor(184, 141, 62);
    doc.line(margin, y + 4, pageW - margin, y + 4);
    y += 20;
    doc.setTextColor(20, 20, 20);
  };
  const field = (label: string, value: string | number | null | undefined) => {
    checkPage(16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 86, 71);
    doc.text(label.toUpperCase(), margin, y);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.text(String(value || "—"), margin + 150, y);
    y += 17;
  };

  // Cover page
  let cy = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(20, 20, 20);
  doc.text("TENANCY AGREEMENT", pageW / 2, cy, { align: "center" });
  cy += 50;
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 86, 71);
  doc.text("BETWEEN", pageW / 2, cy, { align: "center" });
  cy += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(LANDLORD_NAME, pageW / 2, cy, { align: "center" });
  cy += 16;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(90, 86, 71);
  doc.text("(LANDLORD)", pageW / 2, cy, { align: "center" });
  cy += 34;
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text("AND", pageW / 2, cy, { align: "center" });
  cy += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(
    d.tenant && d.tenant.trim() ? d.tenant : "MR./MRS/MISS _______________________________",
    pageW / 2, cy, { align: "center" }
  );
  cy += 16;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(90, 86, 71);
  doc.text("(TENANT)", pageW / 2, cy, { align: "center" });
  cy += 40;

  const boxText =
    "(For the renting of a " + (d.bedrooms || "______") + " Apartment situate and lying at " +
    (d.apartment || "______________________________") +
    " in Warri South Local Government Area of Delta State, Nigeria).";
  const boxLines = doc.splitTextToSize(boxText, 420);
  const boxH = boxLines.length * 14 + 24;
  const boxX = (pageW - 460) / 2;
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(1);
  doc.rect(boxX, cy, 460, boxH);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text(boxLines, boxX + 16, cy + 20);
  cy += boxH + 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PREPARED BY:", boxX, cy);
  try { doc.addImage(NBA_SEAL_DATA, "JPEG", boxX + 460 - 70, cy - 50, 70, 70); } catch { /* ignore */ }
  cy += 20;
  if (d.solicitorSigImage) {
    try { doc.addImage(d.solicitorSigImage, "PNG", boxX, cy, 170, 55); } catch { /* ignore */ }
    cy += 60;
  } else {
    doc.setDrawColor(150, 142, 120);
    doc.line(boxX, cy + 20, boxX + 200, cy + 20);
    cy += 30;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60, 58, 48);
  [SOLICITOR_NAME, ...SOLICITOR_ADDRESS_LINES].forEach((line) => { doc.text(line, boxX, cy); cy += 15; });

  doc.addPage();
  y = 56;

  // Letterhead
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text("TENANCY REGISTRATION FORM", pageW / 2, y, { align: "center" });
  y += 18;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(90, 86, 71);
  doc.text(copyLabel, pageW / 2, y, { align: "center" });
  y += 14;
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text("Reference No: " + d.ref + "   ·   Submitted " + d.submittedAt, pageW / 2, y, { align: "center" });
  y += 26;

  // Recitals
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  const { day: dayStr, month: monthStr, year2: yearStr } = d.sigDate
    ? dateParts(d.sigDate)
    : { day: "___", month: "______", year2: "__" };
  const recitalParas = [
    "This TENANCY AGREEMENT is made this " + (dayStr || "___") + " day of " + (monthStr || "______") + ", 20" + (yearStr || "__") + ".",
    "BETWEEN",
    d.landlordParagraph ||
      'MR. ALFRED EBAMI of No. 5, Oke Street, Egbokodo Itsekiri in Warri South Local Government Area of Delta State, Nigeria, (hereinafter referred to as "THE LANDLORD", which expression shall where the context so admits include his Heirs, Assigns, Agents, Successors-in-title and Legal Representatives, of the ONE PART.',
    "AND",
    (d.tenant && d.tenant.trim() ? d.tenant : "MR./MRS/MISS _______________________________") +
      ', Warri South Local Government Area of Delta State, Nigeria, (hereinafter referred to as "THE TENANT", which expression shall where the context so admits include his/her Legal Representatives, Heirs, Successors-in-title and Assigns of the OTHER PART.',
    "WHEREAS:",
    '1. The Landlord is the Beneficial and Bonafide Owner of the Estate of Bungalow Buildings, hereinafter referred to as the "Demised Premises", comprising a ' +
      (d.bedrooms || "______") + " apartment and its appurtenances situate and lying at " +
      (d.apartment || "______________________________") + ", Warri South Local Government Area of Delta State, Nigeria.",
    '2. The "Tenant" herein is desirous of renting the ' + (d.bedrooms || "______") +
      " Apartment and its appurtenances in the Demised Premises, hereinafter referred to as the Apartment and has consequently approached the Landlord for the purpose of letting the said Apartment for a consideration of ₦" +
      (d.rentDay || "______") + " per day translating to ₦" + (d.rentMonth || "______") +
      " monthly, and ₦" + (d.rentYear || "______") + " yearly and upon the execution of these present.",
  ];
  recitalParas.forEach((para) => {
    if (!para) return;
    const isLabel = para === "BETWEEN" || para === "AND" || para === "WHEREAS:";
    doc.setFont("helvetica", isLabel ? "bold" : "normal");
    doc.setFontSize(isLabel ? 9 : 9.5);
    const lines = doc.splitTextToSize(para, pageW - margin * 2);
    checkPage(lines.length * 12 + 6);
    if (isLabel) {
      doc.text(para, pageW / 2, y, { align: "center" });
      y += 14;
    } else {
      doc.text(lines, margin, y);
      y += lines.length * 12 + 8;
    }
  });
  y += 8;

  heading("Parties");
  field("Landlord", d.landlord);
  field("Tenant", d.tenant);
  field("Phone", d.phone);
  field("Email", d.email);
  field("Home Address", d.homeAddress);
  field("Occupation", d.occupation + (d.employer ? " — " + d.employer : ""));
  y += 8;

  heading("Demised Premises");
  field("Apartment Address", d.apartment);
  field("Bedrooms", d.bedrooms);
  field("LGA", d.lga);
  y += 8;

  heading("Rent & Terms");
  field("Rent / Day", d.rentDay ? "₦" + d.rentDay : "—");
  field("Rent / Month", d.rentMonth ? "₦" + d.rentMonth : "—");
  field("Rent / Year", d.rentYear ? "₦" + d.rentYear : "—");
  field("Start Date", d.startDate);
  field("One Time Caution Fee", d.caution ? "₦" + d.caution : "—");
  field("One Time Legal Fee", d.legalFee ? "₦" + d.legalFee : "—");
  y += 8;

  heading("Identity Verification");
  field("ID Type", d.idType);
  field("ID Number", d.idNumber);
  y += 8;

  heading("Next of Kin");
  field("Name", d.kinName);
  field("Relationship", d.kinRelation);
  field("Phone", d.kinPhone);
  y += 12;

  heading("Terms of Tenancy");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  d.terms.forEach((t, i) => {
    const lines = doc.splitTextToSize((i + 1) + ". " + t, pageW - margin * 2);
    checkPage(lines.length * 12 + 4);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 4;
  });

  y += 20;
  checkPage(60);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(90, 86, 71);
  const witnessIntroLines = doc.splitTextToSize(
    "IN WITNESS WHEREOF, the parties hereto have hereunto set their respective hands, the day, month and year first above written.",
    pageW - margin * 2
  );
  doc.text(witnessIntroLines, margin, y);
  y += witnessIntroLines.length * 12 + 16;
  doc.setTextColor(20, 20, 20);

  checkPage(90);
  heading("Signed & Delivered by the Landlord");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Signed by: " + (d.landlordTypedSig || LANDLORD_NAME) + "   Date: " + (d.landlordSigDate || "—"), margin, y);
  y += 10;
  if (d.landlordSigImage) {
    try { doc.addImage(d.landlordSigImage, "PNG", margin, y, 200, 60); } catch { /* ignore */ }
    y += 68;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text("Signature & date to be appended by the Landlord upon approval of this registration.", margin, y);
    y += 16;
    doc.setTextColor(20, 20, 20);
  }
  field("Witness Name", d.landlordWitnessName);
  field("Witness Address", d.landlordWitnessAddress);
  field("Witness Occupation", d.landlordWitnessOccupation);
  field("Relationship to Landlord", d.landlordWitnessRelationship);
  if (d.landlordWitnessSigImage) {
    checkPage(70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 86, 71);
    doc.text("Witness Signature:", margin, y);
    y += 6;
    try { doc.addImage(d.landlordWitnessSigImage, "PNG", margin, y, 160, 50); } catch { /* ignore */ }
    y += 58;
    doc.setTextColor(20, 20, 20);
  }
  y += 10;

  checkPage(140);
  heading("Signed & Delivered by the Tenant");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Signed by: " + (d.typedSig || "—") + "   Date: " + (d.sigDate || "—"), margin, y);
  y += 10;
  try { doc.addImage(d.sigImage, "PNG", margin, y, 200, 60); } catch { /* ignore */ }
  try { doc.addImage(NBA_SEAL_DATA, "JPEG", pageW - margin - 100, y - 10, 100, 100); } catch { /* ignore */ }
  y += 70;

  checkPage(70);
  field("Witness Name", d.tenantWitnessName);
  field("Witness Address", d.tenantWitnessAddress);
  field("Witness Occupation", d.tenantWitnessOccupation);
  field("Witness Phone", d.tenantWitnessPhone);
  field("Relationship to Tenant", d.tenantWitnessRelationship);
  checkPage(70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 86, 71);
  doc.text("Witness Signature:", margin, y);
  y += 6;
  try { doc.addImage(d.tenantWitnessSigImage, "PNG", margin, y, 160, 50); } catch { /* ignore */ }
  y += 58;
  doc.setTextColor(20, 20, 20);

  y += 16;
  checkPage(100);
  heading("Prepared By");
  if (d.solicitorSigImage2) {
    try { doc.addImage(d.solicitorSigImage2, "PNG", margin, y, 160, 50); } catch { /* ignore */ }
    y += 58;
  } else {
    doc.setDrawColor(150, 142, 120);
    doc.line(margin, y + 20, margin + 180, y + 20);
    y += 30;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(SOLICITOR_NAME, margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 58, 48);
  SOLICITOR_ADDRESS_LINES.forEach((line) => { doc.text(line, margin, y); y += 13; });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  checkPage(24);
  doc.text(
    "This document registers the Tenant's particulars and consent for the Landlord's review, and stands as a record of the terms agreed above.",
    margin, y + 18, { maxWidth: pageW - margin * 2 }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 86, 71);
  doc.text(
    "Prepared by: " + SOLICITOR_NAME + " · " + SOLICITOR_ADDRESS_LINES.join(", "),
    margin, y + 32, { maxWidth: pageW - margin * 2 }
  );

  doc.save("Tenancy-" + d.ref + "-" + copyLabel.replace(/[^A-Za-z]/g, "") + ".pdf");
}

export function TenancyRegistrationForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const idFileRef = useRef<HTMLInputElement>(null);
  const clauseListRef = useRef<HTMLOListElement>(null);
  const landlordParagraphRef = useRef<HTMLParagraphElement>(null);

  const [formKey, setFormKey] = useState(0);

  const [tenantTitle, setTenantTitle] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantAddress, setTenantAddress] = useState("");
  const [tenantOccupation, setTenantOccupation] = useState("");
  const [tenantEmployer, setTenantEmployer] = useState("");

  const [apartmentAddress, setApartmentAddress] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const [rentDay, setRentDay] = useState("");
  const [rentMonth, setRentMonth] = useState("");
  const [rentYear, setRentYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [caution, setCaution] = useState("");
  const [legalFee, setLegalFee] = useState("");

  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);

  const [kinName, setKinName] = useState("");
  const [kinRelation, setKinRelation] = useState("");
  const [kinPhone, setKinPhone] = useState("");

  const [terms, setTerms] = useState<TermItem[]>(DEFAULT_TERMS);
  const [newClauseText, setNewClauseText] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [landlordTypedSig, setLandlordTypedSig] = useState(LANDLORD_NAME);
  const [landlordSigDate, setLandlordSigDate] = useState("");
  const [landlordWitnessName, setLandlordWitnessName] = useState("");
  const [landlordWitnessAddress, setLandlordWitnessAddress] = useState("");
  const [landlordWitnessOccupation, setLandlordWitnessOccupation] = useState("");
  const [landlordWitnessRelationship, setLandlordWitnessRelationship] = useState("");

  const [typedSig, setTypedSig] = useState("");
  const [sigDate, setSigDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tenantWitnessName, setTenantWitnessName] = useState("");
  const [tenantWitnessAddress, setTenantWitnessAddress] = useState("");
  const [tenantWitnessOccupation, setTenantWitnessOccupation] = useState("");
  const [tenantWitnessPhone, setTenantWitnessPhone] = useState("");
  const [tenantWitnessRelationship, setTenantWitnessRelationship] = useState("");

  const [tenantSigned, setTenantSigned] = useState(false);
  const [landlordSigned, setLandlordSigned] = useState(false);
  const [landlordWitnessSigned, setLandlordWitnessSigned] = useState(false);
  const [tenantWitnessSigned, setTenantWitnessSigned] = useState(false);
  const [solicitorSigned, setSolicitorSigned] = useState(false);
  const [solicitorSigned2, setSolicitorSigned2] = useState(false);

  const tenantSigRef = useRef<SignaturePadHandle>(null);
  const landlordSigRef = useRef<SignaturePadHandle>(null);
  const landlordWitnessSigRef = useRef<SignaturePadHandle>(null);
  const tenantWitnessSigRef = useRef<SignaturePadHandle>(null);
  const solicitorSigRef = useRef<SignaturePadHandle>(null);
  const solicitorSig2Ref = useRef<SignaturePadHandle>(null);

  const [formErrorVisible, setFormErrorVisible] = useState(false);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [generating, setGenerating] = useState<"tenant" | "landlord" | null>(null);

  const sigDateParts = useMemo(() => dateParts(sigDate), [sigDate]);
  const startDateParts = useMemo(() => dateParts(startDate), [startDate]);

  const rentTermText = `The Landlord lets and the tenant takes on a daily Tenancy the Apartment in the Demised Premises at the daily rent of approximately ₦${rentDay || "amount"} per day translating to ₦${rentMonth || "amount"} monthly, and ₦${rentYear || "amount"} yearly for the apartment as aforesaid.`;
  const startTermText = `This Tenancy agreement, which commences on the ${startDateParts.day || "___"} day of ${startDateParts.month || "______"}, 20${startDateParts.year2 || "__"} is a continuous one except otherwise determined by a written NOTICE TO QUIT and/or failure to religiously abide by the terms created herein regulating the tenancy, which shall automatically determine the tenancy, upon a seven days notice.`;

  const handleRentYearChange = (value: string) => {
    setRentYear(value);
    const yearly = parseFloat(value);
    if (yearly && yearly > 0) {
      setRentMonth(String(Math.round(yearly / 12)));
      setRentDay(String(Math.round(yearly / 365)));
    }
  };

  const handleIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setIdPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddClause = () => {
    const text = newClauseText.trim();
    if (!text) return;
    setTerms((prev) => [...prev, { id: `custom-${Date.now()}`, kind: "text", text, removable: true }]);
    setNewClauseText("");
  };

  const handleRemoveClause = useCallback((id: string) => {
    setTerms((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getAllTermTexts = (): string[] => {
    const ol = clauseListRef.current;
    if (!ol) return [];
    return Array.from(ol.children)
      .map((li) => {
        const span = li.querySelector(".tenancy-reg-form__term-text");
        const text = (span ? span.textContent : li.textContent) || "";
        return text.trim();
      })
      .filter(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredSigsMissing = !tenantSigRef.current?.hasSignature() || !tenantWitnessSigRef.current?.hasSignature();
    if (!formRef.current?.checkValidity() || requiredSigsMissing) {
      formRef.current?.reportValidity();
      setFormErrorVisible(requiredSigsMissing);
      return;
    }
    setFormErrorVisible(false);

    const ref = "TA-" + Date.now().toString().slice(-8);
    const data: SubmissionData = {
      ref,
      landlord: "Mr. Alfred Ebami",
      tenant: `${tenantTitle} ${tenantName}`.trim(),
      phone: tenantPhone,
      email: tenantEmail,
      homeAddress: tenantAddress,
      occupation: tenantOccupation,
      employer: tenantEmployer,
      apartment: apartmentAddress,
      bedrooms,
      lga: "Warri South, Delta State",
      rentDay,
      rentMonth,
      rentYear,
      startDate,
      caution,
      legalFee,
      idType,
      idNumber,
      kinName,
      kinRelation,
      kinPhone,
      landlordWitnessName,
      landlordWitnessAddress,
      landlordWitnessOccupation,
      landlordWitnessRelationship,
      tenantWitnessName,
      tenantWitnessAddress,
      tenantWitnessOccupation,
      tenantWitnessPhone,
      tenantWitnessRelationship,
      typedSig,
      sigDate,
      sigImage: tenantSigRef.current?.dataUrl() || "",
      landlordTypedSig,
      landlordSigDate,
      landlordSigImage: landlordSigRef.current?.hasSignature() ? landlordSigRef.current.dataUrl() : null,
      landlordWitnessSigImage: landlordWitnessSigRef.current?.hasSignature() ? landlordWitnessSigRef.current.dataUrl() : null,
      tenantWitnessSigImage: tenantWitnessSigRef.current?.dataUrl() || "",
      solicitorSigImage: solicitorSigRef.current?.hasSignature() ? solicitorSigRef.current.dataUrl() : null,
      solicitorSigImage2: solicitorSig2Ref.current?.hasSignature() ? solicitorSig2Ref.current.dataUrl() : null,
      terms: getAllTermTexts(),
      landlordParagraph: landlordParagraphRef.current?.textContent?.trim() || DEFAULT_LANDLORD_PARAGRAPH,
      submittedAt: new Date().toLocaleString(),
    };
    setSubmission(data);
    toast({ title: "Registration recorded", description: "Download your tenant and landlord copies below." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async (copyLabel: "tenant" | "landlord") => {
    if (!submission) return;
    setGenerating(copyLabel);
    try {
      buildPdf(submission, copyLabel === "tenant" ? "TENANT'S COPY" : "LANDLORD'S COPY");
    } finally {
      setGenerating(null);
    }
  };

  const handleReset = () => {
    setSubmission(null);
    setFormErrorVisible(false);
    setTenantTitle(""); setTenantName(""); setTenantPhone(""); setTenantEmail("");
    setTenantAddress(""); setTenantOccupation(""); setTenantEmployer("");
    setApartmentAddress(""); setBedrooms("");
    setRentDay(""); setRentMonth(""); setRentYear("");
    setStartDate(""); setCaution(""); setLegalFee("");
    setIdType(""); setIdNumber(""); setIdFileName(null); setIdPreviewUrl(null);
    setKinName(""); setKinRelation(""); setKinPhone("");
    setTerms(DEFAULT_TERMS);
    setNewClauseText("");
    setAgreedTerms(false);
    setLandlordTypedSig(LANDLORD_NAME);
    setLandlordSigDate("");
    setLandlordWitnessName(""); setLandlordWitnessAddress(""); setLandlordWitnessOccupation(""); setLandlordWitnessRelationship("");
    setTypedSig("");
    setSigDate(new Date().toISOString().slice(0, 10));
    setTenantWitnessName(""); setTenantWitnessAddress(""); setTenantWitnessOccupation("");
    setTenantWitnessPhone(""); setTenantWitnessRelationship("");
    setTenantSigned(false); setLandlordSigned(false); setLandlordWitnessSigned(false);
    setTenantWitnessSigned(false); setSolicitorSigned(false); setSolicitorSigned2(false);
    if (idFileRef.current) idFileRef.current.value = "";
    setFormKey((k) => k + 1);
  };

  const refDisplay = submission ? `Reference No: ${submission.ref}` : "Reference will be issued on submission";

  return (
    <div className="tenancy-reg-form">
      <div className="tenancy-reg-form__desk">
        <div className="tenancy-reg-form__desk-header">
          Delta State &middot; Warri South Local Government Area &mdash; Digital Tenancy Registry
        </div>

        <div className="tenancy-reg-form__paper">
          <div className="tenancy-reg-form__letterhead">
            <span className="tenancy-reg-form__ribbon">Prepared under instruction of the Landlord</span>
            <h1>Tenancy Registration Form</h1>
            <p className="tenancy-reg-form__sub">To be completed, digitally signed, and submitted by the incoming Tenant</p>
            <div className="tenancy-reg-form__refnum">{refDisplay}</div>
          </div>

          <div className="tenancy-reg-form__cover">
            <p className="tenancy-reg-form__cover-title">TENANCY AGREEMENT</p>
            <p className="tenancy-reg-form__cover-between">BETWEEN</p>
            <p className="tenancy-reg-form__cover-party">
              {LANDLORD_NAME}<br /><span className="tenancy-reg-form__cover-role">(LANDLORD)</span>
            </p>
            <p className="tenancy-reg-form__cover-and">AND</p>
            <p className="tenancy-reg-form__cover-party">
              <Blank value={tenantTitle.toUpperCase()} placeholder="MR./MRS/MISS" />{" "}
              <Blank value={tenantName.trim()} placeholder="your full name will appear here" />
              <br /><span className="tenancy-reg-form__cover-role">(TENANT)</span>
            </p>
            <div className="tenancy-reg-form__cover-box">
              (For the renting of a <Blank value={bedrooms} placeholder="bedroom count" /> Apartment situate and
              lying at <Blank value={apartmentAddress.trim()} placeholder="apartment address" /> in Warri South
              Local Government Area of Delta State, Nigeria).
            </div>
            <div className="tenancy-reg-form__cover-prepared-row">
              <p className="tenancy-reg-form__cover-prepared-label">PREPARED BY:</p>
              <img src={NBA_SEAL_DATA} className="tenancy-reg-form__cover-seal" alt="Nigerian Bar Association verification seal" />
            </div>
            <div className="tenancy-reg-form__cover-solicitor-sig">
              <SignaturePad key={`solicitor-cover-${formKey}`} ref={solicitorSigRef} onSignedChange={setSolicitorSigned} />
              <div className="tenancy-reg-form__sig-tools">
                <button type="button" onClick={() => solicitorSigRef.current?.clear()}>Clear Signature</button>
                <span className="tenancy-reg-form__note">{solicitorSigned ? "Signed" : "Not yet signed"}</span>
              </div>
            </div>
            <div className="tenancy-reg-form__cover-solicitor">
              <strong>{SOLICITOR_NAME}</strong><br />
              {SOLICITOR_ADDRESS_LINES.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}
            </div>
          </div>

          <div className="tenancy-reg-form__recitals">
            <p className="tenancy-reg-form__recitals-title">TENANCY AGREEMENT</p>
            <p>
              This TENANCY AGREEMENT is made this <Blank value={sigDateParts.day} placeholder="___" /> day of{" "}
              <Blank value={sigDateParts.month} placeholder="______" />, 20<Blank value={sigDateParts.year2} placeholder="__" />.
            </p>
            <p className="tenancy-reg-form__recitals-label">BETWEEN</p>
            <LandlordParagraph paragraphRef={landlordParagraphRef} />
            <p className="tenancy-reg-form__recitals-label">AND</p>
            <p>
              <Blank value={tenantTitle.toUpperCase()} placeholder="MR./MRS/MISS" />{" "}
              <Blank value={tenantName.trim()} placeholder="your full name will appear here" /><br />
              Warri South Local Government Area of Delta State, Nigeria, (hereinafter referred to as
              &ldquo;THE TENANT&rdquo;, which expression shall where the context so admits include his/her Legal
              Representatives, Heirs, Successors-in-title and Assigns of the OTHER PART.
            </p>
            <p className="tenancy-reg-form__recitals-label">WHEREAS:</p>
            <ol className="tenancy-reg-form__recitals-list">
              <li>
                The Landlord is the Beneficial and Bonafide Owner of the Estate of Bungalow Buildings, hereinafter
                referred to as the &ldquo;Demised Premises&rdquo;, comprising a{" "}
                <Blank value={bedrooms} placeholder="bedroom count" /> apartment and its appurtenances situate and
                lying at <Blank value={apartmentAddress.trim()} placeholder="apartment address" />, Warri South
                Local Government Area of Delta State, Nigeria.
              </li>
              <li>
                The &ldquo;Tenant&rdquo; herein is desirous of renting the{" "}
                <Blank value={bedrooms} placeholder="bedroom count" /> Apartment and its appurtenances in the
                Demised Premises, hereinafter referred to as the Apartment and has consequently approached the
                Landlord for the purpose of letting the said Apartment for a consideration of &#8358;
                <Blank value={rentDay} placeholder="amount" /> per day translating to &#8358;
                <Blank value={rentMonth} placeholder="amount" /> monthly, and &#8358;
                <Blank value={rentYear} placeholder="amount" /> yearly and upon the execution of these present.
              </li>
            </ol>
            <p className="tenancy-reg-form__recitals-hint">
              These blanks fill themselves in automatically as you complete the form below &mdash; no need to type here.
            </p>
          </div>

          <div className="tenancy-reg-form__body">
            {submission ? (
              <div className="tenancy-reg-form__seal-wrap">
                <img src={NBA_SEAL_DATA} alt="Nigerian Bar Association verification seal" className="tenancy-reg-form__seal" />
                <div className="tenancy-reg-form__seal-caption">Verified Submission</div>
                <div className="tenancy-reg-form__confirm-title">Registration Received</div>
                <div className="tenancy-reg-form__confirm-sub">
                  Reference No. {submission.ref} &middot; Submitted {submission.submittedAt}
                </div>
                <div className="tenancy-reg-form__summary">
                  <dl>
                    <dt>Tenant</dt><dd>{submission.tenant}</dd>
                    <dt>Phone</dt><dd>{submission.phone || "—"}</dd>
                    <dt>Email</dt><dd>{submission.email || "—"}</dd>
                    <dt>Apartment</dt><dd>{submission.apartment || "—"}</dd>
                    <dt>Bedrooms</dt><dd>{submission.bedrooms || "—"}</dd>
                    <dt>Monthly Rent</dt><dd>&#8358;{submission.rentMonth || "—"}</dd>
                    <dt>Start Date</dt><dd>{submission.startDate || "—"}</dd>
                    <dt>ID Type</dt><dd>{submission.idType || "—"}</dd>
                    <dt>ID Number</dt><dd>{submission.idNumber || "—"}</dd>
                    <dt>Signed By</dt><dd>{submission.typedSig || "—"}</dd>
                    <dt>Signature Date</dt><dd>{submission.sigDate || "—"}</dd>
                    <dt>Witness</dt>
                    <dd>
                      {submission.tenantWitnessName}
                      {submission.tenantWitnessRelationship ? ` (${submission.tenantWitnessRelationship})` : ""}
                    </dd>
                    <dt>Terms Agreed</dt><dd>{submission.terms.length} total</dd>
                  </dl>
                </div>
                <div className="tenancy-reg-form__confirm-actions">
                  <button
                    type="button"
                    className="tenancy-reg-form__btn-tenant-copy"
                    disabled={generating !== null}
                    onClick={() => handleDownload("tenant")}
                  >
                    {generating === "tenant" ? <Loader className="h-3.5 w-3.5 mr-1.5 inline animate-spin" /> : null}
                    Download Tenant&apos;s Copy
                  </button>
                  <button
                    type="button"
                    className="tenancy-reg-form__btn-landlord-copy"
                    disabled={generating !== null}
                    onClick={() => handleDownload("landlord")}
                  >
                    {generating === "landlord" ? <Loader className="h-3.5 w-3.5 mr-1.5 inline animate-spin" /> : null}
                    Download Landlord&apos;s Copy
                  </button>
                  <button type="button" className="tenancy-reg-form__btn-print" onClick={() => window.print()}>
                    <Printer className="h-3.5 w-3.5 mr-1.5 inline" />
                    Print
                  </button>
                  <button type="button" className="tenancy-reg-form__btn-new" onClick={handleReset}>
                    Start New Registration
                  </button>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate={false}>
                {/* SECTION 1 */}
                <div className="tenancy-reg-form__section" style={{ marginTop: 0 }}>
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">01</span>
                    <h2>Parties to the Agreement</h2>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Landlord</label>
                      <input className="tenancy-reg-form__control" type="text" value={LANDLORD_NAME.replace(/^MR\. /, "Mr. ")} readOnly />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Prepared By (Solicitor)</label>
                      <input className="tenancy-reg-form__control" type="text" value="G. Anukun Esq., LL.M, AICMC" readOnly />
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Full Legal Name of Tenant<span className="tenancy-reg-form__req">*</span></label>
                      <div className="tenancy-reg-form__name-group">
                        <select className="tenancy-reg-form__select" required value={tenantTitle} onChange={(e) => setTenantTitle(e.target.value)}>
                          <option value="">Title</option>
                          {TITLE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input className="tenancy-reg-form__control" type="text" required placeholder="Full name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Phone Number<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="tel" required placeholder="080..." value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Email Address<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="email" required placeholder="name@example.com" value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field tenancy-reg-form__field--full">
                      <label className="tenancy-reg-form__label">Current Residential Address<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="text" required placeholder="Street, area, city" value={tenantAddress} onChange={(e) => setTenantAddress(e.target.value)} />
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Occupation<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="text" required value={tenantOccupation} onChange={(e) => setTenantOccupation(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Employer / Business Name</label>
                      <input className="tenancy-reg-form__control" type="text" value={tenantEmployer} onChange={(e) => setTenantEmployer(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* SECTION 2 */}
                <div className="tenancy-reg-form__section">
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">02</span>
                    <h2>The Demised Premises</h2>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field tenancy-reg-form__field--full">
                      <label className="tenancy-reg-form__label">Apartment Address<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="text" required placeholder="No. ___ Street, Egbokodo Itsekiri" value={apartmentAddress} onChange={(e) => setApartmentAddress(e.target.value)} />
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Number of Bedrooms<span className="tenancy-reg-form__req">*</span></label>
                      <select className="tenancy-reg-form__select" required value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                        <option value="">Select</option>
                        {BEDROOM_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Local Government Area</label>
                      <input className="tenancy-reg-form__control" type="text" value="Warri South, Delta State" readOnly />
                    </div>
                  </div>
                </div>

                {/* SECTION 3 */}
                <div className="tenancy-reg-form__section">
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">03</span>
                    <h2>Rent &amp; Tenancy Terms</h2>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Rent per Day (&#8358;)</label>
                      <input className="tenancy-reg-form__control" type="number" min={0} value={rentDay} onChange={(e) => setRentDay(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Rent per Month (&#8358;)<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="number" required min={0} value={rentMonth} onChange={(e) => setRentMonth(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Rent per Year (&#8358;)<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="number" required min={0} value={rentYear} onChange={(e) => handleRentYearChange(e.target.value)} />
                      <p className="tenancy-reg-form__note">Enter this first &mdash; the day and month amounts fill in automatically. You can still adjust either one after.</p>
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Proposed Tenancy Start Date<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">One Time Caution Fee (&#8358;)</label>
                      <input className="tenancy-reg-form__control" type="number" min={0} value={caution} onChange={(e) => setCaution(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">One Time Legal Fee (&#8358;)</label>
                      <input className="tenancy-reg-form__control" type="number" min={0} value={legalFee} onChange={(e) => setLegalFee(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* SECTION 4 */}
                <div className="tenancy-reg-form__section">
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">04</span>
                    <h2>Identity Verification</h2>
                    <span className="tenancy-reg-form__section-hint">Required for authenticity</span>
                  </div>
                  <div className="tenancy-reg-form__idblock">
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">ID Type<span className="tenancy-reg-form__req">*</span></label>
                        <select className="tenancy-reg-form__select" required value={idType} onChange={(e) => setIdType(e.target.value)}>
                          <option value="">Select an ID type</option>
                          {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">ID Number<span className="tenancy-reg-form__req">*</span></label>
                        <input className="tenancy-reg-form__control" type="text" required placeholder="As shown on the document" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                      </div>
                    </div>
                    <div className="tenancy-reg-form__field tenancy-reg-form__field--full" style={{ marginBottom: 6 }}>
                      <label className="tenancy-reg-form__label">Upload Clear Photo / Scan of ID<span className="tenancy-reg-form__req">*</span></label>
                      <div className="tenancy-reg-form__upload-area">
                        <div className="tenancy-reg-form__upload-icon">
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v12m0-12l-4 4m4-4l4 4" />
                            <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                          </svg>
                        </div>
                        <div className="tenancy-reg-form__upload-text">
                          <strong>Attach a photo or scan</strong>
                          <span>JPG or PNG &middot; used only to verify the details you&apos;ve entered above</span>
                        </div>
                        <label className="tenancy-reg-form__btn-choose" htmlFor="tenancyRegIdUpload">Choose File</label>
                        <input
                          ref={idFileRef}
                          id="tenancyRegIdUpload"
                          type="file"
                          accept="image/*"
                          required
                          className="hidden"
                          onChange={handleIdFileSelect}
                        />
                      </div>
                      {idPreviewUrl && (
                        <div className="tenancy-reg-form__preview-thumb">
                          <img src={idPreviewUrl} alt="ID preview" />
                          <span className="tenancy-reg-form__preview-fname">{idFileName}</span>
                        </div>
                      )}
                      <p className="tenancy-reg-form__note">
                        The name and ID number entered above must match this document exactly, or your registration may be rejected during review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 5 */}
                <div className="tenancy-reg-form__section">
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">05</span>
                    <h2>Emergency Contact / Next of Kin</h2>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Full Name<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="text" required value={kinName} onChange={(e) => setKinName(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Relationship<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="text" required value={kinRelation} onChange={(e) => setKinRelation(e.target.value)} />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Phone Number<span className="tenancy-reg-form__req">*</span></label>
                      <input className="tenancy-reg-form__control" type="tel" required value={kinPhone} onChange={(e) => setKinPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* SECTION 6 */}
                <div className="tenancy-reg-form__section">
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">06</span>
                    <h2>Terms of Tenancy</h2>
                  </div>
                  <p className="tenancy-reg-form__clauses-hint">Click directly into any term below to edit its wording, or add new terms underneath.</p>
                  <div className="tenancy-reg-form__clauses">
                    <ol ref={clauseListRef}>
                      {terms.map((t) => {
                        if (t.kind === "rent") return <li key={t.id}>{rentTermText}</li>;
                        if (t.kind === "start") return <li key={t.id}>{startTermText}</li>;
                        return (
                          <EditableTermLI
                            key={t.id}
                            id={t.id}
                            initialText={t.text}
                            removable={t.removable}
                            onRemove={() => handleRemoveClause(t.id)}
                          />
                        );
                      })}
                    </ol>
                  </div>

                  <div className="tenancy-reg-form__add-clause-row">
                    <input
                      type="text"
                      placeholder="Type an additional term to add to this agreement..."
                      value={newClauseText}
                      onChange={(e) => setNewClauseText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddClause(); } }}
                    />
                    <button type="button" onClick={handleAddClause}>+ Add Term</button>
                  </div>

                  <div className="tenancy-reg-form__agree-row">
                    <input
                      type="checkbox"
                      id="tenancyRegAgreeTerms"
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                    />
                    <label htmlFor="tenancyRegAgreeTerms">
                      I confirm I have read, understood, and agree to be bound by all 33 terms of this Tenancy
                      Agreement listed above, together with any additional terms added, and the full agreement to
                      be issued upon approval.
                    </label>
                  </div>
                </div>

                {/* SECTION 7 */}
                <div className="tenancy-reg-form__section">
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">07</span>
                    <h2>Execution &amp; Witnessing</h2>
                  </div>

                  <p className="tenancy-reg-form__witness-intro">
                    IN WITNESS WHEREOF, the parties hereto have hereunto set their respective hands, the day, month and year first above written.
                  </p>

                  <div className="tenancy-reg-form__witness-block">
                    <p className="tenancy-reg-form__witness-heading">Signed and Delivered by the within named &ldquo;LANDLORD&rdquo;</p>
                    <p className="tenancy-reg-form__witness-name">{LANDLORD_NAME}</p>
                    <div className="tenancy-reg-form__row">
                      <SignatureField
                        padRef={landlordSigRef}
                        label="Landlord to sign below with mouse or finger"
                        signed={landlordSigned}
                      />
                    </div>
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Landlord&apos;s Typed Name as Signature</label>
                        <input className="tenancy-reg-form__control tenancy-reg-form__typed-sig" type="text" value={landlordTypedSig} onChange={(e) => setLandlordTypedSig(e.target.value)} />
                      </div>
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Date</label>
                        <input className="tenancy-reg-form__control" type="date" value={landlordSigDate} onChange={(e) => setLandlordSigDate(e.target.value)} />
                      </div>
                    </div>
                    <p className="tenancy-reg-form__witness-note">If the Landlord is not present to sign now, leave this blank &mdash; it can be appended upon approval of this registration.</p>
                    <p className="tenancy-reg-form__witness-subheading">In the Presence of:</p>
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Witness Name</label>
                        <input className="tenancy-reg-form__control" type="text" value={landlordWitnessName} onChange={(e) => setLandlordWitnessName(e.target.value)} />
                      </div>
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Witness Address</label>
                        <input className="tenancy-reg-form__control" type="text" value={landlordWitnessAddress} onChange={(e) => setLandlordWitnessAddress(e.target.value)} />
                      </div>
                    </div>
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Witness Occupation</label>
                        <input className="tenancy-reg-form__control" type="text" value={landlordWitnessOccupation} onChange={(e) => setLandlordWitnessOccupation(e.target.value)} />
                      </div>
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Relationship to Landlord</label>
                        <input className="tenancy-reg-form__control" type="text" placeholder="e.g. Family member, Friend, Agent" value={landlordWitnessRelationship} onChange={(e) => setLandlordWitnessRelationship(e.target.value)} />
                      </div>
                    </div>
                    <div className="tenancy-reg-form__row">
                      <SignatureField
                        padRef={landlordWitnessSigRef}
                        label="Witness to sign below with mouse or finger"
                        signed={landlordWitnessSigned}
                      />
                    </div>
                  </div>

                  <div className="tenancy-reg-form__witness-block">
                    <p className="tenancy-reg-form__witness-heading">Signed and Delivered by the within named &ldquo;TENANT&rdquo;</p>
                    <div className="tenancy-reg-form__row">
                      <SignatureField
                        padRef={tenantSigRef}
                        label="Sign below with your mouse or finger"
                        required
                        signed={tenantSigned}
                      />
                    </div>
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Type Full Name as Signature<span className="tenancy-reg-form__req">*</span></label>
                        <input className="tenancy-reg-form__control tenancy-reg-form__typed-sig" type="text" required placeholder="Your full legal name" value={typedSig} onChange={(e) => setTypedSig(e.target.value)} />
                      </div>
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Date</label>
                        <input className="tenancy-reg-form__control" type="date" required value={sigDate} onChange={(e) => setSigDate(e.target.value)} />
                      </div>
                    </div>
                    <p className="tenancy-reg-form__witness-subheading">In the Presence of (Witness):</p>
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Witness Name<span className="tenancy-reg-form__req">*</span></label>
                        <input className="tenancy-reg-form__control" type="text" required value={tenantWitnessName} onChange={(e) => setTenantWitnessName(e.target.value)} />
                      </div>
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Witness Address<span className="tenancy-reg-form__req">*</span></label>
                        <input className="tenancy-reg-form__control" type="text" required value={tenantWitnessAddress} onChange={(e) => setTenantWitnessAddress(e.target.value)} />
                      </div>
                    </div>
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Witness Occupation<span className="tenancy-reg-form__req">*</span></label>
                        <input className="tenancy-reg-form__control" type="text" required value={tenantWitnessOccupation} onChange={(e) => setTenantWitnessOccupation(e.target.value)} />
                      </div>
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Witness Phone Number</label>
                        <input className="tenancy-reg-form__control" type="tel" value={tenantWitnessPhone} onChange={(e) => setTenantWitnessPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="tenancy-reg-form__row">
                      <div className="tenancy-reg-form__field">
                        <label className="tenancy-reg-form__label">Relationship to Tenant<span className="tenancy-reg-form__req">*</span></label>
                        <input className="tenancy-reg-form__control" type="text" required placeholder="e.g. Family member, Friend, Colleague" value={tenantWitnessRelationship} onChange={(e) => setTenantWitnessRelationship(e.target.value)} />
                      </div>
                    </div>
                    <div className="tenancy-reg-form__row">
                      <SignatureField
                        padRef={tenantWitnessSigRef}
                        label="Witness to sign below with mouse or finger"
                        required
                        signed={tenantWitnessSigned}
                      />
                    </div>
                  </div>

                  <div className="tenancy-reg-form__witness-block">
                    <p className="tenancy-reg-form__witness-heading">Prepared By</p>
                    <div className="tenancy-reg-form__row">
                      <SignatureField
                        padRef={solicitorSig2Ref}
                        label="Solicitor to sign below with mouse or finger"
                        signed={solicitorSigned2}
                      />
                    </div>
                    <p className="tenancy-reg-form__witness-name" style={{ marginTop: 14 }}>{SOLICITOR_NAME}</p>
                    <p className="tenancy-reg-form__witness-note" style={{ fontStyle: "normal" }}>
                      {SOLICITOR_ADDRESS_LINES.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}
                    </p>
                  </div>
                </div>

                <div className="tenancy-reg-form__submit-area">
                  <p className="tenancy-reg-form__disclaim">
                    By submitting, you certify that all information and the attached ID document are true, accurate,
                    and belong to you. False declarations may lead to rejection of this application and forfeiture
                    of any caution fee already paid.
                  </p>
                  <div>
                    <button type="submit" className="tenancy-reg-form__btn-submit">
                      <FileSignature className="h-4 w-4 mr-1.5 inline" />
                      Submit Registration
                    </button>
                    {formErrorVisible && (
                      <div className="tenancy-reg-form__err-msg">
                        Please complete all required fields, attach your ID, and get both your signature and your witness&apos;s signature before submitting.
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="tenancy-reg-form__prepared-by">
          <div className="tenancy-reg-form__prepared-by-text">
            <div className="tenancy-reg-form__prepared-by-line" />
            <p className="tenancy-reg-form__prepared-by-label">Prepared By:</p>
            <p>
              <strong>{SOLICITOR_NAME}</strong><br />
              {SOLICITOR_ADDRESS_LINES.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}
            </p>
          </div>
          <img src={NBA_SEAL_DATA} className="tenancy-reg-form__prepared-by-seal" alt="Nigerian Bar Association verification seal" />
        </div>

        <div className="tenancy-reg-form__footer-note">
          This form does not itself constitute the final signed Tenancy Agreement &mdash; it registers the Tenant&apos;s particulars and consent for the Landlord&apos;s review.
        </div>
      </div>
    </div>
  );
}
