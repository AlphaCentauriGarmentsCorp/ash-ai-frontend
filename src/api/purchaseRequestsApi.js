import api from "./axios";

/**
 * Phase 3 — Purchase Requests API client.
 *
 * Mirrors backend PurchaseRequestsController endpoints under
 * /v2/purchase-requests. Most PRs are auto-spawned by MR approval
 * when stock is short; this module also exposes the lifecycle
 * transitions (approve / mark-ordered / mark-received / cancel)
 * and an ad-hoc create endpoint.
 */
export const purchaseRequestsApi = {
  /**
   * Paginated list of PRs.
   *
   * @param {object} params
   * @param {string} [params.status]      pending | approved | ordered | received | cancelled
   * @param {number} [params.orderId]     filter by order
   * @param {number} [params.supplierId]  filter by supplier
   * @param {number} [params.page]
   * @param {number} [params.perPage]
   */
  list: async ({ status, orderId, supplierId, page = 1, perPage = 20 } = {}) => {
    const { data } = await api.get("/purchase-requests", {
      params: {
        status,
        order_id: orderId,
        supplier_id: supplierId,
        page,
        per_page: perPage,
      },
    });
    return data;
  },

  show: async (id) => {
    const { data } = await api.get(`/purchase-requests/${id}`);
    return data;
  },

  /**
   * Ad-hoc PR creation (manager / purchasing initiates without an MR).
   *
   * @param {object} payload
   * @param {number} payload.order_id
   * @param {number} [payload.supplier_id]
   * @param {string} [payload.reason]
   * @param {Array<{material_id:number, quantity:number, unit_price?:number, notes?:string}>} payload.items
   */
  create: async (payload) => {
    const { data } = await api.post("/purchase-requests", payload);
    return data;
  },

  approve: async (id) => {
    const { data } = await api.post(`/purchase-requests/${id}/approve`);
    return data;
  },

  markOrdered: async (id) => {
    const { data } = await api.post(`/purchase-requests/${id}/mark-ordered`);
    return data;
  },

  /**
   * Marks goods as received. Backend increments stock_on_hand on each
   * material in the PR's line items as a side effect of this call.
   */
  markReceived: async (id) => {
    const { data } = await api.post(`/purchase-requests/${id}/mark-received`);
    return data;
  },

  cancel: async (id) => {
    const { data } = await api.post(`/purchase-requests/${id}/cancel`);
    return data;
  },
};

export default purchaseRequestsApi;
