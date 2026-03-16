import React from "react";
import { Building, DollarSign, Bed, Bath, Car, Maximize } from "lucide-react";
import { useTranslation } from "react-i18next";

const Step1Basic = ({ propertyData, onInputChange }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">
        {t("propertyForm.step1.title")}
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("propertyForm.step1.titleLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={propertyData.title}
            onChange={onInputChange}
            placeholder={t("propertyForm.step1.titlePlaceholder")}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("propertyForm.step1.descriptionLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={propertyData.description}
            onChange={onInputChange}
            placeholder={t("propertyForm.step1.descriptionPlaceholder")}
            rows="6"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.selectType")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyType"
              value={propertyData.propertyType}
              onChange={onInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ROOM">{t("propertyForm.step1.types.ROOM")}</option>
              <option value="DORMITORY">
                {t("propertyForm.step1.types.DORMITORY")}
              </option>
              <option value="APARTMENT">
                {t("propertyForm.step1.types.APARTMENT")}
              </option>
              <option value="STUDIO">
                {t("propertyForm.step1.types.STUDIO")}
              </option>
              <option value="OFFICETEL">
                {t("propertyForm.step1.types.OFFICETEL")}
              </option>
              <option value="HOUSE">
                {t("propertyForm.step1.types.HOUSE")}
              </option>
              <option value="VILLA">
                {t("propertyForm.step1.types.VILLA")}
              </option>
              <option value="OTHER">
                {t("propertyForm.step1.types.OTHER")}
              </option>
            </select>
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-2">
              Property Status
            </label>
            <select
              name="propertyStatus"
              value={propertyData.propertyStatus}
              onChange={onInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AVAILABLE">Available</option>
              <option value="PENDING">Pending</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div> */}

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.size")}
            </label>
            <div className="relative">
              <Maximize className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="size"
                value={propertyData.size}
                onChange={onInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.monthlyRent")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="monthlyRent"
                value={propertyData.monthlyRent}
                onChange={onInputChange}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.rentalDeposit")}
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="rentalDeposit"
                value={propertyData.rentalDeposit}
                onChange={onInputChange}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-2">
              Property Label
            </label>
            <select
              name="propertyLabel"
              value={propertyData.propertyLabel}
              onChange={onInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None</option>
              <option value="HOT">Hot</option>
              <option value="NEW">New</option>
              <option value="RECOMMENDED">Recommended</option>
            </select>
          </div> */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.bedrooms")}
            </label>
            <div className="relative">
              <Bed className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="bedrooms"
                value={propertyData.bedrooms}
                onChange={onInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.bathrooms")}
            </label>
            <div className="relative">
              <Bath className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="bathrooms"
                value={propertyData.bathrooms}
                onChange={onInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.garages")}
            </label>
            <div className="relative">
              <Car className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="garages"
                value={propertyData.garages}
                onChange={onInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("propertyForm.step1.rooms")}
            </label>
            <div className="relative">
              <Building className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="rooms"
                value={propertyData.rooms}
                onChange={onInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Basic;
