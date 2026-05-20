import React, { useEffect, useState, useMemo } from "react";
import { reportsApi } from "../../../api/reportsApi";
import { stageInputsApi } from "../../../api/stageInputsApi";
import { subcontractApi } from "../../../api/subcontractApi";

/**
 * Phase 4 — Activity Log tab content.
 *
 * Sources:
 *   1. /orders/{id}/production-timeline  → per-stage structural data
 *      (status, durations, delay/waste/reject/subcontract markers)
 *   2. /stage-inputs/waste?order_id=…    → waste log details (with photo)
 *   3. /stage-inputs/reject?order_id=…   → reject log details
 *   4. /subcontract-assignments?order_id=…→ subcontract assignment details
 *
 * Each stage section shows:
 *   - Stage header with status badge + phase chip
 *   - Timing line (started, completed, durations)
 *   - Delay marker if applicable
 *   - Waste / reject entries (with photo thumbnails)
 *   - Subcontract assignments (with status + amount)
 *
 * The page is read-only — actions live in the workflow controls.
 */

const formatDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString();
};

const formatDurationSeconds = (s) => {
  if (s == null) return null;
  const total = Number(s);
  if (!Number.isFinite(total) || total <= 0) return null;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${total}s`;
};

const PhaseChip = ({ phase }) => {
  if (!phase) return null;
  const styles = {
    preprod:  "bg-slate-100 text-slate-700 border-slate-200",
    sample:   "bg-amber-100 text-amber-800 border-amber-200",
    mass:     "bg-blue-100 text-blue-800 border-blue-200",
    delivery: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  const cls = styles[phase] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${cls}`}>
      {phase}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending:      "bg-gray-100 text-gray-700 border-gray-200",
    in_progress:  "bg-blue-50 text-blue-700 border-blue-200",
    for_approval: "bg-amber-50 text-amber-700 border-amber-200",
    completed:    "bg-green-50 text-green-700 border-green-200",
    delayed:      "bg-red-50 text-red-700 border-red-200",
    on_hold:      "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
  const cls = styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  const label = status?.replace(/_/g, " ");
  return (
    <span className={`text-[11px] capitalize px-2 py-0.5 rounded-full border ${cls}`}>
      {label || "—"}
    </span>
  );
};

const SubcontractStatusBadge = ({ status }) => {
  const styles = {
    pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    out:       "bg-purple-50 text-purple-700 border-purple-200",
    returned:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const cls = styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
};

const formatPHP = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(n) || 0);

