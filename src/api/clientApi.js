import api from "./axios";

export const clientApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/v2/clients/store", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/v2/clients", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
