export const processImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!validTypes.includes(file.type)) {
      reject(new Error("Invalid file type. Please upload an image."));
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      reject(new Error("File size too large. Maximum size is 5MB."));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      resolve({
        preview: reader.result,
        file: file,
      });
    };

    reader.onerror = () => reject(new Error("Error reading file."));

    reader.readAsDataURL(file);
  });
};

export const validatePlacement = (placement) => {
  const errors = [];

  if (!placement.type) {
    errors.push("Placement type is required");
  }

  if (placement.colorCount) {
    const colorCount = parseInt(placement.colorCount);
    if (isNaN(colorCount) || colorCount < 1) {
      errors.push("Invalid color count");
    } else {
      const pantoneValues = Object.values(placement.pantones || {});
      const emptyPantones = pantoneValues.filter(
        (v) => !v || v.trim() === "",
      ).length;

      if (emptyPantones > 0) {
        errors.push(`Please fill all ${colorCount} pantone colors`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    placementId: placement.id,
    placementType: placement.type,
  };
};

export const formatGraphicDataForSubmit = (formData, order = null) => {
  const data = new FormData();

  data.append("order_id", order?.id || "");
  data.append("notes", formData.notes || "");

  if (formData.sizeLabelFile && formData.sizeLabelFile instanceof File) {
    data.append("size_label", formData.sizeLabelFile);
  }

  formData.placements.forEach((placement, index) => {
    if (placement.id && typeof placement.id === "number" && placement.id > 0) {
      data.append(`placements[${index}][id]`, placement.id);
    }

    data.append(`placements[${index}][type]`, placement.type);
    data.append(`placements[${index}][color_count]`, placement.colorCount || 0);

    if (placement.pantones && Object.keys(placement.pantones).length > 0) {
      Object.entries(placement.pantones).forEach(([key, value]) => {
        data.append(`placements[${index}][pantones][${key}]`, value);
      });
    }

    if (placement.mockupFile && placement.mockupFile instanceof File) {
      data.append(`placements[${index}][mockup]`, placement.mockupFile);
    }
  });

  return data;
};

export const mapExistingDesignToFormData = (orderDesign, baseUrl) => {
  const formData = {
    sizeLabelImage: null,
    sizeLabelFile: null,
    placement_type: "",
    notes: orderDesign.notes || "",
    placements: [],
  };

  if (orderDesign.size_label) {
    const sizeLabelPath = orderDesign.size_label;
    formData.sizeLabelImage = sizeLabelPath.startsWith("http")
      ? sizeLabelPath
      : `${baseUrl}${sizeLabelPath}`;
    formData.sizeLabelFile = null;
  }

  if (orderDesign.placements && orderDesign.placements.length > 0) {
    formData.placements = orderDesign.placements.map((placement) => {
      let mockupImage = null;
      if (placement.mockup_image) {
        mockupImage = placement.mockup_image.startsWith("http")
          ? placement.mockup_image
          : `${baseUrl}${placement.mockup_image}`;
      }

      const colorCount = placement.pantones
        ? Object.keys(placement.pantones).length.toString()
        : "";

      const id = parseInt(placement.id, 10);

      return {
        id: id,
        type: placement.type,
        colorCount: colorCount,
        pantones: placement.pantones || {},
        mockupImage: mockupImage,
        mockupFile: null,
      };
    });
  }

  return formData;
};

export const generateSummary = (formData) => {
  const placementsByType = formData.placements.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  return {
    totalPlacements: formData.placements.length,
    uniquePlacementTypes: Object.keys(placementsByType).length,
    placementsByType,
    hasSizeLabel: !!formData.sizeLabelImage,
    hasNotes: !!formData.notes,
    totalColors: formData.placements.reduce(
      (sum, p) => sum + (parseInt(p.colorCount) || 0),
      0,
    ),
  };
};

export const isPlacementComplete = (placement) => {
  if (!placement.type) return false;

  if (placement.colorCount) {
    const colorCount = parseInt(placement.colorCount);
    const pantoneCount = Object.keys(placement.pantones || {}).length;
    const filledPantones = Object.values(placement.pantones || {}).filter(
      (v) => v && v.trim() !== "",
    ).length;

    return (
      colorCount > 0 &&
      pantoneCount === colorCount &&
      filledPantones === colorCount
    );
  }

  return true;
};

export const getPlacementLabel = (value, options) => {
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value;
};
