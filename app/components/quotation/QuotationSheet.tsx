"use client";

import { ArrowRight, Download, PhoneCall } from "lucide-react";
import { useState, type ReactNode } from "react";
import { inr, site } from "../../lib/content";
import { useLanguage } from "../../lib/language";
import {
  BOOKING_AMOUNT,
  CENTRAL_SUBSIDY,
  DISCOM_SHEET_OPTIONS,
  FLOOR_SHEET_OPTIONS,
  GUJARAT_SUBSIDY,
  HEIGHT_SHEET_OPTIONS,
  SPECIAL_DISCOUNT,
  STANDARD_PRICE,
  SYSTEM_PRICE,
  fmtNum,
  type PaymentMode,
} from "../../lib/quotation";
import { generateQuotationPdfBlob } from "../../lib/quotationPdf";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import ChoiceCard from "../ui/ChoiceCard";
import { Field, Input } from "../ui/Field";
import FormSteps from "../ui/FormSteps";
import PriceTable, { type PriceRow } from "../ui/PriceTable";
import ResultScreen from "../ui/ResultScreen";
import Sheet from "../ui/Sheet";
import { useQuotation } from "./QuotationProvider";

const MODES: { mode: PaymentMode; title: string }[] = [
  { mode: "cash", title: "Without loan" },
  { mode: "bank", title: "Nationalised bank loan" },
  { mode: "nbfc", title: "NBFC loan" },
];

/** An option's price as today's lists show it: "Included", or the charge that is added. */
function optionCharge(option: { displayPrice: string; extra: number; isIncluded?: boolean } | undefined) {
  if (!option) return "-";
  if (option.isIncluded) return option.displayPrice;
  return option.extra > 0 ? `+ ${option.displayPrice}` : option.displayPrice;
}

/** The three steps of the quotation: the bar (done), the details, the quotation. */
export default function QuotationSheet() {
  const q = useQuotation();
  const { isGu } = useLanguage();

  const result = q.callbackSent;
  const onQuotation = !result && q.step === "quotation";
  const steps = isGu ? ["તમારી છત", "તમારી વિગતો", "ક્વોટેશન"] : ["Your roof", "Your details", "Quotation"];
  const backLabel = isGu ? "પાછા" : "Back";
  const closeLabel = isGu ? "બંધ કરો" : "Close";

  let footer: ReactNode = null;
  if (onQuotation) {
    footer = <QuotationFooter backLabel={backLabel} />;
  } else if (!result) {
    footer = (
      <>
        <Button variant="outline" size="lg" onClick={() => q.closeSheet()}>
          {backLabel}
        </Button>
        <Button variant="primary" size="lg" loading={q.sending} onClick={() => void q.handleActionClick()}>
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
      </>
    );
  }

  return (
    <Sheet
      state={q.sheetState}
      onClose={q.closeSheet}
      titleId="quotation-sheet-title"
      title={
        onQuotation
          ? isGu
            ? "કિંમતની વિગતવાર માહિતી ડાઉનલોડ કરો"
            : "Download detailed pricing"
          : isGu
            ? "ગ્રાહકની વિગતો"
            : "Customer details"
      }
      closeLabel={closeLabel}
      above={result ? undefined : <FormSteps steps={steps} current={onQuotation ? 2 : 1} />}
      footer={footer}
      stepKey={result ? "result" : q.step}
      className="q-sheet"
    >
      {result ? (
        <ResultScreen
          title={isGu ? "આભાર" : "Thank you"}
          action={
            <Button variant="primary" size="lg" onClick={() => q.closeSheet()}>
              {closeLabel}
            </Button>
          }
        >
          {isGu ? "સોલારિયમ ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે." : "The Solarium team will reach out to you shortly."}
        </ResultScreen>
      ) : onQuotation ? (
        <QuotationStep />
      ) : (
        <DetailsStep />
      )}
    </Sheet>
  );
}

