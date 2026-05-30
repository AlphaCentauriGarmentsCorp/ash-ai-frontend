import React, { useState } from "react";

/**
 * Phase 7-B Bundle 2 — Read-only reference image gallery.
 *
 * Renders mockups (front_mockup, back_mockup) and approved sample photos
 * pulled by QaPackerPortalService::referenceImages. The packer uses these
 * as the visual ground-truth they're QA-ing against.
 *
 * Click an image to open a lightbox modal. No editing, no upload — pure
 * reference.
 */

const KIND_LABEL = {
  mockup: "Mockup",
  sample: "Approved Sample",
};

const KIND_BADGE = {
  mockup: "bg-purple-50 text-purple-700",
  sample: "bg-green-50 text-green-700",
};

const ReferenceImagesSection = ({ referenceImages = [] }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center"><i className="fa-solid fa-images text-[11px]" /></span>
        Reference Images
        <span className="ml-auto text-[10px] text-gray-400 font-normal">
          {referenceImages.length} {referenceImages.length === 1 ? "image" : "images"}
        </span>
      </h2>

      {referenceImages.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Walang reference images pa para sa order na ito. Tingnan sa CSR
          kung may nakalimutan i-upload.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {referenceImages.map((img, idx) => {
            const badge = KIND_BADGE[img.kind] || "bg-gray-100 text-gray-700";
            return (
              <button
                key={`${img.kind}-${idx}`}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group relative bg-gray-50 border border-gray-200 hover:border-primary rounded-md overflow-hidden aspect-square transition-colors"
              >
                <img
                  src={img.url}
                  alt={img.label || KIND_LABEL[img.kind] || "Reference"}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onError={(e) => {
                    // Friendly fallback if a file 404s — no broken-image icon.
                    e.target.src =
                      "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='55' font-size='10' fill='%239ca3af' text-anchor='middle'%3EImage missing%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div
                  className={`absolute top-1.5 left-1.5 text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded ${badge}`}
                >
                  {KIND_LABEL[img.kind] || img.kind}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.label}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox modal */}
      {lightboxIndex !== null && referenceImages[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" />
          </button>

          {/* Prev */}
          {lightboxIndex > 0 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl hover:text-gray-300 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i - 1);
              }}
              aria-label="Previous"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
          )}
          {/* Next */}
          {lightboxIndex < referenceImages.length - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-xl hover:text-gray-300 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => i + 1);
              }}
              aria-label="Next"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          )}

          <img
            src={referenceImages[lightboxIndex].url}
            alt={referenceImages[lightboxIndex].label || "Reference"}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 inset-x-0 text-center text-white text-xs">
            {referenceImages[lightboxIndex].label}
            <span className="mx-2 opacity-50">·</span>
            {lightboxIndex + 1} / {referenceImages.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default ReferenceImagesSection;
