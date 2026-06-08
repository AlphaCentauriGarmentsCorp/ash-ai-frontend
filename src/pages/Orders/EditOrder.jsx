import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Loader from "../../components/common/Loader";
import AddNewOrder from "./AddNewOrder";
import { orderApi } from "../../api/orderApi";
import { parseApiError } from "../../utils/parseApiError";

/**
 * EditOrder — loads an order by PO code and renders the order form in edit
 * mode. All the heavy lifting (form, validation, engine pricing, the
 * superadmin incomplete-override modal) is reused from AddNewOrder via its
 * `editOrder` prop; this page only handles loading + the lock guard.
 */
const crumbs = [
  { label: "Home", href: "/" },
  { label: "Orders", href: "/orders" },
];

export default function EditOrder() {
  const { po_code } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await orderApi.getOrder(po_code);
        const data = res?.data ?? res; // single resource is wrapped in { data }
        if (alive) setOrder(data);
      } catch (err) {
        if (alive) setError(parseApiError(err).message || "Could not load this order.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [po_code]);

  if (loading) {
    return <Loader pageTitle="Edit Order" path="/" links={crumbs} />;
  }

  if (error || !order) {
    return (
      <AdminLayout pageTitle="Edit Order" path="/" links={crumbs}>
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || "Order not found."}
        </div>
      </AdminLayout>
    );
  }

  // An order that has entered production can no longer be edited (the backend
  // enforces this too with ORDER_LOCKED_FOR_EDIT).
  if (order.is_editable === false) {
    return (
      <AdminLayout pageTitle={`Edit Order ${order.po_code}`} path="/" links={crumbs}>
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800 text-sm">
          <i className="fas fa-lock mt-0.5"></i>
          <div>
            <p className="font-semibold">This order can no longer be edited.</p>
            <p className="mt-0.5">
              {order.po_code} has already entered production. Editing is only
              available before a payment is approved.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return <AddNewOrder editOrder={order} />;
}
