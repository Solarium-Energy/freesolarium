# Motion

How the website moves. The idea is the name of the look, First Light: the page opens like a sunrise, and everything that comes into view rises into place the way the sun does.

This page replaces rule M1 ("one moment per page") of `docs/design_rules_v2.md` on the website. Rules M2 (reduced motion) and M3 (visible focus) hold as written.

## Where the code is

| File | What it holds |
| --- | --- |
| `app/styles/motion.css` | Every animation and transition of the site |
| `app/components/Motion.tsx` | The controller. One copy in the root layout. It marks parts of the page, and the stylesheet does the moving |
| `app/components/ui/TweenNumber.tsx` | A figure that glides to its new value (the price in the quotation bar) |
| `app/layout.tsx` | A one-line script in the head that sets `html.mo` before the first paint, unless the visitor has asked for reduced motion |

## The three kinds of movement

1. **On load: the hero's sunrise.** A veil of night lifts, the sun comes up, its glow blooms, the seven rays reach out from it, and the headline, the buttons, the side texts and the quotation bar rise into place. About 1.6 seconds, pure CSS. Afterwards the glow breathes and the rays shimmer, slowly.
2. **On scroll.**
   - Parts rise into view once, one after another when several arrive together.
   - Figures count up ("25,000+", "4.7").
   - Three pictures follow the scroll: the hero's sun sinks behind the quotation bar while the headline lifts away, the curve of "From booking to solar power" draws itself and lights each step as the line reaches it, and the sun of the closing section rises into place.
   - The header drops in when it turns solid and marks the nav link of the section on screen.
3. **On touch.**
   - On a desktop the hero's layers follow the pointer by different amounts, which gives depth.
   - Buttons lift, their arrows nudge, a press shrinks them slightly.
   - In the component explorer the orange arc travels round the ring to the chosen component, the picture settles in and the panel's lines follow one another.
   - The price in the quotation bar glides to its new value when a choice changes.
   - Each step of the quotation sheet settles in. On the result screen the mark lands with a small bounce, a ring spreads from it and the tick is drawn.

## How to make a part move

Add one attribute. Nothing else is needed, and nothing is hidden when the controller cannot run.

| Attribute | On | What happens |
| --- | --- | --- |
| `data-mo=""` | a part | It rises into view once. `data-mo="fade"`, `"left"`, `"right"` or `"pop"` change the movement |
| `data-mo-group=""` | a parent | Each child rises in, one after another. `data-mo-group="fade"` or `"pop"` change the movement |
| `data-mo-delay="2"` | a part or a group | Starts its turn later, by that many steps |
| `data-mo-count=""` | a figure | A lone number with an optional `+` or `%` counts up when it comes into view. Any other text is left alone |
| `data-mo-scroll="exit"` or `"enter"` | a block | `--mo-p` runs from 0 to 1 as the block leaves the top of the screen, or enters from the bottom |
| `data-mo-at="0.4"` | a part inside such a block | It appears once `--mo-p` has reached that value |
| `data-mo-pointer=""` | a block | `--mo-x` and `--mo-y` follow the pointer over it, from -1 to 1, on devices with a mouse |

The controller answers with `data-in` on a part that has arrived and `--mo-i` (0, 1, 2 ...) for its turn among the parts that arrived with it. Write the movement in `motion.css` against those.

## The limits

- **Reduced motion.** When the visitor has asked for it, nothing moves at all: the head script never sets `html.mo`, and the stylesheet stops every animation and transition, drawn parts included.
- **Nothing is hidden without the controller.** Every hidden state sits under `html.mo`. Without JavaScript the page is complete. If the controller fails to start, hidden parts show after 3 seconds.
- **Nothing shifts the layout.** Only `opacity`, `translate`, `scale`, `rotate`, `transform`, `clip-path` and `stroke-dashoffset` move. Measured on a full scroll of the offer page: a layout shift below 0.01, where 0.1 is the limit for a good page.
- **Once.** A part rises into view one time. It does not leave and return as the page scrolls back.
- **Short.** Entrances take 0.5 to 0.7 seconds with the `--mo-ease` curve, a step between parts is 80 ms, and answers to a press take the `--dur-fast` and `--dur-base` tokens. Only the hero's sunrise is longer.
- **Working pages stay calm.** The booking form has one quiet entrance. The legal pages do not move.
- **Tokens only.** The motion stylesheet uses the design tokens for every colour and passes `npm run check:design`. Its own variables start with `--mo-`.
