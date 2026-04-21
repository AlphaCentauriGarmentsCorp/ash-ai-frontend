import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { apparelNecklineApi } from "../../../api/apparelNecklineApi";

const ApparelNecklinePage = () => {
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
      key: "price",
      label: "Price",
      sortable: true,
      render: (item) => {
        return <span>PHP {item.price}</span>;
      },
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        let response;

        if (perPage === "all") {
          response = await apparelNecklineApi.index();
        } else {
          response = await apparelNecklineApi.index({ per_page: perPage });
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
      await apparelNecklineApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert("Failed to delete apparel neckline. Please try again.");
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
        navigate(`/quotation/settings/apparel-neckline/edit/${rowData.id}`);
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
    emptyMessage: "No apparel neckline found",
    searchPlaceholder: "Search apparel neckline...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Apparel Neckline"
      path="/quotation/settings/apparel-neckline"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Apparel Neckline", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/quotation/settings/apparel-neckline/new"
        button="Add Apparel Neckline"
        PageTitle="Apparel Neckline"
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

export default ApparelNecklinePage;
