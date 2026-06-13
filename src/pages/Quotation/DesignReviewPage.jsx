import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quotationReviewApi } from "../../api/quotationReviewApi";
import { useAuth } from "../../hooks/useAuth";
import DesignReviewPanel from "../../components/quotation/DesignReviewPanel";
import useConfirm from "../../hooks/useConfirm";

/**
 * Issue 8 (Sec. 5) — Graphic Artist design-review page.
 *
 * The GA's dedicated, least-privilege surface (Option 2: no queue). Reached
 * from the "Design review requested" notification link. Editable by
 * graphic_artist + superadmin; the backend enforces this via
 * access.quotation-review, and we mirror it here for a clean UX.
 */
const ALLOWED_ROLES = ["graphic_artist", "superadmin"];

const DesignReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { alert, dialog } = useConfirm();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roles = user?.domain_role || [];
  const canReview = roles.some((r) => ALLOWED_ROLES.includes(r));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quotationReviewApi.show(id);
      setReview(res.data || res);
    } catch (err) {
      console.error("Failed to load design review:", err);
      setError("Could not load this design review.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canReview) load();
    else setLoading(false);
  }, [id]);

  const handleSave = async (payload) => {
    try {
      const res = await quotationReviewApi.update(id, payload);
      setReview(res.data || res);
    } catch (err) {
      console.error("Failed to save review:", err);
      await alert({
        title: "Couldn't save the review",
        message: "Please try again.",
        tone: "danger",
      });
    }
  };

  if (!canReview) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center text-gray-500">
        You don&apos;t have access to design reviews.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {dialog}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-xs text-gray-500 hover:text-primary mb-4"
      >
        <i className="fas fa-arrow-left mr-1.5" aria-hidden="true"></i>Back
      </button>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <>
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-primary">
              Design review · #{review.quotation_id}
            </h1>
            <p className="text-xs text-gray-500">
              {review.client_name} · shirt color: {review.shirt_color || "—"}
            </p>
          </div>

          <DesignReviewPanel
            review={review}
            printParts={review.print_parts || []}
            editable
            allowedVerdicts={review.allowed_verdicts || ["GA Approved", "Needs New File"]}
            onSave={handleSave}
          />

          {review.notes && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              <span className="font-medium text-gray-700">CSR notes:</span> {review.notes}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DesignReviewPage;
