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
  NBFC_BASE_EMI,
  NBFC_BASE_INTEREST,
  NBFC_BASE_LOAN,
  SPECIAL_DISCOUNT,
  STANDARD_PRICE,
  SYSTEM_PRICE,
  TOTAL_SUBSIDY,
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
import Sheet, { useSettled } from "../ui/Sheet";
import { useQuotation } from "./QuotationProvider";

const MODES: { mode: PaymentMode; title: string }[] = [
  { mode: "cash", title: "Cheque / NEFT / IMPS / UPI / RTGS" },
  { mode: "nbfc", title: "NBFC loan" },
];

/** Today's date as the quotation shows it. */
function quoteDate() {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

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
    footer = <DetailsFooter backLabel={backLabel} />;
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
      labelId={result ? "quotation-result-title" : undefined}
      className="q-sheet"
    >
      {result ? (
        <ResultScreen
          titleId="quotation-result-title"
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

/* Each step's buttons ignore a press in their first moment: on a double click the second press would
   otherwise land on the button that just took the first one's place. */
function DetailsFooter({ backLabel }: { backLabel: string }) {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const settled = useSettled();
  return (
    <>
      <Button variant="outline" size="lg" onClick={() => settled() && q.closeSheet()}>
        {backLabel}
      </Button>
      <Button variant="primary" size="lg" loading={q.sending} onClick={() => settled() && void q.handleActionClick()}>
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

function DetailsStep() {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const missing = q.attempted && !q.allReady;
  const pincodeError =
    q.attempted && !q.validPincode
      ? isGu
        ? "તમારા PIN કોડના બધા 6 અંક દાખલ કરો."
        : "Enter all 6 digits of your PIN code."
      : undefined;

  return (
    <form
      className="q-details"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void q.handleActionClick();
      }}
    >
      <Field id="q-name" label={isGu ? "પૂરું નામ" : "Full name"}>
        <Input
          id="q-name"
          large
          type="text"
          autoComplete="name"
          invalid={q.attempted && !q.validName}
          value={q.name}
          onChange={(e) => q.setName(e.target.value)}
        />
      </Field>
      <Field id="q-pincode" label={isGu ? "PIN કોડ" : "PIN code"} error={pincodeError}>
        <Input
          id="q-pincode"
          large
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          invalid={Boolean(pincodeError)}
          aria-describedby={pincodeError ? "q-pincode-error" : undefined}
          value={q.pincode}
          onChange={(e) => q.setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
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

/* The quotation step's labels are English in both languages, as in the PDF. Only the category, which is the
   bar's own choice, follows the language. */
function QuotationStep() {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const calc = q.calc;
  const rupees = (amount: number) => `₹${fmtNum(amount)}`;

  // What the visitor pays: the system, the discount, the three extras, and the upfront sum.
  const payRows: PriceRow[] = [
    { label: "System price 2.18 kW", value: inr(SYSTEM_PRICE) },
    { label: "Special discount", value: `− ${inr(SPECIAL_DISCOUNT)}`, kind: "less" },
    { label: "Standard system", value: inr(STANDARD_PRICE), kind: "sum" },
    { label: `(1) Floor, ${q.floor}`, value: optionCharge(FLOOR_SHEET_OPTIONS.find((o) => o.label === q.floor)) },
    {
      label: `(2) Structure height, ${q.structureHeight}`,
      value: optionCharge(HEIGHT_SHEET_OPTIONS.find((o) => o.label === q.structureHeight)),
    },
    { label: `(3) Meter charges, ${q.discom}`, value: optionCharge(DISCOM_SHEET_OPTIONS.find((o) => o.label === q.discom)) },
    {
      label: "Upfront payment (including 5-year solar system insurance)",
      note: `${inr(STANDARD_PRICE)} + (1) + (2) + (3)`,
      value: rupees(calc.finalPrice),
      kind: "sum",
    },
  ];

  // What comes back: the two subsidies and their total.
  const backRows: PriceRow[] = [
    { label: "Central Govt subsidy (credited later)", value: inr(CENTRAL_SUBSIDY) },
    { label: "Gujarat Govt subsidy (credited later)", value: inr(GUJARAT_SUBSIDY) },
    { label: "Total subsidy", value: inr(TOTAL_SUBSIDY), kind: "sum" },
  ];

  const termRows: Record<PaymentMode, PriceRow[]> = {
    cash: [
      { label: "Booking amount", value: inr(BOOKING_AMOUNT) },
      { label: "Before dispatch", note: `Upfront payment − ${inr(BOOKING_AMOUNT)}`, value: rupees(calc.cash.beforeDispatch) },
      { label: "Net cost after subsidy*", note: "(1)+(2)+(3)", value: rupees(calc.cash.netAfterSubsidy), kind: "total" },
    ],
    nbfc: [
      { label: "Down payment 0%", value: "₹0" },
      { label: `Loan amount 100% (base ${rupees(NBFC_BASE_LOAN)})`, note: "100% of final price", value: rupees(calc.nbfc.loanAmount) },
      { label: "Loan tenure", value: "5 years (60 months)" },
      { label: "Estimated monthly EMI", note: `${rupees(NBFC_BASE_EMI)} + on add-ons`, value: rupees(calc.nbfc.emi) },
      { label: "Total estimated interest in 3 EMIs", note: `${rupees(NBFC_BASE_INTEREST)} + on add-ons`, value: rupees(calc.nbfc.interest) },
      {
        label: "Net cost after subsidy*",
        note: "(1)+(2)+(3)+interest",
        value: rupees(calc.nbfc.netAfterSubsidy),
        kind: "total",
      },
    ],
  };
  const mode = q.paymentMode ?? "cash";

  return (
    <div className="q-quote">
      <dl className="kv">
        <dt>Name</dt>
        <dd>{q.name}</dd>
        <dt>Mobile</dt>
        <dd>{q.mobile}</dd>
        <dt>PIN code</dt>
        <dd>{q.pincode}</dd>
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
        {/* The CRM issues the quote number. Until one has come, the line is not shown. */}
        {q.quoteNo && (
          <>
            <dt>Quote no.</dt>
            <dd>{q.quoteNo}</dd>
          </>
        )}
        <dt>Date</dt>
        <dd>
          {quoteDate()}
          <span className="kv-note">Valid for 15 days</span>
        </dd>
      </dl>

      {/* The price in three blocks: what is paid, what comes back, and what it costs in the end. */}
      <section className="pt-block" aria-labelledby="q-block-pay">
        <h4 id="q-block-pay">What you pay</h4>
        <PriceTable rows={payRows} />
      </section>
      <section className="pt-block is-positive" aria-labelledby="q-block-back">
        <h4 id="q-block-back">What comes back to your bank account</h4>
        <PriceTable rows={backRows} />
        <small className="pt-block-note">100% subsidy credited to bank *First 3 lakh households</small>
      </section>
      <PriceTable
        className="is-effective"
        rows={[
          {
            label: "Effective cost after subsidy*",
            note: "(1) + (2) + (3)",
            value: rupees(calc.cash.netAfterSubsidy),
            kind: "total",
          },
        ]}
      />

      <div className="q-pay">
        <h4 id="q-pay-title">Payment mode &amp; terms</h4>
        <div className="q-modes" role="group" aria-labelledby="q-pay-title">
          {MODES.map((item) => (
            <ChoiceCard key={item.mode} title={item.title} on={mode === item.mode} onSelect={() => q.setPaymentMode(item.mode)} />
          ))}
        </div>
        <PriceTable rows={termRows[mode]} />
        <small className="fine">*After the subsidy is credited to your bank account. Subject to eligibility and scheme terms.</small>
      </div>
    </div>
  );
}

function QuotationFooter({ backLabel }: { backLabel: string }) {
  const q = useQuotation();
  const { isGu } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const settled = useSettled();

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const data = {
        category: q.category,
        floor: q.floor,
        structureHeight: q.structureHeight,
        discom: q.discom,
        name: q.name,
        mobile: q.mobile,
        pincode: q.pincode,
      };
      // The quote number the CRM gave, or none: the website never makes one.
      const pdfBlob = await generateQuotationPdfBlob(data, q.paymentMode, q.quoteNo, quoteDate());
      const url = URL.createObjectURL(pdfBlob);
      const safeName = (data.name || "Customer").trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
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
      <Button variant="outline" size="lg" onClick={() => settled() && q.backToDetails()}>
        {backLabel}
      </Button>
      <Button
        variant="outline"
        size="lg"
        href="/book"
        onClick={(event) => {
          if (!settled()) {
            event.preventDefault();
            return;
          }
          q.leaveForBooking();
        }}
      >
        {isGu ? "મારી સિસ્ટમ બુક કરો" : "Book my system"}
      </Button>
      <Button variant="primary" size="lg" loading={downloading} onClick={() => settled() && void handleDownloadPdf()}>
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
