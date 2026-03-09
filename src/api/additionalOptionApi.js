import api from "./axios";

export const additionalOptionApi = {
  create: async (payload) => {
    const { data } = await api.post("/additional-option", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/additional-option", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
