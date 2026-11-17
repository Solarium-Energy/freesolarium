"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import IconButton from "./IconButton";
import { cx } from "./cx";

export type SheetState = "closed" | "open" | "closing";

const MOTION_MS = 200;

/** Open and close state of a sheet. hide() lets the closing motion run before the sheet leaves the page. */
export function useSheet() {
  const [state, setState] = useState<SheetState>("closed");
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback(() => {
    window.clearTimeout(timer.current);
    setState("open");
  }, []);

  /** onClosed runs once the sheet has left the page. */
  const hide = useCallback((onClosed?: () => void) => {
    window.clearTimeout(timer.current);
    setState((current) => (current === "closed" ? current : "closing"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(() => {
      setState("closed");
      if (typeof onClosed === "function") onClosed();
    }, still ? 0 : MOTION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { state, show, hide };
}

const SETTLE_MS = 400;

/**
 * True once a moment has passed since the caller appeared. A press that lands sooner is the second half
 * of a double click on the button that opened it, so it is ignored.
 */
export function useSettled() {
  const shownAt = useRef<number | null>(null);
  useEffect(() => {
    shownAt.current = performance.now();
  }, []);
  return () => shownAt.current !== null && performance.now() - shownAt.current >= SETTLE_MS;
}

const PHONE_QUERY = "(max-width: 767px)";

function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const isPhone = () => window.matchMedia(PHONE_QUERY).matches;

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]";

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.tabIndex >= 0);
}

type Props = {
  state: SheetState;
  /** Escape, the scrim and the close button call it. */
  onClose: () => void;
  titleId: string;
  title: ReactNode;
  closeLabel: string;
  /** Shown above the title, such as the form steps. */
  above?: ReactNode;
  /** Actions in a footer that stays in view. */
  footer?: ReactNode;
  /** Always from the bottom. Otherwise from the right, and from the bottom on a phone. */
  bottom?: boolean;
  /** When it changes, focus moves to the title (a new step of the same sheet). */
  stepKey?: string;
  /** The heading that names the sheet, when a step has its own (the title otherwise). */
  labelId?: string;
  className?: string;
  children: ReactNode;
};

/** A panel that slides in for a task, over a scrim. Focus stays inside and returns to the opener. */
export default function Sheet(props: Props) {
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  if (props.state === "closed") return null;
  return createPortal(<SheetPanel {...props} fromBottom={Boolean(props.bottom || phone)} />, document.body);
}

function SheetPanel({
  state,
  onClose,
  titleId,
  title,
  closeLabel,
  above,
  footer,
  stepKey,
  labelId,
  fromBottom,
  className,
  children,
}: Props & { fromBottom: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lastStep = useRef(stepKey);
  const requestClose = useEffectEvent(onClose);
  const settled = useSettled();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = panel.querySelector<HTMLElement>(".bd");
    const first = (body && focusables(body)[0]) || focusables(panel)[0];
    (first ?? panel).focus();

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables(panel);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      // Focus on the title or the panel itself is not in the list: it wraps like the ends do.
      const at = items.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && at <= 0) {
        event.preventDefault();
        items[items.length - 1].focus();
      } else if (!event.shiftKey && (at === -1 || at === items.length - 1)) {
        event.preventDefault();
        items[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (lastStep.current === stepKey) return;
    lastStep.current = stepKey;
    const heading = (labelId && document.getElementById(labelId)) || titleRef.current;
    heading?.focus();
  }, [stepKey, labelId]);

  const closing = state === "closing";

  return (
    <>
      <div
        className={cx("scrim sheet-scrim", closing && "is-closing")}
        onClick={() => {
          if (settled()) onClose();
        }}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cx("sheet is-floating", fromBottom && "sheet-bottom", closing && "is-closing", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId ?? titleId}
        tabIndex={-1}
      >
        <header>
          <div>
            {above}
            <h3 id={titleId} ref={titleRef} tabIndex={-1}>
              {title}
            </h3>
          </div>
          <IconButton label={closeLabel} size="lg" onClick={() => onClose()}>
            <X className="ico" aria-hidden="true" />
          </IconButton>
        </header>
        <div className="bd">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </>
  );
}
