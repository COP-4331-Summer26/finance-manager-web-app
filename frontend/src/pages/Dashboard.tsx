import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import AddEntryModal from "../components/AddEntryModal";
import ViewCardsModal from "../components/ViewCardsModal";
import ConfirmModal from "../components/ConfirmModal";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { iconForCategory } from "../utils/categoryIcons";
import { formatDate } from "../utils/format";
import { C, INCOME_TYPE_COLORS } from "../theme/tokens";
import type { AddModalKind, SummaryResponse, Transaction, Category } from "../types";

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

interface TooltipPayloadItem {
  name: string;
  value: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  colorFor: (name: string) => string;
}

function CustomTooltip({ active, payload, colorFor }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card2 border border-border rounded-[10px] px-3.5 py-2.5 shadow-[0_4px_20px_#00000060]">
      <div className="font-bold text-xs mb-0.5" style={{ color: colorFor(d.name) }}>
        {d.name}
      </div>
      <div className="text-text text-lg font-extrabold tracking-tight tabular-nums">
        ${d.value.toLocaleString()}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modal, setModal] = useState<AddModalKind | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, txRes, catRes] = await Promise.all([
        api.getSummary(currentMonth()),
        api.getTransactions({ limit: 6, sort: "-date" }),
        api.getCategories(),
      ]);
      setSummary(summaryRes);
      setRecent(txRes);
      setCategoryList(catRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = summary?.categoryBreakdown ?? [];
  const totalSpent = summary?.totalSpent ?? 0;
  const chartData = categories.map((c) => ({ name: c.name, value: c.spent }));
  const colorFor = (name: string) => categories.find((c) => c.name === name)?.color || INCOME_TYPE_COLORS[name] || C.accent;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sub text-sm">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-red text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden text-text font-sans">

      <Sidebar activePage="Dashboard">
        <div className="px-3 py-3.5 border-t border-border">
          <div className="text-sub text-[10px] font-bold tracking-widest px-1.5 pb-2.5 uppercase">
            Quick Add
          </div>
          {([
            { label: "Add Income",        kind: "income",      color: "#10B981" },
            { label: "Add Transaction",   kind: "transaction", color: "#818CF8" },
            { label: "Add Category",      kind: "category",    color: "#22D3EE" },
            { label: "View Credit Cards", kind: "viewCards",   color: "#F59E0B" },
          ] as const).map((btn) => {
            const locked = btn.kind === "transaction" && categories.length === 0;
            return (
              <div key={btn.label}>
                <button
                  onClick={() => {
                    if (btn.kind === "viewCards") {
                      setShowCards(true);
                      return;
                    }
                    if (!locked) setModal(btn.kind);
                  }}
                  disabled={locked}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[9px] mb-1 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: `${btn.color}12`, border: `1px solid ${btn.color}30`, color: btn.color }}
                >
                  <span className="font-extrabold text-base leading-none">{btn.kind === "viewCards" ? "→" : "+"}</span> {btn.label}
                </button>
                {locked && (
                  <p className="text-sub text-[10px] mb-1.5 px-1">Add a category first</p>
                )}
              </div>
            );
          })}
        </div>
      </Sidebar>

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-[26px] pt-5 flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-text font-extrabold text-[22px] tracking-tight m-0">
              Good evening, {user?.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-sub text-[13px] mt-1 mb-0">Here's your financial overview.</p>
          </div>
          <div className="bg-card border border-border rounded-[9px] px-3.5 py-2 text-sub text-xs font-semibold">
            📅 {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Summary cards */}
        <div className="px-[26px] pt-4 grid grid-cols-3 gap-3.5 shrink-0">
          {[
            { label: "Total Balance",  value: summary?.totalBalance ?? 0 },
            { label: "Monthly Income", value: summary?.totalIncome ?? 0 },
            { label: "Total Spent",    value: summary?.totalSpent ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-[13px] px-[18px] py-4">
              <p className="text-sub text-[11px] font-bold uppercase tracking-wider mb-2.5">{stat.label}</p>
              <span className="text-text text-2xl font-extrabold tracking-tight tabular-nums">
                {stat.value < 0 ? "−" : ""}${Math.abs(stat.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        {/* Chart row */}
        <div className="flex-1 px-[26px] py-4 flex gap-4 overflow-hidden min-h-0">

          <div className="flex-1 flex flex-col gap-3.5 overflow-hidden min-h-0">

            {/* Donut chart card */}
            <div className="flex-1 bg-card border border-border rounded-2xl px-[22px] py-[18px] flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-2 shrink-0">
                <h2 className="text-text font-bold text-[15px] m-0">Spending by Category</h2>
                <div className="flex gap-3 flex-wrap justify-end">
                  {categories.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center gap-1.5 cursor-default"
                      onMouseEnter={() => setHoveredCat(cat.name)}
                      onMouseLeave={() => setHoveredCat(null)}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className={`text-[11px] transition-all ${hoveredCat === cat.name ? "text-text font-bold" : "text-sub font-normal"}`}>
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sub text-sm">
                  No categories yet — add one to see your breakdown.
                </div>
              ) : (
                <div className="flex-1 relative min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%" cy="50%"
                        innerRadius="52%"
                        outerRadius="82%"
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={(_, i) => setHoveredCat(chartData[i].name)}
                        onMouseLeave={() => setHoveredCat(null)}
                        strokeWidth={0}
                      >
                        {chartData.map((entry) => {
                          const color = colorFor(entry.name);
                          const isHov = hoveredCat === entry.name;
                          const isDim = hoveredCat !== null && !isHov;
                          return (
                            <Cell
                              key={entry.name}
                              fill={color}
                              opacity={isDim ? 0.22 : 1}
                              style={{ filter: isHov ? `drop-shadow(0 0 14px ${color}BB)` : "none", transition: "opacity 0.2s" }}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip colorFor={colorFor} />} position={{ x: 12, y: 8 }} wrapperStyle={{ pointerEvents: "none" }} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-sub text-[11px] font-bold uppercase tracking-wider">Total Spent</div>
                    <div className="text-text text-[32px] font-extrabold tracking-tight leading-tight tabular-nums">
                      ${totalSpent.toLocaleString()}
                    </div>
                    <div className="text-sub text-xs">of ${(summary?.totalIncome ?? 0).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Category breakdown */}
            <div className="bg-card border border-border rounded-2xl px-[18px] py-[11px] shrink-0 h-[190px] flex flex-col">
              <h2 className="text-text font-bold text-xs mb-2 mt-0 shrink-0">Category Breakdown</h2>
              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1 min-h-0">
                {categories.map((cat) => {
                  const pct = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
                  const isHov = hoveredCat === cat.name;
                  const statusColor = pct >= 100 ? C.red : pct > 80 ? C.amber : C.green;
                  return (
                    <div
                      key={cat.name}
                      className="transition-opacity"
                      style={{ opacity: hoveredCat && !isHov ? 0.4 : 1 }}
                      onMouseEnter={() => setHoveredCat(cat.name)}
                      onMouseLeave={() => setHoveredCat(null)}
                    >
                      <div className="flex justify-between items-center mb-[3px]">
                        <div className="flex items-center gap-[7px]">
                          <div
                            className="w-[7px] h-[7px] rounded-full transition-shadow"
                            style={{ background: cat.color, boxShadow: isHov ? `0 0 8px ${cat.color}` : "none" }}
                          />
                          <span className="text-text text-[11.5px] font-medium">{iconForCategory(cat.name)} {cat.name}</span>
                        </div>
                        <div className="flex gap-[7px] items-center">
                          <span className="text-text text-[11.5px] font-bold tabular-nums">${cat.spent}</span>
                          <span className="text-sub text-[10.5px]">/ ${cat.limit}</span>
                          <span
                            className="text-[9.5px] font-bold px-1.5 py-px rounded-full"
                            style={{ color: statusColor, background: `${statusColor}18` }}
                          >
                            {Math.round(pct)}%
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const match = categoryList.find((c) => c.name === cat.name);
                              if (match) setDeletingCategory(match);
                            }}
                            title="Delete category"
                            className="text-sub hover:text-red text-[10px] bg-transparent border-none cursor-pointer p-2 -my-2 leading-none"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: `${cat.color}20` }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            background: cat.color,
                            width: `${Math.min(pct, 100)}%`,
                            boxShadow: isHov ? `0 0 10px ${cat.color}CC` : `0 0 4px ${cat.color}44`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-sub text-xs">No budget categories yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent transactions panel */}
          <div className="w-[285px] bg-card border border-border rounded-2xl px-4 py-[18px] flex flex-col overflow-hidden shrink-0">
            <div className="flex justify-between items-center mb-3.5 shrink-0">
              <h2 className="text-text font-bold text-[15px] m-0">Recent</h2>
              <button onClick={() => navigate("/transactions")} className="text-accent-light text-xs font-semibold">
                View all →
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {recent.length === 0 && (
                <p className="text-sub text-xs">No transactions yet.</p>
              )}
              {recent.map((tx) => {
                const catColor = colorFor(tx.category);
                const isIncome = tx.type === "income";
                return (
                  <div key={tx.id} className="bg-bg border border-border rounded-xl px-[13px] py-[11px] flex items-center gap-[11px]">
                    <div
                      className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[17px] shrink-0"
                      style={{ background: `${catColor}18`, border: `1px solid ${catColor}25` }}
                    >
                      {iconForCategory(tx.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-text text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{tx.merchant}</div>
                      <div className="flex items-center gap-[5px] mt-[3px]">
                        <span
                          className="text-[10px] px-[7px] py-px rounded-full font-bold whitespace-nowrap"
                          style={{ color: catColor, background: `${catColor}15` }}
                        >
                          {tx.category}
                        </span>
                        <span className="text-sub text-[11px]">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                    <div className={`font-extrabold text-[13px] shrink-0 tracking-tight tabular-nums ${isIncome ? "text-green" : "text-red"}`}>
                      {isIncome ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {modal && <AddEntryModal type={modal} onClose={() => setModal(null)} onSaved={loadData} categories={categories} />}
      {showCards && <ViewCardsModal onClose={() => setShowCards(false)} />}
      {deletingCategory && (
        <ConfirmModal
          title="Delete Category"
          body={`Delete "${deletingCategory.name}"? Any transactions tagged with this category will be deleted too. This can't be undone.`}
          cta="Delete"
          onClose={() => setDeletingCategory(null)}
          onConfirm={async () => {
            await api.deleteCategory(deletingCategory.id);
            await loadData();
          }}
        />
      )}
    </div>
  );
}
