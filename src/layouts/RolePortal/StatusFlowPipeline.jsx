import React from "react";

/**
 * Phase 5-A — Horizontal status flow pipeline.
 *
 * Renders a series of step circles connected by lines, with one
 * highlighted as the current step. Steps to the left of the current
 * one are shown completed; steps to the right are pending.
 *
 * Props:
 *   stages           — array of { key, label, icon? } objects.
 *                      key is matched against currentStageSlug.
 *   currentStageSlug — the slug of the current step (e.g. "sample_cutting")
 *
 * Per the mockups, this typically shows 6 steps:
 *   Payment Verified → Graphic Artwork → Screen Making →
 *   Sample Creation → Sample Approval → Mass Production
 *
 * But it accepts any number of stages, so portals showing the full
 * 14-stage flow (e.g. Super Admin) work too.
 */
const StatusFlowPipeline = ({ stages = [], currentStageSlug = null }) => {
  if (!stages.length) return null;

  // Find the index of the current stage to determine completed/pending styling.
  const currentIndex = stages.findIndex((s) => s.key === currentStageSlug);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 mb-3">
        Status Flow
      </h4>
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {stages.map((stage, i) => {
          const isCurrent = i === currentIndex;
          const isCompleted = currentIndex !== -1 && i < currentIndex;
          const isPending = !isCurrent && !isCompleted;

          // Step circle styling.
          let circleClass = "bg-gray-200 text-gray-400 border-gray-200";
          if (isCompleted) {
            circleClass = "bg-emerald-500 text-white border-emerald-500";
          } else if (isCurrent) {
            circleClass =
              "bg-primary text-white border-primary ring-4 ring-primary/15";
          }

          // Label styling.
          let labelClass = "text-gray-400";
          if (isCompleted) labelClass = "text-gray-700";
          if (isCurrent) labelClass = "text-primary font-semibold";

          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center text-center min-w-[80px] flex-1">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${circleClass}`}
                >
                  {isCompleted ? (
                    <i className="fa-solid fa-check text-xs" />
                  ) : (
                    <i className={`fa-solid ${stage.icon || "fa-circle"} text-[10px]`} />
                  )}
                </div>
                <p className={`text-[10px] mt-1.5 leading-tight px-1 ${labelClass}`}>
                  {stage.label}
                </p>
              </div>

              {/* Connector line, except after the last step */}
              {i < stages.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mt-[-18px] min-w-[20px] ${isCompleted ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StatusFlowPipeline;
