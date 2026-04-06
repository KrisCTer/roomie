// web-app/src/components/Profile/EditProfileForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { Save, X, Calendar, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const EditProfileForm = ({ formData, onChange, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const dobRef = useRef(null);
  const isComposingAddressRef = useRef(false);

  // Display date state
  const [displayDob, setDisplayDob] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const normalizeAddressName = (value) =>
    (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(
        /^(tinh|thanh pho|tp\.?|quan|huyen|thi xa|thi tran|phuong|xa)\s+/,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();

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

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to load provinces:", error);
      });
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      return;
    }

    const province = provinces.find((item) => item.name === selectedProvince);
    setDistricts(province?.districts || []);
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }

    const district = districts.find((item) => item.name === selectedDistrict);
    setWards(district?.wards || []);
  }, [selectedDistrict, districts]);

  useEffect(() => {
    if (isComposingAddressRef.current) {
      isComposingAddressRef.current = false;
      return;
    }

    const rawAddress = (formData.currentAddress || "").trim();
    if (!rawAddress) {
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setAddressDetail("");
      return;
    }

    const parts = rawAddress
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 4 || provinces.length === 0) {
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setAddressDetail(rawAddress);
      return;
    }

    const provinceName = parts[parts.length - 1];
    const districtName = parts[parts.length - 2];
    const wardName = parts[parts.length - 3];
    const detail = parts.slice(0, -3).join(", ");

    const province = provinces.find(
      (item) =>
        normalizeAddressName(item.name) === normalizeAddressName(provinceName),
    );
    if (!province) {
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setAddressDetail(rawAddress);
      return;
    }

    const district = (province.districts || []).find(
      (item) =>
        normalizeAddressName(item.name) === normalizeAddressName(districtName),
    );
    const ward = (district?.wards || []).find(
      (item) => normalizeAddressName(item.name) === normalizeAddressName(wardName),
    );

    if (!district || !ward) {
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setAddressDetail(rawAddress);
      return;
    }

    setSelectedProvince(province.name);
    setSelectedDistrict(district.name);
    setSelectedWard(ward.name);
    setAddressDetail(detail);
  }, [formData.currentAddress, provinces]);

  useEffect(() => {
    const hasHierarchy =
      !!selectedProvince && !!selectedDistrict && !!selectedWard;

    let detailValue = (addressDetail || "").trim();

    if (hasHierarchy && detailValue) {
      const hierarchyParts = [selectedWard, selectedDistrict, selectedProvince]
        .map((part) => normalizeAddressName(part))
        .filter(Boolean);

      const detailParts = detailValue
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .filter(
          (part) =>
            !hierarchyParts.includes(normalizeAddressName(part)),
        );

      detailValue = detailParts.join(", ");
    }

    const composedAddress = hasHierarchy
      ? [detailValue, selectedWard, selectedDistrict, selectedProvince]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(", ")
      : detailValue;

    if (composedAddress === (formData.currentAddress || "")) {
      return;
    }

    isComposingAddressRef.current = true;
    onChange({
      target: {
        name: "currentAddress",
        value: composedAddress,
      },
    });
  }, [
    addressDetail,
    selectedWard,
    selectedDistrict,
    selectedProvince,
    formData.currentAddress,
    onChange,
  ]);

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

  const handleProvinceChange = (e) => {
    const nextProvince = e.target.value;
    setSelectedProvince(nextProvince);
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDistrictChange = (e) => {
    const nextDistrict = e.target.value;
    setSelectedDistrict(nextDistrict);
    setSelectedWard("");
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Số nhà, tên đường"
                />

                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress || ""}
                    readOnly
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-dark-primary rounded-lg bg-gray-50 dark:bg-dark-tertiary text-gray-900 dark:text-dark-primary"
                    placeholder="Địa chỉ đầy đủ sẽ hiển thị tại đây"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditProfileForm;
