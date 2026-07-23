import React, { useState } from "react";
import { api } from "../api/client";
import { C } from "../theme/tokens";
import type { Card } from "../types";

interface EditCardModalProps {
  card: Card;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditCardModal({ card, onClose, onSaved }: EditCardModalProps) {
  const [name, setName] = useState(card.name);
  const [last4, setLast4] = useState(card.last4);
  const [limit, setLimit] = useState(String(card.limit));
  const [statementDate, setStatementDate] = useState(String(card.statementDate));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25";
  const labelClass = "block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider";

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Please enter a card name.");
      return;
    }
    if (!/^\d{4}$/.test(last4)) {
      setError("Last 4 digits must be exactly 4 numbers.");
      return;
    }
    setSaving(true);
    try {
      await api.editCard(card.id, {
        name,
        last4,
        limit: Number(limit) || 0,
        statementDate: Number(statementDate) || 1,
      });
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
        className="bg-card border border-border rounded-2xl p-7 w-[380px] shadow-2xl"
      >
        <div className="flex justify-between items-center mb-[22px]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: C.amber, boxShadow: `0 0 8px ${C.amber}` }}
            />
            <h2 className="text-text font-bold text-[17px] m-0">Edit Card</h2>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-sub cursor-pointer text-lg leading-none p-2 -m-2">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Card Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last 4 Digits</label>
            <input value={last4} onChange={(e) => setLast4(e.target.value)} className={inputClass} maxLength={4} />
          </div>
          <div>
            <label className={labelClass}>Credit Limit</label>
            <input value={limit} onChange={(e) => setLimit(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Statement Date</label>
            <select value={statementDate} onChange={(e) => setStatementDate(e.target.value)} className={inputClass}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
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
            style={{ background: C.amberDark, boxShadow: `0 0 20px ${C.amberDark}55` }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
