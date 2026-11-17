/* The parts of a printed Solarium document, and the small helpers under them.

   A part draws at the current position of the document and moves it on by its own height. It takes its
   words and figures as arguments and holds none of its own, so a different document is a different list
   of parts with different content. All colours, type and sizes come from the theme. */

import { PDF_COLORS, PDF_CORNERS, PDF_FONTS, PDF_PAGE, PDF_TYPE, type PdfColor, type PdfTypeName } from "./pdfTheme";

type Ctx = CanvasRenderingContext2D;

/** The document being drawn: the context, the left edge and width of the area, the current position. */
export type Doc = {
  ctx: Ctx;
  x: number;
  width: number;
  y: number;
  /** The lowest position a part may reach. */
  bottom: number;
};

/** An image and its own size in pixels. */
export type LogoImage = { image: CanvasImageSource; width: number; height: number };

const ELLIPSIS = "…";

/* ---------- Helpers ---------- */

/** Paints the page and returns a document positioned at the top margin. */
export function newDoc(ctx: Ctx): Doc {
  ctx.fillStyle = PDF_COLORS.card;
  ctx.fillRect(0, 0, PDF_PAGE.width, PDF_PAGE.height);
  return {
    ctx,
    x: PDF_PAGE.marginX,
    width: PDF_PAGE.width - 2 * PDF_PAGE.marginX,
    y: PDF_PAGE.marginTop,
    bottom: PDF_PAGE.height - PDF_PAGE.marginBottom,
  };
}

/** Moves the document on by a fixed space. */
export function gap(doc: Doc, space: number = PDF_PAGE.blockGap) {
  doc.y += space;
}

/**
 * Checks that the last part ended above the bottom margin. In development an overflow throws, so it is
 * seen at once. In production the page is drawn anyway, so the download never breaks.
 */
export function finishPage(doc: Doc) {
  if (doc.y > doc.bottom && process.env.NODE_ENV !== "production") {
    throw new Error(`The document runs ${Math.ceil(doc.y - doc.bottom)} units past the bottom margin.`);
  }
}

/** The same document area, narrowed to a part of its width. */
function area(doc: Doc, x: number, width: number): Doc {
  return { ctx: doc.ctx, x, width, y: doc.y, bottom: doc.bottom };
}

export function setType(ctx: Ctx, style: PdfTypeName) {
  const type = PDF_TYPE[style];
  ctx.font = `${type.weight} ${type.size}px ${PDF_FONTS[type.family]}`;
}

export function measure(ctx: Ctx, value: string, style: PdfTypeName) {
  setType(ctx, style);
  return ctx.measureText(value).width;
}

export function drawText(
  ctx: Ctx,
  value: string,
  x: number,
  y: number,
  style: PdfTypeName,
  tone: PdfColor,
  align: CanvasTextAlign = "left"
) {
  if (!value) return;
  setType(ctx, style);
  ctx.fillStyle = PDF_COLORS[tone];
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(value, x, y);
}

