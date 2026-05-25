import api from "./axios";

export const accountApi = {
  create: async (payload) => {
    const { data } = await api.post("employee", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/employee", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  get: async (id) => {
    const response = await api.get(`/employee/${id}`);
    return response.data;
  },

  // Update uses POST + _method spoofing so multipart/form-data (profile image,
  // additional files) is sent reliably. Laravel maps this to the PUT handler.
  update: async (id, payload) => {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;

    if (isFormData) {
      payload.append("_method", "PUT");
      const { data } = await api.post(`/employee/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }

    const { data } = await api.put(`/employee/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/employee/${id}`);
    return data;
  },

  restore: async (id) => {
    const { data } = await api.patch(`/employee/${id}/restore`);
    return data;
  },
};