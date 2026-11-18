/* The quotation for the standard 2.18 kW system: the parts in order, with their words and figures.

   This file only draws on the context it is given, so it also runs outside a browser. A different
   quotation (other options, other payment modes, another scheme) is a new file like this one, built from
   the same parts in pdfParts.ts. All figures come from app/lib/quotation.ts. */

import {
  BANK_BASE_EMI,
  BANK_BASE_INTEREST,
  BANK_BASE_LOAN,
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
  computeQuotationNumbers,
  fmtNum,
  type PaymentMode,
  type QuotationFormData,
} from "../quotation";
import {
  CheckList,
  DocHeader,
  FieldRows,
  Notes,
  OptionBox,
  PaymentColumns,
  PriceBlock,
  SideBySide,
  SignatureLines,
  StatBand,
  finishPage,
  gap,
  newDoc,
  type LogoImage,
} from "./pdfParts";

export type Quotation218Input = {
  data: QuotationFormData;
  paymentMode: PaymentMode | null;
  quoteNo: string;
  quoteDate: string;
  /** The Solarium logo, or null when it could not be loaded. */
  logo: LogoImage | null;
};

const rupees = (amount: number) => `₹${fmtNum(amount)}`;

/** Draws the whole quotation on a context already scaled to the page's own units. */
export function drawQuotation218(ctx: CanvasRenderingContext2D, input: Quotation218Input) {
  const { data, paymentMode, quoteNo, quoteDate, logo } = input;
  const calc = computeQuotationNumbers(data.floor, data.structureHeight, data.discom);
  const isCash = paymentMode === "cash";
  const isBank = paymentMode === "bank";
  const isNbfc = paymentMode === "nbfc";
  const doc = newDoc(ctx);

  DocHeader(doc, {
    logo,
    fallbackName: "Solarium",
    scheme: ["PM Surya Ghar:", "Muft Bijli Yojana"],
    eyebrow: "Rooftop solar · Vejalpur, Ahmedabad",
    title: "2.18 kW system quotation",
    refs: [
      { label: "Quote no.", value: quoteNo },
      { label: "Date", value: quoteDate },
    ],
  });
  gap(doc);

  FieldRows(doc, [
    [
      { label: "Customer name (as per electricity bill)", value: data.customerNameBill, span: 2 },
      { label: "Mobile", value: data.mobile, span: 1 },
    ],
    [
      { label: "Customer name (as per bank account)", value: data.customerNameBank, span: 2 },
      { label: "Consumer no.", value: data.consumerNo, span: 1 },
    ],
    [{ label: "Address", value: data.address }],
  ]);
  gap(doc);

  SideBySide(doc, [
    {
      weight: 205,
      draw: (part) =>
        OptionBox(part, {
          title: "1 · Floor (cable)",
          note: "G+1 included",
          columns: 1,
          options: FLOOR_SHEET_OPTIONS.map((option) => ({
            label: option.label,
            price: option.displayPrice,
            ticked: data.floor === option.label,
            included: option.isIncluded,
          })),
        }),
    },
    {
      weight: 295,
      draw: (part) =>
        OptionBox(part, {
          title: "2 · Front-leg structure height",
          note: "0.5 m incl.",
          columns: 2,
          options: HEIGHT_SHEET_OPTIONS.map((option) => ({
            label: option.label,
            price: option.displayPrice,
            ticked: data.structureHeight === option.label,
            included: option.isIncluded,
          })),
        }),
    },
    {
      weight: 206,
      draw: (part) =>
        OptionBox(part, {
          title: "3 · Meter charges",
          note: "by DISCOM",
          columns: 1,
          options: DISCOM_SHEET_OPTIONS.map((option) => ({
            label: option.label,
            price: option.displayPrice,
            ticked: data.discom === option.label,
          })),
        }),
    },
  ]);
  gap(doc);

  PriceBlock(doc, {
    title: "Final price (including 5-year solar system insurance)",
    note: `${rupees(STANDARD_PRICE)} + (1) + (2) + (3)`,
    left: [
      { label: "System price 2.18 kW", amount: rupees(SYSTEM_PRICE) },
      { label: "Special discount", amount: `− ${rupees(SPECIAL_DISCOUNT)}`, tone: "less" },
      { label: "Standard system (upfront)", amount: rupees(STANDARD_PRICE), tone: "strong" },
      { label: "Central Govt subsidy (credited later)", amount: rupees(CENTRAL_SUBSIDY), tone: "less" },
      { label: "Gujarat Govt subsidy (credited later)", amount: rupees(GUJARAT_SUBSIDY), tone: "less" },
    ],
    right: [
      { label: "(1) Floor", prefix: "+  ₹", value: fmtNum(calc.floorCost) },
      { label: "(2) Structure height", prefix: "+  ₹", value: fmtNum(calc.heightCost) },
      { label: "(3) Meter charges", prefix: "+  ₹", value: fmtNum(calc.meterCost) },
    ],
    total: { label: "Final price", prefix: "₹", value: fmtNum(calc.finalPrice) },
  });
  gap(doc);

  PaymentColumns(doc, {
    title: "Payment mode & terms",
    note: "tick one",
    columns: [
      {
        name: "Without loan",
        chosen: isCash,
        rows: [
          { label: "Booking amount", value: rupees(BOOKING_AMOUNT) },
          {
            label: "Before dispatch",
            hint: `Final price − ${rupees(BOOKING_AMOUNT)}`,
            fill: { prefix: "₹", value: isCash ? fmtNum(calc.cash.beforeDispatch) : null },
          },
          { label: "Loan / EMI / interest", value: "-" },
        ],
        net: {
          label: "Net cost after subsidy",
          hint: "(1)+(2)+(3)",
          prefix: "₹",
          value: isCash ? fmtNum(calc.cash.netAfterSubsidy) : null,
        },
      },
      {
        name: "Nationalised bank loan",
        chosen: isBank,
        rows: [
          {
            label: `Down payment 10% (base ${rupees(STANDARD_PRICE * 0.1)})`,
            hint: "10% of final price",
            fill: { prefix: "₹", value: isBank ? fmtNum(calc.bank.downPayment) : null },
          },
          {
            label: `Loan amount 90% (base ${rupees(BANK_BASE_LOAN)})`,
            hint: "90% of final price",
            fill: { prefix: "₹", value: isBank ? fmtNum(calc.bank.loanAmount) : null },
          },
          { label: "Loan tenure", value: "5 years (60 months)" },
          {
            label: "Estimated monthly EMI",
            hint: `${rupees(BANK_BASE_EMI)} + on add-ons`,
            fill: { prefix: "₹", value: isBank ? fmtNum(calc.bank.emi) : null },
          },
          {
            label: "Total estimated interest in 3 EMIs",
            hint: `${rupees(BANK_BASE_INTEREST)} + on add-ons`,
            fill: { prefix: "₹", value: isBank ? fmtNum(calc.bank.interest) : null },
          },
        ],
        net: {
          label: "Net cost after subsidy",
          hint: "(1)+(2)+(3)+interest",
          prefix: "₹",
          value: isBank ? fmtNum(calc.bank.netAfterSubsidy) : null,
        },
      },
      {
        name: "NBFC loan",
        chosen: isNbfc,
        rows: [
          { label: "Down payment 0%", value: "₹0" },
          {
            label: `Loan amount 100% (base ${rupees(NBFC_BASE_LOAN)})`,
            hint: "100% of final price",
            fill: { prefix: "₹", value: isNbfc ? fmtNum(calc.nbfc.loanAmount) : null },
          },
          { label: "Loan tenure", value: "5 years (60 months)" },
          {
            label: "Estimated monthly EMI",
            hint: `${rupees(NBFC_BASE_EMI)} + on add-ons`,
            fill: { prefix: "₹", value: isNbfc ? fmtNum(calc.nbfc.emi) : null },
          },
          {
            label: "Total estimated interest in 3 EMIs",
            hint: `${rupees(NBFC_BASE_INTEREST)} + on add-ons`,
            fill: { prefix: "₹", value: isNbfc ? fmtNum(calc.nbfc.interest) : null },
          },
        ],
        net: {
          label: "Net cost after subsidy",
          hint: "(1)+(2)+(3)+interest",
          prefix: "₹",
          value: isNbfc ? fmtNum(calc.nbfc.netAfterSubsidy) : null,
        },
      },
    ],
    closing: [{ label: "Amount received  ₹" }, { label: "Payment ref. no." }],
  });
  gap(doc);

  Notes(doc, {
    heading: "Notes",
    items: [
      "Standard system includes 2.18 kW solar panels (545 Wp Solarium brand × 4 panels) and inverter, 0.5 m front-leg structure, ground floor / G+1 cabling, installation and commissioning, subsidy support and 5 years solar insurance.",
      "Subsidy is subject to eligibility and government approval. Add-ons (1)+(2)+(3) are included in the loan.",
      "Subsidy is estimated to be repaid in the 4th month of installation; estimated interest covers the 3 EMIs before that.",
      "Any change in DISCOM (UGVCL / Torrent) or government charges will apply at actuals.",
      "If the name on the electricity bill and the bank account is different, a name change is required.",
    ],
  });
  gap(doc);

  CheckList(doc, {
    title: "Documents required",
    items: ["Electricity bill", "Bank passbook", "Aadhaar card", "PAN card", "House photo", "Rooftop photo"].map((label) => ({
      label,
      ticked: false,
    })),
  });
  gap(doc, 40);

  SignatureLines(doc, {
    lines: [{ caption: "Customer signature" }, { caption: "Sales person (name & signature)" }],
  });
  gap(doc);

  StatBand(doc, {
    stats: [
      { value: "25,000+", caption: "homes solarised" },
      { value: "Since 2018", caption: "in rooftop solar" },
      { value: "BSE listed", caption: "company" },
      { value: "Free 5-year", caption: "solar insurance" },
    ],
  });

  finishPage(doc);
  return doc.y;
}
