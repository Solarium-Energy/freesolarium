import "server-only";

import { NextResponse } from "next/server";
import type { CrmResult } from "./crm";

/** Steps shared by the lead routes: body size, JSON, honeypot and a per-address limit. */

const MAX_BODY_BYTES = 100 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 120;
const RATE_MAX_ENTRIES = 5_000;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function clientAddress(request: Request) {
  const direct = request.headers.get("x-nf-client-connection-ip")?.trim();
  if (direct) return direct;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || null;
}

/** Best effort and in memory: each server instance counts on its own. */
function overLimit(route: string, address: string | null) {
  if (!address) return false;
  const now = Date.now();

  if (now - lastSweep > 60_000 || buckets.size > RATE_MAX_ENTRIES) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
    if (buckets.size > RATE_MAX_ENTRIES) buckets.clear();
    lastSweep = now;
  }

  const key = `${route} ${address}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_MAX_REQUESTS;
}

export function invalidResponse(message: string, fields?: Record<string, string>) {
  return NextResponse.json(
    fields && Object.keys(fields).length
      ? { ok: false, code: "invalid_request", message, fields }
      : { ok: false, code: "invalid_request", message },
    { status: 400 }
  );
}

/**
 * Reads and checks the request. Returns either the parsed body, or the
 * response to send straight back.
 */
export async function readLeadRequest(
  request: Request,
  route: string
): Promise<{ body: Record<string, unknown>; response?: undefined } | { body?: undefined; response: NextResponse }> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return { response: NextResponse.json({ ok: false, code: "too_large" }, { status: 413 }) };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return { response: NextResponse.json({ ok: false, code: "too_large" }, { status: 413 }) };
  }

  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown = null;
  if (contentType.toLowerCase().includes("application/json")) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { response: invalidResponse("The request body must be a JSON object.") };
  }
  const record = body as Record<string, unknown>;

  if (typeof record.website === "string" && record.website.trim() !== "") {
    console.log("[crm] honeypot");
    return { response: NextResponse.json({ ok: true, status: "received" }) };
  }

  if (overLimit(route, clientAddress(request))) {
    return { response: NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 }) };
  }

  return { body: record };
}

/** Maps a CRM result to the answer for the browser. */
export function crmResponse(result: CrmResult, onOk: (data: Record<string, unknown>) => NextResponse, skipped: Record<string, unknown>) {
  switch (result.kind) {
    case "ok":
      return onOk(result.data);
    case "skipped":
      return NextResponse.json({ ok: true, status: "skipped", ...skipped });
    case "invalid":
      return invalidResponse(result.message, result.fields);
    case "rate_limited":
      return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
    case "not_configured":
      return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
    case "unavailable":
      return NextResponse.json({ ok: false, code: "unavailable" }, { status: 502 });
  }
}

/** The answer for a `submit` call. */
export function submitResponse(result: CrmResult) {
  return crmResponse(
    result,
    (data) => {
      if (typeof data.status !== "string") {
        console.error("[crm] submit: answer without status");
        return NextResponse.json({ ok: false, code: "unavailable" }, { status: 502 });
      }
      return NextResponse.json({ ok: true, status: data.status });
    },
    {}
  );
}
