import { useEffect, useRef, useState } from "react";
import { orderApi } from "../../../../api/orderApi";

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const methodKeyFromName = (name = "") => {
  const n = String(name).toLowerCase();
  if (n.includes("dtf") || n.includes("direct-to-film")) return "dtf";
  if (n.includes("embroid")) return "embroidery";
  if (n.includes("subli")) return "sublimation";
  if (n.includes("silk") || n.includes("screen")) return "silkscreen";
  return n ? "other" : "";
};

/**
 * Resolve the apparel_pattern_price row for the current order. Prefers an id
 * already carried from a quotation; otherwise matches the order's apparel_type
 * + pattern_type NAMES against the loaded apparel_pattern_prices list.
 */
const resolvePatternPrice = (formData, apparelPatternPrices, prefillId) => {
  const rows = apparelPatternPrices || [];
  if (prefillId) {
    const byId = rows.find((r) => String(r.id) === String(prefillId));
    if (byId) return byId;
  }
  const ap = String(formData.apparel_type || "").toLowerCase().trim();
  const pt = String(formData.pattern_type || "").toLowerCase().trim();
  if (!ap || !pt) return null;
  return (
    rows.find(
      (r) =>
        String(r.apparel_type_name || "").toLowerCase().trim() === ap &&
        String(r.pattern_type_name || "").toLowerCase().trim() === pt,
    ) || null
  );
};

/**
 * Build the engine payload (same shape the Quotation form sends to its preview
 * endpoint) from the order form state.
 */
export const buildEnginePayload = ({
  formData,
  apparelPatternPrices,
  prefillPatternPriceId,
}) => {
  const patternPrice = resolvePatternPrice(
    formData,
    apparelPatternPrices,
    prefillPatternPriceId,
  );
  if (!patternPrice) return null;

  const methodKey = methodKeyFromName(formData.print_method);
  const cfg = formData.print_method_config || {};

  const itemConfig = {
    apparel_pattern_price_id: patternPrice.id,
    apparel_type_id: patternPrice.apparel_type_id ?? null,
    pattern_type_id: patternPrice.pattern_type_id ?? null,
    print_method_name: formData.print_method || null,
    pattern_type_name: patternPrice.pattern_type_name || formData.pattern_type || null,
    is_custom_fit:
      String(patternPrice.pattern_type_name || formData.pattern_type || "")
        .toLowerCase()
        .trim() === "custom",
    special_print: formData.special_print || null,
    embroidery_size: cfg.embroidery_size || "small",
    embroidery_is_large: cfg.embroidery_size === "large",
    embroidery_manual_price: num(cfg.embroidery_manual_price),
    sublimation_type: cfg.sublimation_type || "partial",
    sublimation_manual_price: num(cfg.sublimation_manual_price),
  };

  // Sizes → items_json (only rows with a quantity matter for pricing).
  const items = (formData.sizes || [])
    .filter((s) => num(s.quantity) > 0 && (s.name || s.size))
    .map((s) => ({
      id: s.id,
      size: s.name || s.size,
      quantity: num(s.quantity),
      unit_price: num(s.unitPrice),
    }));

  // Print parts → print_parts_json (silkscreen colors / DTF sizing).
  const printArea = formData.print_area || "Regular";
  const printParts = (formData.print_parts || []).map((p, i) => {
    // Change 12: each placement carries one print type + one colour count.
    // Fall back to the legacy regular/full split (or the job-level print area)
    // for placements created before the collapse.
    const printType =
      p.printType ||
      (num(p.fullUnitCount) > 0 ||
      String(p.printSize || printArea || "").toLowerCase() === "full"
        ? "full_print"
        : "regular");
    const isFull = printType === "full_print";
    const numColors =
      p.numColors != null && p.numColors !== ""
        ? num(p.numColors)
        : num(p.unitCount) + num(p.fullUnitCount);
    return {
      part: p.part || `Part ${i + 1}`,
      print_type: printType,
      num_colors: numColors,
      print_size: isFull ? "full" : "regular",
      is_full_print: isFull,
      width: num(p.width),
      height: num(p.height),
      pieces: num(p.pieces),
    };
  });

  return {
    item_config_json: JSON.stringify(itemConfig),
    items_json: JSON.stringify(items),
    print_parts_json: JSON.stringify(printParts),
    apparel_neckline_id: formData.apparel_neckline_id || null,
    _meta: { methodKey, patternPriceId: patternPrice.id, items, itemConfig },
  };
};

/**
 * useEnginePricing — live, debounced order pricing through the shared backend
 * engine (Option A). Returns { totals, loading, payload } where totals is the
 * engine breakdown ({ subtotal, grand_total, breakdown_json, ... }) or null
 * when the order isn't priceable yet (no base price / no sized rows).
 */
export const useEnginePricing = ({
  formData,
  apparelPatternPrices,
  prefillPatternPriceId,
}) => {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastPayloadRef = useRef(null);

  const payload = buildEnginePayload({
    formData,
    apparelPatternPrices,
    prefillPatternPriceId,
  });

  // Stable signature of the pricing-relevant inputs for the effect dependency.
  const signature = payload
    ? JSON.stringify({
        i: payload.item_config_json,
        it: payload.items_json,
        pp: payload.print_parts_json,
        nk: payload.apparel_neckline_id,
      })
    : null;

  useEffect(() => {
    if (!payload || !signature) {
      setTotals(null);
      return;
    }
    const hasItems = (payload._meta?.items || []).length > 0;
    if (!hasItems) {
      setTotals(null);
      return;
    }

    let cancelled = false;
    lastPayloadRef.current = payload;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const { _meta, ...body } = payload;
        const res = await orderApi.preview(body);
        if (!cancelled) setTotals(res);
      } catch {
        if (!cancelled) setTotals(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return { totals, loading, payload };
};
