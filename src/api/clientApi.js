import api from "./axios";

export const clientApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/clients", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/clients", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
