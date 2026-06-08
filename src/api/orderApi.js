import api from "./axios";

export const orderApi = {
  delete: async (id) => {
    const { data } = await api.delete(`/orders/${id}`);
    return data;
  },

  create: async (payload) => {
    const config =
      payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;
    const { data } = await api.post("/orders", payload, config);
    return data;
  },

  /**
   * Live engine pricing for the Add Order form (Option A). Delegates server-
   * side to the shared quotation pricing engine and returns the computed
   * totals + breakdown without saving. Accepts the same payload shape as the
   * quotation preview (item_config_json / items_json / print_parts_json / ...).
   */
  preview: async (payload) => {
    const { data } = await api.post("/orders/preview", payload);
    return data;
  },

  /**
   * Edit an existing order (Issue 1). The order form ships multipart FormData
   * (files), so we method-spoof a PUT via POST — PHP only parses multipart
   * bodies on POST, and Laravel routes _method=PUT to the PUT route. JSON
   * payloads use a real PUT.
   */
  update: async (id, payload) => {
    if (payload instanceof FormData) {
      payload.append("_method", "PUT");
      const { data } = await api.post(`/orders/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }
    const { data } = await api.put(`/orders/${id}`, payload);
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/orders", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Phase 3 — lightweight picker payload for the New Material Request form.
   * Returns only orders with an active workflow stage.
   */
  withActiveStage: async () => {
    const { data } = await api.get("/orders/with-active-stage");
    return data;
  },

  getOrder: async (po_code) => {
    try {
      const response = await api.get(`/orders/details/${po_code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};