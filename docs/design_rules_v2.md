# Rules

These are the rules of First Light. Each has an id. The checker (`rules/solarium_check.mjs`) enforces the ones marked checker, and a person checks the rest against the reference pages.
A rule is broken on purpose only in writing: a comment `solarium-allow <rule id>: <reason>` on that line or the line above, with Mohit's yes. The checker lists every such line, so nothing is broken quietly.

Colours carry their own check. Every colour token names the tokens it is paired with, and each pair holds 4.5 to 1 in light and in dark. Change a colour on this page and the pair is checked again in front of you.

## Colour

| Id | Rule | Checked by |
| --- | --- | --- |
| C1 | **One sun per screen.** `sun` is for the offer price and for the single most important action of a screen. One sun button per screen, no sun for decoration or for a second action. The sun only works while it is rare. The checker counts sun buttons per file and reports more than one. | review |
| C2 | **Orange is never text.** Orange text is `ember`. `sun` is never a text colour. `sun` on a white card is 2.57 to 1 and fails as text. `ember` holds 4.5 to 1 in both themes. | checker |
| C3 | **Never white text on the sun.** Text, numerals and icons on `sun` are `sun-foreground`. White on the sun is 2.5 to 1. The deep blue is 5.6 to 1. | checker |
| C4 | **No raw colour values.** A colour value (hex, rgb, hsl, oklch) appears only in the tokens file. Everything else uses a token. A value typed by hand is not in a checked pair and does not follow the theme. | checker |
| C5 | **Components use the role tokens, not the scales.** `blue-950` to `blue-25`, `orange-900` to `orange-50` and `white` are used only inside the tokens file, to build role tokens and gradients. Components use role tokens such as `foreground`, `brand`, `on-dark`, `paper`. No Tailwind palette colours. Version 1 used `blue-900` for headlines. In dark theme the ground changed and the headline did not, so it vanished. | checker |
| C6 | **Every colour belongs to a checked pair.** Every colour token names the tokens it is checked with. Named pairs hold 4.5 to 1 in light and in dark. Large fills and edges also hold 3 to 1 against the surfaces named for them. A colour without a pair cannot be checked, and a pair that fails cannot be read. | checker |
| C7 | **The tokens file is not edited by hand.** The tokens file in a product is the file the design system published, byte for byte. A change is a new version from the design system. One edited value breaks the pairs silently. The checker compares the file with its published fingerprint. | checker |
| C8 | **A status takes one of the ten roles.** Every status maps to a role in the Status and sequences section and uses that role's three tokens. No status gets a colour of its own. Ten meanings can be learnt. Forty colours cannot. | review |
| C9 | **Never by colour alone.** A state always has a word, and where it helps a shape or a count: the chip has a label, the stepper has circles and diamonds, the temperature has bars and a word. Colour is lost in sunlight, on poor screens and for colour-blind people. | review |
| C10 | **Night surfaces stay night.** The sky, the night band, the app bar, the side navigation, the call panel and the footer stay dark in both themes and take `on-dark`, `on-dark-soft`, `on-dark-muted` and `on-dark-accent`. Every other surface follows the theme and takes themed text. Mixing the two families is how text disappears in one of the themes. | review |
| C11 | **No new gradients.** Only the gradient tokens: `gradient-sky`, `gradient-dusk`, `gradient-dusk-short`, `gradient-horizon`, `gradient-mist`, `gradient-night`, `gradient-appbar`, `gradient-sun`, `gradient-glow`, `gradient-halo`, and `gradient-caret` for the arrow of a select. The sky and the sun are the brand's pictures. A new gradient is a new picture. | checker |

## Type

| Id | Rule | Checked by |
| --- | --- | --- |
| T1 | **Two font families.** Fonts come from `font-display` and `font-sans` only. Newsreader and Hanken Grotesk carry the look, with the Gujarati faces in the same stacks. | checker |
| T2 | **Nothing below 12px.** No text is smaller than 12px. Gujarati text is never smaller than 13px. Smaller text is not readable on the phones the customers and the field staff use. | checker |
| T3 | **No words in capitals.** No `text-transform: uppercase` and no labels typed in capitals, except names such as DISCOM, UGVCL and BSE. Sentence case is the brand's voice. | checker |
| T4 | **Headlines stay whole.** A headline is never set with one word in another colour or style, and takes two lines at most on a desktop. | review, advice |
| T5 | **The price style is for the price.** Only the offer price uses `t-price`. | review, advice |

