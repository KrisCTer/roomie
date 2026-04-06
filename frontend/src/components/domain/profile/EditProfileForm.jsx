// web-app/src/components/Profile/EditProfileForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { Save, X, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TextField, MenuItem } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const EditProfileForm = ({ formData, onChange, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const isComposingAddressRef = useRef(false);

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

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "rgba(255,255,255,0.65)",
      "& fieldset": {
        borderColor: "#E9DECF",
      },
      "&:hover fieldset": {
        borderColor: "#D7B899",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#CC6F4A",
      },
    },
    "& .MuiInputBase-input": {
      color: "#1F2937",
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        mt: 0.5,
        borderRadius: "12px",
        border: "1px solid #E9DECF",
        backgroundColor: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 16px 28px rgba(70, 54, 41, 0.12)",
        "& .MuiMenuItem-root": {
          fontSize: "0.95rem",
        },
        "& .MuiMenuItem-root.Mui-selected": {
          backgroundColor: "rgba(204,111,74,0.16)",
        },
        "& .MuiMenuItem-root.Mui-selected:hover": {
          backgroundColor: "rgba(204,111,74,0.22)",
        },
      },
    },
  };

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
      (item) =>
        normalizeAddressName(item.name) === normalizeAddressName(wardName),
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
        .filter((part) => !hierarchyParts.includes(normalizeAddressName(part)));

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

  const handleDateChange = (value) => {
    const dateValue =
      value && value.isValid() ? value.format("YYYY-MM-DD") : "";

    onChange({
      target: {
        name: "dob",
        value: dateValue,
      },
    });
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
            className="flex items-center gap-2 px-4 py-2 bg-white/55 border border-white/70 text-[#5D5148] rounded-xl hover:bg-white/70 transition-colors"
          >
            <X size={16} />
            <span className="text-sm font-medium">Hủy</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-[#CC6F4A] text-white rounded-xl hover:bg-[#B5604B] transition-colors"
          >
            <Save size={16} />
            <span className="text-sm font-medium">Lưu thay đổi</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="home-glass-soft rounded-2xl p-6 border border-white/55">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cá nhân
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#5D5148] mb-2">
                Tên
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={onChange}
                className="w-full px-4 py-2.5 border border-[#E9DECF] bg-white/65 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5D5148] mb-2">
                Họ
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={onChange}
                className="w-full px-4 py-2.5 border border-[#E9DECF] bg-white/65 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5D5148] mb-2">
                Giới tính
              </label>
              <TextField
                select
                fullWidth
                name="gender"
                value={formData.gender || ""}
                onChange={onChange}
                size="small"
                sx={fieldSx}
                SelectProps={{ MenuProps: menuProps }}
              >
                <MenuItem value="">Select gender</MenuItem>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
                <MenuItem value="PREFER_NOT_TO_SAY">Prefer not to say</MenuItem>
              </TextField>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5D5148] mb-2">
                Ngày sinh
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    formData.dob
                      ? dayjs(formatDateForInput(formData.dob))
                      : null
                  }
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: fieldSx,
                      inputProps: {
                        placeholder: "dd/MM/yyyy",
                      },
                    },
                    popper: {
                      sx: {
                        "& .MuiPaper-root": {
                          borderRadius: "14px",
                          border: "1px solid #E9DECF",
                          backgroundColor: "rgba(255,255,255,0.94)",
                          backdropFilter: "blur(12px)",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="home-glass-soft rounded-2xl p-6 border border-white/55">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin liên hệ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#5D5148] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={onChange}
                className="w-full px-4 py-2.5 border border-[#E9DECF] bg-white/65 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5D5148] mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={onChange}
                className="w-full px-4 py-2.5 border border-[#E9DECF] bg-white/65 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Enter phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5D5148] mb-2">
                Địa chỉ
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <TextField
                    select
                    fullWidth
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    size="small"
                    sx={fieldSx}
                    SelectProps={{ MenuProps: menuProps }}
                  >
                    <MenuItem value="">Chọn Tỉnh/Thành</MenuItem>
                    {provinces.map((province) => (
                      <MenuItem key={province.code} value={province.name}>
                        {province.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    size="small"
                    sx={fieldSx}
                    SelectProps={{ MenuProps: menuProps }}
                  >
                    <MenuItem value="">Chọn Quận/Huyện</MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district.code} value={district.name}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                    size="small"
                    sx={fieldSx}
                    SelectProps={{ MenuProps: menuProps }}
                  >
                    <MenuItem value="">Chọn Phường/Xã</MenuItem>
                    {wards.map((ward) => (
                      <MenuItem key={ward.code} value={ward.name}>
                        {ward.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E9DECF] bg-white/65 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  placeholder="Số nhà, tên đường"
                />

                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress || ""}
                    readOnly
                    className="w-full pl-11 pr-4 py-2.5 border border-[#E9DECF] bg-white/55 rounded-xl text-gray-900"
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
