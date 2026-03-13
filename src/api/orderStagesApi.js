import api from "./axios";

export const orderStagesApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/order-stages", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
