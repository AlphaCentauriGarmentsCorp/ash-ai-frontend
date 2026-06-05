import api from "./axios";

/**
 * Phase 5-A — Role portal API client.
 *
 * Currently exposes one endpoint: the my-active resolver that every
 * portal page calls on mount.
 *
 * Response shapes:
 *   { status: "single",   assignment:  {...} }
 *   { status: "multiple", assignments: [...] }
 *   { status: "none" }
 */
export const portalApi = {
  /**
   * @param {string} role - portal role slug (cutter, printer, sewer, etc.)
   *                        Hyphens or underscores both accepted.
   */
  myActive: async (role) => {
    const { data } = await api.get(`/portal/${role}/my-active`);
    return data;
  },

  /**
   * Change 2 — the role's full "My Active Tasks" queue for the current user.
   * Returns { count, tasks: [...] } sorted FIFO with Rush pinned to top.
   */
  myActiveTasks: async (role) => {
    const { data } = await api.get(`/portal/${role}/my-active-tasks`);
    return data;
  },

  /**
   * Change 3 — per-portal active-task counts for the sidebar badges, already
   * filtered to what the current user may see. Returns { counts: { role: n } }.
   */
  badgeCounts: async () => {
    const { data } = await api.get(`/portal/badge-counts`);
    return data;
  },
};

export default portalApi;