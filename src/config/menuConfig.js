import { hasRequiredPermissions } from "../utils/authz";
import { inferPermissionsFromPath } from "../utils/permissionAccessMap";

export const getMenuByPermissions = (user = null) => {
  const resolvePermissions = (entry) => {
    const explicit = Array.isArray(entry?.requiredPermissions)
      ? entry.requiredPermissions
      : [];

    if (explicit.length > 0) return explicit;

    if (typeof entry?.path === "string" && entry.path.trim().length > 0) {
      return inferPermissionsFromPath(entry.path);
    }

    return [];
  };

  const canAccessByPermission = (entry) => {
    const requiredPermissions = resolvePermissions(entry);
    const permissionMode = entry?.permissionMode || "any";

    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
      return true;
    }

    return hasRequiredPermissions(user, requiredPermissions, permissionMode);
  };

  const canAccess = (entry) => {
    const requiredPermissions = resolvePermissions(entry);

    if (requiredPermissions.length === 0) {
      return true;
    }

    return canAccessByPermission(entry);
  };

  const menuConfig = [
    {
      section: "Home",
      items: [
        {
          name: "Dashboard",
          icon: "fa-solid fa-chart-line",
          path: "/",
        },
      ],
    },
    {
      section: "Daily Operations",
      items: [
        {
          name: "Orders",
          icon: "fa-solid fa-file-invoice",
          subItems: [
            {
              name: "Add Order",
              path: "/orders/new",
            },
            {
              name: "All Orders",
              path: "/orders",
            },
          ],
        },
        {
          name: "Quotation",
          icon: "fa-solid fa-file-invoice",
          subItems: [
            {
              name: "All Quotation",
              path: "/quotations",
            },
            {
              name: "Add Quotation",
              path: "/quotations/new",
            },
          ],
        },
        {
          name: "Clients",
          icon: "fa-solid fa-users",
          subItems: [
            {
              name: "All Clients",
              path: "/clients",
            },
            {
              name: "Add Client",
              path: "/clients/new",
            },
          ],
        },
        {
          name: "User Accounts",
          icon: "fa-solid fa-user-shield",
          subItems: [
            {
              name: "All Users",
              path: "/account/employee",
              requiredPermissions: ["access.employees"],
            },
            {
              name: "Add User",
              path: "/account/employee/new",
              requiredPermissions: ["access.employees"],
            },
          ],
        },
        {
          name: "Drop Down Settings",
          icon: "fa-solid fa-cog",
          subItems: [
            {
              name: "Pattern Type",
              path: "/admin/settings/pattern-type",
            },
            {
              name: "Apparel Type",
              path: "/admin/settings/apparel-type",
            },
            {
              name: "Apparel Parts",
              path: "/admin/settings/apparel-parts",
            },
            {
              name: "Service Type",
              path: "/admin/settings/service-type",
            },
            {
              name: "Print Method",
              path: "/admin/settings/print-method",
            },
            {
              name: "Size Label",
              path: "/admin/settings/size-label",
            },
            {
              name: "Print Label Placements",
              path: "/admin/settings/print-label-placements",
            },
            {
              name: "Freebies",
              path: "/admin/settings/freebies",
            },
            {
              name: "Placement Measurements",
              path: "/admin/settings/placement-measurements",
            },

            {
              name: "Courier Services",
              path: "/admin/settings/courier",
            },
            {
              name: "Payment Methods",
              path: "/admin/settings/payment-methods",
            },
            {
              name: "Shipping Methods",
              path: "/admin/settings/shipping-methods",
            },
            {
              name: "Additional Options",
              path: "/admin/settings/additional-options",
            },
          ],
        },
        {
          name: "Tickets",
          icon: "fa-solid fa-ticket",
          subItems: [
            {
              name: "All Tickets",
              path: "/tickets",
            },
          ],
        },

        {
          name: "Quotation Settings",
          icon: "fa-solid fa-cog",
          subItems: [
            {
              name: "Addons Categories",
              path: "/quotation/settings/addon-categories",
            },
            {
              name: "Addons",
              path: "/quotation/settings/addons",
            },
            {
              name: "Apparel Neckline",
              path: "/quotation/settings/apparel-neckline",
            },
            {
              name: "Apparel Pattern Prices",
              path: "/quotation/settings/apparel-pattern-prices",
            },
          ],
        },
        {
          name: "Roles & Permissions",
          icon: "fa-solid fa-user-shield",
          subItems: [
            {
              name: "Roles",
              path: "/admin/rbac/roles",
              requiredPermissions: ["access.rbac"],
            },
            {
              name: "Permissions",
              path: "/admin/rbac/permissions",
              requiredPermissions: ["access.rbac"],
            },
            {
              name: "Matrix",
              path: "/admin/rbac/matrix",
              requiredPermissions: ["access.rbac"],
            },
          ],
        },
        {
          name: "Material Suppliers",
          icon: "fa-solid fa-user-shield",
          subItems: [
            {
              name: "Add Supplier",
              path: "/supplier/new",
              requiredPermissions: ["access.suppliers"],
            },
            {
              name: "All Suppliers",
              path: "/supplier",
              requiredPermissions: ["access.suppliers"],
            },
            {
              name: "All Materials",
              path: "/supplier/materials",
              requiredPermissions: ["access.materials"],
            },
          ],
        },
      ],
    },
    {
      section: "Inventory",
      items: [
        {
          name: "Equipment",
          icon: "fa-solid fa-tools",
          subItems: [
            {
              name: "All Equipment",
              path: "/equipment-inventory",
              requiredPermissions: ["access.equipment"],
            },
            {
              name: "Add Equipment",
              path: "/equipment-inventory/equipment/add",
              requiredPermissions: ["access.equipment"],
            },
          ],
        },
        {
          name: "Screen Inventory",
          icon: "fa-solid fa-tools",
          subItems: [
            {
              name: "All Screen",
              path: "/screen-inventory",
              requiredPermissions: ["access.screens"],
            },
            {
              name: "Add Screen",
              path: "/screen-inventory/new",
              requiredPermissions: ["access.screens"],
            },
          ],
        },
      ],
    },
  ];

  const filteredMenu = menuConfig
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => ({
          ...item,
          subItems: item.subItems
            ? item.subItems.filter((subItem) => canAccess(subItem))
            : undefined,
        }))
        .filter((item) => {
          if (item.path) {
            return canAccess(item);
          }

          if (item.subItems && item.subItems.length > 0) {
            return true;
          }
          return false;
        }),
    }))
    .filter((section) => section.items.length > 0);

  return filteredMenu;
};
