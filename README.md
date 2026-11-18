# Solarium — ₹0 Home Solar Order Page

A single-page Next.js (App Router) site for Solarium's **2.18 kW home solar at ₹0 effective cost** offer under PM Surya Ghar.

Built from the client's `Solarium ₹0 Solar Order Page.html` content brief, redesigned as a production-ready Next.js page.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build
npm start
```

## Project structure

```
app/
  layout.tsx                  Fonts, metadata, global shell
  page.tsx                    Offer page (/) + FAQ structured data
  globals.css                 Tailwind and the design system's stylesheets
  styles/
    tokens_v2.css             Design tokens (copy of the design system, never edited)
    tailwind_theme_v2.css     Tailwind mapping of the tokens (copy, never edited)
    solarium.css              Design system stylesheet (copy, never edited)
    site.css                  The site's own rules, tokens only
    motion.css                All motion: the hero's sunrise, rise into view, scroll and touch
  lib/
    content.ts                All copy, contact details, FAQs
    language.tsx              English and Gujarati switch
    quotation.ts              Quotation prices, options and calculation
    quotationPdf.ts           Quotation PDF, browser side (fonts, logo, QR, a canvas per page, PDF)
    payment.ts                Solarium's payment QR and bank details, shown on the quotation PDF
    pdf/
      pdfTheme.ts             PDF colours, type and sizes, copied from the tokens
      pdfParts.ts             Document parts of the PDF
      quotation218.ts         What the 2.18 kW quotation contains, page by page
    leadClient.ts             Sends the forms to the site's server routes
    legal.ts                  Privacy policy and terms of service text
  components/
    ui/                       Design system parts (Button, Field, Sheet, FileUpload, ...)
    quotation/                Quotation bar, sheet and their shared state
    legal/                    Layout of the privacy policy and terms pages
    Motion.tsx                Motion controller: marks parts as they come into view (see docs/motion.md)
    Header.tsx                Header + phone menu
    BookButton.tsx            "Book at ₹0*" button
    Hero.tsx                  Hero with the sun, the price and the quotation bar
    StatsBand.tsx
    ComponentExplorer.tsx     What you get: the ten components
    LogoWall.tsx              Institutional clients
    SixRays.tsx               The 6S
    RisingSteps.tsx           After you book
    Reviews.tsx
    FaqSection.tsx
    ClosingCta.tsx
    Footer.tsx
    PhoneDock.tsx             Price and action bar on phones
    TestModeBar.tsx           Shown in test mode (?test=1)
  book/page.tsx               Booking form (/book)
  privacy/page.tsx            Privacy policy (/privacy)
  terms/page.tsx              Terms of service (/terms)
  api/quote/route.ts          Quotation endpoint (sends the quotation to the Solarium CRM)
  api/order/route.ts          Order endpoint (sends the booking form to the Solarium CRM)
  api/order/upload-links/     One-time upload links for the booking form's documents
  api/_lib/                   Request checks and the CRM call, shared by the endpoints
public/
  images/                     Hero / product imagery, the payment QR
  clients/                    Client marks for the logo wall
scripts/
  solarium_check.mjs          Design rule checker (npm run check:design)
  check_pdf_theme.mjs         Checks the PDF's colours against the tokens (part of check:design)
docs/
  design_rules_v2.md          The design rules
  quotation_pdf.md            How the quotation PDF is built from its parts
  motion.md                   How the site moves, and how to make a new part move
```

Institution names are rendered as text pills rather than client logos: the supplied logo files were too small to use legibly on a single page.

## Before launch — please confirm

These values came from the client brief or the existing Solarium site. Anything marked **TODO** needs sign-off:

1. **Pricing** (`app/lib/content.ts` → `PRICING`)
   - System value ₹1,00,000
   - Central subsidy ₹63,240
   - Gujarat state subsidy ₹36,760
   - Effective cost ₹0
   - Multi-floor / elevated structure charges (currently `0` = "quoted after survey")
2. **Timelines** — survey and installation windows are intentionally non-committal ("we call to schedule", "after your approval"). Add real SLAs if the client wants them.
3. **Insurance** — insurer name, perils covered and claim process are referenced but not published. Add the policy document link if available.
4. **Ranking claim** — the footer retains `[SOURCE AND DATE]` for the “#1 in Gujarat” claim. Replace or remove it.
5. **Legal** — the footer links Privacy to `https://solariumenergy.in/privacy-policy/` and Disclaimer to the on-page disclaimer note. The main site has no Terms page, so no Terms link is included. Add CIN and registered address if the client wants them in the footer.
6. **Phone / WhatsApp** — uses the existing toll-free number `80030 80020` (`+91 80030 80020` for WhatsApp). Confirm WhatsApp is enabled on this number, or update `site.whatsappNumber`.
7. **Order handling**: the quotation card and the booking form send each lead to the Solarium CRM through the site's server routes (`/api/quote`, `/api/order/upload-links`, `/api/order`). The site keeps no copy.
   - Documents upload from the browser straight into the CRM's storage through one-time links.
   - Environment variables: `CRM_INTAKE_URL` and `CRM_INTAKE_KEY` (server only), `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (browser).
   - Without the two CRM variables, development skips the call and production shows the visitor an error instead of a confirmation.

## Notes

- Booking form uploads: photos (JPG, PNG, WebP, HEIC, HEIF) and PDFs up to 10 MB each, MP4 videos up to 50 MB on the two site inputs.
- The booking form requires name, 10-digit mobile, 6-digit pincode, city, DISCOM and project type before it submits.
- All animations respect `prefers-reduced-motion`.
- Fonts: Newsreader (display) and Hanken Grotesk (text), with Noto Serif Gujarati and Noto Sans Gujarati for Gujarati, loaded from Google Fonts in `app/layout.tsx`.

## Design system

The look comes from the Solarium design system, First Light, version 2.

- `app/styles/tokens_v2.css`, `app/styles/tailwind_theme_v2.css` and `app/styles/solarium.css` are copies of the design system's files. They are never edited: a new version of the design system replaces them file for file.
- Site rules go into `app/styles/site.css`, written with tokens only. The parts live in `app/components/ui/`.
- `npm run check:design` checks the code against the design rules (`docs/design_rules_v2.md`). `npm run build` runs it first, so any finding stops the build.
- Light theme only: no dark theme, no theme switch.
