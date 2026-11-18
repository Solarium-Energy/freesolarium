/* The quotation for the standard 2.18 kW system: two A4 pages, generated, with nothing to fill in by hand and
   no signatures. Page 1 is the quotation, page 2 what the customer gets.

   This file only draws on the contexts it is given, so it also runs outside a browser. A different
   quotation (other options, other payment modes, another scheme) is a new file like this one, built from
   the same parts in pdfParts.ts. All figures come from app/lib/quotation.ts, the payment details from
   app/lib/payment.ts. */

import { COMPANY_BANK_DETAILS } from "../payment";
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
  computeQuotationNumbers,
  fmtNum,
  optionCharge,
  type PaymentMode,
  type QuotationFormData,
} from "../quotation";
import {
  AmountBlock,
  CheckList,
  DataTable,
  DocHeader,
  FieldRows,
  FootLine,
  Notes,
  OptionBox,
  PageHeader,
  PaymentDetails,
  SideBySide,
  StatBand,
  TermsBlock,
  TotalRow,
  finishPage,
  gap,
  newDoc,
  type AmountRow,
  type LogoImage,
} from "./pdfParts";

export type Quotation218Input = {
  data: QuotationFormData;
  paymentMode: PaymentMode | null;
  /** The quote number the CRM issued, or null: then it is left out. The website never makes one. */
  quoteNo: string | null;
  quoteDate: string;
  /** The Solarium logo, or null when it could not be loaded. */
  logo: LogoImage | null;
  /** Solarium's payment QR, or null when it could not be loaded. */
  qr: LogoImage | null;
};

const rupees = (amount: number) => `₹${fmtNum(amount)}`;

/** The value of the structure's row in the table of page 2: the height chosen, or "As per site". */
function structureQty(height: string) {
  const metres = /^(\d+(?:\.\d+)?) m$/.exec(height);
  return metres ? `Height of ${metres[1]} mtr.` : "As per site";
}

/** Page 1: the quotation. */
function drawPage1(ctx: CanvasRenderingContext2D, input: Quotation218Input) {
  const { data, quoteNo, quoteDate, logo, qr } = input;
  const calc = computeQuotationNumbers(data.floor, data.structureHeight, data.discom);
  const mode: PaymentMode = input.paymentMode ?? "cash";
  const doc = newDoc(ctx);

  DocHeader(doc, {
    logo,
    fallbackName: "Solarium",
    scheme: ["PM Surya Ghar:", "Muft Bijli Yojana"],
    title: "2.18 kW system quotation",
    refs: [],
  });
  gap(doc);

  FieldRows(doc, [
    [
      { label: "Name", value: data.name, span: 2 },
      { label: "Mobile", value: data.mobile, span: 1 },
    ],
    [
      { label: "PIN code", value: data.pincode },
      { label: "Category", value: data.category === "sc-st" ? "SC / ST" : "General" },
      { label: "DISCOM", value: data.discom },
    ],
    [
      ...(quoteNo ? [{ label: "Quote no.", value: quoteNo }] : []),
      { label: "Date", value: quoteDate },
      { label: "Valid for 15 days", value: "", plain: true },
    ],
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

  // The price in three blocks: what is paid, what comes back, and the effective cost.
  SideBySide(doc, [
    {
      weight: 380,
      draw: (part) =>
        AmountBlock(part, {
          title: "What you pay",
          rows: [
            { label: "System price 2.18 kW", amount: rupees(SYSTEM_PRICE) },
            { label: "Special discount", amount: `− ${rupees(SPECIAL_DISCOUNT)}`, tone: "less" },
            { label: "Standard system", amount: rupees(STANDARD_PRICE), tone: "strong" },
            { label: `(1) Floor, ${data.floor}`, amount: optionCharge(FLOOR_SHEET_OPTIONS.find((o) => o.label === data.floor)) },
            {
              label: `(2) Structure height, ${data.structureHeight}`,
              amount: optionCharge(HEIGHT_SHEET_OPTIONS.find((o) => o.label === data.structureHeight)),
            },
            { label: `(3) Meter charges, ${data.discom}`, amount: optionCharge(DISCOM_SHEET_OPTIONS.find((o) => o.label === data.discom)) },
            {
              label: "Upfront payment (including 5-year solar system insurance)",
              note: `${rupees(STANDARD_PRICE)} + (1) + (2) + (3)`,
              amount: rupees(calc.finalPrice),
              tone: "strong",
            },
          ],
        }),
    },
    {
      weight: 326,
      draw: (part) => {
        AmountBlock(part, {
          title: "What comes back to your bank account",
          positive: true,
          rows: [
            { label: "Central Govt subsidy (credited later)", amount: rupees(CENTRAL_SUBSIDY) },
            { label: "Gujarat Govt subsidy (credited later)", amount: rupees(GUJARAT_SUBSIDY) },
            { label: "Total subsidy", amount: rupees(TOTAL_SUBSIDY), tone: "strong" },
          ],
          footnote: "100% subsidy credited to bank *First 3 lakh households",
        });
        gap(part);
        TotalRow(part, { label: "Effective cost after subsidy*", note: "(1) + (2) + (3)", amount: rupees(calc.cash.netAfterSubsidy) });
      },
    },
  ]);
  gap(doc);

  const terms: Record<PaymentMode, { mode: string; rows: AmountRow[]; total: { label: string; note: string; amount: string } }> = {
    cash: {
      mode: "Cheque / NEFT / IMPS / UPI / RTGS",
      rows: [
        { label: "Booking amount", amount: rupees(BOOKING_AMOUNT) },
        { label: "Before dispatch", note: `Upfront payment − ${rupees(BOOKING_AMOUNT)}`, amount: rupees(calc.cash.beforeDispatch) },
      ],
      total: { label: "Net cost after subsidy*", note: "(1)+(2)+(3)", amount: rupees(calc.cash.netAfterSubsidy) },
    },
    nbfc: {
      mode: "NBFC loan",
      rows: [
        { label: "Down payment 0%", amount: "₹0" },
        { label: `Loan amount 100% (base ${rupees(NBFC_BASE_LOAN)})`, note: "100% of final price", amount: rupees(calc.nbfc.loanAmount) },
        { label: "Loan tenure", amount: "5 years (60 months)" },
        { label: "Estimated monthly EMI", note: `${rupees(NBFC_BASE_EMI)} + on add-ons`, amount: rupees(calc.nbfc.emi) },
        { label: "Total estimated interest in 3 EMIs", note: `${rupees(NBFC_BASE_INTEREST)} + on add-ons`, amount: rupees(calc.nbfc.interest) },
      ],
      total: { label: "Net cost after subsidy*", note: "(1)+(2)+(3)+interest", amount: rupees(calc.nbfc.netAfterSubsidy) },
    },
  };
  TermsBlock(doc, {
    title: "Payment mode & terms",
    ...terms[mode],
    footnote: "*After the subsidy is credited to your bank account. Subject to eligibility and scheme terms.",
  });
  gap(doc);

  PaymentDetails(doc, {
    qr,
    qrCaption: "Payment QR",
    title: "Company bank details",
    rows: COMPANY_BANK_DETAILS,
    note: "Please pay only after Solarium has confirmed your order.",
  });

  FootLine(doc, "This is a digitally generated quotation. It needs no signature.");
  finishPage(doc);
  return doc.y;
}

/** Page 2: what the customer gets. */
function drawPage2(ctx: CanvasRenderingContext2D, input: Quotation218Input) {
  const { data, quoteNo, logo } = input;
  const doc = newDoc(ctx);

  PageHeader(doc, {
    logo,
    fallbackName: "Solarium",
    title: "What you get with your 2.18 kW system",
    refs: quoteNo ? [{ label: "Quote no.", value: quoteNo }] : [],
  });
  gap(doc);

  DataTable(doc, {
    columns: [
      { label: "Description", weight: 190 },
      { label: "Specification", weight: 200 },
      { label: "Qty", weight: 106 },
      { label: "Brand", weight: 150 },
      { label: "Warranty", weight: 84 },
    ],
    rows: [
      ["Smart Solar PV Modules", "Bifacial P Type - 545 WP", "4", "STT", "30 Years"],
      ["Solar Inverter", "1 Phase - 2.3KW", "1", "STT", "10 Years"],
      ["ACDB/DCDB", "As per MNRE Guidelines", "1", "Eaton / HPL / CNS / L&T", "5 Years"],
      [
        "Solar Structure",
        "As per MNRE standards (Hot Dip GI with premium hardware)",
        structureQty(data.structureHeight),
        "Solarium Trusted Technology",
        "",
      ],
      ["MC4 Connector", "As per MNRE Guidelines", "2 Set", "Dhash PV", ""],
      ["Earthing Rod/Bag/Lightning Arrestor", "Copper Coated 14 mm (01 mtr)", "1 Set", "iTorrent", ""],
      ["PVC Pipe and Fittings", "25 mm", "50 mtr", "Solarium Trusted Technology", ""],
      ["Red & Black DC Cables", "CU 1 Core 4 SQ MM", "20 mtr", "Polycab/Johnson", ""],
      ["AC Cable", "CU 2 Core 4 SQ MM", "10 mtr.", "Polycab/Johnson", ""],
      ["Earthing Cable", "CU 1 Core 2.5 SQ MM", "25 mtr.", "Polycab/Johnson", ""],
      ["LA Earthing Cable", "Al 1 Core 16 SQ MM", "12 mtr.", "Genome/Johnson", ""],
      ["Ladder + Walkway", "As per MNRE Guidelines", "Not Included", "Solarium Trusted Technology", ""],
    ],
  });
  gap(doc, 16);

  Notes(doc, {
    heading: "Notes",
    items: [
      "Standard system includes 2.18 kW solar panels (545 Wp Solarium brand × 4 panels) and inverter, 0.5 m front-leg structure, G+1 cabling, installation and commissioning, subsidy support and 5 years solar insurance.",
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
  gap(doc, 16);

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

/** The pages of the quotation, in order. Each draws on a context already scaled to the page's own units and
    returns where its last part ended. */
export const QUOTATION_218_PAGES = [drawPage1, drawPage2] as const;
