"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, Download, Loader2, X } from "lucide-react";

export type PaymentMode = "cash" | "bank" | "nbfc";

export interface QuotationFormData {
  category: "general" | "sc-st" | null;
  floor: string;
  structureHeight: string;
  discom: string;
  customerNameBill: string;
  customerNameBank: string;
  address: string;
  mobile: string;
  consumerNo: string;
  onFloorChange?: (floor: string) => void;
  onHeightChange?: (height: string) => void;
  onDiscomChange?: (discom: string) => void;
  onPaymentModeChange?: (mode: PaymentMode | null) => void;
}

/* ─── Pricing Constants (exact match to offline sheet) ─── */
export const SYSTEM_PRICE = 108_100;
export const SPECIAL_DISCOUNT = 10_810;
export const STANDARD_PRICE = 97_290;
export const CENTRAL_SUBSIDY = 63_240;
export const GUJARAT_SUBSIDY = 34_050;
export const BOOKING_AMOUNT = 10_000;

export const BANK_BASE_LOAN = 87_561;
export const BANK_BASE_EMI = 1_715;
export const BANK_BASE_INTEREST = 1_310;

export const NBFC_BASE_LOAN = 97_290;
export const NBFC_BASE_EMI = 2_351;
export const NBFC_BASE_INTEREST = 3_780;

export const FLOOR_SHEET_OPTIONS = [
  { label: "Ground / G+1", displayPrice: "Included", isIncluded: true, extra: 0 },
  { label: "G+2", displayPrice: "₹3,600", isIncluded: false, extra: 3_600 },
  { label: "G+3", displayPrice: "₹5,600", isIncluded: false, extra: 5_600 },
  { label: "G+4", displayPrice: "₹7,500", isIncluded: false, extra: 7_500 },
] as const;

export const HEIGHT_SHEET_OPTIONS = [
  { label: "0.5 m", displayPrice: "Included", isIncluded: true, extra: 0 },
  { label: "1.0 m", displayPrice: "₹2,800", isIncluded: false, extra: 2_800 },
  { label: "1.5 m", displayPrice: "₹4,200", isIncluded: false, extra: 4_200 },
  { label: "2.0 m", displayPrice: "₹5,600", isIncluded: false, extra: 5_600 },
  { label: "2.5 m", displayPrice: "₹7,000", isIncluded: false, extra: 7_000 },
  { label: "3.0 m", displayPrice: "₹8,400", isIncluded: false, extra: 8_400 },
] as const;

export const DISCOM_SHEET_OPTIONS = [
  { label: "UGVCL", displayPrice: "₹0", extra: 0 },
  { label: "Torrent Power", displayPrice: "₹5,409", extra: 5_409 },
] as const;

const fmtNum = (n: number) => Math.round(n).toLocaleString("en-IN");

export function computeQuotationNumbers(floor: string, structureHeight: string, discom: string) {
  const floorCost = FLOOR_SHEET_OPTIONS.find((o) => o.label === floor)?.extra ?? 0;
  const heightCost = HEIGHT_SHEET_OPTIONS.find((o) => o.label === structureHeight)?.extra ?? 0;
  const meterCost = DISCOM_SHEET_OPTIONS.find((o) => o.label === discom)?.extra ?? 0;

  const addOns = floorCost + heightCost + meterCost;
  const finalPrice = STANDARD_PRICE + addOns;

  // 1. Without loan
  const cashBeforeDispatch = finalPrice - BOOKING_AMOUNT;
  const cashNetAfterSubsidy = addOns;

  // 2. Nationalised bank loan (10% down, 90% loan)
  const bankDownPayment = Math.round(finalPrice * 0.1);
  const bankLoanAmount = Math.round(finalPrice * 0.9);
  const bankEmi = Math.round((BANK_BASE_EMI * bankLoanAmount) / BANK_BASE_LOAN);
  const bankInterest = Math.round((BANK_BASE_INTEREST * bankLoanAmount) / BANK_BASE_LOAN);
  const bankNetAfterSubsidy = addOns + bankInterest;

  // 3. NBFC loan (0% down, 100% loan)
  const nbfcLoanAmount = finalPrice;
  const nbfcEmi = Math.round((NBFC_BASE_EMI * nbfcLoanAmount) / NBFC_BASE_LOAN);
  const nbfcInterest = Math.round((NBFC_BASE_INTEREST * nbfcLoanAmount) / NBFC_BASE_LOAN);
  const nbfcNetAfterSubsidy = addOns + nbfcInterest;

  return {
    floorCost,
    heightCost,
    meterCost,
    addOns,
    finalPrice,
    cash: {
      beforeDispatch: cashBeforeDispatch,
      netAfterSubsidy: cashNetAfterSubsidy,
    },
    bank: {
      downPayment: bankDownPayment,
      loanAmount: bankLoanAmount,
      emi: bankEmi,
      interest: bankInterest,
      netAfterSubsidy: bankNetAfterSubsidy,
    },
    nbfc: {
      loanAmount: nbfcLoanAmount,
      emi: nbfcEmi,
      interest: nbfcInterest,
      netAfterSubsidy: nbfcNetAfterSubsidy,
    },
  };
}

