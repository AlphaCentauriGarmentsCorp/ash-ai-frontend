import { tshirtTypeApi } from "../api/tshirtTypeApi";
import { tshirtNecklineApi } from "../api/tshirtNecklineApi";
import { tshirtSizesApi } from "../api/tshirtSizesApi";
import { sizePricesApi } from "../api/sizePricesApi";
import { printTypesApi } from "../api/printTypesApi";
import { printColorsApi } from "../api/printColorsApi";
import { printPatternsApi } from "../api/printPatternsApi";
import { addonCategoriesApi } from "../api/addonCategoriesApi";
import { addonsApi } from "../api/addonsApi";

class QuotationService {
  // Helper to ensure number values
  toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Fetch all data
  async fetchAll() {
    try {
      const [
        tshirtTypes,
        necklines,
        sizes,
        sizePrices,
        printTypes,
        printColors,
        printPatterns,
        addonCategories,
        addons,
      ] = await Promise.all([
        tshirtTypeApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            base_price: this.toNumber(item.base_price),
          }));
        }),
        tshirtNecklineApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            base_price: this.toNumber(item.base_price),
          }));
        }),
        tshirtSizesApi.index().then((res) => res.data || res),
        sizePricesApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            price: this.toNumber(item.price),
          }));
        }),
        printTypesApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            base_price: this.toNumber(item.base_price),
          }));
        }),
        printColorsApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            price: this.toNumber(item.price),
          }));
        }),
        printPatternsApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            base_price: this.toNumber(item.base_price), // Use base_price as additional price
          }));
        }),
        addonCategoriesApi.index().then((res) => res.data || res),
        addonsApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            price: this.toNumber(item.price),
          }));
        }),
      ]);

      return {
        tshirtTypes,
        necklines,
        sizes,
        sizePrices,
        printTypes,
        printColors,
        printPatterns,
        addonCategories,
        addons,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  // Get price helpers with number conversion
  getTshirtPrice = (types, id) => {
    const type = types.find((t) => t.id === id);
    return type ? this.toNumber(type.base_price) : 0;
  };

  getNecklinePrice = (necklines, id) => {
    const neckline = necklines.find((n) => n.id === id);
    return neckline ? this.toNumber(neckline.base_price) : 0;
  };

  getPrintTypePrice = (types, id) => {
    const type = types.find((t) => t.id === id);
    return type ? this.toNumber(type.base_price) : 0;
  };

  // For print patterns - using base_price as additional price
  getPrintPatternPrice = (patterns, id) => {
    const pattern = patterns.find((p) => p.id === id);
    const price = pattern ? this.toNumber(pattern.base_price) : 0;
    return price;
  };

  getSizePrice = (prices, shirtId, sizeId) => {
    const priceRecord = prices.find(
      (sp) => sp.shirt_id === shirtId && sp.size_id === sizeId,
    );
    return priceRecord ? this.toNumber(priceRecord.price) : 0;
  };

  getPrintColorPrice = (colors, typeId, count) => {
    const colorRecord = colors.find(
      (c) => c.type_id === typeId && c.color_count === count,
    );
    return colorRecord ? this.toNumber(colorRecord.price) : 0;
  };

  getAddonPrice = (addons, id) => {
    const addon = addons.find((a) => a.id === id);
    if (!addon) return 0;
    return addon.price_type === "Free" ? 0 : this.toNumber(addon.price);
  };

  // Calculate item total
  calculateItem(data, item, colorCount) {
    const tshirtPrice = this.getTshirtPrice(
      data.tshirtTypes,
      item.tshirt_type_id,
    );
    const sizePrice = this.getSizePrice(
      data.sizePrices,
      item.tshirt_type_id,
      item.size_id,
    );
    const necklinePrice = this.getNecklinePrice(
      data.necklines,
      item.neckline_id,
    );
    const printTypePrice = this.getPrintTypePrice(
      data.printTypes,
      item.print_type_id,
    );
    const printColorPrice = this.getPrintColorPrice(
      data.printColors,
      item.print_type_id,
      colorCount,
    );
    const printPatternPrice = this.getPrintPatternPrice(
      data.printPatterns,
      item.print_pattern_id,
    );

    const sizeTotal = tshirtPrice + sizePrice;
    const extras =
      necklinePrice + printTypePrice + printColorPrice + printPatternPrice;
    const pricePerPiece = sizeTotal + extras;
    const quantity = this.toNumber(item.quantity);
    const total = pricePerPiece * quantity;

    return {
      pricePerPiece: isNaN(pricePerPiece) ? 0 : pricePerPiece,
      total: isNaN(total) ? 0 : total,
    };
  }

  // Calculate all totals
  calculateTotals(data, items, colorCount, selectedAddons) {
    // Items total
    let totalAmount = 0;
    let totalQuantity = 0;

    const itemDetails = items.map((item) => {
      const { pricePerPiece, total } = this.calculateItem(
        data,
        item,
        colorCount,
      );
      totalAmount += total;
      totalQuantity += this.toNumber(item.quantity);
      return { ...item, pricePerPiece, total };
    });

    // Addons total
    const addonDetails = selectedAddons.map((id) => {
      const addon = data.addons.find((a) => a.id === id);
      const price = this.getAddonPrice(data.addons, id);
      const total = price * totalQuantity;
      return {
        id,
        name: addon?.name || "Unknown",
        price_per_piece: price,
        quantity: totalQuantity,
        total: isNaN(total) ? 0 : total,
      };
    });

    const totalAddons = addonDetails.reduce(
      (sum, a) => sum + (isNaN(a.total) ? 0 : a.total),
      0,
    );
    return {
      itemDetails,
      addonDetails,
      totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
      totalAddons: isNaN(totalAddons) ? 0 : totalAddons,
      totalQuantity,
    };
  }

  // Apply discount
  applyDiscount(subtotal, discount) {
    const sub = this.toNumber(subtotal);
    if (!discount.value) return 0;
    const discountValue = this.toNumber(discount.value);
    if (discount.type === "percentage") {
      return sub * (discountValue / 100);
    }
    return discountValue;
  }

  // Generate initial items from sizes
  initItems(sizes, defaults = {}) {
    return sizes.map((size, idx) => ({
      id: idx + 1,
      size_id: size.id,
      quantity: 1,
      tshirt_type_id: defaults.tshirtTypeId || 1,
      print_type_id: defaults.printTypeId || 1,
      print_pattern_id: defaults.printPatternId || 1,
      neckline_id: defaults.necklineId || 1,
    }));
  }

  // Get color options
  getColorOptions(colors, typeId) {
    return colors
      .filter((c) => c.type_id === typeId)
      .map((c) => ({
        color_count: c.color_count,
        price: this.toNumber(c.price),
      }))
      .sort((a, b) => a.color_count - b.color_count);
  }
}

export const quotationService = new QuotationService();
