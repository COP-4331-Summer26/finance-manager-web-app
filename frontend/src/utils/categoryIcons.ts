// The API's Category and Transaction schemas don't include an icon field —
// only name, limit, and color. This fills in a reasonable icon by name so
// the UI still feels complete.

const CATEGORY_ICONS: Record<string, string> = {
  Housing: "🏠",
  Food: "🛒",
  Transport: "🚗",
  Entertainment: "🎬",
  Savings: "💰",
  Income: "💼",
  Salary: "💼",
  Subscriptions: "🎧",
};

export function iconForCategory(name: string): string {
  return CATEGORY_ICONS[name] || "💳";
}
