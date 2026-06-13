import api from "./axios";

/**
 * Phase 5-G — Material Prep portal API client.
 *
 * Reads through portal-scoped endpoints. For PR lifecycle actions
 * (mark_ordered, mark_received, cancel) the frontend uses the existing
 * purchaseRequestsApi — they're already permission-gated and tested.
 */
export const materialPrepPortalApi = {
  // NOTE: This endpoint is /active-prs (not /my-active) to avoid collision
  // with the generic stage-based /portal/{role}/my-active wildcard route.
  myActive: async () => {
    const { data } = await api.get("/portal/material-prep/active-prs");
    return data;
  },

  context: async (purchaseRequestId) => {
    const { data } = await api.get(`/portal/material-prep/context/${purchaseRequestId}`);
    return data;
  },

  assignSupplier: async (purchaseRequestId, supplierId) => {
    const { data } = await api.patch(
      `/portal/material-prep/${purchaseRequestId}/supplier`,
      { supplier_id: supplierId }
    );
    return data;
  },

  // Issue 20 — quick-add a supplier inline from the PR picker. Saved to the
  // shared Material Suppliers table, flagged is_incomplete. Returns { data: {...} }.
  quickAddSupplier: async ({ name, channelType, channelUrl }) => {
    const { data } = await api.post("/portal/material-prep/suppliers", {
      name,
      channel_type: channelType || undefined,
      channel_url: channelUrl || undefined,
    });
    return data;
  },

  // ── Change 18: order material requirements at the Material Prep stage ──
  ordersAtStage: async () => {
    const { data } = await api.get("/portal/material-prep/orders");
    return data;
  },

  getOrderRequirements: async (orderId) => {
    const { data } = await api.get(`/portal/material-prep/order/${orderId}/requirements`);
    return data;
  },

  saveOrderRequirements: async (orderId, items) => {
    const { data } = await api.post(
      `/portal/material-prep/order/${orderId}/requirements`,
      { items }
    );
    return data;
  },
};

export default materialPrepPortalApi;