"use client";

import { useSyncExternalStore } from "react";
import { isTestMode } from "../lib/leadClient";
import Alert from "./ui/Alert";

const subscribe = () => () => {};

/** A small bar while the page runs in test mode (`?test=1`). Not shown to visitors otherwise. */
export default function TestModeBar() {
  const testMode = useSyncExternalStore(subscribe, isTestMode, () => false);
  if (!testMode) return null;
  return (
    <Alert meaning="waiting" role="status" className="test-bar">
      Test mode: nothing will be stored.
    </Alert>
  );
}
