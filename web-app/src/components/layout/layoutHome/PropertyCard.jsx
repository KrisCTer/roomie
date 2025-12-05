import { MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const PropertyCard = ({ property }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all cursor-pointer">
      {/* IMAGE */}
      <div className="relative w-full h-56">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isFeatured && (
            <span className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {t("propertyCard.featured")}
            </span>
          )}
          <span className="px-3 py-1 text-xs font-semibold text-white bg-gray-800 rounded-full">
            {t("propertyCard.forSale")}
          </span>
        </div>

        {/* Heart Favorite */}
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur p-2 rounded-full hover:scale-110 transition">
          <Heart size={18} className="text-gray-700" />
        </button>

        {/* Address */}
        <div className="absolute bottom-3 left-3 text-white text-sm flex items-center gap-1 drop-shadow-lg">
          <MapPin size={16} />
          {property.address}
        </div>
      </div>

      {/* BODY */}
      <div className="px-5 py-4">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {property.title}
        </h3>

        {/* Specs */}
        <div className="flex justify-between text-gray-600 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Bed size={16} /> {t("propertyCard.beds")}:{" "}
            <span className="font-semibold text-gray-900">
              {property.bedrooms}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Bath size={16} /> {t("propertyCard.baths")}:{" "}
            <span className="font-semibold text-gray-900">
              {property.bathrooms}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Square size={16} /> {t("propertyCard.sqft")}:{" "}
            <span className="font-semibold text-gray-900">
              {property.size}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-4"></div>

        {/* Footer (owner + price) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={property.ownerAvatar}
              alt={property.owner}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-gray-900 font-medium">
              {property.owner}
            </span>
          </div>

          <div className="text-xl font-semibold text-gray-900">
            ${property.price.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
