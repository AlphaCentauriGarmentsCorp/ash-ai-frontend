import api from "./axios";

/**
 * Finance Payments API — backs the dedicated Finance "Payments" page.
 *
 * These routes are gated by `action.verify-payment` (Finance / Superadmin /
 * Admin) and are separate from the CSR read-only view. Same method shape as
 * csrPortalApi's payment methods so the shared PaymentsTab + modals can take
 * either api object via a `paymentsApi` prop.
 *
 *   GET    /finance/payments
 *   POST   /finance/payments              (multipart)
 *   PATCH  /finance/payments/{id}/verify
 */
export const financePaymentsApi = {
  listPayments: async (filters = {}) => {
    const { data } = await api.get("/finance/payments", { params: filters });
    return data;
  },

  uploadPayment: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, v);
    });
    const { data } = await api.post("/finance/payments", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  verifyPayment: async (id, decision, rejectionReason = null) => {
    const body = { decision };
    if (decision === "rejected") body.rejection_reason = rejectionReason;
    const { data } = await api.patch(`/finance/payments/${id}/verify`, body);
    return data;
  },
};

export default financePaymentsApi;
