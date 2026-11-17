#!/usr/bin/env node
/* Checks that the quotation PDF's colours are the design tokens' light values.

   The PDF is drawn on a canvas, which cannot read CSS variables, so app/lib/pdf/pdfTheme.ts holds copies
   of the colours under their token names. This script reads that colour table as text and the light
   values (:root) of app/styles/tokens_v2.css, and fails, naming the token, when a colour differs or a
   name is not a token. Run from the repo root: node scripts/check_pdf_theme.mjs */
import fs from "node:fs";

const THEME = "app/lib/pdf/pdfTheme.ts";
const TOKENS = "app/styles/tokens_v2.css";

const theme = fs.readFileSync(THEME, "utf8");
const start = theme.indexOf("export const PDF_COLORS = {");
const end = theme.indexOf("} as const;", start);
if (start < 0 || end < 0) {
  console.error(`${THEME}: the colour table (export const PDF_COLORS = { ... } as const;) was not found.`);
  process.exit(1);
}
const colours = [...theme.slice(start, end).matchAll(/^\s*"([a-z0-9-]+)":\s*"([^"]+)",?\s*$/gm)].map((m) => [m[1], m[2]]);
if (colours.length === 0) {
  console.error(`${THEME}: the colour table is empty or not in the form "token-name": "value",`);
  process.exit(1);
}

const css = fs.readFileSync(TOKENS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const root = /(?:^|\n):root\s*\{([\s\S]*?)\n\}/.exec(css);
if (!root) {
  console.error(`${TOKENS}: the light values (:root { ... }) were not found.`);
  process.exit(1);
}
const tokens = Object.fromEntries([...root[1].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]));

const same = (a, b) => a.replace(/\s+/g, "").toLowerCase() === b.replace(/\s+/g, "").toLowerCase();
const problems = [];
for (const [name, value] of colours) {
  if (!(name in tokens)) problems.push(`${name}: not a token of ${TOKENS}`);
  else if (!same(value, tokens[name])) problems.push(`${name}: the PDF has ${value}, the token is ${tokens[name]}`);
}

if (problems.length) {
  console.error(`PDF theme check: ${problems.length} colour${problems.length > 1 ? "s differ" : " differs"} from the tokens.`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`PDF theme check: all ${colours.length} colours of ${THEME} match the tokens.`);
