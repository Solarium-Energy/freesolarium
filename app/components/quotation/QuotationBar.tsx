"use client";

import { ArrowRight, ChevronDown, PhoneCall } from "lucide-react";
import { PRICING, inr } from "../../lib/content";
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

type Option = { label: string; guLabel: string; sub: string; guSub: string };

/** A native select that looks like the drawn value with its caret. The select covers the whole cell. */
function Pick<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly (Option & { label: T })[];
  onChange: (value: T) => void;
}) {
  const { isGu } = useLanguage();
  const chosen = options.find((option) => option.label === value);
  return (
    <div className="c q-pick">
      <label htmlFor={id}>{label}</label>
      <div className="v" aria-hidden="true">
        <span>{chosen ? (isGu ? chosen.guLabel : chosen.label) : ""}</span>
        <ChevronDown className="ico" />
      </div>
      <select id={id} className="q-select" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.label} value={option.label}>
            {isGu ? option.guLabel : option.label} ({isGu ? option.guSub : option.sub})
          </option>
        ))}
      </select>
    </div>
  );
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
      <Pick<Exclude<FloorOption, "">>
        id={`q-${copy}-floor`}
        label={isGu ? "૧ · ફ્લોર" : "1 · Floor"}
        value={q.floor as Exclude<FloorOption, "">}
        options={FLOOR_OPTIONS}
        onChange={(value) => q.changeFloor(value)}
      />
      <Pick<Exclude<StructureHeight, "">>
        id={`q-${copy}-height`}
        label={isGu ? "૨ · ઊંચાઈ" : "2 · Height"}
        value={q.structureHeight as Exclude<StructureHeight, "">}
        options={STRUCTURE_HEIGHT_OPTIONS}
        onChange={(value) => q.changeHeight(value)}
      />
      <Pick<Exclude<DiscomOption, "">>
        id={`q-${copy}-discom`}
        label={isGu ? "૩ · DISCOM" : "3 · DISCOM"}
        value={q.discom as Exclude<DiscomOption, "">}
        options={DISCOM_OPTIONS}
        onChange={(value) => q.changeDiscom(value)}
      />
      <div className="c sum">
        <div className="ln">
          {inr(PRICING.systemValue)} − {inr(PRICING.centralSubsidy + PRICING.stateSubsidy)} {isGu ? "સબસિડી" : "subsidy"}
        </div>
        <div className={cx("pay", callbackOption && "is-note")}>
          <em>{isGu ? "તમારે ચૂકવવાના:" : "You pay:"}</em>
          {callbackOption ? (
            <span className="pay-note">{isGu ? callbackOption.guSub : callbackOption.sub}</span>
          ) : (
            <>
              <TweenNumber value={q.calc.cash.netAfterSubsidy} format={inr} />
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
