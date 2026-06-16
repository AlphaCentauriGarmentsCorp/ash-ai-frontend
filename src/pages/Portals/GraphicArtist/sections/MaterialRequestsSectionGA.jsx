import React from "react";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  pending:    "bg-amber-50 text-amber-700",
  approved:   "bg-emerald-50 text-emerald-700",
  rejected:   "bg-red-50 text-red-700",
  fulfilled:  "bg-blue-50 text-blue-700",
};

const MaterialRequestsSectionGA = ({
  materialRequests = [],
  orderId,
  orderStageId,
}) => {
  const navigate = useNavigate();

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            <i className="fa-solid fa-cart-shopping text-[11px]" />
          </span>
          Material Requests
        </h2>

        <button
          type="button"
          onClick={() =>
            navigate(`/material-requests/new?order_id=${orderId}&stage_id=${orderStageId}`)
          }
          className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90 inline-flex items-center gap-1"
        >
          <i className="fa-solid fa-plus" />
          Request Material
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Mag-request agad para hindi maantala ang production.
      </p>

      {materialRequests.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang material requests para sa stage na ito.
        </p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <th className="text-left py-2">MR Code</th>
              <th className="text-left py-2">Reason</th>
              <th className="text-left py-2">Created</th>
              <th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {materialRequests.map((mr) => (
              <tr
                key={mr.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/material-requests/${mr.id}`)}
              >
                <td className="py-2 font-medium text-gray-800">
                  {mr.mr_code || `#${mr.id}`}
                </td>
                <td className="py-2 text-gray-600 truncate max-w-[200px]">
                  {mr.reason || "—"}
                </td>
                <td className="py-2 text-gray-600 text-[11px]">
                  {mr.created_at
                    ? new Date(mr.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="py-2 text-right">
                  <span
                    className={`inline-block text-[10px] capitalize px-2 py-0.5 rounded ${
                      STATUS_STYLES[mr.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {mr.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default MaterialRequestsSectionGA;
