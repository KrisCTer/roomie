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
} from "lucide-react";

import { useParams } from "react-router-dom";
import Header from "../../components/layout/layoutHome/Header.jsx";
import Footer from "../../components/layout/layoutHome/Footer.jsx";

import { getPropertyById } from "../../services/property.service";

// ========================================================
// MAIN COMPONENT
// ========================================================
const PropertyDetail = () => {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

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
  const images = property.mediaList?.map((i) => i.url) ?? [
    "https://via.placeholder.com/800x600?text=No+Image",
  ];

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
  // FORMAT CURRENCY
  // ==============================
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return Number(amount).toLocaleString("vi-VN");
  };

  // ==============================
  // BOOKING
  // ==============================
  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert("Please choose check-in and check-out dates!");
      return;
    }

    alert(
      `Booking request sent!\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}`
    );
  };

  // ==============================
  // RENDER UI
  // ==============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {/* =========================== */}
            {/* TITLE + TOP SECTION */}
            {/* =========================== */}
            <header className="mb-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{property.address?.fullAddress || "N/A"}</span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex gap-2 mt-3">
                    {property.propertyStatus && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {property.propertyStatus}
                      </span>
                    )}
                    {property.propertyLabel && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {property.propertyLabel}
                      </span>
                    )}
                    {property.status && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          property.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : property.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {property.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(property.monthlyRent)} đ
                  </div>
                  <div className="text-gray-600">/month</div>
                  {property.rentalDeposit && (
                    <div className="text-sm text-gray-500 mt-2">
                      Deposit: {formatCurrency(property.rentalDeposit)} đ
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* =========================== */}
            {/* IMAGE GALLERY */}
            {/* =========================== */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
              <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-gray-200 h-96">
                <img
                  src={images[currentImageIndex]}
                  alt="Main"
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full cursor-pointer transition ${
                        currentImageIndex === idx ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>

                {/* Media Type Indicator */}
                {property.mediaList?.[currentImageIndex]?.type && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                    {property.mediaList[currentImageIndex].type}
                  </div>
                )}
              </div>

              <div className="hidden lg:grid grid-rows-2 gap-4">
                {images.slice(1, 3).map((img, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80 transition"
                    onClick={() => setCurrentImageIndex(i + 1)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* =========================== */}
            {/* MAIN CONTENT */}
            {/* =========================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT CONTENT */}
              <div className="lg:col-span-2 space-y-8">
                {/* DESCRIPTION */}
                <Section title="Description">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {property.description || "No description available"}
                  </p>
                </Section>

                {/* PROPERTY DETAILS */}
                <Section title="Property Details">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Detail
                      label="Bedrooms"
                      value={property.bedrooms || 0}
                      icon={<Bed className="w-5 h-5" />}
                    />
                    <Detail
                      label="Bathrooms"
                      value={property.bathrooms || 0}
                      icon={<Bath className="w-5 h-5" />}
                    />
                    <Detail
                      label="Garages"
                      value={property.garages || 0}
                      icon={<Car className="w-5 h-5" />}
                    />
                    <Detail
                      label="Size"
                      value={property.size ? `${property.size} m²` : "N/A"}
                      icon={<Maximize className="w-5 h-5" />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                    <Detail
                      label="Total Rooms"
                      value={property.rooms || 0}
                      icon={<Home className="w-5 h-5" />}
                    />
                    <Detail
                      label="Property Type"
                      value={property.propertyType || "N/A"}
                      icon={<Tag className="w-5 h-5" />}
                    />
                  </div>
                </Section>

                {/* PRICING INFORMATION */}
                <Section title="Pricing Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">
                          Monthly Rent
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(property.monthlyRent)} đ
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Rental Deposit
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(property.rentalDeposit)} đ
                      </div>
                    </div>
                  </div>
                </Section>

                {/* AMENITIES */}
                <Section title="Amenities & Features">
                  {renderAmenity("Home Safety", property.amenities?.homeSafety)}
                  {renderAmenity("Bedroom", property.amenities?.bedroom)}
                  {renderAmenity("Kitchen", property.amenities?.kitchen)}
                  {renderAmenity("Others", property.amenities?.others)}
                  {!property.amenities?.homeSafety?.length &&
                    !property.amenities?.bedroom?.length &&
                    !property.amenities?.kitchen?.length &&
                    !property.amenities?.others?.length && (
                      <p className="text-gray-500">No amenities listed</p>
                    )}
                </Section>

                {/* ADDRESS */}
                <Section title="Address Information">
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
                </Section>

                {/* MAP */}
                <Section title="Map Location">
                  {property.address?.location ? (
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${property.address.location}&output=embed`}
                      ></iframe>
                    </div>
                  ) : (
                    <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-500">
                      No Location Provided
                    </div>
                  )}
                </Section>
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="space-y-8">
                {/* OWNER */}
                <Section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {property.owner?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {property.owner?.name || "Unknown Owner"}
                      </h3>
                      <p className="text-sm text-gray-500">Property Owner</p>
                    </div>
                  </div>

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

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-5">
                    Contact Owner
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
                  {property.owner?.ownerId && (
                    <Info label="Owner ID" value={property.owner.ownerId} />
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

const Contact = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
    {icon}
    <span>{text}</span>
  </div>
);

const FavButton = ({ active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 rounded-lg font-semibold border transition ${
      active
        ? "bg-red-50 border-red-300 text-red-600"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Heart className={`w-5 h-5 mx-auto ${active ? "fill-current" : ""}`} />
  </button>
);

const ShareButton = () => (
  <button className="flex-1 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
    <Share2 className="w-5 h-5 mx-auto" />
  </button>
);

const InputDate = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-gray-600 mb-1 block">{label}</label>
    <div className="flex items-center gap-2 border rounded-md px-3 py-2">
      <Calendar className="w-4 h-4 text-gray-600" />
      <input
        type="date"
        className="flex-1 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const renderAmenity = (title, items) => {
  if (!items?.length) return null;

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((i, idx) => (
          <span
            key={idx}
            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PropertyDetail;
