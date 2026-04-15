import React from "react";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

const FavoritesHeroSection = ({ totalCount }) => {
  const { t } = useTranslation();

  return (
    <section className="favorite-hero reveal-item">
      <div className="favorite-hero-title-wrap">
        <span className="favorite-heart-badge">
          <Heart size={18} className="text-rose-500" fill="currentColor" />
        </span>
        <h1 className="favorite-hero-title">{t("favorites.title")}</h1>
      </div>

      <div className="favorite-pill-row">
        <span className="favorite-pill accent">
          {totalCount} {totalCount === 1 ? t("favorites.property") : t("favorites.properties")}
        </span>
        <span className="favorite-pill">{t("favorites.syncedAccount")}</span>
      </div>
    </section>
  );
};

export default FavoritesHeroSection;
