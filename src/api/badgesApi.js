import api from "./axios";

/**
 * CP-3 — consolidated badge summary.
 *
 * One call for every sidebar/dashboard count, replacing the per-poll pair of
 * /portal/badge-counts + /csr/payments/awaiting. The endpoint self-scopes each
 * field to the caller's gates and OMITS the ones they can't see:
 *
 *   {
 *     portals: { role: n, ... },     // always
 *     awaiting?: number,             // only when the user can open the CSR list
 *     pending_approvals?: number     // only for payment approvers
 *   }
 *
 * The caller always requests it and just reads whatever fields come back.
 */
export const badgesApi = {
  all: async () => {
    const { data } = await api.get("/badges");
    return data;
  },
};

export default badgesApi;
