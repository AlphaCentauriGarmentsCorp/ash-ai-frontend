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