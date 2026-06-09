import React, { useMemo, useState } from "react";
import { qaPackerPortalApi } from "../../../../api/qaPackerPortalApi";
import RejectRepairModal from "../modals/RejectRepairModal";
import useConfirm from "../../../../hooks/useConfirm";

/**
 * Phase 7-B Bundle 3 — Reject / Repair log section.
 *
 * Two big buttons at top open the shared add-modal in different
 * dispositions. Below: a tally summary and a chronological list of
 * everything logged for this stage.
 *
 * Tally math mirrors the backend's QaPackerSubmitService:
 *   - Rejects count toward the threshold (Q4: ≥5 pcs OR ≥10% of qty).
 *   - Repairs are tracked separately and don't contribute to alerts.
 *
 * Threshold calculation here is for display only — the authoritative
 * check is server-side at submit time. We surface it early so the packer
 * gets a heads-up that "this submit will alert Super Admin."
 *
 * Props:
 *   rejectsRepairs   - array from context.rejects_repairs
 *   rejectReasons    - array from context.reject_reasons (for the modal dropdown)
 *   orderId
 *   orderStageId
 *   orderTotalPcs    - from context.task.total_pcs, for percentage math
 *   currentUserId    - whose entries we can delete
 *   onChanged()      - called after a successful add or delete to refetch parent context
 */
const REJECT_THRESHOLD_PCS = 5;
const REJECT_THRESHOLD_PCT = 0.10;

