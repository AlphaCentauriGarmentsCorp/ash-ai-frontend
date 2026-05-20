import api from "./axios";

/**
 * Phase 4 — Reports API client.
 *
 * Two endpoints:
 *   - productionSummary({from, to, phase}) → aggregated counts + cycle times
 *   - orderTimeline(orderId) → per-stage timeline for one order
 *
 * Phase 4 uses orderTimeline to drive the Activity Log tab. Phase 6
 * dashboards will consume productionSummary.
 */
export const reportsApi = {
  /**
   * @param {object} [params]
   * @param {string} [params.from]   YYYY-MM-DD; default = 30 days ago
   * @param {string} [params.to]     YYYY-MM-DD; default = today
   * @param {"sample"|"mass"|"all"} [params.phase]  default = "all"
   */
  productionSummary: async ({ from, to, phase } = {}) => {
    const { data } = await api.get("/reports/production-summary", {
      params: { from, to, phase },
    });
    return data;
  },

  /**
   * Per-order timeline showing each stage with phase, status, durations,
   * delay/waste/reject/subcontract markers.
   */
  orderTimeline: async (orderId) => {
    const { data } = await api.get(`/orders/${orderId}/production-timeline`);
    return data;
  },
};

export default reportsApi;
