import React, { useState } from "react";
import { logisticsPortalApi } from "../../../../api/logisticsPortalApi";

/**
 * Phase 5-I — Section 3B: In-house driver shipment form.
 *
 *   A. Delivery Details (driver, vehicle, departure, addresses)
 *   B. Gas Receipt (optional)
 *   C. Proof of Delivery (required)
 */
const InHouseShipmentForm = ({ shipment, onChanged }) => {
  const [form, setForm] = useState({
    driver_name:           shipment.driver_name ?? "",
    driver_vehicle_plate:  shipment.driver_vehicle_plate ?? "",
    departure_time:        shipment.departure_time ?? "",
    pickup_address:        shipment.pickup_address ?? "",
    dropoff_address:       shipment.dropoff_address ?? "",
    contact_person_name:   shipment.contact_person_name ?? "",
    contact_person_number: shipment.contact_person_number ?? "",
    instructions:          shipment.instructions ?? "",
    gas_amount:            shipment.gas_amount ?? "",
    gas_date:              shipment.gas_date ?? "",
    gas_notes:             shipment.gas_notes ?? "",
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
      if (payload.gas_amount) payload.gas_amount = Number(payload.gas_amount);

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
        <i className="fa-solid fa-user-tie text-gray-500" />
        Company Driver (In-House)
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Gamitin kapag in-house driver ang magdedeliver.
      </p>

      {/* A. Delivery Details */}
      <SubHeading>A. Delivery Details</SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field label="Driver Name">
          <input
            type="text" maxLength={120}
            value={form.driver_name}
            onChange={(e) => setField("driver_name", e.target.value)}
            placeholder="Mario Santos"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Vehicle / Plate No.">
          <input
            type="text" maxLength={32}
            value={form.driver_vehicle_plate}
            onChange={(e) => setField("driver_vehicle_plate", e.target.value)}
            placeholder="NAB 1234"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Departure Date & Time">
          <input
            type="datetime-local"
            value={form.departure_time ? form.departure_time.replace(" ", "T").slice(0, 16) : ""}
            onChange={(e) => setField("departure_time", e.target.value.replace("T", " "))}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Pickup Address">
          <textarea
            rows={2} maxLength={500}
            value={form.pickup_address}
            onChange={(e) => setField("pickup_address", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Drop-off Address (Subcontract)">
          <textarea
            rows={2} maxLength={500}
            value={form.dropoff_address}
            onChange={(e) => setField("dropoff_address", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Contact Person">
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
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
      </div>
      <Field label="Notes / Instructions">
        <textarea
          rows={2} maxLength={1000}
          value={form.instructions}
          onChange={(e) => setField("instructions", e.target.value)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
        />
      </Field>

      {/* B. Gas Receipt */}
      <SubHeading className="mt-4">B. Gas Receipt (Optional)</SubHeading>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        <Field label="Amount (₱)">
          <input
            type="number" step="0.01" min="0"
            value={form.gas_amount}
            onChange={(e) => setField("gas_amount", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Gas Date">
          <input
            type="date"
            value={form.gas_date || ""}
            onChange={(e) => setField("gas_date", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
        <Field label="Notes (optional)">
          <input
            type="text" maxLength={500}
            value={form.gas_notes}
            onChange={(e) => setField("gas_notes", e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </Field>
      </div>
      <ProofUploader
        label="Gas Receipt Photo"
        existingUrl={shipment.gas_receipt_url}
        existingPath={shipment.gas_receipt_path}
        shipmentId={shipment.id}
        kind="gas_receipt"
        onChanged={onChanged}
      />

      {/* C. Proof of Delivery */}
      <SubHeading className="mt-4">C. Proof of Delivery</SubHeading>
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
        label="Delivery Photo (merchandise at location)"
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
          {saving ? "Saving…" : "Save Delivery Details"}
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
        <a
          href={existingUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-primary hover:underline block mb-2"
        >
          <i className="fa-solid fa-paperclip mr-1" />
          View current file
        </a>
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

export default InHouseShipmentForm;
