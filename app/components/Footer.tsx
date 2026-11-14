"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { DISCLAIMER, site } from "../lib/content";
import { useLanguage } from "../lib/language";

const LINKS = [
  { label: "What you get", guLabel: "તમને શું મળશે", href: "/#product" },
  { label: "Institutional clients", guLabel: "સંસ્થાકીય ગ્રાહકો", href: "/#clients" },
  { label: "The 6S", guLabel: "6S (સિક્સ-એસ) અભિગમ", href: "/#six-s" },
  { label: "How it works", guLabel: "તે કેવી રીતે કામ કરે છે", href: "/#how" },
  { label: "FAQ", guLabel: "વારંવાર પૂછાતા પ્રશ્નો (FAQ)", href: "/#faq" },
  { label: "Get your quotation", guLabel: "તમારું ક્વોટેશન મેળવો", href: "/#quotation" },
  { label: "Book at 0*", guLabel: "૦* થી બુકિંગ શરૂ કરો", href: "/book" },
];

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.59 1.59 0 0 0-1.6 1.59c0 .88.72 1.6 1.6 1.6.88 0 1.6-.72 1.6-1.6 0-.88-.72-1.59-1.6-1.59Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "LinkedIn", href: site.linkedin, icon: LinkedInIcon },
  { label: "Instagram", href: site.instagram, icon: InstagramIcon },
  { label: "Facebook", href: site.facebook, icon: FacebookIcon },
  { label: "YouTube", href: site.youtube, icon: YouTubeIcon },
];

export default function Footer() {
  const { isGu } = useLanguage();
  return (
    <footer className="bg-navy-deep text-paper">
      <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-14 sm:pb-10 lg:px-6 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.7fr_1.05fr] lg:gap-14">
          <div>
            <a href="/#top" className="inline-flex items-center">
              <Image
                src="/images/solarium-logo-white.png"
                alt={
                  isGu
                    ? "સોલેરિયમ ગ્રીન એનર્જી (Solarium Green Energy)"
                    : "Solarium Green Energy"
                }
                width={3349}
                height={1119}
                sizes="130px"
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-3 max-w-[300px] text-[12px] leading-relaxed text-paper/55">
              {isGu
                ? "ભારતની એકીકૃત સોલર કંપની — ૨૦૧૮થી એક જ છત નીચે મોડ્યુલ્સ, એન્જિનિયરિંગ અને ઇન્સ્ટોલેશનની સુવિધા."
                : "India's integrated solar company — modules, engineering and installation under one roof since 2018."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 shadow-sm">
                <Image
                  src="/images/bse-listed.png"
                  alt={
                    isGu
                      ? "BSE સ્મોલ એન્ડ મીડિયમ એન્ટરપ્રાઇઝિસ (SME) પર લિસ્ટેડ - સ્ટોક કોડ 544354"
                      : "Listed on BSE Small & Medium Enterprises - Stock Code 544354"
                  }
                  width={300}
                  height={228}
                  className="h-8 w-auto object-contain"
                />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold text-paper/65">
                {isGu ? "MNRE દ્વારા માન્ય ચેનલ પાર્ટનર" : "MNRE approved channel partner"}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-paper/70 transition-all hover:border-white/25 hover:bg-white/[0.08] hover:text-orange"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-paper/65">
              {isGu ? "આ પેજ પર" : "On this page"}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {LINKS.map((link) => (
                <li key={link.href}>
                  {link.href === "/book" ? (
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-orange transition-colors hover:text-white"
                    >
                      {isGu ? link.guLabel : link.label}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-[12.5px] font-medium text-paper/70 transition-colors hover:text-orange"
                    >
                      {isGu ? link.guLabel : link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-paper/65">
              {isGu ? "અમારો સંપર્ક કરો" : "Get in touch"}
            </h3>
            <ul className="mt-4 space-y-3 text-[12.5px] text-paper/70">
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-start gap-2.5 transition-colors hover:text-orange"
                >
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange" />
                  <span>
                    {site.phoneDisplay}
                    <span className="block text-[10.5px] text-paper/55">
                      {isGu
                        ? "ટોલ-ફ્રી · સોમ–શનિ, સવારે ૯:૩૦ થી સાંજે ૬:૩૦"
                        : "Toll-free · Mon–Sat, 9:30 am – 6:30 pm"}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-orange"
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange" />
                <span className="leading-relaxed">
                  {isGu
                    ? "B-1207, વર્લ્ડ ટ્રેડ ટાવર, S.G. હાઇવે, સરખેજ, અમદાવાદ, ગુજરાત ૩૮૦૦૫૧"
                    : site.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          id="disclaimer"
          className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[10px] leading-[1.7] text-paper/55 sm:p-5"
        >
          <p>
            {isGu
              ? "*અસરકારક ખર્ચની ગણતરીમાં ૨.૧૮ kW ના પ્રમાણભૂત (standard) સેટઅપ માટે 'PM સૂર્ય ઘર: મફત વીજળી યોજના' હેઠળ કેન્દ્રીય સહાય અને કમિશનિંગ સમયે જાહેર કરાયેલ ગુજરાત રાજ્યની સહાય મળવાની ધારણા રાખવામાં આવી છે. સબસિડીની રકમ, પાત્રતા અને ચૂકવણીનો સમયગાળો MNRE, GEDA અને DISCOM દ્વારા નક્કી કરવામાં આવે છે, સોલેરિયમ દ્વારા નહીં. સાઇટ મુજબના ફેરફારો (customisation) માટેનો ખર્ચ સર્વેક્ષણ પછી અને ઓર્ડર કન્ફર્મ કરતા પહેલા જણાવવામાં આવશે. ‘ગુજરાતમાં #૧’: PM સૂર્ય ઘર ઇન્સ્ટોલેશન રેન્કિંગ. ઉલ્લેખિત સંસ્થાઓના નામ પૂર્ણ થયેલા પ્રોજેક્ટ્સના સંદર્ભમાં છે; આનો અર્થ એવો નથી કે તે સંસ્થાઓ દ્વારા કોઈ સમર્થન (endorsement) આપવામાં આવ્યું છે."
              : `*${DISCLAIMER} ‘#1 in Gujarat’: PM Surya Ghar installation ranking. Institution names refer to projects executed; no endorsement implied.`}
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10.5px] text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {isGu
              ? "© ૨૦૨૬ સોલેરિયમ ગ્રીન એનર્જી લિ. સર્વાધિકાર સુરક્ષિત."
              : `© ${new Date().getFullYear()} ${site.legalName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://solariumenergy.in/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-orange"
            >
              {isGu ? "ગોપનીયતા નીતિ (Privacy)" : "Privacy"}
            </a>
            <a href="#disclaimer" className="transition-colors hover:text-orange">
              {isGu ? "ડિસક્લેમર (અસ્વીકરણ)" : "Disclaimer"}
            </a>
            <a href="#top" className="inline-flex items-center gap-1 transition-colors hover:text-orange">
              {isGu ? "ઉપર પાછા જાઓ" : "Back to top"}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
