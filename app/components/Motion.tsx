"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* The motion controller. One copy lives in the root layout and serves every page.

   It only marks the page, and app/styles/motion.css does the moving:

   - data-mo on a part, or data-mo-group on a parent: the part (or each child) gets data-in when it
     comes into view. Parts that arrive together get --mo-i (0, 1, 2 ...) so they follow one another.
     data-mo-delay="2" on a part or a group starts that count later. data-mo-late waits until the
     part is a third of the way up the screen.
   - data-mo-count on a figure such as "25,000+" or "4.7": it counts up when it comes into view.
   - data-mo-seq on a parent: its children arrive one at a time, in order, as the page scrolls on.
     A child that holds a data-mo-carry part gets --mo-dx and --mo-dy: the way from that part in
     the child before it to its own, so the part can travel from one to the next.
   - data-mo-scrub on a block: --mo-p runs from 0 to 1 while the block scrolls into view, and each
     part inside it marked data-mo-at="0.4" gets data-in when --mo-p reaches that figure. Its value
     may be a media query: the block is only driven this way while the query matches.
   - data-mo-scroll on a section: --mo-p follows how far the section has left the top of the screen.
     data-mo-pointer: --mo-x and --mo-y follow the pointer inside it, from -1 to 1.
   - data-mo-loop on a part that keeps moving: it gets data-mo-away while it is off the screen, which
     pauses it.

   Nothing plays backwards. Whatever has arrived stays: data-in is never taken away, and --mo-p of a
   data-mo-scrub block only ever grows. The one thing that follows the scroll both ways is
   data-mo-scroll, for the top of the page, which has to be whole again when the reader comes back.

   A part gets data-in="" when it arrives by scrolling, which plays its entrance. It gets
   data-in="now", which shows it at once without an entrance, when it is already above the screen,
   or when the page redraws itself after it has loaded (a language switch).

   It does nothing unless the head script has set html.mo (motion allowed, script running). */

const GU_DIGITS = "૦૧૨૩૪૫૬૭૮૯";
const toAscii = (text: string) => text.replace(/[૦-૯]/g, (digit) => String(GU_DIGITS.indexOf(digit)));
const toGujarati = (text: string) => text.replace(/\d/g, (digit) => GU_DIGITS[Number(digit)]);

/** Counts a figure up to the value it shows. Only for a lone number with an optional + or %. */
function countUp(el: HTMLElement) {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return;
  const original = node.nodeValue ?? "";
  const gujarati = /[૦-૯]/.test(original);
  const match = /^(\s*)([\d,]+(?:\.\d+)?)([+%]?\s*)$/.exec(toAscii(original));
  if (!match) return;
  const [, lead, digits, tail] = match;
  const target = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(target) || target === 0) return;
  const decimals = (digits.split(".")[1] ?? "").length;
  const grouped = digits.includes(",");
  const format = (value: number) => {
    const text = grouped
      ? value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : value.toFixed(decimals);
    return lead + (gujarati ? toGujarati(text) : text) + tail;
  };
  const wait = (Number(getComputedStyle(el).getPropertyValue("--mo-i")) || 0) * 80 + 200;
  const duration = 1500;
  let written = original;
  let start = 0;
  const tick = (now: number) => {
    // If React has put new words here (a language switch), leave them alone.
    if (node.nodeValue !== written) return;
    if (!start) start = now + wait;
    const t = Math.min(1, Math.max(0, (now - start) / duration));
    const eased = 1 - Math.pow(1 - t, 4);
    written = t >= 1 ? original : format(target * eased);
    node.nodeValue = written;
    if (t < 1) requestAnimationFrame(tick);
  };
  written = format(0);
  node.nodeValue = written;
  requestAnimationFrame(tick);
}

