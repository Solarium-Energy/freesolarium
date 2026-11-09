"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../lib/language";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";

/* ─── helpers ─── */
const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function FileUpload({
  id,
  label,
  hint,
  accept = "image/*,application/pdf",
  required = false,
  value,
  onChange,
  isGu = false,
}: {
  id: string;
  label: string;
  hint?: string;
  accept?: string;
  required?: boolean;
  value: File | null;
  onChange: (f: File | null) => void;
  isGu?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-orange">*</span>}
        {hint && <span className="ml-1.5 font-normal text-slate-400">{hint}</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-dashed px-4 py-3 transition-colors ${
          value
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-200 bg-white hover:border-orange hover:bg-orange-soft/50"
        }`}
      >
        <Paperclip className={`h-4 w-4 shrink-0 ${value ? "text-emerald-500" : "text-slate-400"}`} />
        <span className="flex-1 truncate text-[12.5px]">
          {value ? (
            <span className="font-medium text-emerald-700">{value.name}</span>
          ) : (
            <span className="text-slate-400">
              {isGu ? "અપલોડ કરવા માટે ક્લિક કરો" : "Click to upload"}
            </span>
          )}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ""; }}
            className="rounded-full p-0.5 text-slate-400 hover:text-red-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > MAX_BYTES) {
            alert(
              isGu
                ? `ફાઇલ ${MAX_MB} MB કરતા ઓછી હોવી જોઈએ.`
                : `File must be under ${MAX_MB} MB.`
            );
            return;
          }
          onChange(f);
        }}
      />
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-orange">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-orange focus:ring-2 focus:ring-orange/20";

const selectCls =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-[13px] font-medium text-slate-800 outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20";

function Select({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectCls}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

const DISCOMS = [
  { value: "UGVCL", en: "UGVCL", gu: "UGVCL" },
  { value: "MGVCL", en: "MGVCL", gu: "MGVCL" },
  { value: "DGVCL", en: "DGVCL", gu: "DGVCL" },
  { value: "PGVCL", en: "PGVCL", gu: "PGVCL" },
  { value: "TORRENT", en: "TORRENT", gu: "TORRENT" },
  { value: "Other", en: "Other", gu: "અન્ય (Other)" },
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

export default function BookPage() {
  const { isGu } = useLanguage();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [files, setFiles] = useState<FileState>(EMPTY_FILES);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.set(k, v));
      Object.entries(files).forEach(([k, v]) => { if (v) body.set(k, v); });
      await fetch("/api/order", { method: "POST", body });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert(
        isGu
          ? "સબમિશન નિષ્ફળ ગયું. કૃપા કરીને ફરી પ્રયાસ કરો અથવા અમને WhatsApp કરો."
          : "Submission failed. Please try again or WhatsApp us."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ── SUCCESS STATE ── */
  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
        <Header />
        <main className="flex flex-1 items-center justify-center px-5 py-28 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-[0_24px_80px_-16px_rgba(3,73,130,0.14)]">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </span>
            <h1 className="mt-5 text-[22px] font-bold tracking-tight text-[#034982]">
              {isGu ? "ઓર્ડર સબમિટ થઈ ગયો!" : "Order Submitted!"}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">
              {isGu ? (
                <>
                  આભાર, <strong className="text-slate-700">{form.customerName || "ગ્રાહક"}</strong>. અમારી ટીમ તમારી વિગતોની સમીક્ષા કરશે અને 24 કામકાજના કલાકોમાં તમારો સંપર્ક કરશે.
                </>
              ) : (
                <>
                  Thank you, <strong className="text-slate-700">{form.customerName || "customer"}</strong>. Our team will review your details and reach out within 24 working hours.
                </>
              )}
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-[#034982] px-6 text-[13px] font-bold text-white transition hover:bg-[#022b4e]"
            >
              <ArrowLeft className="h-4 w-4" />
              {isGu ? "મુખ્ય પૃષ્ઠ પર પાછા જાઓ" : "Back to home"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <Header />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 sm:px-5 sm:pt-28">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#034982] transition hover:text-[#022b4e]"
          >
            <ArrowLeft className="h-4 w-4" />
            {isGu ? "મુખ્ય પૃષ્ઠ પર પાછા જાઓ" : "Back to home"}
          </Link>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
              {isGu ? "સોલેરિયમ (Solarium)" : "Solarium"}
            </span>
            <p className="text-[13px] font-bold text-[#034982]">
              {isGu ? "ઓર્ડર ફોર્મ" : "Order Form"}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-4 shadow-[0_4px_32px_-8px_rgba(3,73,130,0.10)] sm:p-9">

          {/* ══ SECTION 1: Partner & Customer Details ══ */}
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                {isGu ? "વિભાગ 01" : "Section 01"}
              </span>
              <h2 className="mt-1 text-[20px] font-bold text-[#034982]">
                {isGu ? "પાર્ટનર અને ગ્રાહકની વિગતો" : "Partner & Customer Details"}
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-500">
                {isGu
                  ? "તમારા વીજળીના બિલમાં દર્શાવ્યા મુજબ ગ્રાહકની માહિતી દાખલ કરો."
                  : "Enter customer information as shown on your electricity bill."}
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="referralPartner"
                  label={isGu ? "રેફરલ પાર્ટનરનું નામ" : "Referral Partner Name"}
                >
                  <input
                    id="referralPartner"
                    className={inputCls}
                    placeholder={isGu ? "પાર્ટનરનું નામ" : "Partner name"}
                    value={form.referralPartner}
                    onChange={(e) => set("referralPartner", e.target.value)}
                  />
                </Field>
                <Field
                  id="referralNo"
                  label={isGu ? "રેફરલ નંબર" : "Referral No."}
                >
                  <input
                    id="referralNo"
                    className={inputCls}
                    placeholder={isGu ? "ઉદા. SOL-REF-001" : "e.g. SOL-REF-001"}
                    value={form.referralNo}
                    onChange={(e) => set("referralNo", e.target.value)}
                  />
                </Field>
              </div>

              <div className="h-px bg-slate-100" />

              <Field
                id="customerName"
                label={
                  isGu
                    ? "ગ્રાહકનું નામ (વીજળીના બિલ મુજબ)"
                    : "Name of Customer (As per Electricity Bill)"
                }
                required
                error={errors.customerName}
              >
                <input
                  id="customerName"
                  className={inputCls}
                  placeholder={isGu ? "બિલમાં દર્શાવ્યા મુજબનું પૂરું નામ" : "Full name as on bill"}
                  value={form.customerName}
                  onChange={(e) => set("customerName", e.target.value)}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="contactNo"
                  label={isGu ? "સંપર્ક નંબર" : "Contact No."}
                  required
                  error={errors.contactNo}
                >
                  <input
                    id="contactNo"
                    className={inputCls}
                    inputMode="numeric"
                    placeholder={isGu ? "10-અંકનો મોબાઈલ નંબર" : "10-digit mobile"}
                    value={form.contactNo}
                    onChange={(e) =>
                      set("contactNo", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                  />
                </Field>
                <Field
                  id="email"
                  label={isGu ? "ગ્રાહકનું ઈમેલ આઈડી" : "Customer Email ID"}
                >
                  <input
                    id="email"
                    type="email"
                    className={inputCls}
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
                <Field
                  id="pincode"
                  label={isGu ? "પિનકોડ" : "Pincode"}
                  required
                  error={errors.pincode}
                >
                  <input
                    id="pincode"
                    className={inputCls}
                    inputMode="numeric"
                    placeholder={isGu ? "6-અંકનો પિનકોડ" : "6-digit pincode"}
                    value={form.pincode}
                    onChange={(e) =>
                      set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                </Field>
                <Field
                  id="city"
                  label={isGu ? "શહેર" : "City"}
                  required
                  error={errors.city}
                >
                  <input
                    id="city"
                    className={inputCls}
                    placeholder={isGu ? "ઉદા. અમદાવાદ" : "e.g. Ahmedabad"}
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="discom"
                  label={isGu ? "DISCOM (વીજ વિતરણ કંપની)" : "DISCOM"}
                  required
                  error={errors.discom}
                >
                  <Select
                    id="discom"
                    options={DISCOMS.map((o) => ({
                      value: o.value,
                      label: isGu ? o.gu : o.en,
                    }))}
                    value={form.discom}
                    onChange={(v) => set("discom", v)}
                    placeholder={isGu ? "DISCOM પસંદ કરો" : "Select DISCOM"}
                  />
                </Field>
                <Field
                  id="projectType"
                  label={isGu ? "પ્રોજેક્ટનો પ્રકાર" : "Type of Project"}
                  required
                  error={errors.projectType}
                >
                  <Select
                    id="projectType"
                    options={PROJECT_TYPES.map((o) => ({
                      value: o.value,
                      label: isGu ? o.gu : o.en,
                    }))}
                    value={form.projectType}
                    onChange={(v) => set("projectType", v)}
                    placeholder={isGu ? "પ્રકાર પસંદ કરો" : "Select type"}
                  />
                </Field>
              </div>

              <Field
                id="loanRequirement"
                label={isGu ? "લોનની જરૂરિયાત" : "Loan Requirement"}
              >
                <Select
                  id="loanRequirement"
                  options={LOAN_OPTIONS.map((o) => ({
                    value: o.value,
                    label: isGu ? o.gu : o.en,
                  }))}
                  value={form.loanRequirement}
                  onChange={(v) => set("loanRequirement", v)}
                  placeholder={isGu ? "પસંદ કરો" : "Select"}
                />
              </Field>
            </div>
          </div>

          {/* ── Separator Line ── */}
          <div className="my-10 h-px w-full bg-slate-200/80" />

          {/* ══ SECTION 2: Documents ══ */}
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                {isGu ? "વિભાગ 02" : "Section 02"}
              </span>
              <h2 className="mt-1 text-[20px] font-bold text-[#034982]">
                {isGu ? "દસ્તાવેજો અપલોડ કરો" : "Documents Upload"}
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-500">
                {isGu
                  ? `દરેક દસ્તાવેજના સ્પષ્ટ ફોટા અથવા સ્કેન કરેલી નકલો અપલોડ કરો. પ્રતિ ફાઇલ મહત્તમ ${MAX_MB} MB.`
                  : `Upload clear photos or scans of each document. Maximum ${MAX_MB} MB per file.`}
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FileUpload
                  id="lightBill"
                  label={isGu ? "વીજળીનું બિલ (નવીનતમ)" : "Light Bill (Latest)"}
                  hint={isGu ? "JPG, PNG અથવા PDF" : "JPG, PNG or PDF"}
                  accept="image/*,application/pdf"
                  value={files.lightBill}
                  onChange={(f) => setFile("lightBill", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="passport"
                  label={isGu ? "પાસપોર્ટ સાઈઝનો ફોટો" : "Passport Size Photograph"}
                  hint={isGu ? "JPG અથવા PNG" : "JPG or PNG"}
                  accept="image/*"
                  value={files.passport}
                  onChange={(f) => setFile("passport", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="aadharFront"
                  label={isGu ? "આધાર કાર્ડનો આગળનો ભાગ" : "Aadhaar Card Front"}
                  hint={isGu ? "JPG અથવા PNG" : "JPG or PNG"}
                  accept="image/*"
                  value={files.aadharFront}
                  onChange={(f) => setFile("aadharFront", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="aadharBack"
                  label={isGu ? "આધાર કાર્ડનો પાછળનો ભાગ" : "Aadhaar Card Back"}
                  hint={isGu ? "JPG અથવા PNG" : "JPG or PNG"}
                  accept="image/*"
                  value={files.aadharBack}
                  onChange={(f) => setFile("aadharBack", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="panCard"
                  label={isGu ? "PAN કાર્ડ" : "PAN Card"}
                  hint={isGu ? "JPG અથવા PNG" : "JPG or PNG"}
                  accept="image/*"
                  value={files.panCard}
                  onChange={(f) => setFile("panCard", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="cheque"
                  label={isGu ? "કેન્સલ કરેલો ચેક / પાસબુક" : "Cancelled Cheque / Passbook"}
                  hint={isGu ? "JPG, PNG અથવા PDF" : "JPG, PNG or PDF"}
                  accept="image/*,application/pdf"
                  value={files.cheque}
                  onChange={(f) => setFile("cheque", f)}
                  isGu={isGu}
                />
              </div>

              <div className="h-px bg-slate-100" />

              <Field
                id="nameSame"
                label={
                  isGu
                    ? "શું કેન્સલ કરેલા ચેક/પાસબુકમાં અને વીજળીના બિલમાં તમારું નામ સમાન છે?"
                    : "Is your name in Cancelled Cheque/Passbook and Electricity Bill the same?"
                }
              >
                <Select
                  id="nameSame"
                  options={YES_NO.map((o) => ({
                    value: o.value,
                    label: isGu ? o.gu : o.en,
                  }))}
                  value={form.nameSame}
                  onChange={(v) => set("nameSame", v)}
                  placeholder={isGu ? "પસંદ કરો" : "Select"}
                />
              </Field>
            </div>
          </div>

          {/* ── Separator Line ── */}
          <div className="my-10 h-px w-full bg-slate-200/80" />

          {/* ══ SECTION 3: Site Details ══ */}
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                {isGu ? "વિભાગ 03" : "Section 03"}
              </span>
              <h2 className="mt-1 text-[20px] font-bold text-[#034982]">
                {isGu ? "સાઇટ અને છતની વિગતો" : "Site & Roof Details"}
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-500">
                {isGu
                  ? "એન્જિનિયરિંગ સમીક્ષા માટે છત પર પડતા પડછાયાના માપ અને સાઇટના ફોટા પ્રદાન કરો."
                  : "Provide roof shadow dimensions and site photos for engineering review."}
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="shadowLength"
                  label={
                    isGu
                      ? "(લંબાઈ) પડછાયા મુક્ત વિસ્તાર (મીટરમાં)"
                      : "(लम्बाई) Shadow Free Area (in mtr.)"
                  }
                >
                  <input
                    id="shadowLength"
                    className={inputCls}
                    inputMode="decimal"
                    placeholder={isGu ? "મીટરમાં લંબાઈ" : "Length in metres"}
                    value={form.shadowLength}
                    onChange={(e) => set("shadowLength", e.target.value)}
                  />
                </Field>
                <Field
                  id="shadowWidth"
                  label={
                    isGu
                      ? "(પહોળાઈ) પડછાયા મુક્ત વિસ્તાર (મીટરમાં)"
                      : "(चौड़ाई) Shadow Free Area (in mtr.)"
                  }
                >
                  <input
                    id="shadowWidth"
                    className={inputCls}
                    inputMode="decimal"
                    placeholder={isGu ? "મીટરમાં પહોળાઈ" : "Width in metres"}
                    value={form.shadowWidth}
                    onChange={(e) => set("shadowWidth", e.target.value)}
                  />
                </Field>
              </div>

              <div className="h-px bg-slate-100" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {isGu ? "સાઇટના ફોટા" : "Site Photos"}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <FileUpload
                  id="housePhoto"
                  label={
                    isGu
                      ? "ઘરનો ફોટો (બધા માળ દેખાય તે રીતે)"
                      : "House Photo (all floors visible)"
                  }
                  hint={isGu ? "JPG અથવા PNG" : "JPG or PNG"}
                  accept="image/*"
                  value={files.housePhoto}
                  onChange={(f) => setFile("housePhoto", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="geoTagged"
                  label={
                    isGu
                      ? "જીઓ-ટેગ કરેલો ફોટો (સોલર માટેનું સ્થાન)"
                      : "Geo Tagged Photo (Solar Location)"
                  }
                  hint={isGu ? "JPG અથવા PNG" : "JPG or PNG"}
                  accept="image/*"
                  value={files.geoTagged}
                  onChange={(f) => setFile("geoTagged", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="site1"
                  label={isGu ? "સાઇટના ફોટા અને વીડિયો 1" : "Site Photos & Videos 1"}
                  hint={isGu ? "JPG, PNG અથવા MP4" : "JPG, PNG or MP4"}
                  accept="image/*,video/*"
                  value={files.site1}
                  onChange={(f) => setFile("site1", f)}
                  isGu={isGu}
                />
                <FileUpload
                  id="site2"
                  label={isGu ? "સાઇટના ફોટા અને વીડિયો 2" : "Site Photos & Videos 2"}
                  hint={isGu ? "JPG, PNG અથવા MP4" : "JPG, PNG or MP4"}
                  accept="image/*,video/*"
                  value={files.site2}
                  onChange={(f) => setFile("site2", f)}
                  isGu={isGu}
                />
              </div>

              <div className="h-px bg-slate-100" />

              <Field
                id="remarks"
                label={isGu ? "વિગતવાર નોંધ" : "Detailed Remarks"}
              >
                <textarea
                  id="remarks"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[13px] font-medium text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-orange focus:ring-2 focus:ring-orange/20"
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
          </div>

          {/* ── Separator Line ── */}
          <div className="my-10 h-px w-full bg-slate-200/80" />

          {/* ── Submit Row ── */}
          <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <Link
              href="/"
              className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {isGu ? "રદ કરો અને હોમ પેજ પર પાછા જાઓ" : "Cancel & return home"}
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-orange px-8 text-[14px] font-extrabold text-white shadow-[0_8px_24px_-8px_rgba(223,122,28,0.55)] transition hover:bg-[#cc6d14] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isGu ? "ઓર્ડર સબમિટ થઈ રહ્યો છે…" : "Submitting Order…"}
                </>
              ) : isGu ? (
                "ઓર્ડર સબમિટ કરો"
              ) : (
                "Submit Order"
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