/* ─── Minimal Single-Page JPEG → PDF 1.4 Generator ─── */
function jpegDataUrlToPdfBlob(jpegDataUrl: string, imgW: number, imgH: number): Blob {
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

/* ─── High-DPI Canvas Renderer matching quotation-form-2.18kW (4).pdf ─── */
async function generateQuotationPdfBlob(
  data: QuotationFormData,
  paymentMode: PaymentMode | null,
  quoteNo: string,
  quoteDate: string
): Promise<Blob> {
  const calc = computeQuotationNumbers(data.floor, data.structureHeight, data.discom);

  // Base coordinate system: 794 x 1123 (A4 @ 96 DPI), rendered at 2.25x scale = 1786 x 2527
  const W = 794;
  const H = 1123;
  const SCALE = 2.25;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * SCALE);
  canvas.height = Math.round(H * SCALE);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // Page background
  ctx.fillStyle = "#FAF8F4";
  ctx.fillRect(0, 0, W, H);

  const F_SANS = "'Inter', 'Segoe UI', Arial, sans-serif";
  const F_MONO = "'JetBrains Mono', 'Courier New', monospace";

  // Helper functions
  const drawText = (
    text: string,
    x: number,
    y: number,
    opts: {
      font?: string;
      color?: string;
      align?: CanvasTextAlign;
    } = {}
  ) => {
    ctx.font = opts.font || `400 10px ${F_SANS}`;
    ctx.fillStyle = opts.color || "#1E293B";
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x, y);
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = "#CBD5E1", width = 1) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };

  const drawCheckbox = (x: number, y: number, checked: boolean, size = 13) => {
    ctx.save();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = checked ? "#0A4D8C" : "#334155";
    ctx.fillStyle = checked ? "#0A4D8C" : "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 2);
    ctx.fill();
    ctx.stroke();
    if (checked) {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x + 2.8, y + size * 0.52);
      ctx.lineTo(x + size * 0.44, y + size - 3.2);
      ctx.lineTo(x + size - 2.6, y + 3.2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const M = 32; // left/right margin
  const CW = W - M * 2; // 730

  // Load Solarium logo if available
  try {
    const logoImg = new window.Image();
    logoImg.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = "/images/solarium-logo.png";
    });
    if (logoImg.naturalWidth > 0) {
      const lh = 34;
      const lw = (logoImg.naturalWidth / logoImg.naturalHeight) * lh;
      ctx.drawImage(logoImg, M, 28, lw, lh);
    } else {
      drawText("SOLARIUM", M, 52, { font: `800 22px ${F_SANS}`, color: "#0A4D8C" });
    }
  } catch {
    drawText("SOLARIUM", M, 52, { font: `800 22px ${F_SANS}`, color: "#0A4D8C" });
  }

  // Divider + PM Surya Ghar badge
  drawLine(200, 26, 200, 68, "#CBD5E1", 1);
  // Sun icon
  ctx.fillStyle = "#E67817";
  ctx.beginPath();
  ctx.arc(236, 40, 8, 0, Math.PI * 2);
  ctx.fill();
  drawText("PM Surya Ghar:", 212, 57, { font: `700 7.5px ${F_SANS}`, color: "#0F172A" });
  drawText("Muft Bijli Yojana", 212, 66, { font: `700 7.5px ${F_SANS}`, color: "#0F172A" });

  drawLine(282, 26, 282, 68, "#CBD5E1", 1);

  // Center Title
  drawText("ROOFTOP SOLAR · VEJALPUR, AHMEDABAD", 294, 37, {
    font: `700 9.5px ${F_SANS}`,
    color: "#D97724",
  });
  drawText("2.18 kW System Quotation", 294, 58, {
    font: `800 20px ${F_SANS}`,
    color: "#0F172A",
  });

  // Quote no. & Date on right
  drawText("Quote no.", 595, 39, { font: `500 9.5px ${F_SANS}`, color: "#475569" });
  drawLine(642, 41, M + CW, 41, "#334155", 1);
  drawText(quoteNo, 648, 39, { font: `700 9.5px ${F_MONO}`, color: "#0F172A" });

  drawText("Date", 595, 60, { font: `500 9.5px ${F_SANS}`, color: "#475569" });
  drawLine(622, 62, M + CW, 62, "#334155", 1);
  drawText(quoteDate, 630, 60, { font: `700 9.5px ${F_MONO}`, color: "#0F172A" });

  // Header bottom rule
  drawLine(M, 78, M + CW, 78, "#1E293B", 1.5);

  // ── Customer Details ──
  // Row 1
  drawText("CUSTOMER NAME (AS PER ELECTRICITY BILL)", M, 102, {
    font: `600 9.5px ${F_SANS}`,
    color: "#334155",
  });
  drawLine(250, 104, 515, 104, "#334155", 1);
  drawText(data.customerNameBill || "", 256, 101, {
    font: `700 10.5px ${F_SANS}`,
    color: "#0F172A",
  });

  drawText("MOBILE", 528, 102, { font: `600 9.5px ${F_SANS}`, color: "#334155" });
  drawLine(572, 104, M + CW, 104, "#334155", 1);
  drawText(data.mobile || "", 578, 101, { font: `700 10.5px ${F_MONO}`, color: "#0F172A" });

  // Row 2
  drawText("CUSTOMER NAME (AS PER BANK ACCOUNT)", M, 126, {
    font: `600 9.5px ${F_SANS}`,
    color: "#334155",
  });
  drawLine(238, 128, 515, 128, "#334155", 1);
  drawText(data.customerNameBank || "", 244, 125, {
    font: `700 10.5px ${F_SANS}`,
    color: "#0F172A",
  });

  drawText("CONSUMER NO.", 528, 126, { font: `600 9.5px ${F_SANS}`, color: "#334155" });
  drawLine(608, 128, M + CW, 128, "#334155", 1);
  drawText(data.consumerNo || "", 614, 125, { font: `700 10.5px ${F_MONO}`, color: "#0F172A" });

  // Row 3
  drawText("ADDRESS", M, 150, { font: `600 9.5px ${F_SANS}`, color: "#334155" });
  drawLine(84, 152, M + CW, 152, "#334155", 1);
  drawText(data.address || "", 90, 149, { font: `700 10.5px ${F_SANS}`, color: "#0F172A" });

  // ── 3 Selection Boxes ──
  const boxTop = 168;
  const headerH = 26;
  const rowH = 26;

  // Box 1: Floor (cable) — width 205
  const b1X = M;
  const b1W = 205;
  const b1H = headerH + rowH * 4;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(b1X, boxTop, b1W, b1H);
  ctx.fillStyle = "#0A4D8C";
  ctx.fillRect(b1X, boxTop, b1W, headerH);
  drawText("1 · Floor (cable)", b1X + 10, boxTop + 17, {
    font: `700 10.5px ${F_SANS}`,
    color: "#FFFFFF",
  });
  drawText("G+1 included", b1X + b1W - 8, boxTop + 16, {
    font: `400 8.5px ${F_SANS}`,
    color: "#DBEAFE",
    align: "right",
  });

  FLOOR_SHEET_OPTIONS.forEach((opt, i) => {
    const ry = boxTop + headerH + i * rowH;
    if (i > 0) drawLine(b1X, ry, b1X + b1W, ry, "#E2E8F0", 1);
    drawCheckbox(b1X + 10, ry + 6.5, data.floor === opt.label);
    drawText(opt.label, b1X + 30, ry + 17, { font: `500 10px ${F_SANS}`, color: "#0F172A" });
    drawText(opt.displayPrice, b1X + b1W - 10, ry + 17, {
      font: `600 9.5px ${F_MONO}`,
      color: opt.isIncluded ? "#1E7E45" : "#0F172A",
      align: "right",
    });
  });
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1;
  ctx.strokeRect(b1X, boxTop, b1W, b1H);

  // Box 2: Front-leg structure height — width 295
  const b2X = b1X + b1W + 12;
  const b2W = 295;
  const b2H = headerH + rowH * 3;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(b2X, boxTop, b2W, b2H);
  ctx.fillStyle = "#0A4D8C";
  ctx.fillRect(b2X, boxTop, b2W, headerH);
  drawText("2 · Front-leg structure height", b2X + 10, boxTop + 17, {
    font: `700 10.5px ${F_SANS}`,
    color: "#FFFFFF",
  });
  drawText("0.5 m incl.", b2X + b2W - 8, boxTop + 16, {
    font: `400 8.5px ${F_SANS}`,
    color: "#DBEAFE",
    align: "right",
  });

  const colW2 = b2W / 2;
  drawLine(b2X + colW2, boxTop + headerH, b2X + colW2, boxTop + b2H, "#E2E8F0", 1);
  for (let r = 0; r < 3; r++) {
    const ry = boxTop + headerH + r * rowH;
    if (r > 0) drawLine(b2X, ry, b2X + b2W, ry, "#E2E8F0", 1);
    const leftOpt = HEIGHT_SHEET_OPTIONS[r * 2];
    const rightOpt = HEIGHT_SHEET_OPTIONS[r * 2 + 1];

    // Left col
    drawCheckbox(b2X + 9, ry + 6.5, data.structureHeight === leftOpt.label);
    drawText(leftOpt.label, b2X + 27, ry + 17, { font: `500 10px ${F_SANS}`, color: "#0F172A" });
    drawText(leftOpt.displayPrice, b2X + colW2 - 8, ry + 17, {
      font: `600 9.5px ${F_MONO}`,
      color: leftOpt.isIncluded ? "#1E7E45" : "#0F172A",
      align: "right",
    });

    // Right col
    drawCheckbox(b2X + colW2 + 9, ry + 6.5, data.structureHeight === rightOpt.label);
    drawText(rightOpt.label, b2X + colW2 + 27, ry + 17, {
      font: `500 10px ${F_SANS}`,
      color: "#0F172A",
    });
    drawText(rightOpt.displayPrice, b2X + b2W - 8, ry + 17, {
      font: `600 9.5px ${F_MONO}`,
      color: "#0F172A",
      align: "right",
    });
  }
  ctx.strokeStyle = "#CBD5E1";
  ctx.strokeRect(b2X, boxTop, b2W, b2H);

  // Box 3: Meter charges — width 206
  const b3X = b2X + b2W + 12;
  const b3W = CW - b1W - b2W - 24;
  const b3H = headerH + rowH * 2;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(b3X, boxTop, b3W, b3H);
  ctx.fillStyle = "#0A4D8C";
  ctx.fillRect(b3X, boxTop, b3W, headerH);
  drawText("3 · Meter charges", b3X + 10, boxTop + 17, {
    font: `700 10.5px ${F_SANS}`,
    color: "#FFFFFF",
  });
  drawText("by DISCOM", b3X + b3W - 8, boxTop + 16, {
    font: `400 8.5px ${F_SANS}`,
    color: "#DBEAFE",
    align: "right",
  });

  DISCOM_SHEET_OPTIONS.forEach((opt, i) => {
    const ry = boxTop + headerH + i * rowH;
    if (i > 0) drawLine(b3X, ry, b3X + b3W, ry, "#E2E8F0", 1);
    drawCheckbox(b3X + 10, ry + 6.5, data.discom === opt.label);
    drawText(opt.label, b3X + 30, ry + 17, { font: `500 10px ${F_SANS}`, color: "#0F172A" });
    drawText(opt.displayPrice, b3X + b3W - 10, ry + 17, {
      font: `600 9.5px ${F_MONO}`,
      color: "#0F172A",
      align: "right",
    });
  });
  ctx.strokeStyle = "#CBD5E1";
  ctx.strokeRect(b3X, boxTop, b3W, b3H);

  // ── Final Price Section ──
  const fpTop = 310;
  const fpHeaderH = 26;
  const fpRowH = 24;
  const fpTotalH = fpHeaderH + fpRowH * 5;
  const halfW = CW / 2;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(M, fpTop, CW, fpTotalH);
  ctx.fillStyle = "#EFECE6";
  ctx.fillRect(M, fpTop, CW, fpHeaderH);
  drawLine(M, fpTop, M + CW, fpTop, "#CBD5E1", 1);
  drawLine(M, fpTop + fpHeaderH, M + CW, fpTop + fpHeaderH, "#CBD5E1", 1);

  drawText("Final price (including 5-year solar system insurance)", M + 10, fpTop + 17, {
    font: `700 11px ${F_SANS}`,
    color: "#0F172A",
  });
  drawText("₹97,290 + (1) + (2) + (3)", M + CW - 10, fpTop + 17, {
    font: `500 9.5px ${F_MONO}`,
    color: "#475569",
    align: "right",
  });

  // Left 5 rows
  const leftFpRows = [
    { label: "System price 2.18 kW", val: "₹1,08,100", color: "#0F172A", bold: false },
    { label: "Special discount", val: "− ₹10,810", color: "#1E7E45", bold: false },
    { label: "Standard system (upfront)", val: "₹97,290", color: "#0F172A", bold: true },
    { label: "Central Govt subsidy (credited later)", val: "₹63,240", color: "#1E7E45", bold: false },
    { label: "Gujarat Govt subsidy (credited later)", val: "₹34,050", color: "#1E7E45", bold: false },
  ];

  leftFpRows.forEach((r, idx) => {
    const ry = fpTop + fpHeaderH + idx * fpRowH;
    if (idx > 0) drawLine(M, ry, M + halfW, ry, "#E2E8F0", 1);
    drawText(r.label, M + 10, ry + 16, {
      font: `${r.bold ? 600 : 400} 10px ${F_SANS}`,
      color: "#1E293B",
    });
    drawText(r.val, M + halfW - 12, ry + 16, {
      font: `${r.bold ? 700 : 600} 10px ${F_MONO}`,
      color: r.color,
      align: "right",
    });
  });

  // Vertical center divider
  drawLine(M + halfW, fpTop + fpHeaderH, M + halfW, fpTop + fpTotalH, "#CBD5E1", 1);

  // Right 3 add-on rows + Final Price bar
  const rightAddOnRows = [
    { label: "(1) Floor", val: fmtNum(calc.floorCost) },
    { label: "(2) Structure height", val: fmtNum(calc.heightCost) },
    { label: "(3) Meter charges", val: fmtNum(calc.meterCost) },
  ];

  rightAddOnRows.forEach((r, idx) => {
    const ry = fpTop + fpHeaderH + idx * fpRowH;
    if (idx > 0) drawLine(M + halfW, ry, M + CW, ry, "#E2E8F0", 1);
    drawText(r.label, M + halfW + 12, ry + 16, { font: `400 10px ${F_SANS}`, color: "#1E293B" });
    drawText("+  ₹", M + CW - 115, ry + 16, { font: `600 10px ${F_MONO}`, color: "#1E293B" });
    drawLine(M + CW - 88, ry + 18, M + CW - 10, ry + 18, "#0F172A", 1.2);
    drawText(r.val, M + CW - 14, ry + 15.5, {
      font: `700 10.5px ${F_MONO}`,
      color: "#0A4D8C",
      align: "right",
    });
  });

  // Final Price highlight box (occupies rows 4 & 5 on the right)
  const fpBoxY = fpTop + fpHeaderH + 3 * fpRowH + 6;
  const fpBoxH = fpRowH * 2 - 6;
  ctx.fillStyle = "#FBF3E8";
  ctx.fillRect(M + halfW, fpBoxY, halfW, fpBoxH);
  drawLine(M + halfW, fpBoxY, M + CW, fpBoxY, "#D97724", 1.6);
  drawLine(M + halfW, fpBoxY + fpBoxH, M + CW, fpBoxY + fpBoxH, "#D97724", 1.6);

  drawText("Final price", M + halfW + 12, fpBoxY + 26, {
    font: `800 12px ${F_SANS}`,
    color: "#0F172A",
  });
  drawText("₹", M + CW - 102, fpBoxY + 26, { font: `700 11px ${F_MONO}`, color: "#0F172A" });
  drawLine(M + CW - 88, fpBoxY + 28, M + CW - 10, fpBoxY + 28, "#0F172A", 1.4);
  drawText(fmtNum(calc.finalPrice), M + CW - 14, fpBoxY + 25.5, {
    font: `800 12px ${F_MONO}`,
    color: "#0A4D8C",
    align: "right",
  });

  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1;
  ctx.strokeRect(M, fpTop, CW, fpTotalH);

  // ── Payment Mode & Terms Section ──
  const pmTop = 468;
  const pmHeaderH = 26;
  const pmSubH = 28;
  const pmBodyH = 200;
  const pmNetH = 38;
  const pmFootH = 28;
  const pmTotalH = pmHeaderH + pmSubH + pmBodyH + pmNetH + pmFootH;
  const col3W = CW / 3;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(M, pmTop, CW, pmTotalH);

  // Header
  ctx.fillStyle = "#EFECE6";
  ctx.fillRect(M, pmTop, CW, pmHeaderH);
  drawText("Payment mode & terms", M + 10, pmTop + 17, {
    font: `700 11px ${F_SANS}`,
    color: "#0F172A",
  });
  drawText("tick one", M + CW - 10, pmTop + 17, {
    font: `400 9.5px ${F_SANS}`,
    color: "#475569",
    align: "right",
  });

  // 3 Column Subheaders
  const subY = pmTop + pmHeaderH;
  ctx.fillStyle = "#E3ECF5";
  ctx.fillRect(M, subY, CW, pmSubH);
  drawLine(M, subY, M + CW, subY, "#CBD5E1", 1);
  drawLine(M, subY + pmSubH, M + CW, subY + pmSubH, "#CBD5E1", 1);

  const colTitles: { mode: PaymentMode; label: string }[] = [
    { mode: "cash", label: "Without loan" },
    { mode: "bank", label: "Nationalised bank loan" },
    { mode: "nbfc", label: "NBFC loan" },
  ];

  colTitles.forEach((c, idx) => {
    const cx = M + idx * col3W;
    if (idx > 0) {
      drawLine(cx, subY, cx, pmTop + pmHeaderH + pmSubH + pmBodyH + pmNetH, "#CBD5E1", 1);
    }
    drawCheckbox(cx + 10, subY + 7.5, paymentMode === c.mode);
    drawText(c.label, cx + 30, subY + 18, { font: `700 10.5px ${F_SANS}`, color: "#0F172A" });
  });

  const bodyY = subY + pmSubH;

  // Helper for black-line fill inside a column
  const drawBlankLineValue = (
    cx: number,
    y: number,
    value: string | null,
    lineStartOffset = 132
  ) => {
    drawText("₹", cx + lineStartOffset - 10, y, {
      font: `500 9.5px ${F_MONO}`,
      color: "#475569",
    });
    drawLine(cx + lineStartOffset, y + 2, cx + col3W - 10, y + 2, "#0F172A", 1.1);
    if (value !== null) {
      drawText(value, cx + col3W - 14, y - 0.5, {
        font: `700 10px ${F_MONO}`,
        color: "#0A4D8C",
        align: "right",
      });
    }
  };

  // Column 1: Without loan
  const c1X = M;
  const isCash = paymentMode === "cash";
  drawText("Booking amount", c1X + 10, bodyY + 20, {
    font: `500 10px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("₹10,000", c1X + col3W - 10, bodyY + 20, {
    font: `700 10px ${F_MONO}`,
    color: "#0F172A",
    align: "right",
  });
  drawLine(c1X + 10, bodyY + 30, c1X + col3W - 10, bodyY + 30, "#E2E8F0", 1);

  drawText("Before dispatch", c1X + 10, bodyY + 46, {
    font: `500 10px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("Final price − ₹10,000", c1X + 10, bodyY + 60, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c1X, bodyY + 60, isCash ? fmtNum(calc.cash.beforeDispatch) : null);
  drawLine(c1X + 10, bodyY + 70, c1X + col3W - 10, bodyY + 70, "#E2E8F0", 1);

  drawText("Loan / EMI / interest", c1X + 10, bodyY + 88, {
    font: `500 10px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("—", c1X + col3W - 10, bodyY + 88, {
    font: `600 10px ${F_SANS}`,
    color: "#0F172A",
    align: "right",
  });

  // Column 2: Nationalised bank loan
  const c2X = M + col3W;
  const isBank = paymentMode === "bank";
  drawText("Down payment 10% (base ₹9,729)", c2X + 10, bodyY + 18, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("10% of final price", c2X + 10, bodyY + 32, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c2X, bodyY + 32, isBank ? fmtNum(calc.bank.downPayment) : null);
  drawLine(c2X + 10, bodyY + 40, c2X + col3W - 10, bodyY + 40, "#E2E8F0", 1);

  drawText("Loan amount 90% (base ₹87,561)", c2X + 10, bodyY + 55, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("90% of final price", c2X + 10, bodyY + 69, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c2X, bodyY + 69, isBank ? fmtNum(calc.bank.loanAmount) : null);
  drawLine(c2X + 10, bodyY + 77, c2X + col3W - 10, bodyY + 77, "#E2E8F0", 1);

  drawText("Loan tenure", c2X + 10, bodyY + 94, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("5 years (60 months)", c2X + col3W - 10, bodyY + 94, {
    font: `700 9.5px ${F_SANS}`,
    color: "#0F172A",
    align: "right",
  });
  drawLine(c2X + 10, bodyY + 103, c2X + col3W - 10, bodyY + 103, "#E2E8F0", 1);

  drawText("Estimated monthly EMI", c2X + 10, bodyY + 118, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("₹1,715 + on add-ons", c2X + 10, bodyY + 132, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c2X, bodyY + 132, isBank ? fmtNum(calc.bank.emi) : null);
  drawLine(c2X + 10, bodyY + 140, c2X + col3W - 10, bodyY + 140, "#E2E8F0", 1);

  drawText("Total estimated interest in 3 EMIs", c2X + 10, bodyY + 156, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("₹1,310 + on add-ons", c2X + 10, bodyY + 170, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c2X, bodyY + 170, isBank ? fmtNum(calc.bank.interest) : null);

  // Column 3: NBFC loan
  const c3X = M + col3W * 2;
  const isNbfc = paymentMode === "nbfc";
  drawText("Down payment 0%", c3X + 10, bodyY + 20, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("₹0", c3X + col3W - 10, bodyY + 20, {
    font: `700 10px ${F_MONO}`,
    color: "#0F172A",
    align: "right",
  });
  drawLine(c3X + 10, bodyY + 30, c3X + col3W - 10, bodyY + 30, "#E2E8F0", 1);

  drawText("Loan amount 100% (base ₹97,290)", c3X + 10, bodyY + 46, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("100% of final price", c3X + 10, bodyY + 60, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c3X, bodyY + 60, isNbfc ? fmtNum(calc.nbfc.loanAmount) : null);
  drawLine(c3X + 10, bodyY + 69, c3X + col3W - 10, bodyY + 69, "#E2E8F0", 1);

  drawText("Loan tenure", c3X + 10, bodyY + 86, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("5 years (60 months)", c3X + col3W - 10, bodyY + 86, {
    font: `700 9.5px ${F_SANS}`,
    color: "#0F172A",
    align: "right",
  });
  drawLine(c3X + 10, bodyY + 95, c3X + col3W - 10, bodyY + 95, "#E2E8F0", 1);

  drawText("Estimated monthly EMI", c3X + 10, bodyY + 112, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("₹2,351 + on add-ons", c3X + 10, bodyY + 126, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c3X, bodyY + 126, isNbfc ? fmtNum(calc.nbfc.emi) : null);
  drawLine(c3X + 10, bodyY + 135, c3X + col3W - 10, bodyY + 135, "#E2E8F0", 1);

  drawText("Total estimated interest in 3 EMIs", c3X + 10, bodyY + 152, {
    font: `500 9.5px ${F_SANS}`,
    color: "#1E293B",
  });
  drawText("₹3,780 + on add-ons", c3X + 10, bodyY + 166, {
    font: `400 8.5px ${F_SANS}`,
    color: "#64748B",
  });
  drawBlankLineValue(c3X, bodyY + 166, isNbfc ? fmtNum(calc.nbfc.interest) : null);

  // Net cost after subsidy bar across all 3 columns
  const netY = bodyY + pmBodyH;
  ctx.fillStyle = "#FBF3E8";
  ctx.fillRect(M, netY, CW, pmNetH);
  drawLine(M, netY, M + CW, netY, "#D97724", 1.6);
  drawLine(M, netY + pmNetH, M + CW, netY + pmNetH, "#D97724", 1.6);
  drawLine(M + col3W, netY, M + col3W, netY + pmNetH, "#CBD5E1", 1);
  drawLine(M + col3W * 2, netY, M + col3W * 2, netY + pmNetH, "#CBD5E1", 1);

  const netCols = [
    { x: c1X, sub: "(1)+(2)+(3)", val: isCash ? fmtNum(calc.cash.netAfterSubsidy) : null },
    { x: c2X, sub: "(1)+(2)+(3)+interest", val: isBank ? fmtNum(calc.bank.netAfterSubsidy) : null },
    { x: c3X, sub: "(1)+(2)+(3)+interest", val: isNbfc ? fmtNum(calc.nbfc.netAfterSubsidy) : null },
  ];
  netCols.forEach((nc) => {
    drawText("Net cost after subsidy", nc.x + 10, netY + 15, {
      font: `700 10px ${F_SANS}`,
      color: "#0F172A",
    });
    drawText(nc.sub, nc.x + 10, netY + 29, { font: `400 8.5px ${F_SANS}`, color: "#64748B" });
    drawBlankLineValue(nc.x, netY + 29, nc.val, 132);
  });

  // Amount received & Payment ref. no.
  const amtY = netY + pmNetH;
  drawText("Amount received  ₹", M + 10, amtY + 18, {
    font: `400 9.5px ${F_SANS}`,
    color: "#475569",
  });
  drawLine(M + 105, amtY + 20, M + 295, amtY + 20, "#475569", 1);

  drawText("Payment ref. no.", M + 345, amtY + 18, {
    font: `400 9.5px ${F_SANS}`,
    color: "#475569",
  });
  drawLine(M + 426, amtY + 20, M + CW - 10, amtY + 20, "#475569", 1);

  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1;
  ctx.strokeRect(M, pmTop, CW, pmTotalH);

  // ── Notes ──
  const notesTop = 804;
  drawText("Notes", M + 4, notesTop, { font: `700 10.5px ${F_SANS}`, color: "#0F172A" });
  const notesList = [
    "Standard system includes 2.18 kW solar panels (545 Wp Solarium brand × 4 panels) and inverter, 0.5 m front-leg structure, ground floor / G+1 cabling, installation and commissioning, subsidy support and 5 years solar insurance.",
    "Subsidy is subject to eligibility and government approval. Add-ons (1)+(2)+(3) are included in the loan.",
    "Subsidy is estimated to be repaid in the 4th month of installation; estimated interest covers the 3 EMIs before that.",
    "Any change in DISCOM (UGVCL / Torrent) or government charges will apply at actuals.",
    "If the name on the electricity bill and the bank account is different, a name change is required.",
  ];
  notesList.forEach((n, idx) => {
    const ny = notesTop + 16 + idx * 15;
    drawText("•", M + 4, ny, { font: `700 10px ${F_SANS}`, color: "#D97724" });
    drawText(n, M + 14, ny, { font: `400 8.6px ${F_SANS}`, color: "#334155" });
  });

  // ── Documents Required ──
  const docTop = 898;
  const docH = 48;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(M, docTop, CW, docH);
  ctx.strokeStyle = "#CBD5E1";
  ctx.strokeRect(M, docTop, CW, docH);

  drawText("Documents required", M + 12, docTop + 17, {
    font: `700 10px ${F_SANS}`,
    color: "#0F172A",
  });
  const docs = [
    "Electricity bill",
    "Bank passbook",
    "Aadhaar card",
    "PAN card",
    "House photo",
    "Rooftop photo",
  ];
  let dx = M + 12;
  docs.forEach((d) => {
    drawCheckbox(dx, docTop + 25, false, 12);
    drawText(d, dx + 17, docTop + 35, { font: `400 9.5px ${F_SANS}`, color: "#1E293B" });
    dx += ctx.measureText(d).width + 36;
  });

  // ── Signatures ──
  const sigLineY = 1002;
  drawLine(M, sigLineY, M + 340, sigLineY, "#334155", 1);
  drawText("Customer signature", M, sigLineY + 15, {
    font: `400 9.5px ${F_SANS}`,
    color: "#475569",
  });

  drawLine(M + 390, sigLineY, M + CW, sigLineY, "#334155", 1);
  drawText("Sales person (name & signature)", M + 390, sigLineY + 15, {
    font: `400 9.5px ${F_SANS}`,
    color: "#475569",
  });

  // ── Bottom Blue Trust Bar ──
  const footTop = 1034;
  const footH = 54;
  ctx.fillStyle = "#0A4D8C";
  ctx.beginPath();
  ctx.roundRect(M, footTop, CW, footH, 6);
  ctx.fill();

  const stats = [
    { top: "22,000+", bot: "families trust us" },
    { top: "8+ years", bot: "of experience" },
    { top: "BSE listed", bot: "company" },
    { top: "Free 5-year", bot: "solar insurance" },
  ];
  const statW = CW / 4;
  stats.forEach((st, idx) => {
    const sx = M + idx * statW;
    if (idx > 0) {
      drawLine(sx, footTop + 12, sx, footTop + footH - 12, "rgba(255,255,255,0.22)", 1);
    }
    drawText(st.top, sx + statW / 2, footTop + 26, {
      font: `800 14px ${F_SANS}`,
      color: "#FBBF24",
      align: "center",
    });
    drawText(st.bot, sx + statW / 2, footTop + 42, {
      font: `400 9.5px ${F_SANS}`,
      color: "#E2E8F0",
      align: "center",
    });
  });

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
  return jpegDataUrlToPdfBlob(jpegDataUrl, canvas.width, canvas.height);
}

/* ─── Checkbox UI helper for the live sheet ─── */
function SheetCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border-[1.5px] transition-colors ${
        checked ? "border-[#0A4D8C] bg-[#0A4D8C] text-white" : "border-slate-700 bg-white"
      }`}
    >
      {checked && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
    </span>
  );
}

/* ─── Blank black line value helper for the live sheet ─── */
function BlankLineValue({
  value,
  prefix = "₹",
  bold = false,
}: {
  value: string | null;
  prefix?: string;
  bold?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1 font-mono">
      <span className="text-[10px] font-semibold text-slate-700">{prefix}</span>
      <span
        className={`inline-block min-w-[76px] border-b-[1.5px] border-slate-900 px-1 text-right leading-tight ${
          bold ? "text-[12.5px] font-extrabold text-[#0A4D8C]" : "text-[11px] font-bold text-[#0A4D8C]"
        }`}
      >
        {value !== null ? value : "\u00A0"}
      </span>
    </span>
  );
}

/* ─── Main Interactive Quotation Sheet Modal ─── */
export default function QuotationSheetModal({
  data,
  onClose,
}: {
  data: QuotationFormData;
  onClose: () => void;
}) {
  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>("cash");
  const [downloading, setDownloading] = useState(false);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const quoteNo = `SOL-${data.mobile ? data.mobile.slice(-4) : "2180"}`;

  const calc = computeQuotationNumbers(data.floor, data.structureHeight, data.discom);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const pdfBlob = await generateQuotationPdfBlob(data, paymentMode, quoteNo, todayStr);
      const url = URL.createObjectURL(pdfBlob);
      const safeName = (data.customerNameBill || "Customer")
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "-");
      const a = document.createElement("a");
      a.href = url;
      a.download = `Solarium-Quotation-2.18kW-${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setDownloading(false);
    }
  }

  const isCash = paymentMode === "cash";
  const isBank = paymentMode === "bank";
  const isNbfc = paymentMode === "nbfc";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02182B]/80 p-2 backdrop-blur-sm sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="2.18 kW System Quotation"
    >
      <div
        className="relative flex max-h-[95vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-[#FAF8F4] shadow-[0_32px_90px_-15px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sticky Action Bar at Top ── */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-[#072B4F] px-4 py-3 text-white sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange">
              Live Quotation Preview
            </p>
            <p className="text-[12px] text-white/80">
              Click any payment mode column below to tick it and update the lines live, then download your PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quotation preview"
            className="rounded-full bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable Offline Quotation Sheet Clone ── */}
        <div className="overflow-y-auto p-2.5 sm:p-7">
          <div className="mx-auto max-w-[820px] rounded-lg border border-slate-300 bg-[#FAF8F4] p-3 text-slate-900 shadow-sm sm:p-6">
            {/* 1. Sheet Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3.5 sm:gap-4">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Image
                  src="/images/solarium-logo.png"
                  alt="Solarium"
                  width={150}
                  height={50}
                  className="h-8 w-auto object-contain sm:h-9"
                />
                <div className="h-8 w-px bg-slate-300 sm:h-9" />
                <div className="text-center leading-tight">
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-orange" />
                  <p className="text-[8.5px] font-bold text-slate-800">PM Surya Ghar:</p>
                  <p className="text-[8.5px] font-bold text-slate-800">Muft Bijli Yojana</p>
                </div>
                <div className="hidden h-9 w-px bg-slate-300 sm:block" />
                <div className="w-full sm:w-auto">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#D97724]">
                    ROOFTOP SOLAR · VEJALPUR, AHMEDABAD
                  </p>
                  <h2 className="font-display text-[17px] font-extrabold tracking-tight text-slate-900 sm:text-[22px]">
                    2.18 kW System Quotation
                  </h2>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center justify-between gap-3 text-[10.5px] sm:w-auto sm:block sm:space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-600">Quote no.</span>
                  <span className="min-w-[100px] border-b border-slate-800 px-1.5 font-mono font-bold text-slate-900 sm:min-w-[110px]">
                    {quoteNo}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-600">Date</span>
                  <span className="min-w-[90px] border-b border-slate-800 px-1.5 font-mono font-bold text-slate-900 sm:min-w-[110px]">
                    {todayStr}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer Details on Blank Black Lines */}
            <div className="mt-3.5 space-y-2.5 text-[10.5px]">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1.65fr_1fr] sm:gap-3">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="shrink-0 text-[9.5px] font-semibold uppercase text-slate-700 sm:text-[10.5px]">
                    CUSTOMER NAME (AS PER ELECTRICITY BILL)
                  </span>
                  <span className="min-h-[20px] flex-1 border-b border-slate-800 px-1.5 font-bold text-[#0A4D8C]">
                    {data.customerNameBill}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 font-semibold uppercase text-slate-700">MOBILE</span>
                  <span className="min-h-[20px] flex-1 border-b border-slate-800 px-1.5 font-mono font-bold text-[#0A4D8C]">
                    {data.mobile}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1.65fr_1fr] sm:gap-3">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="shrink-0 text-[9.5px] font-semibold uppercase text-slate-700 sm:text-[10.5px]">
                    CUSTOMER NAME (AS PER BANK ACCOUNT)
                  </span>
                  <span className="min-h-[20px] flex-1 border-b border-slate-800 px-1.5 font-bold text-[#0A4D8C]">
                    {data.customerNameBank}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 font-semibold uppercase text-slate-700">
                    CONSUMER NO.
                  </span>
                  <span className="min-h-[20px] flex-1 border-b border-slate-800 px-1.5 font-mono font-bold text-[#0A4D8C]">
                    {data.consumerNo}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                <span className="shrink-0 font-semibold uppercase text-slate-700">ADDRESS</span>
                <span className="min-h-[20px] flex-1 border-b border-slate-800 px-1.5 font-bold text-[#0A4D8C]">
                  {data.address}
                </span>
              </div>
            </div>

            {/* 3. Three Selection Boxes (Floor, Front-leg structure height, Meter charges) */}
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1.05fr_1.45fr_1fr]">
              {/* Box 1: Floor */}
              <div className="overflow-hidden rounded border border-slate-300 bg-white">
                <div className="flex items-center justify-between bg-[#0A4D8C] px-2.5 py-1.5 text-white">
                  <span className="text-[11px] font-bold">1 · Floor (cable)</span>
                  <span className="text-[9px] text-blue-100">G+1 included</span>
                </div>
                <div className="divide-y divide-slate-200 text-[10.5px]">
                  {FLOOR_SHEET_OPTIONS.map((opt) => {
                    const checked = data.floor === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => data.onFloorChange?.(opt.label)}
                        className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left transition ${
                          checked ? "bg-blue-50/70 font-semibold" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <SheetCheckbox checked={checked} />
                          <span>{opt.label}</span>
                        </span>
                        <span
                          className={`font-mono text-[10px] font-semibold ${
                            opt.isIncluded ? "text-emerald-700" : "text-slate-800"
                          }`}
                        >
                          {opt.displayPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Box 2: Structure height */}
              <div className="overflow-hidden rounded border border-slate-300 bg-white">
                <div className="flex items-center justify-between bg-[#0A4D8C] px-2.5 py-1.5 text-white">
                  <span className="text-[11px] font-bold">2 · Front-leg structure height</span>
                  <span className="text-[9px] text-blue-100">0.5 m incl.</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200 text-[10.5px]">
                  {[0, 1].map((colIdx) => (
                    <div key={colIdx} className="divide-y divide-slate-200">
                      {[0, 1, 2].map((rowIdx) => {
                        const opt = HEIGHT_SHEET_OPTIONS[rowIdx * 2 + colIdx];
                        const checked = data.structureHeight === opt.label;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => data.onHeightChange?.(opt.label)}
                            className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left transition ${
                              checked ? "bg-blue-50/70 font-semibold" : "hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <SheetCheckbox checked={checked} />
                              <span>{opt.label}</span>
                            </span>
                            <span
                              className={`font-mono text-[10px] font-semibold ${
                                opt.isIncluded ? "text-emerald-700" : "text-slate-800"
                              }`}
                            >
                              {opt.displayPrice}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Meter charges */}
              <div className="overflow-hidden rounded border border-slate-300 bg-white">
                <div className="flex items-center justify-between bg-[#0A4D8C] px-2.5 py-1.5 text-white">
                  <span className="text-[11px] font-bold">3 · Meter charges</span>
                  <span className="text-[9px] text-blue-100">by DISCOM</span>
                </div>
                <div className="divide-y divide-slate-200 text-[10.5px]">
                  {DISCOM_SHEET_OPTIONS.map((opt) => {
                    const checked = data.discom === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => data.onDiscomChange?.(opt.label)}
                        className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left transition ${
                          checked ? "bg-blue-50/70 font-semibold" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <SheetCheckbox checked={checked} />
                          <span>{opt.label}</span>
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-slate-800">
                          {opt.displayPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Final Price (including 5-year solar system insurance) */}
            <div className="mt-4 overflow-hidden rounded border border-slate-300 bg-white">
              <div className="flex items-center justify-between border-b border-slate-300 bg-[#EFECE6] px-3 py-1.5">
                <span className="text-[11.5px] font-bold text-slate-900">
                  Final price (including 5-year solar system insurance)
                </span>
                <span className="font-mono text-[10px] text-slate-600">
                  ₹97,290 + (1) + (2) + (3)
                </span>
              </div>

              <div className="grid grid-cols-1 divide-y divide-slate-300 md:grid-cols-2 md:divide-x md:divide-y-0">
                {/* Left column: system & subsidies */}
                <div className="divide-y divide-slate-200 text-[11px]">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span>System price 2.18 kW</span>
                    <span className="font-mono font-semibold">₹1,08,100</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span>Special discount</span>
                    <span className="font-mono font-semibold text-emerald-700">− ₹10,810</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5 font-semibold">
                    <span>Standard system (upfront)</span>
                    <span className="font-mono font-bold">₹97,290</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span>
                      Central Govt subsidy{" "}
                      <span className="text-[9.5px] text-slate-500">(credited later)</span>
                    </span>
                    <span className="font-mono font-semibold text-emerald-700">₹63,240</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span>
                      Gujarat Govt subsidy{" "}
                      <span className="text-[9.5px] text-slate-500">(credited later)</span>
                    </span>
                    <span className="font-mono font-semibold text-emerald-700">₹34,050</span>
                  </div>
                </div>

                {/* Right column: (1) + (2) + (3) & Final price on black lines */}
                <div className="flex flex-col justify-between divide-y divide-slate-200 text-[11px]">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span>(1) Floor</span>
                    <BlankLineValue value={fmtNum(calc.floorCost)} prefix="+ ₹" />
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span>(2) Structure height</span>
                    <BlankLineValue value={fmtNum(calc.heightCost)} prefix="+ ₹" />
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span>(3) Meter charges</span>
                    <BlankLineValue value={fmtNum(calc.meterCost)} prefix="+ ₹" />
                  </div>
                  <div className="flex flex-1 items-center justify-between border-y-2 border-[#D97724] bg-[#FBF3E8] px-3 py-2.5">
                    <span className="text-[12.5px] font-extrabold text-slate-900">Final price</span>
                    <BlankLineValue value={fmtNum(calc.finalPrice)} prefix="₹" bold />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Payment Mode & Terms (tick one — interactive 3 columns) */}
            <div className="mt-4 overflow-hidden rounded border border-slate-300 bg-white">
              <div className="flex items-center justify-between border-b border-slate-300 bg-[#EFECE6] px-3 py-1.5">
                <span className="text-[11.5px] font-bold text-slate-900">
                  Payment mode &amp; terms
                </span>
                <span className="text-[10px] font-medium text-slate-600">tick one</span>
              </div>

              <div className="grid grid-cols-1 divide-y divide-slate-300 md:grid-cols-3 md:divide-x md:divide-y-0">
                {/* Column 1: Without loan */}
                <div
                  onClick={() => { setPaymentMode("cash"); data.onPaymentModeChange?.("cash"); }}
                  className={`flex cursor-pointer flex-col justify-between transition ${
                    isCash ? "bg-blue-50/35" : "hover:bg-slate-50/70"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-300 bg-[#E3ECF5] px-3 py-2">
                      <SheetCheckbox checked={isCash} />
                      <span className="text-[11px] font-bold text-slate-900">Without loan</span>
                    </div>
                    <div className="divide-y divide-slate-200 px-3 text-[10.5px]">
                      <div className="flex items-center justify-between py-2">
                        <span>Booking amount</span>
                        <span className="font-mono font-bold">₹10,000</span>
                      </div>
                      <div className="py-2">
                        <div className="font-medium">Before dispatch</div>
                        <div className="mt-1 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>Final price − ₹10,000</span>
                          <BlankLineValue
                            value={isCash ? fmtNum(calc.cash.beforeDispatch) : null}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span>Loan / EMI / interest</span>
                        <span className="font-bold">—</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-y-2 border-[#D97724] bg-[#FBF3E8] px-3 py-2">
                    <div className="text-[11px] font-bold text-slate-900">
                      Net cost after subsidy
                    </div>
                    <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-600">
                      <span>(1)+(2)+(3)</span>
                      <BlankLineValue
                        value={isCash ? fmtNum(calc.cash.netAfterSubsidy) : null}
                        bold
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Nationalised bank loan */}
                <div
                  onClick={() => { setPaymentMode("bank"); data.onPaymentModeChange?.("bank"); }}
                  className={`flex cursor-pointer flex-col justify-between transition ${
                    isBank ? "bg-blue-50/35" : "hover:bg-slate-50/70"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-300 bg-[#E3ECF5] px-3 py-2">
                      <SheetCheckbox checked={isBank} />
                      <span className="text-[11px] font-bold text-slate-900">
                        Nationalised bank loan
                      </span>
                    </div>
                    <div className="divide-y divide-slate-200 px-3 text-[10.5px]">
                      <div className="py-1.5">
                        <div className="font-medium">
                          Down payment 10%{" "}
                          <span className="text-[9.5px] text-slate-500">(base ₹9,729)</span>
                        </div>
                        <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>10% of final price</span>
                          <BlankLineValue value={isBank ? fmtNum(calc.bank.downPayment) : null} />
                        </div>
                      </div>

                      <div className="py-1.5">
                        <div className="font-medium">
                          Loan amount 90%{" "}
                          <span className="text-[9.5px] text-slate-500">(base ₹87,561)</span>
                        </div>
                        <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>90% of final price</span>
                          <BlankLineValue value={isBank ? fmtNum(calc.bank.loanAmount) : null} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1.5">
                        <span>Loan tenure</span>
                        <span className="font-bold">5 years (60 months)</span>
                      </div>

                      <div className="py-1.5">
                        <div className="font-medium">Estimated monthly EMI</div>
                        <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>₹1,715 + on add-ons</span>
                          <BlankLineValue value={isBank ? fmtNum(calc.bank.emi) : null} />
                        </div>
                      </div>

                      <div className="py-1.5">
                        <div className="font-medium">Total estimated interest in 3 EMIs</div>
                        <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>₹1,310 + on add-ons</span>
                          <BlankLineValue value={isBank ? fmtNum(calc.bank.interest) : null} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-y-2 border-[#D97724] bg-[#FBF3E8] px-3 py-2">
                    <div className="text-[11px] font-bold text-slate-900">
                      Net cost after subsidy
                    </div>
                    <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-600">
                      <span>(1)+(2)+(3)+interest</span>
                      <BlankLineValue
                        value={isBank ? fmtNum(calc.bank.netAfterSubsidy) : null}
                        bold
                      />
                    </div>
                  </div>
                </div>

                {/* Column 3: NBFC loan */}
                <div
                  onClick={() => { setPaymentMode("nbfc"); data.onPaymentModeChange?.("nbfc"); }}
                  className={`flex cursor-pointer flex-col justify-between transition ${
                    isNbfc ? "bg-blue-50/35" : "hover:bg-slate-50/70"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-300 bg-[#E3ECF5] px-3 py-2">
                      <SheetCheckbox checked={isNbfc} />
                      <span className="text-[11px] font-bold text-slate-900">NBFC loan</span>
                    </div>
                    <div className="divide-y divide-slate-200 px-3 text-[10.5px]">
                      <div className="flex items-center justify-between py-2">
                        <span>Down payment 0%</span>
                        <span className="font-mono font-bold">₹0</span>
                      </div>

                      <div className="py-1.5">
                        <div className="font-medium">
                          Loan amount 100%{" "}
                          <span className="text-[9.5px] text-slate-500">(base ₹97,290)</span>
                        </div>
                        <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>100% of final price</span>
                          <BlankLineValue value={isNbfc ? fmtNum(calc.nbfc.loanAmount) : null} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1.5">
                        <span>Loan tenure</span>
                        <span className="font-bold">5 years (60 months)</span>
                      </div>

                      <div className="py-1.5">
                        <div className="font-medium">Estimated monthly EMI</div>
                        <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>₹2,351 + on add-ons</span>
                          <BlankLineValue value={isNbfc ? fmtNum(calc.nbfc.emi) : null} />
                        </div>
                      </div>

                      <div className="py-1.5">
                        <div className="font-medium">Total estimated interest in 3 EMIs</div>
                        <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-500">
                          <span>₹3,780 + on add-ons</span>
                          <BlankLineValue value={isNbfc ? fmtNum(calc.nbfc.interest) : null} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-y-2 border-[#D97724] bg-[#FBF3E8] px-3 py-2">
                    <div className="text-[11px] font-bold text-slate-900">
                      Net cost after subsidy
                    </div>
                    <div className="mt-0.5 flex items-baseline justify-between text-[9.5px] text-slate-600">
                      <span>(1)+(2)+(3)+interest</span>
                      <BlankLineValue
                        value={isNbfc ? fmtNum(calc.nbfc.netAfterSubsidy) : null}
                        bold
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount received & Payment ref. no. */}
              <div className="grid grid-cols-1 gap-3 px-3 py-2 text-[10px] text-slate-600 sm:grid-cols-2">
                <div className="flex items-baseline gap-2">
                  <span>Amount received ₹</span>
                  <span className="flex-1 border-b border-slate-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span>Payment ref. no.</span>
                  <span className="flex-1 border-b border-slate-500" />
                </div>
              </div>
            </div>

            {/* 6. Notes */}
            <div className="mt-3.5">
              <p className="text-[11px] font-bold text-slate-900">Notes</p>
              <ul className="mt-1 space-y-0.5 text-[9.5px] leading-relaxed text-slate-700">
                <li className="flex gap-1.5">
                  <span className="font-bold text-[#D97724]">•</span>
                  <span>
                    Standard system includes 2.18 kW solar panels (545 Wp Solarium brand × 4 panels)
                    and inverter, 0.5 m front-leg structure, ground floor / G+1 cabling,
                    installation and commissioning, subsidy support and 5 years solar insurance.
                  </span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-[#D97724]">•</span>
                  <span>
                    Subsidy is subject to eligibility and government approval. Add-ons (1)+(2)+(3)
                    are included in the loan.
                  </span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-[#D97724]">•</span>
                  <span>
                    Subsidy is estimated to be repaid in the 4th month of installation; estimated
                    interest covers the 3 EMIs before that.
                  </span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-[#D97724]">•</span>
                  <span>
                    Any change in DISCOM (UGVCL / Torrent) or government charges will apply at
                    actuals.
                  </span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-[#D97724]">•</span>
                  <span>
                    If the name on the electricity bill and the bank account is different, a name
                    change is required.
                  </span>
                </li>
              </ul>
            </div>

            {/* 7. Documents Required */}
            <div className="mt-3.5 rounded border border-slate-300 bg-white px-3 py-2.5">
              <p className="text-[10.5px] font-bold text-slate-900">Documents required</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10px] text-slate-800">
                {[
                  "Electricity bill",
                  "Bank passbook",
                  "Aadhaar card",
                  "PAN card",
                  "House photo",
                  "Rooftop photo",
                ].map((doc) => (
                  <span key={doc} className="inline-flex items-center gap-1.5">
                    <SheetCheckbox checked={false} />
                    <span>{doc}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 8. Signatures */}
            <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] text-slate-600">
              <div className="border-t border-slate-700 pt-1">Customer signature</div>
              <div className="border-t border-slate-700 pt-1">
                Sales person (name &amp; signature)
              </div>
            </div>

            {/* 9. Bottom Navy Banner */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-[#0A4D8C] py-3 text-center text-white sm:grid-cols-4 sm:divide-x sm:divide-white/20">
              <div>
                <p className="text-[14px] font-extrabold text-amber-400">22,000+</p>
                <p className="text-[9.5px] text-white/85">families trust us</p>
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-amber-400">8+ years</p>
                <p className="text-[9.5px] text-white/85">of experience</p>
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-amber-400">BSE listed</p>
                <p className="text-[9.5px] text-white/85">company</p>
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-amber-400">Free 5-year</p>
                <p className="text-[9.5px] text-white/85">solar insurance</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Sticky Download Bar ── */}
        <div className="flex flex-col items-stretch justify-between gap-2.5 border-t border-slate-200 bg-[#0b1726] px-4 py-3 text-white sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-3.5">
          <p className="text-center text-[11px] text-white/75 sm:text-left sm:text-[11.5px]">
            {paymentMode === "cash" && "Selected: Without loan"}
            {paymentMode === "bank" && "Selected: Nationalised bank loan"}
            {paymentMode === "nbfc" && "Selected: NBFC loan"}
            {!paymentMode && "Click any payment mode column above to tick it."}
          </p>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-orange px-5 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#cc6d14] disabled:opacity-60 sm:w-auto"
          >
            {downloading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download Quotation PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
