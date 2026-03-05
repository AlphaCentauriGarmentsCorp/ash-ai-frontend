import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import { equipmentInventoryApi } from "../../../api/equipmentInventoryApi";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { useNavigate, useParams } from "react-router-dom";

const EquipmentInventory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const BaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  const columns = [
    {
      key: "qr_code",
      label: "QR Code",
      sortable: true,
      render: (item) => {
        return (
          <img
            src={`${BaseUrl}${item.qr_code}`}
            alt={`${item.name} QR Code`}
            className="w-18 h-18 object-contain"
          />
        );
      },
    },
    {
      key: "image",
      label: "Image",
      sortable: true,
      render: (item) => {
        const hasImage = item.image;
        return hasImage ? (
          <img
            src={`${BaseUrl}${item.image}`}
            alt={item.name}
            className="w-18 h-18 object-cover rounded-lg border border-gray-300"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="w-18 h-18 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-400">
            <i className="fas fa-box text-xl"></i>
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Item Name",
      sortable: true,
    },
    {
      key: "stocks",
      label: "Stocks",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
    },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await equipmentInventoryApi.getByLocation(id);
      const responseData = response.data || response;
      setData(responseData);
    } catch (error) {
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
      await equipmentInventoryApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete equipment. Please try again.");
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
      case "edit":
        navigate(`/equipment-inventory/${rowData.id}/edit`);
        break;
      case "delete":
        handleDeleteClick(rowData);
        break;
      default:
        break;
    }
  };

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: false,
    actions: ["edit", "delete"],
    pageSize: 10,
    emptyMessage: "No equipment found",
    searchPlaceholder: "Search equipment...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Equipment Inventory"
      path="/admin/settings/equipment-inventory"
      links={[
        { label: "Home", href: "/" },
        { label: "Equipment Inventory", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/equipment-inventory/add-equipment"
        button="Add Equipment"
        PageTitle="Equipment Inventory"
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

export default EquipmentInventory;
