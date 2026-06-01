import api from "./axios";

export const specialPrintApi = {
  create: async (payload) => {
    const { data } = await api.post("/special-print", payload);
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/special-print", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/special-print/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/special-print/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/special-print/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
