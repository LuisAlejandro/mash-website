/**
 * A post date, rendered identically on the server and in the browser.
 *
 * The formatter is pinned to a fixed locale and UTC so the markup cannot
 * differ between the two and trigger a hydration mismatch. That also means no
 * date library and no client component for what is one formatted string.
 */
const FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default function FriendlyDate({ dateString }: { dateString: string }) {
  return (
    <time dateTime={dateString}>{FORMATTER.format(new Date(dateString))}</time>
  );
}
