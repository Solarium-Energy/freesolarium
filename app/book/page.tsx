"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TestModeBar from "../components/TestModeBar";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import { Field, Input, Select, TextArea } from "../components/ui/Field";
import FileUpload from "../components/ui/FileUpload";
import ResultScreen from "../components/ui/ResultScreen";
import { useLanguage } from "../lib/language";
import { site, whatsappUrl } from "../lib/content";
import { buildMeta, isConfirmed, newSubmissionId, postJson, type PostResult } from "../lib/leadClient";

/* Helpers */
const MAX_MB = 10;
const MAX_VIDEO_MB = 50;

const EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  mp4: "video/mp4",
};

// Accepted on every photo input but deliberately left out of `accept`: with them listed,
// Safari converts ordinary JPG and PNG photos to HEIC. Without them, an iPhone converts
// HEIC photos to JPEG itself. A HEIC file that still arrives is uploaded as it is.
const HEIC_TYPES = ["image/heic", "image/heif"];

/** The file's type, or when the browser gives none, the type its extension implies. */
function fileType(file: File) {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPES[extension] ?? "";
}

/**
 * The checks of a chosen file, in this order: its type (HEIC passes on photo inputs), then its size.
 * Returns the sentence that refuses the file, or null when it is taken.
 */
function checkFile(f: File, accept: string, isGu: boolean): string | null {
  const type = fileType(f);
  const allowed = accept.split(",");
  const takesPhotos = allowed.includes("image/jpeg");
  if (!allowed.includes(type) && !(takesPhotos && HEIC_TYPES.includes(type))) {
    const takesPdf = allowed.includes("application/pdf");
    const takesVideo = allowed.includes("video/mp4");
    return isGu
      ? `આ ફાઇલનો પ્રકાર માન્ય નથી. કૃપા કરીને JPG, PNG, WebP અથવા HEIC ફોટો${takesPdf ? ", અથવા PDF" : takesVideo ? ", અથવા MP4 વીડિયો" : ""} પસંદ કરો.`
      : `This file type is not allowed. Please choose a JPG, PNG, WebP or HEIC photo${takesPdf ? ", or a PDF" : takesVideo ? ", or an MP4 video" : ""}.`;
  }
  const maxMb = type === "video/mp4" ? MAX_VIDEO_MB : MAX_MB;
  if (f.size > maxMb * 1024 * 1024) {
    return isGu
      ? `ફાઇલ ${maxMb} MB કરતા ઓછી હોવી જોઈએ.`
      : `File must be under ${maxMb} MB.`;
  }
  return null;
}

/* `crm` is the value the CRM expects for each option. */
const DISCOMS = [
  { value: "UGVCL", en: "UGVCL", gu: "UGVCL", crm: "UGVCL" },
  { value: "MGVCL", en: "MGVCL", gu: "MGVCL", crm: "MGVCL" },
  { value: "DGVCL", en: "DGVCL", gu: "DGVCL", crm: "DGVCL" },
  { value: "PGVCL", en: "PGVCL", gu: "PGVCL", crm: "PGVCL" },
  { value: "TORRENT", en: "TORRENT", gu: "TORRENT", crm: "Torrent" },
  { value: "Other", en: "Other", gu: "અન્ય (Other)", crm: "Other" },
];
const PROJECT_TYPES = [
  { value: "Residential", en: "Residential", gu: "રહેણાંક (Residential)" },
  { value: "Commercial", en: "Commercial", gu: "કોમર્શિયલ (Commercial)" },
  { value: "Industrial", en: "Industrial", gu: "ઔદ્યોગિક (Industrial)" },
  { value: "Other", en: "Other", gu: "અન્ય (Other)" },
];
const LOAN_OPTIONS = [
  { value: "Yes", en: "Yes", gu: "હા (Yes)" },
  { value: "No", en: "No", gu: "ના (No)" },
  { value: "Maybe", en: "Maybe", gu: "કદાચ (Maybe)" },
];
const YES_NO = [
  { value: "Yes", en: "Yes", gu: "હા (Yes)" },
  { value: "No", en: "No", gu: "ના (No)" },
];

