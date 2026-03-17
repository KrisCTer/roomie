import React from "react";
import { Bath, BedDouble, Heart, House, MapPin, Ruler } from "lucide-react";

const FavoritePropertyCard = ({
  property,
  removing,
  onRemove,
  onOpenProperty,
}) => {
  const imageUrl = property.mediaList?.[0]?.url;

  return (
    <article
      className="favorite-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpenProperty(property.propertyId)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenProperty(property.propertyId);
        }
      }}
      aria-label={`Open ${property.title}`}
    >
      <div className="favorite-media-wrap">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(property.propertyId);
          }}
          disabled={removing === property.propertyId}
          className="favorite-remove-btn"
          aria-label="Remove favorite"
        >
          {removing === property.propertyId ? (
            <span className="favorite-spinner" />
          ) : (
            <Heart size={18} className="text-rose-500" fill="currentColor" />
          )}
        </button>

        {imageUrl ? (
          <img src={imageUrl} alt={property.title} className="favorite-media" />
        ) : (
          <div className="favorite-media-empty">
            <House size={56} className="text-stone-400" />
          </div>
        )}

        {property.propertyStatus === "AVAILABLE" && (
          <span className="favorite-status">Available</span>
        )}
      </div>

      <div className="favorite-body">
        <h3 className="favorite-title">{property.title}</h3>

        <p className="favorite-location">
          <MapPin size={15} />
          <span>
            {property.address?.district || ""}
            {property.address?.district && property.address?.province
              ? ", "
              : ""}
            {property.address?.province || ""}
          </span>
        </p>

        <div className="favorite-meta-row">
          {property.bedrooms > 0 && (
            <span className="favorite-meta-pill">
              <BedDouble size={13} /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="favorite-meta-pill">
              <Bath size={13} /> {property.bathrooms}
            </span>
          )}
          {property.size > 0 && (
            <span className="favorite-meta-pill">
              <Ruler size={13} /> {property.size}m²
            </span>
          )}
        </div>

        <div className="favorite-price-row">
          <p className="favorite-price">
            {property.monthlyRent?.toLocaleString()}đ
          </p>
          <p className="favorite-price-sub">/ tháng</p>
        </div>
      </div>
    </article>
  );
};

export default FavoritePropertyCard;
