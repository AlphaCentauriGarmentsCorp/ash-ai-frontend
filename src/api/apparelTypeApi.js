import api from "./axios";

export const apparelTypeApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/apparel-type", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/apparel-type", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/apparel-type/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/apparel-type/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/apparel-type/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
