import { isSuperAdmin } from "./authz";

export const RoleAccess = [
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
  { value: "subcontract", label: "Subcontract" },
];

export const SECTION_ACCESS = {
  client: ["admin", "general_manager", "csr", "finance"],
  shipping: ["admin", "general_manager", "csr", "warehouse_manager", "driver"],
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

export const PRODUCTION_ACCESS = {
  order_stages: ["admin", "general_manager"],

  graphic_editing: ["admin", "general_manager", "graphic_artist"],
  screen_making: ["admin", "general_manager", "screen_maker", "graphic_artist"],
  screen_checking: ["admin", "general_manager", "quality_assurance"],

  sample_material_preparation: [
    "admin",
    "general_manager",
    "warehouse_manager",
    "purchasing",
  ],
  sample_material_receiving: [
    "admin",
    "general_manager",
    "warehouse_manager",
    "purchasing",
  ],
  sample_cutting: ["admin", "general_manager", "cutter", "quality_assurance"],
  sample_printing: ["admin", "general_manager", "printer", "graphic_artist"],
  sample_sewing: ["admin", "general_manager", "sewer", "quality_assurance"],
  sample_quality_assurance: ["admin", "general_manager", "quality_assurance"],
  sample_approval: ["admin", "general_manager", "quality_assurance"],

  production_material_preparation: [
    "admin",
    "general_manager",
    "warehouse_manager",
    "purchasing",
  ],
  production_material_receiving: [
    "admin",
    "general_manager",
    "warehouse_manager",
    "purchasing",
  ],
  production_cutting: [
    "admin",
    "general_manager",
    "cutter",
    "quality_assurance",
  ],
  production_printing: [
    "admin",
    "general_manager",
    "printer",
    "graphic_artist",
  ],
  production_sewing: ["admin", "general_manager", "sewer", "quality_assurance"],
  production_revision: ["admin", "general_manager", "quality_assurance"],
  production_quality_assurance: [
    "admin",
    "general_manager",
    "quality_assurance",
  ],

  delivery: ["admin", "general_manager", "warehouse_manager", "driver"],
};

export const hasSectionAccess = (userRoles = [], section) => {
  if (!userRoles || !Array.isArray(userRoles) || !section) return false;

  if (isSuperAdmin({ roles: userRoles }))
    return true;

  const allowedRoles = SECTION_ACCESS[section];
  return allowedRoles?.some((role) => userRoles.includes(role)) || false;
};

export const hasProductionAccess = (userRoles = [], productionSection) => {
  if (!userRoles || !Array.isArray(userRoles) || !productionSection)
    return false;

  if (isSuperAdmin({ roles: userRoles }))
    return true;

  const allowedRoles = PRODUCTION_ACCESS[productionSection];
  return allowedRoles?.some((role) => userRoles.includes(role)) || false;
};
