import React from "react";
import { MapPin } from "lucide-react";
import GoogleMapPicker from "../../../components/Property/GoogleMapPicker";
import { useTranslation } from "react-i18next";

const Step2Location = ({
  propertyData,
  onInputChange,
  provinces,
  districts,
  wards,
  mapsLoaded,
  onLocationChange,
  error,
  setError,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">
        {t("propertyForm.step2.title")}
      </h2>

      <div className="space-y-6">
        {/* Google Map */}
        <GoogleMapPicker
          mapsLoaded={mapsLoaded}
          location={propertyData.location}
          onLocationChange={onLocationChange}
          error={error}
          setError={setError}
        />

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Province */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step2.province")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="province"
              value={propertyData.province}
              onChange={onInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("propertyForm.step2.selectProvince")}</option>
              {provinces?.map((prov) => (
                <option key={prov.code} value={prov.name}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step2.district")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              value={propertyData.district}
              onChange={onInputChange}
              disabled={!propertyData.province}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">{t("propertyForm.step2.selectDistrict")}</option>
              {districts?.map((dist) => (
                <option key={dist.code} value={dist.name}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ward + Street */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ward */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step2.ward")}
            </label>
            <select
              name="ward"
              value={propertyData.ward}
              onChange={onInputChange}
              disabled={!propertyData.district}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">{t("propertyForm.step2.selectWard")}</option>
              {wards?.map((ward) => (
                <option key={ward.code} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step2.street")}
            </label>
            <input
              type="text"
              name="street"
              value={propertyData.street}
              onChange={onInputChange}
              placeholder={t("propertyForm.step2.streetPlaceholder")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* House Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("propertyForm.step2.houseNumber")}
          </label>
          <input
            type="text"
            name="houseNumber"
            value={propertyData.houseNumber}
            onChange={onInputChange}
            placeholder={t("propertyForm.step2.houseNumberPlaceholder")}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Full Address */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("propertyForm.step2.fullAddress")}{" "}
            <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />

            <textarea
              name="fullAddress"
              value={propertyData.fullAddress}
              onChange={onInputChange}
              placeholder={t("propertyForm.step2.fullAddressPlaceholder")}
              rows="2"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          <p className="text-xs text-gray-500 mt-1">
            💡 {t("propertyForm.step2.autoNote")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step2Location;
