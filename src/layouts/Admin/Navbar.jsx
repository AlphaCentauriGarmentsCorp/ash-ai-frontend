import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  roleColors,
  roleDisplayNames,
  allRoles,
  getRoleColor,
  getRoleDisplayName,
} from "../../config/roleConfig";
import { getMenuByRole } from "../../config/menuConfig";

const AVATAR_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = ({
  toggleSidebar,
  sidebarOpen,
  toggleMobileSidebar,
  isMobileOpen,
}) => {
  const { user, setUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "New Order Received",
      message: "Order #ORD-2024-001 has been created",
      time: "5 minutes ago",
      read: false,
      icon: "fa-solid fa-cart-shopping",
      color: "blue",
    },
    {
      id: 2,
      type: "task",
      title: "Task Assigned",
      message: "You have been assigned to Screen Printing task",
      time: "1 hour ago",
      read: false,
      icon: "fa-solid fa-tasks",
      color: "green",
    },
    {
      id: 4,
      type: "client",
      title: "New Client Registered",
      message: "ABC Company has registered as a new client",
      time: "1 day ago",
      read: true,
      icon: "fa-solid fa-user-plus",
      color: "purple",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getAccessiblePages = () => {
    if (!user?.domain_role || user.domain_role.length === 0) return [];

    const primaryRole = user.domain_role[0];
    const filteredMenu = getMenuByRole(primaryRole);

    const pages = [];

    const extractPages = (items, sectionName) => {
      items.forEach((item) => {
        if (item.path) {
          pages.push({
            name: item.name,
            path: item.path,
            section: sectionName,
            type: "page",
            icon: item.icon,
          });
        }

        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach((subItem) => {
            pages.push({
              name: subItem.name,
              path: subItem.path,
              section: item.name,
              type: "subpage",
              icon: item.icon,
            });
          });
        }
      });
    };

    filteredMenu.forEach((section) => {
      extractPages(section.items, section.section);
    });

    return pages;
  };

  const [accessiblePages, setAccessiblePages] = useState([]);

  useEffect(() => {
    if (user) {
      setAccessiblePages(getAccessiblePages());
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = accessiblePages
      .filter(
        (page) =>
          page.name.toLowerCase().includes(query) ||
          page.section.toLowerCase().includes(query),
      )
      .slice(0, 8);

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery, accessiblePages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = (path) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(path);
  };

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
    setNotificationOpen(false);
  };

  const toggleNotification = () => {
    setNotificationOpen(!notificationOpen);
    setDropdownOpen(false);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      purple: "bg-purple-100 text-purple-600",
      gray: "bg-gray-100 text-gray-600",
    };
    return colors[color] || colors.blue;
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
            {}
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

        <div
          className="hidden lg:block flex-1 max-w-2xl mx-4 relative"
          ref={searchRef}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search for pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() =>
                searchQuery.trim() !== "" && setShowSearchResults(true)
              }
              className="w-full pl-10 py-2 text-sm border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-search"></i>
            </button>

            {showSearchResults && (
              <div
                className="absolute scrollbar-none  left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50 animate-fadeIn"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result, index) => (
                      <div key={index}>
                        <button
                          onClick={() => handleSearchSelect(result.path)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-3 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <i
                              className={`${result.icon || "fa-solid fa-file"} text-sm text-gray-600 group-hover:text-primary/70`}
                            ></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-primary">
                              {result.name}
                            </p>
                            <p className="text-xs text-gray-500 group-hover:text-primary/70 flex items-center">
                              <i className="fa-regular fa-folder-open mr-1 text-[10px]"></i>
                              {result.section}
                            </p>
                          </div>
                          <i className="fa-solid fa-arrow-right text-xs text-gray-400  transition-opacity"></i>
                        </button>
                        {index < searchResults.length - 1 && (
                          <div className="border-t border-gray-100 mx-4"></div>
                        )}
                      </div>
                    ))}

                    {searchResults.length === 8 && (
                      <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <span>
                          <i className="fa-solid fa-magnifying-glass mr-1"></i>
                          Showing top 8 results
                        </span>
                        <span className="text-gray-400">
                          Refine search for more
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">
                    <i className="fa-solid fa-file-circle-exclamation text-2xl mb-2 text-gray-300"></i>
                    <p>No pages found matching</p>
                    <p className="font-medium text-gray-700">"{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end flex-1 space-x-3 md:space-x-6">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={toggleNotification}
            className="relative transition-colors rounded-full bg-white h-8 w-8 md:h-11 md:w-11 flex items-center justify-center hover:bg-gray-50"
          >
            <i className="text-lg md:text-xl text-primary fa-regular fa-bell"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 text-[10px] md:text-xs font-semibold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/70 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${getNotificationColor(notification.color)}`}
                        >
                          <i className={`${notification.icon} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-800">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <i className="fa-regular fa-bell-slash text-3xl text-gray-300 mb-2"></i>
                    <p className="text-sm text-gray-500">No notifications</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 px-4 py-2">
                <Link
                  to="/notifications"
                  onClick={() => setNotificationOpen(false)}
                  className="block text-xs text-center text-primary hover:text-primary/70 py-1"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
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
              <p className="text-sm font-semibold text-gray-800 truncate max-w-35">
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
