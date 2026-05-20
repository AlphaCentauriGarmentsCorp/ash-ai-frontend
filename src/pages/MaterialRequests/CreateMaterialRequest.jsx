import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { materialRequestsApi } from "../../api/materialRequestsApi";
import { orderApi } from "../../api/orderApi";
import { materialsApi } from "../../api/materialsApi";

/**
 * Phase 3 — New Material Request form.
 *
 * UX:
 *  - Pick an order (only orders with an active stage are listed)
 *  - Add 1+ line items: material + quantity + optional notes
 *  - Optional reason field
 *  - Submit → POST /material-requests
 *
 * Permission gating:
 *  - The sidebar entry is hidden for users without
 *    material_requests.create. If a user navigates here directly
 *    anyway, the backend returns 403 and we surface the message.
 *  - Stage-restriction is enforced server-side; if the user picks an
 *    order whose current stage isn't theirs, we surface the 422 error
 *    inline so they understand why.
 */

const emptyItem = () => ({
  material_id: "",
  quantity_requested: "",
  notes: "",
});

const CreateMaterialRequest = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState(null);

  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Bootstrap pickers in parallel.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [orderRes, matRes] = await Promise.all([
          orderApi.withActiveStage(),
          materialsApi.index(),
        ]);
        if (cancelled) return;

        setOrders(orderRes?.data ?? []);

        // materialsApi.index() returns an array directly in some
        // environments and { data: [...] } in others. Support both.
        const matList = Array.isArray(matRes) ? matRes : (matRes?.data ?? []);
        setMaterials(matList);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load form data:", err);
        setBootError(
          err?.response?.data?.message ||
            "Failed to load orders/materials. You may not have permission to view orders.",
        );
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateItem = (idx, patch) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    // Strip empty rows; the backend already validates at-least-one but
    // we don't want to send rows with no material picked.
    const cleanedItems = items
      .filter((row) => row.material_id && row.quantity_requested)
      .map((row) => ({
        material_id: Number(row.material_id),
        quantity_requested: Number(row.quantity_requested),
        notes: row.notes || undefined,
      }));

    if (!orderId) {
      setErrors({ order_id: "Please select an order." });
      setSubmitting(false);
      return;
    }
    if (cleanedItems.length === 0) {
      setErrors({ items: "Add at least one material with a quantity." });
      setSubmitting(false);
      return;
    }

    try {
      const created = await materialRequestsApi.create({
        order_id: Number(orderId),
        reason: reason || undefined,
        items: cleanedItems,
      });

      // Navigate to the detail page of the new MR.
      const newId = created?.data?.id;
      if (newId) {
        navigate(`/material-requests/${newId}`, { replace: true });
      } else {
        navigate("/material-requests", { replace: true });
      }
    } catch (err) {
      console.error("Create MR failed:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 422 && data?.errors) {
        // Flatten the Laravel-style errors object so we can show
        // field-level messages without reproducing nested keys.
        const flat = {};
        Object.entries(data.errors).forEach(([field, msgs]) => {
          flat[field] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        });
        setErrors(flat);
        setGeneralError(data.message || "Validation failed. Please fix the errors.");
      } else if (status === 403) {
        setGeneralError("You don't have permission to create a material request.");
      } else {
        setGeneralError(
          data?.message || "Failed to create material request. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for showing the active-stage hint after picking an order.
  const selectedOrder = orders.find((o) => String(o.id) === String(orderId));

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            New Material Request
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Request materials needed for the order's current production stage.
          </p>
        </div>

        {bootLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            <i className="fa-solid fa-spinner fa-spin mr-2" />
            Loading orders and materials…
          </div>
        )}

        {!bootLoading && bootError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            <i className="fa-solid fa-triangle-exclamation mr-2" />
            {bootError}
          </div>
        )}

        {!bootLoading && !bootError && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-gray-200"
          >
            {generalError && (
              <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-700 text-sm">
                <i className="fa-solid fa-triangle-exclamation mr-2" />
                {generalError}
              </div>
            )}

            {/* Order picker */}
            <div className="p-6 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order <span className="text-red-500">*</span>
              </label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.order_id ? "border-red-300" : "border-gray-300"
                }`}
                disabled={submitting}
              >
                <option value="">— Select an order —</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.po_code}
                    {o.client_brand ? ` — ${o.client_brand}` : ""}
                    {o.current_stage?.stage
                      ? ` (stage: ${o.current_stage.stage.replace(/_/g, " ")})`
                      : ""}
                  </option>
                ))}
              </select>
              {errors.order_id && (
                <p className="mt-1 text-xs text-red-600">{errors.order_id}</p>
              )}
              {selectedOrder?.current_stage?.stage && (
                <p className="mt-2 text-xs text-gray-500">
                  Current stage:{" "}
                  <span className="font-medium text-gray-700">
                    {selectedOrder.current_stage.stage.replace(/_/g, " ")}
                  </span>
                  {" — "}
                  status: <span className="font-medium">{selectedOrder.current_stage.status}</span>
                </p>
              )}
              {orders.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No orders with an active stage are available.
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="p-6 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Running low on red thread for cutting stage"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reason ? "border-red-300" : "border-gray-300"
                }`}
                disabled={submitting}
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Items */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Materials <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={submitting}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <i className="fa-solid fa-plus mr-1" />
                  Add another
                </button>
              </div>

              {errors.items && (
                <p className="mb-3 text-xs text-red-600">{errors.items}</p>
              )}

              <div className="space-y-3">
                {items.map((row, idx) => {
                  const itemErr = (key) =>
                    errors[`items.${idx}.${key}`] || errors[`items.${idx}`];
                  const selectedMat = materials.find(
                    (m) => String(m.id) === String(row.material_id),
                  );
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <div className="col-span-5">
                        <select
                          value={row.material_id}
                          onChange={(e) =>
                            updateItem(idx, { material_id: e.target.value })
                          }
                          disabled={submitting}
                          className={`w-full rounded-md border px-2 py-2 text-sm ${
                            itemErr("material_id") ? "border-red-300" : "border-gray-300"
                          }`}
                        >
                          <option value="">— Material —</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                              {m.unit ? ` (${m.unit})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.quantity_requested}
                          onChange={(e) =>
                            updateItem(idx, { quantity_requested: e.target.value })
                          }
                          placeholder="Qty"
                          disabled={submitting}
                          className={`w-full rounded-md border px-2 py-2 text-sm ${
                            itemErr("quantity_requested") ? "border-red-300" : "border-gray-300"
                          }`}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => updateItem(idx, { notes: e.target.value })}
                          placeholder="Notes (optional)"
                          disabled={submitting}
                          className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={submitting || items.length === 1}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove this item"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                      {selectedMat && (
                        <div className="col-span-12 -mt-1 ml-1 text-xs text-gray-500">
                          Stock on hand:{" "}
                          <span className="font-medium text-gray-700">
                            {selectedMat.stock_on_hand ?? 0} {selectedMat.unit || ""}
                          </span>
                        </div>
                      )}
                      {(itemErr("material_id") || itemErr("quantity_requested")) && (
                        <div className="col-span-12 ml-1 text-xs text-red-600">
                          {itemErr("material_id") || itemErr("quantity_requested")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/material-requests")}
                disabled={submitting}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  "Create Material Request"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateMaterialRequest;
