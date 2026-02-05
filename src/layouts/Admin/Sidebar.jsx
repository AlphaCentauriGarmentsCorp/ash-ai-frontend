import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getMenuByRole } from "../../config/menuConfig";
import { SidebarContext } from "../../context/SidebarContext";
import Logo from "../../assets/images/logo/Logo.png";
import LogoBox from "../../assets/images/logo/LogoBox.png";

export default function Sidebar({
  userType,
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
  isMobileView,
}) {
  const menu = getMenuByRole(userType);

  const { activeLink, setActiveLink, openSubMenu, setOpenSubMenu } =
    useContext(SidebarContext);

  const handleClick = (itemKey, path, hasSubItems) => {
    if (hasSubItems) {
      setOpenSubMenu(openSubMenu === itemKey ? null : itemKey);
      if (path) {
        setActiveLink(path);
      }
    } else {
      setActiveLink(path);
      setOpenSubMenu(null);
    }

    if (isMobileView) {
      setIsMobileOpen(false);
    }
  };

  const showContent = isMobileView ? isMobileOpen : isOpen;

  return (
    <>
      {}
      {isMobileOpen && isMobileView && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {}
      <div
        className={`
          fixed top-0 z-100 left-0 h-full bg-primary text-white
          transition-all duration-300 ease-in-out
          ${
            isMobileView
              ? isMobileOpen
                ? "w-67.5"
                : "w-0"
              : isOpen
                ? "w-67.5"
                : "w-0"
          }
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {}
        <div
          className={`
            flex justify-between items-center p-4
            border-b border-r border-gray-700
            transition-all duration-300
            ${showContent ? "opacity-100 h-auto" : "opacity-0 h-0 p-0 border-none"}
          `}
        >
          {}
          <div
            className={`
              bg-white w-full rounded-xl flex justify-center items-center py-1 border border-gray-400
              transition-all duration-300
              ${showContent ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
            `}
          >
            <img src={Logo} alt="Logo" className="object-contain " />
          </div>

          {}
          {isMobileView && isMobileOpen && (
            <button
              className="md:hidden ml-2 text-white hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center shrink-0"
              onClick={() => setIsMobileOpen(false)}
            >
              <i className="fa-solid fa-times text-lg"></i>
            </button>
          )}
        </div>

        {}
        <div
          className={`
          overflow-y-auto transition-all duration-300
          ${showContent ? "h-[calc(100%-80px)] opacity-100" : "h-0 opacity-0"}
        `}
        >
          {menu.map((section, sIdx) => (
            <div key={sIdx} className="mt-5">
              {}
              <div
                className={`
                  px-4 py-2 overflow-hidden transition-all duration-200 ease-in-out
                  ${showContent ? "max-h-10 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                {showContent && (
                  <p className="font-poppins text-gray-300 text-[16px] font-medium whitespace-nowrap">
                    {section.section}
                  </p>
                )}
              </div>

              <ul className="mb-2 pl-2">
                {section.items.map((item, iIdx) => {
                  const itemKey = `${sIdx}-${iIdx}`;
                  const isItemActive = activeLink === item.path;
                  const isSubMenuOpen = openSubMenu === itemKey;
                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  return (
                    <li key={iIdx} className="relative">
                      {item.path && !hasSubItems ? (
                        <Link
                          to={item.path}
                          className={`
                            flex items-center my-0.5 mx-2 px-2
                            rounded-[5px] transition-all duration-200 ease-in-out
                            ${isItemActive ? "bg-white text-primary" : "hover:bg-white hover:text-primary"}
                            overflow-hidden
                            min-h-9
                          `}
                          onClick={() => {
                            setActiveLink(item.path);
                            setOpenSubMenu(null);
                            if (isMobileView) setIsMobileOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <i className={`${item.icon} text-sm shrink-0`}></i>
                            <span className="text-[14px] whitespace-nowrap">
                              {item.name}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div
                          className={`
                            flex items-center my-0.5 mx-2 px-2 cursor-pointer
                            rounded-[5px] transition-all duration-200 ease-in-out
                            ${isItemActive ? "bg-white text-primary" : "hover:bg-white hover:text-primary"}
                            overflow-hidden
                            min-h-9
                          `}
                          onClick={() =>
                            handleClick(itemKey, item.path, hasSubItems)
                          }
                        >
                          <div className="flex items-center gap-4">
                            <i className={`${item.icon} text-sm shrink-0`}></i>
                            <span className="text-[14px] whitespace-nowrap">
                              {item.name}
                            </span>
                          </div>

                          {hasSubItems && (
                            <i
                              className={`
                                text-xs fa-solid fa-chevron-${
                                  isSubMenuOpen ? "down" : "right"
                                } text-sm transition-all duration-300 ease-in-out ml-auto
                                ${isSubMenuOpen ? "rotate-0" : ""}
                                shrink-0
                              `}
                            ></i>
                          )}
                        </div>
                      )}

                      {hasSubItems && showContent && (
                        <div
                          className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${isSubMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                          `}
                        >
                          <ul className="ml-8">
                            {item.subItems.map((sub, subIdx) => {
                              const isSubActive = activeLink === sub.path;
                              return (
                                <li key={subIdx}>
                                  {sub.path ? (
                                    <Link
                                      to={sub.path}
                                      className={`
                                        block pl-4 py-2 cursor-pointer text-[14px]
                                        m-1 rounded-[5px] transition-all duration-200 ease-in-out
                                        ${
                                          isSubActive
                                            ? "bg-white text-primary"
                                            : "hover:bg-white hover:text-primary"
                                        }
                                        whitespace-nowrap
                                      `}
                                      onClick={() => {
                                        setActiveLink(sub.path);
                                        if (isMobileView)
                                          setIsMobileOpen(false);
                                      }}
                                    >
                                      {sub.name}
                                    </Link>
                                  ) : (
                                    <div
                                      className={`
                                        pl-4 py-2 cursor-pointer text-[14px]
                                        m-1 rounded-[5px] transition-all duration-200 ease-in-out
                                        ${
                                          isSubActive
                                            ? "bg-white text-primary"
                                            : "hover:bg-white hover:text-primary"
                                        }
                                        whitespace-nowrap
                                      `}
                                      onClick={() => {
                                        setActiveLink(sub.path);
                                        if (isMobileView)
                                          setIsMobileOpen(false);
                                      }}
                                    >
                                      {sub.name}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
