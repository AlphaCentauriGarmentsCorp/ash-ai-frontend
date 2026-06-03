import api from "./axios";

/**
 * Dashboard Pending Approvals API (Change 1B).
 *
 * Mirrors backend DashboardApprovalsController under
 * /v2/dashboard/pending-approvals. All endpoints require the
 * action.verify-payment permission (Finance / Superadmin / Admin); a 403
 * from list() is the signal to hide the widget for everyone else.
 */
export const pendingApprovalsApi = {
  /** Result: { data: [row, ...], count } */
  list: async () => {
    const { data } = await api.get("/dashboard/pending-approvals");
    return data;
  },

  /** One-click approve → verifies payment + advances the gate. */
  approve: async (paymentId) => {
    const { data } = await api.post(
      `/dashboard/pending-approvals/${paymentId}/approve`,
    );
    return data;
  },

  /** Reject with a required reason. */
  reject: async (paymentId, reason) => {
    const { data } = await api.post(
      `/dashboard/pending-approvals/${paymentId}/reject`,
      { reason },
    );
    return data;
  },

  /** Put the gate stage on hold (optional reason). */
  hold: async (paymentId, reason) => {
    const { data } = await api.post(
      `/dashboard/pending-approvals/${paymentId}/hold`,
      { reason },
    );
    return data;
  },
};

export default pendingApprovalsApi;
