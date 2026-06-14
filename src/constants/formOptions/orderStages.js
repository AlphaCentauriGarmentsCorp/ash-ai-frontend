/**
 * ASH AI – Canonical Workflow Stages (frontend mirror).
 *
 * MUST stay in sync with backend/app/Support/WorkflowStages.php.
 * Any change here requires a matching backend change.
 *
 * SEQUENCING MODEL: each stage carries `seq` (its tier / dependency level).
 * The workflow is sequential EXCEPT the sample phase, where Screen Making and
 * Material Prep (Sample) share tier 6 and run in parallel (fork). Sample
 * Cutting (tier 7) is the join — it waits for BOTH tier-6 stages.
 * Stages sharing a `seq` with `parallel: true` render side-by-side in the
 * timeline. `gate: true` marks a blocking payment-verification gate.
 */
export const OrderStages = [
  // ---------- Pre-Production ----------
  { group: "Pre-Production", value: "payment_verification_sample", label: "Payment Verification (Sample)", role: "finance", seq: 4, gate: true, icon: "fa-money-bill-wave" },

  // ---------- Sample Production ----------
  { group: "Sample Production", value: "graphic_artwork", label: "Graphic Artwork", role: "graphic_artist", seq: 5, icon: "fa-pencil-ruler" },
  // ⑂ Parallel fork (tier 6) — both run at once; cutting waits for both.
  { group: "Sample Production", value: "screen_making", label: "Screen Making", role: "screen_maker", seq: 6, parallel: true, icon: "fa-th-large" },
  { group: "Sample Production", value: "material_prep_sample", label: "Material Prep (Sample)", role: "material_prep", seq: 6, parallel: true, icon: "fa-box-open" },
  // ⑃ Join + sample build (sequential).
  { group: "Sample Production", value: "sample_cutting", label: "Sample Cutting", role: "cutter", seq: 7, icon: "fa-scissors" },
  { group: "Sample Production", value: "sample_printing", label: "Sample Printing", role: "printer", seq: 8, icon: "fa-stamp" },
  { group: "Sample Production", value: "sample_sewing", label: "Sample Sewing", role: "sewer", seq: 9, icon: "fa-socks" },
  { group: "Sample Production", value: "sample_packing", label: "Sample Packing", role: "packer", seq: 10, icon: "fa-box" },
  { group: "Sample Production", value: "sample_approval", label: "Sample Approval", role: "csr", seq: 11, icon: "fa-thumbs-up" },

  // ---------- Mass Production ----------
  { group: "Mass Production", value: "payment_verification_mass", label: "Payment Verification (Mass)", role: "finance", seq: 12, gate: true, icon: "fa-money-check-dollar" },
  { group: "Mass Production", value: "material_prep_mass", label: "Material Prep", role: "material_prep", seq: 13, icon: "fa-cart-shopping" },
  { group: "Mass Production", value: "mass_cutting", label: "Mass Cutting", role: "cutter", seq: 14, icon: "fa-scissors" },
  { group: "Mass Production", value: "mass_printing", label: "Mass Printing", role: "printer", seq: 15, icon: "fa-stamp" },
  { group: "Mass Production", value: "mass_sewing", label: "Mass Sewing", role: "sewer", seq: 16, icon: "fa-socks" },
  { group: "Mass Production", value: "mass_qa", label: "Trimming / QA", role: "quality_assurance", seq: 17, icon: "fa-magnifying-glass" },
  { group: "Mass Production", value: "mass_packing", label: "Packing", role: "packer", seq: 18, icon: "fa-box" },
  { group: "Mass Production", value: "payment_verification_balance", label: "Payment Verification (Balance)", role: "finance", seq: 19, gate: true, icon: "fa-money-bill-trend-up" },

  // ---------- Delivery + Closeout ----------
  { group: "Delivery", value: "delivery", label: "Delivery", role: "logistics", seq: 20, icon: "fa-truck" },
  { group: "Delivery", value: "order_completed", label: "Order Completed", role: "csr", seq: 21, icon: "fa-flag-checkered" },
  { group: "Delivery", value: "client_notification", label: "Client Notification", role: "csr", seq: 22, icon: "fa-envelope-circle-check" },
];

// Helper – stages by group
export const getStagesByGroup = (group) => {
  return OrderStages.filter((stage) => stage.group === group);
};

// All unique group names, in the order they first appear
export const getStageGroups = () => {
  return [...new Set(OrderStages.map((stage) => stage.group))];
};

// Quick lookup
export const findStage = (value) =>
  OrderStages.find((s) => s.value === value) || null;

// Tier (dependency level) for a stage value
export const tierOf = (value) => findStage(value)?.seq ?? null;

// All stages sharing a tier (a fork tier returns >1)
export const stagesAtTier = (seq) => OrderStages.filter((s) => s.seq === seq);

// Tiers that are parallel forks (more than one stage)
export const getParallelTiers = () => {
  const counts = {};
  OrderStages.forEach((s) => { counts[s.seq] = (counts[s.seq] || 0) + 1; });
  return Object.keys(counts)
    .filter((seq) => counts[seq] > 1)
    .map(Number);
};

// Is this stage a blocking payment-verification gate?
export const isPaymentGate = (value) => !!findStage(value)?.gate;

// Status constants – mirror backend OrderStage::STATUS_*
export const STAGE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  FOR_APPROVAL: "for_approval",
  COMPLETED: "completed",
  DELAYED: "delayed",
  ON_HOLD: "on_hold",
  REJECTED: "rejected",
};

// Visual colour/icon hints for each status (used by the timeline UI)
export const STAGE_STATUS_META = {
  pending: { label: "Pending", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300", dot: "bg-gray-300", icon: "fa-circle" },
  in_progress: { label: "In Progress", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", dot: "bg-blue-500", icon: "fa-spinner fa-spin" },
  for_approval: { label: "For Approval", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", dot: "bg-amber-500", icon: "fa-hourglass-half" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700", border: "border-green-300", dot: "bg-green-500", icon: "fa-check-circle" },
  delayed: { label: "Delayed", bg: "bg-red-50", text: "text-red-700", border: "border-red-300", dot: "bg-red-500", icon: "fa-triangle-exclamation" },
  on_hold: { label: "On Hold", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300", dot: "bg-purple-500", icon: "fa-pause-circle" },
  rejected: { label: "Rejected", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-300", dot: "bg-rose-600", icon: "fa-circle-xmark" },
};

export const getStatusMeta = (status) =>
  STAGE_STATUS_META[status] || STAGE_STATUS_META.pending;
