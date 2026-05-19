import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { csrPortalApi } from "../../../../api/csrPortalApi";

/**
 * Phase 6-A Bundle 2 — Convert Inquiry to Quotation confirmation.
 *
 * Lightweight confirmation modal. On confirm:
 *   - POST /csr/inquiries/{id}/convert-to-quotation
 *   - 200 → navigate to /quotations/{quotation.id}/edit
 *   - 409 → already converted; offer to navigate to the existing quotation
 *   - Other → error message + retry
 *
 * The backend creates a Draft quotation (no PDF, no email) and back-references
 * it on the inquiry row. After success, status flips to 'converted'.
 *
 * Props:
 *   inquiry   {...} (required)
 *   onClose()
 *   onConverted(inquiry, quotation)  — fired after navigation completes the
 *                                       handoff (parent updates its list)
 */
const ConvertToQuotationConfirmModal = ({ inquiry, onClose, onConverted }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyConverted, setAlreadyConverted] = useState(null);
  // ^ holds { quotation_id } when backend returns 409

  const handleConvert = async () => {
    setSubmitting(true);
    setError(null);
    setAlreadyConverted(null);

    try {
      const res = await csrPortalApi.convertInquiryToQuotation(inquiry.id);
      const inquiryUpdated = res?.data?.inquiry;
      const quotation = res?.data?.quotation;

      onConverted?.(inquiryUpdated, quotation);

      // Navigate to the new draft quotation's edit page so CSR can
      // fill in pricing details immediately.
      if (quotation?.id) {
        navigate(`/quotations/edit/${quotation.id}`);   // ← swap segments
      } else {
        onClose?.();
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 409 && data?.quotation_id) {
        setAlreadyConverted({ quotation_id: data.quotation_id });
      } else {
        setError(data?.message || "Failed to convert. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goToExisting = () => {
    if (alreadyConverted?.quotation_id) {
      navigate(`/quotations/edit/${alreadyConverted.quotation_id}`);  // ← swap segments
    }
  };

  if (!inquiry) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <i className="fa-solid fa-file-export text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Convert to Quotation?</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              This will create a Draft quotation and mark the inquiry as converted.
            </p>
          </div>
        </div>

        {/* Inquiry summary */}
        <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs space-y-1 mb-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Inquiry:</span>
            <span className="font-mono font-medium text-gray-900">
              {inquiry.inquiry_code}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Client:</span>
            <span className="font-medium text-gray-900">{inquiry.client_name}</span>
          </div>
          {inquiry.brand_name && (
            <div className="flex justify-between">
              <span className="text-gray-500">Brand:</span>
              <span className="text-gray-900">{inquiry.brand_name}</span>
            </div>
          )}
        </div>

        {alreadyConverted ? (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
            <p className="text-xs font-semibold text-amber-900 mb-1">
              <i className="fa-solid fa-info-circle mr-1" />
              Already converted
            </p>
            <p className="text-xs text-amber-800">
              This inquiry was already converted to a quotation. You can open
              the existing one instead.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3 text-xs text-blue-900">
            <i className="fa-solid fa-circle-info mr-1" />
            The new quotation will start as <strong>Draft</strong> — no email or PDF
            is sent yet. You'll be redirected to fill in pricing details.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {alreadyConverted ? (
            <button
              type="button"
              onClick={goToExisting}
              className="px-4 py-2 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Open Existing Quotation
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConvert}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1" />
                  Converting…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-export mr-1" />
                  Convert
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvertToQuotationConfirmModal;
