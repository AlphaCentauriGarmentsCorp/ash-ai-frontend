import React from "react";
import { parseJsonField } from "../../../utils/formatters";

const ProductDetails = ({ order }) => {
  return (
    <>
      <section className="flex-col flex gap-y-2 sm:gap-y-3">
        <h1 className="font-semibold text-base sm:text-lg">Product Details</h1>
        <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Design Name</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.design_name || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Apparel Type</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.apparel_type || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Pattern Type</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.pattern_type || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Service Type</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.service_type || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Print Method</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.print_method || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Print Service</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.print_service || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Size Label</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.size_label || "N/A"}
            </p>
          </div>
          <div className="flex justify-between p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">
              Print Label Placement
            </p>
            <p className="text-xs sm:text-sm font-medium text-right max-w-45 sm:max-w-xs wrap-break-word">
              {order?.print_label_placement || "N/A"}
            </p>
          </div>
        </div>
      </section>

      <section className="flex-col flex gap-y-2 sm:gap-y-3">
        <h1 className="font-semibold text-base sm:text-lg">Fabric Details</h1>
        <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Fabric Type</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.fabric_type || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Fabric Supplier</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.fabric_supplier || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Fabric Color</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.fabric_color || "N/A"}
            </p>
          </div>
          <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Thread Color</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.thread_color || "N/A"}
            </p>
          </div>
          <div className="flex justify-between p-1.5 sm:p-2">
            <p className="text-gray-500 text-xs sm:text-sm">Ribbing Color</p>
            <p className="text-xs sm:text-sm font-medium">
              {order?.ribbing_color || "N/A"}
            </p>
          </div>
        </div>
      </section>

      {order?.freebie_items && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Freebies</h1>
          <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
              <p className="text-gray-500 text-xs sm:text-sm">Freebie Items</p>
              <p className="text-xs sm:text-sm font-medium">
                {order.freebie_items}
              </p>
            </div>
            <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
              <p className="text-gray-500 text-xs sm:text-sm">Freebie Color</p>
              <p className="text-xs sm:text-sm font-medium">
                {order.freebie_color || "N/A"}
              </p>
            </div>
            <div className="flex justify-between p-1.5 sm:p-2">
              <p className="text-gray-500 text-xs sm:text-sm">Freebie Others</p>
              <p className="text-xs sm:text-sm font-medium">
                {order.freebie_others || "N/A"}
              </p>
            </div>
          </div>
        </section>
      )}

      {order?.placement_measurements && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">
            Placement Measurements
          </h1>
          <p className="text-xs sm:text-sm mt-1 sm:mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 wrap-break-word whitespace-pre-line">
            {order.placement_measurements}
          </p>
        </section>
      )}

      {order?.notes && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Notes</h1>
          <p className="text-xs sm:text-sm mt-1 sm:mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 wrap-break-word whitespace-pre-line">
            {order.notes}
          </p>
        </section>
      )}

      {order?.options && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">
            Additional Options
          </h1>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-1 sm:mt-2">
            {parseJsonField(order.options).map((option, index) => {
              if (typeof option === "object" && option !== null) {
                return (
                  <div
                    key={index}
                    className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {option.name && (
                      <p className="text-xs sm:text-sm font-medium wrap-break-word">
                        {option.name}
                      </p>
                    )}
                    {option.color && (
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0"
                          style={{ backgroundColor: option.color }}
                        ></span>
                        <span className="text-xs text-gray-600 wrap-break-word">
                          {option.color}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-xs sm:text-sm rounded-lg wrap-break-word"
                >
                  {option}
                </span>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetails;
