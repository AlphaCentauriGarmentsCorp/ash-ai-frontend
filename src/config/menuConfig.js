export const getMenuByRole = (userType) => {
  const baseMenu = {
    // ADMIN - Full system access
    admin: [
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
            subItems: [{ name: "Add Order", path: "/orders/new" }],
          },
          {
            name: "Clients",
            icon: "fa-solid fa-users",
            subItems: [
              { name: "All Clients", path: "/clients" },
              { name: "Add Client", path: "/clients/new" },
            ],
          },
          {
            name: "User Accounts",
            icon: "fa-solid fa-user-shield",
            subItems: [
              { name: "All Users", path: "/account/employee" },
              { name: "Add User", path: "/account/employee/new" },
            ],
          },
          {
            name: "Inventory Management",
            icon: "fa-solid fa-warehouse",
            subItems: [
              { name: "View Inventory", path: "/admin/inventory" },
              { name: "Adjust Stock", path: "/admin/inventory/adjust" },
              { name: "Inventory Reports", path: "/admin/inventory/reports" },
            ],
          },
          {
            name: "Financial Suite",
            icon: "fa-solid fa-chart-pie",
            subItems: [
              { name: "Financial Reports", path: "/admin/reports/financial" },
              { name: "Revenue Overview", path: "/admin/reports/revenue" },
              { name: "Cost Analysis", path: "/admin/reports/costs" },
            ],
          },
          {
            name: "Audit & Compliance",
            icon: "fa-solid fa-history",
            subItems: [
              { name: "Audit Trail", path: "/admin/audit-logs" },
              { name: "User Activity", path: "/admin/audit/user-activity" },
              { name: "System Changes", path: "/admin/audit/system-changes" },
            ],
          },
          {
            name: "System Settings",
            icon: "fa-solid fa-cogs",
            subItems: [
              { name: "General Config", path: "/admin/settings/general" },
              { name: "Pricing Setup", path: "/admin/settings/pricing" },
              { name: "Access Levels", path: "/admin/settings/access" },
              {
                name: "System Preferences",
                path: "/admin/settings/preferences",
              },
            ],
          },
          {
            name: "P.O. & Job Orders",
            icon: "fa-solid fa-clipboard-list",
            subItems: [
              { name: "Create P.O.", path: "/admin/po/new" },
              { name: "All P.O.s", path: "/admin/po" },
              { name: "Job Orders", path: "/admin/job-orders" },
            ],
          },
        ],
      },
    ],
    // GENERAL MANAGER - High-level oversight & approvals
    general_manager: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "MANAGEMENT OVERVIEW",
        items: [
          {
            name: "Orders",
            icon: "fa-solid fa-file-invoice",
            subItems: [
              { name: "All Orders", path: "/gm/orders" },
              { name: "Order Status", path: "/gm/orders/status" },
              { name: "Production Queue", path: "/gm/production-queue" },
            ],
          },
          {
            name: "Approvals & Decisions",
            icon: "fa-solid fa-check-circle",
            subItems: [
              { name: "Sample Approvals", path: "/gm/approvals/samples" },
              { name: "Payment Approvals", path: "/gm/approvals/payments" },
              { name: "Purchase Approvals", path: "/gm/approvals/purchases" },
              {
                name: "Critical Changes",
                path: "/gm/approvals/critical-changes",
              },
            ],
          },
          {
            name: "Financial Overview",
            icon: "fa-solid fa-chart-pie",
            subItems: [
              { name: "Financial Summary", path: "/gm/financial/summary" },
              { name: "Revenue by Order", path: "/gm/financial/revenue" },
              { name: "Cost Analysis", path: "/gm/financial/costs" },
            ],
          },
          {
            name: "Performance & Reports",
            icon: "fa-solid fa-chart-bar",
            subItems: [
              { name: "Staff Performance", path: "/gm/reports/staff" },
              { name: "Production Delays", path: "/gm/reports/delays" },
              { name: "Bottleneck Analysis", path: "/gm/reports/bottlenecks" },
            ],
          },
          {
            name: "Inventory Overview",
            icon: "fa-solid fa-warehouse",
            path: "/gm/warehouse-dashboard",
          },
        ],
      },
    ],
    // CSR - Customer Support Representative
    csr: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "ORDER MANAGEMENT",
        items: [
          {
            name: "Create Order",
            icon: "fa-solid fa-plus-circle",
            path: "/csr/orders/new",
          },
          {
            name: "My Orders",
            icon: "fa-solid fa-file-invoice",
            subItems: [
              { name: "Active Orders", path: "/csr/orders" },
              { name: "Completed Orders", path: "/csr/orders/completed" },
              { name: "Order History", path: "/csr/orders/history" },
            ],
          },
          {
            name: "Client Management",
            icon: "fa-solid fa-users",
            subItems: [
              { name: "Client Records", path: "/csr/clients" },
              { name: "Contact Details", path: "/csr/clients/contacts" },
              { name: "Order Notes", path: "/csr/clients/notes" },
            ],
          },
          {
            name: "Communication",
            icon: "fa-solid fa-comments",
            path: "/csr/communication",
          },
          {
            name: "Payments",
            icon: "fa-solid fa-money-bill-wave",
            subItems: [
              { name: "Upload Proof", path: "/csr/payments/upload" },
              { name: "Payment History", path: "/csr/payments/history" },
              { name: "For Verification", path: "/csr/payments/verification" },
            ],
          },
          {
            name: "Design & Production",
            icon: "fa-solid fa-paint-brush",
            subItems: [
              { name: "Upload Designs", path: "/csr/designs/upload" },
              {
                name: "Sample Request",
                path: "/csr/production/sample-request",
              },
              {
                name: "Mass Production",
                path: "/csr/production/mass-production",
              },
              { name: "For Delivery", path: "/csr/orders/for-delivery" },
            ],
          },
        ],
      },
    ],
    // GRAPHIC ARTIST - Design tasks & layout preparation
    graphic_artist: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "DESIGN WORK",
        items: [
          {
            name: "Design Tasks",
            icon: "fa-solid fa-palette",
            subItems: [
              { name: "Assigned Tasks", path: "/artist/design-tasks" },
              { name: "In Progress", path: "/artist/design-tasks/in-progress" },
              { name: "Completed", path: "/artist/design-tasks/completed" },
            ],
          },
          {
            name: "Graphics Management",
            icon: "fa-solid fa-cloud-upload-alt",
            subItems: [
              { name: "Upload Graphics", path: "/artist/graphics/upload" },
              { name: "My Graphics", path: "/artist/graphics" },
              { name: "File Formats", path: "/artist/graphics/formats" },
            ],
          },
          {
            name: "Print Layouts",
            icon: "fa-solid fa-print",
            subItems: [
              { name: "Create Layout", path: "/artist/print-layouts/new" },
              { name: "My Layouts", path: "/artist/print-layouts" },
              { name: "Layout Types", path: "/artist/print-layouts/types" },
            ],
          },
          {
            name: "Revisions",
            icon: "fa-solid fa-edit",
            subItems: [
              { name: "Revision Requests", path: "/artist/revisions" },
              { name: "Upload Updated", path: "/artist/revisions/upload" },
              { name: "Revision History", path: "/artist/revisions/history" },
            ],
          },
          {
            name: "Screen Requests",
            icon: "fa-solid fa-image",
            subItems: [
              {
                name: "Request Screen Making",
                path: "/artist/screen-requests/new",
              },
              { name: "All Requests", path: "/artist/screen-requests" },
              {
                name: "Ready for Printing",
                path: "/artist/screen-requests/ready",
              },
            ],
          },
          {
            name: "Approval Queue",
            icon: "fa-solid fa-check-circle",
            path: "/artist/approvals",
          },
        ],
      },
    ],
    // FINANCE - Payment & expense management
    finance: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "FINANCE",
        items: [
          {
            name: "Payment Verification",
            icon: "fa-solid fa-check-double",
            subItems: [
              { name: "Verify Payments", path: "/finance/payments/verify" },
              { name: "Downpayments", path: "/finance/payments/downpayment" },
              { name: "Full Payments", path: "/finance/payments/full" },
              { name: "Verified Records", path: "/finance/payments/verified" },
            ],
          },
          {
            name: "Expense Management",
            icon: "fa-solid fa-money-bill-wave",
            subItems: [
              { name: "Record Expense", path: "/finance/expenses/new" },
              { name: "All Expenses", path: "/finance/expenses" },
              {
                name: "Expense Categories",
                path: "/finance/expenses/categories",
              },
            ],
          },
          {
            name: "Financial Reports",
            icon: "fa-solid fa-chart-pie",
            subItems: [
              { name: "Income Report", path: "/finance/reports/income" },
              { name: "Expense Report", path: "/finance/reports/expenses" },
              { name: "Profit & Loss", path: "/finance/reports/pl" },
            ],
          },
          {
            name: "Statement of Account",
            icon: "fa-solid fa-file-contract",
            subItems: [
              { name: "Generate SOA", path: "/finance/soa/new" },
              { name: "All SOAs", path: "/finance/soa" },
              { name: "Client SOA", path: "/finance/soa/client" },
            ],
          },
          {
            name: "Reconciliation",
            icon: "fa-solid fa-clipboard-check",
            subItems: [
              {
                name: "Delivery Receipts",
                path: "/finance/reconciliation/receipts",
              },
              {
                name: "Invoice Matching",
                path: "/finance/reconciliation/invoices",
              },
              {
                name: "Discrepancies",
                path: "/finance/reconciliation/discrepancies",
              },
            ],
          },
          {
            name: "Refunds & Credits",
            icon: "fa-solid fa-undo",
            subItems: [
              { name: "Approve Refund", path: "/finance/refunds" },
              { name: "Refund History", path: "/finance/refunds/history" },
            ],
          },
        ],
      },
    ],
    // PURCHASING - Purchase orders & material receiving
    purchasing: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "PURCHASING",
        items: [
          {
            name: "Purchase Requests",
            icon: "fa-solid fa-cart-plus",
            subItems: [
              { name: "Create P.O.", path: "/purchasing/po/new" },
              { name: "All P.O.s", path: "/purchasing/po" },
              { name: "Pending Orders", path: "/purchasing/po/pending" },
            ],
          },
          {
            name: "Material Receiving",
            icon: "fa-solid fa-box-open",
            subItems: [
              { name: "Record Receipt", path: "/purchasing/receiving/new" },
              { name: "Delivery Confirmations", path: "/purchasing/receiving" },
              {
                name: "Receiving History",
                path: "/purchasing/receiving/history",
              },
            ],
          },
          {
            name: "Supplier Management",
            icon: "fa-solid fa-store",
            subItems: [
              { name: "Add Supplier", path: "/purchasing/suppliers/new" },
              { name: "All Suppliers", path: "/purchasing/suppliers" },
              {
                name: "Supplier Contacts",
                path: "/purchasing/suppliers/contacts",
              },
            ],
          },
          {
            name: "Material Logs",
            icon: "fa-solid fa-file-invoice",
            subItems: [
              {
                name: "Fabric Inventory",
                path: "/purchasing/materials/fabric",
              },
              { name: "Supplies", path: "/purchasing/materials/supplies" },
              {
                name: "Received Materials",
                path: "/purchasing/materials/received",
              },
            ],
          },
          {
            name: "Warehouse Tag",
            icon: "fa-solid fa-tags",
            path: "/purchasing/warehouse-tag",
          },
          {
            name: "Receipts & Invoices",
            icon: "fa-solid fa-receipt",
            path: "/purchasing/documents",
          },
        ],
      },
    ],
    // CUTTER - Cutting department tasks
    cutter: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "CUTTING",
        items: [
          {
            name: "Cutting Tasks",
            icon: "fa-solid fa-cut",
            subItems: [
              { name: "Active Tasks", path: "/cutting/tasks" },
              { name: "Sample Cutting", path: "/cutting/tasks/sample" },
              { name: "Mass Cutting", path: "/cutting/tasks/mass" },
              { name: "Completed", path: "/cutting/tasks/completed" },
            ],
          },
          {
            name: "QR Scanner",
            icon: "fa-solid fa-qrcode",
            subItems: [
              { name: "Start Task", path: "/cutting/qr/start" },
              { name: "Complete Task", path: "/cutting/qr/complete" },
              { name: "Scan History", path: "/cutting/qr/history" },
            ],
          },
          {
            name: "Consumption Logs",
            icon: "fa-solid fa-chart-bar",
            subItems: [
              { name: "Record Consumption", path: "/cutting/consumption/new" },
              { name: "Daily Log", path: "/cutting/consumption" },
              { name: "Fabric Usage", path: "/cutting/consumption/fabric" },
            ],
          },
          {
            name: "Issues & Shortages",
            icon: "fa-solid fa-exclamation-circle",
            subItems: [
              { name: "Report Issue", path: "/cutting/issues/new" },
              { name: "Material Shortage", path: "/cutting/issues/shortage" },
              { name: "Issue History", path: "/cutting/issues" },
            ],
          },
          {
            name: "Dispatch to Printing",
            icon: "fa-solid fa-paper-plane",
            path: "/cutting/dispatch",
          },
        ],
      },
    ],
    // DRIVER - Delivery & pickup operations
    driver: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "DELIVERY",
        items: [
          {
            name: "Deliveries",
            icon: "fa-solid fa-truck",
            subItems: [
              { name: "Assigned Deliveries", path: "/driver/deliveries" },
              { name: "In Progress", path: "/driver/deliveries/in-progress" },
              { name: "Completed", path: "/driver/deliveries/completed" },
              { name: "Delivery History", path: "/driver/deliveries/history" },
            ],
          },
          {
            name: "Pickup Tasks",
            icon: "fa-solid fa-box",
            subItems: [
              { name: "Material Pickups", path: "/driver/pickups" },
              { name: "Scheduled Pickups", path: "/driver/pickups/scheduled" },
              { name: "Pickup History", path: "/driver/pickups/history" },
            ],
          },
          {
            name: "Delivery Receipts",
            icon: "fa-solid fa-receipt",
            subItems: [
              { name: "Upload POD", path: "/driver/receipts/upload" },
              { name: "POD Records", path: "/driver/receipts" },
              { name: "Signature Proof", path: "/driver/receipts/signatures" },
            ],
          },
          {
            name: "Mileage Tracking",
            icon: "fa-solid fa-road",
            subItems: [
              { name: "Log Mileage", path: "/driver/mileage/new" },
              { name: "Daily Log", path: "/driver/mileage" },
              { name: "Trip Report", path: "/driver/mileage/report" },
            ],
          },
          {
            name: "Route Planning",
            icon: "fa-solid fa-route",
            path: "/driver/routes",
          },
        ],
      },
    ],
    // PRINTER - Printing department (Silkscreen/DTF/Sublimation)
    printer: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "PRINTING",
        items: [
          {
            name: "Print Queue",
            icon: "fa-solid fa-print",
            subItems: [
              { name: "Assigned Tasks", path: "/printer/queue" },
              { name: "Sample Printing", path: "/printer/queue/sample" },
              { name: "Mass Printing", path: "/printer/queue/mass" },
              { name: "Completed Jobs", path: "/printer/queue/completed" },
            ],
          },
          {
            name: "QR Scanner",
            icon: "fa-solid fa-qrcode",
            subItems: [
              { name: "Scan Variant", path: "/printer/qr/variant" },
              { name: "Begin Printing", path: "/printer/qr/start" },
              { name: "Finish Task", path: "/printer/qr/complete" },
              { name: "Scan History", path: "/printer/qr/history" },
            ],
          },
          {
            name: "Consumption Logs",
            icon: "fa-solid fa-chart-bar",
            subItems: [
              {
                name: "Record Paint Usage",
                path: "/printer/consumption/paint",
              },
              { name: "Daily Log", path: "/printer/consumption" },
              { name: "Ink Inventory", path: "/printer/consumption/inventory" },
            ],
          },
          {
            name: "Print History",
            icon: "fa-solid fa-history",
            subItems: [
              { name: "Completed Prints", path: "/printer/history" },
              { name: "Daily Report", path: "/printer/history/daily" },
              { name: "Print Statistics", path: "/printer/history/stats" },
            ],
          },
          {
            name: "Dispatch to Sewing",
            icon: "fa-solid fa-paper-plane",
            path: "/printer/dispatch",
          },
        ],
      },
    ],
    // SEWER - Sewing department operations
    sewer: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "SEWING",
        items: [
          {
            name: "Sewing Tasks",
            icon: "fa-solid fa-tshirt",
            subItems: [
              { name: "Assigned Batches", path: "/sewing/tasks" },
              { name: "Sample Sewing", path: "/sewing/tasks/sample" },
              { name: "Mass Sewing", path: "/sewing/tasks/mass" },
              { name: "Completed Jobs", path: "/sewing/tasks/completed" },
            ],
          },
          {
            name: "QR Scanner",
            icon: "fa-solid fa-qrcode",
            subItems: [
              { name: "Start Sewing", path: "/sewing/qr/start" },
              { name: "Mark Finished", path: "/sewing/qr/finish" },
              { name: "Scan History", path: "/sewing/qr/history" },
            ],
          },
          {
            name: "Revision Management",
            icon: "fa-solid fa-edit",
            subItems: [
              { name: "Tag for Revision", path: "/sewing/revisions/tag" },
              { name: "Revision Queue", path: "/sewing/revisions" },
              { name: "Revision History", path: "/sewing/revisions/history" },
            ],
          },
          {
            name: "Consumption Logs",
            icon: "fa-solid fa-chart-bar",
            subItems: [
              { name: "Record Usage", path: "/sewing/consumption/new" },
              { name: "Thread Usage", path: "/sewing/consumption/thread" },
              { name: "Fabric Usage", path: "/sewing/consumption/fabric" },
            ],
          },
          {
            name: "Finishing & QA",
            icon: "fa-solid fa-check-circle",
            path: "/sewing/qa-dispatch",
          },
        ],
      },
    ],
    // QA - Quality Assurance & inspection
    qa: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "QUALITY ASSURANCE",
        items: [
          {
            name: "QA Dashboard",
            icon: "fa-solid fa-clipboard-check",
            subItems: [
              { name: "Inspection Queue", path: "/qa/dashboard" },
              { name: "Pending Items", path: "/qa/dashboard/pending" },
              { name: "Active Inspections", path: "/qa/dashboard/active" },
            ],
          },
          {
            name: "QC Reports",
            icon: "fa-solid fa-file-chart-line",
            subItems: [
              { name: "Generate Report", path: "/qa/reports/new" },
              { name: "All Reports", path: "/qa/reports" },
              { name: "Report History", path: "/qa/reports/history" },
            ],
          },
          {
            name: "Inspection by Stage",
            icon: "fa-solid fa-search",
            subItems: [
              { name: "Sample Inspection", path: "/qa/inspection/sample" },
              {
                name: "Sample Revision Check",
                path: "/qa/inspection/sample-revision",
              },
              { name: "Mass Production", path: "/qa/inspection/mass" },
            ],
          },
          {
            name: "Quality Decisions",
            icon: "fa-solid fa-check-double",
            subItems: [
              { name: "Mark Passed", path: "/qa/decision/pass" },
              { name: "Mark Failed", path: "/qa/decision/fail" },
              { name: "Tag for Revision", path: "/qa/decision/revision" },
            ],
          },
          {
            name: "Reject Management",
            icon: "fa-solid fa-images",
            subItems: [
              { name: "Upload Reject Images", path: "/qa/rejects/upload" },
              { name: "Reject Records", path: "/qa/rejects" },
              { name: "Failure Analysis", path: "/qa/rejects/analysis" },
            ],
          },
          {
            name: "Revision Triggers",
            icon: "fa-solid fa-list",
            path: "/qa/revision-queue",
          },
        ],
      },
    ],
    // PACKER - Packing & preparation for delivery
    packer: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "PACKING",
        items: [
          {
            name: "Packing Tasks",
            icon: "fa-solid fa-box",
            subItems: [
              { name: "Assigned Tasks", path: "/packer/tasks" },
              { name: "In Progress", path: "/packer/tasks/in-progress" },
              { name: "Completed", path: "/packer/tasks/completed" },
            ],
          },
          {
            name: "QR Scanner",
            icon: "fa-solid fa-qrcode",
            subItems: [
              { name: "Scan Items", path: "/packer/qr/scan" },
              { name: "Confirm Packing", path: "/packer/qr/confirm" },
              { name: "Scan History", path: "/packer/qr/history" },
            ],
          },
          {
            name: "Size Breakdown",
            icon: "fa-solid fa-list-ol",
            subItems: [
              { name: "Update Quantities", path: "/packer/sizes/update" },
              { name: "Size Verification", path: "/packer/sizes/verify" },
            ],
          },
          {
            name: "Packing History",
            icon: "fa-solid fa-history",
            subItems: [
              { name: "Daily Packing", path: "/packer/history" },
              { name: "Packed Orders", path: "/packer/history/orders" },
              { name: "Ready for Delivery", path: "/packer/history/ready" },
            ],
          },
          {
            name: "Discrepancies",
            icon: "fa-solid fa-exclamation-circle",
            path: "/packer/discrepancies",
          },
        ],
      },
    ],
    // WAREHOUSE MANAGER - Inventory & stock oversight
    warehouse_manager: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "WAREHOUSE",
        items: [
          {
            name: "Inventory Dashboard",
            icon: "fa-solid fa-warehouse",
            subItems: [
              { name: "Overview", path: "/warehouse/dashboard" },
              { name: "Real-time Stock", path: "/warehouse/dashboard/stock" },
              { name: "Movements", path: "/warehouse/dashboard/movements" },
            ],
          },
          {
            name: "Stock Management",
            icon: "fa-solid fa-boxes",
            subItems: [
              { name: "Stock by Size/Design", path: "/warehouse/stock" },
              { name: "Low Stock Alerts", path: "/warehouse/stock/alerts" },
              { name: "Aging Stock", path: "/warehouse/stock/aging" },
            ],
          },
          {
            name: "Material Receiving Approval",
            icon: "fa-solid fa-box-open",
            subItems: [
              {
                name: "Pending Receipts",
                path: "/warehouse/approvals/receiving",
              },
              {
                name: "Approve Receipt",
                path: "/warehouse/approvals/receiving/approve",
              },
              {
                name: "Receipt History",
                path: "/warehouse/approvals/receiving/history",
              },
            ],
          },
          {
            name: "Stock Adjustments",
            icon: "fa-solid fa-exchange-alt",
            subItems: [
              {
                name: "Pending Adjustments",
                path: "/warehouse/approvals/adjustments",
              },
              {
                name: "Approve Adjustment",
                path: "/warehouse/approvals/adjustments/approve",
              },
              {
                name: "Adjustment History",
                path: "/warehouse/approvals/adjustments/history",
              },
            ],
          },
          {
            name: "QR Scanning",
            icon: "fa-solid fa-qrcode",
            subItems: [
              {
                name: "Scan Finished Goods",
                path: "/warehouse/qr/finished-goods",
              },
              { name: "Order Dispatch", path: "/warehouse/qr/dispatch" },
              { name: "Sale Deduction", path: "/warehouse/qr/sale" },
              { name: "Scan History", path: "/warehouse/qr/history" },
            ],
          },
          {
            name: "Inventory Reports",
            icon: "fa-solid fa-chart-line",
            subItems: [
              { name: "Weekly Report", path: "/warehouse/reports/weekly" },
              { name: "Stock Summary", path: "/warehouse/reports/summary" },
              { name: "Shortage Report", path: "/warehouse/reports/shortages" },
            ],
          },
        ],
      },
    ],
    // SCREEN MAKER - Screen preparation for printing
    screen_maker: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "SCREEN MAKING",
        items: [
          {
            name: "Screen Tasks",
            icon: "fa-solid fa-palette",
            subItems: [
              { name: "Assigned Tasks", path: "/screenmaker/tasks" },
              { name: "In Progress", path: "/screenmaker/tasks/in-progress" },
              { name: "Completed", path: "/screenmaker/tasks/completed" },
            ],
          },
          {
            name: "QR Scanner",
            icon: "fa-solid fa-qrcode",
            subItems: [
              { name: "Start Screen Making", path: "/screenmaker/qr/start" },
              { name: "Mark Complete", path: "/screenmaker/qr/complete" },
              { name: "Scan History", path: "/screenmaker/qr/history" },
            ],
          },
          {
            name: "Screen Preview",
            icon: "fa-solid fa-image",
            subItems: [
              { name: "Upload Preview", path: "/screenmaker/preview/upload" },
              { name: "My Previews", path: "/screenmaker/preview" },
            ],
          },
          {
            name: "Ready for Printing",
            icon: "fa-solid fa-check-circle",
            path: "/screenmaker/ready-for-printing",
          },
          {
            name: "Approval Queue",
            icon: "fa-solid fa-list",
            path: "/screenmaker/approvals",
          },
        ],
      },
    ],
    // SAMPLE MAKER - Sample production workflow
    sample_maker: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "SAMPLE MAKING",
        items: [
          {
            name: "Sample Workflow",
            icon: "fa-solid fa-clipboard-list",
            subItems: [
              { name: "Assigned Samples", path: "/samplemaker/workflow" },
              { name: "Cutting Stage", path: "/samplemaker/workflow/cutting" },
              {
                name: "Printing Stage",
                path: "/samplemaker/workflow/printing",
              },
              { name: "Sewing Stage", path: "/samplemaker/workflow/sewing" },
              {
                name: "Finishing Stage",
                path: "/samplemaker/workflow/finishing",
              },
            ],
          },
          {
            name: "QR Scanner",
            icon: "fa-solid fa-qrcode",
            subItems: [
              { name: "Scan for All Steps", path: "/samplemaker/qr/scan" },
              {
                name: "Mark Stage Complete",
                path: "/samplemaker/qr/complete-stage",
              },
              { name: "Scan History", path: "/samplemaker/qr/history" },
            ],
          },
          {
            name: "Revision Management",
            icon: "fa-solid fa-edit",
            subItems: [
              { name: "Log Revisions", path: "/samplemaker/revisions/log" },
              { name: "Revision History", path: "/samplemaker/revisions" },
              {
                name: "Revision Requests",
                path: "/samplemaker/revisions/requests",
              },
            ],
          },
          {
            name: "Sample Status",
            icon: "fa-solid fa-box",
            subItems: [
              { name: "For QA Inspection", path: "/samplemaker/status/qa" },
              {
                name: "For Client Approval",
                path: "/samplemaker/status/client",
              },
              {
                name: "Completed Samples",
                path: "/samplemaker/status/completed",
              },
            ],
          },
        ],
      },
    ],
    // SUBCONTRACT - Outsourced work management
    subcontract: [
      {
        section: "GENERAL MENU",
        items: [
          {
            name: "Dashboard",
            icon: "fa-solid fa-chart-line",
            path: "/dashboard",
          },
        ],
      },
      {
        section: "SUBCONTRACTING",
        items: [
          {
            name: "Outsourced Tasks",
            icon: "fa-solid fa-file-invoice",
            subItems: [
              { name: "Assigned Orders", path: "/subcon/tasks" },
              { name: "In Progress", path: "/subcon/tasks/in-progress" },
              { name: "Completed", path: "/subcon/tasks/completed" },
            ],
          },
          {
            name: "Task Tracking",
            icon: "fa-solid fa-map-marker-alt",
            subItems: [
              { name: "Date Sent Out", path: "/subcon/tracking/sent" },
              { name: "Date Returned", path: "/subcon/tracking/returned" },
              { name: "Track Progress", path: "/subcon/tracking/progress" },
            ],
          },
          {
            name: "Documentation",
            icon: "fa-solid fa-receipt",
            subItems: [
              { name: "Upload Receipts", path: "/subcon/docs/upload" },
              { name: "Upload Photos", path: "/subcon/docs/photos" },
              { name: "Document History", path: "/subcon/docs" },
            ],
          },
          {
            name: "Cost Management",
            icon: "fa-solid fa-money-bill-wave",
            subItems: [
              { name: "Encode Subcon Cost", path: "/subcon/cost/new" },
              { name: "Cost Records", path: "/subcon/cost" },
              { name: "Cost Summary", path: "/subcon/cost/summary" },
            ],
          },
          {
            name: "Quantity Verification",
            icon: "fa-solid fa-boxes",
            subItems: [
              { name: "Expected vs Returned", path: "/subcon/qty/verify" },
              { name: "Discrepancies", path: "/subcon/qty/discrepancies" },
              { name: "Update Quantities", path: "/subcon/qty/update" },
            ],
          },
          {
            name: "Task Completion",
            icon: "fa-solid fa-check-circle",
            path: "/subcon/completion",
          },
        ],
      },
    ],
  };

  return baseMenu[userType] || baseMenu.csr;
};
