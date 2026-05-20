import api from "./axios";

/**
 * Phase 3 — Material Requests API client.
 *
 * Mirrors backend MaterialRequestsController endpoints under
 * /v2/material-requests.
 */
export const materialRequestsApi = {
  /**
   * Paginated list of MRs.
   *
   * @param {object} params
   * @param {string} [params.status]   pending | approved | rejected | auto_pr
   * @param {number} [params.orderId]  filter by order
   * @param {boolean} [params.mine]    only requests by the current user
   * @param {number} [params.page]
   * @param {number} [params.perPage]
   */
  list: async ({ status, orderId, mine, page = 1, perPage = 20 } = {}) => {
    const { data } = await api.get("/material-requests", {
      params: {
        status,
        order_id: orderId,
        mine: mine ? 1 : undefined,
        page,
        per_page: perPage,
      },
    });
    return data;
  },

  /**
   * Single MR with all related data (items + order + stage + requester + PR).
   */
  show: async (id) => {
    const { data } = await api.get(`/material-requests/${id}`);
    return data;
  },

  /**
   * Create a new Material Request.
   *
   * @param {object} payload
   * @param {number} payload.order_id
   * @param {string} [payload.reason]
   * @param {Array<{material_id:number, quantity_requested:number, notes?:string}>} payload.items
   */
  create: async (payload) => {
    const { data } = await api.post("/material-requests", payload);
    return data;
  },

  /**
   * Approve an MR. If stock is short, the backend auto-spawns a PR
   * and returns the MR with its purchase_request_id populated.
   */
  approve: async (id) => {
    const { data } = await api.post(`/material-requests/${id}/approve`);
    return data;
  },

  /**
   * Reject an MR. `rejection_reason` is required (min 3 chars).
   */
  reject: async (id, rejection_reason) => {
    const { data } = await api.post(`/material-requests/${id}/reject`, {
      rejection_reason,
    });
    return data;
  },
};

export default materialRequestsApi;
