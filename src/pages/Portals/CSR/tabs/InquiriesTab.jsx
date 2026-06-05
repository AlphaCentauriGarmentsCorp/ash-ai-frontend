import React, { useCallback, useEffect, useMemo, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import CreateInquiryModal from "../modals/CreateInquiryModal";
import EditInquiryModal from "../modals/EditInquiryModal";
import ConvertToQuotationConfirmModal from "../modals/ConvertToQuotationConfirmModal";

/**
 * Phase 6-A Bundle 2 — Inquiries tab.
 *
 * Lists all inquiries with status filter pills + search + actions
 * (Edit, Convert to Quotation). New-inquiry button opens
 * CreateInquiryModal.
 */
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "quoted", label: "Quoted" },
  { key: "converted", label: "Converted" },
  { key: "lost", label: "Lost" },
];

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quoted: "bg-indigo-100 text-indigo-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost: "bg-gray-100 text-gray-500",
};

const InquiriesTab = ({ initialFilter = null }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(initialFilter || "all");
  const [search, setSearch] = useState("");

  // Modal state — one at a time
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await csrPortalApi.listInquiries();
      setItems(res?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== "all") {
      list = list.filter((i) => i.status === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.inquiry_code || "").toLowerCase().includes(q) ||
          (i.client_name || "").toLowerCase().includes(q) ||
          (i.brand_name || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, search]);

  const handleCreated = (inquiry) => {
    setItems((prev) => [inquiry, ...prev]);
    setShowCreate(false);
  };

  const handleUpdated = (inquiry) => {
    setItems((prev) => prev.map((i) => (i.id === inquiry.id ? inquiry : i)));
    setEditTarget(null);
  };

  const handleConverted = (updatedInquiry, _quotation) => {
    if (updatedInquiry) {
      setItems((prev) =>
        prev.map((i) => (i.id === updatedInquiry.id ? updatedInquiry : i)),
      );
    }
    setConvertTarget(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filters + search + new */}
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors " +
                    (filter === f.key
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search inquiry, client, brand…"
                  className="w-full md:w-64 text-sm border border-gray-300 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <i className="fa-solid fa-magnifying-glass text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
              </div>
              <button
                type="button"
                onClick={fetchList}
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus" />
                <span className="hidden sm:inline">New Inquiry</span>
              </button>
            </div>
          </div>

          {/* List */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700 mb-3">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} search={search} onCreate={() => setShowCreate(true)} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="py-2 px-2 font-semibold">Code</th>
                      <th className="py-2 px-2 font-semibold">Client</th>
                      <th className="py-2 px-2 font-semibold">Brand</th>
                      <th className="py-2 px-2 font-semibold">Source</th>
                      <th className="py-2 px-2 font-semibold">Status</th>
                      <th className="py-2 px-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono">{i.inquiry_code}</td>
                        <td className="py-2 px-2 font-medium">{i.client_name}</td>
                        <td className="py-2 px-2 text-gray-600">{i.brand_name || "—"}</td>
                        <td className="py-2 px-2 text-gray-600">{i.source || "—"}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${STATUS_STYLES[i.status] || STATUS_STYLES.new
                              }`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap">
                          <RowActions
                            inquiry={i}
                            onEdit={() => setEditTarget(i)}
                            onConvert={() => setConvertTarget(i)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="md:hidden space-y-2">
                {filtered.map((i) => (
                  <li
                    key={i.id}
                    className="border border-gray-200 rounded-md p-3 bg-white"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-gray-500">
                        {i.inquiry_code}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${STATUS_STYLES[i.status] || STATUS_STYLES.new
                          }`}
                      >
                        {i.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">
                      {i.client_name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {i.brand_name || "—"} · {i.source || "—"}
                    </p>
                    <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                      <RowActions
                        inquiry={i}
                        onEdit={() => setEditTarget(i)}
                        onConvert={() => setConvertTarget(i)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateInquiryModal
          onClose={() => setShowCreate(false)}
          onSaved={handleCreated}
        />
      )}
      {editTarget && (
        <EditInquiryModal
          inquiry={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleUpdated}
        />
      )}
      {convertTarget && (
        <ConvertToQuotationConfirmModal
          inquiry={convertTarget}
          onClose={() => setConvertTarget(null)}
          onConverted={handleConverted}
        />
      )}
    </>
  );
};

const RowActions = ({ inquiry, onEdit, onConvert }) => {
  const isConverted = inquiry.status === "converted";
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="text-xs px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
        title="Edit inquiry"
      >
        <i className="fa-solid fa-pen text-[10px]" />
        Edit
      </button>
      {!isConverted && (
        <button
          type="button"
          onClick={onConvert}
          className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"
          title="Convert to quotation"
        >
          <i className="fa-solid fa-file-export text-[10px]" />
          Convert
        </button>
      )}
    </div>
  );
};

const EmptyState = ({ filter, search, onCreate }) => (
  <div className="text-center py-10 text-gray-400">
    <i className="fa-regular fa-envelope-open text-3xl mb-2" />
    <p className="text-sm">
      {search
        ? "No inquiries match your search."
        : filter === "all"
          ? "No inquiries yet."
          : `No inquiries in '${filter}' status.`}
    </p>
    {!search && filter === "all" && (
      <button
        type="button"
        onClick={onCreate}
        className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
      >
        Create your first inquiry →
      </button>
    )}
  </div>
);

export default InquiriesTab;