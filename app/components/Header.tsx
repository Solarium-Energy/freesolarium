"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { site } from "../lib/content";
import { useLanguage } from "../lib/language";

const NAV = [
  { label: "What you get", guLabel: "તમને શું મળશે", href: "/#product" },
  { label: "How it works", guLabel: "તે કેવી રીતે કામ કરે છે", href: "/#how" },
  { label: "Reviews", guLabel: "ગ્રાહકોના અભિપ્રાય", href: "/#testimonials" },
  { label: "FAQ", guLabel: "વારંવાર પૂછાતા પ્રશ્નો (FAQ)", href: "/#faq" },
];

function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  const isGu = lang === "gu";
  return (
    <div
      role="group"
      aria-label="Language selector"
      className="relative inline-grid grid-cols-2 items-center rounded-full border border-slate-200/90 bg-slate-100/95 p-[3px] text-[11.5px] font-extrabold shadow-inner select-none"
    >
      {/* Smooth gliding pill indicator */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-full shadow-[0_2px_8px_rgba(3,73,130,0.28)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          isGu ? "translate-x-full bg-orange" : "translate-x-0 bg-navy"
        }`}
      />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={!isGu}
        className={`relative z-10 flex h-7 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
          !isGu ? "text-white" : "text-navy/65 hover:text-navy"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("gu")}
        aria-pressed={isGu}
        title="ગુજરાતી"
        className={`relative z-10 flex h-7 w-8 items-center justify-center rounded-full text-[12.5px] leading-none transition-colors duration-300 ${
          isGu ? "text-white" : "text-navy/65 hover:text-navy"
        }`}
      >
        ગુ
      </button>
    </div>
  );
}

function BrandLogo() {
  return (
    <Image
      src="/images/solarium-logo.png"
      alt="Solarium Green Energy"
      width={3349}
      height={1119}
      priority
      sizes="120px"
      className="h-7 w-auto lg:h-8"
    />
  );
}

export default function Header() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden]   = useState(false);
  const { isGu } = useLanguage();

  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const diff = y - lastY.current;

      // Only trigger hide/show after passing 80px from top
      if (y > 80) {
        if (diff > 6)  setHidden(true);   // scrolling down → hide
        if (diff < -6) setHidden(false);  // scrolling up   → show
      } else {
        setHidden(false); // always show near top
      }

      setScrolled(y > 12);
      lastY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-line bg-white/95 text-navy backdrop-blur-md
        rounded-b-2xl
        transition-all duration-300 ease-in-out
        ${scrolled ? "shadow-[0_18px_40px_-30px_rgba(3,73,130,0.45)]" : ""}
        ${hidden ? "-translate-y-full" : "translate-y-0"}
      `}
    >
      <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <BrandLogo />
          <span className="ml-1 hidden rounded-full border border-line bg-paper px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted sm:inline-block">
            {isGu ? "BSE પર લિસ્ટેડ" : "BSE Listed"}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-navy/70 transition-colors hover:text-accent"
            >
              {isGu ? item.guLabel : item.label}
            </Link>
          ))}
          <a
            href={site.phoneHref}
            className="hidden items-center gap-1.5 text-[13px] font-semibold text-navy/70 transition-colors hover:text-accent xl:flex"
          >
            <Phone className="h-3.5 w-3.5 text-orange-deep" />
            {site.phoneDisplay}
          </a>
          <Link
            href="/book"
            className="group inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-[12.5px] font-bold text-white transition-colors hover:bg-navy-soft"
          >
            {isGu ? "₹0* માં બુક કરો" : "Book at 0*"}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitch />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-full p-1.5 text-navy/70 transition-colors hover:bg-paper-deep hover:text-navy"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop extreme-right language toggle — keeps Book at 0* in its exact original container position */}
      <div className="hidden lg:block lg:absolute lg:right-4 lg:top-1/2 lg:-translate-y-1/2 xl:right-6">
        <LanguageSwitch />
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="rounded-b-2xl border-t border-white/10 bg-navy px-5 pb-6 pt-3 lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-3.5 text-[15px] font-medium text-paper/80"
              >
                {isGu ? item.guLabel : item.label}
              </Link>
            ))}
            <a
              href={site.phoneHref}
              className="flex items-center gap-2 py-3.5 text-sm font-semibold text-paper/80"
            >
              <Phone className="h-4 w-4 text-orange" />
              {site.phoneDisplay}
            </a>
          </nav>
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange px-5 py-3.5 text-sm font-bold text-ink"
          >
            {isGu ? "₹0* માં બુક કરો" : "Book at 0*"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
