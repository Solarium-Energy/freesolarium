import "server-only";

/**
 * Builds the object sent to the CRM from known keys only. Strings are trimmed
 * and cut to their maximum length, empty values are left out, and problems
 * are collected under the contract's field paths.
 */

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DISCOM_VALUES = ["UGVCL", "MGVCL", "DGVCL", "PGVCL", "Torrent", "Other"] as const;

export const DOC_TYPES = [
  "electricity-bill",
  "bank-proof",
  "aadhaar-front",
  "aadhaar-back",
  "pan",
  "passport-photo",
  "house-photo",
  "geotagged-photo",
  "site-media",
] as const;

export type Errors = Record<string, string>;
export type Out = Record<string, unknown>;

export function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

/** Ten digits after removing everything else and a leading 91 country code. */
export function cleanPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  return digits;
}

export function readSubmissionId(body: Record<string, unknown>, errors: Errors) {
  const id = typeof body.submission_id === "string" ? body.submission_id.trim() : "";
  if (!UUID_PATTERN.test(id)) errors.submission_id = "Must be a UUID";
  return id;
}

/** Optional text, trimmed and cut to `max`. */
export function text(source: Record<string, unknown>, key: string, max: number, out: Out, errors: Errors, path: string) {
  const value = source[key];
  if (isEmpty(value)) return;
  if (typeof value !== "string") {
    errors[path] = "Must be text";
    return;
  }
  out[key] = value.trim().slice(0, max);
}

export function name(source: Record<string, unknown>, key: string, out: Out, errors: Errors, path: string) {
  const value = typeof source[key] === "string" ? (source[key] as string).trim() : "";
  if (value.length < 2) {
    errors[path] = "Enter a name of at least 2 characters";
    return;
  }
  out[key] = value.slice(0, 120);
}

export function phone(source: Record<string, unknown>, key: string, out: Out, errors: Errors, path: string, required: boolean) {
  const value = source[key];
  if (isEmpty(value)) {
    if (required) errors[path] = "Enter a ten digit mobile number";
    return;
  }
  const digits = typeof value === "string" || typeof value === "number" ? cleanPhone(String(value)) : "";
  if (digits.length !== 10) {
    errors[path] = "Enter a ten digit mobile number";
    return;
  }
  out[key] = digits;
}

/** A PIN code: six digits, the first not 0. The quotation form checks the same. */
export function pincode(source: Record<string, unknown>, key: string, out: Out, errors: Errors, path: string, required: boolean) {
  const value = source[key];
  if (isEmpty(value)) {
    if (required) errors[path] = "Enter all 6 digits of your PIN code";
    return;
  }
  const digits = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
  if (!/^[1-9]\d{5}$/.test(digits)) {
    errors[path] = "Enter all 6 digits of your PIN code";
    return;
  }
  out[key] = digits;
}

export function oneOf(
  source: Record<string, unknown>,
  key: string,
  allowed: readonly string[],
  out: Out,
  errors: Errors,
  path: string,
  required = false
) {
  const value = source[key];
  if (isEmpty(value)) {
    if (required) errors[path] = "Required";
    return;
  }
  if (typeof value !== "string" || !allowed.includes(value)) {
    errors[path] = `Must be one of: ${allowed.join(", ")}`;
    return;
  }
  out[key] = value;
}

export function bool(source: Record<string, unknown>, key: string, out: Out, errors: Errors, path: string, required = false) {
  const value = source[key];
  if (value === undefined || value === null) {
    if (required) errors[path] = "Must be true or false";
    return;
  }
  if (typeof value !== "boolean") {
    errors[path] = "Must be true or false";
    return;
  }
  out[key] = value;
}

/** Whole number from 0 to 1,000,000 (rupees). */
export function amount(source: Record<string, unknown>, key: string, out: Out, errors: Errors, path: string, required: boolean) {
  const value = source[key];
  if (value === undefined || value === null) {
    if (required) errors[path] = "Required";
    return;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 1_000_000) {
    errors[path] = "Must be a whole number from 0 to 1000000";
    return;
  }
  out[key] = value;
}

/** Number greater than 0 and at most `max`. */
export function measure(source: Record<string, unknown>, key: string, max: number, out: Out, errors: Errors, path: string) {
  const value = source[key];
  if (value === undefined || value === null || value === "") return;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > max) {
    errors[path] = `Must be a number greater than 0 and at most ${max}`;
    return;
  }
  out[key] = value;
}

export function readMeta(body: Record<string, unknown>, errors: Errors) {
  const meta = asObject(body.meta);
  const out: Out = {};
  text(meta, "page_url", 500, out, errors, "meta.page_url");
  text(meta, "referrer", 500, out, errors, "meta.referrer");
  text(meta, "utm_source", 100, out, errors, "meta.utm_source");
  text(meta, "utm_medium", 100, out, errors, "meta.utm_medium");
  text(meta, "utm_campaign", 100, out, errors, "meta.utm_campaign");
  return out;
}

export function hasKeys(value: Out) {
  return Object.keys(value).length > 0;
}
