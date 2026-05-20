import React from "react";

const SampleDetailsSection = ({ sampleDetails = {} }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          2
        </span>
        Sample Details
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Color
          </p>
          <p className="font-medium text-gray-800">
            {sampleDetails.shirt_color || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Print Method
          </p>
          <p className="font-medium text-gray-800">
            {sampleDetails.special_print || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Print Area
          </p>
          <p className="font-medium text-gray-800">
            {sampleDetails.print_area || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Size Label
          </p>
          <p className="font-medium text-gray-800">
            {sampleDetails.design_size_label || "—"}
          </p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Sizes Included
          </p>
          <p className="font-medium text-gray-800">
            {sampleDetails.sizes?.length
              ? sampleDetails.sizes.join(", ")
              : "—"}
          </p>
        </div>
      </div>

      {sampleDetails.design_notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
            Notes from GA
          </p>
          <p className="text-xs text-gray-600 italic">
            "{sampleDetails.design_notes}"
          </p>
        </div>
      )}
    </section>
  );
};

export default SampleDetailsSection;
