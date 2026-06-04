import { useState, useEffect, useCallback } from "react";
import { fabricTypeApi } from "../../../../api/fabricTypeApi";
import { supplierApi } from "../../../../api/supplierApi";

/**
 * Change 7.2 — order-form fabric options.
 *
 * Fabric Type now comes from the superadmin-managed Drop Down Settings list
 * (fabric_types), NOT from material names — so stray material entries can no
 * longer leak into the dropdown. Fabric Supplier lists ALL material suppliers
 * and is no longer gated by the selected fabric type.
 */
export const useFabricMaterials = () => {
  const [fabricTypeOptions, setFabricTypeOptions] = useState([]);
  const [fabricSupplierOptions, setFabricSupplierOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchFabricMaterials = useCallback(async () => {
    try {
      setOptionsLoading(true);

      const [typesRes, suppliersRes] = await Promise.all([
        fabricTypeApi.index(),
        supplierApi.index(),
      ]);

      const types = typesRes.data || typesRes || [];
      setFabricTypeOptions(
        types.map((t) => ({
          value: t.name,
          label: t.name,
          title: t.description,
        })),
      );

      const suppliers = suppliersRes.data || suppliersRes || [];
      const uniqueSupplierNames = [
        ...new Set(suppliers.map((s) => s.name).filter(Boolean)),
      ];
      setFabricSupplierOptions(
        uniqueSupplierNames.map((name) => ({ value: name, label: name })),
      );
    } catch (error) {
      console.error("Failed to fetch fabric options:", error);
      setServerError("Failed to load fabric options.");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFabricMaterials();
  }, [fetchFabricMaterials]);

  // Retained for caller compatibility. Supplier options are now the full
  // material-supplier list, independent of the chosen fabric type, so changing
  // the fabric type no longer recomputes suppliers — this is a deliberate no-op.
  const updateSupplierOptions = useCallback(() => {}, []);

  return {
    fabricTypeOptions,
    fabricSupplierOptions,
    optionsLoading,
    serverError,
    fetchFabricMaterials,
    updateSupplierOptions,
  };
};
