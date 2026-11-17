"use client";

import { useSyncExternalStore } from "react";
import { isTestMode } from "../lib/leadClient";

const subscribe = () => () => {};

/** A small bar while the page runs in test mode (`?test=1`). Not shown to visitors otherwise. */
export default function TestModeBar() {
  const testMode = useSyncExternalStore(subscribe, isTestMode, () => false);
  if (!testMode) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] bg-amber-400 py-1 text-center text-[12px] font-bold text-slate-900"
    >
      Test mode: nothing will be stored.
    </div>
  );
}
