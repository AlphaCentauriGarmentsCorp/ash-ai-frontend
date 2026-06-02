export const apparelPatternPricesInitialState = {
  apparel_type_id: "",
  pattern_type_id: "",
  // Base (fallback) price used for any size left blank in the per-size grid.
  price: "",
  // Optional per-size base prices, e.g. { "S": 200, "L": 210, "2XL": 230 }.
  // Empty object means "use the base price for every size".
  size_prices: {},
};
