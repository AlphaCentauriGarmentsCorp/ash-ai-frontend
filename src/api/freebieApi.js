import api from "./axios";

export const freebieApi = {
  create: async (payload) => {
    const { data } = await api.post("/freebie", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/freebie", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
