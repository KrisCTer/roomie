// src/pages/PropertyDetail/PropertyDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { AlertCircle } from "lucide-react";

// Components - Use Home layout
import StickyHeader from "../../components/layout/layoutHome/StickyHeader";
import Footer from "../../components/layout/layoutHome/Footer";

// Property Detail Components
import PropertyHeader from "../../components/PropertyDetail/PropertyHeader";
import ImageGallery from "../../components/PropertyDetail/ImageGallery";
import PropertyOverview from "../../components/PropertyDetail/PropertyOverview";
import PropertyDescription from "../../components/PropertyDetail/PropertyDescription";
import PropertyAmenities from "../../components/PropertyDetail/PropertyAmenities";
import PropertyLocation from "../../components/PropertyDetail/PropertyLocation";
import BookingCard from "../../components/PropertyDetail/BookingCard";
import OwnerContact from "../../components/PropertyDetail/OwnerContact";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Services
import { getPropertyById } from "../../services/property.service";
import { createConversation } from "../../services/chat.service";
import { createBooking } from "../../services/booking.service";
import { getUserInfo } from "../../services/localStorageService";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactingOwner, setContactingOwner] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking states
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [leaseDuration, setLeaseDuration] = useState(0);

  useEffect(() => {
    if (!id) return;
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (leaseStart && leaseEnd && property?.monthlyRent) {
      calculateEstimatedCost();
    }
  }, [leaseStart, leaseEnd, property]);

  const loadProperty = async () => {
    try {
      const data = await getPropertyById(id);
      setProperty(data.result);
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedCost = () => {
    if (!leaseStart || !leaseEnd || !property?.monthlyRent) return;

    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);

    if (start >= end) {
      setEstimatedCost(0);
      setLeaseDuration(0);
      return;
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const monthsDecimal = days / 30;

    setLeaseDuration(Math.ceil(monthsDecimal));

    const totalRent = property.monthlyRent * monthsDecimal;
    const deposit = property.rentalDeposit || 0;
    setEstimatedCost(totalRent + deposit);
  };

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

      const response = await createConversation(conversationData);
      const conversation =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

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

  const handleLongTermBooking = async () => {
    try {
      const currentUser = getUserInfo();
      if (!currentUser) {
        alert("Vui lòng đăng nhập để đặt thuê");
        navigate("/login");
        return;
      }

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

      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 30) {
        alert("Thời gian thuê tối thiểu là 1 tháng (30 ngày)");
        return;
      }

      setBookingLoading(true);

      const bookingData = {
        propertyId: property.propertyId,
        leaseStart: startDate.toISOString(),
        leaseEnd: endDate.toISOString(),
        monthlyRent: property.monthlyRent,
        rentalDeposit: property.rentalDeposit || 0,
      };

      const response = await createBooking(bookingData);

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

  if (loading) {
    return (
      <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
        <StickyHeader />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <LoadingSpinner />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
        <StickyHeader />
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Không tìm thấy bất động sản
            </h2>
            <p className="text-gray-600">
              Bất động sản này có thể đã bị xóa hoặc không tồn tại
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Quay lại
            </button>
          </div>
        </Container>
        <Footer />
      </Box>
    );
  }

  const images = property.mediaList?.map((i) => i.url) || [];

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      {/* Sticky Header - Same as Home */}
      <StickyHeader />

      {/* Main Content */}
      <Box sx={{ bgcolor: "#FFFFFF", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          {/* Property Header */}
          <PropertyHeader
            property={property}
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite(!isFavorite)}
          />

          {/* Image Gallery */}
          <ImageGallery images={images} title={property.title} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2 space-y-8">
              <PropertyOverview property={property} />
              <PropertyDescription description={property.description} />
              <PropertyAmenities amenities={property.amenities} />
              <PropertyLocation address={property.address} />
            </div>

            {/* Right Column - Sticky Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <BookingCard
                  property={property}
                  leaseStart={leaseStart}
                  leaseEnd={leaseEnd}
                  leaseDuration={leaseDuration}
                  estimatedCost={estimatedCost}
                  bookingLoading={bookingLoading}
                  onLeaseStartChange={setLeaseStart}
                  onLeaseEndChange={setLeaseEnd}
                  onBooking={handleLongTermBooking}
                />

                <OwnerContact
                  owner={property.owner}
                  contactingOwner={contactingOwner}
                  onContactOwner={handleContactOwner}
                  isFavorite={isFavorite}
                  onToggleFavorite={() => setIsFavorite(!isFavorite)}
                />
              </div>
            </div>
          </div>
        </Container>
      </Box>

      {/* Footer - Same as Home */}
      <Footer />
    </Box>
  );
};

export default PropertyDetail;
