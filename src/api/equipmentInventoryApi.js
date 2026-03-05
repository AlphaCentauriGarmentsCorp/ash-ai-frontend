import api from "./axios";

export const equipmentInventoryApi = {
  create: async (payload) => {
    console.log("Payload to submit:", payload);
    const { data } = await api.post("/equipment-inventory", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/equipment-inventory");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByLocation: async (id) => {
    try {
      const response = await api.get(`/equipment-inventory/${id}/contents`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/equipment-inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/equipment-inventory/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/equipment-inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
