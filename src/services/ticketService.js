import { ticketsApi } from "../api/ticketsApi";

const ticketService = {
  list: (params) => ticketsApi.list(params).then((r) => r.data),
  get: (id) => ticketsApi.get(id).then((r) => r.data),
  create: (formData) => ticketsApi.create(formData).then((r) => r.data),
  update: (id, formData) => ticketsApi.update(id, formData).then((r) => r.data),
  remove: (id) => ticketsApi.remove(id).then((r) => r.data),
  fromRoles: () => ticketsApi.fromRoles().then((r) => r.data),
  toRoles: () => ticketsApi.toRoles().then((r) => r.data),
  byRole: (role) => ticketsApi.byRole(role).then((r) => r.data),
};

export default ticketService;
