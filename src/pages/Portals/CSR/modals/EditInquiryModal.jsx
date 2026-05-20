import React, { useEffect, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";

/**
 * Phase 6-A Bundle 2 — Edit Inquiry modal.
 *
 * Lighter than Create — focused on status changes + adding/updating
 * communication links + internal notes. Client identity (name/email/
 * contact) is shown but not editable here; for that, edit via the
 * Clients section directly.
 *
 * Props:
 *   inquiry          {...} (required)
 *   onClose()
 *   onSaved(inquiry)
 */
const STATUS_OPTIONS = [
  { value: "new",       label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted",    label: "Quoted" },
  { value: "lost",      label: "Lost" },
  // 'converted' is intentionally excluded — converted state is set
  // server-side by the convert-to-quotation flow, not manually.
];

const EditInquiryModal = ({ inquiry, onClose, onSaved }) => {
  const [form, setForm] = useState({
    status: inquiry?.status || "new",
    messenger_link: inquiry?.messenger_link || "",
    facebook_link: inquiry?.facebook_link || "",
    gc_link: inquiry?.gc_link || "",
    product_interest: inquiry?.product_interest || "",
    internal_notes: inquiry?.internal_notes || "",
    brand_name: inquiry?.brand_name || "",
    source: inquiry?.source || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Sync if the inquiry prop changes underneath
  useEffect(() => {
    setForm({
      status: inquiry?.status || "new",
      messenger_link: inquiry?.messenger_link || "",
      facebook_link: inquiry?.facebook_link || "",
      gc_link: inquiry?.gc_link || "",
      product_interest: inquiry?.product_interest || "",
      internal_notes: inquiry?.internal_notes || "",
      brand_name: inquiry?.brand_name || "",
      source: inquiry?.source || "",
    });
  }, [inquiry?.id]);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== "" && v !== null),
      );
      const res = await csrPortalApi.updateInquiry(inquiry.id, payload);
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
        setGeneralError(data?.message || "Failed to update inquiry. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!inquiry) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Edit Inquiry</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              {inquiry.inquiry_code}
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

        {/* Client info (read-only) */}
        <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 mb-4">
          <div className="font-medium text-gray-900">{inquiry.client_name}</div>
          {inquiry.client_email && <div>{inquiry.client_email}</div>}
          {inquiry.client_contact && <div>{inquiry.client_contact}</div>}
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              disabled={submitting || inquiry.status === "converted"}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.status ? "border-red-300" : "border-gray-300"
              }`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
              {inquiry.status === "converted" && (
                <option value="converted">Converted (read-only)</option>
              )}
            </select>
            {inquiry.status === "converted" && (
              <p className="text-xs text-gray-500 mt-1">
                <i className="fa-solid fa-lock mr-1" />
                This inquiry has been converted to a quotation. Status is locked.
              </p>
            )}
            {errors.status && (
              <p className="text-xs text-red-600 mt-1">{errors.status}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={form.brand_name}
                onChange={(e) => update("brand_name", e.target.value)}
                disabled={submitting}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.brand_name ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => update("source", e.target.value)}
                disabled={submitting}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.source ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LinkField
              label="Messenger"
              value={form.messenger_link}
              onChange={(v) => update("messenger_link", v)}
              disabled={submitting}
              error={errors.messenger_link}
            />
            <LinkField
              label="Facebook"
              value={form.facebook_link}
              onChange={(v) => update("facebook_link", v)}
              disabled={submitting}
              error={errors.facebook_link}
            />
            <LinkField
              label="GC"
              value={form.gc_link}
              onChange={(v) => update("gc_link", v)}
              disabled={submitting}
              error={errors.gc_link}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product Interest
            </label>
            <textarea
              rows={2}
              value={form.product_interest}
              onChange={(e) => update("product_interest", e.target.value)}
              disabled={submitting}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.product_interest ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={form.internal_notes}
              onChange={(e) => update("internal_notes", e.target.value)}
              disabled={submitting}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.internal_notes ? "border-red-300" : "border-gray-300"
              }`}
            />
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
                Saving…
              </>
            ) : (
              "Save Changes"
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

export default EditInquiryModal;
