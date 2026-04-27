import api from "./axios";

export const permissionApi = {
  create: async (payload) => {
    const { data } = await api.post("/rbac/permissions", payload);
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/rbac/permissions", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/rbac/permissions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/rbac/permissions/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/rbac/permissions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
