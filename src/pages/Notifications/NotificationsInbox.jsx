import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { useNotifications } from "../../hooks/useNotifications";

/**
 * Phase 2 — Notifications inbox.
 *
 * Full paginated list of all the current user's notifications. Reuses the
 * same `useNotifications` hook as the bell dropdown but in `list` mode
 * with paging.
 */

const VISUAL = {
  "stage.delayed":            { icon: "fa-solid fa-triangle-exclamation", color: "red" },
  "stage.on_hold":            { icon: "fa-solid fa-pause-circle",        color: "purple" },
  "stage.for_approval":       { icon: "fa-solid fa-hourglass-half",      color: "amber" },
  "stage.assigned":           { icon: "fa-solid fa-user-tag",            color: "blue" },
  "stage.in_progress":        { icon: "fa-solid fa-bolt",                color: "blue" },
  "order.created":            { icon: "fa-solid fa-cart-shopping",       color: "green" },
  "order.completed":          { icon: "fa-solid fa-flag-checkered",      color: "green" },
  "quotation.approved":       { icon: "fa-solid fa-thumbs-up",           color: "green" },
  "quotation.rejected":       { icon: "fa-solid fa-thumbs-down",         color: "red" },
  "material_request.created": { icon: "fa-solid fa-boxes-packing",       color: "amber" },
};

const COLOR_BG = {
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  amber:  "bg-amber-100 text-amber-700",
  red:    "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  gray:   "bg-gray-100 text-gray-700",
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
};

const NotificationsInbox = () => {
  const {
    items,
    total,
    unreadCount,
    page,
    lastPage,
    setPage,
    isLoading,
    error,
    refresh,
    markRead,
    markAllRead,
    destroy,
  } = useNotifications({ mode: "list", perPage: 20, pollInterval: 60000 });

  const handleClick = (notification) => {
    if (!notification.read_at) {
      markRead(notification.id);
    }
  };

  return (
    <AdminLayout
      pageTitle="Notifications"
      path="/notifications"
      links={[
        { label: "Home", href: "/" },
        { label: "Notifications", href: "/notifications" },
      ]}
    >
      <div className="bg-light p-3 sm:p-4 lg:p-7 rounded-lg border border-gray-200 lg:border-gray-300">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Inbox
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {total} total · <span className="text-blue-600 font-medium">{unreadCount}</span> unread
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors inline-flex items-center"
            >
              <i className={`fas fa-arrows-rotate mr-1 ${isLoading ? "fa-spin" : ""}`}></i>
              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs px-3 py-1.5 rounded bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center"
              >
                <i className="fas fa-check-double mr-1"></i>
                Mark all read
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {isLoading && items.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400">
              <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p className="text-sm">Loading…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <i className="fa-regular fa-bell-slash text-4xl text-gray-300 mb-3"></i>
              <p className="text-sm text-gray-500">No notifications yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                You'll see updates here as they happen.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((notification) => {
                const visual = VISUAL[notification.type] || { icon: "fa-solid fa-bell", color: "gray" };
                const isUnread = !notification.read_at;
                const link = notification?.data?.link;

                const Body = (
                  <div className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${COLOR_BG[visual.color] || COLOR_BG.gray}`}
                    >
                      <i className={visual.icon}></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-sm ${isUnread ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                            {notification.title}
                          </p>
                          {notification.body && (
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.body}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-2">
                            {formatDateTime(notification.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isUnread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" title="Unread"></span>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              destroy(notification.id);
                            }}
                            className="text-gray-300 hover:text-red-500 text-xs px-1"
                            title="Delete"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <li key={notification.id}>
                    {link ? (
                      <Link
                        to={link}
                        onClick={() => handleClick(notification)}
                        className="block"
                      >
                        {Body}
                      </Link>
                    ) : (
                      <div onClick={() => handleClick(notification)} className="cursor-default">
                        {Body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">
              Page <strong>{page}</strong> of {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <i className="fas fa-chevron-left mr-1"></i> Previous
              </button>
              <button
                onClick={() => setPage(Math.min(lastPage, page + 1))}
                disabled={page >= lastPage || isLoading}
                className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next <i className="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default NotificationsInbox;
