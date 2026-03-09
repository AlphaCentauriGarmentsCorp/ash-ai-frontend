import api from "./axios";

export const placementMeasurementApi = {
  create: async (payload) => {
    const { data } = await api.post("/placement-measurement", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/placement-measurement", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
