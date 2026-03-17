import React from "react";
import FavoritePropertyCard from "./FavoritePropertyCard";

const FavoritesGridSection = ({
  favorites,
  removing,
  onRemove,
  onOpenProperty,
}) => {
  if (favorites.length === 0) {
    return (
      <section className="favorite-empty reveal-item">
        <h2 className="favorite-empty-title">No favorites yet</h2>
        <p className="favorite-empty-desc">
          Start exploring and save your favorite properties.
        </p>
        <button
          type="button"
          onClick={() => onOpenProperty("search")}
          className="favorite-cta-btn"
        >
          Explore Properties
        </button>
      </section>
    );
  }

  return (
    <section className="favorite-grid">
      {favorites.map((property) => (
        <FavoritePropertyCard
          key={property.propertyId}
          property={property}
          removing={removing}
          onRemove={onRemove}
          onOpenProperty={onOpenProperty}
        />
      ))}
    </section>
  );
};

export default FavoritesGridSection;