function DetailsStep() {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const missing = q.attempted && !q.allReady;

  return (
    <form
      className="q-details"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void q.handleActionClick();
      }}
    >
      <Field id="q-name-bill" label={isGu ? "નામ (બિલ મુજબ)" : "Name (on bill)"}>
        <Input
          id="q-name-bill"
          large
          type="text"
          autoComplete="name"
          invalid={q.attempted && !q.validNameBill}
          value={q.customerNameBill}
          onChange={(e) => q.setCustomerNameBill(e.target.value)}
        />
      </Field>
      <Field id="q-name-bank" label={isGu ? "નામ (બેંક મુજબ)" : "Name (in bank)"}>
        <Input
          id="q-name-bank"
          large
          type="text"
          invalid={q.attempted && !q.validNameBank}
          value={q.customerNameBank}
          onChange={(e) => q.setCustomerNameBank(e.target.value)}
        />
      </Field>
      <Field id="q-address" label={isGu ? "સરનામું" : "Address"}>
        <Input
          id="q-address"
          large
          type="text"
          autoComplete="street-address"
          invalid={q.attempted && !q.validAddress}
          value={q.address}
          onChange={(e) => q.setAddress(e.target.value)}
        />
      </Field>
      <Field id="q-mobile" label={isGu ? "મોબાઈલ (10 અંક)" : "Mobile (10 digits)"}>
        <Input
          id="q-mobile"
          large
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          invalid={q.attempted && !q.validMobile}
          value={q.mobile}
          onChange={(e) => q.setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
      </Field>
      <Field id="q-consumer" label={isGu ? "ગ્રાહક નંબર" : "Consumer No."}>
        <Input
          id="q-consumer"
          large
          type="text"
          invalid={q.attempted && !q.validConsumerNo}
          value={q.consumerNo}
          onChange={(e) => q.setConsumerNo(e.target.value)}
        />
      </Field>

      {/* Left empty by people. Bots that fill it are answered without sending anything. */}
      <input
        type="text"
        name="website"
        value={q.website}
        onChange={(e) => q.setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      {q.sendError ? (
        <Alert meaning="negative" role="alert">
          {q.sendError === "rate" ? (
            isGu ? (
              <>
                <b>અત્યારે ઘણી બધી વિનંતીઓ આવી છે.</b> કૃપા કરીને થોડી મિનિટો પછી ફરી પ્રયાસ કરો અથવા{" "}
                <a href={site.phoneHref}>8003080020</a> પર કૉલ કરો.
              </>
            ) : (
              <>
                <b>Too many requests right now.</b> Please try again in a few minutes or call{" "}
                <a href={site.phoneHref}>8003080020</a>.
              </>
            )
          ) : isGu ? (
            <>
              <b>અમે તમારી વિનંતી સબમિટ કરી શક્યા નથી.</b> કૃપા કરીને <a href={site.phoneHref}>8003080020</a> પર કૉલ કરો.
            </>
          ) : (
            <>
              <b>We could not submit your request.</b> Please call <a href={site.phoneHref}>8003080020</a>.
            </>
          )}
        </Alert>
      ) : (
        missing && (
          <Alert meaning="attention" role="alert">
            {isGu
              ? "આગળ વધવા માટે ઉપરની હાઇલાઇટ કરેલી વિગતો પૂર્ણ કરો"
              : "Complete the highlighted fields above to continue"}
          </Alert>
        )
      )}
    </form>
  );
}

