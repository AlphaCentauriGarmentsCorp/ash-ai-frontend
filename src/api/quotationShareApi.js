import api from "./axios";

export const quotationShareApi = {
  generate: async (id, payload = {}) => {
    try {
      const response = await api.post(`/quotations/${id}/share`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  index: async (id) => {
    try {
      const response = await api.get(`/quotations/${id}/share`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  revokeAll: async (id) => {
    try {
      const response = await api.delete(`/quotations/${id}/share`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  revoke: async (token) => {
    try {
      const response = await api.delete(`/quotations/share/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
