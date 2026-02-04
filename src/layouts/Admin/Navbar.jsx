import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  roleColors,
  roleDisplayNames,
  allRoles,
  getRoleColor,
  getRoleDisplayName,
} from "../../config/roleConfig";
const AVATAR_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = ({
  toggleSidebar,
  sidebarOpen,
  toggleMobileSidebar,
  isMobileOpen,
}) => {
  const { user, setUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between py-2 px-3 md:py-4 md:px-6 bg-primary border-b border-gray-200 shadow-sm">
      <div className="flex items-center flex-1">
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              toggleMobileSidebar();
            } else {
              toggleSidebar();
            }
          }}
          className="relative w-8 h-8 p-1 transition-colors rounded-md hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            {/* For mobile, show different icon when sidebar is open */}
            {window.innerWidth < 768 ? (
              <>
                <span
                  className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMobileOpen ? "rotate-45 translate-y-1.5" : ""}`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMobileOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                ></span>
              </>
            ) : (
              <>
                <span
                  className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${!sidebarOpen ? "rotate-45 translate-y-1.5" : ""}`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${!sidebarOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${!sidebarOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                ></span>
              </>
            )}
          </div>
        </button>

        <div className="hidden lg:block flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for pages..."
              className="w-full pl-10 py-2 text-sm border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end flex-1 space-x-3 md:space-x-6">
        <div className="relative">
          <button className="relative transition-colors rounded-full bg-white h-8 w-8 md:h-11 md:w-11 flex items-center justify-center hover:bg-gray-50">
            <i className="text-lg md:text-xl text-primary fa-regular fa-bell"></i>
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 text-[10px] md:text-xs font-semibold text-white bg-red-500 rounded-full">
              3
            </span>
          </button>
        </div>

        <div className="relative bg-white rounded-lg py-1 px-2 md:py-2 md:px-3 border">
          <div className="flex items-center space-x-2 md:space-x-4">
            {user.avatar ? (
              <img
                className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full object-cover border border-primary"
                src={`${AVATAR_BASE_URL}${user.avatar}`}
                alt={user.name}
              />
            ) : (
              <div className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full border border-primary bg-primary text-xs md:text-sm font-semibold text-white">
                {getUserInitials()}
              </div>
            )}

            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
                {user?.name || "Unknown User"}
              </p>

              <div className="relative">
                <div
                  className="flex border border-gray-400 rounded-xl px-2 items-center space-x-1.5 mt-0.5 cursor-default group"
                  onMouseEnter={() => setShowAllRoles(true)}
                  onMouseLeave={() => setShowAllRoles(false)}
                >
                  <i
                    className={`fa-solid ${showAllRoles ? "fa-chevron-up" : "fa-chevron-down"} text-[8px] opacity-100 transition-opacity`}
                  ></i>

                  <span
                    className={`w-2 h-2 rounded-full ${getRoleColor((user?.domain_role || ["unknown"])[0])}`}
                  ></span>
                  <span className="text-xs text-primary font-medium">
                    {getRoleDisplayName((user?.domain_role || ["unknown"])[0])}
                  </span>
                </div>

                {showAllRoles && (
                  <div
                    className="absolute right-1 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeIn"
                    onMouseEnter={() => setShowAllRoles(true)}
                    onMouseLeave={() => setShowAllRoles(false)}
                  >
                    <div className="">
                      <div className="grid grid-cols-1 gap-0 overflow-y-auto">
                        {user.domain_role.map((role, index) => (
                          <div
                            key={index}
                            className={`flex items-center px-2 py-1.5 text-sm text-primary hover:bg-gray-50
                              ${index !== user.domain_role.length - 1 ? "border-b border-gray-200" : ""}
                            `}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${getRoleColor(role)}`}
                            ></span>
                            <span className="flex-1">
                              {getRoleDisplayName(role)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={toggleDropdown}
              className="bg-primary text-[8px] transition-colors text-white h-5 w-5 rounded-full"
              aria-label="User menu"
            >
              <i
                className={`fa-solid mt-1  fa-chevron-down text-[9px] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              ></i>
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 md:w-56 bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn z-50">
              <div className="py-1">
                {}
                <div className="md:hidden px-3 py-2 border-b border-gray-300">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "Kurt Russel Q, Santos"}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${getRoleColor((user?.domain_role || ["unknown"])[0])}`}
                    ></span>
                    <span className="text-xs text-primary font-medium">
                      {getRoleDisplayName(
                        (user?.domain_role || ["unknown"])[0],
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <div className="hidden md:block px-3 py-2 border-b border-gray-300">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium truncate">
                    {user?.email || user?.name}
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="w-4 mr-2 text-gray-400 fa-solid fa-user"></i>
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="w-4 mr-2 text-gray-400 fa-solid fa-cog"></i>
                  Settings
                </Link>

                <div className="my-1 border-t border-gray-300"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <i className="w-4 mr-2 fa-solid fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
