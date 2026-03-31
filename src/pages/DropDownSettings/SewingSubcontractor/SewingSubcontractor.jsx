import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import { sewingSubcontractorApi } from "../../../api/sewingSubcontractorApi";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";

const SewingSubcontractorPage = () => {
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
      key: "address",
      label: "Address",
      sortable: false,
    },
    {
      key: "rate_per_piece",
      label: "Rate/pcs",
      sortable: true,
    },
    {
      key: "contact_number",
      label: "Contact Number",
      sortable: false,
    },
    {
      key: "email",
      label: "Email",
      sortable: false,
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        let response;

        if (perPage === "all") {
          response = await sewingSubcontractorApi.index();
        } else {
          response = await sewingSubcontractorApi.index({ per_page: perPage });
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
      await sewingSubcontractorApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete sewing subcontractor. Please try again.");
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
        navigate(`/admin/settings/sewing-subcontractor/edit/${rowData.id}`);
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
    emptyMessage: "No sewing subcontractors found",
    searchPlaceholder: "Search sewing subcontractor...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Sewing Subcontractor"
      path="/admin/settings/sewing-subcontractor"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Sewing Subcontractor", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/admin/settings/sewing-subcontractor/new"
        button="Add Sewing Subcontractor"
        PageTitle="Sewing Subcontractor"
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

export default SewingSubcontractorPage;
