import { accountApi } from "../api/accountApi";
import { accountSchema } from "../validations/accountSchema";
import { validateForm, hasErrors } from "../utils/validation";
import { buildAccountFormData } from "../utils/accountFormData";

export const accountService = {
  // Create new account with validation
  createAccount: async (formData) => {
    const errors = validateForm(formData, accountSchema);

    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }

    const payload = buildAccountFormData(formData);
    const response = await accountApi.create(payload);
    return response;
  },

  // Fetch one account (View / Edit)
  getAccount: async (id) => {
    const response = await accountApi.get(id);
    // Resource is wrapped as { data: {...} }
    return response.data ?? response;
  },

  // Update an account. Password is optional (blank = unchanged), so on edit we
  // skip the password rule when it's empty.
  updateAccount: async (id, formData) => {
    const schema = { ...accountSchema };
    if (!formData.password) {
      delete schema.password;
    }

    const errors = validateForm(formData, schema);
    if (hasErrors(errors)) {
      throw { type: "validation", errors };
    }

    const payload = buildAccountFormData(formData);
    const response = await accountApi.update(id, payload);
    return response.data ?? response;
  },

  // Soft-delete (deactivate)
  deleteAccount: async (id) => {
    return await accountApi.delete(id);
  },

  // Restore a soft-deleted account
  restoreAccount: async (id) => {
    return await accountApi.restore(id);
  },
};