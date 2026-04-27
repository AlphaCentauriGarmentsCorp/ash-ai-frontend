import api from "./axios";

export const roleApi = {
  create: async (payload) => {
    const { data } = await api.post("/rbac/roles", payload);
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/rbac/roles", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/rbac/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/rbac/roles/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/rbac/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
