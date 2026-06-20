import React, { useEffect, useState } from "react";
import { orderApi } from "../../api/orderApi";
import Pricing from "../../features/order/orderDetails/Pricing";
import DesignFiles from "../../features/order/orderDetails/DesignFiles";
import POItemsSizeBreakdown from "../../features/order/orderDetails/POItemsSizeBreakdown";

// Human labels for the raw payment_type, matching the Enter Payment form.
const TYPE_LABELS = {
  sample: "Sample",
  down_payment: "Down Payment",
  balance: "Balance",
  full: "Full Payment",
};

const peso = (n) =>
  n == null || n === ""
    ? "—"
    : `₱${Number(n).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// Only image proofs can render inline; PDFs (also allowed) fall back to a link.
const isImage = (u) =>
  !!u && /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(String(u).split("?")[0]);

// One read-only "field": label + a value box styled like a disabled input.
const Field = ({ label, children, full = false }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <p className="block text-xs font-medium text-gray-700 mb-1">{label}</p>
    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 min-h-[38px] break-words">
      {children}
    </div>
  </div>
);

/**
 * OrderPaymentDetailModal — read-only order + payment detail popup. Always
 * shows an Order Information summary from the list row, then fetches the full
 * order (orderApi.getOrder) to render the Pricing Summary, PO Items & Size
 * Breakdown, and Design Files & Mockups sections — reusing the Order Details
 * page components so the popup stays in sync with the page. With showPayment
 * it also shows the recorded Payment Information + the proof image (Dashboard
 * Pending Approvals); the CSR Awaiting list passes showPayment={false} since
 * no payment is recorded there yet. Degrades gracefully if the fetch fails.
 */
const OrderPaymentDetailModal = ({ row, showPayment = false, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!row?.project_no) {
      setLoadingOrder(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoadingOrder(true);
        setOrderError(false);
        const body = await orderApi.getOrder(row.project_no);
        if (alive) setOrder(body?.data ?? body ?? null);
      } catch {
        if (alive) setOrderError(true);
      } finally {
        if (alive) setLoadingOrder(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [row?.project_no]);

  if (!row) return null;

  const typeLabel = TYPE_LABELS[row.payment_type] || row.gate || "—";

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/40 overflow-y-auto"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">Order &amp; Payment Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Read-only summary of the order{showPayment ? " and its payment" : ""}.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {/* Order context */}
          <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <span className="text-gray-500">Order</span>{" "}
            <span className="font-medium text-gray-900">
              {row.project_no || `#${row.order_id}`}
            </span>
            {row.client && (
              <span className="text-gray-600">
                {" "}&mdash; {row.client}
                {row.brand ? ` (${row.brand})` : ""}
              </span>
            )}
            {row.rush && (
              <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
                RUSH
              </span>
            )}
          </div>

          {/* Order Information summary (from the list row) */}
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Order Information
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <Field label="PO Code">{row.project_no || "—"}</Field>
            <Field label="Pieces">{row.qty != null ? `${row.qty} pcs` : "—"}</Field>
            <Field label="Client Name">{row.client || "—"}</Field>
            <Field label="Client Brand">{row.brand || "—"}</Field>
          </div>

          {/* Full-order sections (Pricing / PO Items & Size Breakdown / Design) */}
          {loadingOrder ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              Loading order details…
            </div>
          ) : orderError || !order ? (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              <i className="fa-solid fa-circle-info mr-1" />
              Couldn’t load the full order breakdown.
            </p>
          ) : (
            <div className="flex flex-col gap-y-5">
              <Pricing order={order} />
              <POItemsSizeBreakdown order={order} />
              <DesignFiles order={order} />
            </div>
          )}

          {/* Payment Information — Pending Approvals only (recorded payment) */}
          {showPayment && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-6">
                Payment Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Payment Type">{typeLabel}</Field>
                <Field label="Amount (PHP)">{peso(row.amount)}</Field>
                <Field label="Payer Name">{row.payer || "—"}</Field>
                <Field label="Payment Date & Time">{fmtDateTime(row.paid_at)}</Field>
                <Field label="Payment Method">{row.method || "—"}</Field>
                <Field label="Reference Number">{row.reference_number || "—"}</Field>
              </div>
              <p className="text-xs font-medium text-gray-700 mb-1 mt-3">Proof of Payment</p>
              {row.proof_url ? (
                isImage(row.proof_url) ? (
                  <a href={row.proof_url} target="_blank" rel="noreferrer" className="inline-block">
                    <img
                      src={row.proof_url}
                      alt="Proof of payment"
                      className="max-h-72 w-auto rounded-md border border-gray-200 object-contain bg-gray-50"
                    />
                  </a>
                ) : (
                  <a
                    href={row.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm rounded-lg border border-gray-300 text-gray-700 px-3 py-2 hover:bg-gray-50"
                  >
                    <i className="fa-solid fa-file-arrow-down" /> Open proof (PDF)
                  </a>
                )
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                  —
                </div>
              )}
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentDetailModal;
