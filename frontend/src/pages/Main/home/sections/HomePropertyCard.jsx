import React from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Expand,
  Heart,
  MapPin,
  Share2,
} from "lucide-react";
import { useFavorite } from "../../../../hooks/useFavorite";

const HomePropertyCard = ({ property, onCardClick }) => {
  const {
    isFavorited,
    favoriteCount,
    isLoading: favoriteLoading,
    handleToggleFavorite,
  } = useFavorite(property.id);

  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    handleToggleFavorite();
  };

  const handleShare = async (event) => {
    event.stopPropagation();
    const url = `${window.location.origin}/property/${property.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: "Xem phòng này trên Roomie",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      console.error("Error sharing property", error);
    }
  };

  return (
    <article
      className="home-card reveal-item group"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(property.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCardClick(property.id);
        }
      }}
      aria-label={`Open property ${property.title}`}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={property.image}
          alt={property.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />

        {property.displayType && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--home-charcoal)]">
            {property.displayType}
          </span>
        )}

        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="home-icon-btn"
            aria-label={`Share ${property.title}`}
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
            className="home-icon-btn"
            aria-label={isFavorited ? "Remove favorite" : "Add favorite"}
          >
            <Heart
              size={16}
              className={
                isFavorited
                  ? "fill-rose-500 text-rose-500"
                  : "text-[var(--home-charcoal)]"
              }
            />
          </button>
        </div>

        {favoriteCount > 0 && (
          <p className="absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
            {favoriteCount} likes
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-[var(--home-charcoal)]">
            {property.title}
          </h3>
          <div className="shrink-0 text-right">
            <p className="text-base font-bold text-[var(--home-charcoal)]">
              {property.price.toLocaleString()} ₫
            </p>
            <p className="text-xs text-[var(--home-muted)]">/ tháng</p>
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm text-[var(--home-muted)]">
          <MapPin size={15} className="shrink-0" />
          <span className="truncate">{property.location}</span>
        </p>

        <div className="grid grid-cols-3 gap-2 text-sm text-[var(--home-muted)]">
          <p className="home-chip-stat">
            <BedDouble size={14} /> {property.bedrooms || "-"}
          </p>
          <p className="home-chip-stat">
            <Bath size={14} /> {property.bathrooms || "-"}
          </p>
          <p className="home-chip-stat">
            <Expand size={14} /> {property.size ? `${property.size}m²` : "-"}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--home-border)] pt-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--home-muted)]">
            quick match
          </p>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--home-accent)] px-4 text-sm font-semibold text-[var(--home-charcoal)] transition group-hover:translate-x-1">
            Chi tiết <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </article>
  );
};

export default HomePropertyCard;
