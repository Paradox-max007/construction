// Formatting helpers for the BuildCraft marketplace.

/** Full Indian Rupee currency, e.g. ₹12,16,000 */
export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Compact Indian currency: ₹1.21 Cr, ₹85.00 L, ₹64K */
export function formatCompactINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
}

/** Human readable starting price line, e.g. "from ₹1,850 /sqft" */
export function formatStartingPrice(price: number, unit: string): string {
  const value = new Intl.NumberFormat("en-IN").format(price);
  if (unit === "sqft") return `from ₹${value}/sqft`;
  if (unit === "project") return `from ₹${value} / project`;
  return `from ₹${value} / ${unit}`;
}

/** Compact number: 1.2k, 12.5k, 1.2M */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Relative time, e.g. "3 days ago" */
export function timeAgo(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);
  if (year > 0) return `${year}y ago`;
  if (month > 0) return `${month}mo ago`;
  if (day > 0) return `${day}d ago`;
  if (hr > 0) return `${hr}h ago`;
  if (min > 0) return `${min}m ago`;
  return "just now";
}

/** Format a duration in weeks, e.g. "52 weeks" or "1.5 weeks" */
export function formatDuration(weeks: number): string {
  if (weeks >= 52) {
    const years = weeks / 52;
    return `${years % 1 === 0 ? years : years.toFixed(1)} year${years >= 2 ? "s" : ""}`;
  }
  return `${weeks} week${weeks >= 2 ? "s" : ""}`;
}
