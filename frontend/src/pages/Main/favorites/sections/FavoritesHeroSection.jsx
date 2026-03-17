import React from "react";
import { Heart } from "lucide-react";

const FavoritesHeroSection = ({ totalCount }) => {
  return (
    <section className="favorite-hero reveal-item">
      <div className="favorite-hero-title-wrap">
        <span className="favorite-heart-badge">
          <Heart size={18} className="text-rose-500" fill="currentColor" />
        </span>
        <h1 className="favorite-hero-title">My Favorites</h1>
      </div>

      <div className="favorite-pill-row">
        <span className="favorite-pill accent">
          {totalCount} {totalCount === 1 ? "property" : "properties"}
        </span>
        <span className="favorite-pill">Đồng bộ theo tài khoản</span>
      </div>
    </section>
  );
};

export default FavoritesHeroSection;
