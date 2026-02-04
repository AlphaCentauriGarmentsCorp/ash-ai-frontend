import { accountApi } from "../api/accountApi";
import { accountSchema } from "../validations/accountSchema";
import { validateForm, hasErrors } from "../utils/validation";

export const accountService = {
  // Create new account with validation
  createAccount: async (formData) => {
    const errors = validateForm(formData, accountSchema);

    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }

    const response = await accountApi.create(formData);
    return response;
  },

  updateAccount: async (id, formData) => {
    try {
      const apiData = transformUpdateData(formData);

      const response = await accountApi.update(id, apiData);
      return transformAccountResponse(response);
    } catch (error) {
      handleServiceError(error, "updateAccount");
      throw error;
    }
  },

  getAccount: async (id) => {
    try {
      const response = await accountApi.get(id);
      return transformAccountData(response);
    } catch (error) {
      handleServiceError(error, "getAccount");
      throw error;
    }
  },
};
