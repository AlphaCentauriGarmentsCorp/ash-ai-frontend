import { clientApi } from "../api/clientApi";
import { clientSchema } from "../validations/clientSchema";
import { validateForm, hasErrors } from "../utils/validation";

export const clientService = {
  createClient: async (formData) => {
    console.log("FormData to submit:", formData);
    const errors = validateForm(formData, clientSchema);

    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }

    const response = await clientApi.create(formData);
    return response;
  },
};
