/* The quotation's numbers: pricing constants, option lists and the calculation.
   Moved unchanged from the old quotation card and sheet. The bar, the sheet and the PDF all read them from here. */

export type PaymentMode = "cash" | "bank" | "nbfc";

/** What the quotation sheet and the PDF show about the visitor and their choices. */
export interface QuotationFormData {
  category: "general" | "sc-st" | null;
  floor: string;
  structureHeight: string;
  discom: string;
  customerNameBill: string;
  customerNameBank: string;
  address: string;
  mobile: string;
  consumerNo: string;
}

/* ─── Pricing Constants (exact match to offline sheet) ─── */
export const SYSTEM_PRICE = 108_100;
export const SPECIAL_DISCOUNT = 10_810;
export const STANDARD_PRICE = 97_290;
export const CENTRAL_SUBSIDY = 63_240;
export const GUJARAT_SUBSIDY = 34_050;
export const BOOKING_AMOUNT = 10_000;

export const BANK_BASE_LOAN = 87_561;
export const BANK_BASE_EMI = 1_715;
export const BANK_BASE_INTEREST = 1_310;

export const NBFC_BASE_LOAN = 97_290;
export const NBFC_BASE_EMI = 2_351;
export const NBFC_BASE_INTEREST = 3_780;

export const FLOOR_SHEET_OPTIONS = [
  { label: "Ground / G+1", displayPrice: "Included", isIncluded: true, extra: 0 },
  { label: "G+2", displayPrice: "₹3,600", isIncluded: false, extra: 3_600 },
  { label: "G+3", displayPrice: "₹5,600", isIncluded: false, extra: 5_600 },
  { label: "G+4", displayPrice: "₹7,500", isIncluded: false, extra: 7_500 },
] as const;

export const HEIGHT_SHEET_OPTIONS = [
  { label: "0.5 m", displayPrice: "Included", isIncluded: true, extra: 0 },
  { label: "1.0 m", displayPrice: "₹2,800", isIncluded: false, extra: 2_800 },
  { label: "1.5 m", displayPrice: "₹4,200", isIncluded: false, extra: 4_200 },
  { label: "2.0 m", displayPrice: "₹5,600", isIncluded: false, extra: 5_600 },
  { label: "2.5 m", displayPrice: "₹7,000", isIncluded: false, extra: 7_000 },
  { label: "3.0 m", displayPrice: "₹8,400", isIncluded: false, extra: 8_400 },
] as const;

export const DISCOM_SHEET_OPTIONS = [
  { label: "UGVCL", displayPrice: "₹0", extra: 0 },
  { label: "Torrent Power", displayPrice: "₹5,409", extra: 5_409 },
] as const;

export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-IN");

export function computeQuotationNumbers(floor: string, structureHeight: string, discom: string) {
  const floorCost = FLOOR_SHEET_OPTIONS.find((o) => o.label === floor)?.extra ?? 0;
  const heightCost = HEIGHT_SHEET_OPTIONS.find((o) => o.label === structureHeight)?.extra ?? 0;
  const meterCost = DISCOM_SHEET_OPTIONS.find((o) => o.label === discom)?.extra ?? 0;

  const addOns = floorCost + heightCost + meterCost;
  const finalPrice = STANDARD_PRICE + addOns;

  // 1. Without loan
  const cashBeforeDispatch = finalPrice - BOOKING_AMOUNT;
  const cashNetAfterSubsidy = addOns;

  // 2. Nationalised bank loan (10% down, 90% loan)
  const bankDownPayment = Math.round(finalPrice * 0.1);
  const bankLoanAmount = Math.round(finalPrice * 0.9);
  const bankEmi = Math.round((BANK_BASE_EMI * bankLoanAmount) / BANK_BASE_LOAN);
  const bankInterest = Math.round((BANK_BASE_INTEREST * bankLoanAmount) / BANK_BASE_LOAN);
  const bankNetAfterSubsidy = addOns + bankInterest;

  // 3. NBFC loan (0% down, 100% loan)
  const nbfcLoanAmount = finalPrice;
  const nbfcEmi = Math.round((NBFC_BASE_EMI * nbfcLoanAmount) / NBFC_BASE_LOAN);
  const nbfcInterest = Math.round((NBFC_BASE_INTEREST * nbfcLoanAmount) / NBFC_BASE_LOAN);
  const nbfcNetAfterSubsidy = addOns + nbfcInterest;

  return {
    floorCost,
    heightCost,
    meterCost,
    addOns,
    finalPrice,
    cash: {
      beforeDispatch: cashBeforeDispatch,
      netAfterSubsidy: cashNetAfterSubsidy,
    },
    bank: {
      downPayment: bankDownPayment,
      loanAmount: bankLoanAmount,
      emi: bankEmi,
      interest: bankInterest,
      netAfterSubsidy: bankNetAfterSubsidy,
    },
    nbfc: {
      loanAmount: nbfcLoanAmount,
      emi: nbfcEmi,
      interest: nbfcInterest,
      netAfterSubsidy: nbfcNetAfterSubsidy,
    },
  };
}

