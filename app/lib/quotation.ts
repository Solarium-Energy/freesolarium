/* The quotation's numbers: the figures of each category, the option lists and the calculation. The bar, the
   sheet, the PDF and the request to the CRM all read them from here, and no figure is typed anywhere else. */

/** The two payment modes of the quotation: cheque, NEFT, IMPS, UPI or RTGS (`cash`), or an NBFC loan. */
export type PaymentMode = "cash" | "nbfc";

/** What the quotation sheet and the PDF show about the visitor and their choices. */
export interface QuotationFormData {
  category: "general" | "sc-st" | null;
  floor: string;
  structureHeight: string;
  discom: string;
  name: string;
  mobile: string;
  pincode: string;
}

/** How many days a quotation is valid: "Valid for 15 days" on the sheet and the PDF, and clause 4 of its terms. */
export const QUOTATION_VALIDITY_DAYS = 15;

/** A PIN code: six digits, the first not 0. The server route checks the same. */
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

/** A quote number as the CRM issues it. Anything else from its answer is dropped. The server route checks the same. */
export const QUOTE_NO_PATTERN = /^[A-Za-z0-9/_-]{1,24}$/;

/* ─── Pricing, by category ───
   Each category has its own standard price and its own Gujarat subsidy. The central subsidy is the same.
   For SC / ST, Solarium has given the standard price but not the system price and the discount behind it:
   those are null, and nothing shows them or works them out. */
export type CategoryFigures = {
  systemPrice: number | null;
  specialDiscount: number | null;
  standardPrice: number;
  centralSubsidy: number;
  gujaratSubsidy: number;
};

export const GENERAL_FIGURES: CategoryFigures = {
  systemPrice: 108_100,
  specialDiscount: 10_810,
  standardPrice: 97_290,
  centralSubsidy: 63_240,
  gujaratSubsidy: 34_050,
};

export const SC_ST_FIGURES: CategoryFigures = {
  systemPrice: null,
  specialDiscount: null,
  standardPrice: 102_695,
  centralSubsidy: 63_240,
  gujaratSubsidy: 39_455,
};

/** The figures of a category. No category counts as General. */
export function categoryFigures(category: Category) {
  return category === "sc-st" ? SC_ST_FIGURES : GENERAL_FIGURES;
}

/** The two subsidies of a category together. */
export const totalSubsidyOf = (figures: CategoryFigures) => figures.centralSubsidy + figures.gujaratSubsidy;

/* The General figures, for the parts of the page that stand outside the quotation (the closing section, the
   phone bar, the FAQ) and show the standard offer. */
export const STANDARD_PRICE = GENERAL_FIGURES.standardPrice;
export const CENTRAL_SUBSIDY = GENERAL_FIGURES.centralSubsidy;
export const GUJARAT_SUBSIDY = GENERAL_FIGURES.gujaratSubsidy;
export const TOTAL_SUBSIDY = totalSubsidyOf(GENERAL_FIGURES);
export const EFFECTIVE_COST = Math.max(0, STANDARD_PRICE - TOTAL_SUBSIDY);

/* The NBFC loan: the EMI and the interest of the first three EMIs are in proportion to the loan, from these
   figures for a loan of 97,290. Solarium will send a loan table later. */
export const NBFC_BASE_LOAN = 97_290;
export const NBFC_BASE_EMI = 2_351;
export const NBFC_BASE_INTEREST = 3_780;

export const FLOOR_SHEET_OPTIONS = [
  { label: "G+1", displayPrice: "Included", isIncluded: true, extra: 0 },
  { label: "G+2", displayPrice: "₹3,600", isIncluded: false, extra: 3_600 },
  { label: "G+3", displayPrice: "₹5,600", isIncluded: false, extra: 5_600 },
  { label: "G+4", displayPrice: "₹7,500", isIncluded: false, extra: 7_500 },
] as const;

export const HEIGHT_SHEET_OPTIONS = [
  { label: "0.5 m", displayPrice: "Included", isIncluded: true, extra: 0 },
  { label: "1.0 m", displayPrice: "₹2,800", isIncluded: false, extra: 2_800 },
  { label: "2.0 m", displayPrice: "₹5,600", isIncluded: false, extra: 5_600 },
  { label: "3.0 m", displayPrice: "₹8,400", isIncluded: false, extra: 8_400 },
] as const;

export const DISCOM_SHEET_OPTIONS = [
  { label: "UGVCL", displayPrice: "₹0", extra: 0 },
  { label: "MGVCL", displayPrice: "₹0", extra: 0 },
  { label: "DGVCL", displayPrice: "₹0", extra: 0 },
  { label: "PGVCL", displayPrice: "₹0", extra: 0 },
  { label: "Torrent Power", displayPrice: "₹5,409", extra: 5_409 },
] as const;

export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-IN");

/** An option's price as the sheet and the PDF show it: "Included", or the charge that is added. */
export function optionCharge(option: { displayPrice: string; extra: number; isIncluded?: boolean } | undefined) {
  if (!option) return "-";
  if (option.isIncluded) return option.displayPrice;
  return option.extra > 0 ? `+ ${option.displayPrice}` : option.displayPrice;
}

/**
 * Everything the quotation shows, for a category and three choices: the category's figures, the add-ons, the
 * upfront payment (standard price plus add-ons), the effective cost (upfront payment less the total subsidy)
 * and the two payment modes. No consumer does this arithmetic itself.
 */
