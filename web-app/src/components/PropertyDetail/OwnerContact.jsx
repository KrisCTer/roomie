// src/components/PropertyDetail/OwnerContact.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MessageCircle,
  Heart,
  Share2,
  User,
  Loader2,
} from "lucide-react";

const OwnerContact = ({
  owner,
  contactingOwner,
  onContactOwner,
  isFavorite,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  if (!owner) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-center text-gray-500">
          Owner information is not available
        </p>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Roomie Property",
          text: "Check out this property!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleViewProfile = () => {
    navigate(`/user/${owner.ownerId}`);
    console.log(owner);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Owner Info */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {owner.name?.[0]?.toUpperCase() || "O"}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{owner.name}</h3>
          <p className="text-sm text-gray-600">Property Owner</p>
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="space-y-3 mb-6">
        {/* View Profile */}
        <button
          onClick={handleViewProfile}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-sm"
        >
          <User className="w-5 h-5" />
          <span className="font-medium">View Owner Profile</span>
        </button>

        {/* Message Owner */}
        <button
          onClick={onContactOwner}
          disabled={contactingOwner}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {contactingOwner ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Connecting...</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Message the Owner</span>
            </>
          )}
        </button>

        {/* Phone */}
        {owner.phoneNumber && (
          <a
            href={`tel:${owner.phoneNumber}`}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition border border-gray-200"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">{owner.phoneNumber}</span>
          </a>
        )}

        {/* Email */}
        {owner.email && (
          <a
            href={`mailto:${owner.email}`}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition border border-gray-200"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium text-sm">{owner.email}</span>
          </a>
        )}
      </div>

      {/* Optional Actions (Favorite / Share) */}
      {/*
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={onToggleFavorite}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition border ${
            isFavorite
              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-600" : ""}`} />
          <span className="text-sm font-medium">
            {isFavorite ? "Saved" : "Save"}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition border border-gray-200"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
      */}

      {/* Warning Note */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs text-amber-800">
          💡 <strong>Note:</strong> Please do not transfer money before visiting
          the property and signing the official contract.
        </p>
      </div>
    </div>
  );
};

export default OwnerContact;
