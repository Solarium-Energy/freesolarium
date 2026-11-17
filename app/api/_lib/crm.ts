import "server-only";

/**
 * The only place that talks to the CRM intake function.
 *
 * The intake key is read here, inside the request, and never leaves the
 * server. Log lines hold an action, a channel, a submission id, a status code
 * or an error code, and never anything a visitor typed.
 */

export type CrmAction = "submit" | "upload-links";

export type CrmResult =
  | { kind: "ok"; data: Record<string, unknown> }
  | { kind: "skipped" }
  | { kind: "invalid"; message: string; fields?: Record<string, string> }
  | { kind: "rate_limited" }
  | { kind: "not_configured" }
  | { kind: "unavailable" };

const ATTEMPT_TIMEOUT_MS = 8_000;
const RETRY_WAITS_MS = [1_000, 3_000];

type Attempt =
  | { kind: "response"; status: number; json: unknown }
  | { kind: "error"; code: "timeout" | "network" };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attempt(url: string, headers: Record<string, string>, body: string): Promise<Attempt> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
    });
    const text = await response.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { kind: "response", status: response.status, json };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    return { kind: "error", code: name === "TimeoutError" || name === "AbortError" ? "timeout" : "network" };
  }
}

/**
 * Sends one action to the CRM. Network errors, timeouts and 5xx answers are
 * tried again after 1 s and 3 s with the same body (so the same submission id).
 */
export async function callCrm(
  action: CrmAction,
  payload: Record<string, unknown>,
  context: { channel?: string; submissionId: string }
): Promise<CrmResult> {
  const label = `[crm] ${action}${context.channel ? ` ${context.channel}` : ""} ${context.submissionId}`;

  const url = process.env.CRM_INTAKE_URL;
  const key = process.env.CRM_INTAKE_KEY;
  const apikey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || !apikey) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[crm] not configured, skipped ${action}`);
      return { kind: "skipped" };
    }
    console.error(`[crm] not configured, refused ${action}`);
    return { kind: "not_configured" };
  }

  const headers = {
    "Content-Type": "application/json",
    apikey,
    "x-intake-key": key,
  };
  const body = JSON.stringify({ action, ...payload });

  let last: Attempt | null = null;
  for (let index = 0; index <= RETRY_WAITS_MS.length; index += 1) {
    if (index > 0) await wait(RETRY_WAITS_MS[index - 1]);

    last = await attempt(url, headers, body);
    const retryable = last.kind === "error" || last.status >= 500;
    if (!retryable) break;
    console.warn(`${label}: attempt ${index + 1} failed, ${last.kind === "error" ? last.code : last.status}`);
  }

  if (!last || last.kind === "error") {
    console.error(`${label}: unavailable, ${last ? last.code : "network"}`);
    return { kind: "unavailable" };
  }

  const { status, json } = last;
  const crmCode = isObject(json) && typeof json.code === "string" ? json.code : "";

  if (status >= 200 && status < 300) {
    const data = isObject(json) && isObject(json.data) ? json.data : null;
    if (!data) {
      console.error(`${label}: ${status}, bad_response`);
      return { kind: "unavailable" };
    }
    console.log(`${label}: ${status}`);
    return { kind: "ok", data };
  }

  if (status === 400) {
    console.warn(`${label}: 400 ${crmCode || "invalid_request"}`);
    const message = isObject(json) && typeof json.message === "string" ? json.message : "Invalid request";
    const fields =
      isObject(json) && isObject(json.fields)
        ? Object.fromEntries(Object.entries(json.fields).map(([path, text]) => [path, String(text)]))
        : undefined;
    return { kind: "invalid", message, fields };
  }

  if (status === 401) {
    console.error(`${label}: 401 ${crmCode || "unauthorized"}, check CRM_INTAKE_KEY`);
    return { kind: "not_configured" };
  }

  if (status === 429) {
    console.warn(`${label}: 429 ${crmCode || "rate_limited"}`);
    return { kind: "rate_limited" };
  }

  console.error(`${label}: ${status}${crmCode ? ` ${crmCode}` : ""}, unavailable`);
  return { kind: "unavailable" };
}
