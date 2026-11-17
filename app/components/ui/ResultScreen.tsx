import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

type Props = {
  title: ReactNode;
  children: ReactNode;
  /** The one button. */
  action?: ReactNode;
  /** Failure never carries the sun: it uses the negative status ground. */
  error?: boolean;
  titleId?: string;
  /** 1 when the result is the page's main heading. */
  level?: 1 | 2;
};

/** The screen after a form: a headline that states what happened, one sentence, one button. */
export default function ResultScreen({ title, children, action, error, titleId, level = 2 }: Props) {
  const Icon = error ? X : Check;
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className={cx("result", error && "is-error")}>
      <span className="orb">
        <Icon className="ico" aria-hidden="true" />
      </span>
      <Heading id={titleId} tabIndex={titleId ? -1 : undefined}>
        {title}
      </Heading>
      <p>{children}</p>
      {action}
    </div>
  );
}
