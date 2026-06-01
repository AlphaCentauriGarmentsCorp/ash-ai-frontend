import api from "./axios";

export const pricingSettingApi = {
  // Returns all pricing rates (grouped by `group` on the row).
  index: async () => {
    const response = await api.get("/quotation/settings/pricing");
    return response.data;
  },

  // Edit-only: keys are fixed/seeded. Payload is { value }.
  update: async (id, payload) => {
    const response = await api.put(`/quotation/settings/pricing/${id}`, payload);
    return response.data;
  },
};
