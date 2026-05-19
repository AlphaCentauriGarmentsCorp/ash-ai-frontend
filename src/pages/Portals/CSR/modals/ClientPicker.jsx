import React, { useEffect, useMemo, useState } from "react";
import { clientApi } from "../../../../api/clientApi";

/**
 * Phase 6-A Bundle 2 — Hybrid client picker.
 *
 * Modes:
 *   - existing: select from a dropdown of existing clients
 *                (fires onChange with { client_id, client_name, ... }
 *                pre-filled from the picked record)
 *   - new:      free-text client_name input + manual email/contact/brand
 *
 * Used by CreateInquiryModal — the "Both" decision from Bundle 2 scope.
 *
 * Props:
 *   value          { client_id, client_name, client_email, client_contact, brand_name }
 *   onChange(next) — called whenever any field changes
 *   disabled       boolean
 *   errors         { client_id?, client_name?, ... } — from 422 response
 */
const ClientPicker = ({ value, onChange, disabled = false, errors = {} }) => {
  const [mode, setMode] = useState(value?.client_id ? "existing" : "new");
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingClients(true);
    setLoadError(null);

    clientApi
      .index()
      .then((res) => {
        if (cancelled) return;
        // clientApi.index() returns either { data: [...] } or [...] depending on version
        const list = Array.isArray(res) ? res : res?.data || [];
        setClients(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err?.response?.data?.message ||
            "Failed to load clients. You can still type a new one.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingClients(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (clientId) => {
    const picked = clients.find((c) => String(c.id) === String(clientId));
    if (!picked) {
      onChange({
        ...value,
        client_id: null,
        client_name: "",
        client_email: "",
        client_contact: "",
        brand_name: "",
      });
      return;
    }
    onChange({
      ...value,
      client_id: picked.id,
      client_name: picked.name || "",
      client_email: picked.email || "",
      client_contact: picked.contact_number || "",
      brand_name: picked.brand_name || value?.brand_name || "",
    });
  };

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    // When switching to 'new', wipe client_id so it doesn't link to a stale record
    if (next === "new") {
      onChange({ ...value, client_id: null });
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 text-xs">
        <button
          type="button"
          disabled={disabled}
          onClick={() => switchMode("existing")}
          className={
            "px-3 py-1.5 rounded-md font-semibold transition-colors " +
            (mode === "existing"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200")
          }
        >
          <i className="fa-solid fa-address-book mr-1" />
          Existing Client
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => switchMode("new")}
          className={
            "px-3 py-1.5 rounded-md font-semibold transition-colors " +
            (mode === "new"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200")
          }
        >
          <i className="fa-solid fa-user-plus mr-1" />
          New Client
        </button>
      </div>

      {mode === "existing" ? (
        <>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Select Client <span className="text-red-500">*</span>
          </label>
          <select
            value={value?.client_id || ""}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={disabled || loadingClients}
            className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.client_id ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">
              {loadingClients ? "Loading…" : "— Select a client —"}
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.email ? ` (${c.email})` : ""}
              </option>
            ))}
          </select>
          {loadError && (
            <p className="text-xs text-amber-600 mt-1">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {loadError}
            </p>
          )}
          {errors.client_id && (
            <p className="text-xs text-red-600 mt-1">{errors.client_id}</p>
          )}

          {/* Show picked client's read-only details */}
          {value?.client_id && (
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 space-y-0.5">
              <div>
                <span className="font-medium">Name:</span> {value.client_name || "—"}
              </div>
              {value.client_email && (
                <div>
                  <span className="font-medium">Email:</span> {value.client_email}
                </div>
              )}
              {value.client_contact && (
                <div>
                  <span className="font-medium">Contact:</span> {value.client_contact}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* New client — free-text fields */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value?.client_name || ""}
              onChange={(e) =>
                onChange({ ...value, client_name: e.target.value })
              }
              disabled={disabled}
              placeholder="e.g. Maria Santos"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.client_name ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.client_name && (
              <p className="text-xs text-red-600 mt-1">{errors.client_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={value?.client_email || ""}
                onChange={(e) =>
                  onChange({ ...value, client_email: e.target.value })
                }
                disabled={disabled}
                placeholder="client@example.com"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.client_email ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.client_email && (
                <p className="text-xs text-red-600 mt-1">{errors.client_email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contact
              </label>
              <input
                type="text"
                value={value?.client_contact || ""}
                onChange={(e) =>
                  onChange({ ...value, client_contact: e.target.value })
                }
                disabled={disabled}
                placeholder="0917 ..."
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.client_contact ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.client_contact && (
                <p className="text-xs text-red-600 mt-1">{errors.client_contact}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientPicker;
