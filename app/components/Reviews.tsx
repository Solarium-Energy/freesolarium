"use client";

import { CUSTOMER_SAVINGS, TESTIMONIALS } from "../lib/content";
import { useLanguage } from "../lib/language";
import Avatar from "./ui/Avatar";

type Review = (typeof TESTIMONIALS)[number];

/** Who wrote the review: initials, name, the line as published on Google and the link to the review. */
function Who({ review, lead }: { review: Review; lead?: boolean }) {
  const { isGu } = useLanguage();
  const system = isGu ? review.guSystem : review.system;
  return (
    <div className="who">
      <Avatar initials={review.initials} size="lg" />
      <span>
        <b>{isGu ? review.guName : review.name}</b>
        {isGu ? review.guMeta : review.meta} · {isGu ? review.guTimeAgo : review.timeAgo}
        {!lead && <> · {system}</>}
        <a className="link" href={review.reviewUrl} target="_blank" rel="noopener noreferrer">
          {isGu ? "ગૂગલ પર જુઓ" : "View on Google"}
        </a>
      </span>
      {lead && <span className="sys">{system}</span>}
    </div>
  );
}

export default function Reviews() {
  const { isGu } = useLanguage();
  const [first, ...others] = TESTIMONIALS;
  return (
    <section className="section is-mist" id="testimonials">
      <div className="wrap rev-g">
        <div data-mo-group="">
          <div className="eyebrow">{isGu ? "ગ્રાહકોના અનુભવો" : "Customer stories"}</div>
          <div className="rating">
            <div className="big" data-mo-count="">{CUSTOMER_SAVINGS.googleRating}</div>
            <div className="st" aria-hidden="true">
              ★★★★★
            </div>
            <div className="cnt">
              {CUSTOMER_SAVINGS.googleReviewCount} {isGu ? "ગૂગલ રિવ્યૂ" : "Google Reviews"}
            </div>
          </div>
          {isGu ? (
            <h2 className="h-sub">
              વાસ્તવિક ગ્રાહકો.
              <br />
              વાસ્તવિક બચત.
            </h2>
          ) : (
            <h2 className="h-sub">
              Real Homeowners.
              <br />
              Real Savings.
            </h2>
          )}
          <p className="muted">
            {isGu
              ? "જે ઘરમાલિકોએ સબસિડી, નેટ મીટરિંગ અને ઇન્સ્ટોલેશન માટે સોલેરિયમ પર વિશ્વાસ મૂક્યો છે તેમના સીધા અભિપ્રાય વાંચો."
              : "Hear directly from homeowners who trusted Solarium to handle their subsidies, net metering, and installation."}
          </p>
        </div>
        <div data-mo-group="" data-mo-delay="1">
          <p className="q-lead">&ldquo;{isGu ? first.guQuote : first.quote}&rdquo;</p>
          <Who review={first} lead />
          <div className="q-pair">
            {others.map((review) => (
              <div key={review.id}>
                <p>&ldquo;{isGu ? review.guQuote : review.quote}&rdquo;</p>
                <Who review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
