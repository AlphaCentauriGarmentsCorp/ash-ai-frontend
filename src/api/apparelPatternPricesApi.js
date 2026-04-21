import api from "./axios";

export const apparelPatternPricesApi = {
  create: async (payload) => {
    const { data } = await api.post(
      "/quotation/settings/apparel-pattern-prices",
      payload,
    );
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/quotation/settings/apparel-pattern-prices", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/apparel-pattern-prices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/apparel-pattern-prices/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/quotation/settings/apparel-pattern-prices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
