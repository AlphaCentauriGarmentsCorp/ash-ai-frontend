import React from "react";

/**
 * Phase 5-H — Notes / Instructions.
 *
 * Read-only display of CSR-provided special instructions (from
 * order.notes) and the Hub → GA instruction thread (CP2 role-notes;
 * read-only here, posted from the order's Review Hub, fed by
 * context.role_notes).
 *
 * CP3 — the "Design Notes" box (design.notes) was removed: it has no
 * reachable writer in the current UI (legacy GraphicEditingService only).
 * The "From CSR / Client" box stays (order.notes is live and flows from
 * Add Order / quotation conversion). Stage notes are edited in the
 * StageNotesSection below.
 */
const NotesInstructionsSection = ({ order, roleNotes }) => {
  const orderNotes = order?.notes;
  const hubInstructions = Array.isArray(roleNotes) ? roleNotes : [];

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-note-sticky text-[11px]" />
        </span>
        Notes / Instructions
      </h2>

      <div className="grid sm:grid-cols-2 gap-3 mt-2">
        <div className="border border-gray-200 rounded p-3 bg-gray-50">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
            From CSR / Client
          </p>
          {orderNotes ? (
            <p className="text-xs text-gray-800 whitespace-pre-wrap">{orderNotes}</p>
          ) : (
            <p className="text-[11px] text-gray-400 italic">Wala pang special instructions.</p>
          )}
        </div>
      </div>

      {/* CP2 — Hub → GA instruction thread (order-level, role-directed).
          Read-only here; posted from the order's Review Hub. */}
      <div className="border border-indigo-200 rounded p-3 bg-indigo-50/60 mt-3">
        <p className="text-[10px] uppercase tracking-wide text-indigo-700 mb-1">
          <i className="fa-solid fa-paper-plane mr-1" />
          Instructions mula sa Review Hub
        </p>
        {hubInstructions.length > 0 ? (
          <ul className="space-y-2">
            {hubInstructions.map((n) => (
              <li
                key={n.id}
                className="bg-white border border-indigo-100 rounded p-2"
              >
                <p className="text-[10px] text-gray-400">
                  {n.author?.name || "\u2014"} · {n.created_at}
                </p>
                <p className="text-xs text-gray-800 whitespace-pre-wrap">
                  {n.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-indigo-900/50 italic">
            Wala pang instructions mula sa Review Hub.
          </p>
        )}
      </div>
    </section>
  );
};

export default NotesInstructionsSection;