/** The text as it fits a width: whole, or cut at the end of the width with an ellipsis. */
export function fitText(ctx: Ctx, value: string, style: PdfTypeName, maxWidth: number) {
  if (measure(ctx, value, style) <= maxWidth) return value;
  let low = 0;
  let high = value.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (ctx.measureText(value.slice(0, mid).trimEnd() + ELLIPSIS).width <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return value.slice(0, low).trimEnd() + ELLIPSIS;
}

/** The text broken into lines that fit a width, at the spaces. */
export function wrapText(ctx: Ctx, value: string, style: PdfTypeName, maxWidth: number) {
  setType(ctx, style);
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function hline(ctx: Ctx, x1: number, x2: number, y: number, tone: PdfColor, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.strokeStyle = PDF_COLORS[tone];
  ctx.lineWidth = width;
  ctx.stroke();
}

export function vline(ctx: Ctx, x: number, y1: number, y2: number, tone: PdfColor, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.strokeStyle = PDF_COLORS[tone];
  ctx.lineWidth = width;
  ctx.stroke();
}

/** A box with rounded corners: a fill, an edge or both. `radii` follows the canvas order of the corners. */
export function roundedBox(
  ctx: Ctx,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { fill?: PdfColor; stroke?: PdfColor; radii?: number | number[] }
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, options.radii ?? PDF_CORNERS["corner-xs"]);
  if (options.fill) {
    ctx.fillStyle = PDF_COLORS[options.fill];
    ctx.fill();
  }
  if (options.stroke) {
    ctx.strokeStyle = PDF_COLORS[options.stroke];
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/** A tick box: empty with an `input` edge, or filled `primary` with its tick. */
export function tickBox(ctx: Ctx, x: number, y: number, ticked: boolean, size = 13) {
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, PDF_CORNERS["corner-3xs"]);
  ctx.fillStyle = PDF_COLORS[ticked ? "primary" : "card"];
  ctx.fill();
  ctx.strokeStyle = PDF_COLORS[ticked ? "primary" : "input"];
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (ticked) {
    ctx.beginPath();
    ctx.moveTo(x + size * 0.24, y + size * 0.53);
    ctx.lineTo(x + size * 0.43, y + size * 0.72);
    ctx.lineTo(x + size * 0.78, y + size * 0.3);
    ctx.strokeStyle = PDF_COLORS["primary-foreground"];
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
  }
}

/** A title bar across the top of a block, following the block's top corners. */
function titleBar(doc: Doc, title: string, note: string | undefined, fill: PdfColor, ink: PdfColor, noteInk: PdfColor) {
  const { ctx, x, width, y } = doc;
  const height = 26;
  const r = PDF_CORNERS["corner-xs"];
  roundedBox(ctx, x, y, width, height, { fill, radii: [r, r, 0, 0] });
  const noteWidth = note ? measure(ctx, note, "small") + 12 : 0;
  drawText(ctx, fitText(ctx, title, "heading", width - 20 - noteWidth), x + 10, y + 17, "heading", ink);
  if (note) drawText(ctx, note, x + width - 10, y + 16.5, "small", noteInk, "right");
  return height;
}

/** A label, then a line to write on that starts after the label's measured width, then the value on it. */
function fieldLine(ctx: Ctx, label: string, value: string, x: number, width: number, baseline: number) {
  drawText(ctx, label, x, baseline, "label", "muted-foreground");
  const lineStart = x + measure(ctx, label, "label") + 8;
  const lineEnd = x + width;
  // The line sits clear of the value's descenders.
  hline(ctx, lineStart, lineEnd, baseline + 4.5, "input");
  if (value) {
    drawText(ctx, fitText(ctx, value, "value", lineEnd - lineStart - 8), lineStart + 4, baseline, "value", "brand");
  }
}

/**
 * A prefix and a line to fill in, ending at `right`, with the value right-aligned on it. The line starts
 * no earlier than `minStart`, and never before the end of the text to its left (`textEnd`).
 */
function fillLine(
  ctx: Ctx,
  prefix: string,
  value: string | null,
  right: number,
  baseline: number,
  options: { minStart: number; textEnd: number; style: PdfTypeName }
) {
  const prefixWidth = measure(ctx, prefix, "body");
  const lineStart = Math.max(options.minStart, options.textEnd + prefixWidth + 12);
  drawText(ctx, prefix, lineStart - 5, baseline, "body", "muted-foreground", "right");
  hline(ctx, lineStart, right, baseline + 3.5, "input");
  if (value !== null && value !== "") {
    drawText(ctx, fitText(ctx, value, options.style, right - lineStart - 8), right - 4, baseline - 0.5, options.style, "brand", "right");
  }
}

/** Places parts side by side, with widths in proportion to their weights, and moves on below the tallest. */
export function SideBySide(doc: Doc, parts: { weight: number; draw: (part: Doc) => void }[], space: number = PDF_PAGE.blockGap) {
  const total = parts.reduce((sum, part) => sum + part.weight, 0);
  const available = doc.width - space * (parts.length - 1);
  let x = doc.x;
  let lowest = doc.y;
  for (const part of parts) {
    const width = (available * part.weight) / total;
    const sub = area(doc, x, width);
    part.draw(sub);
    lowest = Math.max(lowest, sub.y);
    x += width + space;
  }
  doc.y = lowest;
}

/* ---------- Parts ---------- */

export type DocHeaderContent = {
  /** The logo, or null to write the fallback name in its place. */
  logo: LogoImage | null;
  fallbackName: string;
  /** The scheme beside the logo, one entry per line. */
  scheme: string[];
  eyebrow: string;
  title: string;
  /** Reference fields on the right, such as the quote number and the date. */
  refs: { label: string; value: string }[];
};

/** The head of a document: logo, scheme line, eyebrow and title, reference fields, a hairline under it. */
export function DocHeader(doc: Doc, content: DocHeaderContent) {
  const { ctx, x, width, y } = doc;
  const logoHeight = 34;
  const middle = y + logoHeight / 2;

  // The logo, unchanged, with clear space after it.
  let cursor = x;
  if (content.logo) {
    const logoWidth = (content.logo.width / content.logo.height) * logoHeight;
    ctx.drawImage(content.logo.image, x, y, logoWidth, logoHeight);
    cursor += logoWidth;
  } else {
    drawText(ctx, content.fallbackName, x, middle + 8, "title", "foreground");
    cursor += measure(ctx, content.fallbackName, "title");
  }
  cursor += 16;
  vline(ctx, cursor, y + 2, y + logoHeight - 2, "border");
  cursor += 12;

  // The scheme line, text only.
  const schemeTop = middle - ((content.scheme.length - 1) * 11) / 2 + 3;
  let schemeWidth = 0;
  content.scheme.forEach((line, index) => {
    drawText(ctx, line, cursor, schemeTop + index * 11, "smallStrong", "foreground");
    schemeWidth = Math.max(schemeWidth, measure(ctx, line, "smallStrong"));
  });
  cursor += schemeWidth + 14;
  vline(ctx, cursor, y + 2, y + logoHeight - 2, "border");
  cursor += 14;

  // The reference fields on the right.
  const refsWidth = 170;
  const refsX = x + width - refsWidth;
  content.refs.forEach((ref, index) => {
    fieldLine(ctx, ref.label, ref.value, refsX, refsWidth, y + 11 + index * 21);
  });

  // The eyebrow, with the sun dot in front of it, and the title.
  const titleWidth = refsX - 20 - cursor;
  ctx.beginPath();
  ctx.arc(cursor + 2.5, y + 7.5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = PDF_COLORS.sun;
  ctx.fill();
  drawText(ctx, fitText(ctx, content.eyebrow, "eyebrow", titleWidth - 11), cursor + 11, y + 11, "eyebrow", "brand");
  drawText(ctx, fitText(ctx, content.title, "title", titleWidth), cursor, y + 34, "title", "foreground");

  const height = 46;
  hline(ctx, x, x + width, y + height, "border");
  doc.y = y + height + 1;
}

export type Field = { label: string; value: string; span?: number };

/** Rows of a label and a written value on a line, one or more fields per row. */
export function FieldRows(doc: Doc, rows: Field[][], options: { rowHeight?: number; space?: number } = {}) {
  const { ctx, x, width } = doc;
  const rowHeight = options.rowHeight ?? 24;
  const space = options.space ?? 16;
  for (const row of rows) {
    const spans = row.reduce((sum, field) => sum + (field.span ?? 1), 0);
    const available = width - space * (row.length - 1);
    let fx = x;
    for (const field of row) {
      const fieldWidth = (available * (field.span ?? 1)) / spans;
      fieldLine(ctx, field.label, field.value, fx, fieldWidth, doc.y + 16);
      fx += fieldWidth + space;
    }
    doc.y += rowHeight;
  }
}

export type Option = { label: string; price: string; ticked: boolean; included?: boolean };
export type OptionBoxContent = { title: string; note?: string; columns: number; options: Option[] };

/** A titled box of tick options, each with a price, in one or more columns (filled row by row). */
export function OptionBox(doc: Doc, content: OptionBoxContent) {
  const { ctx, x, width } = doc;
  const top = doc.y;
  const rowHeight = 26;
  const barHeight = titleBar(doc, content.title, content.note, "primary", "primary-foreground", "primary-foreground");
  const rows = Math.ceil(content.options.length / content.columns);
  const columnWidth = width / content.columns;
  const bodyTop = top + barHeight;

  content.options.forEach((option, index) => {
    const column = index % content.columns;
    const row = Math.floor(index / content.columns);
    const cx = x + column * columnWidth;
    const ry = bodyTop + row * rowHeight;
    tickBox(ctx, cx + 10, ry + 6.5, option.ticked);
    const priceWidth = measure(ctx, option.price, "value");
    drawText(ctx, fitText(ctx, option.label, "label", columnWidth - 48 - priceWidth), cx + 30, ry + 17, "label", "foreground");
    drawText(ctx, option.price, cx + columnWidth - 10, ry + 17, "value", option.included ? "status-positive-fg" : "foreground", "right");
  });
  for (let row = 1; row < rows; row += 1) hline(ctx, x, x + width, bodyTop + row * rowHeight, "border");
  for (let column = 1; column < content.columns; column += 1) {
    vline(ctx, x + column * columnWidth, bodyTop, bodyTop + rows * rowHeight, "border");
  }
  const height = barHeight + rows * rowHeight;
  roundedBox(ctx, x, top, width, height, { stroke: "border" });
  doc.y = top + height;
}

export type PriceRow = { label: string; amount: string; tone?: "plain" | "less" | "strong" };
export type FillRow = { label: string; prefix: string; value: string | null };
export type PriceBlockContent = {
  title: string;
  note?: string;
  /** Rows of label and amount on the left. */
  left: PriceRow[];
  /** Rows with a line to fill in on the right. */
  right: FillRow[];
  /** The total, under the right-hand rows. */
  total: FillRow;
};

/** A titled block: rows of label and amount on the left, rows to fill in and the total on the right. */
export function PriceBlock(doc: Doc, content: PriceBlockContent) {
  const { ctx, x, width } = doc;
  const top = doc.y;
  const rowHeight = 24;
  const barHeight = titleBar(doc, content.title, content.note, "muted", "foreground", "muted-foreground");
  const bodyTop = top + barHeight;
  const half = width / 2;
  const bodyHeight = Math.max(content.left.length * rowHeight, content.right.length * rowHeight + 40);
  hline(ctx, x, x + width, bodyTop, "border");

  // Left: label and amount.
  content.left.forEach((row, index) => {
    const ry = bodyTop + index * rowHeight;
    if (index > 0) hline(ctx, x, x + half, ry, "border");
    const strong = row.tone === "strong";
    drawText(ctx, row.label, x + 10, ry + 16, strong ? "labelStrong" : "body", "foreground");
    drawText(ctx, row.amount, x + half - 12, ry + 16, "value", row.tone === "less" ? "status-positive-fg" : "foreground", "right");
  });

  // Right: rows to fill in, then the total.
  const rx = x + half;
  content.right.forEach((row, index) => {
    const ry = bodyTop + index * rowHeight;
    if (index > 0) hline(ctx, rx, x + width, ry, "border");
    drawText(ctx, row.label, rx + 12, ry + 16, "body", "foreground");
    fillLine(ctx, row.prefix, row.value, x + width - 10, ry + 16, {
      minStart: x + width - 98,
      textEnd: rx + 12 + measure(ctx, row.label, "body"),
      style: "value",
    });
  });
  const totalTop = bodyTop + content.right.length * rowHeight;
  const totalHeight = bodyTop + bodyHeight - totalTop;
  ctx.fillStyle = PDF_COLORS.muted;
  ctx.fillRect(rx, totalTop, half, totalHeight - 0.5);
  hline(ctx, rx, x + width, totalTop, "foreground");
  const totalBaseline = totalTop + totalHeight / 2 + 5;
  drawText(ctx, content.total.label, rx + 12, totalBaseline, "labelStrong", "foreground");
  fillLine(ctx, content.total.prefix, content.total.value, x + width - 10, totalBaseline, {
    minStart: x + width - 98,
    textEnd: rx + 12 + measure(ctx, content.total.label, "labelStrong"),
    style: "figure",
  });

  vline(ctx, rx, bodyTop, bodyTop + bodyHeight, "border");
  const height = barHeight + bodyHeight;
  roundedBox(ctx, x, top, width, height, { stroke: "border" });
  doc.y = top + height;
}

export type PayRow = {
  label: string;
  /** A fine line under the label. When there is one, the line to fill in sits on it. */
  hint?: string;
  /** A fixed value at the end of the row. */
  value?: string;
  /** A line to fill in, with its prefix and this customer's value (null leaves it blank). */
  fill?: { prefix: string; value: string | null };
};
export type PayColumn = {
  name: string;
  /** The mode the customer chose: ticked, on the `selected` ground with a sun bar. */
  chosen: boolean;
  rows: PayRow[];
  /** The net cost, in the row across all columns. */
  net: { label: string; hint: string; prefix: string; value: string | null };
};
export type PaymentColumnsContent = {
  title: string;
  note?: string;
  columns: PayColumn[];
  /** Fields to fill in, in a closing row across the block. */
  closing: { label: string }[];
};

/** A titled block with one column per payment mode, the net cost row across all columns, and a closing row. */
export function PaymentColumns(doc: Doc, content: PaymentColumnsContent) {
  const { ctx, x, width } = doc;
  const top = doc.y;
  const barHeight = titleBar(doc, content.title, content.note, "muted", "foreground", "muted-foreground");
  const columnWidth = width / content.columns.length;
  const rowHeight = (row: PayRow) => (row.hint ? 40 : 26);

  // The names of the modes.
  const namesTop = top + barHeight;
  const namesHeight = 28;
  ctx.fillStyle = PDF_COLORS.subtle;
  ctx.fillRect(x, namesTop, width, namesHeight);
  content.columns.forEach((column, index) => {
    const cx = x + index * columnWidth;
    if (column.chosen) {
      ctx.fillStyle = PDF_COLORS.selected;
      ctx.fillRect(cx, namesTop, columnWidth, namesHeight);
      ctx.fillStyle = PDF_COLORS.sun;
      ctx.fillRect(cx, namesTop, 3, namesHeight);
    }
    tickBox(ctx, cx + 10, namesTop + 7.5, column.chosen);
    drawText(ctx, fitText(ctx, column.name, "heading", columnWidth - 40), cx + 30, namesTop + 18, "heading", "foreground");
  });
  hline(ctx, x, x + width, namesTop, "border");
  hline(ctx, x, x + width, namesTop + namesHeight, "border");

  // The rows of each mode.
  const bodyTop = namesTop + namesHeight;
  const bodyHeight = Math.max(...content.columns.map((column) => column.rows.reduce((sum, row) => sum + rowHeight(row), 0))) + 4;
  content.columns.forEach((column, index) => {
    const cx = x + index * columnWidth;
    const right = cx + columnWidth - 10;
    let ry = bodyTop;
    column.rows.forEach((row, rowIndex) => {
      if (rowIndex > 0) hline(ctx, cx + 10, right, ry, "border");
      const valueWidth = row.value ? measure(ctx, row.value, "value") + 8 : 0;
      const label = fitText(ctx, row.label, "label", columnWidth - 20 - valueWidth);
      drawText(ctx, label, cx + 10, ry + 16, "label", "foreground");
      if (row.value) drawText(ctx, row.value, right, ry + 16, "value", "foreground", "right");
      if (row.hint) drawText(ctx, row.hint, cx + 10, ry + 29, "small", "muted-foreground");
      if (row.fill) {
        const baseline = row.hint ? ry + 29 : ry + 16;
        const textEnd = cx + 10 + (row.hint ? measure(ctx, row.hint, "small") : measure(ctx, label, "label"));
        fillLine(ctx, row.fill.prefix, row.fill.value, right, baseline, { minStart: cx + 132, textEnd, style: "value" });
      }
      ry += rowHeight(row);
    });
  });

  // The net cost across all columns.
  const netTop = bodyTop + bodyHeight;
  const netHeight = 40;
  ctx.fillStyle = PDF_COLORS.muted;
  ctx.fillRect(x, netTop, width, netHeight);
  hline(ctx, x, x + width, netTop, "foreground");
  content.columns.forEach((column, index) => {
    const cx = x + index * columnWidth;
    drawText(ctx, column.net.label, cx + 10, netTop + 16, "labelStrong", "foreground");
    drawText(ctx, column.net.hint, cx + 10, netTop + 31, "small", "muted-foreground");
    fillLine(ctx, column.net.prefix, column.net.value, cx + columnWidth - 10, netTop + 31, {
      minStart: cx + 132,
      textEnd: cx + 10 + measure(ctx, column.net.hint, "small"),
      style: "figure",
    });
  });
  for (let index = 1; index < content.columns.length; index += 1) {
    vline(ctx, x + index * columnWidth, namesTop, netTop + netHeight, "border");
  }

  // The closing row of fields.
  const closingTop = netTop + netHeight;
  hline(ctx, x, x + width, closingTop, "border");
  const closingHeight = 30;
  const fieldSpace = 24;
  const fieldWidth = (width - 20 - fieldSpace * (content.closing.length - 1)) / content.closing.length;
  content.closing.forEach((field, index) => {
    fieldLine(ctx, field.label, "", x + 10 + index * (fieldWidth + fieldSpace), fieldWidth, closingTop + 19);
  });

  const height = closingTop + closingHeight - top;
  roundedBox(ctx, x, top, width, height, { stroke: "border" });
  doc.y = top + height;
}

/** A heading and a list of notes, each wrapped inside the page. */
export function Notes(doc: Doc, content: { heading: string; items: string[] }) {
  const { ctx, x, width } = doc;
  const lineHeight = 12.5;
  drawText(ctx, content.heading, x, doc.y + 11, "heading", "foreground");
  let y = doc.y + 11 + 15;
  for (const item of content.items) {
    drawText(ctx, "•", x + 1, y, "small", "muted-foreground");
    for (const line of wrapText(ctx, item, "small", width - 12)) {
      drawText(ctx, line, x + 12, y, "small", "muted-foreground");
      y += lineHeight;
    }
    y += 2;
  }
  doc.y = y - lineHeight + 4;
}

/** A titled box with tick items in a row, wrapping onto more rows when they do not fit. */
export function CheckList(doc: Doc, content: { title: string; items: { label: string; ticked: boolean }[] }) {
  const { ctx, x, width } = doc;
  const top = doc.y;
  drawText(ctx, content.title, x + 12, top + 18, "heading", "foreground");
  const itemHeight = 20;
  let ix = x + 12;
  let iy = top + 28;
  for (const item of content.items) {
    const itemWidth = 17 + measure(ctx, item.label, "body");
    if (ix + itemWidth > x + width - 12 && ix > x + 12) {
      ix = x + 12;
      iy += itemHeight;
    }
    tickBox(ctx, ix, iy, item.ticked, 12);
    drawText(ctx, item.label, ix + 17, iy + 10, "body", "foreground");
    ix += itemWidth + 22;
  }
  const height = iy + itemHeight + 2 - top;
  roundedBox(ctx, x, top, width, height, { stroke: "border" });
  doc.y = top + height;
}

/** Lines to sign on, side by side, each with its caption under it. */
export function SignatureLines(doc: Doc, content: { lines: { caption: string; span?: number }[]; space?: number }) {
  const { ctx, x, width } = doc;
  const space = content.space ?? 50;
  const spans = content.lines.reduce((sum, line) => sum + (line.span ?? 1), 0);
  const available = width - space * (content.lines.length - 1);
  let lx = x;
  for (const line of content.lines) {
    const lineWidth = (available * (line.span ?? 1)) / spans;
    hline(ctx, lx, lx + lineWidth, doc.y, "input");
    drawText(ctx, line.caption, lx, doc.y + 15, "label", "muted-foreground");
    lx += lineWidth + space;
  }
  doc.y += 20;
}

/** A dark band with a few figures and their captions. */
export function StatBand(doc: Doc, content: { stats: { value: string; caption: string }[] }) {
  const { ctx, x, width } = doc;
  const top = doc.y;
  const height = 56;
  roundedBox(ctx, x, top, width, height, { fill: "sky-top" });
  const statWidth = width / content.stats.length;
  content.stats.forEach((stat, index) => {
    const sx = x + index * statWidth;
    if (index > 0) vline(ctx, sx, top + 12, top + height - 12, "glass-line");
    drawText(ctx, stat.value, sx + statWidth / 2, top + 27, "figure", "on-dark", "center");
    drawText(ctx, stat.caption, sx + statWidth / 2, top + 43, "small", "on-dark-muted", "center");
  });
  doc.y = top + height;
}
