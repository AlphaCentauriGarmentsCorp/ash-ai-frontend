import React, { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import { csrPortalApi } from "../../../api/csrPortalApi";
import SampleDecisionModal from "../../../components/sampleApprovals/SampleDecisionModal";
import Loader from "../../../components/common/Loader";

/**
 * SampleApprovalsPage — Phase 3, the CSR "Samples for Approval" worklist.
 *
 * Lists orders sitting at the sample_approval stage (i.e. a packed sample is
 * ready for the client's verdict), so CSR never has to hunt for the PO. Each
 * card opens the order-scoped SampleDecisionModal:
 *   approve → advances to mass-production payment;
 *   reject  → loops the sample sub-flow back to Graphic Artwork.
 *
 * Stage-driven — backed by GET /csr/sample-approvals (csrPortalApi
 * .getSampleApprovals), which reads the live sample_approval stage, NOT the
 * ClientApproval log.
 */
const waitLabel = (seconds) => {
  if (seconds == null) return null;
  const h = Math.floor(seconds / 3600);
  if (h < 1) return "just now";
  if (h < 24) return `waiting ${h}h`;
  return `waiting ${Math.floor(h / 24)}d`;
};

const SampleApprovalsPage = () => {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);

  const fetchAwaiting = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await csrPortalApi.getSampleApprovals();
      setRows(Array.isArray(res?.data) ? res.data : []);
      setCount(res?.count ?? 0);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load the samples-for-approval list.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwaiting();
  }, []);

  // Shape a list row into the order object SampleDecisionModal expects.
  const orderFromRow = (row) => ({
    id: row.order_id,
    po_code: row.po_code || row.project_no,
    client_name: row.client_name || row.client,
    client_brand: row.client_brand || row.brand,
  });

  return (
    <AdminLayout
      pageTitle="Samples for Approval"
      path="/samples/approval"
      links={[
        { label: "Home", href: "/" },
        { label: "Samples for Approval", href: "#" },
      ]}
    >
      <div className="bg-light p-3 sm:p-4 lg:p-7 rounded-lg border border-gray-200 lg:border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Samples awaiting your approval
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
              No samples awaiting approval.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Orders show up here once their sample is packed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {rows.map((row) => (
              <div
                key={row.order_stage_id || row.order_id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {row.po_code || row.project_no}
                    </p>
                    <p className="text-sm text-gray-600">
                      {row.client_name || row.client || "—"}
                      {row.client_brand || row.brand
                        ? ` · ${row.client_brand || row.brand}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                    <i className="fa-solid fa-shirt mr-1" />
                    Sample ready
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div className="text-xs text-gray-400">
                    {waitLabel(row.waiting_seconds)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActive(row)}
                    className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-clipboard-check"></i>
                    Review sample
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <SampleDecisionModal
          order={orderFromRow(active)}
          onClose={() => setActive(null)}
          onDecided={() => {
            setActive(null);
            fetchAwaiting();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default SampleApprovalsPage;
