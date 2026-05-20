import React from "react";
import { Link } from "react-router-dom";

/**
 * Phase 6-A — "My Inquiries" panel.
 *
 * Shows up to 10 inquiries assigned to the current CSR with non-terminal
 * status (new, contacted, quoted).
 */

const STATUS_STYLES = {
  new:       "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  quoted:    "bg-indigo-100 text-indigo-800",
  converted: "bg-emerald-100 text-emerald-800",
  lost:      "bg-gray-100 text-gray-600",
};

const MyInquiriesList = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <Header />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <Header />
        <div className="text-center py-6 text-gray-400">
          <i className="fa-regular fa-envelope-open text-2xl mb-2" />
          <p className="text-xs">No active inquiries assigned to you.</p>
          <Link
            to="/portal/csr/inquiries"
            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
          >
            View all inquiries →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <Header count={items.length} />
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-gray-500 shrink-0">
                  {item.inquiry_code}
                </span>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    STATUS_STYLES[item.status] || STATUS_STYLES.new
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-900 truncate mt-0.5">
                {item.client_name}
                {item.brand_name && (
                  <span className="font-normal text-gray-500"> · {item.brand_name}</span>
                )}
              </p>
              {item.source && (
                <p className="text-[10px] text-gray-400 mt-0.5">via {item.source}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Link
        to="/portal/csr/inquiries"
        className="block text-center text-xs text-blue-600 hover:underline mt-3 pt-2 border-t border-gray-100"
      >
        View all inquiries →
      </Link>
    </section>
  );
};

const Header = ({ count }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
      <i className="fa-solid fa-envelope text-gray-500" />
      My Inquiries
    </h2>
    {count > 0 && (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
        {count}
      </span>
    )}
  </div>
);

export default MyInquiriesList;
