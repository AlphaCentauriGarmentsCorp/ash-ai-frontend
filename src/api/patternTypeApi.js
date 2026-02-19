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
};
