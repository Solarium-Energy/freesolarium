"use client";

import { File as FileIcon, TriangleAlert, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import IconButton from "./IconButton";

type Props = {
  /** The id of the real file input: the label points at it. */
  id: string;
  label: string;
  required?: boolean;
  /** The accepted formats and limits, shown in the zone. */
  hint?: string;
  accept: string;
  value: File | null;
  onChange: (file: File | null) => void;
  /** Returns the sentence that refuses a file, or null to take it. */
  check?: (file: File) => string | null;
  /** The zone's bold line, such as "Click to upload". */
  chooseLabel: string;
  /** The label of the button that removes a chosen file. */
  removeLabel: string;
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A document to upload: the drop zone while nothing is chosen, the row of the chosen file after.
 * The whole zone is a button that opens the file dialog. A refused file is named under it, in words.
 */
export default function FileUpload({ id, label, required, hint, accept, value, onChange, check, chooseLabel, removeLabel }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [refusal, setRefusal] = useState<string | null>(null);

  return (
    <div className="field">
      <label className="label" htmlFor={id} id={`${id}-label`}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {value ? (
        <div className="file-row">
          <span className="ft">
            <FileIcon className="ico" aria-hidden="true" />
          </span>
          <div className="file-meta">
            <b>{value.name}</b>
            <span className="s">{formatSize(value.size)}</span>
          </div>
          <div className="r">
            <IconButton
              label={removeLabel}
              size="lg"
              aria-describedby={`${id}-label`}
              onClick={() => {
                onChange(null);
                setRefusal(null);
                if (ref.current) ref.current.value = "";
              }}
            >
              <X className="ico" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="upload"
          aria-labelledby={`${id}-label ${id}-choose`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onClick={() => ref.current?.click()}
        >
          <Upload className="ico" aria-hidden="true" />
          <b id={`${id}-choose`}>{chooseLabel}</b>
          {hint && <span id={`${id}-hint`}>{hint}</span>}
        </button>
      )}
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const refused = check ? check(file) : null;
          setRefusal(refused);
          if (refused) return;
          onChange(file);
        }}
      />
      {refusal && (
        <span className="error-text" role="alert">
          <TriangleAlert className="ico" aria-hidden="true" /> {refusal}
        </span>
      )}
    </div>
  );
}
