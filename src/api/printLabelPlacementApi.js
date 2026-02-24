import api from "./axios";

export const printLabelPlacementApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/print-label-placement", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/print-label-placement", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/print-label-placement/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/print-label-placement/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/print-label-placement/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
