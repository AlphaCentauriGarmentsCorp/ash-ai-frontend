import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import ticketService from "../../services/ticketService";

const getStatusClassName = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "open") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  if (normalized === "resolved") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

export default function TicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ticketService.get(id);
      setTicket(res.data || res);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="View Ticket" path={`/tickets/${id}`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">Loading ticket...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout pageTitle="View Ticket" path={`/tickets/${id}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fa-solid fa-ticket text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 mb-4">Ticket not found</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={`Ticket #${ticket.id}`}
      path={`/tickets/${ticket.id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Tickets", href: "/tickets" },
        { label: `Ticket #${ticket.id}`, href: `/tickets/${ticket.id}` },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-300 pb-4 mb-5">
          <div>
            <h3 className="text-2xl font-semibold text-primary">{ticket.request_type}</h3>
            <p className="text-sm text-gray-500 mt-1">Ticket #{ticket.id} details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
            <span
              className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClassName(
                ticket.status,
              )}`}
            >
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-primary mb-4">Ticket Info</h4>
            <dl className="space-y-3 text-sm">
              {ticket.quotation_id && ticket.quotation_id !== "N/A" && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500">Quotation ID</dt>
                  <dd className="text-right font-medium text-gray-900">{ticket.quotation_id}</dd>
                </div>
              )}
              {ticket.order_id && ticket.order_id !== "N/A" && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500">Order ID</dt>
                  <dd className="text-right font-medium text-gray-900">{ticket.order_id}</dd>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500">Created At</dt>
                <dd className="text-right font-medium text-gray-900">{ticket.date_created || ticket.created_at || "-"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500">Updated At</dt>
                <dd className="text-right font-medium text-gray-900">{ticket.updated_at || "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-primary mb-4">Message</h4>
            <div className="rounded-lg bg-gray-50 p-4 whitespace-pre-wrap text-sm text-gray-700 leading-6 min-h-45">
              {ticket.message || "-"}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-primary mb-3">Attachments</h4>
          <ul className="space-y-2">
            {(ticket.attachments || []).length === 0 && (
              <li className="text-sm text-gray-500">No attachments</li>
            )}
            {(ticket.attachments || []).map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <i className="fa-solid fa-paperclip text-gray-400"></i>
                <a href={a} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                  {a}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}