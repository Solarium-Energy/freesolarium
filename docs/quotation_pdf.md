# Quotation PDF

The quotation a customer downloads from the quotation sheet. It is two A4 pages in English, in the Solarium design system, First Light (version 2). It is generated: nothing on it is filled in by hand and it needs no signature.

- Page 1, the quotation: the header, the customer's fields (name, mobile, PIN code, category, DISCOM, the quote number when the CRM gave one, the date and "Valid for 15 days"), the three option tables, the price in three blocks (what you pay, what comes back to your bank account, the effective cost), the terms of the chosen payment mode, the payment details (Solarium's payment QR and its bank account), and a line at the foot.
- Page 2, what you get: a small header, the table of what the system includes, the notes, the documents required and the band of four figures.

## How it is made

Everything happens in the browser, without a PDF library:

1. `app/lib/quotationPdf.ts` waits for the fonts (4 seconds at most) and loads the logo and the payment QR.
2. For each page it makes a canvas of 794 by 1123 units (A4 at 96 units per inch), drawn at 2.25 times that size.
3. Each page is drawn on its canvas from parts, saved as a JPEG, and the pictures are wrapped into one PDF, a page each.

The entry point is `generateQuotationPdfBlob(data, paymentMode, quoteNo, quoteDate)`. `quoteNo` is the number the CRM issued, or null: then it is left out. The website never makes one.

| File | What it holds |
| --- | --- |
| `app/lib/pdf/pdfTheme.ts` | The only file with raw values: the colours under their token names, the two font stacks, the type styles, corners, page size and margins |
| `app/lib/pdf/pdfParts.ts` | The document parts and the helpers under them |
| `app/lib/pdf/quotation218.ts` | What the quotation for the 2.18 kW system contains: its two pages, the parts of each in order, with their words and figures |
| `app/lib/payment.ts` | Solarium's payment QR (`public/images/payment-qr.png`) and its bank details. They are kept there only |
| `app/lib/quotationPdf.ts` | The browser side: fonts, logo and QR, a canvas per page, JPEG, PDF |
| `scripts/check_pdf_theme.mjs` | Compares the theme's colours with `app/styles/tokens_v2.css` |

A canvas cannot read CSS variables, so the theme copies the light values of the tokens. `npm run check:design` (and so every build) fails when a colour in the theme differs from its token, or names a token that does not exist.

## Parts

A part draws at the current position of the document and moves it on by its own height. It takes a document (the context, the left edge, the width, the current `y`) and its own content, and holds no words of its own. The composition is a list of parts with a fixed gap between blocks. After the last part of a page the page is checked: in development a page that runs past the bottom margin throws, and in production it is drawn anyway.

| Part | What it takes |
| --- | --- |
| `DocHeader` | A logo (or a name to write when it does not load), the scheme lines beside it, an optional eyebrow, a title, and reference fields such as the quote number and the date. Without an eyebrow the title stands alone, level with the logo, and the header keeps its height. The quotation has none |
| `FieldRows` | Rows of fields, each a label and a value, one or more per row, sized by `span`. A value is written on a line that starts after the label's measured width, and is cut with an ellipsis at the end of its line |
| `OptionBox` | A title, a note for the title bar, a number of columns, and options: label, price, ticked, included |
| `SideBySide` | Parts placed in one row, with widths in proportion to their weights |
| `PriceBlock` | A title and a note, rows of label and amount (plain, less or strong) on the left, rows with a line to fill in on the right, and the total |
| `PaymentColumns` | A title and a note, any number of columns (a name, chosen or not, rows of label, hint, fixed value or a line to fill in, and the net cost), and the fields of a closing row |
| `Notes` | A heading and any number of notes, each wrapped inside the page |
| `CheckList` | A title and tick items, in a row that wraps |
| `SignatureLines` | Lines to sign on, each with a caption |
| `StatBand` | A few figures with their captions on a dark band |
| `AmountBlock` | A title and rows of a label (with a fine note) and an amount. `positive` puts it on the positive ground, for money that comes back |
| `TotalRow` | One total: a label, a note and the amount in the display face |
| `TermsBlock` | The terms of the chosen payment mode: its name, its rows, the net cost and a footnote |
| `PaymentDetails` | The payment QR on a white square with its caption, a table of bank details beside it, and a note under both |
| `DataTable` | Columns by weight and rows whose cells wrap inside their column |
| `PageHeader` | A small head for a following page: logo, title, reference values |
| `FootLine` | A line at the foot of the page |

