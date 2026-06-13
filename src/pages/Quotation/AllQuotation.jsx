import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { quotationApi } from "../../api/quotationApi";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { firstPartThumbnail } from "../../utils/designImage";
import DesignThumb from "../../components/common/DesignThumb";
import useConfirm from "../../hooks/useConfirm";

// Design-review status badge colors (Issue 8 output → shown here per Issue 11).
const DESIGN_REVIEW_COLORS = {
  "Pending GA": "bg-yellow-100 text-yellow-700",
  "GA Approved": "bg-green-100 text-green-700",
  "Needs New File": "bg-red-100 text-red-700",
};

const AllQuotation = () => {
  const navigate = useNavigate();
  const { alert, dialog } = useConfirm();
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
      key: "design_thumbnail",
      label: "Design",
      sortable: false,
      render: (item) => <DesignThumb url={firstPartThumbnail(item)} />,
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
        // Issue 12 — keyed by lowercase status so it matches regardless of the
        // stored casing (DB values are capitalized: Draft, Sent, Approved...).
        const statusColors = {
          draft: "bg-yellow-100 text-yellow-700",
          pending: "bg-yellow-100 text-yellow-700",
          sent: "bg-blue-100 text-blue-700",
          approved: "bg-green-100 text-green-700",
          converted: "bg-purple-100 text-purple-700",
          rejected: "bg-red-100 text-red-700",
          expired: "bg-gray-200 text-gray-700",
        };
        const statusColor = statusColors[item.status?.toLowerCase()] || "bg-gray-100 text-gray-700";
        return (
          <span className={`inline-block whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {item.status || "Draft"}
          </span>
        );
      },
    },
    {
      key: "design_review_status",
      label: "Design Review",
      sortable: true,
      filterable: true,
      render: (item) => {
        const s = item.design_review_status;
        const color = DESIGN_REVIEW_COLORS[s] || "bg-gray-100 text-gray-500";
        return (
          <span className={`inline-block whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {s || "Not submitted"}
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
      await alert({
        title: "Couldn't delete quotation",
        message: "Please try again.",
        tone: "danger",
      });
    } finally {
      setIsDeleteDialogOpen(false);
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
        itemName={selectedItem?.quotation_id || selectedItem?.client_name}
        isLoading={isDeleting}
      />

      {dialog}
    </AdminLayout>
  );
};

export default AllQuotation;