import { addonCategoriesApi } from "../api/addonCategoriesApi";
import { addonsApi } from "../api/addonsApi";
import { apparelPatternPricesApi } from "../api/apparelPatternPricesApi";

class QuotationService {
  // Helper to ensure number values
  toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Fetch all data
  async fetchAll() {
    try {
      const [addonCategories, addons, apparelPatternPrices] = await Promise.all([
        addonCategoriesApi.index().then((res) => res.data || res),
        addonsApi.index().then((res) => {
          const data = res.data || res;
          return data.map((item) => ({
            ...item,
            price: this.toNumber(item.price),
          }));
        }),
        apparelPatternPricesApi.index().then((res) => res.data || res),
      ]);

      return {
        apparelPatternPrices,
        apparelParts: [],
        tshirtTypes: [],
        necklines: [],
        sizes: [],
        sizePrices: [],
        printTypes: [],
        printColors: [],
        printPatterns: [],
        addonCategories,
        addons,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  // Get price helpers with number conversion
  getTshirtPrice = (types = [], id) => {
    const type = types.find((t) => t.id === id);
    return type ? this.toNumber(type.base_price) : 0;
  };

  getNecklinePrice = (necklines = [], id) => {
    const neckline = necklines.find((n) => Number(n.id) === Number(id));
    return neckline ? this.toNumber(neckline.price ?? neckline.base_price) : 0;
  };

  // Kept for compatibility with pages that still call this method.
  getPrintTypePrice = () => 0;

  // Kept for compatibility with pages that still call this method.
  getPrintPatternPrice = () => 0;

  getApparelPatternPrice = (rows = [], id) => {
    const row = rows.find((item) => Number(item.id) === Number(id));
    return row ? this.toNumber(row.price) : 0;
  };

  getSizePrice = (prices = [], shirtId, sizeId) => {
    const priceRecord = prices.find(
      (sp) => sp.shirt_id === shirtId && sp.size_id === sizeId,
    );
    return priceRecord ? this.toNumber(priceRecord.price) : 0;
  };

  getPrintColorPrice = (colors = [], selectedColors = []) => {
    if (!Array.isArray(selectedColors) || selectedColors.length === 0) {
      return 0;
    }

    return selectedColors.reduce((sum, selection) => {
      const selectionId = Number(
        selection.partId ?? selection.colorId ?? selection.id,
      );
      const color = colors.find((c) => Number(c.id) === selectionId);
      const basePrice =
        this.toNumber(selection.pricePerColor) ||
        this.toNumber(selection.price_per_color) ||
        this.toNumber(selection.price) ||
        this.toNumber(color?.price);
      const colorCount = this.toNumber(selection.colorCount) || 1;
      return sum + basePrice * colorCount;
    }, 0);
  };

  getAddonPrice = (addons = [], id) => {
    const addon = addons.find((a) => a.id === id);
    if (!addon) return 0;
    return addon.price_type === "Free" ? 0 : this.toNumber(addon.price);
  };

  // Calculate item total
  calculateItem(data, item, selectedColors, selectedNecklineId) {
    const apparelPatternPrice = this.getApparelPatternPrice(
      data.apparelPatternPrices,
      item.apparel_pattern_price_id,
    );
    const necklinePrice = this.getNecklinePrice(
      data.necklines,
      selectedNecklineId,
    );
    const colorPrice = this.getPrintColorPrice(
      data.printColors,
      selectedColors,
    );
    const unitPrice = this.toNumber(item.unit_price);

    const pricePerPiece = apparelPatternPrice + necklinePrice + unitPrice + colorPrice;
    const quantity = this.toNumber(item.quantity);
    const total = pricePerPiece * quantity;

    return {
      apparelPatternPrice: isNaN(apparelPatternPrice) ? 0 : apparelPatternPrice,
      necklinePrice: isNaN(necklinePrice) ? 0 : necklinePrice,
      colorPrice: isNaN(colorPrice) ? 0 : colorPrice,
      unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
      pricePerPiece: isNaN(pricePerPiece) ? 0 : pricePerPiece,
      total: isNaN(total) ? 0 : total,
    };
  }

  // Calculate all totals
  calculateTotals(data, items, selectedColors, selectedAddons, selectedNecklineId) {
    // Items total
    let totalAmount = 0;
    let totalQuantity = 0;

    const itemDetails = items.map((item) => {
      const { apparelPatternPrice, necklinePrice, colorPrice, unitPrice, pricePerPiece, total } = this.calculateItem(
        data,
        item,
        selectedColors,
        selectedNecklineId,
      );
      totalAmount += total;
      totalQuantity += this.toNumber(item.quantity);
      return {
        ...item,
        apparelPatternPrice,
        necklinePrice,
        colorPrice,
        unitPrice,
        pricePerPiece,
        total,
      };
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
      apparel_pattern_price_id: defaults.apparelPatternPriceId || null,
      apparel_type_id: defaults.apparelTypeId || null,
      pattern_type_id: defaults.patternTypeId || null,
    }));
  }

  // Get color options
  getColorOptions(colors) {
    return (colors || [])
      .map((c) => ({
        id: c.id,
        name: c.name,
        price: this.toNumber(c.price),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const quotationService = new QuotationService();
