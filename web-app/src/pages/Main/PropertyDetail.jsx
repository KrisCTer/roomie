import React, { useEffect, useState } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Calendar,
  DollarSign,
  Home,
  Tag,
  MessageCircle,
} from "lucide-react";

import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/layoutHome/Header.jsx";
import Footer from "../../components/layout/layoutHome/Footer.jsx";

import { getPropertyById } from "../../services/property.service";
import { createConversation } from "../../services/chat.service";
import { getUserInfo } from "../../services/localStorageService";

// ========================================================
// MAIN COMPONENT
// ========================================================
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactingOwner, setContactingOwner] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  useEffect(() => {
    if (!id) return;
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const data = await getPropertyById(id);
      console.log("PROPERTY RESPONSE =", data);
      setProperty(data.result);
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // HANDLE CONTACT OWNER
  // ==============================
  const handleContactOwner = async () => {
    try {
      // Check if user is logged in
      const currentUser = getUserInfo();
      if (!currentUser) {
        alert("Vui lòng đăng nhập để nhắn tin với chủ nhà");
        navigate("/login");
        return;
      }

      // Check if trying to message yourself
      if (currentUser.userId === property.ownerId) {
        alert("Bạn không thể nhắn tin cho chính mình");
        return;
      }

      setContactingOwner(true);

      // Create or get conversation with owner
      const conversationData = {
        type: "DIRECT",
        participantIds: [property.ownerId],
      };

      console.log("Creating conversation with owner:", conversationData);
      const response = await createConversation(conversationData);

      const conversation =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      console.log("Conversation created/found:", conversation);

      // Navigate to messages page with conversation selected
      navigate("/messages", {
        state: {
          conversationId: conversation.conversationId,
          propertyId: property.propertyId,
          propertyTitle: property.title,
          ownerId: property.ownerId,
          ownerName:
            property.owner?.fullName || property.owner?.username || "Owner",
        },
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.");
    } finally {
      setContactingOwner(false);
    }
  };

  // ==============================
  // HANDLE BOOKING
  // ==============================
  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      alert("Check-out date must be after check-in date");
      return;
    }

    // Calculate rental period
    const days = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const totalCost = (property.monthlyRent / 30) * days;

    console.log("Booking details:", {
      propertyId: property.propertyId,
      checkIn,
      checkOut,
      days,
      totalCost: totalCost.toFixed(2),
    });

    alert(
      `Booking request:\nProperty: ${
        property.title
      }\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nDays: ${days}\nEstimated cost: ${totalCost.toLocaleString()}đ`
    );

    // TODO: Implement actual booking logic
    // navigate("/booking", { state: { property, checkIn, checkOut } });
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        Loading property...
      </div>
    );

  if (!property)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        Property Not Found
      </div>
    );

  // ==============================
  // IMAGE LIST
  // ==============================
  const images =
    property.mediaList?.map((i) => i.url) ??
    ["https://via.placeholder.com/800x600?text=No+Image"].map(
      (url) => url + "?format=webp"
    );

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  // ==============================
  // FORMAT DATE
  // ==============================
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* BREADCRUMB */}
            <nav className="mb-6 text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600">
                Home
              </a>
              {" > "}
              <a href="/search" className="hover:text-blue-600">
                Properties
              </a>
              {" > "}
              <span className="text-gray-900">{property.title}</span>
            </nav>

            {/* TITLE & ACTIONS */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex-1 mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {property.address?.fullAddress ||
                        `${property.address?.district}, ${property.address?.province}` ||
                        "Location not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">{property.propertyType}</span>
                  </div>
                  {property.propertyLabel &&
                    property.propertyLabel !== "NONE" && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        {property.propertyLabel}
                      </span>
                    )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                  title="Add to favorites"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert("Link copied to clipboard!");
                  }}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                  title="Share property"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* IMAGE GALLERY */}
            <div className="relative mb-8 bg-black rounded-xl overflow-hidden">
              <div className="aspect-video">
                <img
                  src={images[currentImageIndex]}
                  alt={`Property ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x600?text=Image+Not+Found";
                  }}
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full transition shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full transition shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: PROPERTY DETAILS */}
              <div className="lg:col-span-2 space-y-6">
                {/* OVERVIEW */}
                <Section title="Property Overview">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Detail
                      icon={<Bed className="w-5 h-5" />}
                      label="Bedrooms"
                      value={property.bedrooms || 0}
                    />
                    <Detail
                      icon={<Bath className="w-5 h-5" />}
                      label="Bathrooms"
                      value={property.bathrooms || 0}
                    />
                    <Detail
                      icon={<Car className="w-5 h-5" />}
                      label="Garages"
                      value={property.garages || 0}
                    />
                    <Detail
                      icon={<Maximize className="w-5 h-5" />}
                      label="Size"
                      value={`${property.size || 0} m²`}
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">
                          Monthly Rent
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {property.monthlyRent?.toLocaleString()}đ
                        </div>
                        {property.rentalDeposit > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Deposit: {property.rentalDeposit?.toLocaleString()}đ
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Rental Type</div>
                        <div className="font-semibold">
                          {property.rentalType}
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* DESCRIPTION */}
                <Section title="Description">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {property.description || "No description available."}
                  </p>
                </Section>

                {/* AMENITIES */}
                {(property.amenities?.homeSafety?.length > 0 ||
                  property.amenities?.bedroom?.length > 0 ||
                  property.amenities?.kitchen?.length > 0 ||
                  property.amenities?.others?.length > 0) && (
                  <Section title="Amenities">
                    <div className="space-y-4">
                      {property.amenities?.homeSafety?.length > 0 && (
                        <AmenityGroup
                          title="Home Safety"
                          items={property.amenities.homeSafety}
                        />
                      )}
                      {property.amenities?.bedroom?.length > 0 && (
                        <AmenityGroup
                          title="Bedroom"
                          items={property.amenities.bedroom}
                        />
                      )}
                      {property.amenities?.kitchen?.length > 0 && (
                        <AmenityGroup
                          title="Kitchen"
                          items={property.amenities.kitchen}
                        />
                      )}
                      {property.amenities?.others?.length > 0 && (
                        <AmenityGroup
                          title="Others"
                          items={property.amenities.others}
                        />
                      )}
                    </div>
                  </Section>
                )}

                {/* LOCATION */}
                <Section title="Location">
                  <div className="space-y-3">
                    <Info
                      label="Full Address"
                      value={property.address?.fullAddress}
                    />
                    <Info label="Province" value={property.address?.province} />
                    <Info label="District" value={property.address?.district} />
                    <Info label="Ward" value={property.address?.ward} />
                    <Info label="Street" value={property.address?.street} />
                    <Info
                      label="House Number"
                      value={property.address?.houseNumber}
                    />
                  </div>

                  {property.address?.location && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        Coordinates: {property.address.location}
                      </p>
                      {/* TODO: Add Google Maps integration */}
                      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-500">
                        Map view coming soon
                      </div>
                    </div>
                  )}
                </Section>
              </div>

              {/* RIGHT: SIDEBAR */}
              <div className="space-y-6">
                {/* OWNER INFO */}
                <Section title="Contact Owner">
                  {property.owner?.fullName && (
                    <div className="mb-4 pb-4 border-b">
                      <div className="text-lg font-semibold">
                        {property.owner.fullName}
                      </div>
                      {property.owner.username && (
                        <div className="text-sm text-gray-500">
                          @{property.owner.username}
                        </div>
                      )}
                    </div>
                  )}

                  {property.owner?.phone && (
                    <Contact
                      icon={<Phone className="w-4 h-4" />}
                      text={property.owner.phone}
                    />
                  )}
                  {property.owner?.email && (
                    <Contact
                      icon={<Mail className="w-4 h-4" />}
                      text={property.owner.email}
                    />
                  )}

                  <button
                    onClick={handleContactOwner}
                    disabled={contactingOwner}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactingOwner ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        <span>Contact Owner</span>
                      </>
                    )}
                  </button>

                  <div className="flex gap-2 mt-4">
                    <FavButton
                      active={isFavorite}
                      onClick={() => setIsFavorite(!isFavorite)}
                    />
                    <ShareButton />
                  </div>
                </Section>

                {/* BOOKING BOX */}
                <Section title="Book This Property">
                  <div className="space-y-3">
                    <InputDate
                      label="Check-in"
                      value={checkIn}
                      onChange={setCheckIn}
                    />
                    <InputDate
                      label="Check-out"
                      value={checkOut}
                      onChange={setCheckOut}
                    />

                    <button
                      onClick={handleBooking}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </Section>

                {/* PROPERTY INFORMATION */}
                <Section title="Property Information">
                  <Info label="Property ID" value={property.propertyId} />
                  <Info label="Property Type" value={property.propertyType} />
                  <Info
                    label="Property Status"
                    value={property.propertyStatus}
                  />
                  <Info label="Property Label" value={property.propertyLabel} />
                  <Info label="Approval Status" value={property.status} />
                  {property.ownerId && (
                    <Info label="Owner ID" value={property.ownerId} />
                  )}
                  {property.createdDate && (
                    <Info
                      label="Listed on"
                      value={formatDate(property.createdDate)}
                    />
                  )}
                </Section>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

// ========================================================
// SUB COMPONENTS
// ========================================================
const Section = ({ title, children }) => (
  <section className="bg-white rounded-xl p-6 shadow-sm">
    {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
    {children}
  </section>
);

const Detail = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    {icon && <div className="text-blue-600">{icon}</div>}
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between text-sm mb-2 py-1">
    <span className="text-gray-600">{label}:</span>
    <span className="font-semibold text-right max-w-[60%] break-words">
      {value || "-"}
    </span>
  </div>
);

const AmenityGroup = ({ title, items }) => (
  <div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const Contact = ({ icon, text }) => (
  <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
    <div className="text-blue-600">{icon}</div>
    <div className="text-sm font-medium">{text}</div>
  </div>
);

const InputDate = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const FavButton = ({ active, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
  >
    <Heart
      className={`w-5 h-5 ${
        active ? "fill-red-500 text-red-500" : "text-gray-600"
      }`}
    />
    <span className="text-sm font-medium">{active ? "Saved" : "Save"}</span>
  </button>
);

const ShareButton = () => (
  <button
    onClick={() => {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }}
    className="flex-1 border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
  >
    <Share2 className="w-5 h-5 text-gray-600" />
    <span className="text-sm font-medium">Share</span>
  </button>
);

export default PropertyDetail;
