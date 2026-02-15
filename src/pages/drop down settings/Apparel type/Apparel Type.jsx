import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";

const ApparelTypePage = () => {
  const [data, setData] = useState([
    { id: 1, name: "Item 1", description: "Displays more information when you move your cursor over the icon." },
    { id: 2, name: "Item 1", description: "Displays more information when you move your cursor over the icon." },
    { id: 3, name: "Item 1", description: "Displays more information when you move your cursor over the icon." },
    { id: 4, name: "Item 1", description: "Displays more information when you move your cursor over the icon." },
    { id: 5, name: "Item 1", description: "Displays more information when you move your cursor over the icon." },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAction = (action, rowData) => {
    switch (action) {
      case "edit":
        console.log("Edit:", rowData);
        break;
      case "delete":
        if (window.confirm(`Are you sure you want to delete ${rowData.name}?`)) {
          setData(prev => prev.filter(item => item.id !== rowData.id));
        }
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
    emptyMessage: "No apparel types found",
    searchPlaceholder: "Search apparel type...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Apparel Type"
      path="/admin/settings/apparel-type"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Apparel Type", href: "#" },
      ]}
    >
      <div className="bg-white rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-4">Apparel Type</h1>
        <Table
          data={data}
          columns={columns}
          config={tableConfig}
          onAction={handleAction}
          isLoading={isLoading}
          url="/admin/settings/apparel-type/new"
          button="Add Apparel Type"
          PageTitle="Apparel Type"
        />
      </div>
    </AdminLayout>
  );
};

export default ApparelTypePage;
