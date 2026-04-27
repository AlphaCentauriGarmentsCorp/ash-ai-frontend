import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { permissionApi } from "../../../api/permissionApi";

const normalizeRows = (response) => {
  const data = response?.data || response || [];
  return Array.isArray(data) ? data : [];
};

const PermissionsPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "name",
      label: "Permission Name",
      sortable: true,
      render: (item) => item.name || "-",
    },
    {
      key: "guard_name",
      label: "Guard",
      sortable: true,
      render: (item) => item.guard_name || "web",
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (item) => item.description || "-",
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        const response =
          perPage === "all"
            ? await permissionApi.index()
            : await permissionApi.index({ per_page: perPage });

        setRows(normalizeRows(response));
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData(pageSize);
  }, [pageSize, fetchData]);

  const handleDeleteClick = (rowData) => {
    setSelectedItem(rowData);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await permissionApi.delete(selectedItem.id);
      setRows((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete permission. Please try again.");
    } finally {
      setSelectedItem(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setSelectedItem(null);
    setIsDeleteDialogOpen(false);
  };

  const handleAction = (action, rowData) => {
    switch (action) {
      case "edit":
        navigate(`/admin/rbac/permissions/edit/${rowData.id}`);
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
    emptyMessage: "No permissions found",
    searchPlaceholder: "Search permission...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-lock"
      pageTitle="Permissions"
      path="/admin/rbac/permissions"
      links={[
        { label: "Home", href: "/" },
        { label: "Roles & Permissions", href: "#" },
        { label: "Permissions", href: "#" },
      ]}
    >
      <Table
        data={rows}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/admin/rbac/permissions/new"
        button="Add Permission"
        PageTitle={<span className="font-semibold">Permissions</span>}
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

export default PermissionsPage;
