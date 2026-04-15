import React from "react";
import { useTranslation } from "react-i18next";
import HomePropertyCard from "../../home/sections/HomePropertyCard";
import { transformToCardData } from "../../home/utils/homePresentation";

const FavoritesGridSection = ({
  favorites,
  removing,
  onRemove,
  onOpenProperty,
}) => {
  const { t } = useTranslation();

  if (favorites.length === 0) {
    return (
      <section className="favorite-empty reveal-item is-visible">
        <h2 className="favorite-empty-title">{t("favorites.noFavorites")}</h2>
        <p className="favorite-empty-desc">
          {t("favorites.noFavoritesDesc")}
        </p>
        <button
          type="button"
          onClick={() => onOpenProperty("search")}
          className="favorite-cta-btn"
        >
          {t("favorites.explore")}
        </button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((property, index) => {
        const cardData = transformToCardData(property, t);
        return (
          <div key={property.propertyId} className="reveal-item is-visible"
            style={{ animationDelay: `${index * 60}ms` }}>
            <HomePropertyCard
              property={cardData}
              onCardClick={(id) => onOpenProperty(id)}
            />
          </div>
        );
      })}
    </section>
  );
};

export default FavoritesGridSection;
