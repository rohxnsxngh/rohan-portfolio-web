// Frontmatter dates across src/content are plain strings carrying only the
// precision the entry actually has: most are month-precision ("2026-09"), a
// handful carry a day ("2024-03-02"), and a couple are empty.
//
// Every page used to render them with `new Date(str).toLocaleDateString(...)`,
// which is wrong twice over. First, the spec parses a bare "YYYY-MM-DD" or
// "YYYY-MM" as UTC midnight, and toLocaleDateString then prints it in the
// runtime's zone, so anywhere west of UTC the date lands one day early: a post
// dated "2026-09" displayed as "August 31, 2026". Second, a month-precision
// string has no day in it at all, so the day number in the output was invented
// by the parser rather than written by the author.
//
// So these helpers read the string's own parts and never construct a Date.
// That is what keeps the timezone out of the result, and it is what lets a
// month-precision date render as a month, not as a guessed day.

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEAR_MONTH_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR_MONTH = /^(\d{4})-(\d{2})$/;
const YEAR_ONLY = /^(\d{4})$/;

function monthName(month: string): string | null {
  const index = Number(month) - 1;
  return MONTH_NAMES[index] ?? null;
}

/**
 * Render a content-collection date at exactly the precision it was written
 * with: "2026-09" becomes "September 2026", "2024-03-02" becomes
 * "March 2, 2024", "2024" becomes "2024".
 *
 * Anything that is not one of those shapes is handed back untouched rather
 * than guessed at, and an empty or missing date returns an empty string so a
 * caller can decide whether to render the surrounding markup at all.
 */
export function formatContentDate(date: string | null | undefined): string {
  if (!date) return "";

  const trimmed = String(date).trim();
  if (!trimmed) return "";

  const full = YEAR_MONTH_DAY.exec(trimmed);
  if (full) {
    const name = monthName(full[2]);
    // Number() strips the leading zero so "02" reads as "2", the way a written
    // date does.
    if (name) return `${name} ${Number(full[3])}, ${full[1]}`;
  }

  const monthly = YEAR_MONTH.exec(trimmed);
  if (monthly) {
    const name = monthName(monthly[2]);
    if (name) return `${name} ${monthly[1]}`;
  }

  const yearly = YEAR_ONLY.exec(trimmed);
  if (yearly) return yearly[1];

  return trimmed;
}

/**
 * The same string in the machine-readable form a <time datetime> attribute
 * wants. "2026-09" and "2024-03-02" are both already valid HTML datetime
 * values, so this only has to reject the shapes that are not.
 */
export function contentDateAttribute(date: string | null | undefined): string | undefined {
  if (!date) return undefined;

  const trimmed = String(date).trim();
  if (!trimmed) return undefined;

  const isIsoish =
    YEAR_MONTH_DAY.test(trimmed) || YEAR_MONTH.test(trimmed) || YEAR_ONLY.test(trimmed);

  return isIsoish ? trimmed : undefined;
}
