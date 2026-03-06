import api from "./axios";

export const materialsApi = {
  create: async (payload) => {
    const { data } = await api.post("/materials", payload);
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/materials");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBySupplier: async (id) => {
    try {
      const response = await api.get(`/materials/${id}/supplier`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByTypeFabric: async (type) => {
    try {
      const response = await api.get(`/materials/type/${type}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/materials/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
