import type { ReactNode } from "react";
import { cx } from "./cx";

export type PriceRow = {
  label: ReactNode;
  value: ReactNode;
  /** less: a reduction (teal). total: the sum, in the display face under a strong rule. sum: a bold sub-total. */
  kind?: "less" | "total" | "sum";
  /** A fine second line under the label. */
  note?: ReactNode;
};

/** The quotation as rows that add up. Amounts align right in tabular figures. */
export default function PriceTable({ rows, caption, className }: { rows: PriceRow[]; caption?: string; className?: string }) {
  return (
    <table className={cx("price-table", className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className={row.kind ? `is-${row.kind}` : undefined}>
            <td>
              {row.label}
              {row.note && <small className="pt-note">{row.note}</small>}
            </td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
