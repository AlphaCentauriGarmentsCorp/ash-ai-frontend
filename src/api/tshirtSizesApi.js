import api from "./axios";

export const tshirtSizesApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post(
      "/quotation/settings/tshirt-sizes",
      payload,
    );
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/tshirt-sizes");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/tshirt-sizes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/tshirt-sizes/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(
        `/quotation/settings/tshirt-sizes/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
