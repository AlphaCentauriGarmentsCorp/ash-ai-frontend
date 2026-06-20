import React, { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import { csrPortalApi } from "../../../api/csrPortalApi";
import EnterPaymentModal from "../../../components/payments/EnterPaymentModal";
import OrderPaymentDetailModal from "../../../components/payments/OrderPaymentDetailModal";
import Loader from "../../../components/common/Loader";

/**
 * AwaitingPaymentsPage — Phase 2, the CSR awaiting-payment worklist.
 *
 * Lists orders sitting at a payment gate that still need the client payment
 * recorded (waiting / rejected), so CSR never has to hunt for the PO. Each card
 * opens the order-scoped EnterPaymentModal with the order + type + expected
 * amount pre-filled. Once recorded (with proof) the payment becomes
 * 'for_verification' and drops off this list onto Finance's Dashboard.
 *
 * Backed by GET /csr/payments/awaiting (csrPortalApi.getAwaiting).
 */
const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const AwaitingPaymentsPage = () => {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  const [detailRow, setDetailRow] = useState(null);

  const fetchAwaiting = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await csrPortalApi.getAwaiting();
      setRows(Array.isArray(res?.data) ? res.data : []);
      setCount(res?.count ?? 0);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load the awaiting-payment list.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwaiting();
  }, []);

  // Shape a list row into the order object EnterPaymentModal expects.
  const orderFromRow = (row) => ({
    id: row.order_id,
    po_code: row.project_no,
    client_name: row.client,
    client_brand: row.brand,
    workflow_status: row.gate_stage,
  });

  return (
    <AdminLayout
      pageTitle="Awaiting Payment"
      path="/payments/awaiting"
      links={[
        { label: "Home", href: "/" },
        { label: "Awaiting Payment", href: "#" },
      ]}
    >
      <div className="bg-light p-3 sm:p-4 lg:p-7 rounded-lg border border-gray-200 lg:border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Orders awaiting payment
            </h2>
            {count > 0 && (
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={fetchAwaiting}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <i className={`fa-solid fa-rotate ${loading ? "fa-spin" : ""}`}></i>
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {error}
          </div>
        )}

        {loading ? (
          <Loader inline />
        ) : rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <i className="fa-solid fa-circle-check text-green-400 text-4xl mb-3"></i>
            <p className="text-gray-600 font-medium">
              No payments awaiting recording.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Orders show up here when they reach a payment stage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {rows.map((row) => (
              <div
                key={row.payment_id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {row.project_no}
                    </p>
                    <p className="text-sm text-gray-600">
                      {row.client || "—"}
                      {row.brand ? ` · ${row.brand}` : ""}
                    </p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {row.gate}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Expected</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {peso(row.amount)}
                    </p>
                    {row.qty != null && (
                      <p className="text-xs text-gray-400">{row.qty} pcs</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailRow(row)}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-circle-info"></i>
                      Order Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => setActive(row)}
                      className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-money-bill-wave"></i>
                      Record Payment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <EnterPaymentModal
          order={orderFromRow(active)}
          defaultType={active.payment_type}
          defaultAmount={active.amount}
          onClose={() => setActive(null)}
          onSaved={() => {
            setActive(null);
            fetchAwaiting();
          }}
        />
      )}
      {detailRow && (
        <OrderPaymentDetailModal
          row={detailRow}
          showPayment={false}
          onClose={() => setDetailRow(null)}
        />
      )}

    </AdminLayout>
  );
};

export default AwaitingPaymentsPage;
