# Motion

How the website moves. The idea is the name of the look, First Light: the page opens like a sunrise, the rays of its suns keep turning, and everything that comes into view arrives the way light does.

This page replaces rule M1 ("one moment per page") of `docs/design_rules_v2.md` on the website. Rules M2 (reduced motion) and M3 (visible focus) hold as written.

## Where the code is

| File | What it holds |
| --- | --- |
| `app/styles/motion.css` | Every animation and transition of the site |
| `app/components/Motion.tsx` | The controller. One copy in the root layout. It marks parts of the page, and the stylesheet does the moving |
| `app/components/ui/TweenNumber.tsx` | A figure that glides to its new value (the price in the quotation bar) |
| `app/layout.tsx` | A one-line script in the head that sets `html.mo` before the first paint, unless the visitor has asked for reduced motion |

## The four kinds of movement

1. **Entrances.**
   - The hero's sunrise, when the page opens: a veil of night lifts, the sun comes up, its glow blooms, the rays come up already turning, and the headline, the buttons, the side texts and the quotation bar rise into place. About 1.6 seconds, pure CSS.
   - Parts arrive once as they come into view, one after another when several arrive together. Figures count up ("25,000+", "4.7").
   - The six points of the 6S arrive one at a time as the page scrolls on. The first one rises. For each one after it, the small sun of the point before copies itself and travels to the new point with that point's ray still lit, hands the light over to the new point's own ray as it lands, and the words slide out from behind the edge of the point before.
   - The header drops in when it turns solid, and marks the nav link of the section on screen.
2. **What follows the scroll.**
   - "From booking to solar power", on a desktop: the curve draws itself as the chart scrolls into view. Each numbered point, its dotted line and its step in the row of words under the chart arrive when the line reaches that point, and the sun arrives last. A jump down the page still draws the line, at a steady glide, and a line that has started is never left half drawn: when the page rests with the chart in view, it finishes.
   - "From booking to solar power", on a phone: the six steps hang on one line, taller than the screen, so the line follows the reader. A small sun travels down the rail with the scroll and draws the blue line behind it. A step ahead is not hidden: it waits in the half light and is lit when the light reaches its number, which beats once. At the last number the light is home: that number is the sun, its rays open and then keep turning. When the line is whole, the list is the list as it is drawn without motion.
   - The hero, on a desktop: its layers shift a little with the scroll and with the pointer, by different amounts, which gives depth. The sun sinks behind the quotation bar as the page moves on.
3. **What keeps moving.**
   - The rays of the hero's sun turn clockwise at one steady speed, without a stop. While they turn, the last ray on the right fades out and a new one comes up on the left.
   - The sun at the end of the curve does the same, so its rays always point upwards, and its glow breathes.
   - The glow of the hero breathes and the glass of the 6S section drifts, both slowly.
   - All of these rest while they are off the screen.
4. **Answers to a press.**
   - Buttons lift, their arrows nudge, a press shrinks them slightly.
   - In the component explorer the orange arc travels round the ring to the chosen component, the picture settles in and the lines of the panel follow one another. The pager under the panels never moves: the ten panels share one place, as tall as the tallest of them.
   - The price in the quotation bar glides to its new value when a choice changes.
   - Each step of the quotation sheet settles in. On the result screen the mark lands with a small bounce, a ring spreads from it and the tick is drawn.

## Nothing plays backwards

Whatever has arrived stays. Scrolling back up never undoes an entrance, the curve never undraws itself, and the six points never leave again. The one thing that follows the scroll both ways is the depth of the hero, because the top of the page has to be whole again when the reader comes back to it.

## How to make a part move

Add one attribute. Nothing else is needed, and nothing is hidden when the controller cannot run.

