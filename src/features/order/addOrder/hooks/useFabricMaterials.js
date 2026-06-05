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

      // Fetch independently: a failure on one (e.g. a permissions gate on
      // suppliers) must NOT wipe out the other. Promise.all would reject the
      // whole batch on a single rejection.
      const [typesRes, suppliersRes] = await Promise.allSettled([
        fabricTypeApi.index(),
        supplierApi.publicIndex(),
      ]);

      if (typesRes.status === "fulfilled") {
        const res = typesRes.value;
        const types = res?.data || res || [];
        setFabricTypeOptions(
          types.map((t) => ({
            value: t.name,
            label: t.name,
            title: t.description,
          })),
        );
      } else {
        console.error("Failed to fetch fabric types:", typesRes.reason);
      }

      if (suppliersRes.status === "fulfilled") {
        const res = suppliersRes.value;
        const suppliers = res?.data || res || [];
        const uniqueSupplierNames = [
          ...new Set(suppliers.map((s) => s.name).filter(Boolean)),
        ];
        setFabricSupplierOptions(
          uniqueSupplierNames.map((name) => ({ value: name, label: name })),
        );
      } else {
        console.error("Failed to fetch fabric suppliers:", suppliersRes.reason);
      }

      if (typesRes.status === "rejected" && suppliersRes.status === "rejected") {
        setServerError("Failed to load fabric options.");
      }
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
