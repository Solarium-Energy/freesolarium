"use client";

import { useEffect } from "react";

/* The motion controller. One copy lives in the root layout and serves every page.

   It only marks the page, and app/styles/motion.css does the moving:

   - data-mo on a part, or data-mo-group on a parent: the part (or each child) gets data-in when it
     comes into view. Parts that arrive together get --mo-i (0, 1, 2 ...) so they follow one another.
     data-mo-delay="2" on a part or a group starts that count later.
   - data-mo-count on a figure such as "25,000+" or "4.7": it counts up when it comes into view.
   - data-mo-scroll="exit" or "enter" on a block: --mo-p runs from 0 to 1 as the block scrolls out
     of the top of the screen ("exit") or in from the bottom ("enter"). Inside it, data-mo-at="0.4"
     gives a part data-in once --mo-p has reached that value.
   - data-mo-pointer on a block: --mo-x and --mo-y follow the pointer over it, from -1 to 1.
   - The link of the header's nav whose section is on screen gets data-active.

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

export default function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("mo")) return;
    root.classList.add("mo-live");

    /* ----- into view ----- */
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        let index = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          if (el.hasAttribute("data-mo") || el.parentElement?.hasAttribute("data-mo-group")) {
            const offset = Number(el.dataset.moDelay ?? el.parentElement?.dataset.moDelay ?? 0);
            el.style.setProperty("--mo-i", String(offset + Math.min(index, 8)));
            el.setAttribute("data-in", "");
            index += 1;
          }
          if (el.hasAttribute("data-mo-count")) countUp(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    /* ----- scroll and pointer ----- */
    type Follower = { el: HTMLElement; now: number; goal: number };
    let scrollers: Follower[] = [];
    type Pointer = { el: HTMLElement; x: number; y: number; gx: number; gy: number };
    let pointers: Pointer[] = [];
    let frame = 0;
    let stale = true;

    /* Positions are read once a frame at most, however often the page scrolls. */
    const measure = () => {
      stale = true;
      if (!frame) frame = requestAnimationFrame(step);
    };

    const read = () => {
      stale = false;
      const vh = window.innerHeight;
      for (const item of scrollers) {
        const rect = item.el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        const raw = item.el.dataset.moScroll === "exit" ? -rect.top / rect.height : (vh * 0.92 - rect.top) / (vh * 0.62);
        item.goal = Math.min(1, Math.max(0, raw));
      }
      spy(vh);
    };

    const step = () => {
      frame = 0;
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
        if (item.now > 0) {
          item.el.querySelectorAll<HTMLElement>("[data-mo-at]:not([data-in])").forEach((part) => {
            if (item.now >= Number(part.dataset.moAt)) part.setAttribute("data-in", "");
          });
        }
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
      item.gx = Math.min(1, Math.max(-1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      item.gy = Math.min(1, Math.max(-1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onPointerLeave = (event: PointerEvent) => {
      const item = pointers.find((entry) => entry.el === event.currentTarget);
      if (!item) return;
      item.gx = 0;
      item.gy = 0;
      if (!frame) frame = requestAnimationFrame(step);
    };

    /* ----- find the marked parts, now and whenever the page changes ----- */
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-mo-group]").forEach((group) => {
        for (const child of Array.from(group.children)) {
          if (seen.has(child)) continue;
          seen.add(child);
          io.observe(child);
        }
      });
      document.querySelectorAll<HTMLElement>("[data-mo], [data-mo-count]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
      const found = Array.from(document.querySelectorAll<HTMLElement>("[data-mo-scroll]"));
      scrollers = found.map((el) => scrollers.find((item) => item.el === el) ?? { el, now: 0, goal: 0 });
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

    let queued = 0;
    const mutations = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    scan();

    return () => {
      io.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      for (const item of pointers) {
        item.el.removeEventListener("pointermove", onPointerMove);
        item.el.removeEventListener("pointerleave", onPointerLeave);
      }
      cancelAnimationFrame(frame);
      cancelAnimationFrame(queued);
      root.classList.remove("mo-live");
    };
  }, []);

  return null;
}
