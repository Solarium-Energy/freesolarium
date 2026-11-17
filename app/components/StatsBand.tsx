"use client";

import type { ReactNode } from "react";
import { TRUST_STATS } from "../lib/content";
import { useLanguage } from "../lib/language";

/** Four facts under the hero, each under a bracket. On a phone the quotation bar sits at its top. */
export default function StatsBand({ children }: { children?: ReactNode }) {
  const { isGu } = useLanguage();
  return (
    <section className="stats">
      <div className="wrap">
        {children}
        <div className="g">
          {TRUST_STATS.map((stat) => (
            <div className="bracket" key={stat.label}>
              <b>{isGu ? stat.guValue : stat.value}</b>
              <span>{isGu ? stat.guLabel : stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
