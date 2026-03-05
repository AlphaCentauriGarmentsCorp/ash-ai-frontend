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
      key: "quantity",
      label: "Total Items",
      sortable: true,
      position: "center",
    },
    {
      key: "in_use",
      label: "In Use",
      sortable: true,
      position: "center",
      render: (item) => {
        const in_use = item.in_use;
        return <div>{in_use > 0 ? in_use : 0}</div>;
      },
    },
    {
      key: "available",
      label: "Available",
      sortable: true,
      position: "center",
      render: (item) => {
        return <div>{item.quantity - item.in_use - item.missing}</div>;
      },
    },
    {
      key: "missing",
      label: "Missing",
      sortable: true,
      position: "center",
      render: (item) => {
        const missing = item.missing;
        return <div>{missing > 0 ? missing : 0}</div>;
      },
    },

    {
      key: "status",
      label: "Status",
      sortable: true,
      position: "center",
      render: (item) => {
        let bgColor = "bg-gray-200";

        switch (item.status?.toLowerCase()) {
          case "available":
            bgColor = "bg-green-100 text-green-800";
            break;
          case "all in use":
            bgColor = "bg-yellow-100 text-yellow-800";
            break;
          case "all missing":
            bgColor = "bg-red-100 text-red-800";
            break;
          default:
            bgColor = "bg-gray-100 text-gray-700";
        }

        return (
          <span
            className={`${bgColor} px-3 py-1 rounded-full text-xs font-medium capitalize`}
          >
            {item.status}
          </span>
        );
      },
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
        navigate(`/equipment-inventory/equipment/${rowData.id}/edit`);
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
    actions: ["view", "edit", "delete"],
    pageSize: 10,
    emptyMessage: "No equipment found",
    searchPlaceholder: "Search equipment...",
    showCheckbox: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Equipment Inventory"
      path="/equipment-inventory"
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
        url="/equipment-inventory/equipment/add"
        button="Add Equipment"
        downloadableColumn="qr_code"
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
