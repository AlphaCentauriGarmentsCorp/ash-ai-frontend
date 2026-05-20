import React, { useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import ClientPicker from "./ClientPicker";

/**
 * Phase 6-A Bundle 2 — Create Inquiry modal.
 *
 * Props:
 *   onClose()       — close without saving
 *   onSaved(inquiry) — fired with the newly created inquiry on 201
 *
 * Form fields:
 *   - Client (ClientPicker — existing dropdown OR new)
 *   - Brand name (optional, free text)
 *   - Source (FB / TikTok / Walk-in / Referral / Repeat / Other)
 *   - Messenger / FB / GC links (optional)
 *   - Product interest (textarea)
 *   - Internal notes (textarea, hidden from client)
 *
 * Backend POST /csr/inquiries auto-generates inquiry_code (INQ-YYYY-NNNNNN)
 * and sets status='new'.
 */
const SOURCES = ["FB", "TikTok", "Walk-in", "Referral", "Repeat", "Other"];

const CreateInquiryModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    client_id: null,
    client_name: "",
    client_email: "",
    client_contact: "",
    brand_name: "",
    source: "",
    messenger_link: "",
    facebook_link: "",
    gc_link: "",
    product_interest: "",
    internal_notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const updateField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateClient = (next) => setForm((f) => ({ ...f, ...next }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    if (!form.client_name?.trim()) {
      setErrors({ client_name: "Client name is required." });
      setSubmitting(false);
      return;
    }

    try {
      // Strip empty strings so backend treats them as 'not provided'
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== "" && v !== null),
      );
      const res = await csrPortalApi.createInquiry(payload);
      onSaved?.(res?.data ?? res);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 422 && data?.errors) {
        const flat = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(flat);
        setGeneralError(data.message || "Validation failed.");
      } else {
        setGeneralError(data?.message || "Failed to create inquiry. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">New Inquiry</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Capture details for a fresh lead — convertable to a quotation later.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        <div className="space-y-4">
          <ClientPicker
            value={form}
            onChange={updateClient}
            disabled={submitting}
            errors={errors}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={form.brand_name}
                onChange={(e) => updateField("brand_name", e.target.value)}
                disabled={submitting}
                placeholder="e.g. Sorbetes"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.brand_name ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.brand_name && (
                <p className="text-xs text-red-600 mt-1">{errors.brand_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={form.source}
                onChange={(e) => updateField("source", e.target.value)}
                disabled={submitting}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.source ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">— Where did the lead come from? —</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="text-xs text-red-600 mt-1">{errors.source}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LinkField
              label="Messenger Link"
              value={form.messenger_link}
              onChange={(v) => updateField("messenger_link", v)}
              disabled={submitting}
              error={errors.messenger_link}
            />
            <LinkField
              label="Facebook Link"
              value={form.facebook_link}
              onChange={(v) => updateField("facebook_link", v)}
              disabled={submitting}
              error={errors.facebook_link}
            />
            <LinkField
              label="GC Link"
              value={form.gc_link}
              onChange={(v) => updateField("gc_link", v)}
              disabled={submitting}
              error={errors.gc_link}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product Interest
            </label>
            <textarea
              rows={3}
              value={form.product_interest}
              onChange={(e) => updateField("product_interest", e.target.value)}
              disabled={submitting}
              placeholder="e.g. 50 pcs polo shirts, black, 280 GSM"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.product_interest ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.product_interest && (
              <p className="text-xs text-red-600 mt-1">{errors.product_interest}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Internal Notes <span className="text-gray-400 font-normal">(only CSR can see)</span>
            </label>
            <textarea
              rows={2}
              value={form.internal_notes}
              onChange={(e) => updateField("internal_notes", e.target.value)}
              disabled={submitting}
              placeholder="e.g. Client is in a rush, wants 1 week TAT"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.internal_notes ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.internal_notes && (
              <p className="text-xs text-red-600 mt-1">{errors.internal_notes}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Creating…
              </>
            ) : (
              "Create Inquiry"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const LinkField = ({ label, value, onChange, disabled, error }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="https://…"
      className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
        error ? "border-red-300" : "border-gray-300"
      }`}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export default CreateInquiryModal;
