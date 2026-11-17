import { NextResponse } from "next/server";
import { callCrm } from "../../_lib/crm";
import { DOC_TYPES, asObject, hasKeys, readSubmissionId, type Errors } from "../../_lib/fields";
import { crmResponse, invalidResponse, readLeadRequest } from "../../_lib/request";

const MB = 1024 * 1024;
const MAX_SIZE = new Map<string, number>([
  ["image/jpeg", 10 * MB],
  ["image/png", 10 * MB],
  ["image/webp", 10 * MB],
  ["image/heic", 10 * MB],
  ["image/heif", 10 * MB],
  ["application/pdf", 10 * MB],
  ["video/mp4", 50 * MB],
]);

/**
 * One-time upload links for the booking form. Files go from the browser
 * straight to the CRM's storage, never through this server.
 */
export async function POST(request: Request) {
  const read = await readLeadRequest(request, "upload-links");
  if (read.response) return read.response;
  const body = read.body;

  const errors: Errors = {};
  const submissionId = readSubmissionId(body, errors);

  const filesIn = Array.isArray(body.files) ? body.files : [];
  if (filesIn.length === 0) errors.files = "At least one file";
  if (filesIn.length > 12) errors.files = "At most 12 files";

  const files = filesIn.slice(0, 12).map((entry, index) => {
    const file = asObject(entry);
    const docType = typeof file.doc_type === "string" ? file.doc_type : "";
    const contentType = typeof file.content_type === "string" ? file.content_type : "";
    const size = file.size;

    if (!(DOC_TYPES as readonly string[]).includes(docType)) {
      errors[`files.${index}.doc_type`] = "Unknown document type";
    }
    const max = MAX_SIZE.get(contentType);
    if (!max || (contentType === "video/mp4" && docType !== "site-media")) {
      errors[`files.${index}.content_type`] = "File type not allowed";
    } else if (typeof size !== "number" || !Number.isInteger(size) || size <= 0 || size > max) {
      errors[`files.${index}.size`] = `File must be larger than 0 and at most ${max / MB} MB`;
    }
    return { doc_type: docType, content_type: contentType, size };
  });

  if (hasKeys(errors)) return invalidResponse("Check the highlighted fields", errors);

  const result = await callCrm("upload-links", { submission_id: submissionId, files }, { submissionId });

  return crmResponse(
    result,
    (data) => {
      if (typeof data.bucket !== "string" || !Array.isArray(data.files)) {
        console.error(`[crm] upload-links ${submissionId}: answer without bucket or files`);
        return NextResponse.json({ ok: false, code: "unavailable" }, { status: 502 });
      }
      // Tokens go to the browser only. They are never logged.
      return NextResponse.json({ ok: true, status: "ok", bucket: data.bucket, files: data.files });
    },
    { files: [] }
  );
}
