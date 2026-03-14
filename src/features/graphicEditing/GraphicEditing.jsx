import React from "react";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import Textarea from "../../components/form/Textarea";
import { useGraphicEditing } from "./hooks/useGraphicEditing";
import { getPlacementLabel } from "./utlis/graphicEditingUtils";

const GraphicEditing = ({ order }) => {
  const {
    formData,
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
  } = useGraphicEditing(order);

  // Helper to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("data:") || imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${baseUrl}${imagePath}`;
  };

  return (
    <section className="flex flex-col gap-y-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-semibold text-primary truncate">
              Graphic Editing
            </h1>
            {order?.orderDesign && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Editing Existing Design
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
            Define print placements, number of colors, and upload mockup images
            for this order.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 shrink-0">
          {stats.hasSizeLabel && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md flex items-center gap-1">
              <i className="fas fa-check-circle text-xs"></i>
              Size Label
            </span>
          )}
          <span className="text-xs sm:text-sm text-gray flex items-center">
            <i className="fas fa-print mr-1 text-primary"></i>
            {stats.totalPlacements} placement
            {stats.totalPlacements !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Size Label Image */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm sm:text-md font-medium mb-3 text-primary">
          <i className="fas fa-tag mr-2 text-primary"></i>
          Size Label Image
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-48 shrink-0">
            <div className="flex justify-center">
              {!formData.sizeLabelImage ? (
                <div
                  className="w-40 h-40 border-2 border-dashed border-light2 bg-light flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-light2/50"
                  onClick={() =>
                    document.getElementById("size-label-upload").click()
                  }
                >
                  <i className="fas fa-cloud-upload-alt text-xl mb-1 text-gray"></i>
                  <span className="text-xs text-gray">Upload Size Label</span>
                  <input
                    id="size-label-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleSizeLabelImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative group w-40 h-40">
                  <img
                    src={formData.sizeLabelImage}
                    alt="Size label"
                    className="w-40 h-40 object-contain border-2 border-light2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png"; // Add a placeholder image
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSizeLabelImageUpload}
                          className="hidden"
                        />
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray hover:text-primary transition-colors">
                          <i className="fas fa-sync-alt text-xs"></i>
                        </span>
                      </label>
                      <button
                        onClick={handleRemoveSizeLabelImage}
                        className="w-8 h-8 cursor-pointer rounded-full bg-white flex items-center justify-center shadow-sm text-gray hover:text-primary transition-colors"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                  {formData.sizeLabelPath && (
                    <div className="absolute top-0 right-0 mt-1 mr-1">
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        Existing
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs lg:text-sm text-gray-600">
              Upload an image of the size label that should be used for this
              order. This helps ensure consistency across all garments.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Accepted formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>
        </div>
      </div>
      {/* Add Print Placement */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 text-primary">
          <i className="fas fa-plus-circle mr-2 text-primary"></i>
          Add Print Placement
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 w-full z-10">
            <Select
              label="Placement Type"
              name="placement_type"
              options={placementOptions}
              value={formData.placement_type}
              onChange={handleChange}
              placeholder="Select placement location"
              searchable
              icon={<i className="fas fa-map-marker-alt text-gray"></i>}
            />
          </div>
          <button
            type="button"
            onClick={handleAddPlacement}
            disabled={!formData.placement_type}
            className={getAddButtonClasses(!!formData.placement_type)}
          >
            <i className="fas fa-plus"></i>
            <span className="sm:inline">Add Placement</span>
          </button>
        </div>
      </div>

      {/* Placements List */}
      {formData.placements.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-md font-medium text-primary">
            <i className="fas fa-list mr-2 text-primary"></i>
            Added Placements
          </h2>

          <div className="space-y-4">
            {formData.placements.map((placement, index) => (
              <div
                key={placement.id}
                className="rounded-lg border border-gray-200 bg-white relative"
              >
                <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-light">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        #{index + 1}
                      </span>
                      <h3 className="font-medium text-primary">
                        {getPlacementLabel(placement.type, placementOptions)}
                      </h3>
                      {placement.existingMockup && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Existing
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemovePlacement(placement.id)}
                      className="text-gray hover:text-primary transition-colors"
                      title="Remove placement"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Mockup Image */}
                    <div className="md:w-48 shrink-0">
                      <div className="flex justify-center">
                        {!placement.mockupImage ? (
                          <div
                            className="w-40 h-40 border-2 border-dashed border-light2 bg-light flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-light2/50"
                            onClick={() =>
                              document
                                .getElementById(`file-${placement.id}`)
                                .click()
                            }
                          >
                            <i className="fas fa-cloud-upload-alt text-xl mb-1 text-gray"></i>
                            <span className="text-xs text-gray">
                              Upload Mockup
                            </span>
                            <input
                              id={`file-${placement.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleMockupUpload(placement.id, e)
                              }
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="relative group w-40 h-40">
                            <img
                              src={placement.mockupImage}
                              alt="Placement mockup"
                              className="w-40 h-40 object-cover border-2 border-light2"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.png";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleMockupUpload(placement.id, e)
                                    }
                                    className="hidden"
                                  />
                                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray hover:text-primary transition-colors">
                                    <i className="fas fa-sync-alt text-xs"></i>
                                  </span>
                                </label>
                                <button
                                  onClick={() =>
                                    handleRemoveMockup(placement.id)
                                  }
                                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray hover:text-primary transition-colors"
                                >
                                  <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Color Configuration */}
                    <div className="flex-1">
                      <div className="relative mb-3">
                        <Select
                          label="Number of Colors"
                          name={`colors_${placement.id}`}
                          options={colorCountOptions}
                          value={placement.colorCount}
                          onChange={(e) =>
                            handleColorCountChange(placement.id, e)
                          }
                          placeholder="Select number of colors"
                          menuPosition="fixed"
                          icon={<i className="fas fa-palette text-gray"></i>}
                        />
                      </div>

                      {placement.colorCount && (
                        <div className="space-y-2 mt-3">
                          <label className="block text-sm font-medium text-primary">
                            Pantone Colors
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2">
                            {Array.from({
                              length: parseInt(placement.colorCount),
                            }).map((_, index) => (
                              <Input
                                key={index}
                                label={`Color ${index + 1}`}
                                name={`pantone_${placement.id}_${index}`}
                                placeholder={`Pantone ${index + 1}`}
                                value={
                                  placement.pantones[`color_${index + 1}`] || ""
                                }
                                onChange={(e) =>
                                  handlePantoneChange(placement.id, index, e)
                                }
                                icon={
                                  <i className="fas fa-droplet text-gray"></i>
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg py-12 text-center bg-light border-dashed border-2 border-light2">
          <i className="fas fa-print text-3xl mb-2 text-gray"></i>
          <p className="text-sm text-gray">No placements added yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Add your first print placement above
          </p>
        </div>
      )}

      {/* Notes */}
      <Textarea
        label="Artist Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        rows={5}
        resizable
        placeholder="Enter artist notes, special instructions, or comments"
      />

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-light2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`px-6 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors ${
            isFormValid
              ? "bg-primary text-white hover:bg-secondary cursor-pointer"
              : "bg-light text-gray cursor-not-allowed"
          }`}
        >
          <i className="fas fa-save"></i>
          {order?.orderDesign
            ? "Update Graphic Details"
            : "Save Graphic Details"}
        </button>
      </div>
    </section>
  );
};

export default GraphicEditing;
