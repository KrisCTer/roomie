import React from "react";

const FavoritesLoadingSection = () => {
  return (
    <section className="favorite-grid" aria-label="Loading favorites">
      {[...Array(8)].map((_, index) => (
        <div
          key={`favorite-skeleton-${index}`}
          className="favorite-card-skeleton"
        />
      ))}
    </section>
  );
};

export default FavoritesLoadingSection;
