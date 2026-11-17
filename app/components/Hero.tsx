"use client";

import { ArrowRight } from "lucide-react";
import { CUSTOMER_SAVINGS, HERO_PRICE, PRICING, inr } from "../lib/content";
import { useLanguage } from "../lib/language";
import QuotationBar from "./quotation/QuotationBar";
import Button from "./ui/Button";

const HERO_FEATURES = [
  { line1: "5-year", line2: "insurance", guLine1: "5 વર્ષનો", guLine2: "વીમો" },
  { line1: "100% subsidy", line2: "in return", guLine1: "100% સબસિડી", guLine2: "(યોજનાના નિયમો મુજબ)" },
  { line1: "Installed by", line2: "our own team", guLine1: "અમારી પોતાની ટીમ દ્વારા", guLine2: "ઇન્સ્ટોલેશન" },
] as const;

/* Seven rays, as in the logo, 26 degrees apart. */
const RAYS = [-78, -52, -26, 0, 26, 52, 78];

/** The hero's footnote: the price never stands without it. */
export function useHeroFootnote() {
  const { isGu } = useLanguage();
  return isGu
    ? `*કેન્દ્ર સરકાર (${inr(PRICING.centralSubsidy)}) અને ગુજરાત રાજ્ય સરકાર (${inr(PRICING.stateSubsidy)}) ની સબસિડી બાદ. પાત્રતા અને યોજનાની શરતો લાગુ.`
    : `*After central (${inr(PRICING.centralSubsidy)}) and Gujarat state (${inr(PRICING.stateSubsidy)}) subsidy. Subject to eligibility and scheme terms.`;
}

/** The first screen: the sky, the sun with the price and the main action, and the quotation bar. */
export default function Hero() {
  const { isGu } = useLanguage();
  const footnote = useHeroFootnote();
  const price = inr(HERO_PRICE);
  const feature = (index: number) => {
    const item = HERO_FEATURES[index];
    return isGu ? [item.guLine1, item.guLine2] : [item.line1, item.line2];
  };

  return (
    <section className="hero on-dark" id="top" data-mo-scroll="exit" data-mo-pointer="">
      <div className="halo" aria-hidden="true" />
      <svg className="rays" viewBox="0 0 1440 900" aria-hidden="true">
        {RAYS.map((angle) => (
          <polygon key={angle} points="-2.6,-430 2.6,-430 .6,-900 -.6,-900" transform={`translate(720 718) rotate(${angle})`} />
        ))}
      </svg>

      <div className="top">
        <div className="meta">
          <span>2.18 kW</span>
          <b aria-hidden="true" />
          <span>{isGu ? "PM સૂર્ય ઘર યોજના હેઠળ" : "Under PM Surya Ghar"}</span>
          <b aria-hidden="true" />
          <span>{isGu ? "ગુજરાતના ઘરો માટે" : "Gujarat homes"}</span>
        </div>
        {isGu ? (
          // The Gujarati sentence has the price in the middle: it stays one headline, in one style.
          <h1>તમારા ઘર માટે {price}* માં સોલર સિસ્ટમ</h1>
        ) : (
          <h1>
            Solar for your home at<span className="sr-only"> {price}*</span>
          </h1>
        )}
      </div>

      <div className="glow" aria-hidden="true" />
      <div className="sun" aria-hidden="true" />
      <div className="price" aria-hidden="true">
        {price}
        <sup>*</sup>
      </div>

      <div className="incta">
        <Button variant="primary" size="lg" href="/book">
          {isGu ? "મારી સિસ્ટમ બુક કરો" : "Book my system"}
          <ArrowRight className="ico" aria-hidden="true" />
        </Button>
        <a className="lk" href="#how">
          {isGu ? "તે કેવી રીતે કામ કરે છે તે જાણો" : "See how it works"}
        </a>
      </div>

      <div className="flank l">
        <div>
          <b>{isGu ? "લગભગ ₹2,000 ની બચત કરો" : "Save ~₹2,000"}</b>
          <span>{isGu ? "દર મહિને" : "every month"}</span>
        </div>
        <div>
          <b>{isGu ? "₹6 લાખની બચત" : "₹6 Lakhs saved"}</b>
          <span>{isGu ? "25 વર્ષમાં કુલ" : "over 25 years"}</span>
        </div>
      </div>

      <div className="flank r">
        <div>
          <b>
            {CUSTOMER_SAVINGS.googleRating}{" "}
            <span className="stars" aria-hidden="true">
              ★★★★★
            </span>
          </b>
          <span>{isGu ? "ગૂગલ રેટિંગ" : "Google rating"}</span>
        </div>
        <div>
          <b>{feature(0).join(" ")}</b>
          <span>{feature(1).join(" ")}</span>
          <span>{feature(2).join(" ")}</span>
        </div>
      </div>

      <div className="proof">
        <div>
          <b>{CUSTOMER_SAVINGS.googleRating} ★</b>
          {isGu ? "ગૂગલ રેટિંગ" : "Google rating"}
        </div>
        <div>
          <b>{feature(0)[0]}</b>
          {feature(0)[1]}
        </div>
        <div>
          <b>{feature(1)[0]}</b>
          {feature(1)[1]}
        </div>
      </div>

      <QuotationBar copy="hero" />
      <div className="hnote">{footnote}</div>
    </section>
  );
}

/** The phone copy of the quotation bar, at the top of the stats band, with the footnote of the price under it. */
export function PhoneQuotationBar() {
  const footnote = useHeroFootnote();
  return (
    <>
      <QuotationBar copy="phone" />
      <small className="fine only-phone">{footnote}</small>
    </>
  );
}
