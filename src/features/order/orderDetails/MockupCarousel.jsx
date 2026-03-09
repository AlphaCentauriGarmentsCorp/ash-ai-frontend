import React, { useState } from "react";
import { parseJsonField } from "../../../utils/formatters";

const MockupCarousel = ({ order }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  const designMockup = parseJsonField(order?.design_mockup) || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!designMockup || designMockup.length === 0) {
    return (
      <div className="w-full aspect-square border border-gray-300 rounded-xl overflow-hidden flex flex-col items-center justify-center bg-white text-gray-400 gap-2">
        <i className="fas fa-image text-3xl"></i>
        <span className="text-sm text-center">Mockup will show here</span>
      </div>
    );
  }

  return (
    <div className="w-full aspect-square border border-gray-300 rounded-xl overflow-hidden bg-white relative">
      <div className="relative h-full w-full">
        <img
          src={`${baseUrl}${designMockup[currentSlide]}`}
          alt={`Design Mockup ${currentSlide + 1}`}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-image.png";
          }}
        />
      </div>

      {designMockup.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === 0 ? designMockup.length - 1 : prev - 1,
              )
            }
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-primary bg-opacity-50 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-opacity-75 transition-all z-10"
            aria-label="Previous mockup"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>

          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === designMockup.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary bg-opacity-50 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-opacity-75 transition-all z-10"
            aria-label="Next mockup"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            {designMockup.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentSlide === index
                    ? "bg-white w-4"
                    : "bg-gray-400 bg-opacity-50 hover:bg-opacity-75"
                }`}
                aria-label={`Go to mockup ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-primary bg-opacity-50 text-white text-xs px-2 py-1 rounded z-10">
            {currentSlide + 1} / {designMockup.length}
          </div>
        </>
      )}
    </div>
  );
};

export default MockupCarousel;
