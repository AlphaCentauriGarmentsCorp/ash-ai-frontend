import api from "./axios";

export const printMethodApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/print-method", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/print-method", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/print-method/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/print-method/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/print-method/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
