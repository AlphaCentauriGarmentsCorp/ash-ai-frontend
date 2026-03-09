import { useState, useEffect, useCallback } from "react";
import { materialsApi } from "../../../../api/materialsApi";

export const useFabricMaterials = () => {
  const [fabricMaterials, setFabricMaterials] = useState([]);
  const [fabricTypeOptions, setFabricTypeOptions] = useState([]);
  const [fabricSupplierOptions, setFabricSupplierOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchFabricMaterials = useCallback(async () => {
    try {
      setOptionsLoading(true);
      const response = await materialsApi.getByTypeFabric("Fabric");
      setFabricMaterials(response.data);

      const uniqueFabricNames = [
        ...new Set(response.data.map((material) => material.name)),
      ];
      setFabricTypeOptions(
        uniqueFabricNames.map((name) => ({
          value: name,
          label: name,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch fabric materials:", error);
      setServerError("Failed to load fabric materials.");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFabricMaterials();
  }, [fetchFabricMaterials]);

  const updateSupplierOptions = useCallback(
    (fabricType, currentSupplier, updateFormData) => {
      if (fabricType && fabricMaterials.length > 0) {
        const materialsWithSelectedFabric = fabricMaterials.filter(
          (material) => material.name === fabricType,
        );

        const supplierOptions = materialsWithSelectedFabric
          .map((material) => material.supplier?.name)
          .filter(Boolean)
          .filter((value, index, self) => self.indexOf(value) === index);

        setFabricSupplierOptions(
          supplierOptions.map((supplier) => ({
            value: supplier,
            label: supplier,
          })),
        );

        if (currentSupplier && !supplierOptions.includes(currentSupplier)) {
          updateFormData({ fabric_supplier: "" });
        }
      } else {
        setFabricSupplierOptions([]);
      }
    },
    [fabricMaterials],
  );

  return {
    fabricMaterials,
    fabricTypeOptions,
    fabricSupplierOptions,
    optionsLoading,
    serverError,
    fetchFabricMaterials,
    updateSupplierOptions,
  };
};
