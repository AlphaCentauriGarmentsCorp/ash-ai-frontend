import api from "./axios";

export const equipmentInventoryApi = {
  create: async (payload) => {
    const { data } = await api.post("/equipment-inventory", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/equipment-inventory");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByLocation: async (id) => {
    try {
      const response = await api.get(`/equipment-inventory/${id}/contents`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/equipment-inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    console.log(payload);
    const formData = new FormData();

    Object.keys(payload).forEach((key) => {
      const value = payload[key];

      if (Array.isArray(value)) {
        value.forEach((file) => {
          formData.append(`${key}[]`, file);
        });
      } else {
        formData.append(key, value);
      }
    });
    console.log(formData);
    const response = await api.post(
      `/equipment-inventory/${id}?_method=PUT`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/equipment-inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
