import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import EquipmentLocationCardContainer from "../../components/card/EquipmentLocationCardContainer";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import { equipmentLocationApi } from "../../api/equipmentLocationApi";

const EquipmentInventory = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      response = await equipmentLocationApi.index();
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
      await equipmentLocationApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete equipment location. Please try again.");
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
        navigate(`/equipment-inventory/edit/${rowData.id}`);
        break;
      case "delete":
        handleDeleteClick(rowData);
        break;
      case "view":
        navigate(`/equipment-inventory/${rowData.id}/contents`);
        break;
      default:
        break;
    }
  };

  const cardConfig = {
    search: true,
    searchPlaceholder: "Search locations...",
  };

  return (
    <AdminLayout
      pageTitle="Equipment Inventory"
      path="/equipment-inventory"
      links={[
        { label: "Home", href: "/" },
        { label: "Locations", href: "#" },
      ]}
    >
      <EquipmentLocationCardContainer
        data={data}
        config={cardConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/equipment-inventory/new"
        button="Add Location"
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
