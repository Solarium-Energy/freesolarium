"use client";

import { createContext, useContext, useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { buildMeta, isConfirmed, newSubmissionId, postJson, type PostResult } from "../../lib/leadClient";
import {
  DISCOM_OPTIONS,
  FLOOR_OPTIONS,
  PAYMENT_MODE_VALUES,
  PINCODE_PATTERN,
  QUOTE_NO_PATTERN,
  STRUCTURE_HEIGHT_OPTIONS,
  computeQuotationNumbers,
  loanFigures,
  type Category,
  type DiscomOption,
  type FloorOption,
  type PaymentMode,
  type StructureHeight,
} from "../../lib/quotation";
import { useSheet, type SheetState } from "../ui/Sheet";
import QuotationSheet from "./QuotationSheet";

/* The bar starts with the choices the design shows, so nothing is empty. */
const START = {
  category: "general" as Category,
  floor: "G+1" as FloorOption,
  structureHeight: "0.5 m" as StructureHeight,
  discom: "UGVCL" as DiscomOption,
};

export type SheetStep = "details" | "quotation";

/** Everything the quotation bar and the sheet share: the choices, the details, the sending. */
function useQuotationState() {
  const [category, setCategory]               = useState<Category>(START.category);
  const [floor, setFloor]                     = useState<FloorOption>(START.floor);
  const [structureHeight, setStructureHeight] = useState<StructureHeight>(START.structureHeight);
  const [discom, setDiscom]                   = useState<DiscomOption>(START.discom);
  const [name, setName]                       = useState("");
  const [pincode, setPincode]                 = useState("");
  const [mobile, setMobile]                   = useState("");
  // The quote number the CRM gave in its answer to the latest send. None while a send is under way,
  // after a failed one, or while the CRM sends none. The website never makes one itself.
  const [quoteNo, setQuoteNo]                 = useState<string | null>(null);
  const [attempted, setAttempted]             = useState(false);
  const [callbackSent, setCallbackSent]       = useState(false);
  const [step, setStep]                       = useState<SheetStep>("details");
  // The payment mode chosen on the quotation step. It starts with the first one (cash).
  const [paymentMode, setPaymentMode]         = useState<PaymentMode | null>("cash");
  const [sending, setSending]                 = useState(false);
  const [sendError, setSendError]             = useState<"general" | "rate" | null>(null);
  const [website, setWebsite]                 = useState("");
  // The last quotation sent (without id and meta), so the same one is not sent twice,
  // and the last one the CRM confirmed.
  const lastSentRef = useRef<string | null>(null);
  const confirmedRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  // Counts the sends, so that only the answer to the latest one sets the quote number.
  const sendTurnRef = useRef(0);
  const sheet = useSheet();

  const validName    = name.trim().length > 1;
  const validPincode = PINCODE_PATTERN.test(pincode);
  const validMobile  = /^\d{10}$/.test(mobile);

  const selectionsComplete = Boolean(category && floor && structureHeight && discom);
  const needsCallback = floor === "G+5 and above" || structureHeight === "3.0 m and above";
  const allReady = selectionsComplete && validName && validPincode && validMobile;
  // The figures follow the category: its standard price and its subsidies.
  const calc = computeQuotationNumbers(floor, structureHeight, discom, category);

  function reset() {
    setCategory(START.category);
    setFloor(START.floor);
    setStructureHeight(START.structureHeight);
    setDiscom(START.discom);
    setName("");
    setPincode("");
    setMobile("");
    setQuoteNo(null);
    setAttempted(false);
    setCallbackSent(false);
    setSendError(null);
    setStep("details");
  }

  /** The visitor and the quotation they see, in the CRM's values. */
  function buildQuote(mode: PaymentMode | null = paymentMode) {
    const floorOpt = FLOOR_OPTIONS.find((o) => o.label === floor);
    const heightOpt = STRUCTURE_HEIGHT_OPTIONS.find((o) => o.label === structureHeight);
    const discomOpt = DISCOM_OPTIONS.find((o) => o.label === discom);
    const calc = computeQuotationNumbers(floor, structureHeight, discom, category);
    // A callback shows no price: only the charges of options that have one are sent.
    const priced = !needsCallback;
    return {
      customer: {
        name: name.trim(),
        phone: mobile,
        pincode,
      },
      quotation: {
        subsidy_category: category ?? undefined,
        discom: discomOpt?.crm,
        floor: floorOpt?.crm,
        structure_height: heightOpt?.crm,
        base_price: calc.standardPrice,
        floor_charge: floorOpt && !("custom" in floorOpt) ? calc.floorCost : undefined,
        height_charge: heightOpt && !("custom" in heightOpt) ? calc.heightCost : undefined,
        discom_charge: discomOpt && !("custom" in discomOpt) ? calc.meterCost : undefined,
        total: priced ? calc.finalPrice : undefined,
        subsidy_amount: calc.totalSubsidy,
        customer_pays: priced ? calc.effectiveCost : undefined,
        needs_callback: needsCallback,
        // Only the priced quotation has a sheet, so only it has a payment mode.
        // The key stays in the request as the contract has it: 0 in every priced quotation, as nothing is paid at booking.
        booking_amount: priced ? 0 : undefined,
        payment_mode: priced && mode ? PAYMENT_MODE_VALUES[mode] : undefined,
        loan: priced ? loanFigures(mode, calc) : undefined,
      },
    };
  }

  /** Sends the quotation to the CRM, unless this exact one was already sent. */
  async function sendQuote(
    options: { keepalive?: boolean; paymentMode?: PaymentMode | null } = {}
  ): Promise<PostResult | "unchanged"> {
    const quote = buildQuote(options.paymentMode === undefined ? paymentMode : options.paymentMode);
    const key = JSON.stringify(quote);
    if (key === lastSentRef.current) return "unchanged";
    lastSentRef.current = key;

    // A quote number belongs to one answer: none is shown until the answer to this send has come.
    const turn = (sendTurnRef.current += 1);
    setQuoteNo(null);
    const result = await postJson(
      "/api/quote",
      { submission_id: newSubmissionId(), ...quote, meta: buildMeta(), website },
      { keepalive: options.keepalive }
    );
    if (turn === sendTurnRef.current) {
      const issued = result.body?.quote_no;
      setQuoteNo(isConfirmed(result) && typeof issued === "string" && QUOTE_NO_PATTERN.test(issued) ? issued : null);
    }
    if (isConfirmed(result)) {
      confirmedRef.current = key;
    } else if (lastSentRef.current === key) {
      // A send that did not go through is forgotten, so the next action tries again.
      lastSentRef.current = null;
    }
    return result;
  }

  const quotationShowing = sheet.state === "open" && step === "quotation" && !callbackSent;

  // The visitor may download the PDF and leave: send the last numbers they saw.
  // Only while the quotation step shows: nothing is sent before the main button was pressed.
  const onPageHidden = useEffectEvent(() => {
    void sendQuote({ keepalive: true });
  });

  useEffect(() => {
    if (!quotationShowing) return;
    const listener = () => {
      if (document.visibilityState === "hidden") onPageHidden();
    };
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, [quotationShowing]);

  /** The main button of the details step. */
  async function handleActionClick() {
    if (sendingRef.current) return;
    if (!allReady) {
      setAttempted(true);
      return;
    }

    setAttempted(false);
    setSendError(null);

    if (needsCallback) {
      // The thank-you promises a call back, so it waits until the CRM confirmed.
      sendingRef.current = true;
      setSending(true);
      const result = await sendQuote();
      sendingRef.current = false;
      setSending(false);
      const confirmed =
        result === "unchanged" ? confirmedRef.current === JSON.stringify(buildQuote()) : isConfirmed(result);
      if (confirmed) {
        setCallbackSent(true);
      } else {
        setSendError(result !== "unchanged" && result.status === 429 ? "rate" : "general");
      }
      return;
    }

    // The quotation opens whether or not the CRM call succeeds. The server logs failures.
    // The quotation step opens with the first payment mode chosen, so this first call carries cash.
    setPaymentMode("cash");
    void sendQuote({ paymentMode: "cash" });
    setStep("quotation");
  }

  /** The bar's button: the sheet opens at the details step. */
  function openSheet() {
    setStep("details");
    sheet.show();
  }

  /** Close, Escape or the scrim. */
  function closeSheet() {
    if (callbackSent) {
      // Closing the thank-you resets the form, as the reset button did before.
      sheet.hide(reset);
      return;
    }
    // Sends again only when the payment mode changed on the quotation step.
    if (step === "quotation") void sendQuote();
    sheet.hide();
  }

  /** "Back" on the quotation step returns to the details. */
  function backToDetails() {
    void sendQuote();
    setStep("details");
  }

  /** "Book my system" on the quotation step leaves the page: the last numbers are sent first. */
  function leaveForBooking() {
    void sendQuote({ keepalive: true });
  }

  function changeFloor(value: FloorOption) {
    setFloor(value);
    setCallbackSent(false);
  }
  function changeHeight(value: StructureHeight) {
    setStructureHeight(value);
    setCallbackSent(false);
  }
  function changeDiscom(value: DiscomOption) {
    setDiscom(value);
    setCallbackSent(false);
  }

  return {
    category,
    setCategory,
    floor,
    structureHeight,
    discom,
    changeFloor,
    changeHeight,
    changeDiscom,
    name,
    setName,
    pincode,
    setPincode,
    mobile,
    setMobile,
    validName,
    validPincode,
    validMobile,
    quoteNo,
    attempted,
    allReady,
    callbackSent,
    needsCallback,
    calc,
    paymentMode,
    setPaymentMode,
    sending,
    sendError,
    website,
    setWebsite,
    step,
    sheetState: sheet.state as SheetState,
    openSheet,
    closeSheet,
    backToDetails,
    leaveForBooking,
    handleActionClick,
  };
}

export type QuotationApi = ReturnType<typeof useQuotationState>;

const QuotationContext = createContext<QuotationApi | null>(null);

export function useQuotation() {
  const value = useContext(QuotationContext);
  if (!value) throw new Error("useQuotation needs a QuotationProvider");
  return value;
}

/** Holds the quotation for both copies of the bar and for the sheet. */
export default function QuotationProvider({ children }: { children: ReactNode }) {
  const quotation = useQuotationState();
  return (
    <QuotationContext.Provider value={quotation}>
      {children}
      <QuotationSheet />
    </QuotationContext.Provider>
  );
}
