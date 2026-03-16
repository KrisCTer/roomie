// web-app/src/components/Profile/EditProfileForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { Save, X, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

const EditProfileForm = ({ formData, onChange, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const dobRef = useRef(null);

  // Display date state
  const [displayDob, setDisplayDob] = useState("");

  // Format date for display (dd/MM/yyyy)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "";
    }
  };

  // Format date for input (yyyy-MM-dd)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      // If already in yyyy-MM-dd format
      if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
        return dateStr.split("T")[0]; // Remove time if present
      }
      // If in dd/MM/yyyy format
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    } catch (error) {
      return "";
    }
  };

  // Update display when formData changes
  useEffect(() => {
    if (formData.dob) {
      const inputFormat = formatDateForInput(formData.dob);
      setDisplayDob(formatDateForDisplay(inputFormat));
    }
  }, [formData.dob]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value; // yyyy-MM-dd format

    // Update the actual form data
    onChange({
      target: {
        name: "dob",
        value: dateValue,
      },
    });

    // Update display
    setDisplayDob(formatDateForDisplay(dateValue));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-primary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors"
          >
            <X size={16} />
            <span className="text-sm font-medium">Hủy</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            <span className="text-sm font-medium">Lưu thay đổi</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="border border-gray-200 dark:border-dark-primary rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-primary mb-4">
            Thông tin cá nhân
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2">
                Tên
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2">
                Họ
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2">
                Ngày sinh
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() => dobRef.current?.showPicker?.()}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="text"
                  value={displayDob}
                  readOnly
                  placeholder="dd/MM/yyyy"
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <input
                  ref={dobRef}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={formatDateForInput(formData.dob) || ""}
                  onChange={handleDateChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border border-gray-200 dark:border-dark-primary rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-primary mb-4">
            Thông tin liên hệ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2">
                Địa chỉ
              </label>
              <textarea
                name="currentAddress"
                value={formData.currentAddress || ""}
                onChange={onChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your address"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditProfileForm;
