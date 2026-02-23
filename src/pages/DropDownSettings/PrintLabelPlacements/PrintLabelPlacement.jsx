import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import { printLabelPlacementApi } from "../../../api/printLabelPlacementApi";

const PrintLabelPlacementPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

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
              response = await printLabelPlacementApi.index();
            } else {
              response = await printLabelPlacementApi.index({ per_page: perPage });
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
    
      const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
    };
  

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
    emptyMessage: "No print label placements found",
    searchPlaceholder: "Search for items...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Print Label Placements"
      path="/admin/settings/print-label-placements"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Print Label Placements", href: "#" },
      ]}
    >

        <Table
          data={data}
          columns={columns}
          config={tableConfig}
          onAction={handleAction}
          isLoading={isLoading}
          url="/admin/settings/print-label-placements/new"
          button="Add Print Label Placement"
          PageTitle="Print Label Placements"
        />
 
    </AdminLayout>
  );
};

export default PrintLabelPlacementPage;
