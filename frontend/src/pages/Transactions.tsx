import React, { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import AddEntryModal from "../components/AddEntryModal";
import EditTransactionModal from "../components/EditTransactionModal";
import ConfirmModal from "../components/ConfirmModal";
import { api } from "../api/client";
import { iconForCategory } from "../utils/categoryIcons";
import { formatDate } from "../utils/format";
import { C, INCOME_TYPE_COLORS } from "../theme/tokens";
import type { Transaction, Category, SortField, SortDir, AddModalKind } from "../types";

interface SortArrowProps {
  field: SortField;
  activeField: SortField;
  dir: SortDir;
}
function SortArrow({ field, activeField, dir }: SortArrowProps) {
  if (activeField !== field) return <span className="opacity-25 ml-1">↕</span>;
  return <span className="text-accent-light ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<AddModalKind | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Categories fetched once — used to build the filter chips and badge colors.
  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Refetch from the API whenever the category filter changes — the API
  // supports filtering by category server-side, just not by merchant name.
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await api.getTransactions({
        category: catFilter === "All" || catFilter === "Income" ? undefined : catFilter,
        sort: "-date",
      });
      const scoped = catFilter === "Income" ? results.filter((t) => t.type === "income") : results;
      setTransactions(scoped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [catFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const colorFor = (name: string) =>
    categories.find((c) => c.name === name)?.color || INCOME_TYPE_COLORS[name] || C.accent;

  const filterOptions = useMemo(() => {
    const names = categories.map((c) => c.name);
    return ["All", "Income", "Salary", "Credit Card", ...names];
  }, [categories]);

  // Merchant name search happens client-side, since the API has no text
  // search param — this runs on top of whatever the category filter already fetched.
  const filtered = useMemo(() => {
    const rows = transactions.filter((t) => t.merchant.toLowerCase().includes(search.toLowerCase()));
    rows.sort((a, b) => {
      const av = sortField === "amount" ? a.amount : a.date;
      const bv = sortField === "amount" ? b.amount : b.date;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [transactions, search, sortField, sortDir]);

  const totalIn = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden text-text font-sans">

      <Sidebar activePage="Transactions" />

      <div className="flex-1 flex flex-col overflow-hidden">

        <div className="px-[26px] pt-5 flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-text font-extrabold text-[22px] tracking-tight m-0">All Transactions</h1>
            <p className="text-sub text-[13px] mt-1 mb-0">{filtered.length} transactions found</p>
          </div>
          <button
            onClick={() => categories.length > 0 && setModal("transaction")}
            disabled={categories.length === 0}
            title={categories.length === 0 ? "Add a budget category first" : undefined}
            className="flex items-center gap-[7px] px-4 py-2.5 rounded-[9px] border-none bg-accent text-white font-bold text-sm shadow-[0_0_20px_#6366F145] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span className="font-extrabold text-base leading-none">+</span> Add Transaction
          </button>
        </div>

        <div className="px-[26px] pt-4 grid grid-cols-3 gap-3.5 shrink-0">
          {[
            { label: "Money In",  value: totalIn,            colorClass: "text-green" },
            { label: "Money Out", value: totalOut,           colorClass: "text-red" },
            { label: "Net",       value: totalIn - totalOut, colorClass: totalIn - totalOut >= 0 ? "text-green" : "text-red" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-[13px] px-[18px] py-3.5">
              <p className="text-sub text-[11px] font-bold uppercase tracking-wider mb-1.5">{s.label}</p>
              <span className={`text-xl font-extrabold tracking-tight tabular-nums ${s.colorClass}`}>
                {s.value < 0 ? "−" : ""}${Math.abs(s.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <div className="px-[26px] pt-4 flex gap-2.5 items-center shrink-0 flex-wrap">
          <input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="bg-card border border-border rounded-[9px] px-3.5 py-2.5 text-text text-sm outline-none w-[220px] focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          <div className="flex gap-1.5 flex-wrap">
            {filterOptions.map((cat) => {
              const active = catFilter === cat;
              const color = cat === "All" || cat === "Income" ? "#818CF8" : colorFor(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className="px-[13px] py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    border: `1px solid ${active ? color : "#232840"}`,
                    background: active ? `${color}18` : "transparent",
                    color: active ? color : "#5A6481",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 mx-[26px] mt-4 mb-[22px] bg-card border border-border rounded-2xl overflow-hidden flex flex-col min-h-0">

          <div className="grid grid-cols-[2fr_1.1fr_0.9fr_0.9fr_70px] gap-2.5 px-[22px] py-[13px] border-b border-border shrink-0">
            <span className="text-sub text-[11px] font-bold uppercase tracking-wide">Merchant</span>
            <span className="text-sub text-[11px] font-bold uppercase tracking-wide">Category</span>
            <button onClick={() => toggleSort("date")} className="bg-transparent border-none cursor-pointer text-left p-0 text-sub text-[11px] font-bold uppercase tracking-wide">
              Date <SortArrow field="date" activeField={sortField} dir={sortDir} />
            </button>
            <button onClick={() => toggleSort("amount")} className="bg-transparent border-none cursor-pointer text-right p-0 text-sub text-[11px] font-bold uppercase tracking-wide">
              Amount <SortArrow field="amount" activeField={sortField} dir={sortDir} />
            </button>
            <span></span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="px-[22px] py-10 text-center text-sub text-sm">Loading transactions...</div>
            )}
            {error && (
              <div className="px-[22px] py-10 text-center text-red text-sm">{error}</div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="px-[22px] py-10 text-center text-sub text-sm">
                No transactions match your search.
              </div>
            )}
            {!loading && !error && filtered.map((t, i) => {
              const catColor = colorFor(t.category);
              const isIncome = t.type === "income";
              return (
                <div
                  key={t.id}
                  className={`grid grid-cols-[2fr_1.1fr_0.9fr_0.9fr_70px] gap-2.5 items-center px-[22px] py-[11px] ${i === filtered.length - 1 ? "" : "border-b border-border"}`}
                >
                  <div className="flex items-center gap-[11px] min-w-0">
                    <div
                      className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[15px] shrink-0"
                      style={{ background: `${catColor}18`, border: `1px solid ${catColor}25` }}
                    >
                      {iconForCategory(t.category)}
                    </div>
                    <span className="text-text text-[13.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{t.merchant}</span>
                  </div>
                  <span
                    className="text-[11px] px-2.5 py-[3px] rounded-full font-bold w-fit"
                    style={{ color: catColor, background: `${catColor}15` }}
                  >
                    {t.category}
                  </span>
                  <span className="text-sub text-[13px]">{formatDate(t.date)}</span>
                  <span className={`text-right font-extrabold text-[13.5px] tabular-nums ${isIncome ? "text-green" : "text-red"}`}>
                    {isIncome ? "+" : "−"}${Math.abs(t.amount).toFixed(2)}
                  </span>
                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => setEditingTx(t)}
                      title="Edit"
                      className="text-sub hover:text-accent-light text-sm bg-transparent border-none cursor-pointer p-0"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeletingTx(t)}
                      title="Delete"
                      className="text-sub hover:text-red text-sm bg-transparent border-none cursor-pointer p-0"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modal && (
        <AddEntryModal
          type={modal}
          onClose={() => setModal(null)}
          onSaved={loadTransactions}
          categories={categories}
        />
      )}

      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          categories={categories}
          onClose={() => setEditingTx(null)}
          onSaved={loadTransactions}
        />
      )}

      {deletingTx && (
        <ConfirmModal
          title="Delete Transaction"
          body={`Delete "${deletingTx.merchant}" for $${Math.abs(deletingTx.amount).toFixed(2)}? This can't be undone.`}
          cta="Delete"
          onClose={() => setDeletingTx(null)}
          onConfirm={async () => {
            await api.deleteTransaction(deletingTx.id);
            await loadTransactions();
          }}
        />
      )}
    </div>
  );
}
