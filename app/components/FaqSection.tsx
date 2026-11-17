"use client";

import { ArrowRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { FAQS, site, whatsappUrl } from "../lib/content";
import { useLanguage } from "../lib/language";
import Button from "./ui/Button";
import { cx } from "./ui/cx";

export default function FaqSection() {
  const { isGu } = useLanguage();
  // One row open at a time, the first one open at the start.
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section is-subtle" id="faq">
      <div className="wrap faq-g">
        <div>
          <div className="eyebrow">{isGu ? "સ્પષ્ટ જવાબો" : "Straight answers"}</div>
          <h2 className="h-sec">{isGu ? "તમારા પ્રશ્નોના સચોટ જવાબો." : "Questions, answered."}</h2>
          <p className="muted">
            {isGu
              ? "સિસ્ટમ બુક કરાવતા પહેલા તમારે જે જાણવું જરૂરી છે તે બધું અહીં છે. જો હજુ પણ કંઈ અસ્પષ્ટ હોય, તો સીધા અમારા પ્રતિનિધિ સાથે વાત કરો, કોઈ કોલ સેન્ટર નહીં."
              : "Everything worth knowing before you reserve. If something is still unclear, talk to a real person, no call centre."}
          </p>
          <div className="talk">
            <small>{isGu ? "સોલેરિયમ (Solarium) સાથે વાત કરો" : "Talk to Solarium"}</small>
            <div className="num">
              <a href={site.phoneHref}>{site.phoneDisplay}</a>
            </div>
            <Button
              variant="outline"
              href={whatsappUrl("Hi Solarium, I have a question about the ₹0 home solar offer.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {isGu ? "WhatsApp પર પૂછો" : "Ask on WhatsApp"}
              <ArrowRight className="ico" aria-hidden="true" />
            </Button>
            <em>{isGu ? "સોમવારથી શનિવાર, સવારે 9:30 થી સાંજે 6:30 સુધી" : "Mon to Sat, 9:30 am to 6:30 pm"}</em>
          </div>
        </div>

        <div className="acc">
          {FAQS.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div key={faq.q} className={cx("row", isOpen && "is-open")}>
                <h3>
                  <button
                    type="button"
                    className="qh"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index + 1}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span>{isGu ? faq.guQ : faq.q}</span>
                    <span className="icon-btn icon-btn-lg" aria-hidden="true">
                      <span className="i-plus">
                        <Plus className="ico" />
                      </span>
                      <span className="i-minus">
                        <Minus className="ico" />
                      </span>
                    </span>
                  </button>
                </h3>
                <p className="ans" id={`faq-answer-${index + 1}`} hidden={!isOpen}>
                  {isGu ? faq.guA : faq.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
