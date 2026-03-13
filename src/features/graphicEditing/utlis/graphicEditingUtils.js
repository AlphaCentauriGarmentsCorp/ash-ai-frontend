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
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(new Error("Error reading file."));
    };
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
  const cleanedPlacements = formData.placements.map((placement) => ({
    id: placement.id,
    type: placement.type,
    pantones: placement.pantones,
    mockupImage: placement.mockupImage,
  }));

  return {
    orderId: order?.id || null,
    sizeLabelImage: formData.sizeLabelImage,
    placements: cleanedPlacements,
    artistNotes: formData.notes || "",
  };
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
