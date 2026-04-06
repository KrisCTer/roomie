/* aria-label */
// web-app/src/components/Profile/ProfileOverview.jsx
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Shield,
  Edit3,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ProfileOverview = ({ formData, onEditClick }) => {
  const { t } = useTranslation();

  const memberSinceYear = formData.createdAt
    ? new Date(formData.createdAt).getFullYear()
    : "-";

  // Format date to dd/MM/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not provided";

    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "Invalid date";
    }
  };

  const infoSections = [
    {
      title: "Thông tin cá nhân",
      icon: <User className="w-5 h-5" />,
      items: [
        {
          label: "Tên",
          value: formData.firstName || "Không xác định",
          icon: <User size={18} />,
        },
        {
          label: "Họ",
          value: formData.lastName || "Không xác định",
          icon: <User size={18} />,
        },
        {
          label: "Giới tính",
          value: formData.gender || "Không xác định",
          icon: <User size={18} />,
        },
        {
          label: "Ngày sinh",
          value: formatDate(formData.dob),
          icon: <Calendar size={18} />,
        },
      ],
    },
    {
      title: "Thông tin liên hệ",
      icon: <Mail className="w-5 h-5" />,
      items: [
        {
          label: "Email",
          value: formData.email || "Không xác định",
          icon: <Mail size={18} />,
        },
        {
          label: "Số điện thoại",
          value: formData.phoneNumber || "Không xác định",
          icon: <Phone size={18} />,
        },
        {
          label: "Địa chỉ",
          value: formData.currentAddress || "Không xác định",
          icon: <MapPin size={18} />,
        },
      ],
    },
    {
      title: "Thông tin CMND/CCCD",
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          label: "Số CMND/CCCD",
          value: formData.idCardNumber || "Chưa xác minh",
          icon: <CreditCard size={18} />,
          verified: !!formData.idCardNumber,
        },
        {
          label: "Nơi sinh",
          value: formData.permanentAddress || "Không xác định",
          icon: <MapPin size={18} />,
        },
      ],
    },
  ];

  return (
    <div>
      {/* Info Sections */}
      <div className="space-y-6">
        {infoSections.map((section, idx) => (
          <div key={idx} className="home-glass-soft rounded-2xl p-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/45">
              <div className="w-10 h-10 bg-white/60 rounded-lg flex items-center justify-center">
                <span className="text-[#CC6F4A]">{section.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h3>
            </div>

            {/* Section Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-start gap-3 p-4 bg-white/45 border border-white/55 rounded-xl"
                >
                  <div className="w-8 h-8 bg-white/70 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#6A5A4D]">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {item.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.value}
                      </p>
                      {item.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                          <Shield size={12} />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Account Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="home-glass-soft rounded-2xl p-6 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-[#CC6F4A]">
              {formData.idCardNumber ? "100%" : "60%"}
            </span>
            <Shield className="w-8 h-8 text-[#CC6F4A] opacity-50" />
          </div>
          <p className="text-sm font-medium text-[#4A3E35]">Hoàn thành hồ sơ</p>
        </div>

        <div className="home-glass-soft rounded-2xl p-6 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-green-700">
              {formData.idCardNumber ? "Hoàn thành" : "Chưa xác minh"}
            </span>
            <CreditCard className="w-8 h-8 text-green-700 opacity-50" />
          </div>
          <p className="text-sm font-medium text-[#4A3E35]">
            Xác minh danh tính
          </p>
        </div>

        <div className="home-glass-soft rounded-2xl p-6 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-[#256B6F]">
              {memberSinceYear}
            </span>
            <Calendar className="w-8 h-8 text-[#256B6F] opacity-50" />
          </div>
          <p className="text-sm font-medium text-[#4A3E35]">Thành viên từ</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
