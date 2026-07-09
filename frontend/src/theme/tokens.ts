// Shared color tokens — the single source of truth for the app's palette.
// Update a value here and it propagates to every page/component.

export const C = {
  bg:      "#0E1120",
  sidebar: "#0B0E1B",
  card:    "#141829",
  card2:   "#1A1F35",
  border:  "#232840",
  accent:  "#6366F1",
  accentL: "#818CF8",
  cyan:    "#22D3EE",
  text:    "#F1F5F9",
  sub:     "#5A6481",
  green:   "#10B981",
  red:     "#F43F5E",
  amber:   "#F59E0B",
} as const;

export const CAT_COLORS: Record<string, string> = {
  Housing:       "#6366F1",
  Food:          "#22D3EE",
  Transport:     "#F59E0B",
  Entertainment: "#F43F5E",
  Savings:       "#10B981",
  Income:        "#10B981",
  Subscriptions: "#A78BFA",
};

// Income isn't a budget category, so these sub-types have no matching
// Category document / color of their own — this keeps them visually
// consistent (green for cash income, amber to match the card theme).
export const INCOME_TYPE_COLORS: Record<string, string> = {
  Salary: "#10B981",
  "Credit Card": "#F59E0B",
};
