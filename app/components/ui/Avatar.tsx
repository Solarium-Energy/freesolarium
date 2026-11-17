import { cx } from "./cx";

/** Initials in a disc. The colours come from the tokens. */
export default function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={cx("avatar", size === "lg" && "avatar-lg", size === "sm" && "avatar-sm")} aria-hidden="true">
      {initials}
    </span>
  );
}
