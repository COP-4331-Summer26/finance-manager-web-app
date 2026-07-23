import React, { useState, useEffect, useCallback } from "react";
import AddEntryModal from "./AddEntryModal";
import EditCardModal from "./EditCardModal";
import ConfirmModal from "./ConfirmModal";
import { api } from "../api/client";
import { C } from "../theme/tokens";
import type { Card } from "../types";

interface ViewCardsModalProps {
  onClose: () => void;
}

export default function ViewCardsModal({ onClose }: ViewCardsModalProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCard, setAddingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);

  const loadCards = useCallback(() => {
    setLoading(true);
    api.getCards()
      .then(setCards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm"
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-7 w-[440px] max-h-[80vh] shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center mb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: C.amber, boxShadow: `0 0 8px ${C.amber}` }}
            />
            <h2 className="text-text font-bold text-[17px] m-0">Credit Cards</h2>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-sub cursor-pointer text-lg leading-none p-2 -m-2">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 mb-5 min-h-0">
          {loading && <p className="text-sub text-[12.5px]">Loading cards...</p>}
          {!loading && cards.length === 0 && (
            <p className="text-sub text-[12.5px]">No cards linked yet — add one below.</p>
          )}
          {!loading && cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between bg-bg border border-border rounded-[10px] px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base shrink-0"
                  style={{ background: `${C.amber}18`, border: `1px solid ${C.amber}30` }}
                >
                  💳
                </div>
                <div className="min-w-0">
                  <div className="text-text text-sm font-semibold truncate">{card.name}</div>
                  <div className="text-sub text-[11px]">•••• {card.last4} · Statement day {card.statementDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-text text-sm font-bold tabular-nums">${card.limit.toLocaleString()}</div>
                <button
                  onClick={() => setEditingCard(card)}
                  title="Edit"
                  className="text-sub hover:text-accent-light text-sm bg-transparent border-none cursor-pointer p-1.5"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setDeletingCard(card)}
                  title="Delete"
                  className="text-sub hover:text-red text-sm bg-transparent border-none cursor-pointer p-1.5"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setAddingCard(true)}
          className="w-full py-2.5 rounded-[9px] border-none text-white font-bold text-sm shrink-0"
          style={{ background: C.amberDark, boxShadow: `0 0 20px ${C.amberDark}55` }}
        >
          + Add Card
        </button>
      </div>

      {addingCard && (
        <AddEntryModal type="card" onClose={() => setAddingCard(false)} onSaved={loadCards} />
      )}

      {editingCard && (
        <EditCardModal card={editingCard} onClose={() => setEditingCard(null)} onSaved={loadCards} />
      )}

      {deletingCard && (
        <ConfirmModal
          title="Delete Card"
          body={`Remove "${deletingCard.name}" ending in ${deletingCard.last4}? This can't be undone.`}
          cta="Delete"
          onClose={() => setDeletingCard(null)}
          onConfirm={async () => {
            await api.deleteCard(deletingCard.id);
            await loadCards();
          }}
        />
      )}
    </div>
  );
}
