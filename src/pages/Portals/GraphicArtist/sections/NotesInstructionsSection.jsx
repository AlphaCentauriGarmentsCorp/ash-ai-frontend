import React from "react";

/**
 * Phase 5-H — Notes / Instructions.
 *
 * Read-only display of CSR-provided special instructions (from
 * order.notes) and the artist's design notes (from design.notes).
 * Stage notes are edited in the StageNotesSection below.
 */
const NotesInstructionsSection = ({ order, design }) => {
  const orderNotes = order?.notes;
  const designNotes = design?.notes;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          7
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
        <div className="border border-gray-200 rounded p-3 bg-gray-50">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
            Design Notes
          </p>
          {designNotes ? (
            <p className="text-xs text-gray-800 whitespace-pre-wrap">{designNotes}</p>
          ) : (
            <p className="text-[11px] text-gray-400 italic">Wala pang design notes.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default NotesInstructionsSection;
