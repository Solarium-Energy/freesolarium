import { Check, Clock, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

export type AlertMeaning = "info" | "positive" | "waiting" | "attention" | "negative";

const ICONS = { info: Info, positive: Check, waiting: Clock, attention: TriangleAlert, negative: X } as const;

type Props = {
  meaning?: AlertMeaning;
  /** "alert" for a problem that just happened, "status" for a quiet note. */
  role?: "alert" | "status";
  className?: string;
  children: ReactNode;
};

/** An inline message: the fact in bold first, then what to do about it. */
export default function Alert({ meaning = "info", role, className, children }: Props) {
  const Icon = ICONS[meaning];
  return (
    <div className={cx("alert", meaning !== "info" && `is-${meaning}`, className)} role={role}>
      <Icon className="ico" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
