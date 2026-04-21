import api from "./axios";

export const apparelNecklineApi = {
  create: async (payload) => {
    const { data } = await api.post("/quotation/settings/apparel-neckline", payload);
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/quotation/settings/apparel-neckline", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/apparel-neckline/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/quotation/settings/apparel-neckline/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/quotation/settings/apparel-neckline/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
