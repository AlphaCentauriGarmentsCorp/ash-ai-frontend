import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Phase 5-A — Sidebar for role portals.
 *
 * Always shows: Dashboard / My Tasks / History as the base set.
 * Roles can pass additional items via `extraItems` prop.
 *
 * On mobile (<1024px) the sidebar is hidden by default and slides in
 * when the parent toggles isMobileOpen. On desktop it's always visible.
 */
const DEFAULT_ITEMS = [
  { label: "Dashboard", icon: "fa-grid-2", suffix: "" },           // /portal/{role}
  { label: "My Tasks",  icon: "fa-list-check", suffix: "/tasks" }, // /portal/{role}/tasks
  { label: "History",   icon: "fa-clock-rotate-left", suffix: "/history" },
];

const PortalSidebar = ({
  roleSlug,
  extraItems = [],
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const baseHref = roleSlug ? `/portal/${roleSlug.replace(/_/g, "-")}` : "";

  // Items combine: defaults first, then any role-specific extras.
  const items = [
    ...DEFAULT_ITEMS.map((it) => ({
      ...it,
      href: baseHref + it.suffix,
    })),
    ...extraItems,
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          bg-white border-r border-gray-200 flex flex-col
          w-56 shrink-0
          ${isMobileOpen ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "hidden"}
          lg:block lg:relative lg:z-0 lg:shadow-none
        `}
      >
        <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.suffix === ""}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <i className={`fa-solid ${item.icon} w-4 text-center`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom helper text — keeps the sidebar from feeling sparse */}
        <div className="px-4 py-3 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed">
          <p className="font-medium text-gray-500 mb-0.5">Role Portal</p>
          <p>Focused on what you need to do right now.</p>
        </div>
      </aside>
    </>
  );
};

export default PortalSidebar;
