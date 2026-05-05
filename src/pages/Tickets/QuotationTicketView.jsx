import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import ticketService from "../../services/ticketService";
import { quotationApi } from "../../api/quotationApi";

const getStatusClassName = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "open") return "bg-red-100 text-red-700 border-red-200";
  if (normalized === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (normalized === "resolved") return "bg-green-100 text-green-700 border-green-200";

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const QuotationTicketView = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotationData, setQuotationData] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const isImageUrl = (u) => {
    if (!u) return false;
    if (typeof u !== "string") return false;
    if (u.startsWith("data:")) return true;
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(u);
  };

  const getFilenameFromUrl = (u) => {
    if (!u) return "file";
    try {
      const parsed = new URL(u, window.location.origin);
      return (parsed.pathname || u).split("/").pop().split("?")[0];
    } catch {
      return u.split("/").pop().split("?")[0];
    }
  };

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const response = await ticketService.get(id);
        setTicket(response.data || response);
      } catch (error) {
        console.error("Failed to load quotation ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);
  const resolveImageUrl = (part) => {
    const rawPath = String(
      part?.image_link || part?.image_url || part?.image_path || part?.image || "",
    ).trim();
    if (!rawPath) return "";
    if (rawPath.startsWith("http") || rawPath.startsWith("data:")) return rawPath;
    const apiUrl = import.meta.env.VITE_API_URL || "";
    let origin = "";
    try { origin = new URL(apiUrl).origin; } catch { origin = ""; }
    if (rawPath.startsWith("/storage/")) return origin ? `${origin}${rawPath}` : rawPath;
    if (rawPath.startsWith("storage/")) return origin ? `${origin}/${rawPath}` : `/${rawPath}`;
    const cleanedPath = rawPath.replace(/^\/+/, "");
    return origin ? `${origin}/storage/${cleanedPath}` : `/storage/${cleanedPath}`;
  };

  useEffect(() => {
    const loadQuotationIfNeeded = async () => {
      if (!ticket || !ticket.quotation_id) return;
      try {
        const res = await quotationApi.show(ticket.quotation_id);
        const q = res.data || res || null;
        if (q) {
          let img = "";
          if (q.image || q.image_link || q.image_url || q.image_path) img = resolveImageUrl(q);
          else if (Array.isArray(q.items) && q.items.length > 0) img = resolveImageUrl(q.items[0]);
          else if (Array.isArray(q.print_parts) && q.print_parts.length > 0) img = resolveImageUrl(q.print_parts[0]);
          setQuotationData({ ...q, _preview_image: img });
        }
      } catch (err) {
        console.error("Failed to load related quotation:", err);
      }
    };

    loadQuotationIfNeeded();
  }, [ticket]);

  return (
    <AdminLayout
      pageTitle={ticket ? `Quotation Ticket #${ticket.id}` : "Quotation Ticket"}
      path={ticket ? `/tickets/quotation/${ticket.id}` : `/tickets/quotation/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Tickets", href: "/tickets" },
        { label: "Quotation Ticket", href: "#" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-300 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-primary">Quotation Ticket</h3>
                <p className="text-sm text-gray-500 mt-1">Verification of Files</p>
              </div>
              {/* preview removed per design — no icon displayed above */}
            </div>
          </div>
          {/* Verify button moved below per request */}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-600 text-sm font-medium">Loading ticket...</p>
            </div>
          </div>
        ) : ticket ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
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
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quotation Number</p>
              <p className="mt-2 text-lg font-semibold text-primary">{quotationData ? (quotationData.quotation_id || quotationData.id) : "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created</p>
              <p className="mt-2 text-lg font-semibold text-primary">{ticket.date_created || ticket.created_at || "-"}</p>
            </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-primary mb-4">Message</h4>
                <div className="rounded-lg bg-gray-50 p-4 whitespace-pre-wrap text-sm text-gray-700 leading-6 min-h-45">
                  {ticket.message || "-"}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-primary mb-3">Parts</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-light/50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left">Part</th>
                        <th className="px-3 py-2 text-left">Uploaded Image</th>
                        <th className="px-3 py-2 text-right"># of Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const parts = quotationData && Array.isArray(quotationData.print_parts) && quotationData.print_parts.length > 0
                          ? quotationData.print_parts
                          : quotationData && Array.isArray(quotationData.items) && quotationData.items.length > 0
                          ? quotationData.items
                          : [];
                        if (parts.length === 0) {
                          return (
                            <tr>
                              <td colSpan="3" className="px-3 py-8 text-center text-gray-400">No parts found</td>
                            </tr>
                          );
                        }
                        return parts.map((part, idx) => {
                          const imageUrl = resolveImageUrl(part);
                          const partName = part.part || part.name || (part.part_id ? `Part #${part.part_id}` : `Item ${idx + 1}`);
                          const unitCount = Number(part.unit_count ?? part.unitCount ?? part.color_count ?? part.colorCount) || 0;
                          return (
                            <tr key={idx} className="hover:bg-light/30">
                              <td className="px-3 py-2 font-medium text-gray-800">{partName}</td>
                              <td className="px-3 py-2">
                                {imageUrl ? (
                                  <a href={imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                                    <img src={imageUrl} alt={partName} className="h-10 w-10 rounded border border-gray-200 object-cover bg-white" />
                                    <span className="text-xs text-primary hover:underline">View image</span>
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400">No uploaded image</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">{unitCount}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {/* Show Verify when open */}
              {ticket && String(ticket.status || "").trim().toLowerCase() === "open" && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Mark this ticket as verified (Resolved)?")) return;
                    try {
                      setVerifying(true);
                      const fd = new FormData();
                      fd.append("request_type", ticket.request_type || ticket.type || "Request");
                      if (ticket.quotation_id) fd.append("quotation_id", ticket.quotation_id);
                      if (ticket.order_id) fd.append("order_id", ticket.order_id);
                      if (ticket.from_role) fd.append("from_role", ticket.from_role);
                      if (ticket.to_role) fd.append("to_role", ticket.to_role);
                      fd.append("message", ticket.message || "");
                      fd.append("status", "resolved");
                      if (Array.isArray(ticket.attachments) && ticket.attachments.length > 0) {
                        ticket.attachments.forEach((a) => {
                          const url = typeof a === "string" ? a : a?.url || a?.path || null;
                          if (url) fd.append("attachment_urls[]", url);
                        });
                      }
                      const updated = await ticketService.update(ticket.id || ticket._id || ticket.ticket_id || ticket.id, fd);
                      setTicket(updated || { ...ticket, status: "resolved" });
                    } catch (err) {
                      console.error("Failed to verify ticket:", err);
                      window.alert(err?.response?.data?.message || "Failed to mark ticket as verified. Please try again.");
                    } finally {
                      setVerifying(false);
                    }
                  }}
                  disabled={verifying}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 text-sm"
                >
                  {verifying ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Verifying...</>) : (<><i className="fas fa-check mr-2"></i>Verify</>)}
                </button>
              )}

              {/* When resolved, show Reopen + Close Ticket */}
              {ticket && String(ticket.status || "").trim().toLowerCase() === "resolved" && (
                <>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Reopen this ticket?")) return;
                      try {
                        setVerifying(true);
                        const fd = new FormData();
                        fd.append("request_type", ticket.request_type || ticket.type || "Request");
                        if (ticket.quotation_id) fd.append("quotation_id", ticket.quotation_id);
                        if (ticket.order_id) fd.append("order_id", ticket.order_id);
                        if (ticket.from_role) fd.append("from_role", ticket.from_role);
                        if (ticket.to_role) fd.append("to_role", ticket.to_role);
                        fd.append("message", ticket.message || "");
                        fd.append("status", "open");
                        if (Array.isArray(ticket.attachments) && ticket.attachments.length > 0) {
                          ticket.attachments.forEach((a) => {
                            const url = typeof a === "string" ? a : a?.url || a?.path || null;
                            if (url) fd.append("attachment_urls[]", url);
                          });
                        }
                        const updated = await ticketService.update(ticket.id || ticket._id || ticket.ticket_id || ticket.id, fd);
                        setTicket(updated || { ...ticket, status: "open" });
                      } catch (err) {
                        console.error("Failed to reopen ticket:", err);
                        window.alert(err?.response?.data?.message || "Failed to reopen ticket. Please try again.");
                      } finally {
                        setVerifying(false);
                      }
                    }}
                    disabled={verifying}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 text-sm"
                  >
                    {verifying ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</>) : (<><i className="fas fa-rotate-left mr-2"></i>Reopen</>)}
                  </button>

                  <button
                    onClick={async () => {
                      if (!window.confirm("Close this ticket?")) return;
                      try {
                        setVerifying(true);
                        const fd = new FormData();
                        fd.append("request_type", ticket.request_type || ticket.type || "Request");
                        if (ticket.quotation_id) fd.append("quotation_id", ticket.quotation_id);
                        if (ticket.order_id) fd.append("order_id", ticket.order_id);
                        if (ticket.from_role) fd.append("from_role", ticket.from_role);
                        if (ticket.to_role) fd.append("to_role", ticket.to_role);
                        fd.append("message", ticket.message || "");
                        fd.append("status", "closed");
                        if (Array.isArray(ticket.attachments) && ticket.attachments.length > 0) {
                          ticket.attachments.forEach((a) => {
                            const url = typeof a === "string" ? a : a?.url || a?.path || null;
                            if (url) fd.append("attachment_urls[]", url);
                          });
                        }
                        const updated = await ticketService.update(ticket.id || ticket._id || ticket.ticket_id || ticket.id, fd);
                        setTicket(updated || { ...ticket, status: "closed" });
                      } catch (err) {
                        console.error("Failed to close ticket:", err);
                        window.alert(err?.response?.data?.message || "Failed to close ticket. Please try again.");
                      } finally {
                        setVerifying(false);
                      }
                    }}
                    disabled={verifying}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 text-sm"
                  >
                    {verifying ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</>) : (<><i className="fas fa-times mr-2"></i>Close Ticket</>)}
                  </button>
                </>
              )}
            </div>
        </>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm text-sm text-gray-500">
            Ticket not found.
          </div>
        )}

        {/* Draft space: quotation-specific fields can be added here later. */}
      </div>
    </AdminLayout>
  );
};

export default QuotationTicketView;
