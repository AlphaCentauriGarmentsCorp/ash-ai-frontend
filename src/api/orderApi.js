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

  getOrder: async (po_code) => {
    try {
      const response = await api.get(`/orders/details/${po_code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};