import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { materialsApi } from "../../api/materialsApi";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";

const MaterialsPage = () => {
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
      render: (item) => {
        return <div>{item.supplier.name}</div>;
      },
    },
    {
      key: "price",
      label: "Price/Unit",
      sortable: true,
      searchableValue: (item) => {
        const price = item.price ?? "-";
        const unit = item.unit ?? "-";
        const minimum = item.minimum ?? "N/A";
        return `${price} / ${unit} Min: ${minimum}`;
      },
      render: (item) => {
        const price = item.price ?? "-";
        const unit = item.unit ?? "-";
        const minimum = item.minimum ?? "N/A";

        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium ">
              {price} / {unit}
            </span>
            <span className="text-xs text-gray-500">Min: {minimum}</span>
          </div>
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
      alert("Failed to delete materials. Please try again.");
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
        navigate(`/supplier/${rowData.supplier_id}/view`);
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
    </AdminLayout>
  );
};

export default MaterialsPage;
