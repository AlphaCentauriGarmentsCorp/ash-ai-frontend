import api from "./axios";

export const addonCategoriesApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post(
      "/quotation/settings/addon-categories",
      payload,
    );
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/addon-categories");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(
        `/quotation/settings/addon-categories/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/addon-categories/${id}`,
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
        `/quotation/settings/addon-categories/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
