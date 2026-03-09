import React from "react";
import { parseJsonField } from "../../../utils/formatters";

const DesignFiles = ({ order }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  const designFiles = parseJsonField(order?.design_files);
  const designMockup = parseJsonField(order?.design_mockup);
  const sizeLabelFiles = parseJsonField(order?.size_label_files);
  const freebiesFiles = parseJsonField(order?.freebies_files);

  return (
    <section className="flex flex-col gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">
        Design Files & Mockups
      </h1>

      {/* Design Files */}
      {designFiles.length > 0 && (
        <div className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl">
          <h2 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <i className="fas fa-file-image text-gray-400 text-sm sm:text-base"></i>
            Design Files
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
            {designFiles.map((file, index) => (
              <a
                key={index}
                href={`${baseUrl}${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-file-image text-gray-400 text-xs sm:text-sm flex-shrink-0"></i>
                <span className="text-xs sm:text-sm truncate">
                  {file.split("/").pop()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Design Mockups */}
      {designMockup.length > 0 && (
        <div className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl">
          <h2 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <i className="fas fa-image text-gray-400 text-sm sm:text-base"></i>
            Design Mockups
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
            {designMockup.map((file, index) => (
              <a
                key={index}
                href={`${baseUrl}${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-image text-gray-400 text-xs sm:text-sm flex-shrink-0"></i>
                <span className="text-xs sm:text-sm truncate">
                  {file.split("/").pop()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Size Label Files */}
      {sizeLabelFiles.length > 0 && (
        <div className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl">
          <h2 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <i className="fas fa-tag text-gray-400 text-sm sm:text-base"></i>
            Size Label Files
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
            {sizeLabelFiles.map((file, index) => (
              <a
                key={index}
                href={`${baseUrl}${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-tag text-gray-400 text-xs sm:text-sm flex-shrink-0"></i>
                <span className="text-xs sm:text-sm truncate">
                  {file.split("/").pop()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Freebies Files */}
      {freebiesFiles.length > 0 && (
        <div className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl">
          <h2 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <i className="fas fa-gift text-gray-400 text-sm sm:text-base"></i>
            Freebies Files
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
            {freebiesFiles.map((file, index) => (
              <a
                key={index}
                href={`${baseUrl}${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-gift text-gray-400 text-xs sm:text-sm flex-shrink-0"></i>
                <span className="text-xs sm:text-sm truncate">
                  {file.split("/").pop()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* QR & Barcode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
        {order?.qr_path && (
          <a
            href={`${baseUrl}${order.qr_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center hover:bg-gray-50 transition-colors flex flex-col h-full"
          >
            <h2 className="font-medium mb-2 flex items-center justify-center gap-2 text-sm sm:text-base">
              <i className="fas fa-qrcode text-gray-400 text-sm sm:text-base"></i>
              QR Code
            </h2>
            <img
              src={`${baseUrl}${order.qr_path}`}
              alt="QR Code"
              className="mx-auto w-24 h-24 sm:w-32 sm:h-32 object-contain"
            />
            <div className="grow"></div>
            <p className="text-gray-500 text-xs lg:text-sm mt-2">
              {order.po_code}
            </p>
          </a>
        )}

        {order?.barcode_path && (
          <a
            href={`${baseUrl}${order.barcode_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center hover:bg-gray-50 transition-colors flex flex-col h-full"
          >
            <h2 className="font-medium mb-2 flex items-center justify-center gap-2 text-sm sm:text-base">
              <i className="fas fa-barcode text-gray-400 text-sm sm:text-base"></i>
              Barcode
            </h2>
            <img
              src={`${baseUrl}${order.barcode_path}`}
              alt="Barcode"
              className="mx-auto w-full h-16 sm:h-20 object-contain"
            />
            <div className="grow"></div>
            <p className="text-gray-500 text-xs lg:text-sm mt-2">
              {order.po_code}
            </p>
          </a>
        )}
      </div>
    </section>
  );
};

export default DesignFiles;
