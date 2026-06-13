import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import { specialPrintApi } from "../../../api/specialPrintApi";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";
import useConfirm from "../../../hooks/useConfirm";

const SpecialPrintPage = () => {
  const { alert, dialog } = useConfirm();
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
          response = await specialPrintApi.index();
        } else {
          response = await specialPrintApi.index({ per_page: perPage });
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
      await specialPrintApi.delete(selectedItem.id);
      setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      await alert({
        title: "Couldn't delete special print",
        message: "Please try again.",
        tone: "danger",
      });
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
        navigate(`/admin/settings/special-print/edit/${rowData.id}`);
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
    emptyMessage: "No special prints found",
    searchPlaceholder: "Search special print...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Special Print"
      path="/admin/settings/special-print"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Special Print", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        url="/admin/settings/special-print/new"
        button="Add Special Print"
        PageTitle="Special Print"
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.name}
        isLoading={isDeleting}
      />
      {dialog}
    </AdminLayout>
  );
};

export default SpecialPrintPage;
