"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";

type Props = {
  title: ReactNode;
  /** One line of explanation, when the choice needs it. */
  sub?: ReactNode;
  on: boolean;
  onSelect: () => void;
};

/** A radio choice with a title. One card in a group is always chosen. */
export default function ChoiceCard({ title, sub, on, onSelect }: Props) {
  return (
    <button type="button" className={cx("choice", on && "is-on")} aria-pressed={on} onClick={onSelect}>
      <span>
        <b>{title}</b>
        {sub && <span>{sub}</span>}
      </span>
    </button>
  );
}