const ActivityLog = ({ order }) => {
  const orderId = order?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [rejectLogs, setRejectLogs] = useState([]);
  const [subcontracts, setSubcontracts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [tl, waste, reject, sub] = await Promise.all([
          reportsApi.orderTimeline(orderId),
          stageInputsApi.listWaste({ orderId, perPage: 100 }),
          stageInputsApi.listReject({ orderId, perPage: 100 }),
          subcontractApi.list({ orderId, perPage: 100 }),
        ]);
        if (cancelled) return;
        setTimelineData(tl);
        setWasteLogs(waste?.data ?? []);
        setRejectLogs(reject?.data ?? []);
        setSubcontracts(sub?.data ?? []);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.response?.status === 403
            ? "You don't have permission to view production reports."
            : err?.response?.data?.message || "Failed to load activity log.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, refreshKey]);

  // Group waste / reject / subcontracts by stage_id for fast lookup.
  const detailsByStageId = useMemo(() => {
    const map = {};
    const ensure = (id) => {
      if (!map[id]) map[id] = { waste: [], reject: [], subcontracts: [] };
      return map[id];
    };
    wasteLogs.forEach((w) => ensure(w.order_stage_id).waste.push(w));
    rejectLogs.forEach((r) => ensure(r.order_stage_id).reject.push(r));
    subcontracts.forEach((s) => ensure(s.order_stage_id).subcontracts.push(s));
    return map;
  }, [wasteLogs, rejectLogs, subcontracts]);

  if (!orderId) {
    return (
      <div className="text-sm text-gray-500 italic">
        Activity log unavailable — no order context.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        <i className="fa-solid fa-spinner fa-spin mr-2" />
        Loading activity log…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">
        <i className="fa-solid fa-triangle-exclamation mr-1" />
        {error}
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="ml-3 text-xs underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const timeline = timelineData?.timeline ?? [];

  // Attach the matching DB stage_id from the order.orderStages prop, since
  // production-timeline doesn't include the OrderStage primary key directly.
  // Match by stage slug + sequence.
  const stageIdBySequence = {};
  (order?.orderStages || []).forEach((s) => {
    stageIdBySequence[s.sequence] = s.id;
  });

  const stageTotals = timeline.reduce(
    (acc, t) => {
      acc.totalWaste += t.waste_pcs || 0;
      acc.totalReject += t.reject_pcs || 0;
      if (t.subcontracted) acc.subcontractedStages += 1;
      if (t.delayed) acc.delayedStages += 1;
      return acc;
    },
    { totalWaste: 0, totalReject: 0, subcontractedStages: 0, delayedStages: 0 },
  );

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header / summary strip */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-primary"></i>
            Activity Log
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Per-stage timeline, waste & reject logs, and subcontract activity for{" "}
            <span className="font-medium">{timelineData?.order?.po_code}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            <i className="fa-solid fa-trash-can mr-1" />
            {stageTotals.totalWaste} waste pcs
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <i className="fa-solid fa-ban mr-1" />
            {stageTotals.totalReject} reject pcs
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <i className="fa-solid fa-truck-arrow-right mr-1" />
            {stageTotals.subcontractedStages} subcontracted
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {stageTotals.delayedStages} delayed
          </span>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="text-[11px] px-2 py-1 rounded text-gray-600 hover:bg-gray-100 inline-flex items-center"
          >
            <i className="fa-solid fa-rotate-right mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stage list */}
      <div className="flex flex-col gap-y-3">
        {timeline.map((t, idx) => {
          const stageDbId = stageIdBySequence[t.sequence];
          const details = stageDbId ? detailsByStageId[stageDbId] : null;
          const wasteEntries = details?.waste ?? [];
          const rejectEntries = details?.reject ?? [];
          const subcontractEntries = details?.subcontracts ?? [];

          const wallDur = formatDurationSeconds(t.duration_seconds);
          const bizDur = formatDurationSeconds(t.business_duration_seconds);

          const hasAnyDetail =
            wasteEntries.length > 0 ||
            rejectEntries.length > 0 ||
            subcontractEntries.length > 0 ||
            t.delayed;

          return (
            <div
              key={`${t.stage}-${t.sequence}-${idx}`}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              {/* Header row */}
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600 mt-0.5">
                  #{t.sequence}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 capitalize">
                      {String(t.stage).replace(/_/g, " ")}
                    </h4>
                    <PhaseChip phase={t.phase} />
                    <StatusBadge status={t.status} />
                    {t.assigned_role && (
                      <span className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                        <i className="fa-solid fa-user-tag" />
                        {String(t.assigned_role).replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="text-[11px] text-gray-500 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {t.started_at && (
                      <span>
                        <i className="fa-solid fa-play mr-1" />
                        Started {formatDateTime(t.started_at)}
                      </span>
                    )}
                    {t.completed_at && (
                      <span>
                        <i className="fa-solid fa-check mr-1" />
                        Completed {formatDateTime(t.completed_at)}
                      </span>
                    )}
                    {wallDur && (
                      <span>
                        <i className="fa-solid fa-stopwatch mr-1" />
                        {wallDur} wall-clock
                      </span>
                    )}
                    {bizDur && (
                      <span>
                        <i className="fa-solid fa-business-time mr-1" />
                        {bizDur} business hours
                      </span>
                    )}
                  </div>

                  {/* Delay marker */}
                  {t.delayed && (
                    <div className="mt-2 text-[12px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 inline-flex items-center gap-1">
                      <i className="fa-solid fa-triangle-exclamation" />
                      Delayed
                      {t.delay_count > 1 ? ` (${t.delay_count}×)` : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-entries */}
              {hasAnyDetail && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
                  {/* Waste entries */}
                  {wasteEntries.map((w) => (
                    <div
                      key={`w-${w.id}`}
                      className="flex items-start gap-3 text-[12px]"
                    >
                      {w.photo_url ? (
                        <a
                          href={w.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0"
                        >
                          <img
                            src={w.photo_url}
                            alt="waste"
                            className="w-12 h-12 object-cover rounded border border-gray-200"
                          />
                        </a>
                      ) : (
                        <div className="shrink-0 w-12 h-12 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                          <i className="fa-solid fa-image" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-red-700">
                          <i className="fa-solid fa-trash-can mr-1" />
                          Waste: {w.quantity_pcs} pcs
                        </span>
                        {w.logged_by?.name && (
                          <span className="text-gray-500 ml-2">
                            by {w.logged_by.name}
                          </span>
                        )}
                        <span className="text-gray-400 ml-2">
                          {formatDateTime(w.created_at)}
                        </span>
                        {w.notes && (
                          <p className="text-gray-600 italic mt-0.5">
                            “{w.notes}”
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Reject entries */}
                  {rejectEntries.map((r) => (
                    <div
                      key={`r-${r.id}`}
                      className="flex items-start gap-3 text-[12px]"
                    >
                      {r.photo_url ? (
                        <a
                          href={r.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0"
                        >
                          <img
                            src={r.photo_url}
                            alt="reject"
                            className="w-12 h-12 object-cover rounded border border-gray-200"
                          />
                        </a>
                      ) : (
                        <div className="shrink-0 w-12 h-12 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                          <i className="fa-solid fa-image" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-rose-700">
                          <i className="fa-solid fa-ban mr-1" />
                          Reject: {r.quantity_pcs} pcs
                        </span>
                        {r.logged_by?.name && (
                          <span className="text-gray-500 ml-2">
                            by {r.logged_by.name}
                          </span>
                        )}
                        <span className="text-gray-400 ml-2">
                          {formatDateTime(r.created_at)}
                        </span>
                        {r.notes && (
                          <p className="text-gray-600 italic mt-0.5">
                            “{r.notes}”
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Subcontract entries */}
                  {subcontractEntries.map((s) => (
                    <div
                      key={`s-${s.id}`}
                      className="flex items-start gap-3 text-[12px]"
                    >
                      <div className="shrink-0 w-12 h-12 rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                        <i className="fa-solid fa-truck-arrow-right" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-purple-700">
                          {s.subcontractor?.name || "Vendor"} ·{" "}
                          {s.quantity_pcs} pcs · {formatPHP(s.total_amount)}
                        </span>
                        <span className="ml-2">
                          <SubcontractStatusBadge status={s.status} />
                        </span>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Created {formatDateTime(s.created_at)}
                          {s.sent_at && <> · Sent {formatDateTime(s.sent_at)}</>}
                          {s.returned_at && (
                            <> · Returned {formatDateTime(s.returned_at)}</>
                          )}
                        </div>
                        {s.notes && (
                          <p className="text-gray-600 italic mt-0.5">
                            “{s.notes}”
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {timeline.length === 0 && (
          <div className="bg-white rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            No timeline data available for this order yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
