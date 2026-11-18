/* The quotation PDF, browser side: wait for the fonts, load the logo, make the canvas, draw the quotation
   on it, and wrap the picture into a one-page A4 PDF. The drawing itself is in pdf/quotation218.ts, built
   from the parts in pdf/pdfParts.ts with the values of pdf/pdfTheme.ts. */

import { drawQuotation218 } from "./pdf/quotation218";
import type { LogoImage } from "./pdf/pdfParts";
import { PDF_FONTS, PDF_PAGE, PDF_SAMPLE_TEXT, PDF_TYPE } from "./pdf/pdfTheme";
import type { PaymentMode, QuotationFormData } from "./quotation";

/* The page already loads both families. The PDF waits until every face it draws with is ready, with the
   characters outside plain ASCII, so the canvas does not draw them in another face. A slow network holds
   the PDF back for 4 seconds at most: then it is drawn with the fallbacks. */
const FONT_WAIT_MS = 4000;
let fontsReady: Promise<void> | null = null;

function loadPdfFonts(): Promise<void> {
  if (!fontsReady) {
    const faces = new Set(Object.values(PDF_TYPE).map((type) => `${type.weight} 16px ${PDF_FONTS[type.family]}`));
    const load = Promise.all([...faces].map((face) => document.fonts.load(face, PDF_SAMPLE_TEXT))).then(
      () => undefined,
      () => undefined
    );
    fontsReady = Promise.race([load, new Promise<void>((resolve) => window.setTimeout(resolve, FONT_WAIT_MS))]);
  }
  return fontsReady;
}

/** The Solarium logo, or null when it cannot be loaded (the title face writes the name instead). */
function loadLogo(): Promise<LogoImage | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => resolve(image.naturalWidth > 0 ? { image, width: image.naturalWidth, height: image.naturalHeight } : null);
    image.onerror = () => resolve(null);
    image.src = "/images/solarium-logo.png";
  });
}

/** Wraps one JPEG into a one-page A4 PDF (PDF 1.4), without a library. */
export function jpegDataUrlToPdfBlob(jpegDataUrl: string, imgW: number, imgH: number): Blob {
  const base64 = jpegDataUrl.split(",")[1];
  const binaryStr = atob(base64);
  const jpegBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    jpegBytes[i] = binaryStr.charCodeAt(i);
  }

  const pageW = 595.28; // A4 width in pt
  const pageH = 841.89; // A4 height in pt
  const enc = new TextEncoder();

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let offset = 0;

  const pushStr = (s: string) => {
    const b = enc.encode(s);
    chunks.push(b);
    offset += b.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    offset += b.length;
  };

  pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  // 1: Catalog
  offsets.push(offset);
  pushStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 2: Pages
  offsets.push(offset);
  pushStr("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 3: Page
  offsets.push(offset);
  pushStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // 4: Image XObject
  offsets.push(offset);
  pushStr(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  pushStr("\nendstream\nendobj\n");

  // 5: Content stream
  const contentStream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  offsets.push(offset);
  pushStr(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
  );

  const xrefStart = offset;
  pushStr(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`);
  for (const off of offsets) {
    pushStr(`${String(off).padStart(10, "0")} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  );

  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}

/** Draws the quotation and returns it as a one-page PDF. */
export async function generateQuotationPdfBlob(
  data: QuotationFormData,
  paymentMode: PaymentMode | null,
  quoteNo: string | null,
  quoteDate: string
): Promise<Blob> {
  await loadPdfFonts();
  const logo = await loadLogo();

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(PDF_PAGE.width * PDF_PAGE.scale);
  canvas.height = Math.round(PDF_PAGE.height * PDF_PAGE.scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(PDF_PAGE.scale, PDF_PAGE.scale);

  drawQuotation218(ctx, { data, paymentMode, quoteNo, quoteDate, logo });

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
  return jpegDataUrlToPdfBlob(jpegDataUrl, canvas.width, canvas.height);
}
