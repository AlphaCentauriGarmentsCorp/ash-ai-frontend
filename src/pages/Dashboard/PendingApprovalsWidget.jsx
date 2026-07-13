import React, { useCallback, useEffect, useRef, useState } from "react";
import { pendingApprovalsApi } from "../../api/pendingApprovalsApi";
import { useBadges } from "../../hooks/useBadges";
import OrderPaymentDetailModal from "../../components/payments/OrderPaymentDetailModal";

function waitingLabel(seconds) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

function fmtPaid(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function peso(n) {
  if (n == null) return "—";
  return `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

/**
 * Pending Approvals queue (Change 1B). Lists every order awaiting a Payment
 * Verification gate; approve / reject / hold in one click without opening the
 * order. Self-gating: a 403 (user lacks action.verify-payment) hides it.
 *
 * Refresh model
 * -------------
 * This widget no longer owns a timer. BadgeProvider is the app's single clock:
 * it ticks on its poll, on tab focus, and immediately after any mutation lands
 * (via the ash:data-changed bus). We reload whenever `tick` changes, so the
 * queue, the sidebar badges and the bell always show the same snapshot.
 *
 * Because this widget already fetches the full queue, it PUBLISHES its count
 * up into BadgeContext rather than making the provider fetch it a second time.
 * That keeps `pendingApprovals` a single number the whole app can trust.
 *
 * Actions are optimistic: the row leaves the list and the counts move on the
 * click. The POST also fires the bus, so a server-truth reload lands ~300ms
 * later and corrects any wrong guess.
 */
export default function PendingApprovalsWidget() {
  const { tick, pendingApprovals, setPendingApprovals, bumpPendingApprovals, bumpAwaiting } =
    useBadges();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [detailRow, setDetailRow] = useState(null);

  // Mount and the provider's first refresh land almost together; without this
  // the queue would be fetched twice on first paint.
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await pendingApprovalsApi.list();
      const data = res.data || [];
      setRows(data);
      setPendingApprovals(res.count ?? data.length);
      setError(null);
    } catch (e) {
      if (e?.response?.status === 403) {
        setHidden(true); // not an approver — hide the widget entirely
      } else {
        setError("Couldn't load pending approvals.");
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [setPendingApprovals]);

  // Mount, then every tick from BadgeProvider (poll / focus / mutation).
  useEffect(() => {
    load();
  }, [load, tick]);

  const dropRow = useCallback((paymentId) => {
    setRows((prev) => prev.filter((r) => r.payment_id !== paymentId));
  }, []);

  const act = useCallback(
    async (fn, id, onSuccess) => {
      setBusyId(id);
      setError(null);
      try {
        await fn();
        onSuccess?.();
      } catch (e) {
        const msg = e?.response?.data?.message || "Action failed. Please try again.";
        setError(msg);
        await load(); // the optimistic guess never happened — resync
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  // Approve: for_verification -> verified. Leaves this queue, and the gate
  // advances (which changes a portal badge — the bus refresh picks that up).
  const onApprove = (row) =>
    act(() => pendingApprovalsApi.approve(row.payment_id), row.payment_id, () => {
      dropRow(row.payment_id);
      bumpPendingApprovals(-1);
    });

  // Reject: for_verification -> rejected. It leaves this queue and reappears on
  // CSR's Awaiting Payment list, which is why that badge goes up by one.
  const onReject = (row) => {
    const reason = window.prompt(`Reject ${row.project_no || "payment"} — reason?`);
    if (reason == null || reason.trim() === "") return;
    act(() => pendingApprovalsApi.reject(row.payment_id, reason.trim()), row.payment_id, () => {
      dropRow(row.payment_id);
      bumpPendingApprovals(-1);
      bumpAwaiting(1);
    });
  };

  // Hold: only the workflow stage is paused. The payment stays `for_verification`,
  // so the row stays in this queue and no badge moves. Deliberately no optimism.
  const onHold = (row) => {
    const reason = window.prompt(`Hold ${row.project_no || "payment"} — reason (optional)?`) || "";
    act(() => pendingApprovalsApi.hold(row.payment_id, reason.trim()), row.payment_id);
  };

  if (hidden) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-800">Pending Approvals</h2>
        {pendingApprovals > 0 && (
          <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
            {pendingApprovals > 99 ? "99+" : pendingApprovals}
          </span>
        )}
        <button
          type="button"
          onClick={load}
          className="ml-auto rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          aria-label="Refresh pending approvals"
        >
          ↻ Refresh
        </button>
      </header>

      {error && (
        <p className="px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="px-4 py-6 text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-500">
          No payments are waiting for verification.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((row) => (
            <li key={row.payment_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    {row.project_no || `Order #${row.order_id}`}
                  </span>
                  {row.rush && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
                      RUSH
                    </span>
                  )}
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                    {row.gate}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-sm text-gray-500">
                  {[row.client, row.brand].filter(Boolean).join(" · ")}
                  {row.qty != null && ` · ${row.qty} pcs`}
                </div>
                <div className="mt-0.5 text-sm text-gray-600">
                  {peso(row.amount)}
                  {row.method && ` \u00b7 ${row.method}`}
                  {row.reference_number && ` · ref ${row.reference_number}`}
                  {" · waiting "}
                  {waitingLabel(row.waiting_seconds)}
                </div>
                {(row.payer || row.paid_at) && (
                  <div className="mt-0.5 text-sm text-gray-500">
                    {row.payer && (
                      <>Paid by <span className="font-medium text-gray-700">{row.payer}</span></>
                    )}
                    {row.paid_at && `${row.payer ? " \u00b7 " : ""}on ${fmtPaid(row.paid_at)}`}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setDetailRow(row)}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
                >
                  Detail
                </button>
                <button
                  type="button"
                  disabled={busyId === row.payment_id}
                  onClick={() => onApprove(row)}
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === row.payment_id}
                  onClick={() => onReject(row)}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-300 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={busyId === row.payment_id}
                  onClick={() => onHold(row)}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hold
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {detailRow && (
        <OrderPaymentDetailModal
          row={detailRow}
          showPayment={true}
          onClose={() => setDetailRow(null)}
        />
      )}
    </section>
  );
}
