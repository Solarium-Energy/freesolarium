"use client";

import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../ui/cx";

export type SelectOption<T extends string> = {
  value: T;
  /** The choice, as the cell shows it. */
  label: string;
  /** Its price, shown on the right of its row: "Included", "+₹3,600", "Our team will contact you". */
  note: string;
};

type Props<T extends string> = {
  /** The id of the control. The label, the list and the options take ids made from it. */
  id: string;
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
};

/* A device with a mouse gets the menu drawn in the design system. A touch device keeps the browser's own
   picker, which is the better control there. The server and the first paint use the browser's own select,
   so the choice works before the scripts run. */
const MOUSE_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeMouse(onChange: () => void) {
  const query = window.matchMedia(MOUSE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const hasMouse = () => window.matchMedia(MOUSE_QUERY).matches;

/** One cell of the quotation bar: its label, the chosen value and a caret. The whole cell opens the choices. */
export default function QuotationSelect<T extends string>(props: Props<T>) {
  const mouse = useSyncExternalStore(subscribeMouse, hasMouse, () => false);
  return mouse ? <DrawnSelect {...props} /> : <NativeSelect {...props} />;
}

function NativeSelect<T extends string>({ id, label, value, options, onChange }: Props<T>) {
  const chosen = options.find((option) => option.value === value);
  return (
    <div className="c q-pick">
      <label htmlFor={id}>{label}</label>
      <div className="v" aria-hidden="true">
        <span>{chosen?.label ?? ""}</span>
        <ChevronDown className="ico" />
      </div>
      <select id={id} className="q-select" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.note})
          </option>
        ))}
      </select>
    </div>
  );
}

/** How long the menu takes to leave, in milliseconds. It must match motion.css. */
const LEAVE_MS = 100;
/** Letters typed within this time make one search. */
const TYPE_MS = 600;

const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]";

/**
 * A select-only combobox, as in the WAI-ARIA pattern: the cell is the combobox and keeps the focus, the list
 * marks the option the keys are on with aria-activedescendant. The list is drawn in the page's body, so the
 * hero, which clips what leaves it, cannot cut it off. It opens under its cell, or above it when the window
 * has no room below.
 */
