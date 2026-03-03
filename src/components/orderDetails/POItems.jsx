import React from "react";

const POItems = ({ order }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">PO Items</h1>
      {order?.items && order.items.length > 0 ? (
        <div className="border border-gray-200 sm:border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
          {/* Mobile View (Card Layout) */}
          <div className="block sm:hidden">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{item.sku}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.color} {item.size && `• ${item.size}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {item.qr_path && (
                      <a
                        href={`${baseUrl}${item.qr_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 rounded-lg transition-colors"
                        title="View QR Code"
                      >
                        <i className="fas fa-qrcode text-sm"></i>
                      </a>
                    )}
                    {item.barcode_path && (
                      <a
                        href={`${baseUrl}${item.barcode_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-700 p-1.5 bg-green-50 rounded-lg transition-colors"
                        title="View Barcode"
                      >
                        <i className="fas fa-barcode text-sm"></i>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Quantity:</p>
                  <p className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                      {item.color}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                      {item.size}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                      <div className="flex gap-2 lg:gap-3">
                        {item.qr_path && (
                          <a
                            href={`${baseUrl}${item.qr_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="View QR Code"
                          >
                            <i className="fas fa-qrcode text-base lg:text-lg"></i>
                          </a>
                        )}
                        {item.barcode_path && (
                          <a
                            href={`${baseUrl}${item.barcode_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-700 transition-colors"
                            title="View Barcode"
                          >
                            <i className="fas fa-barcode text-base lg:text-lg"></i>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm sm:text-base text-center py-6 sm:py-8 border border-gray-200 sm:border-gray-300 rounded-lg sm:rounded-xl">
          No items found for this order
        </p>
      )}
    </section>
  );
};

export default POItems;
