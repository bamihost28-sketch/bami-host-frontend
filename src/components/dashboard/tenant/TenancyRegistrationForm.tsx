import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { jsPDF } from "jspdf";
import { FileSignature, Loader, Printer } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { BASE_API_URL } from "@/services/api";
import { NBA_SEAL_DATA } from "./nbaSealData";
import { SignatureField, type SignaturePadHandle } from "../shared/SignaturePad";
import "./tenancy-registration-form.css";

const TITLE_OPTIONS = ["Mr.", "Mrs.", "Miss", "Ms.", "Dr."];
const BEDROOM_OPTIONS = ["Self-Contain", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4+ Bedroom"];
const ID_TYPES = [
  "Permanent Voter's Card (PVC)",
  "Driver's License",
  "National Identification Number (NIN)",
  "International Passport",
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

type TermItem = { id: string; text: string };

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

const LandlordParagraph = React.memo(function LandlordParagraph({
  paragraphRef,
}: {
  paragraphRef: React.RefObject<HTMLParagraphElement>;
}) {
  return <p ref={paragraphRef}>{DEFAULT_LANDLORD_PARAGRAPH}</p>;
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
  doc.text(d.landlord || LANDLORD_NAME, pageW / 2, cy, { align: "center" });
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

export function TenancyRegistrationForm({ tenantId }: { tenantId?: string } = {}) {
  const viewOnly = !!tenantId;
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const idFileRef = useRef<HTMLInputElement>(null);
  const landlordParagraphRef = useRef<HTMLParagraphElement>(null);

  const [formKey, setFormKey] = useState(0);
  const [landlordName, setLandlordName] = useState(LANDLORD_NAME);

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
  const [idFile, setIdFile] = useState<File | null>(null);

  const [kinName, setKinName] = useState("");
  const [kinRelation, setKinRelation] = useState("");
  const [kinPhone, setKinPhone] = useState("");

  const [terms, setTerms] = useState<TermItem[]>([]);
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
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [alreadySubmittedAt, setAlreadySubmittedAt] = useState<string | null>(null);
  const [agreementStatus, setAgreementStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [downloadingSigned, setDownloadingSigned] = useState(false);
  const [agreementLoading, setAgreementLoading] = useState(viewOnly);
  const [tenantSigImageUrl, setTenantSigImageUrl] = useState<string | null>(null);
  const [tenantWitnessSigImageUrl, setTenantWitnessSigImageUrl] = useState<string | null>(null);

  const sigDateParts = useMemo(() => dateParts(sigDate), [sigDate]);

  const handleRentYearChange = (value: string) => {
    setRentYear(value);
    const yearly = parseFloat(value);
    if (yearly && yearly > 0) {
      setRentMonth(String(Math.round(yearly / 12)));
      setRentDay(String(Math.round(yearly / 365)));
    }
  };

  // Prefill everything the tenant's real record already has, so they're only
  // typing what we genuinely don't know (address, occupation, ID, next of
  // kin, witness). Silently no-ops if the fetch fails — the form still works
  // blank, same as before this existed.
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const url = tenantId
          ? `${BASE_API_URL}/api/tenants/${tenantId}/agreement`
          : `${BASE_API_URL}/api/tenants/me/agreement`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        // Admin view always shows the submitted record read-only, whatever its
        // review status. The tenant's own view re-opens as an editable form
        // when rejected (json.signed is false in that case) so they can fix
        // and resubmit — see get_my_agreement's comment on the backend.
        if (json?.signed) {
          setAlreadySubmitted(true);
          setAlreadySubmittedAt(json?.data?.signedAt || null);
        }
        setAgreementStatus(json?.status ?? null);
        setRejectionReason(json?.data?.rejectionReason || null);

        // The estate's own terms (utils/tenancy_terms.py, customizable per
        // estate by the property admin) — the single source of truth for
        // what's shown here and what's actually persisted at signing time.
        const fetchedTerms = json?.data?.terms;
        if (Array.isArray(fetchedTerms) && fetchedTerms.length) {
          setTerms(fetchedTerms.map((text: string, i: number) => ({ id: `term-${i}`, text })));
        }

        const p = json?.data?.parties;
        if (!p) return;

        // The backend's camelize_response_middleware (middleware/camelize.py)
        // auto-converts every JSON response's keys from snake_case to
        // camelCase for all routes except a specific opt-out list that does
        // NOT include /api/tenants or /api/tenancy-agreements — so `parties`
        // arrives here as camelCase even though build_parties() constructs
        // it snake_case internally. Confirmed against the real live response.
        if (p.landlordName) {
          setLandlordName(p.landlordName);
          setLandlordTypedSig(p.landlordName);
        }
        if (p.tenantName) setTenantName(p.tenantName);
        if (p.tenantPhone) setTenantPhone(p.tenantPhone);
        if (p.tenantEmail) setTenantEmail(p.tenantEmail);

        const apartment = [p.unitLabel, p.estateName, p.estateAddress].filter(Boolean).join(", ");
        if (apartment) setApartmentAddress(apartment);

        if (p.bedroomCount) {
          const n = parseInt(String(p.bedroomCount), 10);
          const match = Number.isFinite(n)
            ? BEDROOM_OPTIONS.find((o) => o.startsWith(String(n)))
            : BEDROOM_OPTIONS.find((o) => o === "Self-Contain");
          setBedrooms(match || "");
        }

        if (p.rentAmount) handleRentYearChange(String(Math.round(p.rentAmount * 12)));
        if (p.startDate) setStartDate(String(p.startDate).slice(0, 10));
        if (p.cautionFee != null) setCaution(String(p.cautionFee));
        if (p.legalFee != null) setLegalFee(String(p.legalFee));

        // Admin view: also pull in what only exists once the tenant has
        // actually signed — the registration particulars, ID, witness and
        // signature images — so the read-only form looks exactly like what
        // the tenant submitted, not just the personalized blank template.
        // Same for a tenant resubmitting after rejection, so they're only
        // fixing what was flagged rather than retyping everything.
        if ((tenantId || json?.status === "rejected") && json?.data) {
          const reg = json.data.registration || {};
          if (reg.address) setTenantAddress(reg.address);
          if (reg.occupation) setTenantOccupation(reg.occupation);
          if (reg.employer) setTenantEmployer(reg.employer);
          if (reg.idType) setIdType(reg.idType);
          if (reg.idNumber) setIdNumber(reg.idNumber);
          if (reg.idDocumentUrl) setIdPreviewUrl(reg.idDocumentUrl);
          if (reg.kinName) setKinName(reg.kinName);
          if (reg.kinRelationship) setKinRelation(reg.kinRelationship);
          if (reg.kinPhone) setKinPhone(reg.kinPhone);
          if (reg.witnessName) setTenantWitnessName(reg.witnessName);
          if (reg.witnessAddress) setTenantWitnessAddress(reg.witnessAddress);
          if (reg.witnessOccupation) setTenantWitnessOccupation(reg.witnessOccupation);
          if (reg.witnessPhone) setTenantWitnessPhone(reg.witnessPhone);
          if (reg.witnessRelationship) setTenantWitnessRelationship(reg.witnessRelationship);
          if (reg.witnessSignatureImage) setTenantWitnessSigImageUrl(reg.witnessSignatureImage);
          if (json.data.typedName) setTypedSig(json.data.typedName);
          if (json.data.signatureImage) setTenantSigImageUrl(json.data.signatureImage);
          if (json.data.signedAt) setSigDate(String(json.data.signedAt).slice(0, 10));
          setAgreedTerms(true);
        }
      } catch {
        // No backend data available — form stays blank, exactly as before.
      } finally {
        if (tenantId) setAgreementLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileName(file.name);
    setIdFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setIdPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const persistSignedAgreement = async (data: SubmissionData): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      let idDocumentUrl = "";
      if (idFile) {
        const form = new FormData();
        form.append("file", idFile);
        const uploadRes = await fetch(`${BASE_API_URL}/api/tenants/me/agreement/upload-id`, {
          method: "POST",
          headers: authHeaders,
          body: form,
        });
        if (!uploadRes.ok) return false;
        const uploadJson = await uploadRes.json();
        idDocumentUrl = uploadJson?.data?.url || "";
      }
      if (!idDocumentUrl) return false;

      const signRes = await fetch(`${BASE_API_URL}/api/tenants/me/agreement/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          typedName: data.typedSig,
          signatureImage: data.sigImage || null,
          address: data.homeAddress,
          occupation: data.occupation,
          employer: data.employer || undefined,
          idType: data.idType,
          idNumber: data.idNumber,
          idDocumentUrl,
          kinName: data.kinName,
          kinRelationship: data.kinRelation,
          kinPhone: data.kinPhone,
          witnessName: data.tenantWitnessName,
          witnessAddress: data.tenantWitnessAddress,
          witnessOccupation: data.tenantWitnessOccupation,
          witnessPhone: data.tenantWitnessPhone || undefined,
          witnessRelationship: data.tenantWitnessRelationship,
          witnessTypedName: data.tenantWitnessName,
          witnessSignatureImage: data.tenantWitnessSigImage || null,
        }),
      });
      return signRes.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      landlord: landlordName,
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
      terms: terms.map((t) => t.text),
      landlordParagraph: landlordParagraphRef.current?.textContent?.trim() || DEFAULT_LANDLORD_PARAGRAPH,
      submittedAt: new Date().toLocaleString(),
    };
    setSubmission(data);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setSubmitting(true);
    const saved = await persistSignedAgreement(data);
    setSubmitting(false);
    if (saved) {
      setAlreadySubmitted(true);
      toast({ title: "Registration recorded", description: "Download your tenant and landlord copies below." });
    } else {
      toast({
        title: "Registration recorded, but not saved permanently",
        description: "Your copies are ready to download below, but this device couldn't confirm it with the server — you may be asked to submit again.",
        variant: "destructive",
      });
    }
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

  const handleDownloadSigned = async () => {
    setDownloadingSigned(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = tenantId
        ? `${BASE_API_URL}/api/tenants/${tenantId}/agreement/pdf`
        : `${BASE_API_URL}/api/tenants/me/agreement/pdf`;
      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tenancy-agreement.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Couldn't download", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setDownloadingSigned(false);
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
    setAgreedTerms(false);
    setLandlordTypedSig(landlordName);
    setLandlordSigDate("");
    setLandlordWitnessName(""); setLandlordWitnessAddress(""); setLandlordWitnessOccupation(""); setLandlordWitnessRelationship("");
    setTypedSig("");
    setSigDate(new Date().toISOString().slice(0, 10));
    setTenantWitnessName(""); setTenantWitnessAddress(""); setTenantWitnessOccupation("");
    setTenantWitnessPhone(""); setTenantWitnessRelationship("");
    setTenantSigned(false); setLandlordSigned(false); setLandlordWitnessSigned(false);
    setTenantWitnessSigned(false); setSolicitorSigned2(false);
    if (idFileRef.current) idFileRef.current.value = "";
    setFormKey((k) => k + 1);
  };

  const refDisplay = submission ? `Reference No: ${submission.ref}` : "Reference will be issued on submission";

  // Admin/view-only mode: skip the tenant's own submit flow entirely and
  // either show a loading state, a short "not yet signed" notice, or (below)
  // fall through into the same form, rendered read-only with the tenant's
  // real data instead of the blank template.
  if (viewOnly && agreementLoading) {
    return (
      <div className="tenancy-reg-form">
        <div className="tenancy-reg-form__desk">
          <div className="tenancy-reg-form__paper" style={{ padding: 48, textAlign: "center" }}>
            <Loader className="h-5 w-5 inline animate-spin" />
          </div>
        </div>
      </div>
    );
  }
  if (viewOnly && !alreadySubmitted) {
    return (
      <div className="tenancy-reg-form">
        <div className="tenancy-reg-form__desk">
          <div className="tenancy-reg-form__desk-header">
            Delta State &middot; Warri South Local Government Area &mdash; Digital Tenancy Registry
          </div>
          <div className="tenancy-reg-form__paper">
            <div className="tenancy-reg-form__letterhead">
              <h1>Tenancy Registration Form</h1>
              <p className="tenancy-reg-form__sub">Not yet signed by the tenant.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already signed in an earlier session — lock the form out entirely so the
  // tenant can't submit a second registration. `submission` being set means
  // they just signed THIS session, which still uses the normal confirmation
  // view below, not this locked one. Doesn't apply in admin/view-only mode —
  // there we fall through and show the full read-only form instead.
  if (!viewOnly && alreadySubmitted && !submission) {
    return (
      <div className="tenancy-reg-form">
        <div className="tenancy-reg-form__desk">
          <div className="tenancy-reg-form__desk-header">
            Delta State &middot; Warri South Local Government Area &mdash; Digital Tenancy Registry
          </div>
          <div className="tenancy-reg-form__paper">
            <div className="tenancy-reg-form__letterhead">
              <span className="tenancy-reg-form__ribbon">
                {agreementStatus === "approved" ? "Approved" : "Signed & On File"}
              </span>
              <h1>Tenancy Registration Form</h1>
              <p className="tenancy-reg-form__sub">
                You've already submitted and signed this tenancy registration
                {alreadySubmittedAt ? ` on ${new Date(alreadySubmittedAt).toLocaleDateString()}` : ""}.
                {agreementStatus === "pending" && " It's awaiting review by the estate office."}
                {agreementStatus === "approved" && " It has been reviewed and approved."}
              </p>
            </div>
            <div style={{ padding: "8px 48px 48px", textAlign: "center" }}>
              {agreementStatus === "approved" ? (
                <button
                  type="button"
                  className="tenancy-reg-form__btn-submit"
                  onClick={handleDownloadSigned}
                  disabled={downloadingSigned}
                >
                  {downloadingSigned ? <Loader className="h-4 w-4 mr-1.5 inline animate-spin" /> : <FileSignature className="h-4 w-4 mr-1.5 inline" />}
                  Download Your Signed Copy
                </button>
              ) : (
                <p className="tenancy-reg-form__note" style={{ fontSize: 13 }}>
                  Your copy will be available to download once the estate office approves your registration.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenancy-reg-form">
      <div className="tenancy-reg-form__desk">
        <div className="tenancy-reg-form__desk-header">
          Delta State &middot; Warri South Local Government Area &mdash; Digital Tenancy Registry
        </div>

        <div className="tenancy-reg-form__paper">
          {!viewOnly && agreementStatus === "rejected" && (
            <div
              style={{
                margin: "16px 48px 0", padding: "12px 16px", borderRadius: 8,
                background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <p style={{ fontWeight: 600, color: "#dc2626", margin: 0 }}>
                Your last submission was rejected
              </p>
              <p style={{ color: "#7f1d1d", margin: "4px 0 0", fontSize: 13 }}>
                {rejectionReason || "The estate office asked you to review and resubmit this agreement."}
                {" "}Your previous details are prefilled below — fix what's needed and sign again.
              </p>
            </div>
          )}
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
              {landlordName}<br /><span className="tenancy-reg-form__cover-role">(LANDLORD)</span>
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
                  {agreementStatus === "approved" ? (
                    <>
                      <button
                        type="button"
                        className="tenancy-reg-form__btn-tenant-copy"
                        disabled={generating !== null}
                        onClick={() => handleDownload("tenant")}
                      >
                        {generating === "tenant" ? <Loader className="h-3.5 w-3.5 mr-1.5 inline animate-spin" /> : null}
                        Download Your Copy
                      </button>
                      <button type="button" className="tenancy-reg-form__btn-print" onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5 mr-1.5 inline" />
                        Print
                      </button>
                    </>
                  ) : (
                    <p className="tenancy-reg-form__note" style={{ fontSize: 13 }}>
                      Your copy will be available to download once the estate office approves your registration.
                    </p>
                  )}
                  <button type="button" className="tenancy-reg-form__btn-new" onClick={handleReset}>
                    Start New Registration
                  </button>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate={false}>
              <fieldset disabled={viewOnly} style={viewOnly ? { border: 0, margin: 0, padding: 0 } : undefined}>
                {/* SECTION 1 */}
                <div className="tenancy-reg-form__section" style={{ marginTop: 0 }}>
                  <div className="tenancy-reg-form__section-head">
                    <span className="tenancy-reg-form__section-num">01</span>
                    <h2>Parties to the Agreement</h2>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Landlord</label>
                      <input className="tenancy-reg-form__control" type="text" value={landlordName.replace(/^MR\. /, "Mr. ")} readOnly />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Prepared By (Solicitor)</label>
                      <input className="tenancy-reg-form__control" type="text" value="G. Anukun Esq., LL.M, AICMC" readOnly />
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Full Legal Name of Tenant</label>
                      <div className="tenancy-reg-form__name-group">
                        <select className="tenancy-reg-form__select" required value={tenantTitle} onChange={(e) => setTenantTitle(e.target.value)}>
                          <option value="">Title</option>
                          {TITLE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input className="tenancy-reg-form__control" type="text" placeholder="Full name" value={tenantName} readOnly />
                      </div>
                      <p className="tenancy-reg-form__note">On file with your estate office. Contact them if this needs correcting.</p>
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Phone Number</label>
                      <input className="tenancy-reg-form__control" type="tel" value={tenantPhone} readOnly />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Email Address</label>
                      <input className="tenancy-reg-form__control" type="email" value={tenantEmail} readOnly />
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
                      <label className="tenancy-reg-form__label">Apartment Address</label>
                      <input className="tenancy-reg-form__control" type="text" value={apartmentAddress} readOnly />
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Number of Bedrooms</label>
                      <input className="tenancy-reg-form__control" type="text" value={bedrooms} readOnly />
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
                      <input className="tenancy-reg-form__control" type="number" value={rentDay} readOnly />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Rent per Month (&#8358;)</label>
                      <input className="tenancy-reg-form__control" type="number" value={rentMonth} readOnly />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Rent per Year (&#8358;)</label>
                      <input className="tenancy-reg-form__control" type="number" value={rentYear} readOnly />
                      <p className="tenancy-reg-form__note">Set by your estate office. Contact them if this needs correcting.</p>
                    </div>
                  </div>
                  <div className="tenancy-reg-form__row">
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">Proposed Tenancy Start Date</label>
                      <input className="tenancy-reg-form__control" type="date" value={startDate} readOnly />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">One Time Caution Fee (&#8358;)</label>
                      <input className="tenancy-reg-form__control" type="number" value={caution} readOnly />
                    </div>
                    <div className="tenancy-reg-form__field">
                      <label className="tenancy-reg-form__label">One Time Legal Fee (&#8358;)</label>
                      <input className="tenancy-reg-form__control" type="number" value={legalFee} readOnly />
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
                      <label className="tenancy-reg-form__label">
                        {viewOnly ? "ID Document" : "Upload Clear Photo / Scan of ID"}
                        {!viewOnly && <span className="tenancy-reg-form__req">*</span>}
                      </label>
                      {!viewOnly && (
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
                      )}
                      {idPreviewUrl ? (
                        <div className="tenancy-reg-form__preview-thumb">
                          <a href={idPreviewUrl} target="_blank" rel="noreferrer">
                            <img src={idPreviewUrl} alt="ID preview" />
                          </a>
                          {idFileName && <span className="tenancy-reg-form__preview-fname">{idFileName}</span>}
                        </div>
                      ) : (
                        viewOnly && <p className="tenancy-reg-form__note">No ID document on file.</p>
                      )}
                      {!viewOnly && (
                        <p className="tenancy-reg-form__note">
                          The name and ID number entered above must match this document exactly, or your registration may be rejected during review.
                        </p>
                      )}
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
                  <div className="tenancy-reg-form__clauses">
                    <ol>
                      {terms.map((t) => <li key={t.id}>{t.text}</li>)}
                    </ol>
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
                      I confirm I have read, understood, and agree to be bound by all {terms.length} terms of this
                      Tenancy Agreement listed above, and the full agreement to be issued upon approval.
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

                  {viewOnly && (
                    <div className="tenancy-reg-form__witness-block">
                      <p className="tenancy-reg-form__witness-heading">Signed and Delivered by the within named &ldquo;LANDLORD&rdquo;</p>
                      <p className="tenancy-reg-form__witness-name">{landlordName}</p>
                      <div className="tenancy-reg-form__row">
                        <SignatureField
                          padRef={landlordSigRef}
                          label="Landlord to sign below with mouse or finger"
                          signed={landlordSigned}
                          viewOnly={viewOnly}
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
                          viewOnly={viewOnly}
                        />
                      </div>
                    </div>
                  )}

                  <div className="tenancy-reg-form__witness-block">
                    <p className="tenancy-reg-form__witness-heading">Signed and Delivered by the within named &ldquo;TENANT&rdquo;</p>
                    <div className="tenancy-reg-form__row">
                      <SignatureField
                        padRef={tenantSigRef}
                        label="Sign below with your mouse or finger"
                        required
                        signed={tenantSigned}
                        viewOnly={viewOnly}
                        imageSrc={tenantSigImageUrl}
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
                        viewOnly={viewOnly}
                        imageSrc={tenantWitnessSigImageUrl}
                      />
                    </div>
                  </div>

                  {viewOnly && (
                    <div className="tenancy-reg-form__witness-block">
                      <p className="tenancy-reg-form__witness-heading">Prepared By</p>
                      <div className="tenancy-reg-form__row">
                        <SignatureField
                          padRef={solicitorSig2Ref}
                          label="Solicitor's signature (appended separately by the solicitor, not signed here)"
                          signed={solicitorSigned2}
                          viewOnly
                        />
                      </div>
                      <p className="tenancy-reg-form__witness-name" style={{ marginTop: 14 }}>{SOLICITOR_NAME}</p>
                      <p className="tenancy-reg-form__witness-note" style={{ fontStyle: "normal" }}>
                        {SOLICITOR_ADDRESS_LINES.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}
                      </p>
                    </div>
                  )}
                </div>
              </fieldset>

                {viewOnly ? (
                  <div className="tenancy-reg-form__submit-area">
                    <button
                      type="button"
                      className="tenancy-reg-form__btn-submit"
                      onClick={handleDownloadSigned}
                      disabled={downloadingSigned}
                    >
                      {downloadingSigned ? <Loader className="h-4 w-4 mr-1.5 inline animate-spin" /> : <FileSignature className="h-4 w-4 mr-1.5 inline" />}
                      Download Signed PDF
                    </button>
                  </div>
                ) : (
                  <div className="tenancy-reg-form__submit-area">
                    <p className="tenancy-reg-form__disclaim">
                      By submitting, you certify that all information and the attached ID document are true, accurate,
                      and belong to you. False declarations may lead to rejection of this application and forfeiture
                      of any caution fee already paid.
                    </p>
                    <div>
                      <button type="submit" className="tenancy-reg-form__btn-submit" disabled={submitting}>
                        {submitting ? <Loader className="h-4 w-4 mr-1.5 inline animate-spin" /> : <FileSignature className="h-4 w-4 mr-1.5 inline" />}
                        {submitting ? "Submitting…" : "Submit Registration"}
                      </button>
                      {formErrorVisible && (
                        <div className="tenancy-reg-form__err-msg">
                          Please complete all required fields, attach your ID, and get both your signature and your witness&apos;s signature before submitting.
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
