import React, { useState } from "react";
import { api } from "../api/client";
import { C } from "../theme/tokens";
import type { AddModalKind } from "../types";

interface CategoryOption {
  name: string;
  color: string;
}

interface AddEntryModalProps {
  type: AddModalKind;
  onClose: () => void;
  /** Called after a successful save so the parent page can refetch fresh data. */
  onSaved: () => void;
  /** Existing budget categories — powers the dropdown on the Transaction form. */
  categories?: CategoryOption[];
}

interface ModalConfig {
  title: string;
  color: string;
  fields: string[];
}

const CONFIGS: Record<AddModalKind, ModalConfig> = {
  income:      { title: "Add Income",      color: C.green,  fields: ["Type", "Source", "Amount", "Date", "Notes"] },
  transaction: { title: "Add Transaction", color: C.accent, fields: ["Merchant", "Amount", "Category", "Date", "Notes"] },
  card:        { title: "Add Credit Card", color: C.amber,  fields: ["Card Name", "Last 4 Digits", "Credit Limit", "Statement Date"] },
  category:    { title: "Add Budget Category", color: "#22D3EE", fields: ["Name", "Limit"] },
};

// A small curated palette instead of a raw hex input — keeps category colors
// consistent with the rest of the app's look.
const COLOR_OPTIONS = [
  "#6366F1", "#22D3EE", "#10B981", "#F43F5E", "#F59E0B",
  "#A78BFA", "#EC4899", "#14B8A6", "#F97316", "#3B82F6",
];

export default function AddEntryModal({ type, onClose, onSaved, categories = [] }: AddEntryModalProps) {
  const cfg = CONFIGS[type];
  const [values, setValues] = useState<Record<string, string>>({});
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSave() {
    setError(null);

    if (type === "transaction" && !values["Category"]) {
      setError("Please select a category.");
      return;
    }
    if (type === "category" && !values["Name"]) {
      setError("Please enter a category name.");
      return;
    }

    setSaving(true);
    try {
      if (type === "income") {
        await api.addIncome({
          merchant: values["Source"] || "Income",
          amount: Number(values["Amount"]) || 0,
          category: values["Type"] || "Salary",
          date: values["Date"] || undefined,
          notes: values["Notes"] || undefined,
        });
      } else if (type === "transaction") {
        await api.addTransaction({
          merchant: values["Merchant"] || "",
          amount: Number(values["Amount"]) || 0,
          category: values["Category"],
          type: "expense",
          date: values["Date"] || undefined,
          notes: values["Notes"] || undefined,
        });
      } else if (type === "card") {
        await api.addCard({
          name: values["Card Name"] || "",
          last4: values["Last 4 Digits"] || "",
          limit: Number(values["Credit Limit"]) || 0,
          statementDate: Number(values["Statement Date"]) || 1,
        });
      } else {
        await api.addCategory({
          name: values["Name"] || "",
          limit: Number(values["Limit"]) || 0,
          color,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm"
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-7 w-[400px] shadow-2xl"
      >
        <div className="flex justify-between items-center mb-[22px]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }}
            />
            <h2 className="text-text font-bold text-[17px] m-0">{cfg.title}</h2>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-sub cursor-pointer text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {cfg.fields.map((f) => {
            if (f === "Type" && type === "income") {
              return (
                <div key={f}>
                  <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">{f}</label>
                  <select
                    value={values[f] || "Salary"}
                    onChange={(e) => setField(f, e.target.value)}
                    className="w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              );
            }
            if (f === "Category" && type === "transaction") {
              return (
                <div key={f}>
                  <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">{f}</label>
                  <select
                    value={values[f] || ""}
                    onChange={(e) => setField(f, e.target.value)}
                    className="w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              );
            }
            if (f === "Date") {
              return (
                <div key={f}>
                  <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">{f}</label>
                  <input
                    type="date"
                    value={values[f] || ""}
                    onChange={(e) => setField(f, e.target.value)}
                    className="w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25"
                  />
                </div>
              );
            }
            return (
              <div key={f}>
                <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">{f}</label>
                <input
                  value={values[f] || ""}
                  onChange={(e) => setField(f, e.target.value)}
                  className="w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25"
                  placeholder={`Enter ${f.toLowerCase()}`}
                />
              </div>
            );
          })}

          {type === "category" && (
            <div>
              <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setColor(hex)}
                    className="w-7 h-7 rounded-full transition-transform"
                    style={{
                      background: hex,
                      boxShadow: color === hex ? `0 0 0 2px #141829, 0 0 0 4px ${hex}` : "none",
                      transform: color === hex ? "scale(1.12)" : "scale(1)",
                    }}
                    aria-label={hex}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red text-xs mt-3">{error}</p>}

        <div className="flex gap-2.5 mt-[22px]">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-[11px] rounded-[9px] border border-border bg-transparent text-sub font-semibold text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-[11px] rounded-[9px] border-none text-white font-bold text-sm disabled:opacity-60"
            style={{ background: cfg.color, boxShadow: `0 0 20px ${cfg.color}55` }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
