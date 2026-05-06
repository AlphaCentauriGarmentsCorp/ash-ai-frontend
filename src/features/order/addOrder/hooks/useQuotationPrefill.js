import { useMemo } from "react";
import { getDefaultDeadline } from "../utils/orderHelpers";

/**
 * useQuotationPrefill
 *
 * Accepts the `prefill` object from ViewQuotation → navigate state
 * (i.e. `result.order_payload` returned by QuotationService::confirmAndConvert).
 *
 * The backend now returns both IDs and resolved *_name strings, so no extra
 * API calls are needed here.
 *
 * Returns:
 *  - prefillFormData   — partial formData merged into the order initial state
 *  - quotationMeta     — read-only display data for QuotationSummaryPanel
 *  - hasPrefill        — boolean guard
 */

const safeJson = (value, fallback) => {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "object") return value;
    try { return JSON.parse(value); } catch { return fallback; }
};

export const useQuotationPrefill = (prefill) => {
    const hasPrefill = Boolean(prefill);

    const prefillFormData = useMemo(() => {
        if (!prefill) return {};

        // ── Names are now sent directly by the backend ─────────────────────────
        // apparel_type_name / pattern_type_name / print_method_name are resolved
        // server-side in QuotationService::confirmAndConvert.
        const apparelTypeName = prefill.apparel_type_name || "";
        const patternTypeName = prefill.pattern_type_name || "";
        const printMethodName = prefill.print_method_name || "";

        // Addons from addons_json — mapped to the order OptionsSection structure
        const addons = safeJson(prefill.addons_json, []);

        // Sizes from breakdown_json.items — pre-populate SizesSection rows
        const breakdown = safeJson(prefill.breakdown_json, {});
        const breakdownItems = Array.isArray(breakdown?.items) ? breakdown.items : [];

        // Sizes: map breakdown items → order size row shape
        const prefillSizes = breakdownItems.length > 0
            ? breakdownItems.map((item) => ({
                id: crypto.randomUUID(),
                name: item.size ?? "",
                // costPrice maps to price_per_piece in the quotation breakdown
                costPrice: Number(item.price_per_piece ?? item.unit_price ?? 0),
                quantity: Number(item.quantity ?? 0),
                unitPrice: Number(item.price_per_piece ?? item.unit_price ?? 0),
                totalPrice: Number(item.total_amount ?? item.total ?? 0),
                // carry read-only quotation fields for display
                _unit_price: Number(item.unit_price ?? 0),
                _price_per_pc: Number(item.price_per_piece ?? 0),
            }))
            : undefined; // undefined = keep default createSizeObjects

        // Sample from breakdown_json.sample_breakdown
        const sampleBreakdown = breakdown?.sample_breakdown ?? {};
        const prefillSamples = (sampleBreakdown.sample_apparel || Number(sampleBreakdown.unit_price) > 0)
            ? [{
                id: crypto.randomUUID(),
                size: sampleBreakdown.sample_apparel ?? "",
                quantity: Number(sampleBreakdown.quantity ?? 1),
                unit_price: Number(sampleBreakdown.unit_price ?? 0),
                total_price: Number(sampleBreakdown.price_per_piece ?? 0),
            }]
            : [];

        return {
            // Client
            client: prefill.client_id ?? "",
            company: prefill.client_brand ?? "",

            // Product details — names resolved by backend
            apparel_type: apparelTypeName,
            pattern_type: patternTypeName,
            print_method: printMethodName,

            // Shirt/print
            shirt_color: prefill.shirt_color ?? "",
            special_print: prefill.special_print ?? "",
            print_area: prefill.print_area ?? "",
            notes: prefill.notes ?? "",

            // Freebies → freebie_others
            freebie_others: prefill.free_items ?? "",

            // Deadline — always default (+14 days)
            deadline: getDefaultDeadline(),

            // Sizes from quotation breakdown
            ...(prefillSizes ? { sizes: prefillSizes } : {}),

            // Addons mapped to selectedOptions shape (name + color placeholder)
            _prefillAddons: addons,
            _prefillSamples: prefillSamples,

            // Quotation linkage
            quotation_id: prefill.quotation_id ?? "",
        };
    }, [prefill]);

    /**
     * quotationMeta — read-only display in QuotationSummaryPanel only.
     */
    const quotationMeta = useMemo(() => {
        if (!prefill) return null;

        const items = safeJson(prefill.items_json, []);
        const addons = safeJson(prefill.addons_json, []);
        const printParts = safeJson(prefill.print_parts_json, []);
        const breakdown = safeJson(prefill.breakdown_json, {});

        return {
            quotationId: prefill.quotation_id ?? "",
            clientName: prefill.client_name ?? "",
            items,
            addons,
            printParts,
            breakdown,
            subtotal: Number(prefill.subtotal) || 0,
            grandTotal: Number(prefill.grand_total) || 0,
            discountAmount: Number(prefill.discount_amount) || 0,
            discountType: prefill.discount_type ?? "percentage",
            discountPrice: Number(prefill.discount_price) || 0,
        };
    }, [prefill]);

    return { hasPrefill, prefillFormData, quotationMeta };
};