function DrawnSelect<T extends string>({ id, label, value, options, onChange }: Props<T>) {
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index + 1}`;
  const last = options.length - 1;
  const chosenIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const chosen = options[chosenIndex];

  const cellRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [active, setActive] = useState(chosenIndex);

  function show(index: number) {
    setActive(index);
    setLeaving(false);
    setOpen(true);
  }

  /** Closes the list. It leaves with a short fade when the page moves, and at once otherwise. */
  function close(focusCell = true) {
    setOpen(false);
    if (document.documentElement.classList.contains("mo")) {
      setLeaving(true);
      window.setTimeout(() => setLeaving(false), LEAVE_MS);
    }
    if (focusCell) boxRef.current?.focus();
  }

  function choose(index: number, focusCell = true) {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close(focusCell);
  }

  /** The option whose label starts with the letters typed so far, searched from the one after `from`.
      `now` is the time of the key press. */
  function search(letter: string, from: number, now: number) {
    const text = now - typed.current.at > TYPE_MS ? letter : typed.current.text + letter;
    typed.current = { text, at: now };
    const wanted = text.toLowerCase();
    // Typing the same letter again moves on to the next option that starts with it.
    const sameLetter = wanted.split("").every((ch) => ch === wanted[0]);
    const start = sameLetter ? from + 1 : from;
    for (let step = 0; step < options.length; step += 1) {
      const index = (start + step) % options.length;
      const name = options[index].label.toLowerCase();
      if (name.startsWith(wanted) || (sameLetter && name.startsWith(wanted[0]))) return index;
    }
    return null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const { key, altKey } = event;
    const letter = key.length === 1 && key !== " " && !event.ctrlKey && !event.metaKey ? key : null;
    // A space while a search is being typed is part of the search.
    const now = event.timeStamp;
    const spaceInSearch = key === " " && now - typed.current.at < TYPE_MS && typed.current.text !== "";

    if (!open) {
      if (key === "ArrowDown" || key === "Enter" || key === " ") {
        event.preventDefault();
        show(chosenIndex);
      } else if (key === "ArrowUp" || key === "Home") {
        event.preventDefault();
        show(0);
      } else if (key === "End") {
        event.preventDefault();
        show(last);
      } else if (letter) {
        event.preventDefault();
        show(search(letter, chosenIndex, now) ?? chosenIndex);
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        setActive(Math.min(last, active + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (altKey) choose(active);
        else setActive(Math.max(0, active - 1));
        break;
      case "Home":
      case "PageUp":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
      case "PageDown":
        event.preventDefault();
        setActive(last);
        break;
      case "Enter":
        event.preventDefault();
        choose(active);
        break;
      case " ":
        event.preventDefault();
        if (spaceInSearch) setActive(search(" ", active, now) ?? active);
        else choose(active);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        // The option the keys are on is taken, and the focus moves on as Tab moves it.
        choose(active, false);
        break;
      default:
        if (letter) {
          event.preventDefault();
          setActive(search(letter, active, now) ?? active);
        }
    }
  }

  function onCellPointerDown(event: PointerEvent<HTMLDivElement>) {
    // The list is drawn elsewhere in the page, but its events still pass through this cell.
    if (listRef.current?.contains(event.target as Node)) return;
    if (event.button !== 0) return;
    event.preventDefault();
    boxRef.current?.focus();
    if (open) close();
    else show(chosenIndex);
  }

  /** Puts the list under the cell, or above it when there is no room below in the window. */
  const place = useEffectEvent(() => {
    const cell = cellRef.current;
    const list = listRef.current;
    if (!cell || !list) return;
    const box = cell.getBoundingClientRect();
    const gap = 6;
    list.style.minWidth = `${box.width}px`;
    const height = list.offsetHeight;
    const width = list.offsetWidth;
    const roomBelow = window.innerHeight - box.bottom - gap;
    const roomAbove = box.top - gap;
    const above = roomBelow < height + 8 && roomAbove > roomBelow;
    list.style.left = `${Math.max(8, Math.min(box.left, window.innerWidth - width - 8))}px`;
    list.style.top = `${above ? box.top - gap - height : box.bottom + gap}px`;
    list.dataset.side = above ? "above" : "below";
  });

  useLayoutEffect(() => {
    if (open) place();
  }, [open]);

  /** A press outside the cell and the list closes it. The focus goes back to the cell, unless the press was on
      another control. */
  const onOutside = useEffectEvent((event: globalThis.PointerEvent) => {
    const target = event.target as Element | null;
    if (!target || cellRef.current?.contains(target) || listRef.current?.contains(target)) return;
    close(!target.closest(FOCUSABLE));
  });

  useEffect(() => {
    if (!open) return;
    const follow = () => place();
    const outside = (event: globalThis.PointerEvent) => onOutside(event);
    window.addEventListener("scroll", follow, { capture: true, passive: true });
    window.addEventListener("resize", follow);
    document.addEventListener("pointerdown", outside, true);
    return () => {
      window.removeEventListener("scroll", follow, { capture: true });
      window.removeEventListener("resize", follow);
      document.removeEventListener("pointerdown", outside, true);
    };
  }, [open]);

  const list =
    open || leaving ? (
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        className={cx("menu q-menu", !open && "is-leaving")}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={optionId(index)}
            role="option"
            aria-selected={index === chosenIndex}
            className={index === active ? "is-active" : undefined}
            onPointerMove={() => open && setActive(index)}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => open && choose(index)}
          >
            <span className="dot" aria-hidden="true" />
            <span className="o-label">{option.label}</span>
            <span className="o-note">{option.note}</span>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="c q-pick is-drawn" ref={cellRef} onPointerDown={onCellPointerDown}>
      <label id={labelId}>{label}</label>
      <div className="v" aria-hidden="true">
        <span>{chosen?.label ?? ""}</span>
        <ChevronDown className="ico" />
      </div>
      <div
        ref={boxRef}
        id={id}
        className="q-combo"
        role="combobox"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          // Focus leaving for somewhere outside the cell and the list closes it, without a choice.
          const next = event.relatedTarget as Node | null;
          if (open && next && !cellRef.current?.contains(next) && !listRef.current?.contains(next)) close(false);
        }}
      >
        <span className="sr-only">{chosen?.label ?? ""}</span>
      </div>
      {list && createPortal(list, document.body)}
    </div>
  );
}
