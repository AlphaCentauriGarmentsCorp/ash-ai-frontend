import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import { addonsApi } from "../../../api/addonsApi";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";

const AddonsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "category_id",
      label: "Category",
      sortable: true,
      render: (item) => {
        return <span>{item.category?.name || "N/A"}</span>;
      },
    },
    {
      key: "name",
      label: "Addon Name",
      sortable: true,
    },
    {
      key: "price_type",
      label: "Price Type",
      sortable: true,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (item) => {
        return <span>₱{item.price}</span>;
      },
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        const response = await addonsApi.index();
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
      await addonsApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete addons. Please try again.");
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
        navigate(`/quotation/settings/addons/edit/${rowData.id}`);
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
    actions: ["edit", "delete"],
    pageSize: 10,
    emptyMessage: "No addons found",
    searchPlaceholder: "Search addons...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Addons"
      path="/quotation/settings/addons"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Addons", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/quotation/settings/addons/new"
        button="Add Addons"
        PageTitle="Addons"
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

export default AddonsPage;