| Attribute | On | What happens |
| --- | --- | --- |
| `data-mo=""` | a part | It rises into view once. `data-mo="fade"`, `"left"`, `"right"`, `"pop"`, `"sunrise"` or `"bloom"` change the movement |
| `data-mo-group=""` | a parent | Each child rises in, one after another. `data-mo-group="fade"` or `"pop"` change the movement |
| `data-mo-delay="2"` | a part or a group | Starts its turn later, by that many steps |
| `data-mo-late=""` | a part | It waits until it is a third of the way up the screen |
| `data-mo-count=""` | a figure | A lone number with an optional `+` or `%` counts up when it comes into view. Any other text is left alone |
| `data-mo-seq=""` | a parent | Its children arrive one at a time, in order, as the page scrolls on: each when its row has moved far enough up the screen, and never two at once |
| `data-mo-carry=""` | a part inside each child of such a parent | The child gets `--mo-dx` and `--mo-dy`: the way from this part in the child before it to its own place, so the part can travel from one child to the next |
| `data-mo-scrub=""` | a block | `--mo-p` runs from 0 to 1 while the block scrolls into view, and never goes back. The value may be a media query (`data-mo-scrub="(min-width: 1120px)"`): the block is only driven this way while it matches |
| `data-mo-through=""` | a `data-mo-scrub` block that is taller than the screen | The line follows the reader instead: `--mo-p` is how far a line 60% down the screen has come from the top of the block's first step to the top of its last. The steps are the block's `data-mo-at` parts that are drawn. Each arrives when the line reaches its top and gets `--mo-q`, from 0 to 1: how far the line has run from its own top to the next step's. It never finishes by itself, and it never goes back. The value may be a media query |
| `data-mo-at="0.4"` | a part inside such a block | It arrives once `--mo-p` has reached that figure. When the block is not driven by the scroll, the part arrives the usual way if it is also a `data-mo` part or the child of a group |
| `data-mo-scroll=""` | a section | `--mo-p` follows how far the section has left the top of the screen, both ways |
| `data-mo-pointer=""` | a section | `--mo-x` and `--mo-y` follow the pointer over it, from -1 to 1, on devices with a mouse |
| `data-mo-loop=""` | a part that holds an endless movement | It gets `data-mo-away` while it is off the screen. Name the endless movement in the "Rest while unseen" rule of `motion.css` so that it pauses |

The controller answers with `data-in` on a part that has arrived: `data-in=""` plays its entrance, `data-in="now"` shows it at once (it was already above the screen, or the page redrew itself after loading). It sets `--mo-i` (0, 1, 2 ...) for a part's turn among the parts that arrived with it. Write the movement in `motion.css` against those.

## The limits

- **Reduced motion.** When the visitor has asked for it, nothing moves at all: the head script never sets `html.mo`, and the stylesheet stops every animation and transition, drawn parts included. The page is then the page as it is drawn.
- **Nothing is hidden without the controller.** Every hidden state sits under `html.mo`, and what follows the scroll sits under `html.mo-live`. Without JavaScript the page is complete. If the controller fails to start, hidden parts show after 3 seconds.
- **An entrance ends in the page as drawn.** When an entrance has played, the part looks and sits exactly as it does without motion.
- **Nothing shifts the layout.** Only `opacity`, `translate`, `scale`, `rotate`, `transform`, `clip-path` and `stroke-dashoffset` move.
- **What moves together is driven by one value.** The turn of a sun's fan and the fading of its two end rays are worked out from one number, `--mo-a`, which a single animation counts from 0 to 1 (`mo-sun-turn`). They are never separate animations that are only timed alike: when such animations start again they can be a frame or two apart, and for those frames a ray is missing on one side and an extra one shows on the other.
- **Drawn shapes that carry their own position only fade.** An SVG part with a `transform` attribute is never given a `transform-origin`, a `translate`, a `scale` or a `rotate`: that moves the shape off its place. What has to turn or grow sits in a group that carries no position, placed by a group around it.
- **Once.** A part arrives one time. It does not leave and return as the page scrolls back.
- **Short.** Entrances take 0.5 to 0.8 seconds with the `--mo-ease` curve, a step between parts is 80 ms, and answers to a press take the `--dur-fast` and `--dur-base` tokens. Only the hero's sunrise is longer. A sun's rays take `--mo-turn-time` to turn by the angle between two rays.
- **Working pages stay calm.** The booking form has one quiet entrance. The legal pages do not move.
- **Tokens only.** The motion stylesheet uses the design tokens for every colour and passes `npm run check:design`. Its own variables start with `--mo-`.
