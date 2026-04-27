const RULES = [
  { test: /^\/$/, permissions: [] },

  // Order routes
  { test: /^\/orders(\/|$)/, permissions: ["access.orders"] },
  { test: /^\/order\//, permissions: ["access.orders"] },

  // Client routes
  { test: /^\/clients(\/|$)/, permissions: ["access.clients"] },

  // Employee management
  { test: /^\/account\/employee(\/|$)/, permissions: ["access.employees"] },

  // Inventory routes
  { test: /^\/equipment-inventory(\/|$)/, permissions: ["access.equipment"] },

  // Supplier/material routes
  { test: /^\/supplier\/materials(\/|$)/, permissions: ["access.materials"] },
  { test: /^\/supplier(\/|$)/, permissions: ["access.suppliers"] },

  { test: /^\/screen-inventory(\/|$)/, permissions: ["access.screens"] },

  // Quotation routes
  { test: /^\/quotations(\/|$)/, permissions: ["access.quotations"] },

  // Quotation settings
  { test: /^\/quotation\/settings\//, permissions: ["access.quotation-settings"] },

  // Dropdown setting routes with dedicated permissions
  {
    test: /^\/admin\/settings\/payment-methods(\/|$)/,
    permissions: ["access.payment-methods"],
  },
  {
    test: /^\/admin\/settings\/shipping-methods(\/|$)/,
    permissions: ["access.shipping-methods"],
  },
  { test: /^\/admin\/settings\/courier(\/|$)/, permissions: ["access.courier-list"] },
  {
    test: /^\/admin\/settings\/sewing-subcontractor(\/|$)/,
    permissions: ["access.sewing-subcontractor"],
  },

  // Generic dropdown settings
  { test: /^\/admin\/settings\//, permissions: ["access.dropdown-settings"] },

  // RBAC
  { test: /^\/admin\/rbac\//, permissions: ["access.rbac"] },

  // Additional route families (future/feature paths)
  { test: /^\/downloads?(\/|$)/, permissions: ["access.download"] },
  { test: /^\/order-stages(\/|$)/, permissions: ["access.order-stages"] },
  { test: /^\/graphic-design(\/|$)/, permissions: ["access.graphic-design"] },
  { test: /^\/screen-making(\/|$)/, permissions: ["access.screen-making"] },
  { test: /^\/screen-checking(\/|$)/, permissions: ["access.screen-checking"] },
  { test: /^\/screen-maintenance(\/|$)/, permissions: ["access.screen-maintenance"] },
];

export const inferPermissionsFromPath = (path = "") => {
  const pathname = String(path || "").trim();
  if (!pathname) return [];

  const match = RULES.find((rule) => rule.test.test(pathname));
  return match ? [...match.permissions] : [];
};
