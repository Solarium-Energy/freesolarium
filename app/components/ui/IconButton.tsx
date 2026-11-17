import type { MouseEventHandler, ReactNode } from "react";
import { cx } from "./cx";

type Props = {
  /** Names the action. There is no visible text, so it is required. */
  label: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  solid?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-describedby"?: string;
};

/** A round button that holds one icon. Use the large size (44px) wherever a finger presses it. */
export default function IconButton({ label, children, size = "md", solid, className, onClick, ...aria }: Props) {
  return (
    <button
      type="button"
      className={cx("icon-btn", size === "lg" && "icon-btn-lg", size === "sm" && "icon-btn-sm", solid && "is-solid", className)}
      aria-label={label}
      onClick={onClick}
      {...aria}
    >
      {children}
    </button>
  );
}
