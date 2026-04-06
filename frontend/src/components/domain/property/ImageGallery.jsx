import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

const ImageGallery = ({ images = [], title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const displayImages =
    images.length > 0
      ? images
      : ["https://via.placeholder.com/800x600?text=No+Image"];

  const mainImage = displayImages[0];
  const hasMultipleImages = displayImages.length > 1;
  const gridImages = displayImages.slice(1, 5);

  // Use useCallback to memoize functions
  const nextImage = useCallback(() => {
    setImageLoading(true);
    setCurrentIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  }, [displayImages.length]);

  const prevImage = useCallback(() => {
    setImageLoading(true);
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  }, [displayImages.length]);

  const closeLightbox = useCallback(() => {
    setShowLightbox(false);
    setImageLoading(true);
  }, []);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setShowLightbox(true);
    setImageLoading(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!showLightbox) {
      document.body.style.overflow = "unset";
      return;
    }

    const handleKeyDown = (e) => {
      e.preventDefault();
      if (e.key === "Escape") {
        closeLightbox();
      }
      if (e.key === "ArrowRight") {
        nextImage();
      }
      if (e.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showLightbox, closeLightbox, nextImage, prevImage]);

  return (
    <>
      {/* Gallery Grid - Enhanced Airbnb Style */}
      <div className="my-8">
        <div className="relative grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[500px]">
          {/* Main Large Image */}
          <div
            className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
            onClick={() => openLightbox(0)}
          >
            <img
              src={mainImage}
              alt={title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Not+Found";
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Zoom Icon */}
            <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
              <Maximize2 className="w-5 h-5 text-gray-900" />
            </div>
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
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Image+Not+Found";
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Show more overlay on last image */}
                {index === 3 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center group-hover:bg-black/80 transition-colors">
                    <div className="text-center">
                      <span className="text-white font-bold text-2xl">
                        +{displayImages.length - 5}
                      </span>
                      <p className="text-white text-sm mt-1">ảnh khác</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Show all photos button */}
        {hasMultipleImages && (
          <button
            onClick={() => openLightbox(0)}
            className="mt-6 px-6 py-3 border-2 border-gray-900 rounded-xl text-sm font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center gap-2 group"
          >
            <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Xem tất cả {displayImages.length} ảnh</span>
          </button>
        )}
      </div>

      {/* Enhanced Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-6 right-6 p-3 text-white hover:bg-white/20 rounded-full transition-all duration-200 z-20 group backdrop-blur-sm bg-black/20"
            aria-label="Close gallery"
          >
            <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Image Counter */}
          <div
            className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm px-5 py-3 rounded-full text-white font-semibold text-sm z-20 border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {currentIndex + 1} / {displayImages.length}
          </div>

          {/* Main Image Container */}
          <div
            className="relative w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading Spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}

            {/* Image */}
            <img
              src={displayImages[currentIndex]}
              alt={`${title} ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Not+Found";
                setImageLoading(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation Buttons */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-2xl group z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7 text-gray-900 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-2xl group z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7 text-gray-900 group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip (Optional - for many images) */}
          {displayImages.length > 5 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm p-3 rounded-2xl max-w-screen-lg overflow-x-auto scrollbar-hide border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                    setImageLoading(true);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                    idx === currentIndex
                      ? "ring-4 ring-white scale-110"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