export function computeQuotationNumbers(floor: string, structureHeight: string, discom: string, category: Category = null) {
  const figures = categoryFigures(category);
  const totalSubsidy = totalSubsidyOf(figures);
  const floorCost = FLOOR_SHEET_OPTIONS.find((o) => o.label === floor)?.extra ?? 0;
  const heightCost = HEIGHT_SHEET_OPTIONS.find((o) => o.label === structureHeight)?.extra ?? 0;
  const meterCost = DISCOM_SHEET_OPTIONS.find((o) => o.label === discom)?.extra ?? 0;

  const addOns = floorCost + heightCost + meterCost;
  const finalPrice = figures.standardPrice + addOns;
  const effectiveCost = finalPrice - totalSubsidy;

  // 1. Cheque, NEFT, IMPS, UPI or RTGS: 100% of the upfront payment before dispatch, nothing earlier.
  const cashBeforeDispatch = finalPrice;

  // 2. NBFC loan (0% down, 100% loan). The row notes show the same rule applied to the standard price.
  const nbfcLoanAmount = finalPrice;
  const nbfcEmi = Math.round((NBFC_BASE_EMI * nbfcLoanAmount) / NBFC_BASE_LOAN);
  const nbfcInterest = Math.round((NBFC_BASE_INTEREST * nbfcLoanAmount) / NBFC_BASE_LOAN);

  return {
    systemPrice: figures.systemPrice,
    specialDiscount: figures.specialDiscount,
    standardPrice: figures.standardPrice,
    centralSubsidy: figures.centralSubsidy,
    gujaratSubsidy: figures.gujaratSubsidy,
    totalSubsidy,
    floorCost,
    heightCost,
    meterCost,
    addOns,
    /** The upfront payment. */
    finalPrice,
    effectiveCost,
    cash: {
      beforeDispatch: cashBeforeDispatch,
      netAfterSubsidy: effectiveCost,
    },
    nbfc: {
      loanAmount: nbfcLoanAmount,
      emi: nbfcEmi,
      interest: nbfcInterest,
      netAfterSubsidy: effectiveCost + nbfcInterest,
      base: {
        loan: figures.standardPrice,
        emi: Math.round((NBFC_BASE_EMI * figures.standardPrice) / NBFC_BASE_LOAN),
        interest: Math.round((NBFC_BASE_INTEREST * figures.standardPrice) / NBFC_BASE_LOAN),
      },
    },
  };
}

/* `crm` is the value the CRM expects for each option. */
export const FLOOR_OPTIONS = [
  { label: "G+1", crm: "G+1", guLabel: "G+1", sub: "Included", guSub: "સમાવિષ્ટ", extra: 0 },
  { label: "G+2", crm: "G+2", guLabel: "G+2", sub: "+₹3,600", guSub: "+₹3,600", extra: 3600 },
  { label: "G+3", crm: "G+3", guLabel: "G+3", sub: "+₹5,600", guSub: "+₹5,600", extra: 5600 },
  { label: "G+4", crm: "G+4", guLabel: "G+4", sub: "+₹7,500", guSub: "+₹7,500", extra: 7500 },
  { label: "G+5 and above", crm: "G+5+", guLabel: "G+5 અને તેથી વધુ", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

export const STRUCTURE_HEIGHT_OPTIONS = [
  { label: "0.5 m", crm: "0.5", guLabel: "0.5 m", sub: "Included", guSub: "સમાવિષ્ટ", extra: 0 },
  { label: "1.0 m", crm: "1", guLabel: "1.0 m", sub: "+₹2,800", guSub: "+₹2,800", extra: 2800 },
  { label: "2.0 m", crm: "2", guLabel: "2.0 m", sub: "+₹5,600", guSub: "+₹5,600", extra: 5600 },
  { label: "3.0 m", crm: "3", guLabel: "3.0 m", sub: "+₹8,400", guSub: "+₹8,400", extra: 8400 },
  { label: "3.0 m and above", crm: "3+", guLabel: "3.0 m અને તેથી વધુ", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

export const DISCOM_OPTIONS = [
  { label: "UGVCL", crm: "UGVCL", guLabel: "UGVCL", sub: "₹0", guSub: "₹0", extra: 0 },
  { label: "MGVCL", crm: "MGVCL", guLabel: "MGVCL", sub: "₹0", guSub: "₹0", extra: 0 },
  { label: "DGVCL", crm: "DGVCL", guLabel: "DGVCL", sub: "₹0", guSub: "₹0", extra: 0 },
  { label: "PGVCL", crm: "PGVCL", guLabel: "PGVCL", sub: "₹0", guSub: "₹0", extra: 0 },
  { label: "Torrent Power", crm: "Torrent", guLabel: "Torrent Power", sub: "+₹5,409", guSub: "+₹5,409", extra: 5409 },
  { label: "Other", crm: "Other", guLabel: "અન્ય (Other)", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

/* The sheet's payment modes in the CRM's values, and the loan figures shown for the loan. */
export const PAYMENT_MODE_VALUES: Record<PaymentMode, string> = { cash: "cash", nbfc: "nbfc-loan" };

export function loanFigures(mode: PaymentMode | null, calc: ReturnType<typeof computeQuotationNumbers>) {
  if (mode === "nbfc") {
    return {
      down_payment: 0,
      loan_amount: calc.nbfc.loanAmount,
      emi: calc.nbfc.emi,
      interest_first_3_emis: calc.nbfc.interest,
      net_cost: calc.nbfc.netAfterSubsidy,
    };
  }
  return undefined;
}

export type Category        = "general" | "sc-st" | null;
export type FloorOption     = (typeof FLOOR_OPTIONS)[number]["label"] | "";
export type StructureHeight = (typeof STRUCTURE_HEIGHT_OPTIONS)[number]["label"] | "";
export type DiscomOption    = (typeof DISCOM_OPTIONS)[number]["label"] | "";
