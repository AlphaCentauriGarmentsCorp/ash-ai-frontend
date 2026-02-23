import { patternTypeApi } from "../api/patternTypeApi";
import { typesSchema } from "../validations/typesSchema";
import { validateForm, hasErrors } from "../utils/validation";

export const patternTypeService = {
  create: async (formData) => {
    const errors = validateForm(formData, typesSchema);

    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }
    const response = await patternTypeApi.create(formData);
    return response;
  },
};
