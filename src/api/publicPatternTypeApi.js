import api from "./axios";

export const publicPatternTypeApi = {
  index: async (params = {}) => {
    try {
      const response = await api.get("/public/pattern-type", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/public/pattern-type/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
