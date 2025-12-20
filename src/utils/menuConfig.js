// Menu configuration for all 16 roles in ASH AI System
// Each role has access to specific modules based on their functions
export const getMenuByRole = (userType) => {
  const baseMenu = {
    // ADMIN - Full system access
    admin: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'ADMIN MENU',
        items: [
          {
            name: 'User & Roles',
            icon: 'mdi:account-multiple',
            subItems: [
              { name: 'Add User', path: '/admin/users/new' },
              { name: 'All Users', path: '/admin/users' },
              { name: 'Manage Roles', path: '/admin/roles' },
            ],
          },
          {
            name: 'Inventory Management',
            icon: 'mdi:warehouse',
            subItems: [
              { name: 'View Inventory', path: '/admin/inventory' },
              { name: 'Adjust Stock', path: '/admin/inventory/adjust' },
              { name: 'Inventory Reports', path: '/admin/inventory/reports' },
            ],
          },
          {
            name: 'Financial Suite',
            icon: 'mdi:chart-line',
            subItems: [
              { name: 'Financial Reports', path: '/admin/reports/financial' },
              { name: 'Revenue Overview', path: '/admin/reports/revenue' },
              { name: 'Cost Analysis', path: '/admin/reports/costs' },
            ],
          },
          {
            name: 'Audit & Compliance',
            icon: 'mdi:history',
            subItems: [
              { name: 'Audit Trail', path: '/admin/audit-logs' },
              { name: 'User Activity', path: '/admin/audit/user-activity' },
              { name: 'System Changes', path: '/admin/audit/system-changes' },
            ],
          },
          {
            name: 'System Settings',
            icon: 'mdi:cog',
            subItems: [
              { name: 'General Config', path: '/admin/settings/general' },
              { name: 'Pricing Setup', path: '/admin/settings/pricing' },
              { name: 'Access Levels', path: '/admin/settings/access' },
              { name: 'System Preferences', path: '/admin/settings/preferences' },
            ],
          },
          {
            name: 'P.O. & Job Orders',
            icon: 'mdi:file-document-multiple',
            subItems: [
              { name: 'Create P.O.', path: '/admin/po/new' },
              { name: 'All P.O.s', path: '/admin/po' },
              { name: 'Job Orders', path: '/admin/job-orders' },
            ],
          },
        ],
      },
    ],
    // GENERAL MANAGER - High-level oversight & approvals
    general_manager: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'MANAGEMENT OVERVIEW',
        items: [
          {
            name: 'Orders',
            icon: 'mdi:file-document-multiple',
            subItems: [
              { name: 'All Orders', path: '/gm/orders' },
              { name: 'Order Status', path: '/gm/orders/status' },
              { name: 'Production Queue', path: '/gm/production-queue' },
            ],
          },
          {
            name: 'Approvals & Decisions',
            icon: 'mdi:check-circle',
            subItems: [
              { name: 'Sample Approvals', path: '/gm/approvals/samples' },
              { name: 'Payment Approvals', path: '/gm/approvals/payments' },
              { name: 'Purchase Approvals', path: '/gm/approvals/purchases' },
              { name: 'Critical Changes', path: '/gm/approvals/critical-changes' },
            ],
          },
          {
            name: 'Financial Overview',
            icon: 'mdi:chart-line',
            subItems: [
              { name: 'Financial Summary', path: '/gm/financial/summary' },
              { name: 'Revenue by Order', path: '/gm/financial/revenue' },
              { name: 'Cost Analysis', path: '/gm/financial/costs' },
            ],
          },
          {
            name: 'Performance & Reports',
            icon: 'mdi:chart-box-outline',
            subItems: [
              { name: 'Staff Performance', path: '/gm/reports/staff' },
              { name: 'Production Delays', path: '/gm/reports/delays' },
              { name: 'Bottleneck Analysis', path: '/gm/reports/bottlenecks' },
            ],
          },
          {
            name: 'Inventory Overview',
            icon: 'mdi:warehouse',
            path: '/gm/warehouse-dashboard',
          },
        ],
      },
    ],
    // CSR - Customer Support Representative
    csr: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'ORDER MANAGEMENT',
        items: [
          {
            name: 'Create Order',
            icon: 'mdi:plus-circle',
            path: '/csr/orders/new',
          },
          {
            name: 'My Orders',
            icon: 'mdi:file-document-multiple',
            subItems: [
              { name: 'Active Orders', path: '/csr/orders' },
              { name: 'Completed Orders', path: '/csr/orders/completed' },
              { name: 'Order History', path: '/csr/orders/history' },
            ],
          },
          {
            name: 'Client Management',
            icon: 'mdi:account-multiple',
            subItems: [
              { name: 'Client Records', path: '/csr/clients' },
              { name: 'Contact Details', path: '/csr/clients/contacts' },
              { name: 'Order Notes', path: '/csr/clients/notes' },
            ],
          },
          {
            name: 'Communication',
            icon: 'mdi:message-multiple',
            path: '/csr/communication',
          },
          {
            name: 'Payments',
            icon: 'mdi:cash-multiple',
            subItems: [
              { name: 'Upload Proof', path: '/csr/payments/upload' },
              { name: 'Payment History', path: '/csr/payments/history' },
              { name: 'For Verification', path: '/csr/payments/verification' },
            ],
          },
          {
            name: 'Design & Production',
            icon: 'mdi:file-image',
            subItems: [
              { name: 'Upload Designs', path: '/csr/designs/upload' },
              { name: 'Sample Request', path: '/csr/production/sample-request' },
              { name: 'Mass Production', path: '/csr/production/mass-production' },
              { name: 'For Delivery', path: '/csr/orders/for-delivery' },
            ],
          },
        ],
      },
    ],
    // GRAPHIC ARTIST - Design tasks & layout preparation
    graphic_artist: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'DESIGN WORK',
        items: [
          {
            name: 'Design Tasks',
            icon: 'mdi:palette',
            subItems: [
              { name: 'Assigned Tasks', path: '/artist/design-tasks' },
              { name: 'In Progress', path: '/artist/design-tasks/in-progress' },
              { name: 'Completed', path: '/artist/design-tasks/completed' },
            ],
          },
          {
            name: 'Graphics Management',
            icon: 'mdi:cloud-upload',
            subItems: [
              { name: 'Upload Graphics', path: '/artist/graphics/upload' },
              { name: 'My Graphics', path: '/artist/graphics' },
              { name: 'File Formats', path: '/artist/graphics/formats' },
            ],
          },
          {
            name: 'Print Layouts',
            icon: 'mdi:print',
            subItems: [
              { name: 'Create Layout', path: '/artist/print-layouts/new' },
              { name: 'My Layouts', path: '/artist/print-layouts' },
              { name: 'Layout Types', path: '/artist/print-layouts/types' },
            ],
          },
          {
            name: 'Revisions',
            icon: 'mdi:pencil',
            subItems: [
              { name: 'Revision Requests', path: '/artist/revisions' },
              { name: 'Upload Updated', path: '/artist/revisions/upload' },
              { name: 'Revision History', path: '/artist/revisions/history' },
            ],
          },
          {
            name: 'Screen Requests',
            icon: 'mdi:image',
            subItems: [
              { name: 'Request Screen Making', path: '/artist/screen-requests/new' },
              { name: 'All Requests', path: '/artist/screen-requests' },
              { name: 'Ready for Printing', path: '/artist/screen-requests/ready' },
            ],
          },
          {
            name: 'Approval Queue',
            icon: 'mdi:check-circle',
            path: '/artist/approvals',
          },
        ],
      },
    ],
    // FINANCE - Payment & expense management
    finance: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'FINANCE',
        items: [
          {
            name: 'Payment Verification',
            icon: 'mdi:check-decagram',
            subItems: [
              { name: 'Verify Payments', path: '/finance/payments/verify' },
              { name: 'Downpayments', path: '/finance/payments/downpayment' },
              { name: 'Full Payments', path: '/finance/payments/full' },
              { name: 'Verified Records', path: '/finance/payments/verified' },
            ],
          },
          {
            name: 'Expense Management',
            icon: 'mdi:cash-remove',
            subItems: [
              { name: 'Record Expense', path: '/finance/expenses/new' },
              { name: 'All Expenses', path: '/finance/expenses' },
              { name: 'Expense Categories', path: '/finance/expenses/categories' },
            ],
          },
          {
            name: 'Financial Reports',
            icon: 'mdi:chart-line',
            subItems: [
              { name: 'Income Report', path: '/finance/reports/income' },
              { name: 'Expense Report', path: '/finance/reports/expenses' },
              { name: 'Profit & Loss', path: '/finance/reports/pl' },
            ],
          },
          {
            name: 'Statement of Account',
            icon: 'mdi:file-document',
            subItems: [
              { name: 'Generate SOA', path: '/finance/soa/new' },
              { name: 'All SOAs', path: '/finance/soa' },
              { name: 'Client SOA', path: '/finance/soa/client' },
            ],
          },
          {
            name: 'Reconciliation',
            icon: 'mdi:clipboard-list',
            subItems: [
              { name: 'Delivery Receipts', path: '/finance/reconciliation/receipts' },
              { name: 'Invoice Matching', path: '/finance/reconciliation/invoices' },
              { name: 'Discrepancies', path: '/finance/reconciliation/discrepancies' },
            ],
          },
          {
            name: 'Refunds & Credits',
            icon: 'mdi:cash-refund',
            subItems: [
              { name: 'Approve Refund', path: '/finance/refunds' },
              { name: 'Refund History', path: '/finance/refunds/history' },
            ],
          },
        ],
      },
    ],
    // PURCHASING - Purchase orders & material receiving
    purchasing: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'PURCHASING',
        items: [
          {
            name: 'Purchase Requests',
            icon: 'mdi:cart-plus',
            subItems: [
              { name: 'Create P.O.', path: '/purchasing/po/new' },
              { name: 'All P.O.s', path: '/purchasing/po' },
              { name: 'Pending Orders', path: '/purchasing/po/pending' },
            ],
          },
          {
            name: 'Material Receiving',
            icon: 'mdi:package-received',
            subItems: [
              { name: 'Record Receipt', path: '/purchasing/receiving/new' },
              { name: 'Delivery Confirmations', path: '/purchasing/receiving' },
              { name: 'Receiving History', path: '/purchasing/receiving/history' },
            ],
          },
          {
            name: 'Supplier Management',
            icon: 'mdi:store',
            subItems: [
              { name: 'Add Supplier', path: '/purchasing/suppliers/new' },
              { name: 'All Suppliers', path: '/purchasing/suppliers' },
              { name: 'Supplier Contacts', path: '/purchasing/suppliers/contacts' },
            ],
          },
          {
            name: 'Material Logs',
            icon: 'mdi:file-document-multiple',
            subItems: [
              { name: 'Fabric Inventory', path: '/purchasing/materials/fabric' },
              { name: 'Supplies', path: '/purchasing/materials/supplies' },
              { name: 'Received Materials', path: '/purchasing/materials/received' },
            ],
          },
          {
            name: 'Warehouse Tag',
            icon: 'mdi:tag-multiple',
            path: '/purchasing/warehouse-tag',
          },
          {
            name: 'Receipts & Invoices',
            icon: 'mdi:receipt',
            path: '/purchasing/documents',
          },
        ],
      },
    ],
    // CUTTER - Cutting department tasks
    cutter: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'CUTTING',
        items: [
          {
            name: 'Cutting Tasks',
            icon: 'mdi:scissors-cutting',
            subItems: [
              { name: 'Active Tasks', path: '/cutting/tasks' },
              { name: 'Sample Cutting', path: '/cutting/tasks/sample' },
              { name: 'Mass Cutting', path: '/cutting/tasks/mass' },
              { name: 'Completed', path: '/cutting/tasks/completed' },
            ],
          },
          {
            name: 'QR Scanner',
            icon: 'mdi:qrcode',
            subItems: [
              { name: 'Start Task', path: '/cutting/qr/start' },
              { name: 'Complete Task', path: '/cutting/qr/complete' },
              { name: 'Scan History', path: '/cutting/qr/history' },
            ],
          },
          {
            name: 'Consumption Logs',
            icon: 'mdi:chart-box-outline',
            subItems: [
              { name: 'Record Consumption', path: '/cutting/consumption/new' },
              { name: 'Daily Log', path: '/cutting/consumption' },
              { name: 'Fabric Usage', path: '/cutting/consumption/fabric' },
            ],
          },
          {
            name: 'Issues & Shortages',
            icon: 'mdi:alert-circle',
            subItems: [
              { name: 'Report Issue', path: '/cutting/issues/new' },
              { name: 'Material Shortage', path: '/cutting/issues/shortage' },
              { name: 'Issue History', path: '/cutting/issues' },
            ],
          },
          {
            name: 'Dispatch to Printing',
            icon: 'mdi:send',
            path: '/cutting/dispatch',
          },
        ],
      },
    ],
    // DRIVER - Delivery & pickup operations
    driver: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'DELIVERY',
        items: [
          {
            name: 'Deliveries',
            icon: 'mdi:truck-delivery',
            subItems: [
              { name: 'Assigned Deliveries', path: '/driver/deliveries' },
              { name: 'In Progress', path: '/driver/deliveries/in-progress' },
              { name: 'Completed', path: '/driver/deliveries/completed' },
              { name: 'Delivery History', path: '/driver/deliveries/history' },
            ],
          },
          {
            name: 'Pickup Tasks',
            icon: 'mdi:package-up',
            subItems: [
              { name: 'Material Pickups', path: '/driver/pickups' },
              { name: 'Scheduled Pickups', path: '/driver/pickups/scheduled' },
              { name: 'Pickup History', path: '/driver/pickups/history' },
            ],
          },
          {
            name: 'Delivery Receipts',
            icon: 'mdi:receipt',
            subItems: [
              { name: 'Upload POD', path: '/driver/receipts/upload' },
              { name: 'POD Records', path: '/driver/receipts' },
              { name: 'Signature Proof', path: '/driver/receipts/signatures' },
            ],
          },
          {
            name: 'Mileage Tracking',
            icon: 'mdi:map-marker-distance',
            subItems: [
              { name: 'Log Mileage', path: '/driver/mileage/new' },
              { name: 'Daily Log', path: '/driver/mileage' },
              { name: 'Trip Report', path: '/driver/mileage/report' },
            ],
          },
          {
            name: 'Route Planning',
            icon: 'mdi:routes',
            path: '/driver/routes',
          },
        ],
      },
    ],
    // PRINTER - Printing department (Silkscreen/DTF/Sublimation)
    printer: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'PRINTING',
        items: [
          {
            name: 'Print Queue',
            icon: 'mdi:printer',
            subItems: [
              { name: 'Assigned Tasks', path: '/printer/queue' },
              { name: 'Sample Printing', path: '/printer/queue/sample' },
              { name: 'Mass Printing', path: '/printer/queue/mass' },
              { name: 'Completed Jobs', path: '/printer/queue/completed' },
            ],
          },
          {
            name: 'QR Scanner',
            icon: 'mdi:qrcode',
            subItems: [
              { name: 'Scan Variant', path: '/printer/qr/variant' },
              { name: 'Begin Printing', path: '/printer/qr/start' },
              { name: 'Finish Task', path: '/printer/qr/complete' },
              { name: 'Scan History', path: '/printer/qr/history' },
            ],
          },
          {
            name: 'Consumption Logs',
            icon: 'mdi:chart-box-outline',
            subItems: [
              { name: 'Record Paint Usage', path: '/printer/consumption/paint' },
              { name: 'Daily Log', path: '/printer/consumption' },
              { name: 'Ink Inventory', path: '/printer/consumption/inventory' },
            ],
          },
          {
            name: 'Print History',
            icon: 'mdi:history',
            subItems: [
              { name: 'Completed Prints', path: '/printer/history' },
              { name: 'Daily Report', path: '/printer/history/daily' },
              { name: 'Print Statistics', path: '/printer/history/stats' },
            ],
          },
          {
            name: 'Dispatch to Sewing',
            icon: 'mdi:send',
            path: '/printer/dispatch',
          },
        ],
      },
    ],
    // SEWER - Sewing department operations
    sewer: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'SEWING',
        items: [
          {
            name: 'Sewing Tasks',
            icon: 'mdi:needle',
            subItems: [
              { name: 'Assigned Batches', path: '/sewing/tasks' },
              { name: 'Sample Sewing', path: '/sewing/tasks/sample' },
              { name: 'Mass Sewing', path: '/sewing/tasks/mass' },
              { name: 'Completed Jobs', path: '/sewing/tasks/completed' },
            ],
          },
          {
            name: 'QR Scanner',
            icon: 'mdi:qrcode',
            subItems: [
              { name: 'Start Sewing', path: '/sewing/qr/start' },
              { name: 'Mark Finished', path: '/sewing/qr/finish' },
              { name: 'Scan History', path: '/sewing/qr/history' },
            ],
          },
          {
            name: 'Revision Management',
            icon: 'mdi:pencil-multiple',
            subItems: [
              { name: 'Tag for Revision', path: '/sewing/revisions/tag' },
              { name: 'Revision Queue', path: '/sewing/revisions' },
              { name: 'Revision History', path: '/sewing/revisions/history' },
            ],
          },
          {
            name: 'Consumption Logs',
            icon: 'mdi:chart-box-outline',
            subItems: [
              { name: 'Record Usage', path: '/sewing/consumption/new' },
              { name: 'Thread Usage', path: '/sewing/consumption/thread' },
              { name: 'Fabric Usage', path: '/sewing/consumption/fabric' },
            ],
          },
          {
            name: 'Finishing & QA',
            icon: 'mdi:check-circle',
            path: '/sewing/qa-dispatch',
          },
        ],
      },
    ],
    // QA - Quality Assurance & inspection
    qa: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'QUALITY ASSURANCE',
        items: [
          {
            name: 'QA Dashboard',
            icon: 'mdi:clipboard-check',
            subItems: [
              { name: 'Inspection Queue', path: '/qa/dashboard' },
              { name: 'Pending Items', path: '/qa/dashboard/pending' },
              { name: 'Active Inspections', path: '/qa/dashboard/active' },
            ],
          },
          {
            name: 'QC Reports',
            icon: 'mdi:file-chart',
            subItems: [
              { name: 'Generate Report', path: '/qa/reports/new' },
              { name: 'All Reports', path: '/qa/reports' },
              { name: 'Report History', path: '/qa/reports/history' },
            ],
          },
          {
            name: 'Inspection by Stage',
            icon: 'mdi:magnify',
            subItems: [
              { name: 'Sample Inspection', path: '/qa/inspection/sample' },
              { name: 'Sample Revision Check', path: '/qa/inspection/sample-revision' },
              { name: 'Mass Production', path: '/qa/inspection/mass' },
            ],
          },
          {
            name: 'Quality Decisions',
            icon: 'mdi:check-decagram',
            subItems: [
              { name: 'Mark Passed', path: '/qa/decision/pass' },
              { name: 'Mark Failed', path: '/qa/decision/fail' },
              { name: 'Tag for Revision', path: '/qa/decision/revision' },
            ],
          },
          {
            name: 'Reject Management',
            icon: 'mdi:image-multiple',
            subItems: [
              { name: 'Upload Reject Images', path: '/qa/rejects/upload' },
              { name: 'Reject Records', path: '/qa/rejects' },
              { name: 'Failure Analysis', path: '/qa/rejects/analysis' },
            ],
          },
          {
            name: 'Revision Triggers',
            icon: 'mdi:list-box',
            path: '/qa/revision-queue',
          },
        ],
      },
    ],
    // PACKER - Packing & preparation for delivery
    packer: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'PACKING',
        items: [
          {
            name: 'Packing Tasks',
            icon: 'mdi:package',
            subItems: [
              { name: 'Assigned Tasks', path: '/packer/tasks' },
              { name: 'In Progress', path: '/packer/tasks/in-progress' },
              { name: 'Completed', path: '/packer/tasks/completed' },
            ],
          },
          {
            name: 'QR Scanner',
            icon: 'mdi:qrcode',
            subItems: [
              { name: 'Scan Items', path: '/packer/qr/scan' },
              { name: 'Confirm Packing', path: '/packer/qr/confirm' },
              { name: 'Scan History', path: '/packer/qr/history' },
            ],
          },
          {
            name: 'Size Breakdown',
            icon: 'mdi:format-list-numbered',
            subItems: [
              { name: 'Update Quantities', path: '/packer/sizes/update' },
              { name: 'Size Verification', path: '/packer/sizes/verify' },
            ],
          },
          {
            name: 'Packing History',
            icon: 'mdi:history',
            subItems: [
              { name: 'Daily Packing', path: '/packer/history' },
              { name: 'Packed Orders', path: '/packer/history/orders' },
              { name: 'Ready for Delivery', path: '/packer/history/ready' },
            ],
          },
          {
            name: 'Discrepancies',
            icon: 'mdi:alert-circle',
            path: '/packer/discrepancies',
          },
        ],
      },
    ],
    // WAREHOUSE MANAGER - Inventory & stock oversight
    warehouse_manager: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'WAREHOUSE',
        items: [
          {
            name: 'Inventory Dashboard',
            icon: 'mdi:warehouse',
            subItems: [
              { name: 'Overview', path: '/warehouse/dashboard' },
              { name: 'Real-time Stock', path: '/warehouse/dashboard/stock' },
              { name: 'Movements', path: '/warehouse/dashboard/movements' },
            ],
          },
          {
            name: 'Stock Management',
            icon: 'mdi:package-multiple',
            subItems: [
              { name: 'Stock by Size/Design', path: '/warehouse/stock' },
              { name: 'Low Stock Alerts', path: '/warehouse/stock/alerts' },
              { name: 'Aging Stock', path: '/warehouse/stock/aging' },
            ],
          },
          {
            name: 'Material Receiving Approval',
            icon: 'mdi:package-received',
            subItems: [
              { name: 'Pending Receipts', path: '/warehouse/approvals/receiving' },
              { name: 'Approve Receipt', path: '/warehouse/approvals/receiving/approve' },
              { name: 'Receipt History', path: '/warehouse/approvals/receiving/history' },
            ],
          },
          {
            name: 'Stock Adjustments',
            icon: 'mdi:plus-minus-box',
            subItems: [
              { name: 'Pending Adjustments', path: '/warehouse/approvals/adjustments' },
              { name: 'Approve Adjustment', path: '/warehouse/approvals/adjustments/approve' },
              { name: 'Adjustment History', path: '/warehouse/approvals/adjustments/history' },
            ],
          },
          {
            name: 'QR Scanning',
            icon: 'mdi:qrcode',
            subItems: [
              { name: 'Scan Finished Goods', path: '/warehouse/qr/finished-goods' },
              { name: 'Order Dispatch', path: '/warehouse/qr/dispatch' },
              { name: 'Sale Deduction', path: '/warehouse/qr/sale' },
              { name: 'Scan History', path: '/warehouse/qr/history' },
            ],
          },
          {
            name: 'Inventory Reports',
            icon: 'mdi:chart-line',
            subItems: [
              { name: 'Weekly Report', path: '/warehouse/reports/weekly' },
              { name: 'Stock Summary', path: '/warehouse/reports/summary' },
              { name: 'Shortage Report', path: '/warehouse/reports/shortages' },
            ],
          },
        ],
      },
    ],
    // SCREEN MAKER - Screen preparation for printing
    screen_maker: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'SCREEN MAKING',
        items: [
          {
            name: 'Screen Tasks',
            icon: 'mdi:palette',
            subItems: [
              { name: 'Assigned Tasks', path: '/screenmaker/tasks' },
              { name: 'In Progress', path: '/screenmaker/tasks/in-progress' },
              { name: 'Completed', path: '/screenmaker/tasks/completed' },
            ],
          },
          {
            name: 'QR Scanner',
            icon: 'mdi:qrcode',
            subItems: [
              { name: 'Start Screen Making', path: '/screenmaker/qr/start' },
              { name: 'Mark Complete', path: '/screenmaker/qr/complete' },
              { name: 'Scan History', path: '/screenmaker/qr/history' },
            ],
          },
          {
            name: 'Screen Preview',
            icon: 'mdi:image',
            subItems: [
              { name: 'Upload Preview', path: '/screenmaker/preview/upload' },
              { name: 'My Previews', path: '/screenmaker/preview' },
            ],
          },
          {
            name: 'Ready for Printing',
            icon: 'mdi:check-circle',
            path: '/screenmaker/ready-for-printing',
          },
          {
            name: 'Approval Queue',
            icon: 'mdi:list-box',
            path: '/screenmaker/approvals',
          },
        ],
      },
    ],
    // SAMPLE MAKER - Sample production workflow
    sample_maker: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'SAMPLE MAKING',
        items: [
          {
            name: 'Sample Workflow',
            icon: 'mdi:clipboard-list',
            subItems: [
              { name: 'Assigned Samples', path: '/samplemaker/workflow' },
              { name: 'Cutting Stage', path: '/samplemaker/workflow/cutting' },
              { name: 'Printing Stage', path: '/samplemaker/workflow/printing' },
              { name: 'Sewing Stage', path: '/samplemaker/workflow/sewing' },
              { name: 'Finishing Stage', path: '/samplemaker/workflow/finishing' },
            ],
          },
          {
            name: 'QR Scanner',
            icon: 'mdi:qrcode',
            subItems: [
              { name: 'Scan for All Steps', path: '/samplemaker/qr/scan' },
              { name: 'Mark Stage Complete', path: '/samplemaker/qr/complete-stage' },
              { name: 'Scan History', path: '/samplemaker/qr/history' },
            ],
          },
          {
            name: 'Revision Management',
            icon: 'mdi:pencil-multiple',
            subItems: [
              { name: 'Log Revisions', path: '/samplemaker/revisions/log' },
              { name: 'Revision History', path: '/samplemaker/revisions' },
              { name: 'Revision Requests', path: '/samplemaker/revisions/requests' },
            ],
          },
          {
            name: 'Sample Status',
            icon: 'mdi:package',
            subItems: [
              { name: 'For QA Inspection', path: '/samplemaker/status/qa' },
              { name: 'For Client Approval', path: '/samplemaker/status/client' },
              { name: 'Completed Samples', path: '/samplemaker/status/completed' },
            ],
          },
        ],
      },
    ],
    // SUBCONTRACT - Outsourced work management
    subcontract: [
      {
        section: 'GENERAL MENU',
        items: [
          {
            name: 'Dashboard',
            icon: 'mdi:view-dashboard',
            path: '/dashboard',
          },
        ],
      },
      {
        section: 'SUBCONTRACTING',
        items: [
          {
            name: 'Outsourced Tasks',
            icon: 'mdi:file-document-multiple',
            subItems: [
              { name: 'Assigned Orders', path: '/subcon/tasks' },
              { name: 'In Progress', path: '/subcon/tasks/in-progress' },
              { name: 'Completed', path: '/subcon/tasks/completed' },
            ],
          },
          {
            name: 'Task Tracking',
            icon: 'mdi:tracker',
            subItems: [
              { name: 'Date Sent Out', path: '/subcon/tracking/sent' },
              { name: 'Date Returned', path: '/subcon/tracking/returned' },
              { name: 'Track Progress', path: '/subcon/tracking/progress' },
            ],
          },
          {
            name: 'Documentation',
            icon: 'mdi:receipt',
            subItems: [
              { name: 'Upload Receipts', path: '/subcon/docs/upload' },
              { name: 'Upload Photos', path: '/subcon/docs/photos' },
              { name: 'Document History', path: '/subcon/docs' },
            ],
          },
          {
            name: 'Cost Management',
            icon: 'mdi:cash-multiple',
            subItems: [
              { name: 'Encode Subcon Cost', path: '/subcon/cost/new' },
              { name: 'Cost Records', path: '/subcon/cost' },
              { name: 'Cost Summary', path: '/subcon/cost/summary' },
            ],
          },
          {
            name: 'Quantity Verification',
            icon: 'mdi:package-multiple',
            subItems: [
              { name: 'Expected vs Returned', path: '/subcon/qty/verify' },
              { name: 'Discrepancies', path: '/subcon/qty/discrepancies' },
              { name: 'Update Quantities', path: '/subcon/qty/update' },
            ],
          },
          {
            name: 'Task Completion',
            icon: 'mdi:check-circle',
            path: '/subcon/completion',
          },
        ],
      },
    ],
  }

  return baseMenu[userType] || baseMenu.csr
}
