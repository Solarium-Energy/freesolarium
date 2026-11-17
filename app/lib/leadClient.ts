/**
 * Browser helpers shared by the quotation card and the booking page.
 */

export type LeadMeta = {
  page_url?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type PostResult = {
  /** HTTP status, or 0 when the request did not complete. */
  status: number;
  /** Parsed JSON body, or null. */
  body: Record<string, unknown> | null;
};

/** A new id for one submission (UUID v4). */
export function newSubmissionId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // randomUUID needs a secure context; plain http on a local network has none.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Where the visitor came from. Empty values are left out. */
export function buildMeta(): LeadMeta {
  const meta: LeadMeta = {};
  const params = new URLSearchParams(window.location.search);
  const values: LeadMeta = {
    page_url: `${window.location.origin}${window.location.pathname}`,
    referrer: document.referrer,
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
  };
  for (const [key, value] of Object.entries(values) as [keyof LeadMeta, string | undefined][]) {
    const trimmed = value?.trim();
    if (trimmed) meta[key] = trimmed;
  }
  return meta;
}

/**
 * Test mode is on when the page URL has `?test=1`. The lead routes then pass
 * `"test": true` to the CRM, which checks everything (uploaded files too) and
 * stores nothing.
 */
export function isTestMode() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("test") === "1";
}

/** Routes whose bodies carry `"test": true` in test mode. Upload links are asked for as usual. */
const TEST_ROUTES = new Set(["/api/quote", "/api/order"]);

/** POSTs JSON. Never throws: a network failure comes back as status 0. */
export async function postJson(url: string, body: unknown, options: { keepalive?: boolean } = {}): Promise<PostResult> {
  const payload =
    isTestMode() && TEST_ROUTES.has(url) && typeof body === "object" && body !== null ? { ...body, test: true } : body;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: options.keepalive,
    });
    let json: unknown = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }
    const parsed = typeof json === "object" && json !== null && !Array.isArray(json) ? (json as Record<string, unknown>) : null;
    return { status: response.status, body: parsed };
  } catch {
    return { status: 0, body: null };
  }
}

/** True when a lead route confirmed the submission (200 with ok: true). */
export function isConfirmed(result: PostResult) {
  return result.status === 200 && result.body?.ok === true;
}
