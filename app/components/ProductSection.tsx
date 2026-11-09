"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { INCLUDED } from "../lib/content";
import { useLanguage } from "../lib/language";
import Reveal from "./Reveal";

const N = INCLUDED.length; // 10

export default function ProductSection() {
  const { isGu } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setScrollProgress(progress);
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);

    const cardApproxW = el.clientWidth < 640 ? 315 : 350;
    const idx = Math.min(Math.round(el.scrollLeft / cardApproxW), N - 1);
    setActiveIndex(Math.max(0, idx));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.clientWidth < 640 ? 315 : 355;
    el.scrollBy({
      left: direction === "left" ? -cardW : cardW,
      behavior: "smooth",
    });
  };

  const scrollToCard = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    if (index === 0) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const cardW = el.clientWidth < 640 ? 315 : 355;
    el.scrollTo({
      left: index * cardW,
      behavior: "smooth",
    });
  };

  /* ── Card Component ── */
  function Card({
    item,
    index,
  }: {
    item: (typeof INCLUDED)[number];
    index: number;
  }) {
    const itemAny = item as (typeof INCLUDED)[number] & {
      guTitle?: string;
      guSubtitle?: string;
      guTag?: string;
      guBody?: string;
      guSpecs?: readonly string[];
      guImageAlt?: string;
    };
    const displayTitle = isGu && itemAny.guTitle ? itemAny.guTitle : item.title;
    const displaySubtitle = isGu && itemAny.guSubtitle ? itemAny.guSubtitle : item.subtitle;
    const displayTag = isGu && itemAny.guTag ? itemAny.guTag : item.tag;
    const displayBody = isGu && itemAny.guBody ? itemAny.guBody : item.body;
    const displaySpecs = isGu && itemAny.guSpecs ? itemAny.guSpecs : item.specs;
    const displayAlt = isGu && itemAny.guImageAlt ? itemAny.guImageAlt : item.imageAlt;

    return (
      <div
        className="group relative flex h-full w-[82vw] max-w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl transition-all duration-300 sm:w-[325px] sm:max-w-none lg:w-[335px]"
        style={{
          background: "linear-gradient(160deg, #0c2d4a 0%, #051d33 100%)",
          boxShadow: "0 18px 45px -15px rgba(2,27,51,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* ── Image ── */}
        <div className="relative h-[185px] w-full overflow-hidden bg-[#031525] sm:h-[205px]">
          <Image
            src={item.image}
            alt={displayAlt}
            fill
            draggable={false}
            sizes="(max-width: 640px) 295px, 335px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
          {/* Subtle gradient overlay at base */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#051d33] via-transparent to-black/15" />

          {/* Number badge — top-left */}
          <span
            className="absolute left-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full text-[10.5px] font-extrabold text-white"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Category Tag badge — top-right */}
          <span
            className="absolute right-3.5 top-3.5 rounded-full px-2.5 py-1 text-[9.5px] font-semibold text-white/90"
            style={{
              background: "rgba(5,29,51,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {displayTag}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {/* Orange accent line */}
          <div className="mb-2.5 h-[2px] w-8 rounded-full bg-orange opacity-85 transition-all duration-500 group-hover:w-14 group-hover:opacity-100" />

          <h3 className="font-display text-[15.5px] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[16.5px]">
            {displayTitle}
          </h3>

          <p className="mt-1 text-[11px] font-semibold leading-snug text-orange">
            {displaySubtitle}
          </p>

          <p className="mt-2 text-[11.5px] leading-relaxed text-white/65 sm:text-[12px]">
            {displayBody}
          </p>

          {/* Divider */}
          <div className="my-3 h-px w-full bg-white/10" />

          {/* ── Specifications / Highlights ── */}
          <ul className="flex-1 space-y-1.5">
            {(displaySpecs as readonly string[]).map((spec, sIdx) => (
              <li
                key={sIdx}
                className="flex items-start gap-2 text-[11px] leading-snug text-white/80"
              >
                <svg
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Edge highlight on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ border: "1px solid rgba(223,122,28,0.35)" }}
        />
      </div>
    );
  }

  return (
    <section id="product" className="bg-paper" style={{ isolation: "isolate" }}>
      {/* ── Static header + insurance ── */}
      <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-16 lg:px-6 lg:pt-24">
        <Reveal direction="left">
          <div className="max-w-[720px]">
            <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-orange">
              <span className="h-px w-8 bg-orange/50" aria-hidden="true" />
              {isGu ? "તમને શું મળશે" : "What you get"}
            </p>
            <h2 className="mt-4 text-[clamp(1.9rem,4.2vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.035em] text-navy text-balance">
              {isGu
                ? "સંપૂર્ણ સિસ્ટમ. તમારે બહારથી કંઈપણ ખરીદવાની જરૂર નથી."
                : "Complete system. Nothing to source yourself."}
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-body">
              {isGu
                ? "₹0 ખર્ચનો અર્થ એ નથી કે તમને કોઈ અધૂરી કે મર્યાદિત સુવિધાઓવાળી કિટ મળશે. આ એ જ સિસ્ટમ છે જે અમે પેઇડ ઓર્ડર (જેના માટે ચૂકવણી કરવામાં આવી છે) હેઠળ ઇન્સ્ટોલ કરીએ છીએ — જે એક જ કંપની દ્વારા ડિઝાઇન કરવામાં આવી છે, પૂરી પાડવામાં આવી છે અને કાર્યરત (commissioned) કરવામાં આવી છે."
                : "Effective ₹0 does not mean a stripped-down kit. This is the same system we install on paid orders — designed, supplied and commissioned by one company."}
            </p>
          </div>
        </Reveal>

        {/* Insurance banner */}
        <Reveal direction="up" delay={120}>
          <div className="relative mt-10 overflow-hidden rounded-2xl p-6 text-paper sm:p-9">
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero-manufacturing.webp"
                alt={
                  isGu
                    ? "સોલેરિયમ (Solarium) સોલર મેન્યુફેક્ચરિંગ યુનિટ"
                    : "Solarium solar manufacturing facility"
                }
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#022b4e]/90 via-[#034982]/75 to-[#034982]/35" />
            </div>

            <div className="relative z-10 max-w-[560px]">
              <span className="inline-flex rounded-full bg-orange px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                {isGu ? "માત્ર સોલેરિયમ પર જ ઉપલબ્ધ" : "Only at Solarium"}
              </span>
              <h3 className="mt-3 font-display text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight tracking-[-0.03em]">
                {isGu ? "5 વર્ષનો વીમો. બિલકુલ મફત." : "5-year insurance. Free."}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-paper/80">
                {isGu
                  ? "તમારી સિસ્ટમ પાંચ વર્ષ માટે વીમા સુરક્ષા હેઠળ છે, જેના માટે તમારે કોઈ વધારાનો ખર્ચ કરવાનો નથી. વીમા કવર, વીમા કંપની અને ક્લેમ કરવાની પ્રક્રિયા વિશેની વિગતો તમારા ઓર્ડર સાથે આપવામાં આવેલા પોલિસી દસ્તાવેજમાં દર્શાવવામાં આવી છે."
                  : "Your system is insured for five years at no extra cost. Cover, the insurer and the claim process are set out in the policy document shared with your order."}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Components Showcase (Natural Page Flow — No Scroll Lock) ── */}
      <div className="bg-[#051525] py-12 lg:py-16">
        {/* Top title and navigation row */}
        <div className="mx-auto mb-6 flex max-w-[1200px] items-center justify-between px-5 lg:px-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
            {isGu ? "તમામ ૧૦ પ્રમાણિત ઘટકો" : `All ${N} Certified Components`}
          </span>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-white/40 sm:text-[11.5px]">
              <span className="sm:hidden">{isGu ? "સ્વાઇપ કરો →" : "Swipe →"}</span>
              <span className="hidden sm:inline">
                {isGu
                  ? "સ્ક્રોલ કરો અથવા તીર (arrows) નો ઉપયોગ કરો →"
                  : "Scroll or use arrows →"}
              </span>
            </span>

            {/* Desktop Left / Right Controls */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous component"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Next component"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div
          ref={trackRef}
          onScroll={updateScrollState}
          className="hide-scrollbar flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 sm:gap-5"
          style={{
            paddingLeft: "max(1.25rem, calc((100vw - 1200px) / 2 + 1.5rem))",
            paddingRight: "max(1.25rem, calc((100vw - 1200px) / 2 + 1.5rem))",
          }}
          aria-label={`What you get — all ${N} components`}
        >
          {INCLUDED.map((item, i) => (
            <div
              key={item.title}
              className="flex h-auto shrink-0"
            >
              <Card item={item} index={i} />
            </div>
          ))}
        </div>

        {/* Bottom progress bar + clickable dots */}
        <div className="mx-auto mt-6 flex max-w-[1200px] items-center gap-3 px-5 sm:gap-6 lg:px-6">
          {/* Dot indicators */}
          <div className="flex shrink-0 items-center gap-1.5">
            {INCLUDED.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => scrollToCard(i)}
                aria-label={`Go to component ${i + 1}`}
                className="block h-2 rounded-full transition-all duration-300"
                style={{
                  width: activeIndex === i ? "24px" : "7px",
                  background: activeIndex === i ? "var(--color-orange)" : "white",
                  opacity: activeIndex === i ? 1 : 0.35,
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${Math.max(scrollProgress * 100, (1 / N) * 100)}%`,
                background: "linear-gradient(90deg, var(--color-orange), #ffc947)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
