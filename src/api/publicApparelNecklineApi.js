import api from "./axios";

export const publicApparelNecklineApi = {
  index: async (params = {}) => {
    try {
      const response = await api.get("/public/apparel-neckline", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/public/apparel-neckline/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
