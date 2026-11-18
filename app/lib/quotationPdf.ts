/* The quotation PDF, browser side: wait for the fonts, load the logo and the payment QR, draw each page of
   the quotation on its own canvas, and wrap the pictures into an A4 PDF, one page each. The drawing itself is
   in pdf/quotation218.ts, built from the parts in pdf/pdfParts.ts with the values of pdf/pdfTheme.ts. */

import { PAYMENT_QR_IMAGE } from "./payment";
import { QUOTATION_218_PAGES } from "./pdf/quotation218";
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

/** A picture of the site, such as the logo or the payment QR, or null when it cannot be loaded. */
function loadPicture(src: string): Promise<LogoImage | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => resolve(image.naturalWidth > 0 ? { image, width: image.naturalWidth, height: image.naturalHeight } : null);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export type JpegPage = { dataUrl: string; width: number; height: number };

/** Wraps JPEG pictures into an A4 PDF (PDF 1.4), one page each, without a library. */
export function jpegPagesToPdfBlob(pages: JpegPage[]): Blob {
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
  // Objects 1 and 2 are the catalog and the page tree. Page n (from 0) has its page, picture and content as
  // objects 3 + 3n, 4 + 3n and 5 + 3n.
  const pageObject = (n: number) => 3 + 3 * n;

  pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  offsets.push(offset);
  pushStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  offsets.push(offset);
  const kids = pages.map((_, n) => `${pageObject(n)} 0 R`).join(" ");
  pushStr(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`);

  pages.forEach((page, n) => {
    const base64 = page.dataUrl.split(",")[1];
    const binaryStr = atob(base64);
    const jpegBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      jpegBytes[i] = binaryStr.charCodeAt(i);
    }
    const p = pageObject(n);

    offsets.push(offset);
    pushStr(
      `${p} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${n} ${p + 1} 0 R >> >> /Contents ${p + 2} 0 R >>\nendobj\n`
    );

    offsets.push(offset);
    pushStr(
      `${p + 1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
    );
    pushBytes(jpegBytes);
    pushStr("\nendstream\nendobj\n");

    const contentStream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im${n} Do\nQ\n`;
    offsets.push(offset);
    pushStr(`${p + 2} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);
  });

  const xrefStart = offset;
  pushStr(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`);
  for (const off of offsets) {
    pushStr(`${String(off).padStart(10, "0")} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}

/** Wraps one JPEG into a one-page A4 PDF. */
export function jpegDataUrlToPdfBlob(jpegDataUrl: string, imgW: number, imgH: number): Blob {
  return jpegPagesToPdfBlob([{ dataUrl: jpegDataUrl, width: imgW, height: imgH }]);
}

/** Draws the quotation and returns it as a PDF of its pages. */
export async function generateQuotationPdfBlob(
  data: QuotationFormData,
  paymentMode: PaymentMode | null,
  quoteNo: string | null,
  quoteDate: string
): Promise<Blob> {
  await loadPdfFonts();
  const [logo, qr] = await Promise.all([loadPicture("/images/solarium-logo.png"), loadPicture(PAYMENT_QR_IMAGE)]);

  const pages = QUOTATION_218_PAGES.map((drawPage) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(PDF_PAGE.width * PDF_PAGE.scale);
    canvas.height = Math.round(PDF_PAGE.height * PDF_PAGE.scale);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(PDF_PAGE.scale, PDF_PAGE.scale);
    drawPage(ctx, { data, paymentMode, quoteNo, quoteDate, logo, qr });
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.95), width: canvas.width, height: canvas.height };
  });
  return jpegPagesToPdfBlob(pages);
}
