import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPropertyById } from "../../../../services/propertyService";
import { createConversation } from "../../../../services/chatService";
import { createBooking } from "../../../../services/bookingService";
import { getUserInfo } from "../../../../services/localStorageService";
import { useFavorite } from "../../../../hooks/useFavorite";

const usePropertyDetailData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactingOwner, setContactingOwner] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [leaseDuration, setLeaseDuration] = useState(0);

  const {
    isFavorited,
    favoriteCount,
    isLoading: favoriteLoading,
    handleToggleFavorite,
  } = useFavorite(id);

  const loadProperty = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPropertyById(id);
      setProperty(data.result);
    } catch (error) {
      console.error("Error loading property:", error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadProperty();
  }, [id, loadProperty]);

  useEffect(() => {
    if (!leaseStart || !leaseEnd || !property?.monthlyRent) {
      setEstimatedCost(0);
      setLeaseDuration(0);
      return;
    }

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
  }, [leaseStart, leaseEnd, property]);

  const handleContactOwner = async () => {
    try {
      const currentUser = getUserInfo();
      if (!currentUser) {
        window.alert(t("propertyDetail.loginToChat"));
        navigate("/login");
        return;
      }

      if (currentUser.userId === property.owner?.ownerId) {
        window.alert(t("propertyDetail.cannotChatSelf"));
        return;
      }

      setContactingOwner(true);

      const response = await createConversation({
        type: "DIRECT",
        participantIds: [property.owner.ownerId],
      });

      const conversation =
        response?.result || response?.data?.result || response?.data || response;

      navigate("/message", {
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
      window.alert(t("propertyDetail.chatError"));
    } finally {
      setContactingOwner(false);
    }
  };

  const handleLongTermBooking = async () => {
    try {
      const currentUser = getUserInfo();
      if (!currentUser) {
        window.alert(t("propertyDetail.loginToBook"));
        navigate("/login");
        return;
      }

      if (!leaseStart || !leaseEnd) {
        window.alert(t("propertyDetail.selectDates"));
        return;
      }

      const startDate = new Date(leaseStart);
      const endDate = new Date(leaseEnd);

      if (startDate >= endDate) {
        window.alert(t("propertyDetail.invalidDateRange"));
        return;
      }

      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 30) {
        window.alert(t("propertyDetail.minLease"));
        return;
      }

      setBookingLoading(true);

      const response = await createBooking({
        propertyId: property.propertyId,
        leaseStart: startDate.toISOString(),
        leaseEnd: endDate.toISOString(),
        monthlyRent: property.monthlyRent,
        rentalDeposit: property.rentalDeposit || 0,
      });

      if (response?.success) {
        const booking = response.result;
        window.alert(
          `${t("propertyDetail.bookingSuccessTitle")}\n\n` +
            `${t("propertyDetail.bookingRef")}: ${booking.bookingReference || booking.id}\n` +
            `${t("propertyDetail.bookingStatus")}: ${booking.status}\n` +
            `${t("propertyDetail.bookingDuration")}: ${leaseDuration} tháng\n` +
            `${t("propertyDetail.estimatedCost")}: ${estimatedCost.toLocaleString()}đ\n\n` +
            t("propertyDetail.waitForApproval"),
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
        window.alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        window.alert(`Lỗi: ${error.message}`);
      } else {
        window.alert("Không thể tạo đặt thuê. Vui lòng thử lại sau.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const images = useMemo(() => property?.mediaList?.map((item) => item.url) || [], [property]);

  return {
    property,
    loading,
    images,
    contactingOwner,
    bookingLoading,
    leaseStart,
    leaseEnd,
    leaseDuration,
    estimatedCost,
    setLeaseStart,
    setLeaseEnd,
    isFavorited,
    favoriteCount,
    favoriteLoading,
    handleToggleFavorite,
    handleContactOwner,
    handleLongTermBooking,
  };
};

export default usePropertyDetailData;
