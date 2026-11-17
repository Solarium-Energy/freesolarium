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
};

/** The screen after a form: a headline that states what happened, one sentence, one button. */
export default function ResultScreen({ title, children, action, error, titleId }: Props) {
  const Icon = error ? X : Check;
  return (
    <div className={cx("result", error && "is-error")}>
      <span className="orb">
        <Icon className="ico" aria-hidden="true" />
      </span>
      <h2 id={titleId}>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
