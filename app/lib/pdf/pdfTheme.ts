/* The theme of the quotation PDF: Solarium design system, First Light, tokens version 2.

   This is the only file of the PDF that holds raw values. A canvas cannot read CSS variables, so the
   colours are copied from the light values of app/styles/tokens_v2.css, each under its token's name.
   scripts/check_pdf_theme.mjs compares them with the tokens file in every build: a colour that differs,
   or a name that is not a token, fails the build. Change a colour in the tokens file first, then here. */

/* The colour table. One token per line, "token-name": "value", so the build can read it as plain text. */
export const PDF_COLORS = {
  "card": "#FFFFFF",
  "foreground": "#05233F",
  "muted-foreground": "#4A6076",
  "brand": "#034982",
  "status-positive-fg": "#0C5E4E",
  "border": "#D5E1ED",
  "input": "#5B7086",
  "primary": "#022B4E",
  "primary-foreground": "#FFFFFF",
  "muted": "#EAF1F8",
  "subtle": "#EEF4F9",
  "selected": "#FFF4E3",
  "sun": "#F58401",
  "sky-top": "#021B33",
  "on-dark": "#FFFFFF",
  "on-dark-muted": "#B9D2E6",
  "glass-line": "rgba(255,255,255,0.18)",
} as const;

export type PdfColor = keyof typeof PDF_COLORS;

/* The two families of the site, with the faces the page already loads. Hanken Grotesk has no rupee sign:
   as on the site, it comes from Noto Sans Gujarati, the next face of the token's stack. */
export const PDF_FONTS = {
  display: '"Newsreader", Georgia, serif',
  sans: '"Hanken Grotesk", "Noto Sans Gujarati", system-ui, Arial, sans-serif',
} as const;

export type PdfTextStyle = { family: keyof typeof PDF_FONTS; weight: number; size: number };

/* The type styles, in the drawing's own units. A printed page has its own floor: nothing below 9. */
export const PDF_TYPE = {
  /** The document title. */
  title: { family: "display", weight: 400, size: 24 },
  /** The total price, the net cost figures, the values of the stat band. */
  figure: { family: "display", weight: 400, size: 17 },
  /** Titles of blocks and boxes, the names of the payment modes. */
  heading: { family: "sans", weight: 600, size: 11 },
  /** The eyebrow above the title. */
  eyebrow: { family: "sans", weight: 600, size: 10 },
  /** Field labels, option names, row labels. */
  label: { family: "sans", weight: 500, size: 10 },
  /** A row label that sums up the rows above it. */
  labelStrong: { family: "sans", weight: 600, size: 10 },
  /** Plain rows. */
  body: { family: "sans", weight: 400, size: 10 },
  /** Amounts, and everything filled in for this customer. */
  value: { family: "sans", weight: 600, size: 10.5 },
  /** Hints under a label, notes, the note in a title bar. */
  small: { family: "sans", weight: 400, size: 9 },
  /** The scheme line beside the logo. */
  smallStrong: { family: "sans", weight: 600, size: 9 },
} as const satisfies Record<string, PdfTextStyle>;

export type PdfTypeName = keyof typeof PDF_TYPE;

/* Corners, from the corner tokens. */
export const PDF_CORNERS = {
  "corner-3xs": 2,
  "corner-xs": 8,
} as const;

/* The page: A4 at 96 units per inch, drawn at 2.25 times its size. */
export const PDF_PAGE = {
  width: 794,
  height: 1123,
  scale: 2.25,
  marginX: 32,
  marginTop: 28,
  marginBottom: 28,
  /** The space between two blocks. */
  blockGap: 12,
} as const;

/* Every character outside plain ASCII that the page draws. The browser fetches the part of a font
   that holds a character only when asked for it, so the fonts are loaded with this text. */
export const PDF_SAMPLE_TEXT = "Aa1 ₹ − × · • …";
