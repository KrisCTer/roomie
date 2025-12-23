// src/pages/UserProfile/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Container, CircularProgress } from "@mui/material";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  ChevronLeft,
} from "lucide-react";

// Components
import StickyHeader from "../../components/layout/layoutHome/StickyHeader";
import PropertySection from "../../components/layout/layoutHome/PropertySection";
import Footer from "../../components/layout/layoutHome/Footer";

// Services
import { getUserProfile } from "../../services/user.service";
import { API } from "../../configurations/configuration";
import BaseService from "../../services/BaseService";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

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

      // Load user profile
      const profileResponse = await getUserProfile(userId);
      console.log("Profile response:", profileResponse);

      const profileData =
        profileResponse?.result ||
        profileResponse?.data?.result ||
        profileResponse;
      setProfile(profileData);

      // Load user's properties
      const propertiesResponse = await BaseService.get(
        API.GET_PROPERTY_BY_OWNER(userId)
      );
      console.log("Properties response:", propertiesResponse);

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

      // Filter approved properties only
      const approvedProperties = propertyList.filter((p) => {
        const status = (p.status || p.propertyStatus || "").toUpperCase();
        return !["PENDING", "DRAFT", "REJECT", "REJECTED"].includes(status);
      });

      setProperties(approvedProperties);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Không thể tải thông tin người dùng");
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
    const genderMap = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
      Nam: "Nam",
      Nữ: "Nữ",
    };
    return genderMap[gender] || "Chưa cập nhật";
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
          <CircularProgress size={48} />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
        <StickyHeader />
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Không tìm thấy người dùng"}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </button>
          </div>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      {/* Sticky Header */}
      <StickyHeader />

      {/* Profile Section */}
      <Box sx={{ bgcolor: "#FFFFFF", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `
                          <span class="text-5xl font-bold text-white">
                            ${(
                              profile.firstName?.[0] ||
                              profile.username?.[0] ||
                              "U"
                            ).toUpperCase()}
                          </span>
                        `;
                      }}
                    />
                  ) : (
                    <span className="text-5xl font-bold text-white">
                      {(
                        profile.firstName?.[0] ||
                        profile.username?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {[profile.firstName, profile.lastName]
                    .filter(Boolean)
                    .join(" ") || profile.username}
                </h1>
                <p className="text-gray-600 mb-6">@{profile.username}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  {profile.email && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Số điện thoại
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {profile.gender && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Giới tính</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getGenderDisplay(profile.gender)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {profile.dob && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(profile.dob)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {(profile.currentAddress || profile.permanentAddress) && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl md:col-span-2">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile.currentAddress || profile.permanentAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Bất động sản
                </h2>
                <p className="text-sm text-gray-600">
                  {properties.length} bất động sản đang cho thuê
                </p>
              </div>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium mb-2">
                  Chưa có bất động sản
                </p>
                <p className="text-gray-500 text-sm">
                  Người dùng này chưa đăng bất động sản nào
                </p>
              </div>
            ) : (
              <PropertySection
                title=""
                properties={properties.map(transformToCardData)}
                onCardClick={handlePropertyClick}
                showViewAll={false}
              />
            )}
          </div>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default UserProfile;
