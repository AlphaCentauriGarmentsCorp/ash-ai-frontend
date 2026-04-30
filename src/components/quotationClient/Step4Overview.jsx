import React from "react";

const parseJsonField = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

const toStorageUrl = (path) => {
  const rawPath = String(path || "").trim();
  if (!rawPath) return "";

  if (rawPath.startsWith("http") || rawPath.startsWith("data:")) {
    return rawPath;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "";
  let origin = "";
  try {
    origin = new URL(apiUrl).origin;
  } catch {
    origin = "";
  }

  if (rawPath.startsWith("/storage/")) {
    return origin ? `${origin}${rawPath}` : rawPath;
  }

  if (rawPath.startsWith("storage/")) {
    return origin ? `${origin}/${rawPath}` : `/${rawPath}`;
  }

  const cleanedPath = rawPath.replace(/^\/+/, "");
  return origin ? `${origin}/storage/${cleanedPath}` : `/storage/${cleanedPath}`;
};

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Step4Overview = ({ formData, quotationData }) => {
  const parts = Array.isArray(formData.parts) ? formData.parts : [];
  const quotation = quotationData || {};

  const items = Array.isArray(quotation.items) && quotation.items.length > 0
    ? quotation.items
    : parseJsonField(quotation.items_json, []);
  const itemConfig = parseJsonField(quotation.item_config_json, {}) || quotation.item_config || {};
  const addons = Array.isArray(quotation.addons) && quotation.addons.length > 0
    ? quotation.addons
    : parseJsonField(quotation.addons_json, []);
  const breakdown = parseJsonField(quotation.breakdown, null)
    || parseJsonField(quotation.breakdown_json, { items: [], sample_breakdown: {} });
  const breakdownItems = Array.isArray(breakdown?.items) ? breakdown.items : [];
  const sampleBreakdown = breakdown?.sample_breakdown || {};

  const apparelName = quotation._resolvedMeta?.apparel_type_name
    || quotation.apparel_type_name
    || quotation.apparel_type?.name
    || itemConfig.apparel_type_name
    || itemConfig.apparel_type?.name
    || (itemConfig.apparel_type_id ? `#${itemConfig.apparel_type_id}` : "N/A");
  const patternTypeName = quotation._resolvedMeta?.pattern_type_name
    || quotation.pattern_type_name
    || quotation.pattern_type?.name
    || itemConfig.pattern_type_name
    || itemConfig.pattern_type?.name
    || (itemConfig.pattern_type_id ? `#${itemConfig.pattern_type_id}` : "N/A");
  const necklineName = quotation._resolvedMeta?.apparel_neckline_name
    || quotation.apparel_neckline_name
    || quotation.neckline_name
    || quotation.apparel_neckline?.name
    || itemConfig.apparel_neckline_name
    || itemConfig.neckline_name
    || itemConfig.neckline?.name
    || itemConfig.apparel_neckline?.name
    || (quotation.apparel_neckline_id || quotation.neckline_id ? `#${quotation.apparel_neckline_id || quotation.neckline_id}` : "N/A");

  const itemsSubtotal = items.length > 0
    ? items.reduce(
      (sum, item) =>
        sum +
        (Number(item.total_amount)
          || Number(item.total)
          || ((Number(item.price_per_piece) || 0) * (Number(item.quantity) || 0))),
      0,
    )
    : breakdownItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const addonsTotal = addons.reduce((sum, addon) => sum + (Number(addon.total) || 0), 0);
  const sampleTotal = Number(sampleBreakdown.price_per_piece)
    || ((Number(sampleBreakdown.unit_price) || 0) * (Number(sampleBreakdown.quantity) || 0));
  const subtotal = Number(quotation.subtotal) || (itemsSubtotal + addonsTotal + sampleTotal);
  const discountAmount = Number(quotation.discount_price) || 0;
  const grandTotal = Number(quotation.grand_total) || Math.max(subtotal - discountAmount, 0);
  const downPayment = grandTotal * 0.6;
  const balance = grandTotal * 0.4;

  const partsTotal = parts.reduce(
    (sum, part) => sum + (Number(part.unit_count) || 0) * (Number(part.price_per_unit) || 0),
    0,
  );

  const renderPartPreview = (part) => {
    const file = part?.image_file;
    const rawPath = String(
      part?.image_link || part?.existing_image_url || part?.image_url || part?.image_path || part?.image || "",
    ).trim();

    if (file instanceof File) {
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <i className="fas fa-file-image text-primary text-xl"></i>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB uploaded</p>
          </div>
        </div>
      );
    }

    const previewUrl = toStorageUrl(rawPath);
    if (!previewUrl) {
      return (
        <div className="inline-flex items-center gap-2 text-xs text-gray-400">
          <i className="fas fa-image"></i>
          No image
        </div>
      );
    }

    return (
      <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
        <img
          src={previewUrl}
          alt={part?.part ? `${part.part} design` : "Uploaded design"}
          className="h-10 w-10 rounded border border-gray-200 object-cover bg-white"
        />
        <span className="text-xs text-primary hover:underline">View image</span>
      </a>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Review the quotation details and the uploaded designs before submitting
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-primary/10 to-primary/5 p-6 border-b border-gray-200">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-xl font-bold text-primary">QUOTATION</h3>
              <p className="text-xs text-gray-500 mt-1">Shared quotation summary</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="font-semibold text-gray-800">
                {quotation.quotation_id || quotation.id || "N/A"}
              </div>
              <div>Date: {formatDate(quotation.created_at)}</div>
              {quotation.status && <div className="mt-1 capitalize">{quotation.status}</div>}
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 bg-light/20">
          <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-user-circle"></i>
            Client Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-user text-xs text-gray-400 w-4"></i>
                <span className="text-sm text-gray-600">Client Name:</span>
                <span className="text-sm font-medium text-gray-800">{quotation.client_name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-envelope text-xs text-gray-400 w-4"></i>
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-800">{quotation.client_email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-tag text-xs text-gray-400 w-4"></i>
                <span className="text-sm text-gray-600">Brand:</span>
                <span className="text-sm font-medium text-gray-800">{quotation.client_brand || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-palette text-xs text-gray-400 w-4"></i>
                <span className="text-sm text-gray-600">Shirt Color:</span>
                <span className="text-sm font-medium text-gray-800">{quotation.shirt_color || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-gift text-xs text-gray-400 w-4"></i>
                <span className="text-sm text-gray-600">Free Items:</span>
                <span className="text-sm font-medium text-gray-800">{quotation.free_items || "None"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-tshirt"></i>
            Apparel Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg border border-gray-200 bg-light/20 p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Apparel</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{apparelName}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-light/20 p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Pattern Type</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{patternTypeName}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-light/20 p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Neckline</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{necklineName}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light/50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left">Part</th>
                  <th className="px-3 py-2 text-left">Uploaded Image</th>
                  <th className="px-3 py-2 text-right"># of Units</th>
                  <th className="px-3 py-2 text-right">Price/Unit</th>
                  <th className="px-3 py-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parts.length > 0 ? (
                  parts.map((part) => {
                    const unitCount = Math.max(1, Number(part.unit_count) || 1);
                    const pricePerUnit = Number(part.price_per_unit) || 0;
                    const lineTotal = unitCount * pricePerUnit;

                    return (
                      <tr key={part.key} className="hover:bg-light/30">
                        <td className="px-3 py-2 font-medium text-gray-800">{part.part || "Unknown Part"}</td>
                        <td className="px-3 py-2">
                          {renderPartPreview(part)}
                        </td>
                        <td className="px-3 py-2 text-right">{unitCount}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(pricePerUnit)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-gray-400">
                      No uploaded parts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {parts.length > 0 && (
            <div className="mt-4 flex justify-end text-sm text-gray-600">
              <span className="font-medium mr-2">Parts Total:</span>
              <span className="font-semibold text-primary">{formatCurrency(partsTotal)}</span>
            </div>
          )}
        </div>

        {addons.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-plus-circle"></i>
              Addons
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-light/50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Addon Name</th>
                    <th className="px-3 py-2 text-right">Price/Pc</th>
                    <th className="px-3 py-2 text-right">Quantity</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {addons.map((addon, index) => (
                    <tr key={addon.id || index} className="hover:bg-light/30">
                      <td className="px-3 py-2">{addon.name || "Addon"}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(addon.price_per_piece || addon.price)}</td>
                      <td className="px-3 py-2 text-right">{addon.quantity || 1}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(addon.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {breakdownItems.length > 0 && (
          <div className="p-6 border-b border-gray-200 bg-light/10">
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-receipt"></i>
              Detailed Cost Breakdown
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-light/50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Size</th>
                    <th className="px-2 py-1.5 text-center">Qty</th>
                    <th className="px-2 py-1.5 text-right">Apparel/Pattern</th>
                    <th className="px-2 py-1.5 text-right">Neckline</th>
                    <th className="px-2 py-1.5 text-right">Color Prices</th>
                    <th className="px-2 py-1.5 text-right">Unit Price</th>
                    <th className="px-2 py-1.5 text-right">Price/Pc</th>
                    <th className="px-2 py-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {breakdownItems.map((item, index) => (
                    <tr key={item.size || index} className="hover:bg-white/50">
                      <td className="px-2 py-1.5 font-medium text-primary">{item.size}</td>
                      <td className="px-2 py-1.5 text-center">{item.quantity}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(item.apparel_pattern_price)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(item.neckline_price)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(item.color_price)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-2 py-1.5 text-right font-semibold">{formatCurrency(item.price_per_piece)}</td>
                      <td className="px-2 py-1.5 text-right font-bold text-primary">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(sampleBreakdown.sample_apparel || sampleTotal > 0) && (
          <div className="p-6 border-b border-gray-200 bg-light/10">
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-vial"></i>
              Sample Breakdown
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-light/50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Sample Apparel</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Quantity</th>
                    <th className="px-3 py-2 text-right">Price/Pc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-white/50">
                    <td className="px-3 py-2 font-medium text-primary">
                      {sampleBreakdown.sample_apparel || "No sample apparel provided"}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(sampleBreakdown.unit_price)}</td>
                    <td className="px-3 py-2 text-right">{Number(sampleBreakdown.quantity) || 0}</td>
                    <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(sampleTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-end">
            <div className="w-full md:w-96">
              <div className="space-y-2">
                {parts.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploaded Parts Total:</span>
                    <span>{formatCurrency(partsTotal)}</span>
                  </div>
                )}
                {itemsSubtotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Total:</span>
                    <span>{formatCurrency(itemsSubtotal)}</span>
                  </div>
                )}
                {addons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Addons Total:</span>
                    <span>{formatCurrency(addonsTotal)}</span>
                  </div>
                )}
                {sampleTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sample Total:</span>
                    <span>{formatCurrency(sampleTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount ({quotation.discount_type === "percentage" ? `${quotation.discount_price}%` : "Fixed"}):
                    </span>
                    <span className="text-red-600">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-bold text-primary">
                    <span>GRAND TOTAL:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Downpayment (60%):</span>
                    <span className="font-semibold">{formatCurrency(downPayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Balance (40%):</span>
                    <span className="font-semibold">{formatCurrency(balance)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {quotation.notes && (
          <div className="p-6 border-b border-gray-200 bg-light/10">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <i className="fas fa-pencil-alt"></i>
              Notes
            </h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}

        <div className="p-4 text-center text-[10px] text-gray-400 border-t border-gray-200">
          <p>This is a computer-generated quotation and requires no signature.</p>
          <p className="mt-1">For inquiries, please contact our customer service.</p>
        </div>
      </div>
    </div>
  );
};

export default Step4Overview;
