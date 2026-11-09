"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, PhoneCall, RefreshCw, Star } from "lucide-react";
import { useState } from "react";
import { CUSTOMER_SAVINGS, HERO_PRICE, PRICING, inr } from "../lib/content";
import { useLanguage } from "../lib/language";
import Reveal from "./Reveal";
import QuotationSheetModal from "./QuotationSheetModal";

/* ─── Constants ─── */
const HERO_FEATURES = [
  { line1: "5-year", line2: "insurance", guLine1: "5 વર્ષનો", guLine2: "વીમો" },
  { line1: "100% subsidy", line2: "in return", guLine1: "100% સબસિડી", guLine2: "(યોજનાના નિયમો મુજબ)" },
  { line1: "Installed by", line2: "our own team", guLine1: "અમારી પોતાની ટીમ દ્વારા", guLine2: "ઇન્સ્ટોલેશન" },
] as const;

const FLOOR_OPTIONS = [
  { label: "Ground / G+1", guLabel: "ગ્રાઉન્ડ / G+1", sub: "Included", guSub: "સમાવિષ્ટ", extra: 0 },
  { label: "G+2", guLabel: "G+2", sub: "+₹3,600", guSub: "+₹3,600", extra: 3600 },
  { label: "G+3", guLabel: "G+3", sub: "+₹5,600", guSub: "+₹5,600", extra: 5600 },
  { label: "G+4", guLabel: "G+4", sub: "+₹7,500", guSub: "+₹7,500", extra: 7500 },
  { label: "G+5 and above", guLabel: "G+5 અને તેથી વધુ", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

const STRUCTURE_HEIGHT_OPTIONS = [
  { label: "0.5 m", guLabel: "0.5 m", sub: "Included", guSub: "સમાવિષ્ટ", extra: 0 },
  { label: "1.0 m", guLabel: "1.0 m", sub: "+₹2,800", guSub: "+₹2,800", extra: 2800 },
  { label: "1.5 m", guLabel: "1.5 m", sub: "+₹4,200", guSub: "+₹4,200", extra: 4200 },
  { label: "2.0 m", guLabel: "2.0 m", sub: "+₹5,600", guSub: "+₹5,600", extra: 5600 },
  { label: "2.5 m", guLabel: "2.5 m", sub: "+₹7,000", guSub: "+₹7,000", extra: 7000 },
  { label: "3.0 m", guLabel: "3.0 m", sub: "+₹8,400", guSub: "+₹8,400", extra: 8400 },
  { label: "3.0 m and above", guLabel: "3.0 m અને તેથી વધુ", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

const DISCOM_OPTIONS = [
  { label: "UGVCL", guLabel: "UGVCL", sub: "₹0", guSub: "₹0", extra: 0 },
  { label: "Torrent Power", guLabel: "Torrent Power", sub: "+₹5,409", guSub: "+₹5,409", extra: 5409 },
  { label: "Other", guLabel: "અન્ય (Other)", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

type Category        = "general" | "sc-st" | null;
type FloorOption     = (typeof FLOOR_OPTIONS)[number]["label"] | "";
type StructureHeight = (typeof STRUCTURE_HEIGHT_OPTIONS)[number]["label"] | "";
type DiscomOption    = (typeof DISCOM_OPTIONS)[number]["label"] | "";

/* ─── Choice button — light card variant ─── */
function ChoiceBtn({
  label,
  sub,
  active,
  missing,
  onClick,
}: {
  label: string;
  sub?: string;
  active: boolean;
  missing?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-all duration-200 ${
        active
          ? "border-navy bg-navy text-white shadow-[0_6px_16px_-8px_rgba(3,73,130,0.4)]"
          : missing
          ? "border-orange/50 bg-orange/[0.04] text-navy hover:border-navy/30"
          : "border-slate-200 bg-slate-50 text-navy hover:border-navy/30 hover:bg-slate-100"
      }`}
    >
      <span className="text-[11.5px] font-bold leading-snug">{label}</span>
      {sub && (
        <span className={`mt-0.5 text-[9.5px] font-medium ${active ? "text-white/70" : "text-slate-400"}`}>
          {sub}
        </span>
      )}
    </button>
  );
}

/* ─── Quotation card (right panel) — full opaque white ─── */
function QuotationCard() {
  const { isGu } = useLanguage();
  const [category, setCategory]               = useState<Category>(null);
  const [floor, setFloor]                     = useState<FloorOption>("");
  const [structureHeight, setStructureHeight] = useState<StructureHeight>("");
  const [discom, setDiscom]                   = useState<DiscomOption>("");
  const [customerNameBill, setCustomerNameBill] = useState("");
  const [customerNameBank, setCustomerNameBank] = useState("");
  const [address, setAddress]                   = useState("");
  const [mobile, setMobile]                     = useState("");
  const [consumerNo, setConsumerNo]             = useState("");
  const [attempted, setAttempted]             = useState(false);
  const [callbackSent, setCallbackSent]       = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  const validNameBill   = customerNameBill.trim().length > 1;
  const validNameBank   = customerNameBank.trim().length > 1;
  const validAddress    = address.trim().length > 2;
  const validMobile     = /^\d{10}$/.test(mobile);
  const validConsumerNo = consumerNo.trim().length > 1;

  const selectionsComplete = Boolean(category && floor && structureHeight && discom);
  const needsCallback = floor === "G+5 and above" || structureHeight === "3.0 m and above" || discom === "Other";
  const allReady = selectionsComplete && validNameBill && validNameBank && validAddress && validMobile && validConsumerNo;

  function reset() {
    setCategory(null);
    setFloor("");
    setStructureHeight("");
    setDiscom("");
    setCustomerNameBill("");
    setCustomerNameBank("");
    setAddress("");
    setMobile("");
    setConsumerNo("");
    setAttempted(false);
    setCallbackSent(false);
  }

  function handleActionClick() {
    if (!allReady) {
      setAttempted(true);
      return;
    }

    setAttempted(false);

    if (needsCallback) {
      setCallbackSent(true);
      return;
    }

    setShowQuotationModal(true);
  }

  const baseInp = "h-[38px] w-full rounded-xl border bg-white px-2.5 sm:px-3.5 text-[10.5px] sm:text-[11px] font-medium text-navy outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-navy/40 focus:ring-1 focus:ring-navy/10";
  const baseSel = "h-[38px] w-full appearance-none rounded-xl border pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 text-[10.5px] sm:text-[11px] font-semibold text-navy outline-none transition hover:border-navy/30 focus:border-navy/40 focus:bg-white focus:ring-1 focus:ring-navy/10";

  return (
    <div
      id="quotation"
      className="relative overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_-20px_rgba(3,73,130,0.25)]"
      style={{ scrollMarginTop: "80px" }}
    >
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-3.5 sm:px-6">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-orange-deep">
          {isGu ? "તમારો ક્વોટેશન (ભાવપત્રક) મેળવો" : "Get your quotation"}
        </p>
        <p className="mt-0.5 font-display text-[15.5px] font-extrabold leading-tight tracking-[-0.02em] text-navy">
          {isGu ? "કિંમતની વિગતવાર માહિતી ડાઉનલોડ કરો" : "Download detailed pricing"}
        </p>
      </div>

      <div className="space-y-2.5 px-4 py-4 sm:px-6">

        {/* Subsidy breakdown — 3-column */}
        <div className="grid grid-cols-3 divide-x divide-navy/15 overflow-hidden rounded-xl border border-navy/30">
          <div className="bg-slate-50 px-2 py-2 text-center sm:px-3.5">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[8px] sm:tracking-[0.1em]">
              {isGu ? "સિસ્ટમનું મૂલ્ય" : "System value"}
            </p>
            <p className="mt-0.5 text-[10.5px] font-bold text-navy sm:text-[11px]">{inr(PRICING.systemValue)}</p>
          </div>
          <div className="bg-slate-50 px-2 py-2 text-center sm:px-3.5">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[8px] sm:tracking-[0.1em]">
              {isGu ? "કુલ સબસિડી" : "Total subsidy"}
            </p>
            <p className="mt-0.5 text-[10.5px] font-bold text-emerald-600 sm:text-[11px]">−{inr(PRICING.centralSubsidy + PRICING.stateSubsidy)}</p>
          </div>
          <div className="bg-navy px-2 py-2 text-center sm:px-3.5">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-white/60 sm:text-[8px] sm:tracking-[0.1em]">
              {isGu ? "ચોખ્ખું રોકાણ" : "Net investment"}
            </p>
            <p className="mt-0.5 text-[11.5px] font-extrabold tracking-tight text-white sm:text-[12.5px]">{inr(HERO_PRICE)}*</p>
          </div>
        </div>

        <p className="text-center text-[9.5px] font-medium text-orange-deep">
          {isGu
            ? "*રાજ્ય સબસિડી માત્ર પ્રથમ 3 લાખ પરિવારો માટે જ મર્યાદિત છે — તમારો હિસ્સો (allocation) મેળવવા માટે વહેલી તકે અરજી કરો."
            : "*State subsidy is limited to the first 3 lakh households only — act early to secure your allocation."}
        </p>

        {/* Category */}
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {isGu ? "તમારી શ્રેણી" : "Your category"}
          </p>
          <div className="flex gap-2">
            <ChoiceBtn
              label={isGu ? "સામાન્ય (General)" : "General"}
              sub={isGu ? "સામાન્ય સબસિડી" : "Standard subsidy"}
              active={category === "general"}
              missing={attempted && !category}
              onClick={() => setCategory("general")}
            />
            <ChoiceBtn
              label="SC / ST"
              sub={isGu ? "વધારે સબસિડી" : "Enhanced subsidy"}
              active={category === "sc-st"}
              missing={attempted && !category}
              onClick={() => setCategory("sc-st")}
            />
          </div>
        </div>

        {/* 3 Dropdowns: Floor, Structure Height, DISCOM Meter */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div>
            <label htmlFor="quote-floor" className="mb-1 block truncate text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
              {isGu ? "1 · ફ્લોર (કેબલ)" : "1 · Floor (cable)"}
            </label>
            <div className="relative">
              <select
                id="quote-floor"
                value={floor}
                onChange={(e) => {
                  setFloor(e.target.value as FloorOption);
                  setCallbackSent(false);
                }}
                className={`${baseSel} ${
                  attempted && !floor
                    ? "border-orange/50 bg-orange/[0.04]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <option value="" disabled>
                  {isGu ? "ફ્લોર પસંદ કરો" : "Select floor"}
                </option>
                {FLOOR_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {isGu ? opt.guLabel : opt.label} ({isGu ? opt.guSub : opt.sub})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="quote-height" className="mb-1 block truncate text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
              {isGu ? "2 · આગળના પાયાની ઊંચાઈ" : "2 · Front-leg height"}
            </label>
            <div className="relative">
              <select
                id="quote-height"
                value={structureHeight}
                onChange={(e) => {
                  setStructureHeight(e.target.value as StructureHeight);
                  setCallbackSent(false);
                }}
                className={`${baseSel} ${
                  attempted && !structureHeight
                    ? "border-orange/50 bg-orange/[0.04]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <option value="" disabled>
                  {isGu ? "ઊંચાઈ પસંદ કરો" : "Select height"}
                </option>
                {STRUCTURE_HEIGHT_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {isGu ? opt.guLabel : opt.label} ({isGu ? opt.guSub : opt.sub})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="quote-discom" className="mb-1 block truncate text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
              {isGu ? "3 · DISCOM (વીજ કંપની) મીટર" : "3 · DISCOM meter"}
            </label>
            <div className="relative">
              <select
                id="quote-discom"
                value={discom}
                onChange={(e) => {
                  setDiscom(e.target.value as DiscomOption);
                  setCallbackSent(false);
                }}
                className={`${baseSel} ${
                  attempted && !discom
                    ? "border-orange/50 bg-orange/[0.04]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <option value="" disabled>
                  {isGu ? "DISCOM પસંદ કરો" : "Select DISCOM"}
                </option>
                {DISCOM_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {isGu ? opt.guLabel : opt.label} ({isGu ? opt.guSub : opt.sub})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Final price is calculated (finalPrice = STANDARD_PRICE + floorCost + heightCost + meterCost)
            but intentionally not displayed here — placement to be decided. */}

        {/* Customer details */}
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {isGu ? "ગ્રાહકની વિગતો" : "Customer details"}
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                className={`${baseInp} ${attempted && !validNameBill ? "border-orange/50 bg-orange/[0.03]" : "border-slate-200"}`}
                type="text"
                placeholder={isGu ? "નામ (વીજળીના બિલ મુજબ)" : "Name (as per electricity bill)"}
                autoComplete="name"
                value={customerNameBill}
                onChange={(e) => setCustomerNameBill(e.target.value)}
              />
              <input
                className={`${baseInp} ${attempted && !validNameBank ? "border-orange/50 bg-orange/[0.03]" : "border-slate-200"}`}
                type="text"
                placeholder={isGu ? "નામ (બેંક ખાતા મુજબ)" : "Name (as per bank account)"}
                value={customerNameBank}
                onChange={(e) => setCustomerNameBank(e.target.value)}
              />
            </div>
            <input
              className={`${baseInp} ${attempted && !validAddress ? "border-orange/50 bg-orange/[0.03]" : "border-slate-200"}`}
              type="text"
              placeholder={isGu ? "સરનામું" : "Address"}
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={`${baseInp} ${attempted && !validMobile ? "border-orange/50 bg-orange/[0.03]" : "border-slate-200"}`}
                type="tel"
                inputMode="numeric"
                placeholder={isGu ? "મોબાઈલ નંબર (10 અંક)" : "Mobile (10 digits)"}
                autoComplete="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
              <input
                className={`${baseInp} ${attempted && !validConsumerNo ? "border-orange/50 bg-orange/[0.03]" : "border-slate-200"}`}
                type="text"
                placeholder={isGu ? "ગ્રાહક નંબર (Consumer No.)" : "Consumer No."}
                value={consumerNo}
                onChange={(e) => setConsumerNo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Subtle, refined inline hint when fields are incomplete */}
        {attempted && !allReady && (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
            <span>
              {isGu
                ? "આગળ વધવા માટે ઉપરની હાઇલાઇટ કરેલી વિગતો પૂર્ણ કરો"
                : "Complete the highlighted fields above to continue"}
            </span>
          </div>
        )}

        {/* Always-visible Download / Callback CTA */}
        {callbackSent ? (
          <div className="flex items-center justify-between gap-2.5 rounded-xl border border-navy/15 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <p className="text-[10.5px] font-semibold leading-snug text-navy">
                {isGu
                  ? "આભાર! સોલારિયમ ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે."
                  : "Thank you! The Solarium team will reach out to you shortly."}
              </p>
            </div>
            <button type="button" onClick={reset} className="text-slate-400 hover:text-navy">
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleActionClick}
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 text-[11px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(3,73,130,0.45)] transition-all duration-200 hover:bg-navy-deep"
          >
            {needsCallback ? (
              <>
                <PhoneCall className="h-3.5 w-3.5 text-orange" />
                {isGu ? "અમારી ટીમ તમારો સંપર્ક કરશે" : "Our team will contact you"}
              </>
            ) : (
              isGu ? "ક્વોટેશન જુઓ" : "Show Quotation"
            )}
          </button>
        )}
      </div>

      {showQuotationModal && (
        <QuotationSheetModal
          data={{
            category,
            floor,
            structureHeight,
            discom,
            customerNameBill,
            customerNameBank,
            address,
            mobile,
            consumerNo,
            onFloorChange: (val) => setFloor(val as FloorOption),
            onHeightChange: (val) => setStructureHeight(val as StructureHeight),
            onDiscomChange: (val) => setDiscom(val as DiscomOption),
          }}
          onClose={() => setShowQuotationModal(false)}
        />
      )}
    </div>
  );
}

/* ─── Main export ─── */
export default function Hero() {
  const { isGu } = useLanguage();
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden bg-[#022b4e]">
      {/* ── Full-bleed background image (constrained height + right-shifted focal point on mobile so it doesn't over-zoom) ── */}
      <div className="absolute inset-x-0 top-0 z-0 h-[500px] sm:h-[560px] lg:inset-0 lg:h-full">
        <Image
          src="/images/hero-banner.png"
          alt="Solarium rooftop solar system"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[74%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#022b4e]/65 via-[#034982]/45 to-[#034982]/25 lg:from-[#022b4e]/55 lg:via-[#034982]/35 lg:to-[#034982]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#022b4e] via-[#022b4e]/25 to-[#022b4e]/20 lg:from-[#022b4e]/30 lg:via-transparent lg:to-[#022b4e]/15" />
      </div>

      {/* Decorative dots */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="bg-dots absolute inset-0 opacity-[0.06]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy-line/60 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] gap-8 px-4 pb-12 pt-[calc(56px+2rem)] sm:px-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:px-6 lg:pb-16 lg:pt-[calc(56px+2.5rem)]">

        {/* ── Left — Hero copy ── */}
        <div>
          {/* Level 1: System & Scheme (pure text, no pills) */}
          <Reveal direction="left" delay={0}>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-bold uppercase tracking-[0.16em] sm:gap-x-2.5 sm:text-[11.5px] sm:tracking-[0.18em]">
              <span className="text-white/90">2.18 kW</span>
              <span className="text-white/30" aria-hidden="true">·</span>
              <span className="text-orange">
                {isGu
                  ? "PM સૂર્ય ઘર યોજના હેઠળ · ગુજરાતના ઘરો માટે"
                  : "Under PM Surya Ghar · Gujarat homes"}
              </span>
            </p>
          </Reveal>

          {/* Level 2: Dominant headline */}
          <Reveal direction="left" delay={70}>
            <h1 className="mt-3.5 max-w-xl text-[clamp(2.15rem,6vw,4.4rem)] font-extrabold leading-[1.06] tracking-tight text-white sm:mt-4">
              {isGu ? (
                <>
                  તમારા ઘર માટે{" "}
                  <span className="inline-block rounded-xl bg-orange px-3 pb-1 pt-0.5 text-white shadow-sm sm:px-3.5">
                    ₹0*
                  </span>{" "}
                  માં સોલર સિસ્ટમ
                </>
              ) : (
                <>
                  Solar for your home at{" "}
                  <span className="inline-block rounded-xl bg-orange px-3 pb-1 pt-0.5 text-white shadow-sm sm:px-3.5">
                    ₹0*
                  </span>
                </>
              )}
            </h1>
          </Reveal>

          {/* Level 3: Elevated financial value proof card */}
          <Reveal direction="left" delay={130}>
            <div className="mt-4 inline-flex items-center rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 backdrop-blur-sm sm:px-4">
              <p className="text-[13px] font-medium leading-relaxed text-white/70 sm:text-[15.5px]">
                {isGu ? (
                  <>
                    દર મહિને <span className="font-bold text-white">લગભગ ₹2,000 ની બચત</span> કરો. એટલે કે 25 વર્ષમાં કુલ <span className="font-bold text-white">₹6 લાખની બચત</span>.
                  </>
                ) : (
                  <>
                    Save <span className="font-bold text-white">~₹2,000 every month</span>. That&apos;s <span className="font-bold text-white">₹6 Lakhs saved</span> over 25 years.
                  </>
                )}
              </p>
            </div>
          </Reveal>

          {/* Level 4: Action CTAs */}
          <Reveal direction="up" delay={180}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/book"
                className="group inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-orange px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(223,122,28,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#cc6d14] sm:flex-initial sm:px-6 sm:text-[13.5px]"
              >
                {isGu ? "મારી સિસ્ટમ બુક કરો" : "Book my system"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[13px] font-bold text-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 sm:flex-initial sm:px-5"
              >
                {isGu ? "તે કેવી રીતે કામ કરે છે તે જાણો" : "See how it works"}
              </a>
            </div>
          </Reveal>

          {/* Level 5: Social proof & feature reassurance */}
          <Reveal direction="left" delay={240}>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-2.5 pt-1 sm:flex sm:flex-wrap sm:items-center sm:gap-y-2">
              {/* Google Rating (2 lines) */}
              <div className="flex items-center gap-2 sm:border-r sm:border-white/15 sm:pr-3.5 sm:mr-3.5">
                <svg className="h-[17px] w-[17px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-[12.5px] font-bold text-white sm:text-[13px]">{CUSTOMER_SAVINGS.googleRating}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10.5px] font-medium text-white/60 sm:text-[11px]">
                    {isGu ? "ગૂગલ રેટિંગ" : "Google rating"}
                  </span>
                </div>
              </div>

              {/* 3 Features / Ticks (2 lines each) with dividing lines */}
              {HERO_FEATURES.map((item, idx) => (
                <div
                  key={item.line1}
                  className={`flex items-start gap-1.5 ${
                    idx < HERO_FEATURES.length - 1 ? "sm:border-r sm:border-white/15 sm:pr-3.5 sm:mr-3.5" : ""
                  }`}
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" strokeWidth={2.5} />
                  <div className="leading-tight">
                    <span className="block text-[12.5px] font-semibold text-white/95 sm:text-[13px]">
                      {isGu ? item.guLine1 : item.line1}
                    </span>
                    <span
                      className={`block text-[10.5px] sm:text-[11px] ${
                        item.line2 === "insurance" ? "font-semibold text-white/90" : "font-normal text-white/60"
                      }`}
                    >
                      {isGu ? item.guLine2 : item.line2}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal direction="up" delay={300}>
            <p className="mt-6 text-[10.5px] leading-[1.6] text-white/55 sm:mt-10">
              {isGu
                ? `*કેન્દ્ર સરકાર (${inr(PRICING.centralSubsidy)}) અને ગુજરાત રાજ્ય સરકાર (${inr(PRICING.stateSubsidy)}) ની સબસિડી બાદ. પાત્રતા અને યોજનાની શરતો લાગુ.`
                : `*After central (${inr(PRICING.centralSubsidy)}) and Gujarat state (${inr(PRICING.stateSubsidy)}) subsidy. Subject to eligibility and scheme terms.`}
            </p>
          </Reveal>
        </div>

        {/* ── Right — Quotation card ── */}
        <Reveal direction="right" delay={140}>
          <QuotationCard />
        </Reveal>
      </div>
    </section>
  );
}
