import api from "./axios";

/**
 * Issue 7 — locked label option lists for the Quotation label system.
 *
 * Returns the controlled vocabularies (materials / methods / placements /
 * measurements) the CSR can choose from when speccing a Brand Label or
 * Care/Size Label. These are strictly-locked: the form offers only these
 * server-controlled values (no free typing), like Free Items.
 *
 * Response shape:
 *   {
 *     materials:    [{ value, label }],
 *     methods:      [{ id, value, label, description }],
 *     placements:   [{ id, value, label, description }],
 *     measurements: [{ id, value, label, description }]
 *   }
 */
export const quotationLabelApi = {
  options: async () => {
    const { data } = await api.get("/quotations/label-options");
    return data;
  },
};
