<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Solarium design rules (First Light, version 2)

The look of this product comes from the Solarium Design System. Its rules are checked by `scripts/solarium_check.mjs`.

- Run the checker before you finish any change that touches the interface. Do not report the work as done while it shows a new error.
  `npm run check:design`
- Fix a finding. Do not silence it. Never add to the baseline file without Mohit's yes.
- A rule is broken on purpose only in writing: a comment `solarium-allow <rule id>: <reason>` on that line or the line above, and Mohit's yes in the pull request or the package report.
- Never edit `app/styles/tokens_v2.css`, `app/styles/tailwind_theme_v2.css` or `app/styles/solarium.css`. A change to them is a new version of the design system: ask Mohit.

The rules in short. The full text is in `docs/design_rules_v2.md`.

- C1 One sun button per screen. C2 Orange text is `ember`, never `sun`. C3 Text on the sun is `sun-foreground`.
- C4 No raw colour values outside the tokens file. C5 Role tokens only: no `blue-NNN`, `orange-NNN`, `white`, no Tailwind palette colours.
- C10 Night surfaces (sky, app bar, side navigation, call panel, footer) stay dark in both themes and take the `on-dark` tokens. Every other surface follows the theme.
- C11 No gradients except the gradient tokens.
- T1 Fonts through `font-display` and `font-sans`. T2 Nothing below 12px, Gujarati never below 13px. T3 No text in capitals.
- S1 Corners from the corner tokens. S2 Shadows from the shadow tokens. S6 Spacing on a 2px grid.
- W1 No em dash and no en dash in any text. W2 No emoji.
- M2 Keep the reduced motion rule. M3 Never remove a focus outline without a replacement.
- Check by eye against the live pages and the parts in `app/components/ui/`: C8 statuses use the ten roles, C9 never colour alone, S3 a side bar means selected or overdue, S4 touch targets of 44px, W3 the price with its footnote, W4 last digits only.
- Light theme only: never add the class `dark`, `data-theme` or `prefers-color-scheme`.
