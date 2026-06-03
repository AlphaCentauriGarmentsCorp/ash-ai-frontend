import React from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import PendingApprovalsWidget from "./PendingApprovalsWidget";

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6 p-4">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

        {/* Change 1B — payment-verification approvals surfaced here so
            Finance/Superadmin/Admin can act without opening each order. */}
        <PendingApprovalsWidget />
      </div>
    </AdminLayout>
  );
}
