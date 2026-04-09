import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { quotationApi } from "../../api/quotationApi";
import { useParams, useNavigate } from "react-router-dom";

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationApi.show(id);
      setQuotation(response.data);
    } catch (err) {
      console.error("Failed to fetch quotation:", err);
      setError("Failed to load quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
const handleDownloadPDF = async () => {
  setIsDownloading(true);
  try {
    const data = await quotationApi.showPDF(id); // now returns blob

    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `quotation_${quotation?.quotation_id || id}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download PDF:', err);
  } finally {
    setIsDownloading(false);
  }
};

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: "fa-clock" },
      approved: { color: "bg-green-100 text-green-800", icon: "fa-check-circle" },
      rejected: { color: "bg-red-100 text-red-800", icon: "fa-times-circle" },
      completed: { color: "bg-blue-100 text-blue-800", icon: "fa-check-double" },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <i className={`fas ${config.icon} text-xs`}></i>
        {status || "Pending"}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="View Quotation">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">Loading quotation...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !quotation) {
    return (
      <AdminLayout pageTitle="View Quotation">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="fas fa-file-invoice-dollar text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 mb-4">{error || "Quotation not found"}</p>
            <button
              onClick={() => navigate("/quotations")}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-secondary"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Quotations
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const items = quotation.items || [];
  const addons = quotation.addons || [];
  const breakdown = quotation.breakdown || { items: [] };
  const subtotal = quotation.subtotal || 0;
  const discountAmount = quotation.discount_price || 0;
  const grandTotal = quotation.grand_total || 0;
  const downPayment = grandTotal * 0.6;
  const balance = grandTotal * 0.4;

  return (
    <AdminLayout
      pageTitle={`Quotation #${quotation.quotation_id || id}`}
      path="/quotations"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotations", href: "/quotations", icon: "fa-solid fa-file-invoice-dollar" },
        { label: `#${quotation.quotation_id || id}`, href: "#" },
      ]}
    >
      {/* PDF Content Wrapper */}
      <div id="quotation-pdf-content">
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden font-poppins">
          {/* Header - Printable */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-primary">QUOTATION</h1>
                <p className="text-xs text-gray-500 mt-1">Official Quotation Document</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {quotation.quotation_id || `QTN-${quotation.id}`}
                </div>
                <div className="text-xs text-gray-500">
                  Date: {formatDate(quotation.created_at)}
                </div>
                {quotation.status && (
                  <div className="mt-2">{getStatusBadge(quotation.status)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="p-6 border-b border-gray-200 bg-light/20">
            <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-user-circle"></i>
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-user text-xs text-gray-400 w-4"></i>
                  <span className="text-sm text-gray-600">Client Name:</span>
                  <span className="text-sm font-medium text-gray-800">{quotation.client_name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-envelope text-xs text-gray-400 w-4"></i>
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-800">{quotation.client_email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-tag text-xs text-gray-400 w-4"></i>
                  <span className="text-sm text-gray-600">Brand:</span>
                  <span className="text-sm font-medium text-gray-800">{quotation.client_brand || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-palette text-xs text-gray-400 w-4"></i>
                  <span className="text-sm text-gray-600">Shirt Color:</span>
                  <span className="text-sm font-medium text-gray-800">{quotation.shirt_color || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-gift text-xs text-gray-400 w-4"></i>
                  <span className="text-sm text-gray-600">Free Items:</span>
                  <span className="text-sm font-medium text-gray-800">{quotation.free_items || "None"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-tshirt"></i>
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-light/50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-left">Tshirt Type</th>
                    <th className="px-3 py-2 text-left">Neckline</th>
                    <th className="px-3 py-2 text-left">Print Type</th>
                    <th className="px-3 py-2 text-left">Pattern</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Price/Pc</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-light/30">
                        <td className="px-3 py-2">{item.size || item.size_id}</td>
                        <td className="px-3 py-2">{item.tshirt_type || item.tshirt_type_id}</td>
                        <td className="px-3 py-2">{item.neckline || item.neckline_id}</td>
                        <td className="px-3 py-2">{item.print_type || item.print_type_id}</td>
                        <td className="px-3 py-2">{item.print_pattern || item.print_pattern_id}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.price_per_piece)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {formatCurrency(item.total_amount || item.total)}
                        </td>
                      </tr>
                    ))
                  ) : breakdown.items?.length > 0 ? (
                    breakdown.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-light/30">
                        <td className="px-3 py-2">{item.size || "N/A"}</td>
                        <td className="px-3 py-2" colSpan="4">-</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.price_per_piece)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-3 py-8 text-center text-gray-400">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-primary/5 border-t border-gray-200">
                  <tr>
                    <td colSpan="7" className="px-3 py-2 text-right font-semibold">
                      Subtotal (Items):
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-primary">
                      {formatCurrency(subtotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Addons Section */}
          {addons.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-plus-circle"></i>
                Addons
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-light/50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Addon Name</th>
                      <th className="px-3 py-2 text-right">Price/Pc</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {addons.map((addon, idx) => (
                      <tr key={idx} className="hover:bg-light/30">
                        <td className="px-3 py-2">{addon.name}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(addon.price_per_piece || addon.price)}</td>
                        <td className="px-3 py-2 text-right">{addon.quantity || 1}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {formatCurrency(addon.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cost Breakdown (Detailed) */}
          {breakdown.items && breakdown.items.length > 0 && (
            <div className="p-6 border-b border-gray-200 bg-light/10">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-receipt"></i>
                Detailed Cost Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-light/50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-1.5 text-left">Size</th>
                      <th className="px-2 py-1.5 text-center">Qty</th>
                      <th className="px-2 py-1.5 text-right">Tshirt</th>
                      <th className="px-2 py-1.5 text-right">Size+</th>
                      <th className="px-2 py-1.5 text-right">Neckline</th>
                      <th className="px-2 py-1.5 text-right">Print Type</th>
                      <th className="px-2 py-1.5 text-right">Print Color</th>
                      <th className="px-2 py-1.5 text-right">Pattern</th>
                      <th className="px-2 py-1.5 text-right">Price/Pc</th>
                      <th className="px-2 py-1.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {breakdown.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/50">
                        <td className="px-2 py-1.5 font-medium text-primary">{item.size}</td>
                        <td className="px-2 py-1.5 text-center">{item.quantity}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(item.tshirt_price)}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(item.size_price)}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(item.neckline_price)}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(item.print_type_price)}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(item.print_color_price)}</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(item.print_pattern_price)}</td>
                        <td className="px-2 py-1.5 text-right font-semibold">{formatCurrency(item.price_per_piece)}</td>
                        <td className="px-2 py-1.5 text-right font-bold text-primary">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              <div className="w-full md:w-96">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal (Items):</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {addons.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Addons Total:</span>
                      <span>{formatCurrency(addons.reduce((sum, a) => sum + (a.total || 0), 0))}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Discount ({quotation.discount_type === "percentage" ? `${quotation.discount_price}%` : "Fixed"}):
                      </span>
                      <span className="text-red-600">- {formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-2">
                    <div className="flex justify-between text-base font-bold text-primary">
                      <span>GRAND TOTAL:</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Downpayment (60%):</span>
                      <span className="font-semibold">{formatCurrency(downPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance (40%):</span>
                      <span className="font-semibold">{formatCurrency(balance)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right mt-2">
                      <i className="fas fa-clock mr-1"></i>Balance due upon delivery/pickup
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="p-6 border-b border-gray-200 bg-light/10">
              <h2 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <i className="fas fa-pencil-alt"></i>
                Notes
              </h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 text-center text-[10px] text-gray-400 border-t border-gray-200">
            <p>This is a computer-generated quotation and requires no signature.</p>
            <p className="mt-1">For inquiries, please contact our customer service.</p>
          </div>
        </section>
      </div>

      {/* Action Buttons - Not printed */}
      <div className="fixed bottom-6 right-6 flex gap-3 print:hidden">
        <button
          onClick={() => navigate("/quotations")}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition-all text-sm flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-secondary transition-all text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Generating PDF...
            </>
          ) : (
            <>
              <i className="fas fa-download"></i>
              Download PDF
            </>
          )}
        </button>
      </div>
    </AdminLayout>
  );
};

export default ViewQuotation;