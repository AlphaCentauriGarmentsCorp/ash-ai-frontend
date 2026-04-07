import api from "./axios";

export const patternTypeApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/pattern-type", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/pattern-type", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/pattern-type/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const headers = payload instanceof FormData 
        ? { "Content-Type": "multipart/form-data" }
        : {};
      const response = await api.put(`/pattern-type/${id}`, payload, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/pattern-type/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
