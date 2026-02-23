import api from "./axios";

export const printMethodApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/print-method", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/print-method", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
