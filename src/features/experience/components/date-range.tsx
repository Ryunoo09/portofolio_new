import { formatMonthYear } from "@/lib/format";

type DateRangeProps = {
  startDate: string;
  endDate: string | null;
  className?: string;
};

/**
 * Visible range plus machine-readable `<time datetime>` values, so assistive tech
 * and crawlers read the exact dates instead of a formatted string.
 * An ongoing role renders "Present" with no `datetime`, which is correct: there
 * is no date to express.
 */
export function DateRange({ startDate, endDate, className }: DateRangeProps) {
  return (
    <span className={className}>
      <time dateTime={startDate} data-testid="start">
        {formatMonthYear(startDate)}
      </time>
      {" – "}
      {endDate ? (
        <time dateTime={endDate}>{formatMonthYear(endDate)}</time>
      ) : (
        "Present"
      )}
    </span>
  );
}
