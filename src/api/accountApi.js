import api from "./axios";

export const accountApi = {
  create: async (payload) => {
    const { data } = await api.post("employee", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/employee", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
