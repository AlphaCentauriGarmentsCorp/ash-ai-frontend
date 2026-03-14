import api from "./axios";

export const graphicDesignApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/graphic-design", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
