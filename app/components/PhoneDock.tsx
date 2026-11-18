"use client";

import { ArrowRight } from "lucide-react";
import { inr } from "../lib/content";
import { useLanguage } from "../lib/language";
import { EFFECTIVE_COST } from "../lib/quotation";
import Button from "./ui/Button";

/** The bar at the bottom of the phone screen with the price and the main action. Phones only, on the offer page. */
export default function PhoneDock() {
  const { isGu } = useLanguage();
  return (
    <div className="dock">
      <div>
        <small>{isGu ? "અસરકારક ખર્ચ · 2.18 kW" : "Effective cost · 2.18 kW"}</small>
        <b>{inr(EFFECTIVE_COST)}*</b>
      </div>
      <Button variant="primary" href="/#quotation">
        {isGu ? "તમારું ક્વોટેશન મેળવો" : "Get your quotation"}
        <ArrowRight className="ico" aria-hidden="true" />
      </Button>
    </div>
  );
}