/* ─── form state shape ─── */
type FormState = {
  referralPartner: string;
  referralNo: string;
  customerName: string;
  contactNo: string;
  pincode: string;
  city: string;
  email: string;
  discom: string;
  projectType: string;
  nameSame: string;
  loanRequirement: string;
  shadowLength: string;
  shadowWidth: string;
  remarks: string;
};

type FileState = {
  lightBill: File | null;
  passport: File | null;
  aadharFront: File | null;
  aadharBack: File | null;
  panCard: File | null;
  cheque: File | null;
  housePhoto: File | null;
  geoTagged: File | null;
  site1: File | null;
  site2: File | null;
};

const EMPTY_FORM: FormState = {
  referralPartner: "", referralNo: "", customerName: "", contactNo: "",
  pincode: "", city: "", email: "", discom: "", projectType: "",
  nameSame: "", loanRequirement: "",
  shadowLength: "", shadowWidth: "", remarks: "",
};

const EMPTY_FILES: FileState = {
  lightBill: null, passport: null, aadharFront: null, aadharBack: null,
  panCard: null, cheque: null, housePhoto: null, geoTagged: null,
  site1: null, site2: null,
};

type FileKey = keyof FileState;

// image/jpeg stays first in every list: Safari converts photos to the first type listed.
const IMAGE_TYPES = "image/jpeg,image/png,image/webp";

/* Each file input: its CRM document type, the types it accepts, and its label. */
const FILE_FIELDS: Record<FileKey, { docType: string; accept: string; en: string; gu: string }> = {
  lightBill: { docType: "electricity-bill", accept: `${IMAGE_TYPES},application/pdf`, en: "Light Bill (Latest)", gu: "વીજળીનું બિલ (નવીનતમ)" },
  passport: { docType: "passport-photo", accept: IMAGE_TYPES, en: "Passport Size Photograph", gu: "પાસપોર્ટ સાઈઝનો ફોટો" },
  aadharFront: { docType: "aadhaar-front", accept: IMAGE_TYPES, en: "Aadhaar Card Front", gu: "આધાર કાર્ડનો આગળનો ભાગ" },
  aadharBack: { docType: "aadhaar-back", accept: IMAGE_TYPES, en: "Aadhaar Card Back", gu: "આધાર કાર્ડનો પાછળનો ભાગ" },
  panCard: { docType: "pan", accept: IMAGE_TYPES, en: "PAN Card", gu: "PAN કાર્ડ" },
  cheque: { docType: "bank-proof", accept: `${IMAGE_TYPES},application/pdf`, en: "Cancelled Cheque / Passbook", gu: "કેન્સલ કરેલો ચેક / પાસબુક" },
  housePhoto: { docType: "house-photo", accept: IMAGE_TYPES, en: "House Photo (all floors visible)", gu: "ઘરનો ફોટો (બધા માળ દેખાય તે રીતે)" },
  geoTagged: { docType: "geotagged-photo", accept: IMAGE_TYPES, en: "Geo Tagged Photo (Solar Location)", gu: "જીઓ-ટેગ કરેલો ફોટો (સોલર માટેનું સ્થાન)" },
  site1: { docType: "site-media", accept: `${IMAGE_TYPES},video/mp4`, en: "Site Photos & Videos 1", gu: "સાઇટના ફોટા અને વીડિયો 1" },
  site2: { docType: "site-media", accept: `${IMAGE_TYPES},video/mp4`, en: "Site Photos & Videos 2", gu: "સાઇટના ફોટા અને વીડિયો 2" },
};

const FILE_KEYS = Object.keys(FILE_FIELDS) as FileKey[];

/* Contract field path to the input that shows its error. */
const FIELD_INPUTS: Record<string, keyof FormState> = {
  "customer.name": "customerName",
  "customer.phone": "contactNo",
  "customer.email": "email",
  "customer.city": "city",
  "customer.pincode": "pincode",
  "order.discom": "discom",
  "order.project_type": "projectType",
  "order.loan_interest": "loanRequirement",
  "order.name_matches_bank": "nameSame",
  "order.shadow_free_length": "shadowLength",
  "order.shadow_free_width": "shadowWidth",
  "order.remarks": "remarks",
  "referral.name": "referralPartner",
  "referral.code": "referralNo",
  "referral.phone": "referralNo",
};

