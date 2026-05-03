import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import TicketComposer from "../../components/tickets/TicketComposer";
import ticketService from "../../services/ticketService";

const getStatusClassName = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "open") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  if (normalized === "resolved") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const resolveTicketViewPath = (ticket) => {
  const requestType = String(ticket?.request_type || "").trim().toLowerCase();

  if (requestType === "quotation") {
    return `/tickets/quotation/${ticket.id}`;
  }

  if (requestType === "order") {
    return `/tickets/order/${ticket.id}`;
  }

  return `/tickets/${ticket.id}`;
};

export default function TicketsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ticketService.list();
      const payload = res.data || res;
      setData(payload);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = (action, row) => {
    switch (action) {
      case "view":
        navigate(resolveTicketViewPath(row));
        break;
      case "delete":
        setSelectedItem(row);
        setIsDeleteDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      await ticketService.remove(selectedItem.id);
      setData((prev) => prev.filter((d) => d.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete ticket");
    } finally {
      setIsDeleting(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "request_type", label: "Request Type" },
    { key: "to_role", label: "To" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClassName(
            item.status,
          )}`}
        >
          {item.status || "Unknown"}
        </span>
      ),
    },
    { key: "date_created", label: "Created" },
  ];

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: false,
    actions: ["view", "delete"],
    pageSize: 10,
    emptyMessage: "No tickets found",
    searchPlaceholder: "Search tickets...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-ticket"
      pageTitle="Tickets"
      path="/tickets"
      links={[{ label: "Home", href: "/" }, { label: "Tickets", href: "/tickets" }]}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-primary">Tickets</h2>
          <p className="text-sm text-gray-500">Create and track support requests.</p>
        </div>

        <TicketComposer onCreated={fetchData} />
      </div>

      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        PageTitle={<span className="font-semibold">Tickets</span>}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.request_type}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
