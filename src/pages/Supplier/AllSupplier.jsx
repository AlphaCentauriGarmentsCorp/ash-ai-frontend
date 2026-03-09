import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { supplierApi } from "../../api/supplierApi";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";

const SizeLabelPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "name",
      label: "Code Name",
      sortable: true,
    },
    {
      key: "contact_person",
      label: "Contact Person",
      sortable: true,
    },
    {
      key: "contact_number",
      label: "Contact Number",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "address",
      label: "Address",
      sortable: false,
      render: (item) => {
        const parts = [
          item.street_address,
          item.barangay,
          item.city,
          item.province,
          item.postal_code,
        ].filter(Boolean);

        return (
          <div>
            {parts.length > 0 ? (
              parts.join(", ")
            ) : (
              <span className="text-gray-400 italic text-sm">No Address</span>
            )}
          </div>
        );
      },
    },
    {
      key: "notes",
      label: "Notes",
      sortable: false,
      render: (item) => {
        return (
          <div>
            {item.notes && item.notes.trim() !== "" ? (
              item.notes
            ) : (
              <span className="text-gray-400 italic text-sm">N/A</span>
            )}
          </div>
        );
      },
    },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await supplierApi.index();

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
      await supplierApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete supplier. Please try again.");
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
        navigate(`/supplier/${rowData.id}/view`);
        break;
      case "edit":
        navigate(`/supplier/${rowData.id}/edit`);
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
    actions: ["view", "edit", "delete"],
    pageSize: 10,
    emptyMessage: "No supplier found",
    searchPlaceholder: "Search supplier...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Suppliers"
      path="/supplier"
      links={[
        { label: "Home", href: "/" },
        { label: "Suppliers", href: "/supplier" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/supplier/new"
        button="Add Supplier"
        PageTitle="Suppliers"
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

export default SizeLabelPage;
