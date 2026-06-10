import React, { useState, useEffect } from "react";
import useConfirm from "../../hooks/useConfirm";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { quotationApi } from "../../api/quotationApi";
import { apparelTypeApi } from "../../api/apparelTypeApi";
import { patternTypeApi } from "../../api/patternTypeApi";
import { apparelNecklineApi } from "../../api/apparelNecklineApi";
import { useParams, useNavigate } from "react-router-dom";
import TicketComposer from "../../components/tickets/TicketComposer"; // eslint-disable-line no-unused-vars
import QuotationStatusActions from "../../components/quotation/QuotationStatusActions";
import DesignReviewPanel from "../../components/quotation/DesignReviewPanel";
import { partImage } from "../../utils/designImage";
import DesignThumb from "../../components/common/DesignThumb";

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm, alert, dialog } = useConfirm();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  const parseJsonField = (value, fallback) => {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "string") {
      try { return JSON.parse(value); } catch { return fallback; }
    }
    return value;
  };

  const normalizeApiRecord = (response) => response?.data || response || null;

  const toId = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  };

  const resolveImageUrl = partImage;

  useEffect(() => { fetchQuotation(); }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationApi.show(id);
      const quotationData = response.data || {};
      const parsedItemConfig = parseJsonField(quotationData.item_config_json, quotationData.item_config || {});
      const apparelTypeId = toId(parsedItemConfig.apparel_type_id || quotationData.apparel_type_id);
      const patternTypeId = toId(parsedItemConfig.pattern_type_id || quotationData.pattern_type_id);
      const necklineId = toId(quotationData.apparel_neckline_id || quotationData.neckline_id);
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

  // Issue 8 — CSR sends (or re-sends) the design to the Graphic Artist.
  const handleRequestDesignReview = async () => {
    try {
      const updated = await quotationApi.requestDesignReview(id);
      const record = updated && updated.data ? updated.data : updated || {};
      setQuotation((prev) => ({
        ...(prev || {}),
        ...record,
        // The action always sets the review status to "Pending GA"; set it
        // locally too so the badge flips even if the response shape varies.
        design_review_status: record.design_review_status || "Pending GA",
      }));
    } catch (err) {
      console.error("Failed to send design to GA:", err);
      await alert({
        title: "Couldn't send to Graphic Artist",
        message: "Please try again.",
        tone: "danger",
      });
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const data = await quotationApi.showPDF(id);
      const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `quotation_${quotation?.quotation_id || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Confirm the quotation → marks it as "Converted" on the backend,
   * then navigates to /orders/new with the pre-filled payload in route state.
   */
  // Issue 12 — refresh local quotation after a lifecycle status change so the
  // badge + available action buttons update without a full reload.
  const handleStatusChanged = (updated) => {
    if (!updated) return;
    setQuotation((prev) => ({ ...(prev || {}), ...updated }));
  };

  const handleConvertToOrder = async () => {
    if (quotation?.status === "Converted") return;
    if (
      !(await confirm({
        title: "Convert to order?",
        message:
          "This will convert the quotation to an order. This action cannot be undone.",
        confirmLabel: "Convert",
        cancelLabel: "Cancel",
        tone: "primary",
      }))
    )
      return;

    setIsConverting(true);
    setConvertError(null);
    try {
      const result = await quotationApi.confirm(id);
      // Update local status immediately so the button reflects the change
      setQuotation((prev) => ({ ...prev, status: "Converted" }));

      // Per-Color auto-split: a multi-colour quote is converted into N
      // single-colour orders by the backend directly (no per-form review).
      // The response carries { split: true, orders: [...] } — surface a clear
      // confirmation and go to the Orders list.
      if (result?.split) {
        const count = Array.isArray(result.orders) ? result.orders.length : 0;
        const goToOrders = await confirm({
          title: "Quotation converted",
          message:
            result.message ||
            `Converted to ${count} single-color order${count === 1 ? "" : "s"} (one per color).`,
          confirmLabel: "View Orders",
          cancelLabel: "Stay here",
          tone: "primary",
        });
        if (goToOrders) navigate("/orders");
        return;
      }

      // Single-colour: unchanged prefill-and-review flow.
      navigate("/orders/new", { state: { prefill: result.order_payload } });
    } catch (err) {
      // 409 means already converted — still navigate if payload present
      if (err?.response?.status === 409) {
        setQuotation((prev) => ({ ...prev, status: "Converted" }));
        setConvertError("This quotation was already converted to an order.");
      } else {
        console.error("Failed to convert quotation:", err);
        setConvertError("Failed to convert quotation. Please try again.");
      }
    } finally {
      setIsConverting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-yellow-100 text-yellow-800", icon: "fa-pen" },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: "fa-clock" },
      sent: { color: "bg-blue-100 text-blue-800", icon: "fa-paper-plane" },
      approved: { color: "bg-green-100 text-green-800", icon: "fa-check-circle" },
      rejected: { color: "bg-red-100 text-red-800", icon: "fa-times-circle" },
      expired: { color: "bg-gray-200 text-gray-700", icon: "fa-hourglass-end" },
      completed: { color: "bg-blue-100 text-blue-800", icon: "fa-check-double" },
      converted: { color: "bg-purple-100 text-purple-800", icon: "fa-exchange-alt" },
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
      year: "numeric", month: "long", day: "numeric",
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
    ? items.reduce((sum, item) =>
      sum + (Number(item.total_amount) || Number(item.total)
        || ((Number(item.price_per_piece) || 0) * (Number(item.quantity) || 0))), 0)
    : breakdownItems.reduce((sum, item) => sum + (Number(item.total_amount ?? item.total) || 0), 0);

  const addonsTotal = addons.reduce((sum, addon) => sum + (Number(addon.total) || 0), 0);
  const sampleTotal =
    Number(sampleBreakdown.price_per_piece)
    || ((Number(sampleBreakdown.unit_price) || 0) * (Number(sampleBreakdown.quantity) || 0));
  const subtotal = Number(quotation.subtotal) || (itemsSubtotal + addonsTotal + sampleTotal);
  const discountAmount = Number(quotation.discount_price) || 0;
  const grandTotal = Number(quotation.grand_total) || Math.max(subtotal - discountAmount, 0);
  const downPayment = grandTotal * 0.6;
  const balance = grandTotal * 0.4;

  const isConverted = quotation?.status?.toLowerCase() === "converted";

  const initialAttachments = [];
  const pushIfLabeledUrl = (label, u) => {
    if (!u) return;
    if (!initialAttachments.find((a) => a.url === u)) initialAttachments.push({ label, url: u });
  };
  if (quotation) {
    const topImg = resolveImageUrl(quotation);
    pushIfLabeledUrl(`Quotation ${quotation.quotation_id || quotation.id}`, topImg);
    (Array.isArray(items) ? items : []).forEach((it, idx) => {
      const label = it.part || it.name || `Item ${idx + 1}`;
      pushIfLabeledUrl(label, resolveImageUrl(it));
    });
    (Array.isArray(printParts) ? printParts : []).forEach((p, idx) => {
      const label = p.part || p.name || `Part ${idx + 1}`;
      pushIfLabeledUrl(label, resolveImageUrl(p));
    });
  }

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
          {/* Header */}
          <div className="bg-linear-to-r from-primary/10 to-primary/5 p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-primary">QUOTATION</h1>
                <p className="text-xs text-gray-500 mt-1">Official Quotation Document</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {quotation.quotation_id || `QTN-${quotation.id}`}
                </div>
                <div className="text-xs text-gray-500">Date: {formatDate(quotation.created_at)}</div>
                {quotation.status && <div className="mt-2">{getStatusBadge(quotation.status)}</div>}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="p-6 border-b border-gray-200 bg-light/20">
            <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-user-circle"></i>Client Information
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
              <i className="fas fa-tshirt"></i>Apparel Information
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
                      const unitCount = Number(part.num_colors ?? part.numColors ?? part.color_count ?? part.colorCount ?? part.unit_count ?? part.unitCount) || 0;
                      const pricePerUnit = part.price_per_unit ?? part.pricePerUnit ?? part.price_per_color ?? part.pricePerColor;
                      return (
                        <tr key={idx} className="hover:bg-light/30">
                          <td className="px-3 py-2 font-medium text-gray-800">{partName}</td>
                          <td className="px-3 py-2">
                            {imageUrl ? (
                              <div className="inline-flex items-center gap-2">
                                <DesignThumb url={imageUrl} alt={partName} />
                                <a href={imageUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                                  View image
                                </a>
                              </div>
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
                      <td colSpan="4" className="px-3 py-8 text-center text-gray-400">No parts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issue 8 — Design review (read-only here; the GA edits it on the
              dedicated review surface). CSR can send / re-send to the GA. */}
          <div className="p-6 border-b border-gray-200">
            <DesignReviewPanel
              review={quotation}
              printParts={printParts}
              editable={false}
              onRequestReview={handleRequestDesignReview}
            />
          </div>

          {/* Addons */}
          {addons.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-plus-circle"></i>Addons
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
                        <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(addon.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Per-Color Quantity Breakdown (read-only) */}
          {Array.isArray(breakdown?.color_breakdowns) &&
            breakdown.color_breakdowns.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <i className="fas fa-tshirt"></i>Per-Color Quantity Breakdown
                </h2>
                <div className="space-y-3">
                  {breakdown.color_breakdowns.map((group, gIdx) => {
                    const sizes = Array.isArray(group?.sizes) ? group.sizes : [];
                    const groupQty =
                      group?.subtotal_qty ??
                      sizes.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
                    return (
                      <div
                        key={gIdx}
                        className="rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="px-3 py-2 bg-light/40 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">
                            {group?.color || "Unspecified Color"}
                          </span>
                          <span className="text-xs text-gray-500">{groupQty} pcs</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-light/50 border-b border-gray-200">
                              <tr>
                                <th className="px-2 py-1.5 text-left">Size</th>
                                <th className="px-2 py-1.5 text-right">Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {sizes.length > 0 ? (
                                sizes.map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    <td className="px-2 py-1.5 text-gray-700">
                                      {row.size || "N/A"}
                                    </td>
                                    <td className="px-2 py-1.5 text-right text-gray-700">
                                      {row.quantity ?? 0}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="px-2 py-1.5 text-center text-gray-400">
                                    No sizes
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Detailed Cost Breakdown */}
          {items.length > 0 && (
            <div className="p-6 border-b border-gray-200 bg-light/10">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-receipt"></i>Detailed Cost Breakdown
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
                    {items.map((item, idx) => {
                      // Authoritative per-piece figures come from items_json
                      // (the engine's output), not the stale local breakdown.
                      const base = Number(item.base_price) || 0;
                      const printTotal = Number(item.print_parts_total) || 0;
                      const ppp = Number(item.price_per_piece) || 0;
                      // Neckline (+ any per-piece options) is folded into the
                      // per-piece price; surface it as the residual so the row
                      // reconciles (base + neckline + color = price/pc).
                      const neckline = Math.max(0, ppp - base - printTotal);
                      const rowTotal =
                        Number(item.total_amount ?? item.total) ||
                        ppp * (Number(item.quantity) || 0);
                      return (
                        <tr key={idx} className="hover:bg-white/50">
                          <td className="px-2 py-1.5 font-medium text-primary">{item.size}</td>
                          <td className="px-2 py-1.5 text-center">{item.quantity}</td>
                          <td className="px-2 py-1.5 text-right">{formatCurrency(base)}</td>
                          <td className="px-2 py-1.5 text-right">{formatCurrency(neckline)}</td>
                          <td className="px-2 py-1.5 text-right">{formatCurrency(printTotal)}</td>
                          <td className="px-2 py-1.5 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="px-2 py-1.5 text-right font-semibold">{formatCurrency(ppp)}</td>
                          <td className="px-2 py-1.5 text-right font-bold text-primary">{formatCurrency(rowTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sample Breakdown */}
          {(sampleBreakdown.sample_apparel || sampleTotal > 0) && (
            <div className="p-6 border-b border-gray-200 bg-light/10">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-vial"></i>Sample Breakdown
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
                <i className="fas fa-pencil-alt"></i>Notes
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

      {/* Inline error toast for convert */}
      {convertError && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm shadow-lg flex items-center gap-2 print:hidden">
          <i className="fas fa-exclamation-circle"></i>
          {convertError}
          <button onClick={() => setConvertError(null)} className="ml-2 text-red-400 hover:text-red-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 flex gap-3 print:hidden">
        <button
          onClick={() => navigate("/quotations")}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition-all text-sm flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>Back
        </button>

        {!isConverted ? (
          <button
            onClick={handleConvertToOrder}
            disabled={isConverting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isConverting ? (
              <><i className="fas fa-spinner fa-spin"></i>Converting...</>
            ) : (
              <><i className="fas fa-exchange-alt"></i>Convert to Order</>
            )}
          </button>
        ) : (
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg shadow-lg text-sm flex items-center gap-2 cursor-not-allowed">
            <i className="fas fa-check-circle"></i>Already Converted
          </span>
        )}

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-secondary transition-all text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isDownloading ? (
            <><i className="fas fa-spinner fa-spin"></i>Generating PDF...</>
          ) : (
            <><i className="fas fa-download"></i>Download PDF</>
          )}
        </button>
      </div>
      {/* Issue 12 — lifecycle status actions + audit timeline */}
      {quotation && (
        <QuotationStatusActions
          quotationId={quotation.id}
          currentStatus={quotation.status}
          allowedTransitions={quotation.allowed_transitions || []}
          onStatusChanged={handleStatusChanged}
        />
      )}

      {dialog}
    </AdminLayout>
  );
};

export default ViewQuotation;
