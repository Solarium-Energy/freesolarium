import { Fragment } from "react";

type Props = {
  steps: string[];
  /** Index of the current step. The steps before it are done. */
  current: number;
  label?: string;
};

/** Where the person is in a form of a few steps. Done steps are primary, the current one is the sun. */
export default function FormSteps({ steps, current, label }: Props) {
  return (
    <div className="form-steps" aria-label={label}>
      {steps.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && <hr />}
          <span
            className={index < current ? "is-done" : index === current ? "is-on" : undefined}
            aria-current={index === current ? "step" : undefined}
          >
            <i aria-hidden="true">{index + 1}</i>
            {step}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
