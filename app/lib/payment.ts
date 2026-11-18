/* Solarium's payment details, as it prints them on its quotations today: its UPI payment QR and its bank
   account. The quotation PDF shows them. They are kept here and nowhere else. */

export const PAYMENT_QR_IMAGE = "/images/payment-qr.png";

export const COMPANY_BANK_DETAILS = [
  { label: "Account name", value: "Solarium Green Energy Limited" },
  { label: "Account number", value: "50200072657323 (Current A/C)" },
  { label: "Bank", value: "HDFC Bank Ltd" },
  { label: "Branch", value: "Dharnidhar, Ahmedabad, GJ" },
  { label: "IFSC", value: "HDFC0001680" },
] as const;
