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
};

export default portalApi;
