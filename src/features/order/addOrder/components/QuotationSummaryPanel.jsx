import React, { useState } from "react";

const formatCurrency = (v) => {
    const n = Number(v) || 0;
    return `₱${n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const resolveImageUrl = (part) => {
    const rawPath = String(
        part?.image_link ||
        part?.image_url ||
        part?.image_path ||
        part?.image ||
        ""
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
    if (rawPath.startsWith("/storage/"))
        return origin ? `${origin}${rawPath}` : rawPath;
    const cleanedPath = rawPath.replace(/^\/+/, "");
    return origin
        ? `${origin}/storage/${cleanedPath}`
        : `/storage/${cleanedPath}`;
};

/**
 * QuotationSummaryPanel
 *
 * Read-only section injected between OrderInformationSection and the first
 * editable section of the order form when a quotation prefill is present.
 *
 * Props:
 *  - meta: quotationMeta object from useQuotationPrefill
 */
export const QuotationSummaryPanel = ({ meta }) => {
    const [expanded, setExpanded] = useState(true);

    if (!meta) return null;

    const { quotationId, clientName, items, addons, printParts, subtotal, grandTotal, discountAmount, discountType, discountPrice } = meta;

    const hasItems = items.length > 0;
    const hasAddons = addons.length > 0;
    const hasPrintParts = printParts.length > 0;

    return (
        <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50/60 overflow-hidden">
            {/* ── Collapsible header ──────────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-blue-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <i className="fas fa-file-invoice-dollar text-blue-500 text-sm"></i>
                    <span className="text-sm font-semibold text-blue-800">
                        Quotation #{quotationId} — Carried Data
                        {clientName && (
                            <span className="ml-2 font-normal text-blue-600 text-xs">
                                ({clientName})
                            </span>
                        )}
                    </span>
                    <span className="ml-1 text-[11px] text-blue-400 italic font-normal">
                        read-only · sizes below are editable separately
                    </span>
                </div>
                <i
                    className={`fas fa-chevron-${expanded ? "up" : "down"} text-blue-400 text-xs transition-transform`}
                ></i>
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-5">
                    {/* ── Print Parts ─────────────────────────────────────────────── */}
                    {hasPrintParts && (
                        <div>
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <i className="fas fa-images text-blue-400"></i>Print Parts
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {printParts.map((part, idx) => {
                                    const imageUrl = resolveImageUrl(part);
                                    const partName =
                                        part.part || part.name || `Part ${idx + 1}`;
                                    const colorCount =
                                        part.color_count ?? part.colorCount ?? part.unit_count ?? 0;
                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-lg border border-blue-100 bg-white p-2.5 text-center shadow-sm"
                                        >
                                            {imageUrl ? (
                                                <a href={imageUrl} target="_blank" rel="noreferrer">
                                                    <img
                                                        src={imageUrl}
                                                        alt={partName}
                                                        className="h-16 w-full object-cover rounded border border-gray-100 mb-1.5"
                                                    />
                                                </a>
                                            ) : (
                                                <div className="h-16 w-full bg-gray-100 rounded mb-1.5 flex items-center justify-center">
                                                    <i className="fas fa-image text-gray-300 text-xl"></i>
                                                </div>
                                            )}
                                            <p className="text-xs font-medium text-gray-700 truncate">
                                                {partName}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                {colorCount} color{colorCount !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Size / Items Breakdown ───────────────────────────────────── */}
                    {hasItems && (
                        <div>
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <i className="fas fa-ruler-combined text-blue-400"></i>Size
                                Breakdown (from Quotation)
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-blue-100">
                                <table className="w-full text-xs bg-white">
                                    <thead className="bg-blue-50 border-b border-blue-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-blue-700">
                                                Size
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold text-blue-700">
                                                Qty
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold text-blue-700">
                                                Unit Price
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold text-blue-700">
                                                Price/Pc
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold text-blue-700">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/40">
                                                <td className="px-3 py-2 font-semibold text-primary">
                                                    {item.size_label || item.size || "—"}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {item.quantity ?? 0}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {formatCurrency(item.price_per_piece)}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-primary">
                                                    {formatCurrency(
                                                        item.total_amount ??
                                                        item.total ??
                                                        (item.price_per_piece ?? 0) * (item.quantity ?? 0)
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Addons ──────────────────────────────────────────────────── */}
                    {hasAddons && (
                        <div>
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <i className="fas fa-plus-circle text-blue-400"></i>Addons
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-blue-100">
                                <table className="w-full text-xs bg-white">
                                    <thead className="bg-blue-50 border-b border-blue-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-blue-700">
                                                Name
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold text-blue-700">
                                                Price/Pc
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold text-blue-700">
                                                Qty
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold text-blue-700">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50">
                                        {addons.map((addon, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/40">
                                                <td className="px-3 py-2">{addon.name || "—"}</td>
                                                <td className="px-3 py-2 text-right">
                                                    {formatCurrency(
                                                        addon.price_per_piece ?? addon.price
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {addon.quantity ?? 1}
                                                </td>
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

                    {/* ── Financial Totals ─────────────────────────────────────────── */}
                    {(subtotal > 0 || grandTotal > 0) && (
                        <div className="flex justify-end">
                            <div className="w-full sm:w-72 space-y-1.5 bg-white rounded-lg border border-blue-100 px-4 py-3 text-xs shadow-sm">
                                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide mb-2">
                                    Quotation Financials
                                </p>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-red-500">
                                        <span>
                                            Discount (
                                            {discountType === "percentage"
                                                ? `${discountPrice}%`
                                                : "Fixed"}
                                            ):
                                        </span>
                                        <span>− {formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-primary border-t border-blue-100 pt-2">
                                    <span>Grand Total:</span>
                                    <span>{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};