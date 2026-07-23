import React, { useState } from "react";
import { api } from "../api/client";
import { C } from "../theme/tokens";
import type { Transaction, TransactionType } from "../types";

interface CategoryOption {
  name: string;
  color: string;
}

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: CategoryOption[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditTransactionModal({ transaction, categories, onClose, onSaved }: EditTransactionModalProps) {
  const [merchant, setMerchant] = useState(transaction.merchant);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date ? transaction.date.slice(0, 10) : "");
  const [notes, setNotes] = useState(transaction.notes || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25";
  const labelClass = "block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider";

  async function handleSave() {
    setError(null);
    if (!category) {
      setError("Please select a category.");
      return;
    }
    setSaving(true);
    try {
      await api.editTransaction(transaction.id, {
        merchant,
        amount: Number(amount) || 0,
        category,
        type,
        date: date || undefined,
        notes: notes || undefined,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // Keep the transaction's current category selectable even if it doesn't
  // match any existing budget category (e.g. it was typed in before the
  // dropdown existed, or its category was later deleted).
  const hasCurrentCategory = categories.some((c) => c.name === category);

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
              style={{ background: C.accent, boxShadow: `0 0 8px ${C.accent}` }}
            />
            <h2 className="text-text font-bold text-[17px] m-0">Edit Transaction</h2>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-sub cursor-pointer text-lg leading-none p-2 -m-2">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Merchant</label>
            <input value={merchant} onChange={(e) => setMerchant(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className={inputClass}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="" disabled>Select a category</option>
              {!hasCurrentCategory && category && <option value={category}>{category}</option>}
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
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
            style={{ background: C.accentDark, boxShadow: `0 0 20px ${C.accentDark}55` }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
