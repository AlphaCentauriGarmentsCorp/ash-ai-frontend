import { isSuperAdmin } from "./authz";

/**
 * Selectable roles in the role-picker UI (e.g. user/account creation).
 * Order here is the order shown to the operator.
 */
export const RoleAccess = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "general_manager", label: "General Manager" },
  { value: "csr", label: "CSR" },
  { value: "graphic_artist", label: "Graphic Artist" },
  { value: "finance", label: "Finance" },
  { value: "purchasing", label: "Purchasing" },
  { value: "cutter", label: "Cutter" },
  { value: "driver", label: "Driver" },
  { value: "printer", label: "Printer" },
  { value: "sewer", label: "Sewer" },
  { value: "quality_assurance", label: "Quality Assurance" },
  { value: "packer", label: "Packer" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "screen_maker", label: "Screen Maker" },
  { value: "sample_maker", label: "Sample Maker" },
  { value: "logistics", label: "Logistics" },
  { value: "subcontract", label: "Subcontract" },
];

/**
 * Section access on the OrderDetails > Order Information tab.
 * Superadmin always passes (handled in hasSectionAccess).
 */
export const SECTION_ACCESS = {
  client: ["admin", "general_manager", "csr", "finance"],
  shipping: [
    "admin",
    "general_manager",
    "csr",
    "warehouse_manager",
    "driver",
    "logistics",
  ],
  product: [
    "admin",
    "general_manager",
    "csr",
    "graphic_artist",
    "sample_maker",
    "quality_assurance",
  ],
  design: [
    "admin",
    "general_manager",
    "graphic_artist",
    "screen_maker",
    "sample_maker",
  ],
  pricing: ["admin", "general_manager", "finance"],
  items: [
    "admin",
    "general_manager",
    "csr",
    "warehouse_manager",
    "packer",
    "quality_assurance",
  ],
  logs: ["admin", "general_manager", "quality_assurance", "warehouse_manager"],
};

/**
 * Per-WORK-PAGE access on the OrderDetails > Production tab.
 *
 * NOTE: keys here MUST match the `id` field in
 * constants/formOptions/workPages.js. They are NOT workflow stages –
 * they are the role-specific input UIs.
 *
 * Special key: `workflow` – the unified 14-stage timeline view.
 */
export const WORK_PAGE_ACCESS = {
  // The workflow timeline is visible to anyone with order access.
  workflow: [
    "admin",
    "general_manager",
    "csr",
    "graphic_artist",
    "screen_maker",
    "purchasing",
    "warehouse_manager",
    "cutter",
    "printer",
    "sewer",
    "sample_maker",
    "quality_assurance",
    "packer",
    "driver",
    "logistics",
    "finance",
  ],

};

/**
 * @deprecated kept as an alias for the legacy `PRODUCTION_ACCESS` import.
 * New code should reference WORK_PAGE_ACCESS or use hasWorkPageAccess().
 */
export const PRODUCTION_ACCESS = WORK_PAGE_ACCESS;

export const hasSectionAccess = (userRoles = [], section) => {
  if (!userRoles || !Array.isArray(userRoles) || !section) return false;

  if (isSuperAdmin({ roles: userRoles })) return true;

  const allowedRoles = SECTION_ACCESS[section];
  return allowedRoles?.some((role) => userRoles.includes(role)) || false;
};

export const hasWorkPageAccess = (userRoles = [], workPageId) => {
  if (!userRoles || !Array.isArray(userRoles) || !workPageId) return false;

  if (isSuperAdmin({ roles: userRoles })) return true;

  const allowedRoles = WORK_PAGE_ACCESS[workPageId];
  return allowedRoles?.some((role) => userRoles.includes(role)) || false;
};

/**
 * @deprecated alias of hasWorkPageAccess for legacy callers.
 */
export const hasProductionAccess = hasWorkPageAccess;
