import api from "./axios";

/**
 * Phase 6-A — CSR Hub portal API client.
 *
 * Mirrors the backend route group at /api/v2/csr/* (gated by
 * permission:portal.csr, with verify additionally on
 * permission:action.verify-payment after the BUG-017 route refactor).
 *
 * Endpoint inventory (16):
 *   GET    /csr/dashboard
 *   GET    /csr/activity-log
 *   GET    /csr/inquiries
 *   POST   /csr/inquiries
 *   PUT    /csr/inquiries/{id}
 *   POST   /csr/inquiries/{id}/convert-to-quotation
 *   GET    /csr/payments
 *   POST   /csr/payments              (multipart)
 *   PATCH  /csr/payments/{id}/verify
 *   GET    /csr/approvals
 *   POST   /csr/approvals             (multipart)
 *   PATCH  /csr/approvals/{id}/respond (multipart)
 *   GET    /csr/fabric-swatches
 *   POST   /csr/fabric-swatches       (multipart)
 *   PUT    /csr/fabric-swatches/{id}  (multipart)
 *   DELETE /csr/fabric-swatches/{id}
 */
export const csrPortalApi = {
  // ── Dashboard ────────────────────────────────────────────────────

  dashboard: async () => {
    const { data } = await api.get("/csr/dashboard");
    return data;
  },

  activityLog: async (filters = {}) => {
    const { data } = await api.get("/csr/activity-log", { params: filters });
    return data;
  },

  // ── Inquiries ────────────────────────────────────────────────────

  listInquiries: async (filters = {}) => {
    const { data } = await api.get("/csr/inquiries", { params: filters });
    return data;
  },

  createInquiry: async (payload) => {
    const { data } = await api.post("/csr/inquiries", payload);
    return data;
  },

  updateInquiry: async (id, payload) => {
    const { data } = await api.put(`/csr/inquiries/${id}`, payload);
    return data;
  },

  convertInquiryToQuotation: async (id) => {
    // Returns 200 + { data: { inquiry, quotation } } on success.
    // Returns 409 + { quotation_id, message } if already converted.
    // Caller is expected to handle the 409 idempotency case explicitly.
    const { data } = await api.post(`/csr/inquiries/${id}/convert-to-quotation`);
    return data;
  },

  // ── Order Payments ───────────────────────────────────────────────

  listPayments: async (filters = {}) => {
    const { data } = await api.get("/csr/payments", { params: filters });
    return data;
  },

  /**
   * Upload payment proof.
   *
   * Required: order_id, payment_type, amount.
   * Optional: payment_method_id, reference_number, notes, proof (File).
   *
   * When a proof file is included, the resulting payment status is
   * 'for_verification'. Without a proof file, status stays 'waiting'.
   */
  uploadPayment: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, v);
    });
    const { data } = await api.post("/csr/payments", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /**
   * Finance verifies a payment.
   *
   * decision: 'verified' | 'rejected'
   * rejectionReason: required when decision === 'rejected'.
   *
   * Caller must have action.verify-payment permission.
   */
  verifyPayment: async (id, decision, rejectionReason = null) => {
    const body = { decision };
    if (decision === "rejected") body.rejection_reason = rejectionReason;
    const { data } = await api.patch(`/csr/payments/${id}/verify`, body);
    return data;
  },

  // ── Client Approvals ─────────────────────────────────────────────

  listApprovals: async (filters = {}) => {
    const { data } = await api.get("/csr/approvals", { params: filters });
    return data;
  },

  recordApproval: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, v);
    });
    const { data } = await api.post("/csr/approvals", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  respondToApproval: async (id, payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, v);
    });
    const { data } = await api.patch(`/csr/approvals/${id}/respond`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ── Fabric Swatches (Phase 6-B) ──────────────────────────────────

  listSwatches: async (filters = {}) => {
    const { data } = await api.get("/csr/fabric-swatches", { params: filters });
    return data;
  },

  createSwatch: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, v);
    });
    const { data } = await api.post("/csr/fabric-swatches", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  updateSwatch: async (id, payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") form.append(k, v);
    });
    // Laravel requires this trick for multipart PUT
    form.append("_method", "PUT");
    const { data } = await api.post(`/csr/fabric-swatches/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteSwatch: async (id) => {
    const { data } = await api.delete(`/csr/fabric-swatches/${id}`);
    return data;
  },

  // Issue 4 follow-on — record a "pick" so popular colours float to the top
  // of the swatch picker. Fire-and-forget from the caller.
  incrementSwatchPick: async (id) => {
    const { data } = await api.post(`/csr/fabric-swatches/${id}/pick`);
    return data;
  },
};
