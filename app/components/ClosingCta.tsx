"use client";

import { ArrowRight, Check, Phone } from "lucide-react";
import { inr, site } from "../lib/content";
import { useLanguage } from "../lib/language";
import { EFFECTIVE_COST, STANDARD_PRICE, TOTAL_SUBSIDY } from "../lib/quotation";
import Button from "./ui/Button";

/** The closing screen: the question, the facts, the two actions and the sun with the effective cost. */
export default function ClosingCta() {
  const { isGu } = useLanguage();
  const subsidy = TOTAL_SUBSIDY;
  const pills = isGu
    ? ["2.18 kW", `સિસ્ટમનું મૂલ્ય ${inr(STANDARD_PRICE)}`, `પાત્ર સબસિડી* ${inr(subsidy)}`]
    : ["2.18 kW", `${inr(STANDARD_PRICE)} system value`, `${inr(subsidy)} eligible subsidy*`];
  const ticks = isGu
    ? ["ચુકવણી કરો અને બદલામાં 100%* સબસિડી મેળવો", "5 વર્ષનો વીમો મફત", "પેનલ ઉત્પાદક દ્વારા સીધું ઇન્સ્ટોલેશન"]
    : ["Pay & get 100%* subsidy in return", "5-year insurance free", "Directly installed by panel manufacturer"];

  return (
    <section className="closing on-dark">
      <div className="halo" aria-hidden="true" data-mo="bloom" data-mo-late="" />
      <div className="glow" aria-hidden="true" data-mo="bloom" data-mo-late="" />
      <div className="in" data-mo-group="">
        {/* Each phrase stays whole: where the line does not fit, it breaks after the dot. */}
        <div className="eyebrow">
          <span>
            <span className="keep">{isGu ? "PM સૂર્ય ઘર: મફત વીજળી યોજના ·" : "PM Surya Ghar: Muft Bijli Yojana ·"}</span>{" "}
            <span className="keep">{isGu ? "ગુજરાતના ઘરો" : "Gujarat homes"}</span>
          </span>
        </div>
        {isGu ? (
          <h2>
            તમારી છત તૈયાર છે.
            <br />
            શું તમે તૈયાર છો?
          </h2>
        ) : (
          <h2>
            Your roof is ready.
            <br />
            Are you?
          </h2>
        )}
        <div className="pill-row">
          {pills.map((pill) => (
            <span key={pill}>{pill}</span>
          ))}
        </div>
        <div className="tick-row">
          {ticks.map((tick) => (
            <span key={tick}>
              <Check className="ico" aria-hidden="true" />
              {tick}
            </span>
          ))}
        </div>
        <div className="cta">
          <Button variant="sun" size="lg" href="/book">
            {isGu ? "₹0* માં બુક કરો" : "Book at ₹0*"}
            <ArrowRight className="ico" aria-hidden="true" />
          </Button>
          <Button variant="on-dark" size="lg" href={site.phoneHref}>
            <Phone className="ico" aria-hidden="true" /> {site.phoneDisplay}
          </Button>
        </div>
        <div className="nt">
          {isGu
            ? `*કુલ ${inr(subsidy)} સબસિડી મળ્યા પછી. ચુકવણી કરો અને બદલામાં 100% સબસિડી મેળવો.`
            : `*After ${inr(subsidy)} total subsidy. Pay & get 100% subsidy in return.`}
        </div>
      </div>
      <div className="sun" data-mo="sunrise" data-mo-late="">
        <small>{isGu ? "અસરકારક ખર્ચ" : "Effective cost"}</small>
        <b>
          {inr(EFFECTIVE_COST)}
          <sup>*</sup>
        </b>
        <small>{isGu ? "ગુજરાતના પાત્ર ઘરો માટે" : "For eligible Gujarat homes"}</small>
      </div>
    </section>
  );
}
