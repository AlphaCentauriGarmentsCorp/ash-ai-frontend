import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { materialsApi } from "../../api/materialsApi";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";
import useConfirm from "../../hooks/useConfirm";

// Formats a numeric value as Philippine peso, e.g. 1320 -> "₱1,320.00".
const formatPeso = (value) => {
  const num = Number(value);
  if (value === null || value === undefined || value === "" || Number.isNaN(num)) {
    return null;
  }
  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const MaterialsPage = () => {
  const { alert, dialog } = useConfirm();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "material_type",
      label: "Material Type",
      sortable: false,
      filterable: true,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "supplier_id",
      label: "Supplier Name",
      sortable: true,
      searchableValue: (item) => item.supplier?.name ?? "",
      render: (item) => {
        return <div>{item.supplier?.name ?? "—"}</div>;
      },
    },
    {
      key: "price",
      label: "Price/Unit",
      sortable: true,
      searchableValue: (item) => {
        const price = formatPeso(item.price) ?? "-";
        const unit = item.unit ?? "-";
        const minimum = item.minimum ?? "N/A";
        return `${price} / ${unit} Min: ${minimum}`;
      },
      render: (item) => {
        const price = formatPeso(item.price);
        const unit = item.unit ?? "-";
        const minimum = item.minimum ?? "N/A";

        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium">
              {price ?? "—"} / {unit}
            </span>
            <span className="text-xs text-gray-500">Min: {minimum}</span>
          </div>
        );
      },
    },
    {
      key: "stock_on_hand",
      label: "Stock on Hand",
      sortable: true,
      searchableValue: (item) => `${item.stock_on_hand ?? ""}`,
      render: (item) => {
        const stock = Number(item.stock_on_hand ?? 0);
        return (
          <span
            className={`text-xs font-medium ${
              stock > 0 ? "text-gray-800" : "text-amber-600"
            }`}
          >
            {stock.toLocaleString("en-PH", { maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: "lead",
      label: "Lead Time",
      sortable: true,
    },
    {
      key: "notes",
      label: "Notes",
      sortable: true,
    },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await materialsApi.index();

      const responseData = response.data || response;
      setData(responseData);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      await materialsApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      await alert({
        title: "Couldn't delete materials",
        message: "Please try again.",
        tone: "danger",
      });
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
        navigate(`/supplier/materials/${rowData.id}/view`);
        break;
      case "edit":
        navigate(`/admin/settings/materials/edit/${rowData.id}`);
        break;
      case "delete":
        handleDeleteClick(rowData);
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
    emptyMessage: "No materials found",
    searchPlaceholder: "Search materials...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cube"
      pageTitle="Materials"
      path="/supplier/materials"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Materials", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/supplier/materials/new"
        button="Add Material"
        PageTitle="Material"
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.name}
        isLoading={isDeleting}
      />
      {dialog}
    </AdminLayout>
  );
};

export default MaterialsPage;
