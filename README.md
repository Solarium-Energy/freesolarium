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
  page.tsx                    Page composition + FAQ structured data
  globals.css                 Tailwind theme, textures, reveal/marquee animations
  lib/content.ts              All copy, pricing, contact details, FAQs
  components/
    Header.tsx                Sticky nav + mobile menu
    Hero.tsx                  Hero + price card
    TrustStrip.tsx
    ProductSection.tsx
    Institutions.tsx
    HowItWorks.tsx
    Faq.tsx
    FinalCta.tsx
    Footer.tsx
    MobileCta.tsx              Sticky mobile conversion bar
    Reveal.tsx                 Lightweight scroll reveal
  book/page.tsx               Booking form (/book)
  api/order/route.ts          Order endpoint (sends the booking form to the Solarium CRM)
public/
  images/                     Hero / product imagery
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
- `npm run check:design` checks the code against the design rules (`docs/design_rules_v2.md`). `npm run build` runs it first, so a new finding stops the build.
- Light theme only: no dark theme, no theme switch.
