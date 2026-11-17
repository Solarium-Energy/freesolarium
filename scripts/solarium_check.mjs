#!/usr/bin/env node
/* Solarium Design System, First Light. Rule checker.
   Reads solarium_rules_v2.json (next to this file) and checks a product's code against the design rules.

   node solarium_check.mjs --tokens <path to tokens_v2.css> --src <dir[,dir]> [options]
     --ext css,tsx,ts,jsx,html     file types to scan (default)
     --allow <path[,path]>         files that may hold raw values, such as the PDF constants file
     --baseline <file.json>        known findings that do not fail the run (for the adoption phase)
     --write-baseline              write the current findings to the baseline file and exit 0
     --strict                      advice counts as an error
     --json                        print the report as JSON

   Break a rule on purpose only in writing: a comment "solarium-allow <rule id>: <reason>" on that line or the line above.
   Exit code 0: no errors. Exit code 1: errors. Every waiver is listed in the report. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const R = JSON.parse(fs.readFileSync(opt('rules', path.join(here, 'solarium_rules_v2.json')), 'utf8'));
const tokensPath = opt('tokens');
const srcDirs = String(opt('src', '')).split(',').filter(Boolean);
const exts = new Set(String(opt('ext', 'css,tsx,ts,jsx,html')).split(',').map(e => '.' + e.trim()));
const allow = String(opt('allow', '')).split(',').filter(Boolean).map(p => path.resolve(p));
const strict = !!opt('strict', false), asJson = !!opt('json', false);
const baselinePath = opt('baseline', null), writeBaseline = !!opt('write-baseline', false);
if (!tokensPath || !srcDirs.length) { console.error('Usage: node solarium_check.mjs --tokens <tokens css> --src <dir[,dir]>  (see the head of this file)'); process.exit(2); }

const level = Object.fromEntries(R.rules.map(r => [r.id, r.level]));
const title = Object.fromEntries(R.rules.map(r => [r.id, r.title]));
const findings = [], waivers = [];
const add = (id, file, line, text, msg) => findings.push({ id, level: level[id] || 'error', file, line, text: (text || '').trim().slice(0, 160), msg });

/* ---------- 1. the tokens file: fingerprint and pairs ---------- */
const tokensCss = fs.readFileSync(tokensPath, 'utf8').replace(/\r\n/g, '\n');
const sha = crypto.createHash('sha256').update(tokensCss).digest('hex');
if (sha !== R.tokensSha256) add('C7', tokensPath, 1, '', `The tokens file differs from the published version ${R.version}. Ask the design system for a new version instead of editing it.`);
const tokensBare = tokensCss.replace(/\/\*[\s\S]*?\*\//g, '');
const block = re => { const m = re.exec(tokensBare); return m ? m[1] : ''; };
const decl = s => Object.fromEntries([...s.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)].map(m => [m[1], m[2].trim()]));
const light = decl(block(/(?:^|\n):root\s*\{([\s\S]*?)\n\}/)), dark = { ...light, ...decl(block(/(?:^|\n)\.dark[^{]*\{([\s\S]*?)\n\}/)) };
const lum = hex => { const h = hex.replace('#', '').slice(0, 6); const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const name of R.colorTokens) if (!/^#[0-9a-f]{6}$/i.test(light[name] || '')) add('C6', tokensPath, 1, name, `Colour token ${name} is missing or is not a six digit hex value.`);
const seenPair = new Set();
for (const p of R.pairs) for (const [theme, t] of [['light', light], ['dark', dark]]) {
  const pk = [p.a, p.b].sort().join('|') + theme + p.min; if (seenPair.has(pk)) continue; seenPair.add(pk);
  if (!/^#[0-9a-f]{6}$/i.test(t[p.a] || '') || !/^#[0-9a-f]{6}$/i.test(t[p.b] || '')) continue;
  const r = ratio(t[p.a], t[p.b]);
  if (r < p.min) add('C6', tokensPath, 1, `${p.a} / ${p.b}`, `${p.a} with ${p.b} is ${r.toFixed(2)} to 1 in ${theme}. The floor is ${p.min}.`);
}
const declared = new Set([...tokensCss.matchAll(/--([a-z0-9-]+)\s*:/gi)].map(x => x[1]));

/* ---------- 2. the source files ---------- */
const SKIP = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', 'coverage', '.netlify', '.vercel']);
const files = [];
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(p); } else if (exts.has(path.extname(e.name))) files.push(p); } };
for (const d of srcDirs) { if (fs.statSync(d).isDirectory()) walk(d); else files.push(d); }
const tokensAbs = path.resolve(tokensPath);
const scale = new Set(R.scaleTokens);
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTIL = 'bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|shadow|divide|placeholder|caret|accent';
const reTw = new RegExp(`(?<![\\w-])(?:[a-z-]+:)*(?:${UTIL})-(?:${PALETTE})-\\d{2,3}\\b`);
const reBW = new RegExp(`(?<![\\w-])(?:[a-z-]+:)*(?:${UTIL})-(?:white|black)\\b`);
const reEmoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{2604}\u{2614}\u{2615}\u{263A}\u{26A0}\u{26A1}\u{2705}\u{2728}\u{274C}\u{2764}\u{2B50}]/u;
let sunButtons, hasReducedMotion = false, cssSeen = false;

