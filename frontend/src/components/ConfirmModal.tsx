import React, { useState } from "react";
import { C } from "../theme/tokens";

interface ConfirmModalProps {
  title: string;
  body: string;
  cta: string;
  /** If set, the user must type this exact word before the CTA enables — for high-stakes actions. */
  confirmWord?: string;
  /** Red styling for destructive actions (default) vs accent styling for neutral confirmations. */
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmModal({
  title,
  body,
  cta,
  confirmWord,
  danger = true,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmWord ? confirmText === confirmWord : true;
  const accentColor = danger ? C.red : C.accent;

  async function handleConfirm() {
    if (!canConfirm) return;
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm"
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-card border rounded-2xl p-7 w-[400px] shadow-2xl"
        style={{ borderColor: `${accentColor}40` }}
      >
        <div className="flex items-center gap-2.5 mb-3.5">
          <div
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}
          >
            {danger ? "⚠️" : "❓"}
          </div>
          <h2 className="text-text font-bold text-[17px] m-0">{title}</h2>
        </div>

        <p className="text-sub text-[13.5px] leading-relaxed mb-[18px]">{body}</p>

        {confirmWord && (
          <>
            <label className="block text-sub text-[11px] font-bold mb-[7px] uppercase tracking-wider">
              Type {confirmWord} to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmText(e.target.value)}
              placeholder={confirmWord}
              className="w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border mb-5"
            />
          </>
        )}

        {error && <p className="text-red text-xs mb-3">{error}</p>}

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-[11px] rounded-[9px] border border-border bg-transparent text-sub font-semibold text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            disabled={!canConfirm || loading}
            onClick={handleConfirm}
            className="flex-[2] py-[11px] rounded-[9px] border-none text-white font-bold text-sm disabled:cursor-not-allowed"
            style={{
              background: canConfirm ? accentColor : `${accentColor}40`,
              boxShadow: canConfirm ? `0 0 20px ${accentColor}55` : "none",
            }}
          >
            {loading ? "Working..." : cta}
          </button>
        </div>
      </div>
    </div>
  );
}
