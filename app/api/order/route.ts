import { callCrm } from "../_lib/crm";
import {
  DISCOM_VALUES,
  DOC_TYPES,
  asObject,
  bool,
  hasKeys,
  measure,
  name,
  oneOf,
  phone,
  readMeta,
  readSubmissionId,
  text,
  type Errors,
  type Out,
} from "../_lib/fields";
import { invalidResponse, readLeadRequest, submitResponse } from "../_lib/request";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The booking form: a lead with its order details and the documents that
 * were already uploaded to the CRM's storage. Nothing is kept on this server.
 */
export async function POST(request: Request) {
  const read = await readLeadRequest(request, "order");
  if (read.response) return read.response;
  const body = read.body;

  const errors: Errors = {};
  const submissionId = readSubmissionId(body, errors);

  const customerIn = asObject(body.customer);
  const customer: Out = {};
  name(customerIn, "name", customer, errors, "customer.name");
  phone(customerIn, "phone", customer, errors, "customer.phone", true);
  const email = typeof customerIn.email === "string" ? customerIn.email.trim() : "";
  if (email) {
    if (email.length > 200 || !EMAIL_PATTERN.test(email)) errors["customer.email"] = "Enter a valid email address";
    else customer.email = email;
  } else if (customerIn.email !== undefined && customerIn.email !== null && typeof customerIn.email !== "string") {
    errors["customer.email"] = "Must be text";
  }
  text(customerIn, "city", 80, customer, errors, "customer.city");
  const pincode = typeof customerIn.pincode === "string" ? customerIn.pincode.trim() : "";
  if (pincode) {
    if (!/^\d{6}$/.test(pincode)) errors["customer.pincode"] = "Enter a 6 digit pincode";
    else customer.pincode = pincode;
  }

  const orderIn = asObject(body.order);
  const order: Out = {};
  oneOf(orderIn, "discom", DISCOM_VALUES, order, errors, "order.discom");
  oneOf(orderIn, "project_type", ["Residential", "Commercial", "Industrial", "Other"], order, errors, "order.project_type");
  oneOf(orderIn, "loan_interest", ["Yes", "No", "Maybe"], order, errors, "order.loan_interest");
  bool(orderIn, "name_matches_bank", order, errors, "order.name_matches_bank");
  measure(orderIn, "shadow_free_length", 1000, order, errors, "order.shadow_free_length");
  measure(orderIn, "shadow_free_width", 1000, order, errors, "order.shadow_free_width");
  text(orderIn, "remarks", 2000, order, errors, "order.remarks");

  const referralIn = asObject(body.referral);
  const referral: Out = {};
  text(referralIn, "name", 120, referral, errors, "referral.name");
  text(referralIn, "code", 40, referral, errors, "referral.code");
  phone(referralIn, "phone", referral, errors, "referral.phone", false);

  const documentsIn = Array.isArray(body.documents) ? body.documents : [];
  if (documentsIn.length > 12) errors.documents = "At most 12 documents";
  const documents: Out[] = [];
  documentsIn.slice(0, 12).forEach((entry, index) => {
    const doc = asObject(entry);
    const docType = typeof doc.doc_type === "string" ? doc.doc_type : "";
    const path = typeof doc.path === "string" ? doc.path.trim() : "";
    if (!(DOC_TYPES as readonly string[]).includes(docType)) {
      errors[`documents.${index}.doc_type`] = "Unknown document type";
    }
    if (!path.startsWith(`intake/${submissionId}/`) || path.includes("..") || path.length > 300) {
      errors[`documents.${index}.path`] = "Path does not belong to this submission";
    }
    const out: Out = { doc_type: docType, path };
    const fileName = typeof doc.file_name === "string" ? doc.file_name.split(/[\\/]/).pop()?.trim().slice(0, 200) : "";
    if (fileName) out.file_name = fileName;
    documents.push(out);
  });

  const meta = readMeta(body, errors);

  if (hasKeys(errors)) return invalidResponse("Check the highlighted fields", errors);

  const payload: Out = {
    channel: "website-order",
    submission_id: submissionId,
    customer,
  };
  if (hasKeys(order)) payload.order = order;
  if (hasKeys(referral)) payload.referral = referral;
  if (documents.length) payload.documents = documents;
  if (hasKeys(meta)) payload.meta = meta;
  if (body.test === true) payload.test = true;

  const result = await callCrm("submit", payload, { channel: "website-order", submissionId });
  return submitResponse(result);
}