The parts of the earlier one-page form (`PriceBlock`, `PaymentColumns`, `SignatureLines`) stay in the kit for documents that are filled in by hand.

## Type

Two families only: Newsreader for display, Hanken Grotesk for everything else. Hanken Grotesk has no rupee sign: as on the website, it comes from Noto Sans Gujarati, the next face of the stack. The fallbacks are Georgia and serif, and system-ui, Arial and sans-serif. The digits of both families are of equal width, so right-aligned amounts line up.

| Style | Family, weight, size | Used for |
| --- | --- | --- |
| `title` | Newsreader 400, 24 | The document title, and the name in place of a missing logo |
| `figure` | Newsreader 400, 17 | The total price, the net cost figures, the values of the stat band |
| `heading` | Hanken Grotesk 600, 11 | Titles of blocks and boxes, the names of the payment modes |
| `eyebrow` | Hanken Grotesk 600, 10 | The eyebrow above the title, when a document has one |
| `label` | Hanken Grotesk 500, 10 | Field labels, option names, row labels, captions |
| `labelStrong` | Hanken Grotesk 600, 10 | A row label that sums up the rows above it |
| `body` | Hanken Grotesk 400, 10 | Plain rows |
| `value` | Hanken Grotesk 600, 10.5 | Amounts, and everything filled in for this customer |
| `small` | Hanken Grotesk 400, 9 | Hints, notes, the note in a title bar |
| `smallStrong` | Hanken Grotesk 600, 9 | The scheme line beside the logo |

## Colour

Every colour is the light value of a token.

| What | Token |
| --- | --- |
| The page | `card` |
| Main text | `foreground` |
| Labels, hints, notes, captions, bullets | `muted-foreground` |
| Values filled in for this customer | `brand` |
| "Included", the discount, the subsidies | `status-positive-fg` |
| Hairlines between rows and around boxes | `border` |
| Lines to write on, the edge of an empty tick box | `input` |
| A ticked box | `primary`, the tick in `primary-foreground` |
| Title bar of an option box | `primary`, text `primary-foreground` |
| Title bar of the price and payment blocks | `muted`, text `foreground` |
| The row of payment mode names | `subtle` |
| The chosen payment mode | its name cell on `selected`, with a 3-unit `sun` bar on its left edge |
| The total row and the net cost row | `muted`, with a 1-unit `foreground` rule above |
| The eyebrow, when a document has one | text `brand`, with a 5-unit `sun` dot in front |
| The stat band | `sky-top`, values `on-dark`, captions `on-dark-muted`, dividers `glass-line` |
| What comes back to the bank account | `status-positive-bg`, text `status-positive-fg` |
| The square behind the payment QR | `card` with a `border` hairline |

## Rules of the page

- Orange appears twice at most: the bar on the chosen payment mode, and the dot of an eyebrow when a document has one. Orange is never text and never a fill behind text. No gradient.
- The chosen payment mode is shown by its tick, by the `selected` ground and by the sun bar, never by colour alone.
- Nothing is smaller than 9 units. A printed page that holds a whole quotation has its own floor. The screen rule of 12 pixels does not fit one page.
- Sentence case. Names such as DISCOM, UGVCL and BSE keep their capitals. No dash and no exclamation mark.
- Boxes and blocks have corners of `corner-xs` (8) and a hairline in `border`. A tick box has corners of `corner-3xs` (2).
- Exactly two pages. Nothing is cut short and nothing overlaps.
- Margins of 32 on both sides, 12 between blocks, at least 28 free under the stat band and the foot line.
- The payment QR is drawn at 120 units on a white square with a white margin, in its own proportions. It must still scan from the stored page.
- The logo is used unchanged, with clear space around it.

## A new quotation

1. Copy `app/lib/pdf/quotation218.ts` to a new file and give it a new function name.
2. Change the content: the options, the rows of the price block, the payment columns, the notes, the documents. Take the figures from the quotation's own constants and calculation. Do not write a figure into the drawing.
3. Keep the parts as they are. A part that takes four options, two payment modes or eight notes needs no change. If a new kind of block is needed, add it to `pdfParts.ts` as a new part that takes its content as data.
4. Point the browser side at the new function, run `npm run build` (it runs the design check and the theme check), and look at the PDF in a browser at full size. Nothing may run past the bottom margin.
