import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ConfirmModal from "../components/ConfirmModal";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

type SettingsAction = "budget" | "account" | null;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [modal, setModal] = useState<SettingsAction>(null);

  async function handleDeleteBudget() {
    const categories = await api.getCategories();
    await Promise.all(categories.map((c) => api.deleteCategory(c.id)));
  }

  async function handleDeleteAccount() {
    await api.deleteAccount();
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden text-text font-sans">

      <Sidebar activePage="Settings" />

      <main className="flex-1 flex flex-col overflow-hidden">

        <div className="px-[26px] pt-5 shrink-0">
          <h1 className="text-text font-extrabold text-[22px] tracking-tight m-0">Settings</h1>
          <p className="text-sub text-[13px] mt-1 mb-0">Manage your budget data and account.</p>
        </div>

        <div className="px-[26px] py-5 flex-1 overflow-y-auto">
          <div className="bg-card border border-red/30 rounded-2xl overflow-hidden max-w-[640px]">
            <div className="px-[22px] py-4 border-b border-border">
              <h2 className="text-red font-bold text-sm m-0 flex items-center gap-2">
                ⚠️ Danger Zone
              </h2>
            </div>

            {/* Delete Budget row */}
            <div className="flex justify-between items-center px-[22px] py-[18px] border-b border-border">
              <div className="pr-5">
                <div className="text-text text-sm font-bold mb-1">Delete Budget</div>
                <div className="text-sub text-[12.5px] leading-relaxed">
                  Removes every budget category — and any transactions tagged with those categories.
                  Income and uncategorized transactions are unaffected.
                </div>
              </div>
              <button
                onClick={() => setModal("budget")}
                className="shrink-0 px-4 py-2.5 rounded-[9px] border border-red/50 bg-red/[0.07] text-red font-bold text-sm whitespace-nowrap"
              >
                Delete Budget
              </button>
            </div>

            {/* Delete Account row */}
            <div className="flex justify-between items-center px-[22px] py-[18px]">
              <div className="pr-5">
                <div className="text-text text-sm font-bold mb-1">Delete Account</div>
                <div className="text-sub text-[12.5px] leading-relaxed">
                  Permanently delete your account and all associated data. This cannot be undone.
                </div>
              </div>
              <button
                onClick={() => setModal("account")}
                className="shrink-0 px-4 py-2.5 rounded-[9px] border-none bg-red-dark text-white font-bold text-sm whitespace-nowrap shadow-[0_0_16px_#F43F5E40]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {modal === "budget" && (
        <ConfirmModal
          title="Delete Budget"
          body="This removes every budget category you've created, and any transactions tagged with those categories. Income and uncategorized transactions are unaffected. This cannot be undone."
          cta="Delete Budget"
          confirmWord="DELETE"
          onClose={() => setModal(null)}
          onConfirm={handleDeleteBudget}
        />
      )}

      {modal === "account" && (
        <ConfirmModal
          title="Delete Account"
          body="This permanently deletes your account, transactions, budget categories, and linked cards. This cannot be undone."
          cta="Delete Account"
          confirmWord="DELETE"
          onClose={() => setModal(null)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}
