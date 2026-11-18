"use client";

import { ArrowRight } from "lucide-react";
import { CUSTOMER_SAVINGS, inr } from "../lib/content";
import { useLanguage } from "../lib/language";
import { CENTRAL_SUBSIDY, EFFECTIVE_COST, GUJARAT_SUBSIDY } from "../lib/quotation";
import QuotationBar from "./quotation/QuotationBar";
import Button from "./ui/Button";

type Point = { b: string; s: string; guB: string; guS: string };

/* Beside the sun, from 1200 wide: three points on each side, each one bold line and one small line.
   The money on the left, the trust on the right. The rating's stars are added in the markup. */
const LEFT_POINTS: Point[] = [
  { b: "Save ~₹2,000", s: "every month", guB: "~₹2,000 ની બચત", guS: "દર મહિને" },
  { b: "~₹6 Lakhs saved", s: "over 25 years", guB: "~₹6 લાખની બચત", guS: "25 વર્ષમાં કુલ" },
  { b: "100%* subsidy", s: "in return", guB: "100%* સબસિડી", guS: "(યોજનાના નિયમો મુજબ)" },
];
const RIGHT_POINTS: Point[] = [
  { b: "5-year insurance", s: "included free", guB: "5 વર્ષનો વીમો", guS: "મફત સમાવિષ્ટ" },
  { b: "Directly installed", s: "by panel manufacturer", guB: "સીધું ઇન્સ્ટોલેશન", guS: "પેનલ ઉત્પાદક દ્વારા" },
];
/* Under the price on a phone: the rating and these two. */
const PHONE_POINTS: Point[] = [
  { b: "5-year", s: "insurance", guB: "5 વર્ષનો", guS: "વીમો" },
  { b: "100%* subsidy", s: "in return", guB: "100%* સબસિડી", guS: "(યોજનાના નિયમો મુજબ)" },
];

/* Seven rays, as in the logo, 26 degrees apart. */
const RAYS = [-78, -52, -26, 0, 26, 52, 78];
// The angle between two rays: the fan turns by this much, again and again.
const RAY_STEP = 26;

/** The hero's footnote: the price never stands without it. */
export function useHeroFootnote() {
  const { isGu } = useLanguage();
  return isGu
    ? `*કેન્દ્ર સરકાર (${inr(CENTRAL_SUBSIDY)}) અને ગુજરાત રાજ્ય સરકાર (${inr(GUJARAT_SUBSIDY)}) ની સબસિડી બાદ. પાત્રતા અને યોજનાની શરતો લાગુ.`
    : `*After central (${inr(CENTRAL_SUBSIDY)}) and Gujarat state (${inr(GUJARAT_SUBSIDY)}) subsidy. Subject to eligibility and scheme terms.`;
}

/** The first screen: the sky, the sun with the price and the main action, and the quotation bar. */
export default function Hero() {
  const { isGu } = useLanguage();
  const footnote = useHeroFootnote();
  const price = inr(EFFECTIVE_COST);
  const point = (item: Point) => (
    <div key={item.b}>
      <b>{isGu ? item.guB : item.b}</b>
      <span>{isGu ? item.guS : item.s}</span>
    </div>
  );

  return (
    <section className="hero on-dark" id="top" data-mo-scroll="" data-mo-pointer="" data-mo-loop="">
      <div className="halo" aria-hidden="true" />
      <svg className="rays" viewBox="0 0 1440 900" aria-hidden="true">
        {RAYS.map((angle) => (
          <polygon
            key={angle}
            className={angle === RAYS[RAYS.length - 1] ? "is-out" : undefined}
            points="-2.6,-430 2.6,-430 .6,-900 -.6,-900"
            transform={`translate(720 718) rotate(${angle})`}
          />
        ))}
        {/* The ray that waits below the horizon: it comes up on the left while the fan turns and the last one sets on the right. */}
        <polygon className="is-in" points="-2.6,-430 2.6,-430 .6,-900 -.6,-900" transform={`translate(720 718) rotate(${RAYS[0] - RAY_STEP})`} />
      </svg>

      <div className="top">
        {/* Three parts with a dot between them. On a narrow phone the third part takes a line of its own,
            and the dot before it is not drawn, so no dot starts or ends a line. */}
        <div className="meta">
          <span>2.18 kW</span>
          <b aria-hidden="true" />
          <span>{isGu ? "PM સૂર્ય ઘર: મફત વીજળી યોજના હેઠળ" : "Under PM Surya Ghar: Muft Bijli Yojana"}</span>
          <b aria-hidden="true" className="before-last" />
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

      <div className="flank l">{LEFT_POINTS.map(point)}</div>

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
        {RIGHT_POINTS.map(point)}
      </div>

      <div className="proof">
        <div>
          <b>{CUSTOMER_SAVINGS.googleRating} ★</b>
          {isGu ? "ગૂગલ રેટિંગ" : "Google rating"}
        </div>
        {PHONE_POINTS.map((item) => (
          <div key={item.b}>
            <b>{isGu ? item.guB : item.b}</b>
            {isGu ? item.guS : item.s}
          </div>
        ))}
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
