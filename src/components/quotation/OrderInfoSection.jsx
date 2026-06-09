import React, { useEffect, useState } from "react";
import { freebieApi } from "../../api/freebieApi";
import { clientApi } from "../../api/clientApi";

/**
 * Order Information card (SHARED component) — used by both Add and Edit.
 *
 * The PARENT owns the core form state, derived values, and client handlers;
 * this component is the shared presentation. It additionally owns the
 * self-contained pieces for three Order-Info features (built ONCE here):
 *
 *   Issue 1 — Brand dropdown + "add brand on the fly" (creates a client_brands
 *             row via clientApi.addBrand, then auto-selects it).
 *   Issue 3 — Facebook quick-chat button (opens the client's FB/Messenger link).
 *   Issue 5 — Free Items as a strictly-LOCKED multi-select sourced from the
 *             freebies table (no free typing). Stored back into the existing
 *             free_items string column as a comma-joined list, so no schema
 *             change is needed.
 *
 * It renders ONLY the card; the surrounding grid + sibling Apparel card stay in
 * each page, so layout is unchanged.
 *
 * ── Props (owned by the parent page) ─────────────────────────────────────
 *   formData                 { client_name, client_email, client_facebook,
 *                              brand, shirt_color, free_items }
 *   onFieldChange(field,val) updates one formData field (parent → setOrderInfo)
 *   clientSearchTerm         controlled value of the client search input
 *   onClientSearchChange(v)  parent's handleClientSearchChange
 *   filteredClients          derived list (parent useMemo)
 *   normalizeClientBrands(c) parent helper → string[] of a client's brands
 *   onSelectClient(client)   parent's handleSelectClient
 *   selectedClientId         currently-selected client id (null = none)
 *   selectedClientBrands     derived brand list for the selected client (useMemo)
 *
 * No new props are required vs. the pre-feature version — Issues 1/3/5 are
 * self-contained (the component fetches freebies itself, manages added brands
 * internally, and derives the FB link from client_facebook).
 */
