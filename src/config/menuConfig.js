export const getMenuByRole = (userRole) => {
  const menuConfig = [
    {
      section: "Home",
      items: [
        {
          name: "Dashboard",
          icon: "fa-solid fa-chart-line",
          path: "/",
          access: ["admin", "general_manager", "screen_maker"],
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
              access: ["admin", "general_manager"],
            },
            {
              name: "All Orders",
              path: "/orders",
              access: ["admin", "general_manager"],
            },
          ],
        },
        {
          name: "Quotation",
          icon: "fa-solid fa-file-invoice",
          subItems: [
            {
              name: "Add Quotation",
              path: "/quotation",
              access: ["admin", "general_manager"],
            },
            // {
            //   name: "All Quotation",
            //   path: "/quotation",
            //   access: ["admin", "general_manager"],
            // },
          ],
        },
        {
          name: "Clients",
          icon: "fa-solid fa-users",
          subItems: [
            {
              name: "All Clients",
              path: "/clients",
              access: ["admin", "general_manager"],
            },
            {
              name: "Add Client",
              path: "/clients/new",
              access: ["admin", "general_manager"],
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
              access: ["admin"],
            },
            {
              name: "Add User",
              path: "/account/employee/new",
              access: ["admin"],
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
              access: ["admin"],
            },
            {
              name: "Apparel Type",
              path: "/admin/settings/apparel-type",
              access: ["admin"],
            },
            {
              name: "Service Type",
              path: "/admin/settings/service-type",
              access: ["admin"],
            },
            {
              name: "Print Method",
              path: "/admin/settings/print-method",
              access: ["admin"],
            },
            {
              name: "Size Label",
              path: "/admin/settings/size-label",
              access: ["admin"],
            },
            {
              name: "Print Label Placements",
              path: "/admin/settings/print-label-placements",
              access: ["admin"],
            },
            {
              name: "Freebies",
              path: "/admin/settings/freebies",
              access: ["admin"],
            },
            {
              name: "Placement Measurements",
              path: "/admin/settings/placement-measurements",
              access: ["admin"],
            },

            {
              name: "Courier Services",
              path: "/admin/settings/courier",
              access: ["admin"],
            },
            {
              name: "Payment Methods",
              path: "/admin/settings/payment-methods",
              access: ["admin"],
            },
            {
              name: "Shipping Methods",
              path: "/admin/settings/shipping-methods",
              access: ["admin"],
            },
            {
              name: "Additional Options",
              path: "/admin/settings/additional-options",
              access: ["admin"],
            },
          ],
        },

        {
          name: "Quotation Settings",
          icon: "fa-solid fa-cog",
          subItems: [
            {
              name: "Tshirt Types",
              path: "/quotation/settings/tshirt-type",
              access: ["admin"],
            },
            {
              name: "Tshirt Necklines",
              path: "/quotation/settings/tshirt-neckline",
              access: ["admin"],
            },
            {
              name: "Print Types",
              path: "/quotation/settings/print-types",
              access: ["admin"],
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
              access: ["admin"],
            },
            {
              name: "All Suppliers",
              path: "/supplier",
              access: ["admin"],
            },
            {
              name: "All Materials",
              path: "/supplier/materials",
              access: ["admin"],
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
              access: ["admin", "general_manager"],
            },
            {
              name: "Add Equipment",
              path: "/equipment-inventory/equipment/add",
              access: ["admin", "general_manager"],
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
              access: ["admin", "general_manager"],
            },
            {
              name: "Add Screen",
              path: "/screen-inventory/new",
              access: ["admin", "general_manager"],
            },
          ],
        },
      ],
    },

    {
      section: "Production",
      items: [
        {
          name: "Orders",
          icon: "fa-solid fa-file-invoice",
          subItems: [
            {
              name: "Assigned Orders",
              path: "/orders/assigned",
              access: ["screen_maker"],
            },
            {
              name: "My Tasks",
              path: "/tasks",
              access: ["screen_maker"],
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
            ? item.subItems.filter(
                (subItem) =>
                  subItem.access && subItem.access.includes(userRole),
              )
            : undefined,
        }))
        .filter((item) => {
          if (item.path) {
            return item.access && item.access.includes(userRole);
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
