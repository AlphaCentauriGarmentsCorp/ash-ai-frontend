import api from "./axios";

export const clientApi = {
  create: async (formData) => {
    const fd = new FormData();

    const { data } = await api.post("/v2/clients", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
