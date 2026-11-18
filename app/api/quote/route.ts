import { callCrm } from "../_lib/crm";
import {
  DISCOM_VALUES,
  amount,
  asObject,
  bool,
  hasKeys,
  name,
  oneOf,
  phone,
  pincode,
  readMeta,
  readSubmissionId,
  type Errors,
  type Out,
} from "../_lib/fields";
import { invalidResponse, readLeadRequest, submitResponse } from "../_lib/request";

const FLOORS = ["G+1", "G+2", "G+3", "G+4", "G+5+"];
const HEIGHTS = ["0.5", "1", "1.5", "2", "2.5", "3", "3+"];
const AMOUNTS = [
  "base_price",
  "floor_charge",
  "height_charge",
  "discom_charge",
  "total",
  "subsidy_amount",
  "customer_pays",
] as const;
const PAYMENT_MODES = ["cash", "bank-loan", "nbfc-loan"];
const LOAN_KEYS = ["down_payment", "loan_amount", "emi", "interest_first_3_emis", "net_cost"] as const;

/** The quotation card: one lead with the quotation the visitor saw. */
export async function POST(request: Request) {
  const read = await readLeadRequest(request, "quote");
  if (read.response) return read.response;
  const body = read.body;

  const errors: Errors = {};
  const submissionId = readSubmissionId(body, errors);

  const customerIn = asObject(body.customer);
  const customer: Out = {};
  // A quotation asks for the name, the mobile number and the PIN code, and sends nothing else about the visitor.
  name(customerIn, "name", customer, errors, "customer.name");
  phone(customerIn, "phone", customer, errors, "customer.phone", true);
  pincode(customerIn, "pincode", customer, errors, "customer.pincode", true);

  const quotationIn = asObject(body.quotation);
  const quotation: Out = {};
  oneOf(quotationIn, "subsidy_category", ["general", "sc-st"], quotation, errors, "quotation.subsidy_category", true);
  oneOf(quotationIn, "discom", DISCOM_VALUES, quotation, errors, "quotation.discom", true);
  oneOf(quotationIn, "floor", FLOORS, quotation, errors, "quotation.floor", true);
  oneOf(quotationIn, "structure_height", HEIGHTS, quotation, errors, "quotation.structure_height", true);
  bool(quotationIn, "needs_callback", quotation, errors, "quotation.needs_callback", true);
  // A callback quotation shows no price, so only the known numbers come with it.
  const allAmountsRequired = quotation.needs_callback === false;
  for (const key of AMOUNTS) {
    amount(quotationIn, key, quotation, errors, `quotation.${key}`, allAmountsRequired);
  }

  // Booking amount, payment mode and loan figures belong to the priced sheet only.
  // A callback quotation drops them.
  if (quotation.needs_callback === false) {
    amount(quotationIn, "booking_amount", quotation, errors, "quotation.booking_amount", false);
    oneOf(quotationIn, "payment_mode", PAYMENT_MODES, quotation, errors, "quotation.payment_mode");
    const isLoan = quotation.payment_mode === "bank-loan" || quotation.payment_mode === "nbfc-loan";
    if (isLoan && quotationIn.loan !== undefined && quotationIn.loan !== null) {
      const loanIn = asObject(quotationIn.loan);
      const loan: Out = {};
      for (const key of LOAN_KEYS) {
        amount(loanIn, key, loan, errors, `quotation.loan.${key}`, true);
      }
      quotation.loan = loan;
    }
  }

  const meta = readMeta(body, errors);

  if (hasKeys(errors)) return invalidResponse("Check the highlighted fields", errors);

  const payload: Out = {
    channel: "website-quote",
    submission_id: submissionId,
    customer,
    quotation,
  };
  if (hasKeys(meta)) payload.meta = meta;
  if (body.test === true) payload.test = true;

  const result = await callCrm("submit", payload, { channel: "website-quote", submissionId });
  // The CRM may issue a quote number in its answer: it is passed on to the browser.
  return submitResponse(result, { passQuoteNo: true });
}
