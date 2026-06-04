import React from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import PaymentsTab from "../CSR/tabs/PaymentsTab";
import { financePaymentsApi } from "../../../api/financePaymentsApi";

/**
 * Finance — Payments page.
 *
 * Reuses the shared PaymentsTab (status filters + list + Upload + Verify),
 * wired to the Finance-only /finance/payments endpoints. Finance uploads the
 * proof of payment AND verifies it here; the CSR Hub's payments view is
 * read-only (no upload, no verify).
 */
const FinancePaymentsPage = () => {
  return (
    <AdminLayout
      icon="fa-money-check-dollar"
      pageTitle="Payments"
      path="/finance/payments"
      links={[
        { label: "Home", href: "/" },
        { label: "Payments", href: "/finance/payments" },
      ]}
    >
      <PaymentsTab paymentsApi={financePaymentsApi} canUpload />
    </AdminLayout>
  );
};

export default FinancePaymentsPage;
