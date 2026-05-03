import api from "./axios";

const base = "/tickets";

export const ticketsApi = {
  list: (params) => api.get(base, { params }),
  get: (id) => api.get(`${base}/${id}`),
  create: (formData) =>
    api.post(base, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.post(`${base}/${id}?_method=PUT`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`${base}/${id}`),
  fromRoles: () => api.get(`${base}/from-roles`),
  toRoles: () => api.get(`${base}/to-roles`),
  byRole: (role) => api.get(`${base}/by-role/${role}`),
};

export default ticketsApi;
