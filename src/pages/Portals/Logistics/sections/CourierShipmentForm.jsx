import React, { useState } from "react";
import { logisticsPortalApi } from "../../../../api/logisticsPortalApi";

/**
 * Phase 5-I — Section 3A: Courier shipment form.
 *
 * Handles the "Ship via Courier / Lalamove / Other Platform" flow:
 *   A. Waybill / Shipping details
 *   B. Proof of payment (required)
 *   C. Proof of pickup (required)
 *   D. Proof of delivery (required)
 */
const CourierShipmentForm = ({
  shipment,
  courierOptions = [],
  shippingMethodOptions = [],
  onChanged,
}) => {
  const [form, setForm] = useState({
    courier_id:            shipment.courier_id ?? "",
    shipping_method_id:    shipment.shipping_method_id ?? "",
    waybill_number:        shipment.waybill_number ?? "",
    pickup_address:        shipment.pickup_address ?? "",
    dropoff_address:       shipment.dropoff_address ?? "",
    contact_person_name:   shipment.contact_person_name ?? "",
    contact_person_number: shipment.contact_person_number ?? "",
    instructions:          shipment.instructions ?? "",
    booking_time:          shipment.booking_time ?? "",
    payment_amount:        shipment.payment_amount ?? "",
    payment_method:        shipment.payment_method ?? "",
    payment_reference:     shipment.payment_reference ?? "",
    receiver_name:         shipment.receiver_name ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {};
      for (const k of Object.keys(form)) {
        if (form[k] !== "" && form[k] !== null && form[k] !== undefined) {
          payload[k] = form[k];
        }
      }
      // Normalize numeric / id fields
      if (payload.courier_id)         payload.courier_id = Number(payload.courier_id);
      if (payload.shipping_method_id) payload.shipping_method_id = Number(payload.shipping_method_id);
      if (payload.payment_amount)     payload.payment_amount = Number(payload.payment_amount);

      await logisticsPortalApi.updateShipment(shipment.id, payload);
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Hindi na-save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-truck text-gray-500" />
        Ship via Courier / Platform
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Gamitin kapag magpapadala sa pamamagitan ng courier o delivery app.
      </p>

      {/* A. Waybill / Shipping Details */}
      <SubHeading>A. Waybill / Shipping Details</SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Courier">
          <select
            value={form.courier_id}
            onChange={(e) => setField("courier_id", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          >
            <option value="">— Pumili —</option>
            {courierOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Service Type">
          <select
            value={form.shipping_method_id}
            onChange={(e) => setField("shipping_method_id", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          >
            <option value="">— Pumili —</option>
            {shippingMethodOptions
              .filter((m) =>
                !form.courier_id || String(m.courier_id) === String(form.courier_id),
              )
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.courier ? ` (${m.courier})` : ""}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Waybill / Tracking No.">
          <input
            type="text" maxLength={64}
            value={form.waybill_number}
            onChange={(e) => setField("waybill_number", e.target.value)}
            placeholder="LM1234567890"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Booking Time">
          <input
            type="datetime-local"
            value={form.booking_time ? form.booking_time.replace(" ", "T").slice(0, 16) : ""}
            onChange={(e) => setField("booking_time", e.target.value.replace("T", " "))}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Pickup Address">
          <textarea
            rows={2} maxLength={500}
            value={form.pickup_address}
            onChange={(e) => setField("pickup_address", e.target.value)}
            placeholder="ASH Apparel Warehouse, ..."
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Drop-off Address (Subcontract)">
          <textarea
            rows={2} maxLength={500}
            value={form.dropoff_address}
            onChange={(e) => setField("dropoff_address", e.target.value)}
            placeholder="Vendor address..."
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Contact Person Name">
          <input
            type="text" maxLength={120}
            value={form.contact_person_name}
            onChange={(e) => setField("contact_person_name", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Contact Number">
          <input
            type="text" maxLength={32}
            value={form.contact_person_number}
            onChange={(e) => setField("contact_person_number", e.target.value)}
            placeholder="0917 123 4567"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
      </div>
      <Field label="Instructions / Notes">
        <textarea
          rows={2} maxLength={1000}
          value={form.instructions}
          onChange={(e) => setField("instructions", e.target.value)}
          placeholder="Please handle with care. Call upon arrival."
          className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
        />
      </Field>

      {/* B. Proof of Payment */}
      <SubHeading className="mt-4">B. Proof of Payment</SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        <Field label="Payment Amount (₱)">
          <input
            type="number" step="0.01" min="0"
            value={form.payment_amount}
            onChange={(e) => setField("payment_amount", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Payment Method">
          <input
            type="text" maxLength={32}
            value={form.payment_method}
            onChange={(e) => setField("payment_method", e.target.value)}
            placeholder="GCash, Cash, Card"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Payment Reference / Booking ID">
          <input
            type="text" maxLength={120}
            value={form.payment_reference}
            onChange={(e) => setField("payment_reference", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
      </div>
      <ProofUploader
        label="Payment Screenshot / Receipt"
        existingUrl={shipment.payment_proof_url}
        existingPath={shipment.payment_proof_path}
        shipmentId={shipment.id}
        kind="payment"
        onChanged={onChanged}
      />

      {/* C. Proof of Pickup */}
      <SubHeading className="mt-4">C. Proof of Pickup</SubHeading>
      <ProofUploader
        label="Pickup Confirmation"
        existingUrl={shipment.pickup_proof_url}
        existingPath={shipment.pickup_proof_path}
        shipmentId={shipment.id}
        kind="pickup"
        onChanged={onChanged}
      />

      {/* D. Proof of Delivery */}
      <SubHeading className="mt-4">D. Proof of Delivery</SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        <Field label="Receiver Name">
          <input
            type="text" maxLength={120}
            value={form.receiver_name}
            onChange={(e) => setField("receiver_name", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
      </div>
      <ProofUploader
        label="Delivery Confirmation Photo"
        existingUrl={shipment.delivery_proof_url}
        existingPath={shipment.delivery_proof_path}
        shipmentId={shipment.id}
        kind="delivery"
        onChanged={onChanged}
      />
      <ProofUploader
        label="Receiver Signature (optional)"
        existingUrl={shipment.receiver_signature_url}
        existingPath={shipment.receiver_signature_path}
        shipmentId={shipment.id}
        kind="signature"
        onChanged={onChanged}
      />

      {error && (
        <p className="text-[11px] text-red-600 mt-3">{error}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white text-xs px-4 py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Shipment Details"}
        </button>
      </div>
    </section>
  );
};

const SubHeading = ({ children, className = "" }) => (
  <h3 className={`text-xs font-semibold text-primary mb-2 ${className}`}>
    {children}
  </h3>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const ProofUploader = ({ label, existingUrl, existingPath, shipmentId, kind, onChanged }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await logisticsPortalApi.uploadProof(shipmentId, kind, file);
      setFile(null);
      const input = document.getElementById(`proof-${kind}-${shipmentId}`);
      if (input) input.value = "";
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Hindi na-upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      {existingUrl ? (
        <div className="mb-2">
          <a
            href={existingUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-primary hover:underline"
          >
            <i className="fa-solid fa-paperclip mr-1" />
            View current file
          </a>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400 italic mb-2">No file uploaded yet.</p>
      )}
      <div className="flex items-center gap-2">
        <input
          id={`proof-${kind}-${shipmentId}`}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.heic"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-[11px] flex-1"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-primary text-white text-[11px] px-2.5 py-1.5 rounded hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default CourierShipmentForm;
