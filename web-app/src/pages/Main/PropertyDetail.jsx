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
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/layoutHome/Header.jsx";
import Footer from "../../components/layout/layoutHome/Footer.jsx";

import { getPropertyById } from "../../services/property.service";
import { createConversation } from "../../services/chat.service";
import { createBooking } from "../../services/booking.service";
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
  const [bookingLoading, setBookingLoading] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Long-term booking states
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [leaseDuration, setLeaseDuration] = useState(0);

  useEffect(() => {
    if (!id) return;
    loadProperty();
  }, [id]);

  // Calculate estimated cost when dates change
  useEffect(() => {
    if (leaseStart && leaseEnd && property?.monthlyRent) {
      calculateEstimatedCost();
    }
  }, [leaseStart, leaseEnd, property]);

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
  // CALCULATE ESTIMATED COST
  // ==============================
  const calculateEstimatedCost = () => {
    if (!leaseStart || !leaseEnd || !property?.monthlyRent) return;

    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);

    if (start >= end) {
      setEstimatedCost(0);
      setLeaseDuration(0);
      return;
    }

    // Calculate months difference
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    // Calculate days in the partial month
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const monthsDecimal = days / 30;

    setLeaseDuration(Math.ceil(monthsDecimal));

    // Total cost = monthly rent * months + deposit
    const totalRent = property.monthlyRent * monthsDecimal;
    const deposit = property.rentalDeposit || 0;
    setEstimatedCost(totalRent + deposit);
  };

  // ==============================
  // HANDLE CONTACT OWNER
  // ==============================
  const handleContactOwner = async () => {
    try {
      const currentUser = getUserInfo();
      if (!currentUser) {
        alert("Vui lòng đăng nhập để nhắn tin với chủ nhà");
        navigate("/login");
        return;
      }

      if (currentUser.userId === property.owner?.ownerId) {
        alert("Bạn không thể nhắn tin cho chính mình");
        return;
      }

      setContactingOwner(true);

      const conversationData = {
        type: "DIRECT",
        participantIds: [property.owner.ownerId],
      };

      console.log("Creating conversation with owner:", conversationData);
      const response = await createConversation(conversationData);

      const conversation =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      console.log("Conversation created/found:", conversation);

      navigate("/messages", {
        state: {
          conversationId: conversation.conversationId,
          propertyId: property.propertyId,
          propertyTitle: property.title,
          ownerId: property.owner.ownerId,
          ownerName: property.owner?.name || "Owner",
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
  // HANDLE LONG-TERM BOOKING
  // ==============================
  const handleLongTermBooking = async () => {
    try {
      // Validate user login
      const currentUser = getUserInfo();
      if (!currentUser) {
        alert("Vui lòng đăng nhập để đặt thuê");
        navigate("/login");
        return;
      }

      // Validate dates
      if (!leaseStart || !leaseEnd) {
        alert("Vui lòng chọn ngày bắt đầu và kết thúc thuê");
        return;
      }

      const startDate = new Date(leaseStart);
      const endDate = new Date(leaseEnd);

      if (startDate >= endDate) {
        alert("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }

      // Minimum lease duration check (e.g., 1 month)
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 30) {
        alert("Thời gian thuê tối thiểu là 1 tháng (30 ngày)");
        return;
      }

      setBookingLoading(true);

      // Prepare booking data
      const bookingData = {
        propertyId: property.propertyId,
        leaseStart: startDate.toISOString(),
        leaseEnd: endDate.toISOString(),
        monthlyRent: property.monthlyRent,
        rentalDeposit: property.rentalDeposit || 0,
      };

      console.log("Creating long-term booking:", bookingData);

      // Call booking API
      const response = await createBooking(bookingData);

      console.log("Booking response:", response);

      if (response?.success) {
        const booking = response.result;
        alert(
          `Đặt thuê thành công!\n\n` +
            `Mã đặt thuê: ${booking.bookingReference || booking.id}\n` +
            `Trạng thái: ${booking.status}\n` +
            `Thời gian thuê: ${leaseDuration} tháng\n` +
            `Tổng chi phí ước tính: ${estimatedCost.toLocaleString()}đ\n\n` +
            `Vui lòng chờ chủ nhà xác nhận.`
        );

        // Navigate to bookings page or booking detail
        navigate("/my-bookings", {
          state: {
            bookingId: booking.id,
            newBooking: true,
          },
        });
      } else {
        throw new Error(response?.message || "Booking failed");
      }
    } catch (error) {
      console.error("Error creating booking:", error);

      // Handle specific errors
      if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Lỗi: ${error.message}`);
      } else {
        alert("Không thể tạo đặt thuê. Vui lòng thử lại sau.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading property...</span>
        </div>
      </div>
    );

  if (!property)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <AlertCircle className="w-16 h-16" />
          <span>Property Not Found</span>
        </div>
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

  // Get today's date for min date input
  const today = new Date().toISOString().split("T")[0];

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

                  {/* Property Status Badge */}
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      property.propertyStatus === "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : property.propertyStatus === "RENTED"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {property.propertyStatus}
                  </span>
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
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-gray-500">
                          Monthly Rent
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {property.monthlyRent?.toLocaleString()}đ
                          <span className="text-base text-gray-500 font-normal ml-1">
                            /month
                          </span>
                        </div>
                        {property.rentalDeposit > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Deposit: {property.rentalDeposit?.toLocaleString()}đ
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Year Built</div>
                        <div className="font-semibold text-lg">
                          {property.yearBuilt || "-"}
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
                      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-500">
                        Map view coming soon
                      </div>
                    </div>
                  )}
                </Section>
              </div>

              {/* RIGHT: SIDEBAR */}
              <div className="space-y-6">
                {/* LONG-TERM BOOKING BOX */}
                <Section title="Long-Term Lease">
                  <div className="space-y-4">
                    {/* Lease Period */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Lease Start Date
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={leaseStart}
                        onChange={(e) => setLeaseStart(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Lease End Date
                      </label>
                      <input
                        type="date"
                        min={leaseStart || today}
                        value={leaseEnd}
                        onChange={(e) => setLeaseEnd(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Cost Summary */}
                    {leaseStart && leaseEnd && leaseDuration > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold">
                            {leaseDuration} month{leaseDuration > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Monthly Rent:</span>
                          <span className="font-semibold">
                            {property.monthlyRent?.toLocaleString()}đ
                          </span>
                        </div>
                        {property.rentalDeposit > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Deposit:</span>
                            <span className="font-semibold">
                              {property.rentalDeposit?.toLocaleString()}đ
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-blue-200 flex justify-between">
                          <span className="font-semibold text-gray-700">
                            Total Estimated:
                          </span>
                          <span className="font-bold text-blue-600 text-lg">
                            {estimatedCost.toLocaleString()}đ
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          * This is an estimate. Final cost will be confirmed by
                          the owner.
                        </p>
                      </div>
                    )}

                    {/* Booking Button */}
                    <button
                      onClick={handleLongTermBooking}
                      disabled={
                        bookingLoading ||
                        !leaseStart ||
                        !leaseEnd ||
                        property.propertyStatus !== "AVAILABLE"
                      }
                      className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        property.propertyStatus !== "AVAILABLE"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {bookingLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : property.propertyStatus !== "AVAILABLE" ? (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          <span>Not Available</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Request Booking</span>
                        </>
                      )}
                    </button>

                    {property.propertyStatus !== "AVAILABLE" && (
                      <p className="text-sm text-center text-gray-500">
                        This property is currently{" "}
                        {property.propertyStatus.toLowerCase()}
                      </p>
                    )}
                  </div>
                </Section>

                {/* OWNER INFO */}
                <Section title="Contact Owner">
                  {property.owner?.name && (
                    <div className="mb-4 pb-4 border-b">
                      <div className="text-lg font-semibold">
                        {property.owner.name}
                      </div>
                      {property.owner.email && (
                        <div className="text-sm text-gray-500">
                          {property.owner.email}
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
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactingOwner ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        <span>Message Owner</span>
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

                {/* PROPERTY INFORMATION */}
                <Section title="Property Information">
                  <Info label="Property ID" value={property.propertyId} />
                  <Info label="Property Type" value={property.propertyType} />
                  <Info
                    label="Property Status"
                    value={property.propertyStatus}
                  />
                  {property.propertyLabel &&
                    property.propertyLabel !== "NONE" && (
                      <Info label="Label" value={property.propertyLabel} />
                    )}
                  <Info label="Approval Status" value={property.status} />
                  {property.yearBuilt && (
                    <Info label="Year Built" value={property.yearBuilt} />
                  )}
                  {property.landArea && (
                    <Info label="Land Area" value={`${property.landArea} m²`} />
                  )}
                  {property.createdAt && (
                    <Info
                      label="Listed on"
                      value={formatDate(property.createdAt)}
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
