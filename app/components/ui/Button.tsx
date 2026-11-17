import Link from "next/link";
import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { cx } from "./cx";

export type ButtonVariant = "sun" | "primary" | "outline" | "ghost" | "on-dark";

// One sun per screen (rule C1): use the sun variant only for the main action of a screen.
const VARIANTS: Record<ButtonVariant, string> = {
  sun: "btn-sun",
  primary: "btn-primary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  "on-dark": "btn-on-dark",
};

type Common = {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  /** The label stays, a spinner replaces the icon, a second press is blocked. */
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

type AsLink = Common & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type AsButton = Common & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

/** The pill button of the design system, as a link (with href) or as a button. */
export default function Button(props: AsLink | AsButton) {
  const { variant = "outline", size = "md", block, loading, disabled, className, children } = props;
  const classes = cx(
    "btn",
    VARIANTS[variant],
    size === "lg" && "btn-lg",
    size === "sm" && "btn-sm",
    block && "btn-block",
    loading && "is-loading",
    props.href !== undefined && disabled && "is-disabled",
    className
  );

  if (props.href !== undefined) {
    const { href, target, rel, onClick } = props;
    const blocked = Boolean(disabled || loading);
    const shared = {
      className: classes,
      target,
      rel,
      "aria-label": props["aria-label"],
      "aria-disabled": blocked || undefined,
      "aria-busy": loading || undefined,
      tabIndex: disabled ? -1 : undefined,
      onClick: blocked ? (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault() : onClick,
    };
    // Pages of this site go through the router. Phone, mail, outside links and anchors stay plain links.
    if (href.startsWith("/")) {
      return (
        <Link href={href} {...shared}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} {...shared}>
        {children}
      </a>
    );
  }

  const { type = "button", onClick } = props;
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-label={props["aria-label"]}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
    >
      {children}
    </button>
  );
}