type UploadedDoc = { doc_type: string; path: string; file_name: string };
type SubmitError = { kind: "general" | "rate"; detail?: string };

/** Ten digits after removing everything else and a leading 91 country code. */
function cleanPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  return digits;
}

/** A number typed in a text input, or undefined when empty or not a number. */
function toNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Focuses the input that comes first on the page. */
function scrollToFirst(ids: string[]) {
  const elements = ids
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null)
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const first = elements[0];
  first?.scrollIntoView({ behavior: "smooth", block: "center" });
  first?.focus();
}

export default function BookPage() {
  const { isGu } = useLanguage();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [files, setFiles] = useState<FileState>(EMPTY_FILES);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [missingDocs, setMissingDocs] = useState<FileKey[]>([]);
  const [devSkipped, setDevSkipped] = useState(false);
  const [testOk, setTestOk] = useState(false);
  const [website, setWebsite] = useState("");

  // One submission id per form session. Kept across retries while the chosen
  // files stay the same, so files that already reached the CRM are not sent again.
  const submissionIdRef = useRef<string | null>(null);
  const uploadedRef = useRef<Partial<Record<FileKey, UploadedDoc>>>({});
  const lastAttemptFilesRef = useRef<FileState | null>(null);

  function set(key: keyof FormState, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function setFile(key: keyof FileState, f: File | null) {
    setFiles((s) => ({ ...s, [key]: f }));
  }

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};
    const reqMsg = isGu ? "આ વિગત જરૂરી છે" : "Required";
    if (!form.customerName.trim()) next.customerName = reqMsg;
    if (!/^\d{10}$/.test(form.contactNo.replace(/\D/g, "")))
      next.contactNo = isGu ? "10-અંકનો મોબાઈલ નંબર દાખલ કરો" : "Enter a 10-digit number";
    if (!/^\d{6}$/.test(form.pincode))
      next.pincode = isGu ? "6-અંકનો પિનકોડ દાખલ કરો" : "Enter a 6-digit pincode";
    if (!form.city.trim()) next.city = reqMsg;
    if (!form.discom) next.discom = reqMsg;
    if (!form.projectType) next.projectType = reqMsg;
    setErrors(next);

    const firstKey = Object.keys(next)[0] as keyof FormState | undefined;
    if (firstKey) {
      const el = document.getElementById(firstKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      return false;
    }
    return true;
  }

  /** Shows a 400 answer: messages under the matching inputs, the rest as the general error. */
  function showInvalid(body: PostResult["body"]) {
    const message = typeof body?.message === "string" ? body.message : "";
    const fields =
      body && typeof body.fields === "object" && body.fields !== null
        ? (body.fields as Record<string, unknown>)
        : null;

    const next: Partial<Record<keyof FormState, string>> = {};
    let unmatched = !fields || Object.keys(fields).length === 0;
    for (const [path, text] of Object.entries(fields ?? {})) {
      const input = FIELD_INPUTS[path];
      if (input) next[input] = String(text);
      else unmatched = true;
    }

    if (Object.keys(next).length) {
      setErrors(next);
      scrollToFirst(Object.keys(next));
    }
    if (unmatched) setSubmitError({ kind: "general", detail: message });
  }

  /** Uploads the chosen files that have not reached the CRM yet. Returns the ones that failed. */
  async function uploadFiles(submissionId: string, pending: FileKey[]): Promise<{ failed: FileKey[]; invalid?: PostResult }> {
    const links = await postJson("/api/order/upload-links", {
      submission_id: submissionId,
      files: pending.map((key) => {
        const file = files[key] as File;
        return { doc_type: FILE_FIELDS[key].docType, content_type: fileType(file), size: file.size };
      }),
      website,
    });

    // A 400 is shown to the visitor. Any other failure: go on without the files.
    if (links.status === 400) return { failed: pending, invalid: links };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const bucket = links.body?.bucket;
    const answered = Array.isArray(links.body?.files) ? (links.body.files as Record<string, unknown>[]) : [];
    // Each link names the position of its file in the request (`index`). Both site
    // inputs share one type, so links are never matched by type. Without an index on
    // every link, they are matched by their own position.
    const byIndex = answered.length > 0 && answered.every((entry) => Number.isInteger(entry.index));
    if (!isConfirmed(links) || links.body?.status !== "ok" || typeof bucket !== "string" || !supabaseUrl || !publishableKey) {
      return { failed: pending };
    }

    let storage;
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      storage = supabase.storage.from(bucket);
    } catch {
      return { failed: pending };
    }

    const failed: FileKey[] = [];
    for (let index = 0; index < pending.length; index += 1) {
      const key = pending[index];
      const file = files[key] as File;
      const link = byIndex ? answered.find((entry) => entry.index === index) : answered[index];
      setUploadProgress({ current: index + 1, total: pending.length });

      if (!link || link.doc_type !== FILE_FIELDS[key].docType || typeof link.path !== "string" || typeof link.token !== "string") {
        failed.push(key);
        continue;
      }

      let done = false;
      for (let attempt = 0; attempt < 2 && !done; attempt += 1) {
        try {
          const { error } = await storage.uploadToSignedUrl(link.path, link.token, file, { contentType: fileType(file) });
          done = !error;
        } catch {
          done = false;
        }
      }

      if (done) {
        uploadedRef.current[key] = { doc_type: FILE_FIELDS[key].docType, path: link.path, file_name: file.name };
      } else {
        failed.push(key);
      }
    }
    return { failed };
  }

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      // A new submission when this is the first attempt or the files changed since the last one.
      const last = lastAttemptFilesRef.current;
      if (!submissionIdRef.current || (last && FILE_KEYS.some((key) => last[key] !== files[key]))) {
        submissionIdRef.current = newSubmissionId();
        uploadedRef.current = {};
      }
      lastAttemptFilesRef.current = files;
      const submissionId = submissionIdRef.current;

      const chosen = FILE_KEYS.filter((key) => files[key]);
      const pending = chosen.filter((key) => !uploadedRef.current[key]);
      let failed: FileKey[] = [];
      if (pending.length) {
        const upload = await uploadFiles(submissionId, pending);
        setUploadProgress(null);
        if (upload.invalid) {
          showInvalid(upload.invalid.body);
          return;
        }
        failed = upload.failed;
      }

      // "Referral No." always goes as the referral code, and also as the phone when it is a mobile number.
      const referralCode = form.referralNo.trim();
      const referralDigits = cleanPhone(referralCode);
      const referralPhone = referralDigits.length === 10 ? referralDigits : "";

      const result = await postJson("/api/order", {
        submission_id: submissionId,
        customer: {
          name: form.customerName.trim(),
          phone: form.contactNo,
          email: form.email.trim(),
          city: form.city.trim(),
          pincode: form.pincode,
        },
        order: {
          discom: DISCOMS.find((o) => o.value === form.discom)?.crm,
          project_type: form.projectType || undefined,
          loan_interest: form.loanRequirement || undefined,
          name_matches_bank: form.nameSame === "Yes" ? true : form.nameSame === "No" ? false : undefined,
          shadow_free_length: toNumber(form.shadowLength),
          shadow_free_width: toNumber(form.shadowWidth),
          remarks: form.remarks.trim(),
        },
        referral: { name: form.referralPartner.trim(), code: referralCode, phone: referralPhone },
        documents: chosen.flatMap((key) => {
          const doc = uploadedRef.current[key];
          return doc ? [doc] : [];
        }),
        meta: buildMeta(),
        website,
      });

      if (isConfirmed(result)) {
        setDevSkipped(result.body?.status === "skipped");
        setTestOk(result.body?.status === "test-ok");
        setMissingDocs(failed);
        // A new form session gets a new submission id.
        submissionIdRef.current = null;
        uploadedRef.current = {};
        lastAttemptFilesRef.current = null;
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (result.status === 400) {
        showInvalid(result.body);
      } else if (result.status === 429) {
        setSubmitError({ kind: "rate" });
      } else {
        setSubmitError({ kind: "general" });
      }
    } catch {
      setSubmitError({ kind: "general" });
    } finally {
      setUploadProgress(null);
      setSubmitting(false);
    }
  }

  /* ── SUCCESS STATE ── */
  if (submitted) {
    return (
      <>
        <TestModeBar />
        <Header />
        <main>
          <section className="section is-subtle book">
            <div className="wrap book-wrap">
              <div className="card book-result">
                <ResultScreen
                  level={1}
                  title={isGu ? "ઓર્ડર સબમિટ થઈ ગયો" : "Order Submitted"}
                  action={
                    <>
                      {missingDocs.length > 0 && (
                        <Alert meaning="attention">
                          {isGu ? "આ દસ્તાવેજો અપલોડ થઈ શક્યા નથી: " : "These documents could not be uploaded: "}
                          <strong>
                            {missingDocs.map((key) => (isGu ? FILE_FIELDS[key].gu : FILE_FIELDS[key].en)).join(", ")}
                          </strong>
                          {isGu ? ". કૃપા કરીને તે અમને " : ". Please send them to us on "}
                          <a
                            href={whatsappUrl(isGu ? "મારા સોલેરિયમ ઓર્ડર માટેના દસ્તાવેજો" : "Documents for my Solarium order")}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp
                          </a>
                          {isGu ? " પર મોકલો." : "."}
                        </Alert>
                      )}
                      {devSkipped && (
                        <Alert meaning="info">
                          {isGu ? "ડેવલપમેન્ટ મોડ: કંઈ મોકલવામાં આવ્યું નથી." : "Development mode: nothing was sent."}
                        </Alert>
                      )}
                      <Button variant="primary" size="lg" href="/">
                        <ArrowLeft className="ico" aria-hidden="true" />
                        {isGu ? "મુખ્ય પૃષ્ઠ પર પાછા જાઓ" : "Back to home"}
                      </Button>
                    </>
                  }
                >
                  {/* A test run says so instead of thanking, so it is never mistaken for a real order. */}
                  {testOk ? (
                    "Test OK: nothing was stored."
                  ) : isGu ? (
                    <>
                      આભાર, <strong>{form.customerName || "ગ્રાહક"}</strong>. અમારી ટીમ તમારી વિગતોની સમીક્ષા કરશે અને 24 કામકાજના કલાકોમાં તમારો સંપર્ક કરશે.
                    </>
                  ) : (
                    <>
                      Thank you, <strong>{form.customerName || "customer"}</strong>. Our team will review your details and reach out within 24 working hours.
                    </>
                  )}
                </ResultScreen>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  /** One file input of the form, from its row in FILE_FIELDS. */
  const upload = (key: FileKey, hint: string) => (
    <FileUpload
      id={key}
      label={isGu ? FILE_FIELDS[key].gu : FILE_FIELDS[key].en}
      hint={hint}
      accept={FILE_FIELDS[key].accept}
      value={files[key]}
      onChange={(f) => setFile(key, f)}
      check={(f) => checkFile(f, FILE_FIELDS[key].accept, isGu)}
      chooseLabel={isGu ? "અપલોડ કરવા માટે ક્લિક કરો" : "Click to upload"}
      removeLabel={isGu ? "દૂર કરો" : "Remove"}
    />
  );
  const photoHint = isGu ? "JPG અથવા PNG" : "JPG or PNG";
  const pdfHint = isGu ? "JPG, PNG અથવા PDF" : "JPG, PNG or PDF";
  const videoHint = isGu ? "JPG, PNG અથવા MP4" : "JPG, PNG or MP4";

  return (
    <>
      <TestModeBar />
      <Header />

      <main>
        <section className="section is-subtle book">
          <div className="wrap book-wrap">
            <div className="book-head">
              <Link href="/" className="link">
                <ArrowLeft className="ico" aria-hidden="true" />
                {isGu ? "મુખ્ય પૃષ્ઠ પર પાછા જાઓ" : "Back to home"}
              </Link>
              <div className="eyebrow">{isGu ? "સોલેરિયમ (Solarium)" : "Solarium"}</div>
              <h1 className="h-sec">{isGu ? "ઓર્ડર ફોર્મ" : "Order Form"}</h1>
            </div>

            <form onSubmit={submit} className="book-form">
              {/* ══ SECTION 1: Partner & Customer Details ══ */}
              <div className="card book-card">
                <div className="book-card-head">
                  <div className="eyebrow">{isGu ? "વિભાગ 01" : "Section 01"}</div>
                  <h2 className="t-display-6">{isGu ? "પાર્ટનર અને ગ્રાહકની વિગતો" : "Partner & Customer Details"}</h2>
                  <p className="muted">
                    {isGu
                      ? "તમારા વીજળીના બિલમાં દર્શાવ્યા મુજબ ગ્રાહકની માહિતી દાખલ કરો."
                      : "Enter customer information as shown on your electricity bill."}
                  </p>
                </div>

                <div className="book-grid">
                  <Field id="referralPartner" label={isGu ? "રેફરલ પાર્ટનરનું નામ" : "Referral Partner Name"} error={errors.referralPartner}>
                    <Input
                      id="referralPartner"
                      large
                      invalid={Boolean(errors.referralPartner)}
                      aria-describedby={errors.referralPartner ? "referralPartner-error" : undefined}
                      placeholder={isGu ? "પાર્ટનરનું નામ" : "Partner name"}
                      value={form.referralPartner}
                      onChange={(e) => set("referralPartner", e.target.value)}
                    />
                  </Field>
                  <Field id="referralNo" label={isGu ? "રેફરલ નંબર" : "Referral No."} error={errors.referralNo}>
                    <Input
                      id="referralNo"
                      large
                      invalid={Boolean(errors.referralNo)}
                      aria-describedby={errors.referralNo ? "referralNo-error" : undefined}
                      placeholder={isGu ? "ઉદા. SOL-REF-001" : "e.g. SOL-REF-001"}
                      maxLength={40}
                      value={form.referralNo}
                      onChange={(e) => set("referralNo", e.target.value)}
                    />
                  </Field>
                </div>

                <hr className="book-rule" />

                <Field
                  id="customerName"
                  label={isGu ? "ગ્રાહકનું નામ (વીજળીના બિલ મુજબ)" : "Name of Customer (As per Electricity Bill)"}
                  required
                  error={errors.customerName}
                >
                  <Input
                    id="customerName"
                    large
                    invalid={Boolean(errors.customerName)}
                    aria-describedby={errors.customerName ? "customerName-error" : undefined}
                    placeholder={isGu ? "બિલમાં દર્શાવ્યા મુજબનું પૂરું નામ" : "Full name as on bill"}
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                  />
                </Field>

                <div className="book-grid">
                  <Field id="contactNo" label={isGu ? "સંપર્ક નંબર" : "Contact No."} required error={errors.contactNo}>
                    <Input
                      id="contactNo"
                      large
                      invalid={Boolean(errors.contactNo)}
                      aria-describedby={errors.contactNo ? "contactNo-error" : undefined}
                      inputMode="numeric"
                      placeholder={isGu ? "10-અંકનો મોબાઈલ નંબર" : "10-digit mobile"}
                      value={form.contactNo}
                      onChange={(e) => set("contactNo", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                  </Field>
                  <Field id="email" label={isGu ? "ગ્રાહકનું ઈમેલ આઈડી" : "Customer Email ID"} error={errors.email}>
                    <Input
                      id="email"
                      type="email"
                      large
                      invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Field>
                  <Field id="pincode" label={isGu ? "પિનકોડ" : "Pincode"} required error={errors.pincode}>
                    <Input
                      id="pincode"
                      large
                      invalid={Boolean(errors.pincode)}
                      aria-describedby={errors.pincode ? "pincode-error" : undefined}
                      inputMode="numeric"
                      placeholder={isGu ? "6-અંકનો પિનકોડ" : "6-digit pincode"}
                      value={form.pincode}
                      onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </Field>
                  <Field id="city" label={isGu ? "શહેર" : "City"} required error={errors.city}>
                    <Input
                      id="city"
                      large
                      invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? "city-error" : undefined}
                      placeholder={isGu ? "ઉદા. અમદાવાદ" : "e.g. Ahmedabad"}
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="book-grid">
                  <Field id="discom" label={isGu ? "DISCOM (વીજ વિતરણ કંપની)" : "DISCOM"} required error={errors.discom}>
                    <Select
                      id="discom"
                      large
                      invalid={Boolean(errors.discom)}
                      aria-describedby={errors.discom ? "discom-error" : undefined}
                      value={form.discom}
                      onChange={(e) => set("discom", e.target.value)}
                    >
                      <option value="">{isGu ? "DISCOM પસંદ કરો" : "Select DISCOM"}</option>
                      {DISCOMS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {isGu ? o.gu : o.en}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field id="projectType" label={isGu ? "પ્રોજેક્ટનો પ્રકાર" : "Type of Project"} required error={errors.projectType}>
                    <Select
                      id="projectType"
                      large
                      invalid={Boolean(errors.projectType)}
                      aria-describedby={errors.projectType ? "projectType-error" : undefined}
                      value={form.projectType}
                      onChange={(e) => set("projectType", e.target.value)}
                    >
                      <option value="">{isGu ? "પ્રકાર પસંદ કરો" : "Select type"}</option>
                      {PROJECT_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {isGu ? o.gu : o.en}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field id="loanRequirement" label={isGu ? "લોનની જરૂરિયાત" : "Loan Requirement"} error={errors.loanRequirement}>
                  <Select
                    id="loanRequirement"
                    large
                    invalid={Boolean(errors.loanRequirement)}
                    aria-describedby={errors.loanRequirement ? "loanRequirement-error" : undefined}
                    value={form.loanRequirement}
                    onChange={(e) => set("loanRequirement", e.target.value)}
                  >
                    <option value="">{isGu ? "પસંદ કરો" : "Select"}</option>
                    {LOAN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {isGu ? o.gu : o.en}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* ══ SECTION 2: Documents ══ */}
              <div className="card book-card">
                <div className="book-card-head">
                  <div className="eyebrow">{isGu ? "વિભાગ 02" : "Section 02"}</div>
                  <h2 className="t-display-6">{isGu ? "દસ્તાવેજો અપલોડ કરો" : "Documents Upload"}</h2>
                  <p className="muted">
                    {isGu
                      ? `દરેક દસ્તાવેજના સ્પષ્ટ ફોટા અથવા સ્કેન કરેલી નકલો અપલોડ કરો. પ્રતિ ફાઇલ મહત્તમ ${MAX_MB} MB.`
                      : `Upload clear photos or scans of each document. Maximum ${MAX_MB} MB per file.`}
                  </p>
                </div>

                <div className="book-grid">
                  {upload("lightBill", pdfHint)}
                  {upload("passport", photoHint)}
                  {upload("aadharFront", photoHint)}
                  {upload("aadharBack", photoHint)}
                  {upload("panCard", photoHint)}
                  {upload("cheque", pdfHint)}
                </div>

                <hr className="book-rule" />

                <Field
                  id="nameSame"
                  label={
                    isGu
                      ? "શું કેન્સલ કરેલા ચેક/પાસબુકમાં અને વીજળીના બિલમાં તમારું નામ સમાન છે?"
                      : "Is your name in Cancelled Cheque/Passbook and Electricity Bill the same?"
                  }
                  error={errors.nameSame}
                >
                  <Select
                    id="nameSame"
                    large
                    invalid={Boolean(errors.nameSame)}
                    aria-describedby={errors.nameSame ? "nameSame-error" : undefined}
                    value={form.nameSame}
                    onChange={(e) => set("nameSame", e.target.value)}
                  >
                    <option value="">{isGu ? "પસંદ કરો" : "Select"}</option>
                    {YES_NO.map((o) => (
                      <option key={o.value} value={o.value}>
                        {isGu ? o.gu : o.en}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* ══ SECTION 3: Site Details ══ */}
              <div className="card book-card">
                <div className="book-card-head">
                  <div className="eyebrow">{isGu ? "વિભાગ 03" : "Section 03"}</div>
                  <h2 className="t-display-6">{isGu ? "સાઇટ અને છતની વિગતો" : "Site & Roof Details"}</h2>
                  <p className="muted">
                    {isGu
                      ? "એન્જિનિયરિંગ સમીક્ષા માટે છત પર પડતા પડછાયાના માપ અને સાઇટના ફોટા પ્રદાન કરો."
                      : "Provide roof shadow dimensions and site photos for engineering review."}
                  </p>
                </div>

                <div className="book-grid">
                  <Field
                    id="shadowLength"
                    label={isGu ? "(લંબાઈ) પડછાયા મુક્ત વિસ્તાર (મીટરમાં)" : "(लम्बाई) Shadow Free Area (in mtr.)"}
                    error={errors.shadowLength}
                  >
                    <Input
                      id="shadowLength"
                      large
                      invalid={Boolean(errors.shadowLength)}
                      aria-describedby={errors.shadowLength ? "shadowLength-error" : undefined}
                      inputMode="decimal"
                      placeholder={isGu ? "મીટરમાં લંબાઈ" : "Length in metres"}
                      value={form.shadowLength}
                      onChange={(e) => set("shadowLength", e.target.value)}
                    />
                  </Field>
                  <Field
                    id="shadowWidth"
                    label={isGu ? "(પહોળાઈ) પડછાયા મુક્ત વિસ્તાર (મીટરમાં)" : "(चौड़ाई) Shadow Free Area (in mtr.)"}
                    error={errors.shadowWidth}
                  >
                    <Input
                      id="shadowWidth"
                      large
                      invalid={Boolean(errors.shadowWidth)}
                      aria-describedby={errors.shadowWidth ? "shadowWidth-error" : undefined}
                      inputMode="decimal"
                      placeholder={isGu ? "મીટરમાં પહોળાઈ" : "Width in metres"}
                      value={form.shadowWidth}
                      onChange={(e) => set("shadowWidth", e.target.value)}
                    />
                  </Field>
                </div>

                <hr className="book-rule" />
                <h3 className="book-sub">{isGu ? "સાઇટના ફોટા" : "Site Photos"}</h3>

                <div className="book-grid">
                  {upload("housePhoto", photoHint)}
                  {upload("geoTagged", photoHint)}
                  {upload("site1", videoHint)}
                  {upload("site2", videoHint)}
                </div>

                <hr className="book-rule" />

                <Field id="remarks" label={isGu ? "વિગતવાર નોંધ" : "Detailed Remarks"} error={errors.remarks}>
                  <TextArea
                    id="remarks"
                    rows={4}
                    invalid={Boolean(errors.remarks)}
                    aria-describedby={errors.remarks ? "remarks-error" : undefined}
                    placeholder={
                      isGu
                        ? "આ ઓર્ડર વિશે અન્ય કોઈ વધારાની વિગતો જે ઉપર આવરી લેવામાં આવી નથી..."
                        : "Any additional details about this order not captured above…"
                    }
                    value={form.remarks}
                    onChange={(e) => set("remarks", e.target.value)}
                  />
                </Field>
              </div>

              {submitError && (
                <Alert meaning="negative" role="alert">
                  {submitError.kind === "rate"
                    ? isGu
                      ? "અત્યારે ઘણી બધી વિનંતીઓ આવી છે. કૃપા કરીને થોડી મિનિટો પછી ફરી પ્રયાસ કરો અથવા "
                      : "Too many requests right now. Please try again in a few minutes or call "
                    : isGu
                      ? "અમે તમારી વિનંતી સબમિટ કરી શક્યા નથી. કૃપા કરીને "
                      : "We could not submit your request. Please call "}
                  <a href={site.phoneHref}>8003080020</a>
                  {isGu ? " પર કૉલ કરો." : "."}
                  {submitError.detail ? ` ${submitError.detail}` : ""}
                </Alert>
              )}

              {/* ── Submit Row ── */}
              <div className="book-actions">
                <Button variant="outline" size="lg" href="/">
                  <ArrowLeft className="ico" aria-hidden="true" />
                  {isGu ? "રદ કરો અને હોમ પેજ પર પાછા જાઓ" : "Cancel & return home"}
                </Button>
                <Button variant="primary" size="lg" type="submit" loading={submitting}>
                  {submitting
                    ? uploadProgress
                      ? isGu
                        ? `દસ્તાવેજો અપલોડ થઈ રહ્યા છે (${uploadProgress.total} માંથી ${uploadProgress.current})`
                        : `Uploading documents (${uploadProgress.current} of ${uploadProgress.total})`
                      : isGu
                        ? "ઓર્ડર સબમિટ થઈ રહ્યો છે…"
                        : "Submitting Order…"
                    : isGu
                      ? "ઓર્ડર સબમિટ કરો"
                      : "Submit Order"}
                </Button>
              </div>

              {/* Left empty by people. Bots that fill it are answered without sending anything. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
              />
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