const OrderInfoSection = ({
  formData,
  hideShirtColor = false,
  onFieldChange,
  clientSearchTerm,
  onClientSearchChange,
  filteredClients,
  normalizeClientBrands,
  onSelectClient,
  selectedClientId,
  selectedClientBrands,
}) => {
  // ── Issue 5: locked freebie options ────────────────────────────────────
  const [freebies, setFreebies] = useState([]);
  const [freebiesLoading, setFreebiesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setFreebiesLoading(true);
        const res = await freebieApi.index();
        // API may return {data:[...]} or a bare array depending on resource.
        const list = Array.isArray(res) ? res : res?.data || [];
        if (active) setFreebies(list);
      } catch (e) {
        console.error("Failed to load freebies:", e);
        if (active) setFreebies([]);
      } finally {
        if (active) setFreebiesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // free_items is stored as a comma-joined string; parse to a Set for the UI.
  const selectedFreebies = (formData.free_items || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleFreebie = (name) => {
    const set = new Set(selectedFreebies);
    if (set.has(name)) set.delete(name);
    else set.add(name);
    onFieldChange("free_items", Array.from(set).join(", "));
  };

  // ── Issue 1: add a brand on the fly ─────────────────────────────────────
  const [addingBrand, setAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandError, setBrandError] = useState("");
  // Brands created during this session, merged into the dropdown so a freshly
  // added brand appears immediately without needing the parent to refetch the
  // client. Cleared when the selected client changes.
  const [extraBrands, setExtraBrands] = useState([]);

  useEffect(() => {
    setExtraBrands([]);
  }, [selectedClientId]);

  // The dropdown shows the client's brands plus any added this session (deduped).
  const brandOptions = Array.from(
    new Set([...(selectedClientBrands || []), ...extraBrands])
  );

  const handleAddBrand = async () => {
    const name = newBrand.trim();
    if (!name) return;
    if (!selectedClientId) {
      setBrandError("Select a client first.");
      return;
    }
    try {
      setBrandSaving(true);
      setBrandError("");
      await clientApi.addBrand(selectedClientId, name);
      // Merge into the local option list + auto-select it.
      setExtraBrands((prev) => Array.from(new Set([...prev, name])));
      onFieldChange("brand", name);
      setNewBrand("");
      setAddingBrand(false);
    } catch (e) {
      setBrandError(
        e?.response?.data?.message || "Could not add brand. Try again."
      );
    } finally {
      setBrandSaving(false);
    }
  };

  // ── Issue 3: Facebook quick-chat ────────────────────────────────────────
  const fbValue = (formData.client_facebook || "").trim();
  const fbHref = fbValue
    ? fbValue.startsWith("http")
      ? fbValue
      : `https://facebook.com/${fbValue.replace(/^@/, "")}`
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
        <i className="fas fa-info-circle"></i>
        Order Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3.75">
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">Search Client *</label>
          <input
            type="text"
            value={clientSearchTerm}
            onChange={(e) => onClientSearchChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
            placeholder="Search by name, email, or brand"
          />
          {clientSearchTerm.trim() && clientSearchTerm !== formData.client_name && (
            <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const brands = normalizeClientBrands(client);
                  return (
                    <button
                      type="button"
                      key={client.id}
                      onClick={() => onSelectClient(client)}
                      className="w-full text-left px-2 py-2 hover:bg-primary/5 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-xs font-medium text-gray-800">{client.name}</p>
                      <p className="text-[11px] text-gray-500">{client.email || "No email"}</p>
                      <p className="text-[11px] text-gray-400">
                        {brands.length > 0 ? brands.join(", ") : "No brands"}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="px-2 py-2 text-xs text-gray-500">No matching clients found.</p>
              )}
            </div>
          )}
        </div>

        {selectedClientId && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Selected Client</label>
              <p className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                {formData.client_name}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Email</label>
              <input
                type="email"
                value={formData.client_email}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                placeholder="Auto-filled from selected client"
                readOnly
              />
            </div>

            {/* Issue 3 — Facebook field + quick-chat button */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Facebook</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={formData.client_facebook}
                  onChange={(e) => onFieldChange("client_facebook", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter Facebook profile or page"
                />
                <a
                  href={fbHref || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!fbHref) e.preventDefault();
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap ${fbHref
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  title={fbHref ? "Open chat with client" : "Enter a Facebook link first"}
                >
                  <i className="fab fa-facebook-messenger"></i>
                  Chat
                </a>
              </div>
            </div>

            {/* Issue 1 — Brand dropdown + add-on-the-fly */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              {!addingBrand ? (
                <div className="flex gap-1.5">
                  <select
                    value={formData.brand}
                    onChange={(e) => onFieldChange("brand", e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  >
                    {brandOptions.length > 0 ? (
                      brandOptions.map((brandName) => (
                        <option key={brandName} value={brandName}>
                          {brandName}
                        </option>
                      ))
                    ) : (
                      <option value="">No brands available</option>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandError("");
                      setAddingBrand(true);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-secondary flex items-center gap-1 whitespace-nowrap"
                    title="Add a new brand for this client"
                  >
                    <i className="fas fa-plus"></i>Add
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBrand();
                      }
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    placeholder="New brand name"
                  />
                  <button
                    type="button"
                    onClick={handleAddBrand}
                    disabled={brandSaving || !newBrand.trim()}
                    className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                  >
                    {brandSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingBrand(false);
                      setNewBrand("");
                      setBrandError("");
                    }}
                    className="px-2 py-1.5 text-xs rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
              {brandError && <p className="mt-1 text-[11px] text-red-600">{brandError}</p>}
            </div>

            {!hideShirtColor && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Shirt Color</label>
              <input
                type="text"
                value={formData.shirt_color}
                onChange={(e) => onFieldChange("shirt_color", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter shirt color"
              />
            </div>
            )}

            {/* Issue 5 — Free Items as a locked multi-select */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Free Items</label>
              {freebiesLoading ? (
                <p className="text-[11px] text-gray-400">Loading free items…</p>
              ) : freebies.length === 0 ? (
                <p className="text-[11px] text-gray-500">
                  No free items configured. Add them in Drop Down Settings → Freebies.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {freebies.map((f) => {
                    const name = f.name || f;
                    const active = selectedFreebies.includes(name);
                    return (
                      <button
                        type="button"
                        key={f.id || name}
                        onClick={() => toggleFreebie(name)}
                        className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${active
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
                          }`}
                      >
                        {active && <i className="fas fa-check mr-1"></i>}
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedFreebies.length > 0 && (
                <p className="mt-1 text-[11px] text-gray-500">
                  Selected: {selectedFreebies.join(", ")}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderInfoSection;