import React from "react";
import { formatDate } from "../../../utils/formatters";

const ClientInformation = ({ order }) => {
  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">Client Information</h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">PO Code</p>
          <p className="text-xs sm:text-sm font-medium">
            {order?.po_code || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Client Name</p>
          <p className="text-xs sm:text-sm font-medium">
            {order?.client?.name || order?.client_brand || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Client Brand</p>
          <p className="text-xs sm:text-sm font-medium">
            {order?.client_brand || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Brand</p>
          <p className="text-xs sm:text-sm font-medium capitalize">
            {order?.brand || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Priority</p>
          <p className="text-xs sm:text-sm font-medium capitalize">
            {order?.priority || "N/A"}
          </p>
        </div>
        <div className="flex justify-between p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Deadline</p>
          <p className="text-xs sm:text-sm font-medium">
            {formatDate(order?.deadline)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClientInformation;