type Follower = { el: HTMLElement; now: number; goal: number };
type Scrub = Follower & { on: boolean; moved: number };
type Sequence = { el: HTMLElement; last: number };
type Pointer = { el: HTMLElement; x: number; y: number; gx: number; gy: number };
type Spot = { x: number; y: number };

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export default function Motion() {
  const pathname = usePathname();
  // True from a page's arrival until its parts have been found once: only then do parts on screen play their entrance.
  const fresh = useRef(true);

  useEffect(() => {
    fresh.current = true;
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("mo")) return;
    root.classList.add("mo-live");

    const seen = new WeakSet<Element>();
    const looping = new WeakSet<Element>();
    const waiting = new Set<HTMLElement>();
    let scrollers: Follower[] = [];
    let scrubs: Scrub[] = [];
    let sequences: Sequence[] = [];
    let pointers: Pointer[] = [];
    let spots = new WeakMap<HTMLElement, Spot>();
    let frame = 0;
    let stale = true;
    let lastFrame = 0;
    let wake = 0;
    let wakeAt = 0;

    const inGroup = (el: HTMLElement) => Boolean(el.parentElement?.hasAttribute("data-mo-group"));
    const inSequence = (el: HTMLElement) => Boolean(el.parentElement?.hasAttribute("data-mo-seq"));
    const reveals = (el: HTMLElement) => el.hasAttribute("data-mo") || el.hasAttribute("data-mo-at") || inGroup(el) || inSequence(el);
    const displayed = (rect: DOMRect) => rect.width > 0 || rect.height > 0;

    /** Shows a part at once, without its entrance. */
    const showNow = (el: HTMLElement) => {
      waiting.delete(el);
      early.unobserve(el);
      late.unobserve(el);
      if (reveals(el)) el.setAttribute("data-in", "now");
    };

    /** Plays the entrance of the parts that have just come into view, one after another. */
    const play = (parts: HTMLElement[]) => {
      let index = 0;
      for (const el of parts) {
        waiting.delete(el);
        early.unobserve(el);
        late.unobserve(el);
        if (reveals(el)) {
          const offset = Number(el.dataset.moDelay ?? el.parentElement?.dataset.moDelay ?? 0);
          el.style.setProperty("--mo-i", String(offset + Math.min(index, 8)));
          el.setAttribute("data-in", "");
          index += 1;
        }
        if (el.hasAttribute("data-mo-count")) countUp(el);
      }
    };
    const arrived = (entries: IntersectionObserverEntry[]) => {
      play(entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement));
    };
    // A part arrives when its top edge is a little way up the screen, a "late" part when it is a third of the way up.
    const early = new IntersectionObserver(arrived, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    const late = new IntersectionObserver(arrived, { rootMargin: "0px 0px -30% 0px", threshold: 0 });
    // A part that keeps moving rests while nobody can see it.
    const loops = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute("data-mo-away", !entry.isIntersecting);
      },
      { rootMargin: "120px 0px 120px 0px", threshold: 0 }
    );

    /* ----- one at a time (data-mo-seq) ----- */

    /** Where the carried part of a child sits on the screen. Measured once, while the part is still. */
    const spotOf = (child: HTMLElement): Spot | null => {
      const box = child.getBoundingClientRect();
      let inside = spots.get(child);
      if (!inside) {
        const carried = child.querySelector("[data-mo-carry]");
        if (!carried) return null;
        const rect = carried.getBoundingClientRect();
        inside = { x: rect.left - box.left, y: rect.top - box.top };
        spots.set(child, inside);
      }
      return { x: box.left + inside.x, y: box.top + inside.y };
    };

    /** The next child of a sequence arrives. Its carried part starts where the one before it sits. */
    const arrive = (child: HTMLElement, before: HTMLElement | undefined) => {
      waiting.delete(child);
      const to = spotOf(child);
      const from = before ? spotOf(before) : null;
      if (to && from) {
        child.style.setProperty("--mo-dx", `${(from.x - to.x).toFixed(1)}px`);
        child.style.setProperty("--mo-dy", `${(from.y - to.y).toFixed(1)}px`);
      }
      child.setAttribute("data-in", "");
    };

    /** Lets the next child of each sequence in when the page has scrolled far enough, never two at once. */
    const readSequences = (vh: number, now: number) => {
      for (const sequence of sequences) {
        const children = Array.from(sequence.el.children) as HTMLElement[];
        let rowTop = Number.NaN;
        let inRow = 0;
        for (let index = 0; index < children.length; index += 1) {
          const child = children[index];
          const rect = child.getBoundingClientRect();
          if (!displayed(rect)) continue;
          // Children that share a row arrive one after another as the row moves up the screen.
          if (Math.abs(rect.top - rowTop) > 4) {
            rowTop = rect.top;
            inRow = 0;
          } else {
            inRow += 1;
          }
          if (child.hasAttribute("data-in")) continue;
          if (rect.top < vh * (0.86 - inRow * 0.085)) {
            const due = sequence.last + 320;
            if (now >= due) {
              arrive(child, children[index - 1]);
              sequence.last = now;
              wakeIn(330);
            } else {
              wakeIn(due - now + 4);
            }
          }
          break;
        }
      }
    };

    /* ----- what follows the scroll and the pointer ----- */

    /** Looks at the page again on the next frame. Positions are read once a frame at most. */
    const measure = () => {
      stale = true;
      if (!frame) frame = requestAnimationFrame(step);
    };
    /** Looks again after a while, for what depends on time. Only the earliest request is kept: each look asks again for what it still needs. */
    const wakeIn = (ms: number) => {
      const at = performance.now() + ms;
      if (wake && at >= wakeAt) return;
      window.clearTimeout(wake);
      wakeAt = at;
      wake = window.setTimeout(() => {
        wake = 0;
        measure();
      }, ms);
    };

    /** Whether a data-mo-scrub block is driven by the scroll: always, or while its media query matches. */
    const scrubIsOn = (el: HTMLElement) => !el.dataset.moScrub || window.matchMedia(el.dataset.moScrub).matches;
    const mark = (at: HTMLElement | null) => Number(at?.dataset.moAt ?? 0);

    /** A block switches between being driven by the scroll and not (the screen was resized across its media query). */
    const handOver = (scrub: Scrub) => {
      scrub.el.querySelectorAll<HTMLElement>("[data-mo-at]:not([data-in])").forEach((part) => {
        if (scrub.on) {
          // The scroll takes the parts over from the observers.
          waiting.delete(part);
          early.unobserve(part);
          late.unobserve(part);
        } else if (inGroup(part) || part.hasAttribute("data-mo")) {
          waiting.add(part);
          early.observe(part);
        } else {
          part.setAttribute("data-in", "now");
        }
      });
    };

    const read = () => {
      stale = false;
      const vh = window.innerHeight;
      const now = performance.now();
      for (const item of scrollers) {
        const rect = item.el.getBoundingClientRect();
        if (!displayed(rect)) continue;
        item.goal = clamp(-rect.top / rect.height, 0, 1);
      }
      for (const scrub of scrubs) {
        const on = scrubIsOn(scrub.el);
        if (on !== scrub.on) {
          scrub.on = on;
          handOver(scrub);
        }
        if (!on || scrub.goal >= 1) continue;
        const rect = scrub.el.getBoundingClientRect();
        if (!displayed(rect)) continue;
        // From most of the block being in view (so the reader sees the line start) to the whole block being on screen.
        // It only ever grows.
        const end = clamp(vh - rect.height - 16, vh * 0.15, vh * 0.45);
        const start = Math.max(vh - Math.min(rect.height * 0.62, vh * 0.5), end + 160);
        const goal = clamp((start - rect.top) / (start - end), 0, 1);
        if (goal > scrub.goal) {
          scrub.goal = goal;
          scrub.moved = now;
        }
        // A line that has started is never left half drawn: when the page rests with most of the block in view, it finishes.
        if (scrub.goal > 0 && scrub.goal < 1) {
          const inView = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
          const rested = now - scrub.moved;
          if (inView >= Math.min(rect.height, vh) * 0.55) {
            if (rested >= 700) scrub.goal = 1;
            else wakeIn(700 - rested + 8);
          }
        }
      }
      readSequences(vh, now);
      spy(vh);
    };

    const step = (time: number) => {
      frame = 0;
      const elapsed = lastFrame ? Math.min(64, time - lastFrame) : 16;
      lastFrame = time;
      if (stale) read();
      let moving = false;
      for (const item of scrollers) {
        const gap = item.goal - item.now;
        if (Math.abs(gap) < 0.0005) {
          if (item.now === item.goal) continue;
          item.now = item.goal;
        } else {
          item.now += gap * 0.16;
          moving = true;
        }
        item.el.style.setProperty("--mo-p", item.now.toFixed(4));
      }
      for (const scrub of scrubs) {
        if (!scrub.on || scrub.now >= scrub.goal) continue;
        // It follows the scroll, but never faster than a steady glide: a jump down the page still draws the line.
        const gap = scrub.goal - scrub.now;
        scrub.now = gap < 0.0005 ? scrub.goal : scrub.now + Math.min(gap * 0.14, elapsed * 0.0005);
        scrub.el.style.setProperty("--mo-p", scrub.now.toFixed(4));
        scrub.el.querySelectorAll<HTMLElement>("[data-mo-at]:not([data-in])").forEach((part) => {
          if (scrub.now >= mark(part)) part.setAttribute("data-in", "");
        });
        if (scrub.now >= 1) scrub.el.setAttribute("data-done", "");
        else moving = true;
      }
      for (const item of pointers) {
        const dx = item.gx - item.x;
        const dy = item.gy - item.y;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) continue;
        item.x += dx * 0.08;
        item.y += dy * 0.08;
        item.el.style.setProperty("--mo-x", item.x.toFixed(4));
        item.el.style.setProperty("--mo-y", item.y.toFixed(4));
        moving = true;
      }
      if (moving) frame = requestAnimationFrame(step);
      else lastFrame = 0;
    };

    /* ----- the nav link of the section on screen ----- */
    const spy = (vh: number) => {
      const links = document.querySelectorAll<HTMLAnchorElement>('.nav-pills a[href^="/#"]');
      if (!links.length) return;
      const line = vh * 0.4;
      links.forEach((link) => {
        const section = document.getElementById((link.getAttribute("href") ?? "").slice(2));
        const rect = section?.getBoundingClientRect();
        link.toggleAttribute("data-active", Boolean(rect && rect.top <= line && rect.bottom > line));
      });
    };

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      const item = pointers.find((entry) => entry.el === event.currentTarget);
      if (!item) return;
      const rect = item.el.getBoundingClientRect();
      item.gx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      item.gy = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onPointerLeave = (event: PointerEvent) => {
      const item = pointers.find((entry) => entry.el === event.currentTarget);
      if (!item) return;
      item.gx = 0;
      item.gy = 0;
      if (!frame) frame = requestAnimationFrame(step);
    };

    /** Finds the marked parts, when a page arrives and whenever the page changes afterwards. */
    const scan = () => {
      const first = fresh.current;
      fresh.current = false;
      const height = window.innerHeight;
      // Above the screen: no entrance. On screen after the page has loaded (a redraw): no entrance either.
      const settled = (rect: DOMRect) => displayed(rect) && (rect.bottom < 0 || (!first && rect.top < height));

      scrollers = Array.from(document.querySelectorAll<HTMLElement>("[data-mo-scroll]")).map(
        (el) => scrollers.find((item) => item.el === el) ?? { el, now: 0, goal: 0 }
      );

      scrubs = Array.from(document.querySelectorAll<HTMLElement>("[data-mo-scrub]")).map((el) => {
        const known = scrubs.find((item) => item.el === el);
        if (known) return known;
        const done = settled(el.getBoundingClientRect());
        if (done) {
          el.style.setProperty("--mo-p", "1");
          el.setAttribute("data-done", "");
        }
        return { el, now: done ? 1 : 0, goal: done ? 1 : 0, on: scrubIsOn(el), moved: 0 };
      });
      const scrubOf = (el: HTMLElement) => {
        const block = el.closest<HTMLElement>("[data-mo-scrub]");
        return block ? scrubs.find((item) => item.el === block) : undefined;
      };
      // A block that is not driven by the scroll, or has finished, leaves no part waiting for its line.
      for (const scrub of scrubs) {
        scrub.el.querySelectorAll<HTMLElement>("[data-mo-at]:not([data-in])").forEach((part) => {
          const observed = inGroup(part) || part.hasAttribute("data-mo");
          if (scrub.on ? scrub.now >= 1 : !observed) part.setAttribute("data-in", "now");
        });
      }

      sequences = Array.from(document.querySelectorAll<HTMLElement>("[data-mo-seq]")).map(
        (el) => sequences.find((item) => item.el === el) ?? { el, last: 0 }
      );

      const found: HTMLElement[] = [];
      document.querySelectorAll<HTMLElement>("[data-mo-group], [data-mo-seq]").forEach((group) => {
        for (const child of Array.from(group.children)) found.push(child as HTMLElement);
      });
      document.querySelectorAll<HTMLElement>("[data-mo], [data-mo-count]").forEach((el) => found.push(el));
      for (const el of found) {
        if (seen.has(el)) continue;
        seen.add(el);
        // A part of a block that the scroll drives arrives when the block's line reaches it, not when it comes into view.
        if (el.hasAttribute("data-mo-at") && scrubOf(el)?.on) continue;
        if (settled(el.getBoundingClientRect())) {
          showNow(el);
          continue;
        }
        waiting.add(el);
        // The children of a sequence are let in by the scroll, in order.
        if (inSequence(el)) continue;
        (el.hasAttribute("data-mo-late") ? late : early).observe(el);
      }

      document.querySelectorAll<HTMLElement>("[data-mo-loop]").forEach((el) => {
        if (looping.has(el)) return;
        looping.add(el);
        loops.observe(el);
      });

      if (finePointer) {
        const marked = Array.from(document.querySelectorAll<HTMLElement>("[data-mo-pointer]"));
        for (const item of pointers) {
          if (marked.includes(item.el)) continue;
          item.el.removeEventListener("pointermove", onPointerMove);
          item.el.removeEventListener("pointerleave", onPointerLeave);
        }
        pointers = marked.map((el) => {
          const known = pointers.find((item) => item.el === el);
          if (known) return known;
          el.addEventListener("pointermove", onPointerMove);
          el.addEventListener("pointerleave", onPointerLeave);
          return { el, x: 0, y: 0, gx: 0, gy: 0 };
        });
      }
      measure();
    };

    /* A jump down the page (a link, the End key) can pass parts without bringing them on screen.
       They are shown at once, so that scrolling back up never finds an empty place. */
    let checking = 0;
    const onScroll = () => {
      measure();
      if (checking || waiting.size === 0) return;
      checking = window.setTimeout(() => {
        checking = 0;
        const height = window.innerHeight;
        const atEnd = window.scrollY + height >= document.documentElement.scrollHeight - 2;
        const onScreen: HTMLElement[] = [];
        for (const el of Array.from(waiting)) {
          if (!el.isConnected) {
            waiting.delete(el);
            continue;
          }
          const rect = el.getBoundingClientRect();
          if (!displayed(rect)) continue;
          if (rect.bottom < 0) showNow(el);
          else if (atEnd && rect.top < height) onScreen.push(el);
        }
        // At the very end of the page nothing can scroll further up: whatever is on screen arrives now.
        if (onScreen.length) play(onScreen);
      }, 160);
    };
    const onResize = () => {
      spots = new WeakMap();
      measure();
    };

    let queued = 0;
    const mutations = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    scan();

    return () => {
      early.disconnect();
      late.disconnect();
      loops.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const item of pointers) {
        item.el.removeEventListener("pointermove", onPointerMove);
        item.el.removeEventListener("pointerleave", onPointerLeave);
      }
      window.clearTimeout(checking);
      window.clearTimeout(wake);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(queued);
      root.classList.remove("mo-live");
    };
  }, []);

  return null;
}
