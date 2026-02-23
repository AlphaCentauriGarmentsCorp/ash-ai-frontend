import api from "./axios";

export const apparelTypeApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/apparel-type", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/apparel-type", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
