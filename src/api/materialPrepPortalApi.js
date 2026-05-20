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
};

export default materialPrepPortalApi;
