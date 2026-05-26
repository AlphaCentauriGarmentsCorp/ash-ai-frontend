import React from "react";

/**
 * Order Information card (SHARED component).
 *
 * Extracted from the byte-identical Order Info blocks in Quotation.jsx (Add)
 * and EditQuotation.jsx (Edit) to stop the two-file drift. Same approach as
 * LabelSpecSection: the PARENT owns all state, derived values, and handlers;
 * this component is pure presentation driven entirely by props.
 *
 * It renders ONLY the card (the `bg-white rounded-lg border ...` block). The
 * surrounding `lg:grid-cols-2` grid wrapper and the sibling Apparel
 * Information card stay in each page, so layout is unchanged.
 *
 * ── Props (all owned by the parent page) ─────────────────────────────────
 *   formData                 { client_name, client_email, client_facebook,
 *                              brand, shirt_color, free_items }
 *   onFieldChange(field,val) updates one formData field (parent → setOrderInfo)
 *   clientSearchTerm         controlled value of the client search input
 *   onClientSearchChange(v)  parent's handleClientSearchChange
 *   filteredClients          derived list (parent useMemo) — passed in, not recomputed
 *   normalizeClientBrands(c) parent helper → string[] of a client's brands
 *   onSelectClient(client)   parent's handleSelectClient
 *   selectedClientId         currently-selected client id (null = none)
 *   selectedClientBrands     derived brand list for the selected client (useMemo)
 *
 * Behaviour is intentionally identical to the original inline JSX — this is a
 * pure refactor (no behaviour change). Issues 1–5 (brand add-on-the-fly, FB
 * quick-chat button, swatch picker, locked Free Items, audit log) layer on top
 * of THIS component later, so they're built once instead of twice.
 */
const OrderInfoSection = ({
  formData,
  onFieldChange,
  clientSearchTerm,
  onClientSearchChange,
  filteredClients,
  normalizeClientBrands,
  onSelectClient,
  selectedClientId,
  selectedClientBrands,
}) => {
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Facebook</label>
              <input
                type="text"
                value={formData.client_facebook}
                onChange={(e) => onFieldChange("client_facebook", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter Facebook profile or page"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => onFieldChange("brand", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
              >
                {selectedClientBrands.length > 0 ? (
                  selectedClientBrands.map((brandName) => (
                    <option key={brandName} value={brandName}>
                      {brandName}
                    </option>
                  ))
                ) : (
                  <option value="">No brands available</option>
                )}
              </select>
            </div>
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Free Items</label>
              <input
                type="text"
                value={formData.free_items}
                onChange={(e) => onFieldChange("free_items", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter free items"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderInfoSection;