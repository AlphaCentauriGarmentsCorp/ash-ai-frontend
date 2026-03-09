import api from "./axios";

export const equipmentLocationApi = {
  create: async (payload) => {
    const { data } = await api.post("/equipment-location", payload);
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/equipment-location");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/equipment-location/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/equipment-location/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/equipment-location/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