for (const file of files) {
  const abs = path.resolve(file);
  if (abs === tokensAbs || path.basename(file) === R.tokensFile || /^tailwind_theme_v\d+\.css$/.test(path.basename(file))) continue;
  const rawOk = allow.includes(abs);
  const isCss = file.endsWith('.css');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  sunButtons = 0;
  if (isCss) { cssSeen = true; if (lines.some(l => /prefers-reduced-motion/.test(l))) hasReducedMotion = true; }
  lines.forEach((raw, i) => {
    const prev = i ? lines[i - 1] : '';
    const waived = new Set([...(raw + '\n' + prev).matchAll(/solarium-allow\s+([A-Z]\d+)\s*:?\s*([^*\n]*)/g)].map(m => { return m[1]; }));
    for (const m of raw.matchAll(/solarium-allow\s+([A-Z]\d+)\s*:?\s*([^*\n]*)/g)) waivers.push({ id: m[1], file, line: i + 1, reason: m[2].replace(/(\*\/|-->|\})\s*$/, '').trim() });
    const hit = (id, msg) => { if (!waived.has(id)) add(id, file, i + 1, raw, msg); };
    // look at code and text, not at comments that only explain
    const line = raw.replace(/\/\*.*?\*\//g, '').replace(/<!--.*?-->/g, '');
    if (!line.trim()) return;
    if (/[\u2014\u2013]/.test(line)) hit('W1', 'Em dash or en dash in text. Use a comma, a full stop or the word to.');
    if (reEmoji.test(line)) hit('W2', 'Emoji in text.');
    if (rawOk) return;
    const noUrl = line.replace(/url\([^)]*\)/g, '').replace(/(href|id|for|xlink:href|aria-[a-z]+)=["'{][^"'}]*["'}]/g, '').replace(/&#x?[0-9a-f]+;/gi, '');
    if (/(^|[^\w&])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![\w-])/i.test(noUrl) || /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*[\d.]/i.test(noUrl)) hit('C4', 'Raw colour value. Use a token.');
    for (const m of line.matchAll(/var\(--([a-z0-9-]+)/g)) if (scale.has(m[1])) hit('C5', `Scale colour ${m[1]} used directly. Use a role token such as foreground, brand, on-dark or paper.`);
    if (reTw.test(line)) hit('C5', 'Tailwind palette colour. Use the token utilities, such as bg-background or text-brand.');
    if (reBW.test(line)) hit('C5', 'White or black utility. Use a role token: on-dark, primary-foreground, paper, inverse.');
    if (/(?<![\w-])color\s*:\s*var\(--sun\)/.test(line) || /(?<![\w-])(?:[a-z-]+:)*text-sun(?![\w-])/.test(line)) hit('C2', 'The sun as a text colour. Orange text is ember.');
    if (/(?<![\w-])bg-sun(?![\w-])/.test(line) && /(?<![\w-])text-(?:on-dark|primary-foreground|card|background|inverse-foreground)(?![\w-])/.test(line)) hit('C3', 'Light text on the sun. Its text is sun-foreground.');
    if (/(?<![\w-])(?:linear|radial|conic)-gradient\(/.test(line) || /(?<![\w-])bg-(?:gradient|linear|radial|conic)-/.test(line)) hit('C11', 'A gradient outside the tokens file. Use a gradient token.');
    const ff = /font-family\s*:\s*([^;}"']+)/.exec(line); if (ff && !/var\(--font-(display|sans)\)|inherit/.test(ff[1])) hit('T1', 'Font family typed by hand. Use font-display or font-sans.');
    if (/(?<![\w-])font-\[(?!family-name:var\(--font-)/.test(line) && /font-\[['"a-zA-Z]/.test(line)) hit('T1', 'Font family typed by hand. Use font-display or font-sans.');
    for (const m of line.matchAll(/font(?:-size)?\s*:\s*[^;}"']*?(?<![\w.-])(\d+(?:\.\d+)?)px/g)) if (Number(m[1]) < 12) hit('T2', `Text of ${m[1]}px. Nothing below 12px.`);
    for (const m of line.matchAll(/(?<![\w-])text-\[(\d+(?:\.\d+)?)px\]/g)) if (Number(m[1]) < 12) hit('T2', `Text of ${m[1]}px. Nothing below 12px.`);
    if (/text-transform\s*:\s*uppercase/.test(line) || /(?:class(?:Name)?=|cn\(|clsx\()[^\n]*(?<![\w-])uppercase(?![\w-])/.test(line)) hit('T3', 'Text set in capitals.');
    const br = /border(?:-[a-z]+)*-radius\s*:\s*([^;}"']+)/.exec(line); if (br && /\d+(?:\.\d+)?px/.test(br[1].replace(/var\([^)]*\)/g, '').replace(/\b0px\b/g, ''))) hit('S1', 'Corner radius typed in pixels. Use a corner token.');
    if (/(?<![\w-])rounded(?:-[a-z]{1,2})?-\[/.test(line)) hit('S1', 'Corner radius typed by hand. Use the mapped radius keys.');
    for (const bs of line.matchAll(/box-shadow\s*:\s*([^;}"']+)/g)) { const parts = []; { let d = 0, cur = ''; for (const ch of bs[1]) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { parts.push(cur.trim()); cur = ''; } else cur += ch; } parts.push(cur.trim()); } const ok = s => s === 'none' || /^var\(--shadow-[a-z0-9-]+\)$/.test(s) || /^(?:inset\s+)?-?[\d.]+(?:px)?\s+-?[\d.]+(?:px)?\s+0(?:px)?(?:\s+-?[\d.]+px)?\s+(?:var\(--[^)]*\)+|color-mix\(.*var\(--.*\))$/.test(s); if (!parts.every(ok)) hit('S2', 'Shadow typed by hand. Use a shadow token. A line or ring with no blur and a token colour is allowed.'); }
    for (const sp of line.matchAll(/(?<![\w-])(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*([^;}"']+)/g)) for (const v of sp[1].replace(/var\([^)]*\)|calc\([^)]*\)/g, '').matchAll(/(?<![\w.-])-?(\d+(?:\.\d+)?)px/g)) { const n = Number(v[1]); if (n > 1 && n % 2 !== 0) { hit('S6', `Spacing of ${v[1]}px. Spacing follows a 2px grid.`); break; } }
    for (const v of line.matchAll(/(?<![\w-])(?:[a-z-]+:)*-?(?:p|m|gap|space)[trblxyse]?-\[(\d+(?:\.\d+)?)px\]/g)) { const n = Number(v[1]); if (n > 1 && n % 2 !== 0) hit('S6', `Spacing of ${v[1]}px. Spacing follows a 2px grid.`); }
    const zi = /z-index\s*:\s*(-?\d+)/.exec(line); if (zi && Math.abs(Number(zi[1])) > 9) hit('S5', 'Layer typed by hand. Use a z token.');
    if ((/outline\s*:\s*(?:none|0)(?![\w.])/.test(line) && !/outline-offset/.test(line)) || (/(?<![\w-:])outline-none(?![\w-])/.test(line) && !/focus-visible:(?:ring|outline)/.test(line))) hit('M3', 'Focus outline removed with nothing in its place.');
    for (const m of line.matchAll(/var\(--([a-z0-9-]+)/g)) { const n = m[1]; if (/^(color|radius|font|shadow|tw|spacing|text|ease|animate|breakpoint|container|default|leading|tracking|inset|blur)-/.test(n)) continue; if (R.colorTokens.includes(n) || declared.has(n)) continue; if (/^(status|stage|temp|chart|sidebar|sky|sun|on-dark|paper|glass|gradient|corner|space|shadow|z|dur|ease|control|gutter|bp|line|primary|secondary|brand|glow)-?/.test(n) || ['background', 'foreground', 'card', 'popover', 'muted', 'accent', 'destructive', 'border', 'input', 'ring', 'ember', 'subtle', 'selected', 'inverse', 'scrim', 'container', 'radius', 'touch-min'].includes(n)) hit('C6', `Token ${n} is not in tokens version ${R.version}.`); }
    sunButtons += (line.match(/(?<![\w-])btn-sun(?![\w-])|variant=["']sun["']/g) || []).length;
  });
  if (sunButtons > 1 && !/\.(css|html)$/.test(file)) add('C1', file, 1, '', `${sunButtons} sun buttons in one file. One sun per screen: check that only one of them shows at a time.`);
}
if (cssSeen && !hasReducedMotion) add('M2', srcDirs[0], 1, '', 'No prefers-reduced-motion rule found in the stylesheets.');

/* ---------- 3. the report ---------- */
const key = f => `${f.id}|${path.relative(process.cwd(), f.file)}|${f.text}`;
let known = new Set();
if (baselinePath && fs.existsSync(baselinePath) && !writeBaseline) known = new Set(JSON.parse(fs.readFileSync(baselinePath, 'utf8')).findings);
if (writeBaseline) {
  if (!baselinePath) { console.error('--write-baseline needs --baseline <file>'); process.exit(2); }
  fs.writeFileSync(baselinePath, JSON.stringify({ version: R.version, written: new Date().toISOString(), findings: [...new Set(findings.map(key))].sort() }, null, 1));
  console.log(`Baseline written: ${findings.length} findings in ${baselinePath}. New findings will fail from now on.`); process.exit(0);
}
const fresh = findings.filter(f => !known.has(key(f)));
const isErr = f => f.level === 'error' || strict;
const errors = fresh.filter(isErr), advice = fresh.filter(f => !isErr(f));
const report = { version: R.version, files: files.length, errors: errors.length, advice: advice.length, knownFromBaseline: findings.length - fresh.length, waivers, findings: fresh };
if (asJson) console.log(JSON.stringify(report, null, 1));
else {
  const rel = f => path.relative(process.cwd(), f) || f;
  console.log(`Solarium design check, rules version ${R.version}. ${files.length} files scanned.`);
  const byRule = {};
  for (const f of fresh) (byRule[f.id] ||= []).push(f);
  for (const id of Object.keys(byRule).sort()) {
    console.log(`\n${id}  ${title[id] || ''}  (${byRule[id].length}, ${(level[id] === 'error' || strict) ? 'error' : 'advice'})`);
    for (const f of byRule[id].slice(0, 40)) console.log(`  ${rel(f.file)}:${f.line}  ${f.msg}${f.text ? '\n      ' + f.text : ''}`);
    if (byRule[id].length > 40) console.log(`  and ${byRule[id].length - 40} more`);
  }
  if (waivers.length) { console.log(`\nWaivers in the code (${waivers.length}). Each needs Mohit's yes:`); for (const w of waivers) console.log(`  ${w.id}  ${rel(w.file)}:${w.line}  ${w.reason || 'no reason given'}`); }
  console.log(`\nResult: ${errors.length} errors, ${advice.length} advice, ${report.knownFromBaseline} known from the baseline, ${waivers.length} waivers.`);
}
process.exit(errors.length ? 1 : 0);
