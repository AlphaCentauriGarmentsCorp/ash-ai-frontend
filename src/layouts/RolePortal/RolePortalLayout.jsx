import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatusFlowPipeline from "./StatusFlowPipeline";
import PortalSidebar from "./PortalSidebar";

/**
 * Phase 5-A — Shared layout shell for every role portal.
 *
 * Self-contained — does NOT wrap AdminLayout. The mockups show role
 * portals as standalone, focused workspaces (no global Ash-Ai sidebar
 * visible). User can navigate back to the main app via the logo.
 *
 * Props:
 *   roleSlug          — e.g. "cutter", "printer" — used by the sidebar
 *                       to highlight Dashboard/My Tasks links.
 *   roleTitle         — display name shown in the header
 *                       ("Sample Creation – Cutter")
 *   roleBadgeIcon     — FontAwesome class name for the role badge icon
 *                       ("fa-scissors", "fa-paint-brush", etc.)
 *   sidebarItems      — array of extra sidebar entries:
 *                       [{ label, icon, href, isActive? }]
 *                       Always added on top of the default
 *                       Dashboard / My Tasks / History.
 *   statusFlowStages  — array of step labels for the horizontal pipeline
 *                       (e.g. ["Payment Verified", "Graphic Artwork", ...])
 *   currentStageSlug  — which step the pipeline highlights
 *   tipText           — bottom-bar tip line. Pass null to hide.
 *   children          — main content area
 */
const RolePortalLayout = ({
  roleSlug,
  roleTitle,
  roleBadgeIcon = "fa-user",
  sidebarItems = [],
  statusFlowStages = [],
  currentStageSlug = null,
  tipText = null,
  children,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ────────────────── Portal Header ────────────────── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            className="lg:hidden p-2 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Toggle sidebar"
          >
            <i className="fa-solid fa-bars" />
          </button>

          {/* Logo links back to main app */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
              <i className="fa-solid fa-shirt text-white text-sm" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                Ash-AI
              </h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">
                Apparel Smart Hub
              </p>
            </div>
          </Link>

          {/* Title */}
          <div className="hidden md:block ml-4 pl-4 border-l border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">
              {roleTitle}
            </h2>
            <p className="text-[10px] text-gray-500 -mt-0.5">
              What this staff needs to see only
            </p>
          </div>
        </div>

        {/* Right side: notifications + user */}
        <div className="flex items-center gap-3">
          {/* Notifications bell — placeholder; real integration in Phase 5-B+ */}
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Notifications"
          >
            <i className="fa-solid fa-bell" />
          </button>

          {/* Role badge — visual identity */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <i className={`fa-solid ${roleBadgeIcon} text-xs`} />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-gray-900 leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-gray-500 -mt-0.5 capitalize">
                {roleSlug?.replace(/[-_]/g, " ")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ────────────────── Body ────────────────── */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <PortalSidebar
          roleSlug={roleSlug}
          extraItems={sidebarItems}
          isMobileOpen={mobileSidebarOpen && isMobile}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden">
          {/* Status flow pipeline (top of every portal) */}
          {statusFlowStages.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <StatusFlowPipeline
                stages={statusFlowStages}
                currentStageSlug={currentStageSlug}
              />
            </div>
          )}

          {/* Portal-specific content */}
          <div>{children}</div>

          {/* Tip line at bottom */}
          {tipText && (
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs">
              <i className="fa-solid fa-lightbulb text-amber-500 mt-0.5" />
              <p className="text-amber-800 leading-relaxed">{tipText}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RolePortalLayout;