/* The quotation step's labels are English in both languages, as on the paper form and in the PDF. */
function QuotationStep() {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const calc = q.calc;

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const quoteNo = `SOL-${q.mobile ? q.mobile.slice(-4) : "2180"}`;

  const priceRows: PriceRow[] = [
    { label: "System price 2.18 kW", value: inr(SYSTEM_PRICE) },
    { label: "Special discount", value: `− ${inr(SPECIAL_DISCOUNT)}`, kind: "less" },
    { label: "Standard system (upfront)", value: inr(STANDARD_PRICE), kind: "sum" },
    { label: `(1) Floor, ${q.floor}`, value: optionCharge(FLOOR_SHEET_OPTIONS.find((o) => o.label === q.floor)) },
    {
      label: `(2) Structure height, ${q.structureHeight}`,
      value: optionCharge(HEIGHT_SHEET_OPTIONS.find((o) => o.label === q.structureHeight)),
    },
    { label: `(3) Meter charges, ${q.discom}`, value: optionCharge(DISCOM_SHEET_OPTIONS.find((o) => o.label === q.discom)) },
    {
      label: "Final price (including 5-year solar system insurance)",
      note: "₹97,290 + (1) + (2) + (3)",
      value: `₹${fmtNum(calc.finalPrice)}`,
      kind: "sum",
    },
    { label: "Central Govt subsidy (credited later)", value: inr(CENTRAL_SUBSIDY), kind: "less" },
    { label: "Gujarat Govt subsidy (credited later)", value: inr(GUJARAT_SUBSIDY), kind: "less" },
  ];

  const termRows: Record<PaymentMode, PriceRow[]> = {
    cash: [
      { label: "Booking amount", value: inr(BOOKING_AMOUNT) },
      { label: "Before dispatch", note: "Final price − ₹10,000", value: `₹${fmtNum(calc.cash.beforeDispatch)}` },
      { label: "Loan / EMI / interest", value: "-" },
      { label: "Net cost after subsidy", note: "(1)+(2)+(3)", value: `₹${fmtNum(calc.cash.netAfterSubsidy)}`, kind: "total" },
    ],
    bank: [
      { label: "Down payment 10% (base ₹9,729)", note: "10% of final price", value: `₹${fmtNum(calc.bank.downPayment)}` },
      { label: "Loan amount 90% (base ₹87,561)", note: "90% of final price", value: `₹${fmtNum(calc.bank.loanAmount)}` },
      { label: "Loan tenure", value: "5 years (60 months)" },
      { label: "Estimated monthly EMI", note: "₹1,715 + on add-ons", value: `₹${fmtNum(calc.bank.emi)}` },
      { label: "Total estimated interest in 3 EMIs", note: "₹1,310 + on add-ons", value: `₹${fmtNum(calc.bank.interest)}` },
      {
        label: "Net cost after subsidy",
        note: "(1)+(2)+(3)+interest",
        value: `₹${fmtNum(calc.bank.netAfterSubsidy)}`,
        kind: "total",
      },
    ],
    nbfc: [
      { label: "Down payment 0%", value: "₹0" },
      { label: "Loan amount 100% (base ₹97,290)", note: "100% of final price", value: `₹${fmtNum(calc.nbfc.loanAmount)}` },
      { label: "Loan tenure", value: "5 years (60 months)" },
      { label: "Estimated monthly EMI", note: "₹2,351 + on add-ons", value: `₹${fmtNum(calc.nbfc.emi)}` },
      { label: "Total estimated interest in 3 EMIs", note: "₹3,780 + on add-ons", value: `₹${fmtNum(calc.nbfc.interest)}` },
      {
        label: "Net cost after subsidy",
        note: "(1)+(2)+(3)+interest",
        value: `₹${fmtNum(calc.nbfc.netAfterSubsidy)}`,
        kind: "total",
      },
    ],
  };
  const mode = q.paymentMode ?? "cash";

  return (
    <div className="q-quote">
      <dl className="kv">
        <dt>Name (on bill)</dt>
        <dd>{q.customerNameBill}</dd>
        <dt>Mobile</dt>
        <dd>{q.mobile}</dd>
        <dt>Consumer No.</dt>
        <dd>{q.consumerNo}</dd>
        <dt>Your category</dt>
        {/* The category and its note are the bar's own words, so they follow the language. */}
        <dd>
          {q.category === "sc-st" ? "SC / ST" : isGu ? "સામાન્ય (General)" : "General"}
          <span className="kv-note">
            {q.category === "sc-st"
              ? isGu
                ? "વધારે સબસિડી"
                : "Enhanced subsidy"
              : isGu
                ? "સામાન્ય સબસિડી"
                : "Standard subsidy"}
          </span>
        </dd>
        <dt>Quote no.</dt>
        <dd>{quoteNo}</dd>
        <dt>Date</dt>
        <dd>{todayStr}</dd>
      </dl>

      <PriceTable rows={priceRows} />
      <small className="fine">
        {isGu ? "100% સબસિડી સીધી બેંકમાં *પ્રથમ 3 લાખ પરિવારો માટે" : "100% subsidy credited to bank *First 3 lakh households"}
      </small>

      <div className="q-pay">
        <h4 id="q-pay-title">Payment mode &amp; terms</h4>
        <div className="q-modes" role="group" aria-labelledby="q-pay-title">
          {MODES.map((item) => (
            <ChoiceCard key={item.mode} title={item.title} on={mode === item.mode} onSelect={() => q.setPaymentMode(item.mode)} />
          ))}
        </div>
        <PriceTable rows={termRows[mode]} />
      </div>
    </div>
  );
}

function QuotationFooter({ backLabel }: { backLabel: string }) {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const todayStr = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const quoteNo = `SOL-${q.mobile ? q.mobile.slice(-4) : "2180"}`;
      const data = {
        category: q.category,
        floor: q.floor,
        structureHeight: q.structureHeight,
        discom: q.discom,
        customerNameBill: q.customerNameBill,
        customerNameBank: q.customerNameBank,
        address: q.address,
        mobile: q.mobile,
        consumerNo: q.consumerNo,
      };
      const pdfBlob = await generateQuotationPdfBlob(data, q.paymentMode, quoteNo, todayStr);
      const url = URL.createObjectURL(pdfBlob);
      const safeName = (data.customerNameBill || "Customer")
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "-");
      const a = document.createElement("a");
      a.href = url;
      a.download = `Solarium-Quotation-2.18kW-${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="lg" onClick={() => q.backToDetails()}>
        {backLabel}
      </Button>
      <Button variant="outline" size="lg" href="/book" onClick={() => q.leaveForBooking()}>
        {isGu ? "મારી સિસ્ટમ બુક કરો" : "Book my system"}
      </Button>
      <Button variant="primary" size="lg" loading={downloading} onClick={() => void handleDownloadPdf()}>
        {downloading ? (
          "Generating PDF…"
        ) : (
          <>
            <Download className="ico" aria-hidden="true" />
            Download Quotation PDF
          </>
        )}
      </Button>
    </>
  );
}
