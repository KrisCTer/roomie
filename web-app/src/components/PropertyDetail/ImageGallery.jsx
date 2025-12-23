import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ImageGallery = ({ images = [], title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const displayImages =
    images.length > 0
      ? images
      : ["https://via.placeholder.com/800x600?text=No+Image"];

  const mainImage = displayImages[0];
  const hasMultipleImages = displayImages.length > 1;
  const gridImages = displayImages.slice(1, 5);

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setShowLightbox(true);
  };

  return (
    <>
      {/* Gallery Grid - Airbnb Style */}
      <div className="mt-6 mb-8">
        <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden h-[480px]">
          {/* Main Large Image */}
          <div
            className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={mainImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Not+Found";
              }}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </div>

          {/* Grid of 4 smaller images */}
          {hasMultipleImages &&
            gridImages.map((image, index) => (
              <div
                key={index + 1}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={image}
                  alt={`${title} ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Image+Not+Found";
                  }}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                {/* Show more button on last image */}
                {index === 3 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{displayImages.length - 5} photos
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Show all photos button */}
        {hasMultipleImages && (
          <button
            onClick={() => openLightbox(0)}
            className="mt-4 px-4 py-2 border border-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors duration-200"
          >
            Show all {displayImages.length} photos
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={displayImages[currentIndex]}
              alt={`${title} ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Not+Found";
              }}
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