/* `crm` is the value the CRM expects for each option. */
export const FLOOR_OPTIONS = [
  { label: "Ground / G+1", crm: "G+1", guLabel: "ગ્રાઉન્ડ / G+1", sub: "Included", guSub: "સમાવિષ્ટ", extra: 0 },
  { label: "G+2", crm: "G+2", guLabel: "G+2", sub: "+₹3,600", guSub: "+₹3,600", extra: 3600 },
  { label: "G+3", crm: "G+3", guLabel: "G+3", sub: "+₹5,600", guSub: "+₹5,600", extra: 5600 },
  { label: "G+4", crm: "G+4", guLabel: "G+4", sub: "+₹7,500", guSub: "+₹7,500", extra: 7500 },
  { label: "G+5 and above", crm: "G+5+", guLabel: "G+5 અને તેથી વધુ", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

export const STRUCTURE_HEIGHT_OPTIONS = [
  { label: "0.5 m", crm: "0.5", guLabel: "0.5 m", sub: "Included", guSub: "સમાવિષ્ટ", extra: 0 },
  { label: "1.0 m", crm: "1", guLabel: "1.0 m", sub: "+₹2,800", guSub: "+₹2,800", extra: 2800 },
  { label: "1.5 m", crm: "1.5", guLabel: "1.5 m", sub: "+₹4,200", guSub: "+₹4,200", extra: 4200 },
  { label: "2.0 m", crm: "2", guLabel: "2.0 m", sub: "+₹5,600", guSub: "+₹5,600", extra: 5600 },
  { label: "2.5 m", crm: "2.5", guLabel: "2.5 m", sub: "+₹7,000", guSub: "+₹7,000", extra: 7000 },
  { label: "3.0 m", crm: "3", guLabel: "3.0 m", sub: "+₹8,400", guSub: "+₹8,400", extra: 8400 },
  { label: "3.0 m and above", crm: "3+", guLabel: "3.0 m અને તેથી વધુ", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

export const DISCOM_OPTIONS = [
  { label: "UGVCL", crm: "UGVCL", guLabel: "UGVCL", sub: "₹0", guSub: "₹0", extra: 0 },
  { label: "Torrent Power", crm: "Torrent", guLabel: "Torrent Power", sub: "+₹5,409", guSub: "+₹5,409", extra: 5409 },
  { label: "Other", crm: "Other", guLabel: "અન્ય (Other)", sub: "Our team will contact you", guSub: "અમારી ટીમ તમારો સંપર્ક કરશે", extra: 0, custom: true },
] as const;

/* The sheet's payment modes in the CRM's values, and the loan figures shown for each loan mode. */
export const PAYMENT_MODE_VALUES: Record<PaymentMode, string> = { cash: "cash", bank: "bank-loan", nbfc: "nbfc-loan" };

export function loanFigures(mode: PaymentMode | null, calc: ReturnType<typeof computeQuotationNumbers>) {
  if (mode === "bank") {
    return {
      down_payment: calc.bank.downPayment,
      loan_amount: calc.bank.loanAmount,
      emi: calc.bank.emi,
      interest_first_3_emis: calc.bank.interest,
      net_cost: calc.bank.netAfterSubsidy,
    };
  }
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
