import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { NavItem } from "../types";

const NAV_ITEMS: NavItem[] = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "⇅", label: "Transactions" },
  { icon: "⚙", label: "Settings" },
];

const ROUTES: Record<string, string> = {
  Dashboard: "/",
  Transactions: "/transactions",
  Settings: "/settings",
};

interface SidebarProps {
  activePage: string;
  children?: React.ReactNode;
}

export default function Sidebar({ activePage, children }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name || "Account";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="w-56 bg-sidebar border-r border-border flex flex-col shrink-0">

      {/* Logo */}
      <div className="px-[18px] pt-[22px] pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[11px] bg-accent-dark flex items-center justify-center text-lg font-extrabold text-white shrink-0">
            $
          </div>
          <div className="text-text font-extrabold text-sm tracking-tight leading-tight">
            User Capital Flow
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2.5 flex-1">
        <div className="text-sub text-[10px] font-bold tracking-widest px-2.5 pb-2 uppercase">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.label;
          return (
            <button
              key={item.label}
              onClick={() => navigate(ROUTES[item.label])}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] mb-0.5 text-sm transition-colors
                ${isActive
                  ? "bg-accent/[0.13] text-accent-light font-semibold shadow-[inset_2px_0_0_#6366F1]"
                  : "text-sub font-normal hover:text-text/80"}`}
            >
              <span className={`text-base w-5 text-center ${isActive ? "opacity-100" : "opacity-70"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Optional slot (e.g. Quick Add buttons on the Dashboard) */}
      {children}

      {/* User footer */}
      <div className="px-[18px] pt-3.5 pb-[18px] border-t border-border flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-full bg-accent-dark flex items-center justify-center text-white font-extrabold text-sm shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-text text-[13px] font-bold truncate">{displayName}</div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sub text-xs hover:text-red shrink-0 p-2 -m-2"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
