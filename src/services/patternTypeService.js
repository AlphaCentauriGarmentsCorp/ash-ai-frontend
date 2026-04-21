import { patternTypeApi } from "../api/patternTypeApi";
import { patternTypeSchema } from "../validations/patternTypeSchema";
import { validateForm, hasErrors } from "../utils/validation";

export const patternTypeService = {
  create: async (formData) => {
    const errors = validateForm(formData, patternTypeSchema);

    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }
    const response = await patternTypeApi.create(formData);
    return response;
  },
};
