import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { ScreenTypeApi } from "../../api/ScreenTypeApi";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { filter } from "jszip";

const MaterialsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "name",
      label: "Design Name",
      sortable: true,
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
    },
    {
      key: "size",
      label: "Size",
      sortable: true,
    },
    {
      key: "last_maintenance",
      label: "Last Maintenance",
      sortable: true,
      render: (item) =>
        item.last_maintenance ? (
          new Date(item.last_maintenance).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        ) : (
          <>
            <span className="text-gray-400 italic">No last maintenance</span>
          </>
        ),
    },
    {
      key: "last_used",
      label: "Last Used",
      sortable: true,
      render: (item) =>
        item.last_used ? (
          new Date(item.last_used).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        ) : (
          <>
            <span className="text-gray-400 italic">Screen never used</span>
          </>
        ),
    },
    {
      key: "total_use",
      label: "Total Use",
      sortable: true,
      position: "center",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      position: "center",
    },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ScreenTypeApi.index();

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
      await ScreenTypeApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete screen. Please try again.");
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
        navigate(`/screen-inventory/${rowData.id}/edit`);
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
    emptyMessage: "No screen found",
    searchPlaceholder: "Search screen...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cube"
      pageTitle="Screens"
      path="/screen-inventory"
      links={[
        { label: "Home", href: "/" },
        { label: "Screen Inventory", href: "/screen-inventory" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/screen-inventory/new"
        button="Add Screen"
        PageTitle="Printing Screens"
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
