import React from "react";

const resolveUrl = (path) => {
  if (!path) return "";
  const raw = String(path).trim();
  if (raw.startsWith("http") || raw.startsWith("data:")) return raw;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (raw.startsWith("/storage/") || raw.startsWith("storage/"))
    return `${base}/${raw.replace(/^\//, "")}`;
  return `${base}/storage/${raw.replace(/^\//, "")}`;
};

const FileLink = ({ file, icon = "fa-file-image", label }) => {
  const url = resolveUrl(file);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <i className={`fas ${icon} text-gray-400 text-xs sm:text-sm shrink-0`}></i>
      <span className="text-xs sm:text-sm truncate">{label || String(file).split("/").pop()}</span>
    </a>
  );
};

const DesignFiles = ({ order }) => {
  const printParts = order?.print_parts_json || [];

  return (
    <section className="flex flex-col gap-y-3 sm:gap-y-4">
      <h1 className="font-semibold text-base sm:text-lg">Design Files & Mockups</h1>

      {/* ── Print Parts from Quotation ─────────────────────────────────── */}
      {printParts.length > 0 && (
        <div className="border border-blue-100 bg-blue-50/40 p-3 sm:p-4 rounded-lg sm:rounded-xl">
          <h2 className="font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
            <i className="fas fa-images text-blue-400"></i>
            Print Parts
          </h2>
          <div className="overflow-x-auto rounded-lg border border-blue-100">
            <table className="w-full text-xs sm:text-sm bg-white">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-blue-700">Part</th>
                  <th className="px-3 py-2 text-left font-semibold text-blue-700">Image</th>
                  <th className="px-3 py-2 text-right font-semibold text-blue-700"># Units</th>
                  <th className="px-3 py-2 text-right font-semibold text-blue-700">Price/Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {printParts.map((part, idx) => {
                  const imageUrl = resolveUrl(part?.image_link || part?.image_url || part?.image_path || part?.image);
                  const partName = part?.part || part?.name || `Part ${idx + 1}`;
                  const unitCount = Number(part?.unit_count ?? part?.colorCount ?? part?.color_count ?? 0);
                  const pricePerUnit = Number(part?.price_per_unit ?? part?.pricePerUnit ?? part?.price_per_color ?? 0);
                  const fmt = (v) => `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                  return (
                    <tr key={idx} className="hover:bg-blue-50/40">
                      <td className="px-3 py-2 font-medium">{partName}</td>
                      <td className="px-3 py-2">
                        {imageUrl ? (
                          <a href={imageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                            <img src={imageUrl} alt={partName}
                              className="h-10 w-10 rounded border border-gray-200 object-cover bg-white" />
                            <span className="text-xs text-primary hover:underline">View</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                              <i className="fas fa-image text-gray-300"></i>
                            </div>
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">{unitCount}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">{fmt(pricePerUnit)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── QR & Barcode ──────────────────────────────────────────────── */}
      {(order?.qr_path || order?.barcode_path) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {order?.qr_path && (
            <a href={resolveUrl(order.qr_path)} target="_blank" rel="noreferrer"
              className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center hover:bg-gray-50 transition-colors flex flex-col">
              <h2 className="font-medium mb-2 flex items-center justify-center gap-2 text-sm sm:text-base">
                <i className="fas fa-qrcode text-gray-400"></i>QR Code
              </h2>
              <img src={resolveUrl(order.qr_path)} alt="QR Code"
                className="mx-auto w-24 h-24 sm:w-32 sm:h-32 object-contain" />
              <p className="text-gray-500 text-xs mt-2">{order.po_code}</p>
            </a>
          )}
          {order?.barcode_path && (
            <a href={resolveUrl(order.barcode_path)} target="_blank" rel="noreferrer"
              className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center hover:bg-gray-50 transition-colors flex flex-col">
              <h2 className="font-medium mb-2 flex items-center justify-center gap-2 text-sm sm:text-base">
                <i className="fas fa-barcode text-gray-400"></i>Barcode
              </h2>
              <img src={resolveUrl(order.barcode_path)} alt="Barcode"
                className="mx-auto w-full h-16 sm:h-20 object-contain" />
              <p className="text-gray-500 text-xs mt-2">{order.po_code}</p>
            </a>
          )}
        </div>
      )}

      {/* Empty state */}
      {printParts.length === 0 && !order?.qr_path && !order?.barcode_path && (
        <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
          <i className="fas fa-images text-3xl mb-2 block"></i>
          No design files or print parts available for this order.
        </div>
      )}
    </section>
  );
};

export default DesignFiles;