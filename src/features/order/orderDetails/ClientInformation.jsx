import React from "react";

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2 last:border-b-0">
    <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
    <p className="text-xs sm:text-sm font-medium text-right max-w-[60%] break-words">{value || "N/A"}</p>
  </div>
);

const ClientInformation = ({ order }) => {
  const clientName = order?.client?.name || order?.client_name || "N/A";

  const createdAt = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("en-PH", {
      month: "long", day: "2-digit", year: "numeric",
    })
    : "N/A";

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">Client Information</h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <Row label="PO Code" value={order?.po_code} />
        <Row label="Client Name" value={clientName} />
        <Row label="Client Brand" value={order?.client_brand} />
        <Row label="Status" value={
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order?.status === "Completed" ? "bg-green-100 text-green-700" :
              order?.status === "In Production" ? "bg-purple-100 text-purple-700" :
                order?.status === "Approved" ? "bg-blue-100 text-blue-700" :
                  order?.status === "Cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
            }`}>{order?.status || "N/A"}</span>
        } />
        <Row label="Quotation #" value={order?.quotation_id ? `QUO-${String(order.quotation_id).padStart(9, "0")}` : "N/A"} />
        <Row label="Date Created" value={createdAt} />
      </div>
    </section>
  );
};

export default ClientInformation;