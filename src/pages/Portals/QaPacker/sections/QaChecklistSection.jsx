import React, { useMemo } from "react";
import useDraftState from "../../../../hooks/useDraftState";

/**
 * Phase 7-B Bundle 3 — QA Checklist section.
 *
 * Renders the 7 master QA items as big tappable rows. Tick state lives
 * in localStorage (Q5 decision), keyed on (orderStageId, userId), so
 * a closed tab or refresh doesn't lose work. The submit flow in
 * Bundle 4 reads this state out and clears it after success.
 *
 * Per Q4 decision (soft block): unchecked items don't prevent submit,
 * but Bundle 4's submit will surface a confirmation modal if any are
 * left unticked. This section just exposes the current state.
 *
 * Tick state shape (stored in localStorage):
 *   { qa: { correct_print: true, correct_size: false, ... } }
 *
 * The shared `useDraftState` key is `qa-packer:{orderStageId}:{userId}`
 * — same key Bundle 4 will read.
 *
 * Props:
 *   qaChecklist     - array of {id, slug, label, display_order} from context
 *   orderStageId    - drives the localStorage key
 *   userId          - drives the localStorage key
 */
const QaChecklistSection = ({
  qaChecklist = [],
  orderStageId,
  userId,
  sectionNumber = 3,
}) => {
  const draftKey = `qa-packer:${orderStageId}:${userId || "anon"}`;
  const [draft, setDraft] = useDraftState(draftKey, { qa: {}, packing: {} });

  const checkedCount = useMemo(() => {
    return qaChecklist.filter((item) => draft.qa?.[item.slug]).length;
  }, [qaChecklist, draft.qa]);

  const total = qaChecklist.length;
  const allChecked = checkedCount === total && total > 0;
  const noneChecked = checkedCount === 0;

  const toggle = (slug) => {
    setDraft((prev) => ({
      ...prev,
      qa: {
        ...(prev.qa || {}),
        [slug]: !prev.qa?.[slug],
      },
    }));
  };

  const checkAll = () => {
    setDraft((prev) => {
      const next = { ...(prev.qa || {}) };
      qaChecklist.forEach((item) => {
        next[item.slug] = true;
      });
      return { ...prev, qa: next };
    });
  };

  const clearAll = () => {
    setDraft((prev) => ({ ...prev, qa: {} }));
  };

  // Progress bar colouring follows completion.
  let progressClass = "bg-gray-300";
  if (allChecked) progressClass = "bg-emerald-500";
  else if (checkedCount > 0) progressClass = "bg-amber-400";

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center"><i className="fa-solid fa-list-check text-[11px]" /></span>
          QA Checklist
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

      {/* Progress indicator */}
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
              All inspections passed
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
          Auto-saved sa device mo. Maaaring i-submit kahit hindi pa kumpleto —
          may confirmation muna bago tuluyang i-submit.
        </p>
      </div>

      {/* Checklist items */}
      {total === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Walang nakaset na QA items. Mag-seed muna ng QaChecklistItemSeeder.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {qaChecklist.map((item) => {
            const checked = !!draft.qa?.[item.slug];
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

export default QaChecklistSection;
