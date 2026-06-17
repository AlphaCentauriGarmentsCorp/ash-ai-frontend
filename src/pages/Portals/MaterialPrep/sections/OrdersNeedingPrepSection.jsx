import React, { useEffect, useState } from "react";
import { materialPrepPortalApi } from "../../../../api/materialPrepPortalApi";
import MaterialRequirementsPanel from "../MaterialRequirementsPanel";
import StageDoneButton from "../../../../components/portals/StageDoneButton";

/**
 * Change 18 — orders currently at the Material Prep stage.
 *
 * Lists orders whose material requirement still needs to be prepared (or
 * already has been), and expands to the shared requirements panel so the
 * role can map sample-usage suggestions to materials and save → Auto-PR.
 */
const OrdersNeedingPrepSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    materialPrepPortalApi
      .ordersAtStage()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data ?? res;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load orders.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);
  const toggle = (id) => setSelected((cur) => (cur === id ? null : id));

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Orders needing material prep
          </h3>
          <p className="text-xs text-gray-500">
            Review the order's material requirement and prepare it.
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          className="text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700 mb-3">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          <i className="fa-regular fa-circle-check text-2xl mb-2 block" />
          No orders waiting for material prep.
        </div>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => {
            const id = o.order?.id;
            const isOpen = selected === id;
            return (
              <li key={id} className="border border-gray-200 rounded-md">
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="w-full text-left p-3 flex items-center justify-between gap-2 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {o.order?.po_code || `Order #${id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {o.order?.client_brand || o.order?.client_name || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.requirement_set ? (
                      o.purchase_needed ? (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          PR {o.pr_status || ""}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          In stock
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        Needs prep
                      </span>
                    )}
                    <i
                      className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} text-gray-400 text-xs`}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 p-3 space-y-3">
                    {o.requirement_set && !o.purchase_needed && (
                      <StageDoneButton
                        label="Prep Done"
                        confirmTitle="Tapos na ang prep?"
                        confirmMessage="Walang bibilhin para sa order na ito (nasa stock na ang materials). Markahan ang Material Prep bilang tapos para magpatuloy ang order."
                        hint="Nasa stock na ang materials — walang PR na hihintayin. Pindutin ang Prep Done para ipasa sa susunod."
                        action={() => materialPrepPortalApi.markPrepDone(id)}
                        onDone={refetch}
                      />
                    )}
                    <MaterialRequirementsPanel orderId={id} onSaved={refetch} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default OrdersNeedingPrepSection;
