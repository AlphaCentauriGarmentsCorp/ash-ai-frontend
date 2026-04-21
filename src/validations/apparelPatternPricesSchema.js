export const apparelPatternPricesSchema = {
  apparel_type_id: {
    required: true,
    message: "Apparel type is required.",
  },
  pattern_type_id: {
    required: true,
    message: "Pattern type is required.",
  },
  price: {
    required: true,
    message: "Price is required.",
    min: 0,
    minMessage: "Price must be at least 0.",
    max: 999999.99,
    maxMessage: "Price cannot exceed 999999.99.",
    custom: (value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }

      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        return "Price must be a valid number.";
      }

      if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
        return "Price must have up to 2 decimal places only.";
      }

      return null;
    },
  },
};

export const validateApparelPatternPricesUniqueness = (
  formData,
  existingRows = [],
  currentId = null,
  apparelTypes = [],
  patternTypes = [],
) => {
  const apparelTypeId = Number(formData.apparel_type_id);
  const patternTypeId = Number(formData.pattern_type_id);

  if (!apparelTypeId || !patternTypeId) {
    return {};
  }

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const selectedApparelName =
    apparelTypes.find((opt) => Number(opt.value) === apparelTypeId)?.label ||
    "";
  const selectedPatternName =
    patternTypes.find((opt) => Number(opt.value) === patternTypeId)?.label ||
    "";

  const getRowApparelId = (row) =>
    Number(
      row?.apparel_type_id ??
        row?.apparelType?.id ??
        row?.apparel_type?.id ??
        row?.apparel_typeId,
    ) || null;

  const getRowPatternId = (row) =>
    Number(
      row?.pattern_type_id ??
        row?.patternType?.id ??
        row?.pattern_type?.id ??
        row?.pattern_typeId,
    ) || null;

  const getRowApparelName = (row) =>
    row?.apparel_type_name || row?.apparelType?.name || row?.apparel_type?.name || "";

  const getRowPatternName = (row) =>
    row?.pattern_type_name || row?.patternType?.name || row?.pattern_type?.name || "";

  const duplicate = existingRows.find((row) => {
    const rowApparelId = getRowApparelId(row);
    const rowPatternId = getRowPatternId(row);
    const rowApparelName = getRowApparelName(row);
    const rowPatternName = getRowPatternName(row);
    const rowId = Number(row.id);
    const sameRow = currentId !== null && rowId === Number(currentId);

    if (sameRow) return false;

    const matchesByIds =
      rowApparelId !== null &&
      rowPatternId !== null &&
      rowApparelId === apparelTypeId &&
      rowPatternId === patternTypeId;

    const matchesByNames =
      normalize(rowApparelName) === normalize(selectedApparelName) &&
      normalize(rowPatternName) === normalize(selectedPatternName);

    return matchesByIds || matchesByNames;
  });

  if (!duplicate) {
    return {};
  }

  return {
    apparel_type_id: "This apparel and pattern combination already exists.",
    pattern_type_id: "This apparel and pattern combination already exists.",
  };
};
