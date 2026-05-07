/**
 * ASH AI – Canonical Workflow Stages (frontend mirror).
 *
 * MUST stay in sync with backend/app/Support/WorkflowStages.php.
 * Any change here requires a matching backend change.
 *
 * The order is fixed: stages are completed strictly in this sequence
 * (see ASH AI master brief §5 + image 8).
 */
export const OrderStages = [
  // ---------- Pre-Production ----------
  {
    group: "Pre-Production",
    value: "inquiry",
    label: "Inquiry",
    role: "csr",
    icon: "fa-comments",
  },
  {
    group: "Pre-Production",
    value: "quotation",
    label: "Quotation",
    role: "csr",
    icon: "fa-file-invoice-dollar",
  },
  {
    group: "Pre-Production",
    value: "quotation_approval",
    label: "Quotation Approval",
    role: "csr",
    icon: "fa-circle-check",
  },
  {
    group: "Pre-Production",
    value: "payment_verification_sample",
    label: "Payment Verification (Sample)",
    role: "finance",
    icon: "fa-money-bill-wave",
  },

  // ---------- Sample Production ----------
  {
    group: "Sample Production",
    value: "graphic_artwork",
    label: "Graphic Artwork",
    role: "graphic_artist",
    icon: "fa-pencil-ruler",
  },
  {
    group: "Sample Production",
    value: "screen_making",
    label: "Screen Making",
    role: "screen_maker",
    icon: "fa-th-large",
  },
  {
    group: "Sample Production",
    value: "sample_creation",
    label: "Sample Creation",
    role: "sample_maker",
    icon: "fa-tshirt",
  },
  {
    group: "Sample Production",
    value: "sample_approval",
    label: "Sample Approval",
    role: "csr",
    icon: "fa-thumbs-up",
  },

  // ---------- Mass Production ----------
  {
    group: "Mass Production",
    value: "mass_production",
    label: "Mass Production",
    role: "general_manager",
    icon: "fa-industry",
  },
  {
    group: "Mass Production",
    value: "quality_control",
    label: "Quality Control",
    role: "quality_assurance",
    icon: "fa-magnifying-glass",
  },
  {
    group: "Mass Production",
    value: "packing",
    label: "Packing",
    role: "packer",
    icon: "fa-box",
  },

  // ---------- Delivery + Closeout ----------
  {
    group: "Delivery",
    value: "delivery",
    label: "Delivery",
    role: "logistics",
    icon: "fa-truck",
  },
  {
    group: "Delivery",
    value: "order_completed",
    label: "Order Completed",
    role: "csr",
    icon: "fa-flag-checkered",
  },
  {
    group: "Delivery",
    value: "client_notification",
    label: "Client Notification",
    role: "csr",
    icon: "fa-envelope-circle-check",
  },
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
  pending: {
    label: "Pending",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
    dot: "bg-gray-300",
    icon: "fa-circle",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-300",
    dot: "bg-blue-500",
    icon: "fa-spinner fa-spin",
  },
  for_approval: {
    label: "For Approval",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
    dot: "bg-amber-500",
    icon: "fa-hourglass-half",
  },
  completed: {
    label: "Completed",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-500",
    icon: "fa-check-circle",
  },
  delayed: {
    label: "Delayed",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    dot: "bg-red-500",
    icon: "fa-triangle-exclamation",
  },
  on_hold: {
    label: "On Hold",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-300",
    dot: "bg-purple-500",
    icon: "fa-pause-circle",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-300",
    dot: "bg-rose-600",
    icon: "fa-circle-xmark",
  },
};

export const getStatusMeta = (status) =>
  STAGE_STATUS_META[status] || STAGE_STATUS_META.pending;
