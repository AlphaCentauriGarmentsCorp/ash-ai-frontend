import api from "./axios";

export const orderApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/order", payload, {
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
