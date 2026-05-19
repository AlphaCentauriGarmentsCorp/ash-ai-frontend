import React, { useCallback, useEffect, useState } from "react";
import { csrPortalApi } from "../../../api/csrPortalApi";
import KpiOverviewCards from "./sections/KpiOverviewCards";
import TasksAndAlertsPanel from "./sections/TasksAndAlertsPanel";
import RecentActivityPanel from "./sections/RecentActivityPanel";
import MyInquiriesList from "./sections/MyInquiriesList";
import MyOrdersList from "./sections/MyOrdersList";

/**
 * Phase 6-A — CSR Dashboard tab.
 *
 * Composes 5 sections from a single backend payload:
 *   GET /api/v2/csr/dashboard → {
 *     kpis, tasks_and_alerts, recent_activity, my_inquiries, my_orders
 *   }
 *
 * Refresh strategy: on mount only + manual refresh button. No
 * auto-polling (per Phase 6-A frontend bundle 1 decision).
 *
 * Loading model: a single `loading` flag controls all 5 panels.
 * Each panel renders skeleton placeholders while loading is true.
 */
const DashboardTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await csrPortalApi.dashboard();
      setData(res.data);
      setRefreshedAt(new Date());
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load dashboard.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <i className="fa-solid fa-circle-exclamation text-red-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900">Dashboard failed to load</p>
          <p className="text-xs text-red-700 mt-0.5">{error}</p>
          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-gray-500">
          {refreshedAt ? (
            <>
              Last updated{" "}
              <span className="font-medium text-gray-700">
                {refreshedAt.toLocaleTimeString()}
              </span>
            </>
          ) : (
            "Loading…"
          )}
        </div>
        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI overview — full width */}
      <KpiOverviewCards kpis={data?.kpis || {}} loading={loading} />

      {/* Two-column grid below — left: tasks + my inquiries; right: activity + my orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <TasksAndAlertsPanel items={data?.tasks_and_alerts || []} loading={loading} />
          <MyInquiriesList items={data?.my_inquiries || []} loading={loading} />
        </div>
        <div className="space-y-4">
          <RecentActivityPanel items={data?.recent_activity || []} loading={loading} />
          <MyOrdersList items={data?.my_orders || []} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
