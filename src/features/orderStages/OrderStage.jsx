import React, { useEffect, useState } from "react";
import {
  getStageGroups,
  getStatusMeta,
  STAGE_STATUS,
} from "../../constants/formOptions/orderStages";
import { getRoleDisplayName } from "../../config/roleConfig";
import { useOrderStages } from "./hooks/useOrderStages";

/**
 * OrderStage – sequential workflow timeline view.
 *
 * Replaces the legacy checkbox grid. The order's 14-stage workflow is
 * auto-created when the order is stored, so this component is read-only
 * for status and exposes action buttons only on the currently active stage.
 */
const OrderStage = ({ order, onStagesUpdated }) => {
  const {
    stages,
    currentStage,
    stats,
    isLoading,
    error,
    lastMessage,
    advance,
    markForApproval,
    markDelayed,
    markOnHold,
    resume,
    resetState,
  } = useOrderStages(order, onStagesUpdated);

  const [actionStageId, setActionStageId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'delay' | 'hold' | 'approval' | 'complete'
  const [actionInput, setActionInput] = useState("");

  // Auto-dismiss success message after 3s
  useEffect(() => {
    if (!lastMessage) return;
    const t = setTimeout(() => resetState(), 3000);
    return () => clearTimeout(t);
  }, [lastMessage, resetState]);

  const groups = getStageGroups();

  const openAction = (stageId, type) => {
    setActionStageId(stageId);
    setActionType(type);
    setActionInput("");
  };

  const closeAction = () => {
    setActionStageId(null);
    setActionType(null);
    setActionInput("");
  };

  const submitAction = async () => {
    if (!actionStageId) return;

    let result;
    switch (actionType) {
      case "complete":
        result = await advance(actionStageId, actionInput || null);
        break;
      case "approval":
        result = await markForApproval(actionStageId, actionInput || null);
        break;
      case "delay":
        if (!actionInput.trim()) return; // reason required
        result = await markDelayed(actionStageId, actionInput);
        break;
      case "hold":
        result = await markOnHold(actionStageId, actionInput || null);
        break;
      default:
        return;
    }

    if (!result?.error) {
      closeAction();
    }
  };

  // ---- Render helpers ------------------------------------------------
  const renderStageCard = (stage, isLast) => {
    const meta = getStatusMeta(stage.status);
    const isCurrent = currentStage?.id === stage.id;
    const isPending = stage.status === STAGE_STATUS.PENDING;
    const isCompleted = stage.status === STAGE_STATUS.COMPLETED;
    const isInProgress = stage.status === STAGE_STATUS.IN_PROGRESS;
    const isForApproval = stage.status === STAGE_STATUS.FOR_APPROVAL;
    const isDelayed = stage.status === STAGE_STATUS.DELAYED;
    const isOnHold = stage.status === STAGE_STATUS.ON_HOLD;

    return (
      <div key={stage.id} className="relative flex gap-4">
        {/* Timeline rail */}
        <div className="flex flex-col items-center shrink-0 w-10">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              border-2 ${meta.border} ${isCompleted ? "bg-green-500 border-green-500" : meta.bg}
            `}
          >
            <i
              className={`fas ${isCompleted ? "fa-check text-white" : `${meta.icon} ${meta.text}`} text-sm`}
            ></i>
          </div>
          {!isLast && (
            <div
              className={`flex-1 w-0.5 my-1 ${isCompleted ? "bg-green-300" : "bg-gray-200"
                }`}
              style={{ minHeight: "32px" }}
            ></div>
          )}
        </div>

        {/* Card */}
        <div
          className={`
            flex-1 mb-4 rounded-lg border p-4 transition-all
            ${meta.bg} ${meta.border}
            ${isCurrent ? "shadow-md ring-2 ring-primary/20" : ""}
          `}
        >
          <div className="flex flex-col gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600">
                  #{stage.sequence}
                </span>
                <h4 className={`font-semibold text-sm ${meta.text}`}>
                  {stage.label}
                </h4>
                <span
                  className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${meta.bg} ${meta.text} border ${meta.border}`}
                >
                  {meta.label}
                </span>
                {stage.role && (
                  <span className="text-[11px] text-gray-500 inline-flex items-center gap-1">
                    <i className="fas fa-user-tag"></i>
                    {getRoleDisplayName(stage.role)}
                  </span>
                )}
              </div>

              {/* Timing meta */}
              <div className="text-[11px] text-gray-500 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {stage.started_at && (
                  <span>
                    <i className="fas fa-play mr-1"></i>
                    Started {new Date(stage.started_at).toLocaleString()}
                  </span>
                )}
                {stage.completed_at && (
                  <span>
                    <i className="fas fa-check mr-1"></i>
                    Completed {new Date(stage.completed_at).toLocaleString()}
                  </span>
                )}
                {stage.delayed_at && (
                  <span className="text-red-600">
                    <i className="fas fa-triangle-exclamation mr-1"></i>
                    Delayed since {new Date(stage.delayed_at).toLocaleString()}
                  </span>
                )}
                {stage.duration_minutes != null && (
                  <span>
                    <i className="fas fa-clock mr-1"></i>
                    {stage.duration_minutes}m
                  </span>
                )}
              </div>

              {stage.notes && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  <i className="fas fa-quote-left mr-1 text-gray-400"></i>
                  {stage.notes}
                </p>
              )}
            </div>

            {/* Action buttons – appear below info, wrap freely.
                Only visible on the active stage (or delayed/on_hold). */}
            {(isInProgress || isForApproval || isDelayed || isOnHold) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/60">
                {isInProgress && (
                  <>
                    <button
                      type="button"
                      onClick={() => openAction(stage.id, "complete")}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors inline-flex items-center"
                    >
                      <i className="fas fa-check mr-1"></i> Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => openAction(stage.id, "approval")}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 rounded bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors inline-flex items-center"
                    >
                      <i className="fas fa-hourglass-half mr-1"></i> For Approval
                    </button>
                    <button
                      type="button"
                      onClick={() => openAction(stage.id, "delay")}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors inline-flex items-center"
                    >
                      <i className="fas fa-triangle-exclamation mr-1"></i> Delay
                    </button>
                    <button
                      type="button"
                      onClick={() => openAction(stage.id, "hold")}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 disabled:opacity-50 transition-colors inline-flex items-center"
                    >
                      <i className="fas fa-pause mr-1"></i> Hold
                    </button>
                  </>
                )}

                {isForApproval && (
                  <button
                    type="button"
                    onClick={() => openAction(stage.id, "complete")}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors inline-flex items-center"
                  >
                    <i className="fas fa-thumbs-up mr-1"></i> Approve & Complete
                  </button>
                )}

                {(isDelayed || isOnHold) && (
                  <button
                    type="button"
                    onClick={() => resume(stage.id)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center"
                  >
                    <i className="fas fa-play mr-1"></i> Resume
                  </button>
                )}
              </div>
            )}

            {/* Static state indicators (no actions) */}
            {(isPending || isCompleted) && (
              <div className="pt-1">
                {isPending && (
                  <span className="text-[11px] text-gray-400 italic inline-flex items-center">
                    <i className="fas fa-lock mr-1"></i> Locked — waiting for previous stage
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[11px] text-green-600 inline-flex items-center">
                    <i className="fas fa-circle-check mr-1"></i> Done
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActionDialog = () => {
    if (!actionType) return null;

    const titles = {
      complete: "Mark stage as completed?",
      approval: "Send stage for approval?",
      delay: "Why is this stage delayed?",
      hold: "Put this stage on hold?",
    };

    const placeholders = {
      complete: "Optional notes (e.g. quality observations)",
      approval: "Optional notes for the approver",
      delay: "Reason for delay (required)",
      hold: "Optional reason for putting on hold",
    };

    const isReasonRequired = actionType === "delay";
    const canSubmit =
      !isReasonRequired || (actionInput && actionInput.trim().length > 0);

    return (
      <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
          <h3 className="font-semibold text-gray-900 mb-3">
            {titles[actionType]}
          </h3>
          <textarea
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            placeholder={placeholders[actionType]}
            rows={3}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {isReasonRequired && !canSubmit && (
            <p className="text-xs text-red-600 mt-1">
              Please provide a reason.
            </p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={closeAction}
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitAction}
              disabled={isLoading || !canSubmit}
              className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Saving…
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- Empty state ---------------------------------------------------
  if (!stages || stages.length === 0) {
    return (
      <section className="flex flex-col gap-y-4">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          Order Workflow
        </h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
          <i className="fas fa-info-circle mr-2"></i>
          No workflow stages found for this order. They will be created
          automatically when the order is saved.
        </div>
      </section>
    );
  }

  // ---- Main render ---------------------------------------------------
  return (
    <section className="flex flex-col gap-y-5">
      {lastMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500"></i>
            <span className="text-sm">{lastMessage}</span>
          </div>
          <button
            onClick={resetState}
            className="text-green-700 hover:text-green-900"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-circle text-red-500"></i>
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={resetState}
            className="text-red-700 hover:text-red-900"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            Order Workflow
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            14-step sequential pipeline. Each stage must be completed before
            the next can begin.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentStage && (
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 inline-flex items-center gap-2">
              <i className="fas fa-bolt"></i>
              Active: <strong>{currentStage.label}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>
            <strong className="text-gray-900">{stats.completedStages}</strong>{" "}
            of {stats.totalStages} stages completed
          </span>
          <span className="font-semibold text-gray-900">
            {stats.completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${stats.completionPercentage}%` }}
          ></div>
        </div>
        {(stats.delayedStages > 0 || stats.onHoldStages > 0) && (
          <div className="flex gap-3 mt-2 text-[11px]">
            {stats.delayedStages > 0 && (
              <span className="text-red-600">
                <i className="fas fa-triangle-exclamation mr-1"></i>
                {stats.delayedStages} delayed
              </span>
            )}
            {stats.onHoldStages > 0 && (
              <span className="text-purple-600">
                <i className="fas fa-pause-circle mr-1"></i>
                {stats.onHoldStages} on hold
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timeline grouped by phase */}
      <div className="flex flex-col gap-y-6">
        {groups.map((groupName) => {
          const groupStages = stages.filter((s) => s.group === groupName);
          if (groupStages.length === 0) return null;

          const groupCompleted = groupStages.filter(
            (s) => s.status === STAGE_STATUS.COMPLETED,
          ).length;

          return (
            <div key={groupName}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-sm text-gray-900 uppercase tracking-wide">
                  {groupName}
                </h3>
                <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {groupCompleted}/{groupStages.length}
                </span>
              </div>
              <div className="flex flex-col">
                {groupStages.map((stage, idx) =>
                  renderStageCard(stage, idx === groupStages.length - 1),
                )}
              </div>
            </div>
          );
        })}
      </div>

      {renderActionDialog()}
    </section>
  );
};

export default OrderStage;