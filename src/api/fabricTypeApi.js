import api from "./axios";

/**
 * Change 7.1 — Fabric Type managed dropdown API client.
 * Mirrors serviceTypeApi (plain JSON; fabric type is a name + optional note).
 */
export const fabricTypeApi = {
  create: async (payload) => {
    const { data } = await api.post("/fabric-type", payload);
    return data;
  },

  index: async (params = {}) => {
    const response = await api.get("/fabric-type", { params });
    return response.data;
  },

  show: async (id) => {
    const response = await api.get(`/fabric-type/${id}`);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/fabric-type/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/fabric-type/${id}`);
    return response.data;
  },
};

export default fabricTypeApi;
