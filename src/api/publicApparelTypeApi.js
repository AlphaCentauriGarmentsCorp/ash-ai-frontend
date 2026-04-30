import api from "./axios";

export const publicApparelTypeApi = {
  index: async (params = {}) => {
    try {
      const response = await api.get("/public/apparel-type", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/public/apparel-type/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
