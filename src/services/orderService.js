import { orderApi } from "../api/orderApi";
import { orderSchema } from "../validations/orderSchema";
import { validateForm, hasErrors } from "../utils/validation";

export const orderService = {
  createClient: async (formData) => {
    console.log("FormData to submit:", formData);
    const errors = validateForm(formData, orderSchema);

    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }
    const response = await orderApi.create(formData);
    return response;
  },
};