const RejectRepairLogSection = ({
  rejectsRepairs = [],
  rejectReasons = [],
  orderId,
  orderStageId,
  orderTotalPcs = 0,
  currentUserId,
  onChanged,
  sectionNumber = 4,
}) => {
  const [activeModal, setActiveModal] = useState(null); // 'reject' | 'repair' | null
  const [deletingId, setDeletingId] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Tally derived from props — server is the source of truth.
  const tally = useMemo(() => {
    let rejectPcs = 0;
    let repairPcs = 0;
    rejectsRepairs.forEach((entry) => {
      const qty = parseInt(entry.quantity_pcs, 10) || 0;
      if (entry.disposition === "reject") rejectPcs += qty;
      else if (entry.disposition === "repair") repairPcs += qty;
    });

    const pct = orderTotalPcs > 0 ? rejectPcs / orderTotalPcs : 0;
    const exceedsThreshold =
      rejectPcs >= REJECT_THRESHOLD_PCS || pct >= REJECT_THRESHOLD_PCT;

    return { rejectPcs, repairPcs, pct, exceedsThreshold };
  }, [rejectsRepairs, orderTotalPcs]);

  const { confirm, dialog } = useConfirm();

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Burahin?", message: "Sigurado ka? Hindi na maibabalik ito.", confirmLabel: "Burahin", tone: "danger" }))) return;

    setDeletingId(id);
    setGeneralError(null);
    try {
      await qaPackerPortalApi.deleteReject(id);
      onChanged?.();
    } catch (err) {
      setGeneralError(
        err?.response?.data?.message ||
          "Hindi na-delete. Subukan ulit.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setActiveModal(null);
    onChanged?.();
  };

  return (
    <>
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center"><i className="fa-solid fa-triangle-exclamation text-[11px]" /></span>
            Reject / Repair Log
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveModal("reject")}
              className="text-xs bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 inline-flex items-center gap-1.5"
            >
              <i className="fa-solid fa-circle-xmark" />
              Add Reject
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("repair")}
              className="text-xs bg-amber-600 text-white px-3 py-2 rounded-md hover:bg-amber-700 inline-flex items-center gap-1.5"
            >
              <i className="fa-solid fa-screwdriver-wrench" />
              Add Repair
            </button>
          </div>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        {/* Tally summary */}
        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          <div
            className={`p-3 rounded-md border ${
              tally.exceedsThreshold
                ? "bg-red-50 border-red-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Rejects
            </p>
            <p
              className={`text-sm font-bold ${
                tally.rejectPcs > 0 ? "text-red-700" : "text-gray-700"
              }`}
            >
              {tally.rejectPcs} pcs
              {orderTotalPcs > 0 && (
                <span className="text-xs font-normal ml-1">
                  ({(tally.pct * 100).toFixed(1)}% of order)
                </span>
              )}
            </p>
            {tally.exceedsThreshold && (
              <p className="text-[10px] text-red-700 mt-1 inline-flex items-center gap-1">
                <i className="fa-solid fa-bell" />
                Super Admin will be alerted at submit
              </p>
            )}
          </div>

          <div className="p-3 rounded-md border bg-gray-50 border-gray-200">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Repairs
            </p>
            <p
              className={`text-sm font-bold ${
                tally.repairPcs > 0 ? "text-amber-700" : "text-gray-700"
              }`}
            >
              {tally.repairPcs} pcs
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              CSR notified · doesn&apos;t count toward threshold
            </p>
          </div>
        </div>

        {/* Logged entries */}
        {rejectsRepairs.length === 0 ? (
          <p className="text-[11px] text-gray-400 italic">
            Wala pang naka-log na rejects o repairs.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {rejectsRepairs.map((entry) => {
              const isReject = entry.disposition === "reject";
              const accent = isReject
                ? {
                    border: "border-red-200",
                    bg: "bg-red-50",
                    badgeBg: "bg-red-100 text-red-700",
                    badgeLabel: "Reject",
                    badgeIcon: "fa-circle-xmark",
                  }
                : {
                    border: "border-amber-200",
                    bg: "bg-amber-50",
                    badgeBg: "bg-amber-100 text-amber-700",
                    badgeLabel: "Repair",
                    badgeIcon: "fa-screwdriver-wrench",
                  };

              const canDelete = entry.logged_by_user_id
                ? entry.logged_by_user_id === currentUserId
                : true; // Backend includes logged_by name but not always id; trust server's gate.

              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 p-3 rounded-md border ${accent.border} ${accent.bg}`}
                >
                  {/* Thumbnail (if any) */}
                  {entry.photo_path ? (
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(entry.photo_path)}
                      className="shrink-0 w-16 h-16 rounded border border-white overflow-hidden bg-white"
                      aria-label="View photo"
                    >
                      <img
                        src={entry.photo_path}
                        alt="Reject/repair"
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </button>
                  ) : (
                    <div className="shrink-0 w-16 h-16 rounded border border-white bg-white/50 flex items-center justify-center">
                      <i className="fa-solid fa-image text-gray-300 text-xl" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${accent.badgeBg} inline-flex items-center gap-1`}
                      >
                        <i className={`fa-solid ${accent.badgeIcon}`} />
                        {accent.badgeLabel}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {entry.quantity_pcs} pcs
                      </span>
                      {entry.reason?.label && (
                        <span className="text-xs text-gray-700">
                          · {entry.reason.label}
                        </span>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="text-[11px] text-gray-700 italic mb-0.5">
                        &quot;{entry.notes}&quot;
                      </p>
                    )}

                    <p className="text-[10px] text-gray-500">
                      {entry.logged_by ? `by ${entry.logged_by} · ` : ""}
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                      aria-label="Delete entry"
                    >
                      {deletingId === entry.id ? (
                        <i className="fa-solid fa-spinner fa-spin text-xs" />
                      ) : (
                        <i className="fa-solid fa-trash text-xs" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox for photo previews */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[210] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxUrl(null);
            }}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" />
          </button>
          <img
            src={lightboxUrl}
            alt="Reject/repair photo"
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Add modal */}
      {activeModal && (
        <RejectRepairModal
          disposition={activeModal}
          orderId={orderId}
          orderStageId={orderStageId}
          rejectReasons={rejectReasons}
          onClose={() => setActiveModal(null)}
          onSaved={handleSaved}
        />
      )}
      {dialog}
    </>
  );
};

export default RejectRepairLogSection;
