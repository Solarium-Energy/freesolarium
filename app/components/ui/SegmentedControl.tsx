"use client";

import { cx } from "./cx";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** seg-quiet switches a view. The solid knob is for a choice that changes the price or the result. */
  quiet?: boolean;
  className?: string;
};

/** Two to four choices side by side in a pill track. The chosen one carries is-on and aria-pressed. */
export default function SegmentedControl<T extends string>({ label, options, value, onChange, quiet, className }: Props<T>) {
  return (
    <div className={cx("seg", quiet && "seg-quiet", className)} role="group" aria-label={label}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={on ? "is-on" : undefined}
            aria-pressed={on}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
