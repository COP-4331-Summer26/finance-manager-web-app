import React from "react";
import Sidebar from "../components/Sidebar";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-bg overflow-hidden text-text font-sans">

      <Sidebar activePage="Settings" />

      <div className="flex-1 flex flex-col overflow-hidden">

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
                  Remove all budget categories and spending limits. Transactions stay intact.
                </div>
                <div className="text-sub text-[11px] mt-1.5 italic">
                  Not supported by the API yet — no delete endpoint exists for categories.
                </div>
              </div>
              <button
                disabled
                className="shrink-0 px-4 py-2.5 rounded-[9px] border border-red/25 bg-red/[0.03] text-red/40 font-bold text-sm whitespace-nowrap cursor-not-allowed"
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
                <div className="text-sub text-[11px] mt-1.5 italic">
                  Not supported by the API yet — no delete endpoint exists for users.
                </div>
              </div>
              <button
                disabled
                className="shrink-0 px-4 py-2.5 rounded-[9px] border-none bg-red/20 text-white/50 font-bold text-sm whitespace-nowrap cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
