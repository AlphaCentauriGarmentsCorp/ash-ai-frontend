import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import ticketService from "../../services/ticketService";

const getStatusClassName = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "open") return "bg-red-100 text-red-700 border-red-200";
  if (normalized === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (normalized === "resolved") return "bg-green-100 text-green-700 border-green-200";

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const OrderTicketView = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const response = await ticketService.get(id);
        setTicket(response.data || response);
      } catch (error) {
        console.error("Failed to load order ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  return (
    <AdminLayout
      pageTitle={ticket ? `Order Ticket #${ticket.id}` : "Order Ticket"}
      path={ticket ? `/tickets/order/${ticket.id}` : `/tickets/order/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Tickets", href: "/tickets" },
        { label: "Order Ticket", href: "#" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-300 pb-4 mb-5">
          <div>
            <h3 className="text-2xl font-semibold text-primary">Order Ticket</h3>
            <p className="text-sm text-gray-500 mt-1">Draft layout for order-related tickets</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-600 text-sm font-medium">Loading ticket...</p>
            </div>
          </div>
        ) : ticket ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
              <span className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClassName(ticket.status)}`}>
                {ticket.status || "Unknown"}
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">To</p>
              <p className="mt-2 text-lg font-semibold text-primary">{ticket.to_role || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created</p>
              <p className="mt-2 text-lg font-semibold text-primary">{ticket.date_created || ticket.created_at || "-"}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm text-sm text-gray-500">
            Ticket not found.
          </div>
        )}

        {/* Draft space: order-specific fields can be added here later. */}
      </div>
    </AdminLayout>
  );
};

export default OrderTicketView;
