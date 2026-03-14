import { useState, useCallback, useMemo, useEffect } from "react";
import {
  placementOptions,
  colorCountOptions,
} from "../../../constants/formOptions/screenOptions";
import {
  processImageUpload,
  formatGraphicDataForSubmit,
  validatePlacement,
  mapExistingDesignToFormData,
} from "../utlis/graphicEditingUtils";
import { graphicDesignApi } from "../../../api/graphicDesignApi";

export const useGraphicEditing = (initialOrder = null) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  const [formData, setFormData] = useState({
    sizeLabelImage: null,
    sizeLabelFile: null,
    placement_type: "",
    notes: "",
    placements: [],
  });

  useEffect(() => {
    if (initialOrder?.orderDesign) {
      const existingData = mapExistingDesignToFormData(
        initialOrder.orderDesign,
        baseUrl,
      );
      setFormData(existingData);
    }
  }, [initialOrder, baseUrl]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSizeLabelImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageData = await processImageUpload(file);

      setFormData((prev) => ({
        ...prev,
        sizeLabelImage: imageData.preview,
        sizeLabelFile: imageData.file,
      }));
    }
  }, []);

  const handleRemoveSizeLabelImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      sizeLabelImage: null,
      sizeLabelFile: null,
    }));
  }, []);

  const handleAddPlacement = useCallback(() => {
    setFormData((prev) => {
      if (!prev.placement_type) return prev;

      const newPlacement = {
        id: Date.now(),
        type: prev.placement_type,
        colorCount: "",
        pantones: {},
        mockupImage: null,
        mockupFile: null,
      };

      return {
        ...prev,
        placements: [...prev.placements, newPlacement],
        placement_type: "",
      };
    });
  }, []);

  const handleRemovePlacement = useCallback((placementId) => {
    setFormData((prev) => ({
      ...prev,
      placements: prev.placements.filter((p) => p.id !== placementId),
    }));
  }, []);

  const handleColorCountChange = useCallback((placementId, e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      placements: prev.placements.map((placement) =>
        placement.id === placementId
          ? {
              ...placement,
              colorCount: value,
              pantones: Array(parseInt(value) || 0)
                .fill("")
                .reduce((acc, _, i) => {
                  acc[`color_${i + 1}`] = "";
                  return acc;
                }, {}),
            }
          : placement,
      ),
    }));
  }, []);

  const handlePantoneChange = useCallback((placementId, colorIndex, e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      placements: prev.placements.map((placement) =>
        placement.id === placementId
          ? {
              ...placement,
              pantones: {
                ...placement.pantones,
                [`color_${colorIndex + 1}`]: value,
              },
            }
          : placement,
      ),
    }));
  }, []);

  const handleMockupUpload = useCallback(async (placementId, e) => {
    const file = e.target.files[0];

    if (file) {
      const imageData = await processImageUpload(file);

      setFormData((prev) => ({
        ...prev,
        placements: prev.placements.map((placement) =>
          placement.id === placementId
            ? {
                ...placement,
                mockupImage: imageData.preview,
                mockupFile: imageData.file,
              }
            : placement,
        ),
      }));
    }
  }, []);

  const handleRemoveMockup = useCallback((placementId) => {
    setFormData((prev) => ({
      ...prev,
      placements: prev.placements.map((placement) =>
        placement.id === placementId
          ? {
              ...placement,
              mockupImage: null,
              mockupFile: null,
            }
          : placement,
      ),
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validationResults = formData.placements.map((p) =>
      validatePlacement(p),
    );

    const hasInvalidPlacements = validationResults.some((r) => !r.isValid);

    if (hasInvalidPlacements) {
      return;
    }

    const submissionData = formatGraphicDataForSubmit(formData, initialOrder);

    try {
      const response = await graphicDesignApi.create(submissionData);
      return response;
    } catch (error) {
      throw error;
    }
  }, [formData, initialOrder]);

  const isFormValid = useMemo(() => {
    return (
      formData.placements.length > 0 ||
      formData.sizeLabelImage ||
      formData.notes.trim().length > 0
    );
  }, [formData.placements.length, formData.sizeLabelImage, formData.notes]);

  const stats = useMemo(() => {
    const totalColors = formData.placements.reduce((sum, p) => {
      return sum + (parseInt(p.colorCount) || 0);
    }, 0);

    const completedPlacements = formData.placements.filter(
      (p) =>
        p.colorCount &&
        Object.keys(p.pantones).length === parseInt(p.colorCount),
    ).length;

    return {
      totalPlacements: formData.placements.length,
      totalColors,
      completedPlacements,
      hasSizeLabel: !!formData.sizeLabelImage,
      averageColorsPerPlacement:
        formData.placements.length > 0
          ? (totalColors / formData.placements.length).toFixed(1)
          : 0,
    };
  }, [formData.placements]);

  const getAddButtonClasses = useCallback((isEnabled) => {
    const baseClasses =
      "w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 mb-1 sm:mb-4";
    if (isEnabled) {
      return `${baseClasses} bg-primary text-white hover:bg-secondary cursor-pointer`;
    }
    return `${baseClasses} bg-light text-gray cursor-not-allowed`;
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    handleSizeLabelImageUpload,
    handleRemoveSizeLabelImage,
    handleAddPlacement,
    handleRemovePlacement,
    handleColorCountChange,
    handlePantoneChange,
    handleMockupUpload,
    handleRemoveMockup,
    handleSubmit,
    getAddButtonClasses,
    isFormValid,
    stats,
    placementOptions,
    colorCountOptions,
    baseUrl,
  };
};

export default useGraphicEditing;
