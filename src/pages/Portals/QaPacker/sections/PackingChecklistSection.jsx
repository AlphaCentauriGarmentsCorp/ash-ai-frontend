import React, { useMemo } from "react";
import useDraftState from "../../../../hooks/useDraftState";

/**
 * Phase 7-B Bundle 4a — Packing Checklist section.
 *
 * Mirrors QaChecklistSection but keyed on the `packing` sub-key of the
 * shared draft. Both sections write to the same localStorage entry so
 * the submit handler can read all of it in one go.
 *
 * Tick state shape (in localStorage at key `qa-packer:{stageId}:{userId}`):
 *   { qa: {...}, packing: { fold_and_pack: true, ... } }
 *
 * Props:
 *   packingChecklist - array from context.packing_checklist
 *   orderStageId
 *   userId
 *   sectionNumber    - usually 5
 */
const PackingChecklistSection = ({
  packingChecklist = [],
  orderStageId,
  userId,
  sectionNumber = 5,
}) => {
  const draftKey = `qa-packer:${orderStageId}:${userId || "anon"}`;
  const [draft, setDraft] = useDraftState(draftKey, { qa: {}, packing: {} });

  const checkedCount = useMemo(() => {
    return packingChecklist.filter((item) => draft.packing?.[item.slug]).length;
  }, [packingChecklist, draft.packing]);

  const total = packingChecklist.length;
  const allChecked = checkedCount === total && total > 0;
  const noneChecked = checkedCount === 0;

  const toggle = (slug) => {
    setDraft((prev) => ({
      ...prev,
      packing: {
        ...(prev.packing || {}),
        [slug]: !prev.packing?.[slug],
      },
    }));
  };

  const checkAll = () => {
    setDraft((prev) => {
      const next = { ...(prev.packing || {}) };
      packingChecklist.forEach((item) => {
        next[item.slug] = true;
      });
      return { ...prev, packing: next };
    });
  };

  const clearAll = () => {
    setDraft((prev) => ({ ...prev, packing: {} }));
  };

  let progressClass = "bg-gray-300";
  if (allChecked) progressClass = "bg-emerald-500";
  else if (checkedCount > 0) progressClass = "bg-amber-400";

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            {sectionNumber}
          </span>
          Packing Checklist
        </h2>

        <div className="flex items-center gap-2">
          {!noneChecked && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[10px] text-gray-500 hover:text-gray-800 px-2 py-1"
            >
              Clear all
            </button>
          )}
          {!allChecked && total > 0 && (
            <button
              type="button"
              onClick={checkAll}
              className="text-[10px] text-primary hover:underline px-2 py-1"
            >
              Check all
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-600">
            <span
              className={
                allChecked ? "text-emerald-700 font-semibold" : "font-medium"
              }
            >
              {checkedCount} of {total}
            </span>{" "}
            items checked
          </p>
          {allChecked && (
            <span className="text-[10px] text-emerald-700 inline-flex items-center gap-1 font-medium">
              <i className="fa-solid fa-circle-check" />
              Ready to pack out
            </span>
          )}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${progressClass}`}
            style={{ width: `${total > 0 ? (checkedCount / total) * 100 : 0}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Auto-saved sa device mo. Same key sa QA Checklist — magkasama silang
          mai-submit.
        </p>
      </div>

      {total === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Walang nakaset na packing items. Mag-seed muna ng PackingChecklistItemSeeder.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {packingChecklist.map((item) => {
            const checked = !!draft.packing?.[item.slug];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.slug)}
                className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                  checked
                    ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                    : "bg-white border-gray-200 hover:border-primary hover:bg-primary/5"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-white border-gray-300"
                  }`}
                  aria-hidden="true"
                >
                  {checked && (
                    <i className="fa-solid fa-check text-white text-xs" />
                  )}
                </span>
                <span
                  className={`text-sm font-medium ${
                    checked ? "text-emerald-900" : "text-gray-800"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PackingChecklistSection;
