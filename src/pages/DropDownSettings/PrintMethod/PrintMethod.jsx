import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import { printMethodApi } from "../../../api/printMethodApi";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";

const PrintMethodPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        let response;

        if (perPage === "all") {
          response = await printMethodApi.index();
        } else {
          response = await printMethodApi.index({ per_page: perPage });
        }

        const responseData = response.data || response;
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
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
  }, [pageSize]);

  const handleDeleteClick = (rowData) => {
    setSelectedItem(rowData);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await printMethodApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete print method. Please try again.");
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
        navigate(`/admin/settings/print-method/edit/${rowData.id}`);
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
    filters: false,
    actions: ["edit", "delete"],
    pageSize: 10,
    emptyMessage: "No print methods found",
    searchPlaceholder: "Search print method...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Print Method"
      path="/admin/settings/print-method"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Print Method", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/admin/settings/print-method/new"
        button="Add Print Method"
        PageTitle="Print Method"
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

export default PrintMethodPage;
