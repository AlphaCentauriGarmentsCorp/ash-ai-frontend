import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { quotationApi } from "../../api/quotationApi";
import { apparelTypeApi } from "../../api/apparelTypeApi";
import { patternTypeApi } from "../../api/patternTypeApi";
import { apparelNecklineApi } from "../../api/apparelNecklineApi";
import { useParams, useNavigate } from "react-router-dom";

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const normalizeApiRecord = (response) => response?.data || response || null;

  const toId = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  };

  const resolveImageUrl = (part) => {
    const rawPath = String(
      part?.image_link || part?.image_url || part?.image_path || part?.image || "",
    ).trim();

    if (!rawPath) return "";
    if (rawPath.startsWith("http") || rawPath.startsWith("data:")) return rawPath;

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

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationApi.show(id);
      const quotationData = response.data || {};

      const parsedItemConfig = parseJsonField(
        quotationData.item_config_json,
        quotationData.item_config || {},
      );

      const apparelTypeId = toId(
        parsedItemConfig.apparel_type_id || quotationData.apparel_type_id,
      );
      const patternTypeId = toId(
        parsedItemConfig.pattern_type_id || quotationData.pattern_type_id,
      );
      const necklineId = toId(
        quotationData.apparel_neckline_id || quotationData.neckline_id,
      );

      const [apparelTypeRecord, patternTypeRecord, necklineRecord] = await Promise.all([
        apparelTypeId ? apparelTypeApi.show(apparelTypeId).then(normalizeApiRecord).catch(() => null) : null,
        patternTypeId ? patternTypeApi.show(patternTypeId).then(normalizeApiRecord).catch(() => null) : null,
        necklineId ? apparelNecklineApi.show(necklineId).then(normalizeApiRecord).catch(() => null) : null,
      ]);

      setQuotation({
        ...quotationData,
        _resolvedMeta: {
          apparel_type_name: apparelTypeRecord?.name || null,
          pattern_type_name: patternTypeRecord?.name || null,
          apparel_neckline_name: necklineRecord?.name || null,
        },
      });
    } catch (err) {
      console.error("Failed to fetch quotation:", err);
      setError("Failed to load quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
const handleDownloadPDF = async () => {
  setIsDownloading(true);
  try {
    const data = await quotationApi.showPDF(id); // now returns blob

    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `quotation_${quotation?.quotation_id || id}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download PDF:', err);
  } finally {
    setIsDownloading(false);
  }
};

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: "fa-clock" },
      approved: { color: "bg-green-100 text-green-800", icon: "fa-check-circle" },
      rejected: { color: "bg-red-100 text-red-800", icon: "fa-times-circle" },
      completed: { color: "bg-blue-100 text-blue-800", icon: "fa-check-double" },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <i className={`fas ${config.icon} text-xs`}></i>
        {status || "Pending"}
      </span>
    );
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

  if (loading) {
    return (
      <AdminLayout pageTitle="View Quotation">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">Loading quotation...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !quotation) {
    return (
      <AdminLayout pageTitle="View Quotation">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fas fa-file-invoice-dollar text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 mb-4">{error || "Quotation not found"}</p>
            <button
              onClick={() => navigate("/quotations")}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-secondary"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Quotations
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const items = Array.isArray(quotation.items) && quotation.items.length > 0
    ? quotation.items
    : parseJsonField(quotation.items_json, []);
  const itemConfig = parseJsonField(quotation.item_config_json, {}) || quotation.item_config || {};
  const addons = Array.isArray(quotation.addons) && quotation.addons.length > 0
    ? quotation.addons
    : parseJsonField(quotation.addons_json, []);
  const printParts = Array.isArray(quotation.print_parts) && quotation.print_parts.length > 0
    ? quotation.print_parts
    : parseJsonField(quotation.print_parts_json, []);
  const breakdown = parseJsonField(quotation.breakdown, null)
    || parseJsonField(quotation.breakdown_json, { items: [], sample_breakdown: {} });
  const breakdownItems = Array.isArray(breakdown?.items) ? breakdown.items : [];
  const sampleBreakdown = breakdown?.sample_breakdown || {};

  const resolveNameOrId = (name, id) => {
    if (name) return name;
    if (id !== null && id !== undefined && id !== "") return `#${id}`;
    return "N/A";
  };

  const apparelName = resolveNameOrId(
    quotation._resolvedMeta?.apparel_type_name || quotation.apparel_type_name || quotation.apparel_type?.name,
    itemConfig.apparel_type_id || quotation.apparel_type_id,
  );
  const patternTypeName = resolveNameOrId(
    quotation._resolvedMeta?.pattern_type_name || quotation.pattern_type_name || quotation.pattern_type?.name,
    itemConfig.pattern_type_id || quotation.pattern_type_id,
  );
  const necklineName = resolveNameOrId(
    quotation._resolvedMeta?.apparel_neckline_name || quotation.apparel_neckline_name || quotation.neckline_name || quotation.apparel_neckline?.name,
    quotation.apparel_neckline_id || quotation.neckline_id,
  );

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
  const sampleTotal =
    Number(sampleBreakdown.price_per_piece)
    || ((Number(sampleBreakdown.unit_price) || 0) * (Number(sampleBreakdown.quantity) || 0));

  const subtotal = Number(quotation.subtotal) || (itemsSubtotal + addonsTotal + sampleTotal);
  const discountAmount = Number(quotation.discount_price) || 0;
  const grandTotal = Number(quotation.grand_total) || Math.max(subtotal - discountAmount, 0);
  const downPayment = grandTotal * 0.6;
  const balance = grandTotal * 0.4;

  return (
    <AdminLayout
      pageTitle={`Quotation #${quotation.quotation_id || id}`}
      path="/quotations"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotations", href: "/quotations", icon: "fa-solid fa-file-invoice-dollar" },
        { label: `#${quotation.quotation_id || id}`, href: "#" },
      ]}
    >
      {/* PDF Content Wrapper */}
      <div id="quotation-pdf-content">
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden font-poppins">
          {/* Header - Printable */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-primary">QUOTATION</h1>
                <p className="text-xs text-gray-500 mt-1">Official Quotation Document</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {quotation.quotation_id || `QTN-${quotation.id}`}
                </div>
                <div className="text-xs text-gray-500">
                  Date: {formatDate(quotation.created_at)}
                </div>
                {quotation.status && (
                  <div className="mt-2">{getStatusBadge(quotation.status)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="p-6 border-b border-gray-200 bg-light/20">
            <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-user-circle"></i>
              Client Information
            </h2>
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

          {/* Apparel Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-tshirt"></i>
              Apparel Information
            </h2>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(printParts) && printParts.length > 0 ? (
                    printParts.map((part, idx) => {
                      const imageUrl = resolveImageUrl(part);
                      const partName = part.part || part.name || (part.part_id ? `Part #${part.part_id}` : "Unknown Part");
                      const unitCount = Number(part.unit_count ?? part.unitCount ?? part.color_count ?? part.colorCount) || 0;
                      const pricePerUnit = part.price_per_unit ?? part.pricePerUnit ?? part.price_per_color ?? part.pricePerColor;

                      return (
                      <tr key={idx} className="hover:bg-light/30">
                        <td className="px-3 py-2 font-medium text-gray-800">{partName}</td>
                        <td className="px-3 py-2">
                          {imageUrl ? (
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2"
                            >
                              <img
                                src={imageUrl}
                                alt={partName}
                                className="h-10 w-10 rounded border border-gray-200 object-cover bg-white"
                              />
                              <span className="text-xs text-primary hover:underline">View image</span>
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">No uploaded image</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">{unitCount}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(pricePerUnit)}</td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-3 py-8 text-center text-gray-400">
                        No parts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Addons Section */}
          {addons.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-plus-circle"></i>
                Addons
              </h2>
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
                    {addons.map((addon, idx) => (
                      <tr key={idx} className="hover:bg-light/30">
                        <td className="px-3 py-2">{addon.name}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(addon.price_per_piece || addon.price)}</td>
                        <td className="px-3 py-2 text-right">{addon.quantity || 1}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {formatCurrency(addon.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cost Breakdown (Detailed) */}
          {breakdownItems.length > 0 && (
            <div className="p-6 border-b border-gray-200 bg-light/10">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-receipt"></i>
                Detailed Cost Breakdown
              </h2>
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
                    {breakdownItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/50">
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
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-vial"></i>
                Sample Breakdown
              </h2>
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

          {/* Financial Summary */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              <div className="w-full md:w-96">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Total:</span>
                    <span>{formatCurrency(itemsSubtotal)}</span>
                  </div>
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
                    <p className="text-[10px] text-gray-400 text-right mt-2">
                      <i className="fas fa-clock mr-1"></i>Balance due upon delivery/pickup
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="p-6 border-b border-gray-200 bg-light/10">
              <h2 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <i className="fas fa-pencil-alt"></i>
                Notes
              </h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 text-center text-[10px] text-gray-400 border-t border-gray-200">
            <p>This is a computer-generated quotation and requires no signature.</p>
            <p className="mt-1">For inquiries, please contact our customer service.</p>
          </div>
        </section>
      </div>

      {/* Action Buttons - Not printed */}
      <div className="fixed bottom-6 right-6 flex gap-3 print:hidden">
        <button
          onClick={() => navigate("/quotations")}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition-all text-sm flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-secondary transition-all text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Generating PDF...
            </>
          ) : (
            <>
              <i className="fas fa-download"></i>
              Download PDF
            </>
          )}
        </button>
      </div>
    </AdminLayout>
  );
};

export default ViewQuotation;