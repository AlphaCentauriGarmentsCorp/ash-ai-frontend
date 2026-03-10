import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Table from "../../../components/table/Table";
import { placementMeasurementApi } from "../../../api/placementMeasurementApi";
import { useNavigate } from "react-router-dom";

const PlacementMeasurementsPage = () => {
  const navigate = useNavigate();
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
          response = await placementMeasurementApi.index();
        } else {
          response = await placementMeasurementApi.index({ per_page: perPage });
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
    fetchData(pageSize);
  }, [fetchData, pageSize]);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handleAction = (action, rowData) => {
    switch (action) {
      case "edit":
        navigate(`/admin/settings/placement-measurements/edit/${rowData.id}`);
        break;
      case "delete":
        if (window.confirm(`Are you sure you want to delete ${rowData.name}?`)) {
          placementMeasurementApi
            .delete(rowData.id)
            .then(() => fetchData(pageSize))
            .catch((error) => {
              console.error(
                "Error deleting placement measurement:",
                error,
              );
            });
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
    emptyMessage: "No placement measurements found",
    searchPlaceholder: "Search placement measurements...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Placement Measurements"
      path="/admin/settings/placement-measurements"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Placement Measurements", href: "#" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        onPageSizeChange={handlePageSizeChange}
        url="/admin/settings/placement-measurements/new"
        button="Add Placement Measurement"
        PageTitle="Placement Measurements"
      />
    </AdminLayout>
  );
};

export default PlacementMeasurementsPage;
