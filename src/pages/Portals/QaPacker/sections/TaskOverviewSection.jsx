import React from "react";

/**
 * Phase 7-B Bundle 2 — Top-of-page task overview card.
 *
 * Mirrors the shape of Cutter's OrderDetailsSection so the visual
 * language across portals is consistent.
 *
 * Reads from `context.task` (built by QaPackerPortalService::taskOverview).
 * Per the §7-B.1 "What QA/Packer Should NOT See" list, this card shows
 * only operational fields — no pricing, no payments, no supplier info.
 */

const STATUS_STYLES = {
  pending:      "bg-gray-100 text-gray-700",
  in_progress:  "bg-blue-50 text-blue-700",
  for_approval: "bg-amber-50 text-amber-700",
  completed:    "bg-green-50 text-green-700",
  delayed:      "bg-red-50 text-red-700",
  on_hold:      "bg-zinc-100 text-zinc-700",
};

const PRIORITY_STYLES = {
  low:    "bg-gray-100 text-gray-600",
  normal: "bg-blue-50 text-blue-700",
  high:   "bg-amber-50 text-amber-700",
  rush:   "bg-red-50 text-red-700",
};

const TaskOverviewSection = ({ task }) => {
  if (!task) return null;

  const statusClass = STATUS_STYLES[task.stage_status] || STATUS_STYLES.pending;
  const priorityClass = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.normal;

  // Deadline urgency colouring. Within 24h or past = red; within 3d = amber.
  let deadlineClass = "text-gray-800";
  let deadlineLabel = "—";
  if (task.deadline) {
    const dl = new Date(task.deadline);
    const now = new Date();
    const hoursLeft = (dl.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft < 24) deadlineClass = "text-red-700 font-semibold";
    else if (hoursLeft < 72) deadlineClass = "text-amber-700 font-medium";
    deadlineLabel = dl.toLocaleDateString();
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center"><i className="fa-solid fa-clipboard-list text-[11px]" /></span>
        Task Overview
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Order / Project No.
          </p>
          <p className="font-semibold text-gray-900">
            {task.po_code || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Client / Brand
          </p>
          <p className="font-medium text-gray-800">
            {task.client_brand || task.client_name || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Stage
          </p>
          <span
            className={`inline-block text-[11px] px-2 py-0.5 rounded ${statusClass} capitalize`}
          >
            {String(task.stage || "—").replace(/_/g, " ")}
            {" · "}
            {String(task.stage_status || "—").replace(/_/g, " ")}
          </span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Color
          </p>
          <p className="font-medium text-gray-800">
            {task.shirt_color || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Print Method
          </p>
          <p className="font-medium text-gray-800">
            {task.special_print || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Quantity (total pcs)
          </p>
          <p className="font-semibold text-gray-900">
            {task.total_pcs ?? 0} pcs
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Deadline
          </p>
          <p className={`font-medium text-sm ${deadlineClass}`}>
            {deadlineLabel}
            {task.rush_order && (
              <span className="ml-1 text-[10px] uppercase font-bold text-red-700">
                Rush
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Priority
          </p>
          <span
            className={`inline-block text-[11px] px-2 py-0.5 rounded ${priorityClass} capitalize`}
          >
            {task.priority || "normal"}
          </span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Assigned To
          </p>
          <p className="font-medium text-gray-800 text-xs">
            {task.assigned_to ? `User #${task.assigned_to}` : "Unassigned"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TaskOverviewSection;
