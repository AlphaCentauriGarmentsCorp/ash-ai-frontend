import api from "./axios";

export const apparelPartsApi = {
  create: async (payload) => {
    const { data } = await api.post("/apparel-parts", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/apparel-parts", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/apparel-parts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/apparel-parts/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/apparel-parts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};