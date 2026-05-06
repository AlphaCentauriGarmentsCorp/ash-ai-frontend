import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import { options as optionList } from "../../../../../constants/formOptions/orderOptions";

const formatCurrency = (v) => {
  const n = Number(v) || 0;
  return `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const OptionsSection = ({
  formData,
  handleChange,
  errors,
  selectedOptions,
  onAddOption,
  onRemoveOption,
}) => {
  const handleAddOption = () => {
    const success = onAddOption(
      formData.options,
      formData.option_color,
      formData.same_option_color,
    );
    if (success) {
      handleChange({ target: { name: "options", value: "" } });
      if (!formData.same_option_color) {
        handleChange({ target: { name: "option_color", value: "" } });
      }
    }
  };

  // Separate prefill addons (from quotation) from manually-added options
  const addonRows = selectedOptions.filter((o) => o.isAddon);
  const optionRows = selectedOptions.filter((o) => !o.isAddon);

  return (
    <Section title="Add Options">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Addons carried from Quotation (read-only) ──────────────────── */}
        {addonRows.length > 0 && (
          <div className="col-span-1 sm:col-span-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <i className="fas fa-plus-circle text-blue-400"></i>
              Addons from Quotation
            </p>
            <div className="overflow-x-auto rounded-lg border border-blue-100">
              <table className="w-full text-xs bg-white">
                <thead className="bg-blue-50 border-b border-blue-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-blue-700">Name</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Price/Pc</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Total</th>
                    <th className="px-3 py-2 text-center font-semibold text-blue-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {addonRows.map((addon) => (
                    <tr key={addon.id} className="hover:bg-blue-50/40">
                      <td className="px-3 py-2 font-medium text-gray-800">{addon.name}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(addon.price)}</td>
                      <td className="px-3 py-2 text-right">{addon.quantity ?? 1}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">
                        {formatCurrency(addon.total || addon.price * (addon.quantity ?? 1))}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveOption(addon.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Remove"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Manually added options ─────────────────────────────────────── */}
        <Select
          label="Options"
          name="options"
          options={optionList}
          value={formData.options || ""}
          onChange={handleChange}
          placeholder="Select option"
          searchable
          error={errors.options}
        />

        <Input
          label="Color"
          name="option_color"
          placeholder="Enter Options Color"
          value={formData.option_color || ""}
          onChange={handleChange}
          error={errors.option_color}
          type="text"
        />

        <div className="-mt-6 flex items-start">
          <div className="flex justify-center items-center gap-3">
            <input
              type="checkbox"
              name="same_option_color"
              id="same_option_color"
              checked={formData.same_option_color || false}
              onChange={handleChange}
              className="border-gray-300 border"
            />
            <label htmlFor="same_option_color" className="text-primary/55 text-xs">
              Keep the same color for all options
            </label>
          </div>
        </div>

        {/* Added manual options list */}
        {optionRows.length > 0 && (
          <div className="col-span-1 sm:col-span-2 mt-2">
            <h3 className="font-medium text-primary text-sm mb-2">
              Added Options ({optionRows.length}):
            </h3>
            <div className="space-y-2">
              {optionRows.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{option.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: option.color }}
                        title={option.color}
                      />
                      <span className="text-xs text-gray-600">{option.colorValue}</span>
                    </div>
                    {option.applyToAll && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Same color for all
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveOption(option.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove option"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="col-span-1 sm:col-span-2">
          <button
            type="button"
            onClick={handleAddOption}
            className="bg-secondary w-full py-2 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
          >
            <i className="fa fa-plus mr-1"></i>Add Options
          </button>
        </div>
      </div>
    </Section>
  );
};