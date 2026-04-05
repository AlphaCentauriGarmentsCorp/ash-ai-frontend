import { tshirtTypeApi } from "../api/tshirtTypeApi";
import { tshirtSizesApi } from "../api/tshirtSizesApi";

export const sizePriceService = {
  getAllDropdownOptions: async () => {
    try {
      const [tshirtTypeRes, tshirtSizesRes] = await Promise.all([
        tshirtTypeApi.index(),
        tshirtSizesApi.index(),
      ]);

      return {
        tshirtTypes: tshirtTypeRes.data.map((a) => ({
          value: a.id,
          label: a.name,
          title: a.description,
        })),
        tshirtSizes: tshirtSizesRes.data.map((p) => ({
          value: p.id,
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
