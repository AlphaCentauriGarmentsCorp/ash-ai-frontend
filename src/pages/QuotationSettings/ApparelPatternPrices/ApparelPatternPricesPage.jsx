import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { apparelPatternPricesApi } from "../../../api/apparelPatternPricesApi";

const ApparelPatternPricesPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      key: "apparel_type_id",
      label: "Apparel Type",
      sortable: true,
      render: (item) => {
        return (
          <span>
            {item.apparelType?.name || item.apparel_type?.name || item.apparel_type_name || item.apparel_type_id}
          </span>
        );
      },
    },
    {
      key: "pattern_type_id",
      label: "Pattern Type",
      sortable: true,
      render: (item) => {
        return (
          <span>
            {item.patternType?.name || item.pattern_type?.name || item.pattern_type_name || item.pattern_type_id}
          </span>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (item) => <span>₱{item.price}</span>,
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        let response;

        if (perPage === "all") {
          response = await apparelPatternPricesApi.index();
        } else {
          response = await apparelPatternPricesApi.index({ per_page: perPage });
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
      await apparelPatternPricesApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete apparel pattern price. Please try again.");
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
        navigate(`/quotation/settings/apparel-pattern-prices/edit/${rowData.id}`);
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
    emptyMessage: "No apparel pattern prices found",
    searchPlaceholder: "Search apparel pattern prices...",
    showIndex: true,
  };

  const selectedItemName = selectedItem
    ? `${
        selectedItem.apparelType?.name ||
        selectedItem.apparel_type?.name ||
        selectedItem.apparel_type_name ||
        selectedItem.apparel_type_id
      } / ${
        selectedItem.patternType?.name ||
        selectedItem.pattern_type?.name ||
        selectedItem.pattern_type_name ||
        selectedItem.pattern_type_id
      }`
    : "";

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Apparel Pattern Prices"
      path="/quotation/settings/apparel-pattern-prices"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Apparel Pattern Prices", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/quotation/settings/apparel-pattern-prices/new"
        button="Add Apparel Pattern Price"
        PageTitle="Apparel Pattern Prices"
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItemName}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
};

export default ApparelPatternPricesPage;
