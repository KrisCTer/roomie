import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserProfile } from "../../../../services/userService";
import { API } from "../../../../configurations/configuration";
import BaseService from "../../../../services/BaseService";

const useUserProfileData = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await getUserProfile(userId);
      const profileData =
        profileResponse?.result ||
        profileResponse?.data?.result ||
        profileResponse;
      setProfile(profileData);

      const propertiesResponse = await BaseService.get(
        API.GET_PROPERTY_BY_OWNER(userId)
      );

      let propertyList = [];
      if (
        propertiesResponse?.success &&
        Array.isArray(propertiesResponse.result)
      ) {
        propertyList = propertiesResponse.result;
      } else if (
        propertiesResponse?.data &&
        Array.isArray(propertiesResponse.data.result)
      ) {
        propertyList = propertiesResponse.data.result;
      } else if (Array.isArray(propertiesResponse)) {
        propertyList = propertiesResponse;
      }

      const approvedProperties = propertyList.filter((p) => {
        const status = (p.status || p.propertyStatus || "").toUpperCase();
        return !["PENDING", "DRAFT", "REJECT", "REJECTED"].includes(status);
      });

      setProperties(approvedProperties);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError(t("userProfile.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const transformToCardData = (property) => {
    const price =
      property.monthlyRent ?? property.price ?? property.pricePerMonth ?? 0;
    const image =
      property.mediaList?.[0]?.url ||
      property.thumbnail ||
      property.image ||
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";

    const province =
      property.province ||
      property.provinceName ||
      property.address?.province ||
      "";
    const district = property.district || property.address?.district || "";

    const typeMap = {
      APARTMENT: "Căn hộ",
      HOUSE: "Nhà nguyên căn",
      ROOM: "Phòng trọ",
      STUDIO: "Studio",
      VILLA: "Biệt thự",
      DORMITORY: "Ký túc xá",
      OFFICETEL: "Officetel",
    };

    return {
      id: property.propertyId || property.id,
      title: property.title || "Chưa có tiêu đề",
      image,
      price: `${price.toLocaleString("vi-VN")} đ`,
      location:
        [district, province].filter(Boolean).join(", ") || "Chưa cập nhật",
      bedrooms: property.bedrooms || property.rooms,
      bathrooms: property.bathrooms,
      size: property.size,
      type: typeMap[property.propertyType] || null,
    };
  };

  const handlePropertyClick = (id) => {
    if (!id) return;
    navigate(`/property/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Chưa cập nhật";
    }
  };

  const getGenderDisplay = (gender) => {
    const map = {
      MALE: t("userProfile.male"),
      FEMALE: t("userProfile.female"),
      OTHER: t("userProfile.other"),
      Nam: t("userProfile.male"),
      Nữ: t("userProfile.female"),
    };
    return map[gender] || t("userProfile.notUpdated");
  };

  return {
    loading,
    profile,
    properties,
    error,
    navigate,
    t,
    transformToCardData,
    handlePropertyClick,
    formatDate,
    getGenderDisplay,
  };
};

export default useUserProfileData;
