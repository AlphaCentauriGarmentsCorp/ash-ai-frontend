import { orderApi } from "../api/orderApi";
import { clientApi } from "../api/clientApi";
import { apparelTypeApi } from "../api/apparelTypeApi";
import { patternTypeApi } from "../api/patternTypeApi";
import { serviceTypeApi } from "../api/serviceTypeApi";
import { printMethodApi } from "../api/printMethodApi";
import { sizeLabelApi } from "../api/sizeLabelApi";
import { printLabelPlacementApi } from "../api/printLabelPlacementApi";
import { orderSchema } from "../validations/orderSchema";
import { validateForm, hasErrors } from "../utils/validation";

export const orderService = {
  createOrder: async (formData) => {
    const errors = validateForm(formData, orderSchema);

    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }

    const response = await orderApi.create(formData);
    return response;
  },

  getClients: async (formData) => {
    const response = await clientApi.index(formData);
    return response;
  },

  getAllDropdownOptions: async () => {
    try {
      const [
        apparelTypeRes,
        patternTypeRes,
        serviceTypeRes,
        printMethodRes,
        sizeLabelRes,
        printLabelPlacementRes,
      ] = await Promise.all([
        apparelTypeApi.index(),
        patternTypeApi.index(),
        serviceTypeApi.index(),
        printMethodApi.index(),
        sizeLabelApi.index(),
        printLabelPlacementApi.index(),
      ]);

      return {
        apparelTypes: apparelTypeRes.data.map((a) => ({
          value: a.name,
          label: a.name,
          title: a.description,
        })),
        patternTypes: patternTypeRes.data.map((p) => ({
          value: p.name,
          label: p.name,
          title: p.description,
        })),
        serviceTypes: serviceTypeRes.data.map((s) => ({
          value: s.name,
          label: s.name,
          title: s.description,
        })),
        printMethods: printMethodRes.data.map((p) => ({
          value: p.name,
          label: p.name,
          title: p.description,
        })),
        sizeLabels: sizeLabelRes.data.map((s) => ({
          value: s.name,
          label: s.name,
          title: s.description,
        })),
        printLabelPlacements: printLabelPlacementRes.data.map((p) => ({
          value: p.name,
          label: p.name,
          title: p.description,
        })),
      };
    } catch (err) {
      console.error("Failed to fetch dropdown options:", err);
      throw err;
    }
  },
};
