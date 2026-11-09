"use client";

import { MessageCircle, Phone, Plus } from "lucide-react";
import { FAQS, site, whatsappUrl } from "../lib/content";
import { useLanguage } from "../lib/language";
import Reveal from "./Reveal";

export default function Faq() {
  const { isGu } = useLanguage();
  return (
    <section id="faq" className="bg-paper py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-6">
        <Reveal direction="left">
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange">
              {isGu ? "સ્પષ્ટ જવાબો" : "Straight answers"}
            </p>
            <h2 className="mt-4 max-w-[12ch] text-[clamp(1.9rem,4.2vw,2.9rem)] font-bold leading-[1.08] tracking-[-0.035em] text-balance">
              {isGu ? "તમારા પ્રશ્નોના સચોટ જવાબો." : "Questions, answered."}
            </h2>
            <p className="mt-4 max-w-[340px] text-[13.5px] leading-relaxed text-body">
              {isGu
                ? "સિસ્ટમ બુક કરાવતા પહેલા તમારે જે જાણવું જરૂરી છે તે બધું અહીં છે. જો હજુ પણ કંઈ અસ્પષ્ટ હોય, તો સીધા અમારા પ્રતિનિધિ સાથે વાત કરો — કોઈ કોલ સેન્ટર નહીં!"
                : "Everything worth knowing before you reserve. If something is still unclear, talk to a real person — no call centre."}
            </p>

            <div className="mt-7 rounded-2xl border border-line bg-white p-5">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted">
                {isGu ? "સોલેરિયમ (Solarium) સાથે વાત કરો" : "Talk to Solarium"}
              </p>
              <a
                href={site.phoneHref}
                className="mt-2 flex items-center gap-2 font-display text-[18px] font-bold tracking-tight text-navy transition-colors hover:text-orange"
              >
                <Phone className="h-4 w-4 text-orange" />
                {site.phoneDisplay}
              </a>
              <a
                href={whatsappUrl(
                  "Hi Solarium, I have a question about the ₹0 home solar offer."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-orange transition-colors hover:text-navy"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {isGu ? "WhatsApp પર પૂછો" : "Ask on WhatsApp"}
              </a>
              <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
                {isGu
                  ? "સોમવાર–શનિવાર, સવારે 9:30 થી સાંજે 6:30 સુધી"
                  : "Mon–Sat, 9:30 am – 6:30 pm"}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="border-t border-line">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} direction="right" delay={i * 65}>
              <details className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-[14.5px] font-bold leading-snug text-navy transition-colors group-hover:text-orange">
                    {isGu ? faq.guQ : faq.q}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white text-orange transition-transform duration-300 group-open:rotate-45">
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                </summary>
                <p className="max-w-[40rem] pb-5 pr-2 text-[13px] leading-[1.7] text-body sm:pr-10">
                  {isGu ? faq.guA : faq.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
