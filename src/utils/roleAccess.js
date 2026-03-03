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

// Define which roles can access which sections
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

// Define which roles can access which production sections
export const PRODUCTION_ACCESS = {
  "order-verification": [
    "admin",
    "general_manager",
    "csr",
    "quality_assurance",
  ],
  "cutting": ["admin", "general_manager", "cutter", "quality_assurance"],
  "sewing": ["admin", "general_manager", "sewer", "quality_assurance"],
  "printing": [
    "admin",
    "general_manager",
    "printer",
    "graphic_artist",
    "quality_assurance",
  ],
  "embroidery": ["admin", "general_manager", "sewer", "quality_assurance"],
  "quality": ["admin", "general_manager", "quality_assurance"],
  "packing": ["admin", "general_manager", "packer", "warehouse_manager"],
  "shipping": ["admin", "general_manager", "warehouse_manager", "driver"],
  "screen-making": [
    "admin",
    "general_manager",
    "screen_maker",
    "graphic_artist",
  ],
  "sample-making": [
    "admin",
    "general_manager",
    "sample_maker",
    "graphic_artist",
  ],
  "subcontract": ["admin", "general_manager", "subcontract", "purchasing"],
};

export const hasSectionAccess = (userRoles = [], section) => {
  if (!userRoles || !Array.isArray(userRoles) || !section) return false;

  // Admin always has access
  if (userRoles.includes("admin")) return true;

  const allowedRoles = SECTION_ACCESS[section];
  return allowedRoles?.some((role) => userRoles.includes(role)) || false;
};

export const hasProductionAccess = (userRoles = [], productionSection) => {
  if (!userRoles || !Array.isArray(userRoles) || !productionSection)
    return false;

  // Admin always has access
  if (userRoles.includes("admin")) return true;

  const allowedRoles = PRODUCTION_ACCESS[productionSection];
  return allowedRoles?.some((role) => userRoles.includes(role)) || false;
};