## Shape

| Id | Rule | Checked by |
| --- | --- | --- |
| S1 | **Corners from the corner tokens.** Corner radii are `corner-3xs` to `corner-full`, or 50% for a circle. No radius typed in pixels. | checker |
| S2 | **Shadows from the shadow tokens.** Shadows are `shadow-xs`, `shadow-card`, `shadow-float` and the two sun rims. A line or a ring drawn as a shadow, with no blur and a token colour, is allowed. | checker, advice |
| S3 | **A side bar means selected or overdue.** A coloured bar on one side of a row or card means selected (sun) or overdue (attention). Never decoration. | review |
| S4 | **Touch targets of 44px.** Nothing a finger presses on a phone is smaller than `touch-min`. | review |
| S5 | **Layers from the layer tokens.** Stacking uses `z-header`, `z-dock`, `z-overlay`, `z-modal`, `z-toast`. Small local values up to 9 are allowed. | checker, advice |
| S6 | **Spacing follows the grid.** Padding, margin and gap are multiples of 2px. Gaps between blocks, gutters and section padding use the spacing tokens, `space-1` to `space-30`, which run in 4px steps. | checker, advice |

## Words

| Id | Rule | Checked by |
| --- | --- | --- |
| W1 | **No em dash, no en dash.** No em dash and no en dash in any text people read. Use a comma, a full stop or the word to. House rule for every Solarium text. | checker |
| W2 | **No emoji, no exclamation marks.** No emoji anywhere. No exclamation marks in interface text. | checker, advice |
| W3 | **The price and its footnote travel together.** The offer price is written ₹0* and the footnote that explains the asterisk is on the same screen. | review |
| W4 | **Last digits only.** The CRM shows only the last digits of phone numbers, consumer numbers and payment references. Mock-ups and demos use invented names. | review |
| W5 | **English and Gujarati.** Every text on the website exists in English and Gujarati, set from the same styles. | review |

## Motion

| Id | Rule | Checked by |
| --- | --- | --- |
| M1 | **One moment per page.** On the website only the sun moves on its own when the page opens. Everything else moves only in answer to a press. | review, advice |
| M2 | **Reduced motion is respected.** The stylesheet holds a `prefers-reduced-motion: reduce` rule that stops animation and transition. | checker |
| M3 | **Focus is always visible.** No `outline: none` without a visible replacement. The ring is `ring`, and `sidebar-ring` over night surfaces. | checker |

## Brand

| Id | Rule | Checked by |
| --- | --- | --- |
| B1 | **The logo files are used unchanged.** Never recolour, redraw or trace the logo. There is no vector file. | review |
| B2 | **Client marks stay in the logo wall.** Client marks appear only in the logo wall, on `paper`, in their own colours, with the line that names them as projects executed. | review |

## Process

| Id | Rule | Checked by |
| --- | --- | --- |
| P1 | **A rule is broken only in writing.** To break a rule on purpose, write `solarium-allow <rule id>: <reason>` in a comment on that line or the line above, and get Mohit's yes. The checker lists every such line in its report. So a rule is never broken without someone knowing. | checker |
| P2 | **The checker runs before every release.** Each product runs the checker in its build. A build with errors does not ship. | review |

## How the pairs are written

- Text tokens: "Text on `card`, `background` and `muted`." The token is the ink, the list is every ground it may sit on.
- Small marks and control edges: "A mark on `card` and `background`." They hold 4.5 to 1, above the 3 to 1 the standard asks, because the CRM is read on phones outdoors.
- Grounds, fills and lines: "Pair checked on `foreground`." The list is the ink that goes over them.
- Large fills, marks and edges also hold 3 to 1 beside their other neighbours. Those pairs are listed in `rules/solarium_rules_v2.json` and checked by the checker.
- Translucent veils (`glass-1`, `glass-line`, `scrim` and the others in the Overlay list) are not in the colour list. They are checked as rendered, on the night surfaces they sit on.

## How the system itself is checked

Before every publish the design system runs three checks on itself: every named pair in both themes, every preview and reference page rendered in both themes with the contrast of each piece of text measured against the pixels behind it, and the checker over its own stylesheet and pages. A publish with a failure does not go out.
