import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { quotationApi } from "../../api/quotationApi";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";

const AllQuotation = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "quotation_id",
      label: "Quotation #",
      sortable: true,

      render: (item) => {
        return <div className="font-medium text-primary">#{item.quotation_id}</div>;
      },
    },
     {
      key: "created_by",
      label: "Created By",
      sortable: true,

      render: (item) => {
        return <div >{item.user.name}</div>;
      },
    },
    {
      key: "client_name",
      label: "Client Name",
      sortable: true,
    },
    {
      key: "client_email",
      label: "Client Email",
      sortable: true,
    },
    {
      key: "client_brand",
      label: "Brand",
      sortable: true,
    },
    {
      key: "grand_total",
      label: "Total Amount",
      sortable: true,
      render: (item) => {
        return (
          <div className="font-semibold text-primary">
            ₱{(item.grand_total || 0).toLocaleString()}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      render: (item) => {
        const statusColors = {
          draft: "bg-gray-100 text-gray-700",
          Pending: "bg-yellow-100 text-yellow-700",
          approved: "bg-green-100 text-green-700",
          rejected: "bg-red-100 text-red-700",
          converted: "bg-blue-100 text-blue-700",
        };
        const statusColor = statusColors[item.status] || "bg-gray-100 text-gray-700";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {item.status || "Draft"}
          </span>
        );
      },
    },
   
    {
      key: "createdAt",
      label: "Date Created",
      sortable: true,
      render: (item) =>
        item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "N/A",
    },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await quotationApi.index();

      const responseData = response.data || response;
      setData(responseData);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (rowData) => {
    setSelectedItem(rowData);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await quotationApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete quotation. Please try again.");
    } finally {
      setIsDeleting(false);
      setSelectedItem(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleAction = (action, rowData) => {
    switch (action) {
      case "view":
        navigate(`/quotations/view/${rowData.id}`);
        break;
      case "edit":
        navigate(`/quotations/edit/${rowData.id}`);
        break;
      case "delete":
        handleDeleteClick(rowData);
        break;
      case "print":
        // Handle print functionality
        window.open(`/quotations/${rowData.id}/print`, "_blank");
        break;
    }
  };

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: true,
    actions: ["view", "edit", "delete"],
    pageSize: 10,
    emptyMessage: "No quotations found",
    searchPlaceholder: "Search quotations by client name, email, or quotation #...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-file-invoice-dollar"
      pageTitle="All Quotations"
      path="/quotations"
      links={[
        { label: "Home", href: "/" },
        { label: "Sales", href: "#" },
        { label: "Quotations", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/quotations/new"
        button="Add Quotation"
        PageTitle="Quotation"
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.quotation_number || selectedItem?.client_name}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
};

export default AllQuotation;