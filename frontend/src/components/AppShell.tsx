import { Bell, ChevronDown, HelpCircle, LogOut, Menu, PanelLeftClose, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink } from "../lib/router";
import { Brand } from "./Brand";
import { cx } from "../lib/format";

export function AppShell({
  children,
  navItems,
  patientName,
}: {
  children: ReactNode;
  navItems?: Array<{ to: string; label: string; icon: ReactNode }>;
  patientName?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cx("app-shell", collapsed && "sidebar-collapsed")}>
      <aside className={cx("sidebar", mobileOpen && "sidebar-mobile-open")} aria-label="Primary">
        <div className="sidebar-brand-row">
          <Brand compact />
          <button type="button"
            className="icon-button sidebar-close-mobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-avatar">CH</span>
          <span>
            <strong>Personal records</strong>
            <small>Secure workspace</small>
          </span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>
        <nav className="sidebar-nav">
          {(navItems ?? []).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cx("sidebar-link", isActive && "active")}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="security-note">
            <span className="security-dot" />
            <span>
              <strong>Demo-safe mode</strong>
              <small>Local cached results</small>
            </span>
          </div>
          <Link to="/" className="sidebar-link">
            <LogOut size={18} />
            <span>Exit workspace</span>
          </Link>
        </div>
      </aside>

      {mobileOpen ? (
        <button type="button"
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button type="button"
              className="icon-button mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>
            <button type="button"
              className="icon-button desktop-collapse"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            >
              <PanelLeftClose size={18} />
            </button>
            {patientName ? (
              <span className="topbar-context">
                Patient record <span>/</span> <strong>{patientName}</strong>
              </span>
            ) : (
              <span className="topbar-context">Patient workspaces</span>
            )}
          </div>
          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Help">
              <HelpCircle size={18} />
            </button>
            <button type="button" className="icon-button notification-button" aria-label="Notifications">
              <Bell size={18} />
              <span />
            </button>
            <span className="user-avatar" role="img" aria-label="Signed in as demo reviewer">
              DR
            </span>
          </div>
        </header>
        <main id="main-content" className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
