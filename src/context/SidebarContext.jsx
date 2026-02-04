import { createContext, useState, useEffect } from "react";

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [activeLink, setActiveLink] = useState(
    () => localStorage.getItem("activeSidebarLink") || "",
  );
  const [openSubMenu, setOpenSubMenu] = useState(
    () => localStorage.getItem("openSubMenu") || null,
  );

  useEffect(() => {
    localStorage.setItem("activeSidebarLink", activeLink);
  }, [activeLink]);

  useEffect(() => {
    localStorage.setItem("openSubMenu", openSubMenu);
  }, [openSubMenu]);

  return (
    <SidebarContext.Provider
      value={{ activeLink, setActiveLink, openSubMenu, setOpenSubMenu }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
