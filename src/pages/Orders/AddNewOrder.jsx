import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Loader from "../../components/common/Loader";
import { orderApi } from "../../api/orderApi";
import { clientApi } from "../../api/clientApi";
import { apparelPartsApi } from "../../api/apparelPartsApi";
import { apparelNecklineApi } from "../../api/apparelNecklineApi";
import { printMethodApi } from "../../api/printMethodApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

const safeJson = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

export default function AddNewOrder() {
  const location = useLocation();
  const navigate = useNavigate();

  // Prefill data passed from ViewQuotation via navigate state
  const prefill = location.state?.prefill || null;

  // ── Reference data ─────────────────────────────────────────────────────────
  const [clients, setClients] = useState([]);
  const [necklines, setNecklines] = useState([]);
  const [printMethods, setPrintMethods] = useState([]);
  const [apparelParts, setApparelParts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Form state ─────────────────────────────────────────────────────────────
  const buildInitialForm = (p) => ({
    quotation_id: p?.quotation_id ?? "",
    client_id: p?.client_id ?? "",
    client_name: p?.client_name ?? "",
    client_brand: p?.client_brand ?? "",
    apparel_type_id: p?.apparel_type_id ?? "",
    pattern_type_id: p?.pattern_type_id ?? "",
    apparel_neckline_id: p?.apparel_neckline_id ?? "",
    print_method_id: p?.print_method_id ?? "",
    shirt_color: p?.shirt_color ?? "",
    special_print: p?.special_print ?? "",
    print_area: p?.print_area ?? "Regular",
    free_items: p?.free_items ?? "",
    notes: p?.notes ?? "",
    discount_type: p?.discount_type ?? "percentage",
    discount_price: p?.discount_price ?? 0,
    discount_amount: p?.discount_amount ?? 0,
    subtotal: p?.subtotal ?? 0,
    grand_total: p?.grand_total ?? 0,
    item_config_json: safeJson(p?.item_config_json, null),
    items_json: safeJson(p?.items_json, []),
    addons_json: safeJson(p?.addons_json, []),
    breakdown_json: safeJson(p?.breakdown_json, {}),
    print_parts_json: safeJson(p?.print_parts_json, []),
  });

  const [form, setForm] = useState(() => buildInitialForm(prefill));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Load reference data ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [clientsRes, necklinesRes, printMethodsRes, partsRes] = await Promise.all([
          clientApi.index(),
          apparelNecklineApi.index(),
          printMethodApi.index(),
          apparelPartsApi.index(),
        ]);
        setClients(clientsRes.data || clientsRes || []);
        setNecklines(necklinesRes.data || necklinesRes || []);
        setPrintMethods(printMethodsRes.data || printMethodsRes || []);
        setApparelParts(partsRes.data || partsRes || []);
      } catch (err) {
        console.error("Failed to load reference data:", err);
        setServerError("Failed to load form data. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.client_name?.trim()) newErrors.client_name = "Client name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setIsSubmitting(true);
    setServerError("");
    try {
      const payload = {
        ...form,
        // Pass financial totals explicitly so OrderService can store them directly
        subtotal: form.subtotal ?? 0,
        grand_total: form.grand_total ?? 0,
        discount_amount: form.discount_amount ?? 0,
        item_config_json: form.item_config_json ? JSON.stringify(form.item_config_json) : undefined,
        items_json: form.items_json ? JSON.stringify(form.items_json) : undefined,
        addons_json: form.addons_json ? JSON.stringify(form.addons_json) : undefined,
        breakdown_json: form.breakdown_json ? JSON.stringify(form.breakdown_json) : undefined,
        print_parts_json: form.print_parts_json ? JSON.stringify(form.print_parts_json) : undefined,
      };

      await orderApi.create(payload);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      setServerError(err.response?.data?.message || "An error occurred while submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(buildInitialForm(prefill));
    setErrors({});
    setServerError("");
    setSubmitSuccess(false);
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const breakdownData = safeJson(form.breakdown_json, {});
  const itemsData = safeJson(form.items_json, []);
  const printPartsData = safeJson(form.print_parts_json, []);
  const addonsData = safeJson(form.addons_json, []);

  // Read totals directly from form state (carried from quotation columns)
  const subtotal = Number(form.subtotal) || 0;
  const grandTotal = Number(form.grand_total) || 0;
  const discountAmount = Number(form.discount_amount) || 0;

  const resolveImageUrl = (part) => {
    const rawPath = String(part?.image_link || part?.image_url || part?.image_path || part?.image || "").trim();
    if (!rawPath) return "";
    if (rawPath.startsWith("http") || rawPath.startsWith("data:")) return rawPath;
    const apiUrl = import.meta.env.VITE_API_URL || "";
    let origin = "";
    try { origin = new URL(apiUrl).origin; } catch { origin = ""; }
    if (rawPath.startsWith("/storage/")) return origin ? `${origin}${rawPath}` : rawPath;
    const cleanedPath = rawPath.replace(/^\/+/, "");
    return origin ? `${origin}/storage/${cleanedPath}` : `/storage/${cleanedPath}`;
  };

  const formatCurrency = (v) => {
    const n = Number(v) || 0;
    return `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const selectedPrintMethod = printMethods.find(
    (m) => Number(m.id) === Number(form.print_method_id)
  );

  if (loading) {
    return (
      <Loader
        pageTitle="Add Order"
        path="/"
        links={[{ label: "Home", href: "/" }, { label: "Orders", href: "/orders" }]}
      />
    );
  }

  return (
    <AdminLayout
      pageTitle={prefill ? "New Order (from Quotation)" : "Add Order"}
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: prefill ? "New from Quotation" : "Add", href: "#" },
      ]}
    >
      {submitSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fas fa-check-circle text-green-500 text-lg"></i>
          <div>
            <p className="text-green-800 font-semibold text-sm">Order created successfully!</p>
            <p className="text-green-600 text-xs mt-0.5">The order has been saved and assigned a PO code.</p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="ml-auto px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
          >
            View Orders
          </button>
        </div>
      )}

      {serverError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
          <i className="fas fa-exclamation-circle"></i>
          {serverError}
        </div>
      )}

      {/* Prefill banner */}
      {prefill && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-blue-700 text-sm">
          <i className="fas fa-info-circle"></i>
          This order has been pre-filled from Quotation #{prefill.quotation_id}. Review and edit as needed before saving.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Client Info ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <i className="fas fa-user-circle"></i>Client Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={form.client_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Select Client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.client_name ? "border-red-400" : "border-gray-200"}`}
                placeholder="Client name"
              />
              {errors.client_name && <p className="text-red-500 text-xs mt-1">{errors.client_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <input
                type="text"
                name="client_brand"
                value={form.client_brand}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Brand name"
              />
            </div>
          </div>
        </section>

        {/* ── Apparel & Print Details ───────────────────────────────────── */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <i className="fas fa-tshirt"></i>Apparel & Print Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Shirt Color</label>
              <input
                type="text"
                name="shirt_color"
                value={form.shirt_color}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. White"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Neckline</label>
              <select
                name="apparel_neckline_id"
                value={form.apparel_neckline_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Select Neckline —</option>
                {necklines.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Free Items</label>
              <input
                type="text"
                name="free_items"
                value={form.free_items}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Tote bag"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Print Method</label>
              <select
                name="print_method_id"
                value={form.print_method_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Select Print Method —</option>
                {printMethods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Special Print</label>
              <input
                type="text"
                name="special_print"
                value={form.special_print}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Reflective"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Print Area</label>
              <select
                name="print_area"
                value={form.print_area}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Regular">Regular</option>
                <option value="Full">Full</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Additional notes..."
            />
          </div>
        </section>

        {/* ── Discount ─────────────────────────────────────────────────── */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <i className="fas fa-tag"></i>Pricing & Discount
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
              <select
                name="discount_type"
                value={form.discount_type}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₱)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Discount Value {form.discount_type === "percentage" ? "(%)" : "(₱)"}
              </label>
              <input
                type="number"
                name="discount_price"
                value={form.discount_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          {(subtotal > 0 || grandTotal > 0) && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span><span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({form.discount_type === "percentage" ? `${form.discount_price}%` : "Fixed"}):</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-primary border-t border-gray-200 pt-2">
                <span>Grand Total:</span><span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          )}
        </section>

        {/* ── Print Parts (read-only from quotation) ────────────────────── */}
        {printPartsData.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <i className="fas fa-images"></i>Print Parts
              <span className="text-xs font-normal text-gray-400 ml-1">(carried from quotation)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {printPartsData.map((part, idx) => {
                const imageUrl = resolveImageUrl(part);
                const partName = part.part || part.name || `Part ${idx + 1}`;
                return (
                  <div key={idx} className="rounded-lg border border-gray-200 p-3 text-center">
                    {imageUrl ? (
                      <a href={imageUrl} target="_blank" rel="noreferrer">
                        <img src={imageUrl} alt={partName} className="h-20 w-full object-cover rounded mb-2 border" />
                      </a>
                    ) : (
                      <div className="h-20 w-full bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <i className="fas fa-image text-gray-300 text-2xl"></i>
                      </div>
                    )}
                    <p className="text-xs font-medium text-gray-700">{partName}</p>
                    <p className="text-xs text-gray-400">{part.color_count ?? part.colorCount ?? 0} colors</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Size / Items Summary (read-only from quotation) ───────────── */}
        {itemsData.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <i className="fas fa-ruler-combined"></i>Size Breakdown
              <span className="text-xs font-normal text-gray-400 ml-1">(carried from quotation)</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Price/Pc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 font-medium text-primary">{item.size_label || item.size || "—"}</td>
                      <td className="px-3 py-2 text-right">{item.quantity ?? 0}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.price_per_piece)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Addons Summary (read-only from quotation) ─────────────────── */}
        {addonsData.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <i className="fas fa-plus-circle"></i>Addons
              <span className="text-xs font-normal text-gray-400 ml-1">(carried from quotation)</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {addonsData.map((addon, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2">{addon.name || "—"}</td>
                      <td className="px-3 py-2 text-right">{addon.quantity ?? 1}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(addon.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            <i className="fas fa-times mr-2"></i>Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm hover:bg-yellow-100 transition-colors"
          >
            <i className="fas fa-undo mr-2"></i>Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <><i className="fas fa-spinner fa-spin"></i>Saving...</>
            ) : (
              <><i className="fas fa-save"></i>Save Order</>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
