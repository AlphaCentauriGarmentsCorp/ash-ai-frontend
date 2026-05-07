import { useState, useCallback, useMemo, useEffect } from "react";
import {
  OrderStages,
  STAGE_STATUS,
} from "../../../constants/formOptions/orderStages";
import { orderStagesApi } from "../../../api/orderStagesApi";

/**
 * Hook that manages the sequential workflow state for an order.
 *
 * Replaces the legacy "checkbox selection" hook.
 *
 * @param {object} initialOrder – the order object (must include `id` and
 *                                preferably `orderStages` from the API)
 * @param {function} onSuccess – called after any successful mutation;
 *                               typically `fetchOrderDetails` from OrderDetails
 *
 * Returns:
 *   stages           – ordered array of stage objects (merged with definitions)
 *   currentStage     – the active stage (in_progress or for_approval) or null
 *   completedCount   – how many stages are completed
 *   totalCount       – total number of stages (always 14)
 *   completionPercentage
 *   isLoading        – any in-flight mutation
 *   error            – last error message (string) or null
 *   lastMessage      – success message (string) or null
 *   advance(stageId, notes?)        – mark complete + auto-start next
 *   markForApproval(stageId, notes?)
 *   markDelayed(stageId, reason)
 *   markOnHold(stageId, reason?)
 *   resume(stageId)
 *   resetState()
 */
export const useOrderStages = (initialOrder = null, onSuccess = null) => {
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  // ---- Sync local state from props -----------------------------------
  useEffect(() => {
    if (
      initialOrder?.orderStages &&
      Array.isArray(initialOrder.orderStages)
    ) {
      // Merge each backend stage with its frontend definition (label, icon, group)
      const enriched = initialOrder.orderStages
        .map((s) => {
          const def = OrderStages.find((d) => d.value === s.stage);
          return {
            ...s,
            label: s.label || def?.label || s.stage,
            group: s.group || def?.group || "",
            icon: def?.icon || "fa-circle",
            // Keep the raw assigned role from server, fall back to defaults
            role: s.role || def?.role || s.assigned_role,
          };
        })
        // Always sort by sequence so the timeline is in order regardless of
        // how the API serialises them.
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

      setStages(enriched);
    }
  }, [initialOrder]);

  // ---- Derived data ---------------------------------------------------
  const currentStage = useMemo(() => {
    return (
      stages.find(
        (s) =>
          s.status === STAGE_STATUS.IN_PROGRESS ||
          s.status === STAGE_STATUS.FOR_APPROVAL,
      ) ||
      stages.find((s) => s.status !== STAGE_STATUS.COMPLETED) ||
      null
    );
  }, [stages]);

  const stats = useMemo(() => {
    const total = stages.length;
    const completed = stages.filter(
      (s) => s.status === STAGE_STATUS.COMPLETED,
    ).length;
    const delayed = stages.filter(
      (s) => s.status === STAGE_STATUS.DELAYED,
    ).length;
    const onHold = stages.filter(
      (s) => s.status === STAGE_STATUS.ON_HOLD,
    ).length;

    return {
      totalStages: total,
      completedStages: completed,
      delayedStages: delayed,
      onHoldStages: onHold,
      completionPercentage:
        total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [stages]);

  // ---- Mutations ------------------------------------------------------
  const wrap = useCallback(
    async (op, successMessage = "Saved.") => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await op();
        setLastMessage(successMessage);
        if (onSuccess) onSuccess(response);
        return response;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong.";
        setError(msg);
        return { error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess],
  );

  const advance = useCallback(
    (stageId, notes = null) =>
      wrap(
        () => orderStagesApi.complete(stageId, notes),
        "Stage marked completed. Next stage started.",
      ),
    [wrap],
  );

  const markForApproval = useCallback(
    (stageId, notes = null) =>
      wrap(
        () => orderStagesApi.forApproval(stageId, notes),
        "Stage sent for approval.",
      ),
    [wrap],
  );

  const markDelayed = useCallback(
    (stageId, reason) =>
      wrap(
        () => orderStagesApi.delay(stageId, reason),
        "Stage flagged as delayed.",
      ),
    [wrap],
  );

  const markOnHold = useCallback(
    (stageId, reason = null) =>
      wrap(() => orderStagesApi.hold(stageId, reason), "Stage put on hold."),
    [wrap],
  );

  const resume = useCallback(
    (stageId) => wrap(() => orderStagesApi.resume(stageId), "Stage resumed."),
    [wrap],
  );

  const resetState = useCallback(() => {
    setError(null);
    setLastMessage(null);
  }, []);

  return {
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
  };
};

export default useOrderStages;
