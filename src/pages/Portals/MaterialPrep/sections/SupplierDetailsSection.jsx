import React, { useState } from "react";
import { materialPrepPortalApi } from "../../../../api/materialPrepPortalApi";
import { supplierApi } from "../../../../api/supplierApi";
import OrderChannelButtons, { CHANNEL_META } from "../../../../components/supplier/OrderChannelButtons";

/**
 * Phase 5-G / Issue 20 — Supplier Details + Selector.
 *
 * Shows current supplier as "CURRENT" (gold highlight) with one-click order
 * channel quick-buttons. Lists auto-matched alternatives, plus a full-supplier
 * picker and an inline quick-add (saved to Material Suppliers, flagged
 * incomplete, then assigned to this PR). The Purchaser can switch ONLY while
 * the PR status is 'pending' (can_change_supplier governs this).
 */

const CHANNEL_OPTIONS = Object.keys(CHANNEL_META);

const SupplierDetailsSection = ({
  supplier,
  alternativeSuppliers = [],
  canChangeSupplier,
  prId,
  onChanged,
}) => {
  const [switching, setSwitching] = useState(false);
  const [pickingId, setPickingId] = useState(null);
  const [error, setError] = useState(null);

  // Full-supplier picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allSuppliers, setAllSuppliers] = useState(null);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState(null);
  const [search, setSearch] = useState("");

  // Inline quick-add
  const [quickOpen, setQuickOpen] = useState(false);
  const [qName, setQName] = useState("");
  const [qType, setQType] = useState("viber");
  const [qUrl, setQUrl] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickError, setQuickError] = useState(null);

  const handleSelect = async (newSupplierId) => {
    if (!canChangeSupplier) return;
    if (newSupplierId === supplier?.id) return;

    setSwitching(true);
    setPickingId(newSupplierId);
    setError(null);

    try {
      await materialPrepPortalApi.assignSupplier(prId, newSupplierId);
      setPickerOpen(false);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.errors?.permission?.[0] ||
        err?.response?.data?.message ||
        "Hindi nakapag-switch ng supplier."
      );
    } finally {
      setSwitching(false);
      setPickingId(null);
    }
  };

  const openPicker = async () => {
    setPickerOpen((v) => !v);
    if (allSuppliers !== null) return; // already loaded
    setAllLoading(true);
    setAllError(null);
    try {
      const payload = await supplierApi.index();
      const arr = Array.isArray(payload) ? payload : (payload?.data ?? []);
      setAllSuppliers(arr);
    } catch (err) {
      setAllError(
        err?.response?.data?.message || "Hindi ma-load ang listahan ng suppliers."
      );
    } finally {
      setAllLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    const name = qName.trim();
    if (!name) return;
    setQuickSaving(true);
    setQuickError(null);
    try {
      const res = await materialPrepPortalApi.quickAddSupplier({
        name,
        channelType: qUrl.trim() ? qType : undefined,
        channelUrl: qUrl.trim() || undefined,
      });
      const created = res?.data ?? res;
      if (created?.id) {
        await materialPrepPortalApi.assignSupplier(prId, created.id);
        setQuickOpen(false);
        setQName("");
        setQUrl("");
        setQType("viber");
        setAllSuppliers(null); // force refetch next time the picker opens
        onChanged?.();
      }
    } catch (err) {
      setQuickError(
        err?.response?.data?.errors?.name?.[0] ||
        err?.response?.data?.errors?.channel_type?.[0] ||
        err?.response?.data?.message ||
        "Hindi na-save ang bagong supplier."
      );
    } finally {
      setQuickSaving(false);
    }
  };

  const IncompleteBadge = () => (
    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
      <i className="fa-solid fa-circle-exclamation mr-1" />
      Kulang pa — kompletuhin
    </span>
  );

  const renderSupplierCard = (s, isCurrent = false) => (
    <div
      key={s.id}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        isCurrent
          ? "bg-amber-50 border-amber-300"
          : "bg-white border-gray-200 hover:border-primary/50"
      }`}
    >
      {isCurrent && (
        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
          <i className="fa-solid fa-check text-xs" />
        </div>
      )}

      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
        <i className="fa-solid fa-store text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
          <div className="flex items-center gap-1">
            {s.is_incomplete && <IncompleteBadge />}
            {isCurrent && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                CURRENT
              </span>
            )}
          </div>
        </div>
        {s.address && s.address.replace(/\|/g, "").trim() && (
          <p className="text-[11px] text-gray-500 mt-0.5">
            <i className="fa-solid fa-location-dot mr-1" />
            {s.address.replace(/\|/g, " ").trim()}
          </p>
        )}
        {s.contact_number && (
          <p className="text-[11px] text-gray-500">
            <i className="fa-solid fa-phone mr-1" />
            {s.contact_number}
          </p>
        )}
        {s.contact_person && (
          <p className="text-[11px] text-gray-500">
            <i className="fa-solid fa-user mr-1" />
            Contact: {s.contact_person}
          </p>
        )}
        {s.notes && (
          <p className="text-[11px] text-gray-600 italic mt-1">"{s.notes}"</p>
        )}

        {/* Issue 20 — one-click order channels */}
        {s.order_channels && s.order_channels.length > 0 ? (
          <div className="mt-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              Order Channels
            </p>
            <OrderChannelButtons channels={s.order_channels} />
          </div>
        ) : (
          isCurrent && (
            <p className="text-[11px] text-gray-400 italic mt-2">
              <i className="fa-solid fa-circle-info mr-1" />
              Walang order channel pa — i-quick-add o i-edit sa Suppliers.
            </p>
          )
        )}
      </div>

      {!isCurrent && canChangeSupplier && (
        <button
          type="button"
          onClick={() => handleSelect(s.id)}
          disabled={switching}
          className="text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 shrink-0"
        >
          {pickingId === s.id ? "Switching…" : "Select Supplier"}
        </button>
      )}
    </div>
  );

  const altIds = new Set([supplier?.id, ...alternativeSuppliers.map((s) => s.id)]);
  const filteredAll = (allSuppliers || []).filter((s) => {
    if (s.id === supplier?.id) return false;
    const q = search.trim().toLowerCase();
    return !q || (s.name || "").toLowerCase().includes(q);
  });

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-store text-[11px]" />
        </span>
        Supplier &amp; Contact Details
      </h2>

      {!canChangeSupplier && (
        <p className="text-[11px] text-gray-500 italic mb-3">
          <i className="fa-solid fa-lock mr-1" />
          Supplier locked — can only change while PR is pending.
        </p>
      )}

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {supplier && renderSupplierCard(supplier, true)}

        {canChangeSupplier && alternativeSuppliers.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mt-2">
              Alternative Suppliers
            </p>
            {alternativeSuppliers.map((s) => renderSupplierCard(s, false))}
          </>
        )}
      </div>

      {/* Issue 20 — full picker + inline quick-add */}
      {canChangeSupplier && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPicker}
            className="text-xs px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50"
          >
            <i className="fa-solid fa-list mr-1.5" />
            {pickerOpen ? "Itago ang listahan" : "Pumili ng ibang supplier"}
          </button>
          <button
            type="button"
            onClick={() => setQuickOpen((v) => !v)}
            className="text-xs px-3 py-2 border border-primary/40 text-primary bg-primary/5 rounded-lg hover:bg-primary/10"
          >
            <i className="fa-solid fa-plus mr-1.5" />
            Magdagdag ng bagong supplier
          </button>
        </div>
      )}

      {/* Inline quick-add form */}
      {canChangeSupplier && quickOpen && (
        <div className="mt-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
          <p className="text-[11px] font-semibold text-gray-700 mb-2">
            Bagong supplier (kokompletuhin mamaya)
          </p>
          {quickError && (
            <div className="mb-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
              {quickError}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={qName}
              onChange={(e) => setQName(e.target.value)}
              placeholder="Pangalan ng supplier *"
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex gap-2">
              <select
                value={qType}
                onChange={(e) => setQType(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
              >
                {CHANNEL_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {CHANNEL_META[t].label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={qUrl}
                onChange={(e) => setQUrl(e.target.value)}
                placeholder="Link / number ng order channel (optional)"
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setQuickOpen(false)}
                disabled={quickSaving}
                className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={quickSaving || !qName.trim()}
                className="text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {quickSaving ? "Sini-save…" : "I-save at piliin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-supplier picker */}
      {canChangeSupplier && pickerOpen && (
        <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Maghanap ng supplier…"
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
          />
          {allLoading && (
            <p className="text-xs text-gray-500 py-2">
              <i className="fa-solid fa-spinner fa-spin mr-1" />
              Nilo-load ang suppliers…
            </p>
          )}
          {allError && (
            <p className="text-xs text-red-700 py-2">{allError}</p>
          )}
          {!allLoading && !allError && (
            <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5">
              {filteredAll.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">Walang nahanap na supplier.</p>
              ) : (
                filteredAll.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-2 p-2 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-900">{s.name}</p>
                        {altIds.has(s.id) && (
                          <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                        {s.is_incomplete && <IncompleteBadge />}
                      </div>
                      {s.order_channels && s.order_channels.length > 0 && (
                        <OrderChannelButtons channels={s.order_channels} className="mt-1" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelect(s.id)}
                      disabled={switching}
                      className="text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 shrink-0"
                    >
                      {pickingId === s.id ? "Switching…" : "Select"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 flex items-start gap-1">
        <i className="fa-solid fa-lightbulb mt-0.5" />
        <span>
          Always choose recommended suppliers for quality assurance and
          smoother transactions.
        </span>
      </div>
    </section>
  );
};

export default SupplierDetailsSection;
