import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Breadcrumbs from "../../components/Page/Breadcrumbs";

export default function AdminLayout({
  children,
  pageTitle,
  path,
  links = [],
  icon,
}) {
  const userType = "admin";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);

      if (!mobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobileOpen]);

  const toggleDesktopSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <main className="flex min-h-screen">
      <Sidebar
        userType={userType}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isMobileView={isMobileView}
      />

      <div className="flex-1 flex flex-col w-full">
        <div
          className={`
          transition-all duration-300
          ${sidebarOpen && !isMobileView ? "md:ml-67.5" : ""}
        `}
        >
          <Navbar
            toggleSidebar={toggleDesktopSidebar}
            sidebarOpen={sidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
            isMobileOpen={isMobileOpen}
            isMobileView={isMobileView}
            hideHamburgerOnDesktopCollapsed={!sidebarOpen}
          />

          {links && links.length > 0 && (
            <Breadcrumbs
              icon={icon}
              pageTitle={pageTitle}
              path={path}
              links={links}
            />
          )}

          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
