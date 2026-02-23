import api from "./axios";

export const serviceTypeApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/service-type", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/service-type", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
