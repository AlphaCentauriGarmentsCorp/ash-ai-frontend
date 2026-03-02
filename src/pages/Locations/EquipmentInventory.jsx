import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import CardList from "../../components/card/CardList";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";

// ============= FOR API USE - UNCOMMENT WHEN CONNECTING TO BACKEND =============
// import { locationApi } from "../../api/locationApi";
// import { useEffect, useCallback } from "react";
// ============================================================================

// Sample data for locations
const sampleLocations = [
  {
    id: 1,
    name: "Office",
    description: "The Alpha Centauri Garments office is the main workspace where daily operations, coordination, and administrative tasks are managed, supporting smooth and organized business processes across the company.",
    total_items: 101,
    in_use: 8,
    available: 93,
    missing: 2,
  },
  {
    id: 2,
    name: "Production Second Floor",
    description: "The second floor production area houses specialized equipment and workstations for fabric cutting, pattern making, and quality control operations.",
    total_items: 150,
    in_use: 45,
    available: 100,
    missing: 5,
  },
  {
    id: 3,
    name: "Production Area",
    description: "The main production floor contains industrial sewing machines, pressing equipment, and assembly stations for garment manufacturing.",
    total_items: 200,
    in_use: 120,
    available: 75,
    missing: 5,
  },
  {
    id: 4,
    name: "Live Area",
    description: "The live operations space manages real-time production monitoring, quality assurance testing, and final product inspection before shipment.",
    total_items: 80,
    in_use: 35,
    available: 42,
    missing: 3,
  },
];

const EquipmentInventory = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(sampleLocations);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============= FOR API USE - UNCOMMENT WHEN CONNECTING TO BACKEND =============
  // const [data, setData] = useState([]);
  // 
  // // Fetch locations data
  // const fetchData = useCallback(async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await locationApi.index();
  //     const responseData = response.data || response;
  //     setData(responseData);
  //   } catch (error) {
  //     console.error("Error fetching locations:", error);
  //     setData([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);
  //
  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);
  // ============================================================================

  // Handle delete click
  const handleDeleteClick = (rowData) => {
    setSelectedItem(rowData);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    
    // ============= FOR API USE - REPLACE WITH BELOW CODE =============
    // try {
    //   await locationApi.delete(selectedItem.id);
    //   setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
    //   setIsDeleteDialogOpen(false);
    // } catch (error) {
    //   alert("Failed to delete location. Please try again.");
    // } finally {
    //   setIsDeleting(false);
    //   setSelectedItem(null);
    // }
    // ================================================================
    
    // Sample data - Simulate API delay
    setTimeout(() => {
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
      setSelectedItem(null);
    }, 500);
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  // Handle actions (edit, delete, view)
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

  // Get icon for each location card
  const getCardIcon = (item) => (
    <svg className="w-12 h-12 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
    </svg>
  );

  // Get stats for each location card
  const getCardStats = (item) => [
    { 
      icon: "✓", 
      label: "Total Items", 
      value: item.total_items || 0
    },
    { 
      icon: "🔧", 
      label: "In use", 
      value: item.in_use || 0
    },
    { 
      icon: "📦", 
      label: "Available", 
      value: item.available || 0
    },
    { 
      icon: "⚠️", 
      label: "Missing", 
      value: item.missing || 0
    },
  ];

  const cardConfig = {
    search: true,
    searchPlaceholder: "Search locations...",
    pagination: false,
    layout: "vertical", // or "grid" for multi-column
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
      <CardList
        data={data}
        config={cardConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/equipment-inventory/new"
        button="Add Location"
        getCardIcon={getCardIcon}
        getCardStats={getCardStats}
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