"use client";

import { ArrowRight, PhoneCall } from "lucide-react";
import { inr } from "../../lib/content";
import { useLanguage } from "../../lib/language";
import {
  DISCOM_OPTIONS,
  FLOOR_OPTIONS,
  STRUCTURE_HEIGHT_OPTIONS,
  type DiscomOption,
  type FloorOption,
  type StructureHeight,
} from "../../lib/quotation";
import Button from "../ui/Button";
import TweenNumber from "../ui/TweenNumber";
import SegmentedControl from "../ui/SegmentedControl";
import { cx } from "../ui/cx";
import { useQuotation } from "./QuotationProvider";
import QuotationSelect, { type SelectOption } from "./QuotationSelect";

type Option = { label: string; guLabel: string; sub: string; guSub: string };

/** The options of the quotation in the words of the page's language. The value stays the English label. */
function choices<T extends string>(options: readonly (Option & { label: T })[], isGu: boolean): SelectOption<T>[] {
  return options.map((option) => ({
    value: option.label,
    label: isGu ? option.guLabel : option.label,
    note: isGu ? option.guSub : option.sub,
  }));
}

/**
 * The quotation in one bar: the four choices that change the price, the price and the action.
 * It is drawn twice, in the hero and at the top of the stats band for phones. Both copies show one state.
 */
export default function QuotationBar({ copy }: { copy: "hero" | "phone" }) {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const callbackOption = [
    FLOOR_OPTIONS.find((o) => o.label === q.floor),
    STRUCTURE_HEIGHT_OPTIONS.find((o) => o.label === q.structureHeight),
    DISCOM_OPTIONS.find((o) => o.label === q.discom),
  ].find((option) => option && "custom" in option);

  return (
    <form
      className={cx("qbar", copy === "phone" && "only-phone")}
      aria-label={isGu ? "તમારો ક્વોટેશન (ભાવપત્રક) મેળવો" : "Get your quotation"}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="c">
        <label id={`q-${copy}-category`}>{isGu ? "તમારી શ્રેણી" : "Your category"}</label>
        <SegmentedControl
          label={isGu ? "તમારી શ્રેણી" : "Your category"}
          labelledBy={`q-${copy}-category`}
          value={q.category ?? "general"}
          onChange={(value) => q.setCategory(value)}
          options={[
            { value: "general", label: isGu ? "સામાન્ય (General)" : "General" },
            { value: "sc-st", label: "SC / ST" },
          ]}
        />
      </div>
      <QuotationSelect<Exclude<FloorOption, "">>
        id={`q-${copy}-floor`}
        label={isGu ? "૧ · ફ્લોર" : "1 · Floor"}
        value={q.floor as Exclude<FloorOption, "">}
        options={choices(FLOOR_OPTIONS, isGu)}
        onChange={(value) => q.changeFloor(value)}
      />
      <QuotationSelect<Exclude<StructureHeight, "">>
        id={`q-${copy}-height`}
        label={isGu ? "૨ · ઊંચાઈ" : "2 · Height"}
        value={q.structureHeight as Exclude<StructureHeight, "">}
        options={choices(STRUCTURE_HEIGHT_OPTIONS, isGu)}
        onChange={(value) => q.changeHeight(value)}
      />
      <QuotationSelect<Exclude<DiscomOption, "">>
        id={`q-${copy}-discom`}
        label={isGu ? "૩ · DISCOM" : "3 · DISCOM"}
        value={q.discom as Exclude<DiscomOption, "">}
        options={choices(DISCOM_OPTIONS, isGu)}
        onChange={(value) => q.changeDiscom(value)}
      />
      <div className="c sum">
        {/* What is paid first and what comes back, then the effective cost. When the team has to call back
            there is no price yet: only the note stands. */}
        {!callbackOption && (
          <div className="lines">
            <div>
              <span>{isGu ? "શરૂઆતની ચુકવણી" : "Upfront payment"}</span>
              <TweenNumber value={q.calc.finalPrice} format={inr} />
            </div>
            <div>
              <span>{isGu ? "બેંક ખાતામાં સબસિડી" : "Subsidy to your bank"}</span>
              <span>− {inr(q.calc.totalSubsidy)}</span>
            </div>
          </div>
        )}
        <div className={cx("pay", callbackOption && "is-note")}>
          <em>{isGu ? "અસરકારક ખર્ચ:" : "Effective cost:"}</em>
          {callbackOption ? (
            <span className="pay-note">{isGu ? callbackOption.guSub : callbackOption.sub}</span>
          ) : (
            <>
              <TweenNumber value={q.calc.effectiveCost} format={inr} />
              <sup className="star">*</sup>
            </>
          )}
        </div>
      </div>
      <Button variant="primary" size="lg" className={q.needsCallback ? "is-callback" : undefined} onClick={() => q.openSheet()}>
        {q.needsCallback ? (
          <>
            <PhoneCall className="ico" aria-hidden="true" />
            {isGu ? "અમારી ટીમ તમારો સંપર્ક કરશે" : "Our team will contact you"}
          </>
        ) : (
          <>
            {isGu ? "ક્વોટેશન જુઓ" : "Show Quotation"}
            <ArrowRight className="ico" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
