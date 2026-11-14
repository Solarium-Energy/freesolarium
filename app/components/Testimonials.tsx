"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, MoveHorizontal, Star } from "lucide-react";
import { CUSTOMER_SAVINGS, TESTIMONIALS } from "../lib/content";
import { useLanguage } from "../lib/language";
import Reveal from "./Reveal";

/* Google 'G' official 4-color icon */
function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

export default function Testimonials() {
  const { isGu } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync scroll position with active dot index on mobile swipe
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;
      const cardWidth = el.offsetWidth * 0.85;
      const index = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(index, 0), TESTIMONIALS.length - 1));
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToIndex(idx: number) {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.children;
    if (cards[idx]) {
      (cards[idx] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveIndex(idx);
    }
  }

  function handlePrev() {
    scrollToIndex(Math.max(activeIndex - 1, 0));
  }

  function handleNext() {
    scrollToIndex(Math.min(activeIndex + 1, TESTIMONIALS.length - 1));
  }

  return (
    <section id="testimonials" className="relative overflow-hidden bg-[#edf3f9]/60 py-16 sm:py-20 lg:py-24">
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Reveal direction="up" delay={0}>
            <p className="section-label flex items-center justify-center gap-2 text-orange">
              <span className="h-px w-6 bg-orange/60" aria-hidden="true" />
              {isGu ? "ગ્રાહકોના અનુભવો" : "Customer stories"}
              <span className="h-px w-6 bg-orange/60" aria-hidden="true" />
            </p>
          </Reveal>

          <Reveal direction="up" delay={50}>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-3.5 py-1 text-navy shadow-xs">
              <GoogleIcon className="h-4 w-4" />
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-[12px] font-bold text-navy">{CUSTOMER_SAVINGS.googleRating}</span>
              <span className="text-[11px] font-medium text-slate-500">
                · {CUSTOMER_SAVINGS.googleReviewCount} {isGu ? "ગૂગલ રિવ્યૂ" : "Google Reviews"}
              </span>
            </div>
          </Reveal>

          <Reveal direction="up" delay={90}>
            <h2 className="mt-3.5 section-heading text-navy">
              {isGu ? "વાસ્તવિક ગ્રાહકો. વાસ્તવિક બચત." : "Real Homeowners. Real Savings."}
            </h2>
          </Reveal>

          <Reveal direction="up" delay={140}>
            <p className="mt-3.5 section-body max-w-[580px] text-body">
              {isGu
                ? "જે ઘરમાલિકોએ સબસિડી, નેટ મીટરિંગ અને ઇન્સ્ટોલેશન માટે સોલેરિયમ પર વિશ્વાસ મૂક્યો છે તેમના સીધા અભિપ્રાય વાંચો."
                : "Hear directly from homeowners who trusted Solarium to handle their subsidies, net metering, and installation."}
            </p>
          </Reveal>

          {/* Mobile swipe indicator */}
          <div className="mt-4 flex items-center justify-center md:hidden">
            <div className="flex items-center gap-1.5 rounded-full border border-navy/15 bg-paper-deep px-3 py-1 text-[11px] font-semibold text-navy shadow-xs">
              <MoveHorizontal className="h-3.5 w-3.5 animate-pulse text-orange" />
              <span>{isGu ? "રિવ્યૂ વાંચવા સ્વાઇપ કરો" : "Swipe to explore reviews"}</span>
            </div>
          </div>
        </div>

        {/* ── 3 Horizontal Testimonial Cards on Desktop, Swipe Carousel on Mobile ── */}
        <div className="mt-8 sm:mt-12">
          {/* Scrollable Container (Swipe on mobile, 3-column horizontal grid on desktop) */}
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex h-auto w-[calc(100vw-2.5rem)] max-w-[360px] shrink-0 snap-center flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-navy/20 md:w-auto md:max-w-none md:shrink"
              >
                <div>
                  {/* Reviewer Profile Header (Google Maps style) */}
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={testimonial.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3"
                    >
                      <div
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: testimonial.avatarColor }}
                      >
                        {testimonial.initials}
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs">
                          <GoogleIcon className="h-2.5 w-2.5" />
                        </span>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-[13.5px] font-bold text-navy group-hover:text-orange transition-colors">
                          {isGu ? testimonial.guName : testimonial.name}
                          <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">
                          {isGu ? testimonial.guMeta : testimonial.meta}
                        </p>
                      </div>
                    </a>

                    <GoogleIcon className="h-4 w-4 shrink-0 opacity-90" />
                  </div>

                  {/* Rating stars + timeAgo */}
                  <div className="mt-3.5 flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {isGu ? testimonial.guTimeAgo : testimonial.timeAgo}
                    </span>
                  </div>

                  {/* Clean Quote */}
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
                    &ldquo;{isGu ? testimonial.guQuote : testimonial.quote}&rdquo;
                  </p>
                </div>

                {/* System Tag + Google Link */}
                <div className="mt-5 border-t border-slate-100 pt-3.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-navy/80">
                      {isGu ? testimonial.guSystem : testimonial.system}
                    </span>
                    <a
                      href={testimonial.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-orange hover:text-navy transition-colors"
                    >
                      {isGu ? "ગૂગલ પર જુઓ" : "View on Google"}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Swipe Controls & Pagination Dots */}
          <div className="mt-4 flex items-center justify-between px-2 md:hidden">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous testimonial"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-navy shadow-xs disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 transition-all duration-200 rounded-full ${
                    activeIndex === i
                      ? "w-6 bg-orange"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === TESTIMONIALS.length - 1}
              aria-label="Next testimonial"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-navy shadow-xs disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
