"use client";

import { Menu, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { site } from "../lib/content";
import { useLanguage } from "../lib/language";
import BookButton from "./BookButton";
import Sheet, { useSheet } from "./ui/Sheet";
import { cx } from "./ui/cx";

const NAV = [
  { label: "What you get", guLabel: "તમને શું મળશે", href: "/#product" },
  { label: "How it works", guLabel: "તે કેવી રીતે કામ કરે છે", href: "/#how" },
  { label: "Reviews", guLabel: "ગ્રાહકોના અભિપ્રાય", href: "/#testimonials" },
  { label: "FAQ", guLabel: "વારંવાર પૂછાતા પ્રશ્નો (FAQ)", href: "/#faq" },
];

/* The header turns solid once the page has scrolled by the header's own height. */
function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function scrolledPastHeader() {
  const height = window.matchMedia("(max-width: 767px)").matches ? 64 : 88;
  return window.scrollY > height;
}

function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  return (
    <span className="lang" role="group" aria-label="Language selector">
      <button type="button" className={lang === "en" ? "is-on" : undefined} aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
      <button
        type="button"
        lang="gu"
        title="ગુજરાતી"
        className={lang === "gu" ? "is-on" : undefined}
        aria-pressed={lang === "gu"}
        onClick={() => setLang("gu")}
      >
        ગુ
      </button>
    </span>
  );
}

export default function Header() {
  const { isGu } = useLanguage();
  const onHome = usePathname() === "/";
  const scrolled = useSyncExternalStore(subscribeScroll, scrolledPastHeader, () => false);
  // Over the hero the header is transparent. Elsewhere, and once scrolled, it is solid.
  const solid = !onHome || scrolled;
  const menu = useSheet();
  const menuLabel = isGu ? "મેનુ" : "Menu";

  return (
    <>
      <header className={cx("site-header", solid ? "is-solid" : "on-dark", onHome && solid && "is-fixed")}>
        <Link href="/" className="brand">
          <Image
            className="logo logo-on-dark"
            src="/images/solarium-logo-white.png"
            alt="Solarium Green Energy"
            width={3349}
            height={1119}
            sizes="160px"
            loading="eager"
          />
          <Image
            className="logo logo-on-light"
            src="/images/solarium-logo.png"
            alt="Solarium Green Energy"
            width={3349}
            height={1119}
            sizes="160px"
            loading="eager"
          />
        </Link>
        <nav className="nav-pills" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {isGu ? item.guLabel : item.label}
            </Link>
          ))}
        </nav>
        <div className="r">
          <a className="tel" href={site.phoneHref}>
            <Phone className="ico" aria-hidden="true" /> <span className="tel-digits">{site.phoneDisplay}</span>
          </a>
          <LanguageSwitch />
          <BookButton />
          <button
            type="button"
            className="menu-btn"
            aria-label={menuLabel}
            aria-expanded={menu.state === "open"}
            aria-haspopup="dialog"
            onClick={menu.show}
          >
            <Menu className="ico" aria-hidden="true" />
          </button>
        </div>
      </header>

      <Sheet
        state={menu.state}
        onClose={() => menu.hide()}
        titleId="site-menu-title"
        title={menuLabel}
        closeLabel={isGu ? "બંધ કરો" : "Close"}
        bottom
        className="menu-sheet"
      >
        <nav className="menu-links" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => menu.hide()}>
              {isGu ? item.guLabel : item.label}
            </Link>
          ))}
        </nav>
        <a className="menu-tel" href={site.phoneHref}>
          <Phone className="ico" aria-hidden="true" /> {site.phoneDisplay}
        </a>
        <BookButton block onClick={() => menu.hide()} />
      </Sheet>
    </>
  );
}
