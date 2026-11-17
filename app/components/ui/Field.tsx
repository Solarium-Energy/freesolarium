import { TriangleAlert } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "./cx";

type FieldProps = {
  id: string;
  label: ReactNode;
  required?: boolean;
  help?: ReactNode;
  /** What to fix. Shown in the destructive colour with an icon, so colour is not the only sign. */
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** A label above the control, help text and an error line under it. */
export function Field({ id, label, required, help, error, className, children }: FieldProps) {
  return (
    <div className={cx("field", className)}>
      <label className="label" htmlFor={id}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {help && (
        <span className="help" id={`${id}-help`}>
          {help}
        </span>
      )}
      {error && (
        <span className="error-text" id={`${id}-error`}>
          <TriangleAlert className="ico" aria-hidden="true" /> {error}
        </span>
      )}
    </div>
  );
}

type ControlProps = { invalid?: boolean; large?: boolean };

export function Input({ invalid, large, className, ...props }: ControlProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx("input", large && "input-lg", invalid && "is-invalid", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ invalid, large, className, ...props }: ControlProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx("select", large && "input-lg", invalid && "is-invalid", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function TextArea({ invalid, className, ...props }: ControlProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cx("textarea", invalid && "is-invalid", className)} aria-invalid={invalid || undefined} {...props} />
  );
}
